const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ts = require('typescript');
require.extensions['.ts'] = (m, f) => m._compile(ts.transpileModule(fs.readFileSync(f, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText, f);
const { SimulationEngine } = require('../../../src/simulation/SimulationEngine.ts');
const uses = ['population', 'agriculture', 'livestock', 'mining'];
const sectors = [...uses, 'ecosystem'];
const seeds = ['AULA-2026-001', 'AULA-2026-260', 'POLICY-2026-003', 'POLICY-2026-004'];
// Repeated passes, at most one affordable level per ID in each pass; prerequisites real.
const purchaseOrder = ['reparacion_red', 'mantenimiento_canales', 'riego_eficiente', 'recirculacion_minera', 'planta_saneamiento'];
function run(seed, policy, policySeed, ecoVariant) {
  const { SeededRandom } = require('../../../src/simulation/RandomSystem.ts');
  const policyRng = new SeededRandom(policySeed);
  const sliderMax = { population:45, agriculture:60, livestock:30, mining:35, ecosystem:35 };
  const e = new SimulationEngine('cuenca_central', seed, true, 'contextual-v1');
  const purchases = [], choices = [], turns = [];
  const initial = { reservoir: e.getState().reservoirVolume, aquifer: e.getState().aquiferVolume };
  for (let turn = 1; turn <= 20; turn++) {
    const st = e.getState();
    const event = st.activeInteractiveEvent;
    if (event) {
      const permitted = event.options.filter(o => e.canChooseEventOption(o.id).allowed);
      assert.ok(permitted.length, 'There must be a legal event option');
      choices.push({ turn, event: event.id, option: permitted[0].id, permitted: permitted.map(o => o.id) });
      e.chooseEventOption(permitted[0].id);
    }
    if (policy === 'full_works') {
      let bought;
      do {
        bought = false;
        for (const id of purchaseOrder) {
          const check = e.getUpgradeSystem().canPurchase(id, st.upgrades, st.money);
          if (check.canBuy) {
            assert.equal(e.purchaseUpgrade(id).success, true);
            purchases.push({ turn, id, level: st.upgrades[id].currentLevel, cost: check.cost });
            bought = true;
          }
        }
      } while (bought);
    }
    const goal = e.getCurrentSeasonalGoal();
    // Five independent uniform integer draws each turn, even when extra eco is disabled.
    // This RNG is entirely separate from engine climate/event/forecast RNGs.
    for (const id of sectors) {
      sliderMax[id] = Math.max(sliderMax[id], st.sectors[id].allocated, Math.round(st.sectors[id].currentDemand * 1.5), 30);
      const limit = ecoVariant === 'uniform_slider' ? sliderMax[id] : st.sectors[id].currentDemand;
      const value = Math.floor(policyRng.next() * (limit + 1));
      e.setSectorAllocation(id, id === 'ecosystem' && ecoVariant === 'zero_extra' ? 0 : value);
    }
    const requests = Object.fromEntries(sectors.map(id => [id, st.sectors[id].allocated]));
    const snapshot = JSON.stringify(st), preview = e.previewSeason();
    assert.equal(JSON.stringify(st), snapshot, 'Preview does not mutate state');
    const result = e.resolveSeason(), b = result.balance;
    assert.deepEqual(b.suppliedAllocations, preview.balance.suppliedAllocations);
    assert.equal(b.massBalanceError, 0);
    assert.equal(b.seasonRainfall, b.soilInfiltration + b.surfaceRunoff + b.evaporatedRain);
    assert.equal(b.snowReserveStart + b.snowAccumulated, b.snowReserveEnd + b.snowMelt);
    for (const id of sectors) assert.equal(b.suppliedAllocations[id], b.consumptions[id] + b.returns[id]);
    const resolved = JSON.stringify(st);
    e.resolveSeason(); assert.equal(JSON.stringify(st), resolved, 'No duplicated resolution/reward');
    turns.push({ turn, climate: st.climateState, enso: st.ensoState, rain: b.seasonRainfall,
      snowMelt: b.snowMelt, requests, demands: Object.fromEntries(uses.map(id => [id, st.sectors[id].currentDemand])),
      goal: goal?.targetCondition, achieved: result.goalAchieved, coverage: b.satisfactions,
      reservoir: b.reservoirEnd, aquifer: b.aquiferEnd, pump: b.aquiferWithdrawal,
      spill: b.reservoirSpill, recharge: b.aquiferNaturalRecharge + b.aquiferRiverRecharge + b.aquiferArtificialRecharge,
      quality: st.waterQuality, trust: st.publicTrust, health: st.basinHealth,
      money: st.money, passiveEvents: result.events });
    if (turn < 20) e.advanceToNextTurn();
  }
  const st = e.getState(), sum = k => turns.reduce((v, t) => v + t[k], 0);
  assert.equal(st.seasonHistory.length, 20); assert.equal(st.yearHistory.length, 5); assert.equal(st.isGameOver, true);
  return { modelVersion: e.getModelVersion(), scenario: 'cuenca_central', seed, policy, policySeed, ecoVariant, initial,
    summary: { coverage: Object.fromEntries(sectors.map(id => [id, +(sumCoverage(id)/20*100).toFixed(1)])),
      fullAll: turns.filter(t => sectors.every(id => t.coverage[id] === 1)).length,
      goals: turns.filter(t => t.achieved).length, reservoirEnd: st.reservoirVolume,
      reservoirMin: Math.min(initial.reservoir, ...turns.map(t => t.reservoir)),
      aquiferEnd: st.aquiferVolume, aquiferMin: Math.min(initial.aquifer, ...turns.map(t => t.aquifer)),
      pumping: sum('pump'), spills: sum('spill'), quality: st.waterQuality, trust: st.publicTrust,
      health: st.basinHealth, money: st.money, annualNet: st.yearHistory.reduce((v,y) => v+y.budgetEarned,0),
      purchaseCost: purchases.reduce((v,p) => v+p.cost,0) }, purchases, choices, turns,
    finalSnapshotHash: crypto.createHash('sha256').update(JSON.stringify(st)).digest('hex') };
  function sumCoverage(id) { return turns.reduce((v,t) => v+t.coverage[id],0); }
}
const policySeeds = Array.from({length:10}, (_,i) => `RANDOM-POLICY-2026-${String(i+1).padStart(2,'0')}`);
const results = [], samples = [];
for (const seed of seeds) for (const policySeed of policySeeds)
  for (const policy of ['full', 'full_works']) for (const ecoVariant of ['random_extra', 'zero_extra','uniform_slider']) {
    const result = run(seed, policy, policySeed, ecoVariant);
    const avg = key => result.turns.reduce((v,t)=>v+t[key],0)/20;
    result.summary.worstHumanCoverage = Math.min(...result.turns.flatMap(t=>uses.map(id=>t.coverage[id]*100)));
    result.summary.turnsWithHumanBelow50 = result.turns.filter(t=>uses.some(id=>t.coverage[id]<.5)).length;
    result.summary.meanQuality = +avg('quality').toFixed(1);
    result.summary.turnsQualityBelow70 = result.turns.filter(t=>t.quality<70).length;
    result.summary.meanHumanCoverage = +(uses.reduce((v,id)=>v+result.summary.coverage[id],0)/4).toFixed(1);
    result.summary.aquiferChange = result.summary.aquiferEnd - result.initial.aquifer;
    result.summary.reservoirChange = result.summary.reservoirEnd - result.initial.reservoir;
    // End-season quantity signals are reported, not interpreted as measured environmental thresholds.
    result.summary.apparentHighIndicators = result.summary.health>=80 && result.summary.trust>=80;
    result.summary.recharge = result.turns.reduce((v,t)=>v+t.recharge,0);
    results.push(result);
    if (policySeed === policySeeds[0] && ecoVariant !== 'zero_extra') {
      const repeat = run(seed,policy,policySeed,ecoVariant);
      for (const key of ['purchases','choices','turns','finalSnapshotHash']) assert.deepEqual(repeat[key],result[key]);
      samples.push({seed,policy,policySeed,ecoVariant});
    }
  }
function quantile(values,p) {
  const a=values.slice().sort((x,y)=>x-y), at=(a.length-1)*p, lo=Math.floor(at),hi=Math.ceil(at);
  return +(a[lo]+(a[hi]-a[lo])*(at-lo)).toFixed(2);
}
function distribution(values) { return {min:Math.min(...values),p10:quantile(values,.1),median:quantile(values,.5),p90:quantile(values,.9),max:Math.max(...values)}; }
function group(items) {
  const metricKeys=['meanHumanCoverage','worstHumanCoverage','turnsWithHumanBelow50','reservoirEnd','reservoirMin',
    'aquiferEnd','aquiferMin','aquiferChange','pumping','spills','trust','health','quality','meanQuality',
    'turnsQualityBelow70','money','goals','recharge'];
  return {campaigns:items.length,coverage:Object.fromEntries(sectors.map(id=>[id,distribution(items.map(r=>r.summary.coverage[id]))])),
    metrics:Object.fromEntries(metricKeys.map(k=>[k,distribution(items.map(r=>r.summary[k]))])),
    apparentHighIndicators:items.filter(r=>r.summary.apparentHighIndicators).length,
    healthAtLeast80:items.filter(r=>r.summary.health>=80).length,
    depletedAquifer:items.filter(r=>r.summary.aquiferEnd===0).length,
    highIndicatorsWithAnyHumanMeanBelow80:items.filter(r=>r.summary.apparentHighIndicators && uses.some(id=>r.summary.coverage[id]<80)).length,
    highIndicatorsWithAquiferBelow40:items.filter(r=>r.summary.apparentHighIndicators && r.summary.aquiferEnd<40).length};
}
const groups=[];
for(const policy of ['full','full_works']) for(const ecoVariant of ['random_extra','zero_extra','uniform_slider'])
  groups.push({policy:policy==='full'?'random_no_works':'random_fixed_works',ecoVariant,...group(results.filter(r=>r.policy===policy && r.ecoVariant===ecoVariant))});
const forcing=r=>r.turns.map(t=>[t.climate,t.enso,t.rain,t.snowMelt]);
const comparability=seeds.map(seed=> {
  const cases=results.filter(r=>r.seed===seed),base=cases[0];
  return {seed,campaigns:cases.length,allClimateForcingIdentical:cases.every(r=>JSON.stringify(forcing(r))===JSON.stringify(forcing(base))),
    interactiveChoicesDistinct:new Set(cases.map(r=>JSON.stringify(r.choices.map(c=>[c.turn,c.event,c.option])))).size};
});
const files=['src/simulation/SimulationEngine.ts','src/simulation/MissionSystem.ts','src/models/SeasonalGoal.ts',
  'src/simulation/WaterSystem.ts','src/simulation/DemandSystem.ts','src/simulation/RandomSystem.ts',
  'src/data/scenarios.json','src/data/upgrades.json','src/data/seasonalGoals.json','src/data/events.json','src/main.ts','index.html'];
const metadata={modelVersion:results[0].modelVersion,scenario:'cuenca_central',seeds,policySeeds,purchaseOrder,
  allocation:'Five uniform integer draws per turn. random_extra/zero_extra range0..currentDemand; zero_extra discards eco draw. uniform_slider range0..retainedMax with initial45/60/30/35/35 and max(previousMax,currentAllocated,round(demand*1.5),30) before assigning.',
  events:'First legal option before purchases; all passive events retained.',
  sourceHashes:Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../../..',f))).digest('hex')])),
  validation:{campaigns:results.length,turns:results.length*20,repeatedSamples:samples.length,
    repeatTurns:samples.length*20,conservation:true,deterministicSamples:true,previewReadOnly:true,resolutionIdempotence:true}};
fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify({metadata,comparability,results},null,2));
fs.writeFileSync(path.join(__dirname,'summary.json'),JSON.stringify({metadata,comparability,groups,
  byClimateSeed:seeds.map(seed=>({seed,...group(results.filter(r=>r.seed===seed))})),
  cases:results.map(({seed,policy,policySeed,ecoVariant,summary,finalSnapshotHash})=>({seed,policy,policySeed,ecoVariant,...summary,finalSnapshotHash}))},null,2));
console.log(JSON.stringify({metadata:metadata.validation,comparability,groups},null,2));

