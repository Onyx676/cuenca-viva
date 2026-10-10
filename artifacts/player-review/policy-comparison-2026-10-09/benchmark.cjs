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
function run(seed, policy) {
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
    for (const id of sectors) e.setSectorAllocation(id, 0);
    if (policy === 'half_all_requests') {
      for (const id of sectors) e.setSectorAllocation(id, Math.round(st.sectors[id].currentDemand * .5));
    } else if (policy !== 'zero') {
      for (const id of uses) {
        let fraction = 1;
        if (policy === 'minimum') fraction = id === 'population' ? (turn === 1 ? .95 : .85)
          : id === goal?.targetCondition.sectorId ? .8 : .7;
        e.setSectorAllocation(id, Math.ceil(st.sectors[id].currentDemand * fraction));
      }
      if (policy === 'full_all_requests') e.setSectorAllocation('ecosystem', st.sectors.ecosystem.currentDemand);
      if (policy === 'minimum') {
        for (let eco = 0; eco <= st.sectors.ecosystem.currentDemand; eco++) {
          e.setSectorAllocation('ecosystem', eco);
          if (e.previewSeason().balance.satisfactions.ecosystem >= .8) break;
        }
      }
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
      spill: b.reservoirSpill, quality: st.waterQuality, trust: st.publicTrust, health: st.basinHealth,
      money: st.money, passiveEvents: result.events });
    if (turn < 20) e.advanceToNextTurn();
  }
  const st = e.getState(), sum = k => turns.reduce((v, t) => v + t[k], 0);
  assert.equal(st.seasonHistory.length, 20); assert.equal(st.yearHistory.length, 5); assert.equal(st.isGameOver, true);
  return { modelVersion: e.getModelVersion(), scenario: 'cuenca_central', seed, policy, initial,
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
const results = [];
for (const seed of seeds) for (const policy of ['full', 'zero', 'half_all_requests', 'full_all_requests', 'minimum', 'full_works']) {
  const first = run(seed, policy);
  assert.deepEqual(first, run(seed, policy), 'Same seed/actions must reproduce whole run');
  results.push(first);
}
const comparability = seeds.map(seed => {
  const cases = results.filter(r => r.seed === seed), base = cases[0];
  const forcing = r => r.turns.map(t => [t.climate,t.enso,t.rain,t.snowMelt]);
  const decisions = r => r.choices.map(c => [c.turn,c.event,c.option]);
  return { seed, comparisons: cases.slice(1).map(r => ({policy:r.policy,
    sameClimateAndHydrology: JSON.stringify(forcing(base)) === JSON.stringify(forcing(r)),
    sameInteractiveChoices: JSON.stringify(decisions(base)) === JSON.stringify(decisions(r)),
    differentForcingTurns: r.turns.filter((t,i) => JSON.stringify(forcing(r)[i]) !== JSON.stringify(forcing(base)[i])).map(t=>t.turn) })) };
});
const files = ['src/simulation/SimulationEngine.ts','src/simulation/MissionSystem.ts','src/models/SeasonalGoal.ts',
  'src/simulation/WaterSystem.ts','src/simulation/DemandSystem.ts','src/simulation/ClimateSystem.ts',
  'src/simulation/RandomSystem.ts','src/simulation/EventSystem.ts','src/data/scenarios.json','src/data/upgrades.json',
  'src/data/seasonalGoals.json','src/data/events.json'];
const metadata = { modelVersion: results[0].modelVersion, seeds, purchaseOrder,
  events: 'First permitted option in original array order, before purchases; all passive events retained.',
  validations: { cases:results.length, repetitions:2, turnsPerRun:20, seasonalChecks:results.length * 40,
    wholeRunDeterminism:true, conservation:true, previewReadOnly:true, resolutionIdempotence:true },
  sources: Object.fromEntries(files.map(f => [f,crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../../..',f))).digest('hex')])) };
fs.writeFileSync(path.join(__dirname,'results.json'), JSON.stringify({metadata,comparability,results},null,2));
fs.writeFileSync(path.join(__dirname,'summary.json'), JSON.stringify({metadata,comparability,
  results:results.map(({seed,policy,summary,finalSnapshotHash}) => ({seed,policy,...summary,finalSnapshotHash}))},null,2));
console.table(results.map(r=>({seed:r.seed,policy:r.policy,goals:r.summary.goals,all:r.summary.fullAll,
  reservoir:r.summary.reservoirEnd,aq:r.summary.aquiferEnd,pump:r.summary.pumping,
  trust:r.summary.trust,health:r.summary.health,money:r.summary.money})));
console.log(JSON.stringify(comparability));
console.log(`${results.length * 40} seasonal checks passed; ${results.length} campaigns reproduced exactly.`);
