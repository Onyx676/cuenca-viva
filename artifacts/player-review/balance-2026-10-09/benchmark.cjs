const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText, filename);
const { SimulationEngine } = require('../../../src/simulation/SimulationEngine.ts');
const uses = ['population', 'agriculture', 'livestock', 'mining'];
const order = ['recirculacion_minera', 'reparacion_red', 'mantenimiento_canales', 'riego_eficiente',
  'planta_saneamiento', 'captacion_lluvia', 'recarga_acuifero', 'restauracion_cauces'];
function run(scenario, seed, policy, events) {
  const engine = new SimulationEngine(scenario, seed, true);
  if (!events) engine.eventSys.events = [];
  const purchases = [], decisions = [], turns = [];
  for (let turn = 1; turn <= 20; turn++) {
    const st = engine.getState();
    const event = st.activeInteractiveEvent;
    if (event) {
      const option = event.options.find(o => engine.canChooseEventOption(o.id).allowed);
      assert.ok(option);
      decisions.push({ turn, event: event.id, option: option.id });
      engine.chooseEventOption(option.id);
    }
    if (policy !== 'no_discretionary_works') {
      let bought;
      do {
        bought = false;
        for (const id of order) {
          const check = engine.getUpgradeSystem().canPurchase(id, st.upgrades, st.money);
          if (check.canBuy) {
            assert.ok(engine.purchaseUpgrade(id).success);
            purchases.push({ turn, id, level: st.upgrades[id].currentLevel, cost: check.cost });
            bought = true;
          }
        }
      } while (bought);
    }
    engine.setSectorAllocation('ecosystem', 0);
    let fraction = 1;
    for (const id of uses) engine.setSectorAllocation(id, st.sectors[id].currentDemand);
    if (policy === 'works_85_productive') {
      fraction = .85;
      for (const id of uses.filter(id => id !== 'population'))
        engine.setSectorAllocation(id, Math.ceil(st.sectors[id].currentDemand * fraction));
    }
    if (policy === 'works_reserve_guard') {
      // Guard policy: city first, gradually trim productive requests until both reserve floors are met,
      // or until zero productive request. Floors are benchmark decision rules, not model coefficients.
      for (let step = 100; step >= 0; step--) {
        fraction = step / 100;
        for (const id of uses.filter(id => id !== 'population'))
          engine.setSectorAllocation(id, Math.floor(st.sectors[id].currentDemand * fraction));
        const preview = engine.previewSeason().balance;
        if (preview.aquiferEnd >= 40 && preview.reservoirEnd >= 10) break;
      }
    }
    const snapshot = JSON.stringify(st);
    const preview = engine.previewSeason();
    assert.equal(JSON.stringify(st), snapshot);
    const result = engine.resolveSeason(), b = result.balance;
    assert.deepEqual(b.suppliedAllocations, preview.balance.suppliedAllocations);
    assert.equal(b.massBalanceError, 0);
    assert.equal(b.seasonRainfall, b.soilInfiltration + b.surfaceRunoff + b.evaporatedRain);
    assert.equal(b.snowReserveStart + b.snowAccumulated, b.snowReserveEnd + b.snowMelt);
    for (const id of [...uses, 'ecosystem']) assert.equal(b.suppliedAllocations[id], b.consumptions[id] + b.returns[id]);
    const resolved = JSON.stringify(st);
    engine.resolveSeason();
    assert.equal(JSON.stringify(st), resolved);
    turns.push({ turn, climate: st.climateState, fraction, goal: result.goalAchieved, balance: b });
    if (turn < 20) engine.advanceToNextTurn();
  }
  const st = engine.getState();
  assert.equal(st.seasonHistory.length, 20);
  assert.equal(st.yearHistory.length, 5);
  assert.equal(st.isGameOver, true);
  const sum = key => turns.reduce((v, t) => v + t.balance[key], 0);
  return { scenario, seed, policy, events, summary: {
    completeAll: turns.filter(t => [...uses, 'ecosystem'].every(id => t.balance.satisfactions[id] === 1)).length,
    completeProductive: turns.filter(t => uses.every(id => t.balance.satisfactions[id] === 1)).length,
    coverage: Object.fromEntries([...uses, 'ecosystem'].map(id => [id, +(100 * turns.reduce((v,t) => v+t.balance.satisfactions[id],0)/20).toFixed(1)])),
    reservoirEnd: st.reservoirVolume, reservoirMin: Math.min(...turns.map(t => t.balance.reservoirEnd)),
    aquiferEnd: st.aquiferVolume, aquiferMin: Math.min(...turns.map(t => t.balance.aquiferEnd)),
    stressedTurns: turns.filter(t => t.balance.aquiferEnd / st.aquiferCapacity < .4).length,
    pump: sum('aquiferWithdrawal'), recharge: sum('aquiferNaturalRecharge') + sum('aquiferRiverRecharge') + sum('aquiferArtificialRecharge'),
    trust: st.publicTrust, health: st.basinHealth, finalMoney: st.money,
    annualNet: st.yearHistory.reduce((v,y) => v+y.budgetEarned,0),
    goals: turns.filter(t => t.goal).length,
    // Offline qualification only: this does not recalculate financial progression or change rewards.
    yearsCoverageAndAquifer: st.yearHistory.filter(y => y.avgPopSatisfaction >= .95 &&
      y.avgAgriSatisfaction >= .85 && y.avgLivestockSatisfaction >= .85 && y.avgMinSatisfaction >= .85 &&
      y.avgEcoSatisfaction >= .85 && y.aquiferEnd >= .4 * st.aquiferCapacity &&
      y.aquiferEnd >= y.seasons[0].balance.aquiferStart).length,
    purchaseCost: purchases.reduce((v,p) => v+p.cost,0),
    upgrades: st.upgrades
  }, purchases, decisions, turns };
}
const results = [];
for (const events of [false,true]) for (const scenario of ['cuenca_central','cuenca_arida','cuenca_abundante'])
  for (const seed of ['AULA-2026-001','AULA-2026-260','SEQUIA-2026'])
    for (const policy of ['no_discretionary_works','works_full_requests','works_reserve_guard','works_85_productive']) {
      const first = run(scenario,seed,policy,events);
      assert.deepEqual(first,run(scenario,seed,policy,events), 'Same seeded actions reproduce entire run');
      results.push(first);
    }
fs.writeFileSync(path.join(__dirname,'results.json'), JSON.stringify(results,null,2));
const sourceFiles = ['src/simulation/SimulationEngine.ts','src/simulation/WaterSystem.ts','src/simulation/DemandSystem.ts',
  'src/data/scenarios.json','src/data/upgrades.json','src/data/seasonalGoals.json','src/data/events.json'];
fs.writeFileSync(path.join(__dirname,'summary.json'), JSON.stringify({ modelVersion:SimulationEngine.MODEL_VERSION,
  sources: Object.fromEntries(sourceFiles.map(file => [file, crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname,'../../..',file))).digest('hex')])),
  validation: { configurations:results.length, repetitions:2, turnsPerRun:20, seasonalChecks:results.length*40 },
  results:results.map(({scenario,seed,policy,events,summary}) => ({scenario,seed,policy,events,...summary})) },null,2));
console.table(results.map(r => ({scenario:r.scenario,seed:r.seed,events:r.events,policy:r.policy,
  all:r.summary.completeAll,productive:r.summary.completeProductive,aq:r.summary.aquiferEnd,
  aqMin:r.summary.aquiferMin,pump:r.summary.pump,trust:r.summary.trust,health:r.summary.health,
  annual:r.summary.annualNet,goals:r.summary.goals})));
console.log(`${results.length} policies x 20 turns x 2 deterministic repetitions = ${results.length * 40} seasonal conservation checks passed.`);
