const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText, filename);
const { SimulationEngine } = require('../src/simulation/SimulationEngine.ts');
const { checkSeasonalGoal } = require('../src/models/SeasonalGoal.ts');
const { SessionLog } = require('../src/sessionExport.ts');
const { createRecoveryPacket, replayRecovery } = require('../src/sessionRecovery.ts');
const sectors = ['population', 'agriculture', 'livestock', 'mining', 'ecosystem'];
function event(engine, log) {
  const e = engine.getState().activeInteractiveEvent;
  if (!e) return;
  const option = e.options.find(o => engine.canChooseEventOption(o.id).allowed);
  engine.chooseEventOption(option.id);
  log?.record({type:'event-choice',turn:engine.getState().turn,eventId:e.id,optionId:option.id});
}
function spring(seed) {
  const engine = new SimulationEngine('cuenca_central',seed,true,'contextual-v1');
  engine.resolveSeason(); engine.advanceToNextTurn();
  return engine;
}

test('Misiones 2.6: variedad mecánica desde primavera, meta fija y consultas sin consumir azar', () => {
  const a = spring('AULA-2026-001'), b = spring('AULA-2026-260');
  assert.notDeepEqual(a.getCurrentSeasonalGoal().targetCondition,b.getCurrentSeasonalGoal().targetCondition);
  assert.deepEqual(spring('AULA-2026-001').getCurrentSeasonalGoal(),a.getCurrentSeasonalGoal());
  const goal = structuredClone(a.getCurrentSeasonalGoal());
  const rng = JSON.stringify([a.rng,a.eventSys.rng,a.climateSys]);
  for (let i=0;i<5;i++) { a.getCurrentSeasonalGoal(); a.previewSeason(); }
  assert.equal(JSON.stringify([a.rng,a.eventSys.rng,a.climateSys]),rng);
  event(a);
  for (const id of sectors) a.setSectorAllocation(id,0);
  const capacity = a.getState().reservoirCapacity;
  assert.equal(a.purchaseUpgrade('ampliacion_embalse').success,true);
  assert.ok(a.getState().reservoirCapacity > capacity);
  assert.deepEqual(a.getCurrentSeasonalGoal(),goal,'Evento, sliders y capacidad no mueven la meta de gotas');
});

test('Recompensa 2.6 se entrega sólo una vez y mantiene el crédito original de la primera misión', () => {
  const engine = new SimulationEngine('cuenca_central','AULA-2026-001',false,'contextual-v1');
  const st = engine.getState();
  const money = st.money;
  const result = engine.resolveSeason();
  assert.equal(result.goalAchieved,true);
  assert.equal(st.money,money+engine.getCurrentSeasonalGoal().reward.moneyBonus);
  const resolved = JSON.stringify(st);
  assert.equal(engine.resolveSeason(),result);
  assert.equal(JSON.stringify(st),resolved);
});

test('Misiones: preview evalúa necesidades reales y reservas finales; omitir pedidos no borra déficit', () => {
  const engine = new SimulationEngine('cuenca_central','AULA-2026-001',false,'contextual-v1');
  const st = engine.getState();
  const b = engine.previewSeason().balance;
  const final = {targetCondition:{type:'PUBLIC_TRUST',threshold:0,requireNoDeficit:true}};
  const fake = {...b,unmetAllocation:0,satisfactions:{...b.satisfactions,population:.9}};
  assert.equal(checkSeasonalGoal(final,st,fake),false);
  const complete = {...fake,satisfactions:Object.fromEntries(sectors.map(id=>[id,1]))};
  assert.equal(checkSeasonalGoal(final,st,complete),true);
  const mixed = {targetCondition:{type:'COVERAGE_AND_AQUIFER',threshold:80,sectorId:'agriculture',reserveTarget:40,
    cityCoverageThreshold:85,riverCoverageThreshold:80,minimumProductiveCoverage:70}};
  assert.equal(checkSeasonalGoal(mixed,st,{...complete,aquiferEnd:40}),true);
  assert.equal(checkSeasonalGoal(mixed,st,{...complete,aquiferEnd:39}),false);
  assert.equal(checkSeasonalGoal(mixed,st,{...complete,aquiferEnd:40,satisfactions:{...complete.satisfactions,livestock:.69}}),false);
  assert.equal(checkSeasonalGoal(mixed,st,{...complete,aquiferEnd:40,satisfactions:{...complete.satisfactions,ecosystem:.79}}),false);
  assert.equal(checkSeasonalGoal({targetCondition:{type:'AQUIFER_MIN',threshold:40}},st,{...b,aquiferEnd:0}),false);
  assert.equal(checkSeasonalGoal({targetCondition:{type:'RESERVOIR_MIN',threshold:30}},st,{...b,reservoirEnd:0}),false);
});

test('Misiones 2.6 y legado 2.5: replay veinte turnos, versiones fieles, reglas distintas sin cambiar clima', () => {
  for (const rules of ['legacy','contextual-v1','contextual-v2']) for (const scenario of ['cuenca_central','cuenca_arida','cuenca_abundante']) {
    const e = new SimulationEngine(scenario,'MISSIONS-REPLAY',true,rules);
    const log = new SessionLog(e.getState());
    for(let turn=1;turn<=20;turn++) {
      event(e,log);
      const st = e.getState();
      for(const id of sectors) e.setSectorAllocation(id,id==='ecosystem'?0:st.sectors[id].currentDemand);
      log.captureAllocations(st);
      const preview = e.previewSeason().balance;
      const expected = checkSeasonalGoal(e.getCurrentSeasonalGoal(),st,preview);
      const r = e.resolveSeason();
      assert.equal(r.balance.massBalanceError,0);
      // Legacy historical PUBLIC_TRUST checks after reward-independent hydrology.
      if(rules!=='legacy' && scenario==='cuenca_central') assert.equal(r.goalAchieved,expected);
      log.record({type:'resolve',turn});
      if([1,2,13,20].includes(turn)) {
        const packet = createRecoveryPacket(st,log,'2026-10-09T00:00:00Z');
        assert.equal(packet.session.modelVersion,e.getModelVersion());
        const replay = replayRecovery(packet);
        assert.ok(replay.ok,replay.reason);
        assert.deepEqual(replay.engine.getState(),st);
        assert.deepEqual(replay.engine.getCurrentSeasonalGoal(),e.getCurrentSeasonalGoal());
        assert.equal(replay.engine.getModelVersion(),rules==='legacy'?'2.5':rules==='contextual-v1'?'2.6':'2.7');
        if(rules!=='legacy') {
          const wrong = structuredClone(packet);
          wrong.session.metadata.goalRulesVersion='inventada';
          assert.equal(replayRecovery(wrong).ok,false);
        }
      }
      if(turn<20){ e.advanceToNextTurn(); log.record({type:'advance',turn}); }
    }
    assert.equal(e.getState().yearHistory.length,5);
  }
  const engines = ['legacy','contextual-v1'].map(r => new SimulationEngine('cuenca_central','MISSIONS-FORCING',true,r));
  for(const e of engines) e.eventSys.events=[];
  for(let turn=1;turn<=20;turn++) {
    assert.deepEqual(engines.map(e=>e.getState().climateState),Array(2).fill(engines[0].getState().climateState));
    assert.deepEqual(engines[0].rng,engines[1].rng);
    for(const e of engines){ for(const id of sectors)e.setSectorAllocation(id,0); e.resolveSeason(); if(turn<20)e.advanceToNextTurn(); }
  }
});
