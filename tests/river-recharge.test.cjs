const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText, filename);
const { SimulationEngine } = require('../src/simulation/SimulationEngine.ts');
const { WaterSystem } = require('../src/simulation/WaterSystem.ts');
const { SimulationEngine: Model24 } = require('../artifacts/hackathon-readiness/model-2.4-baseline/src/simulation/SimulationEngine.ts');
const { WaterSystem: Water24 } = require('../artifacts/hackathon-readiness/model-2.4-baseline/src/simulation/WaterSystem.ts');
const { SessionLog } = require('../src/sessionExport.ts');
const { createRecoveryPacket, replayRecovery } = require('../src/sessionRecovery.ts');
const clone = value => JSON.parse(JSON.stringify(value));
const sectors = ['population', 'agriculture', 'livestock', 'mining', 'ecosystem'];
const allocations = { population: 0, agriculture: 0, livestock: 0, mining: 0, ecosystem: 0, reserve: 0 };
function fixture(overrides = {}) {
  const engine = new SimulationEngine();
  return { input: { seasonRainfall: 0, rainfallIntensity: 'MODERATE', soilInfiltration: 0,
    surfaceRunoff: 0, directRiverRain: 0, baseFlow: 0, evaporatedRain: 0,
    snowReserveStart: 0, snowAccumulated: 0, snowMelt: 0, snowReserveEnd: 0,
    evaporationFactor: 0, evaporationMultiplier: 0, temperatureAnomaly: 0,
    reservoirStart: 0, reservoirCapacity: 100, aquiferStart: 0, aquiferCapacity: 100,
    allocations: { ...allocations }, availableWater: 0, upgrades: {}, ...overrides },
    state: clone(engine.getState().sectors) };
}
function resolve(f) { return new WaterSystem().resolveSeason(f.input, f.state, 85, 80, 75); }
function forcing(engine) {
  const state = engine.getState();
  return clone({ turn: state.turn, season: state.season, climate: state.climateState,
    enso: state.ensoState, temperature: state.temperatureAnomaly,
    rain: engine.currentRainResult, snow: engine.currentSnowResult,
    rng: engine.rng, eventRng: engine.eventSys.rng });
}

test('Recarga fluvial: deshielo solo puede recargar; transferencia interna resta al río sin crear agua', () => {
  const f = fixture({ snowReserveStart: 20, snowMelt: 20 });
  const current = resolve(f).balance;
  const old = new Water24().resolveSeason(f.input, f.state, 85, 80, 75).balance;
  assert.equal(WaterSystem.RIVER_RECHARGE_FRACTION, .1, 'Supuesto conceptual explícito de esta versión');
  assert.equal(current.aquiferRiverRecharge, 1);
  assert.equal(current.aquiferNaturalRecharge, 0);
  assert.equal(current.aquiferArtificialRecharge, 0);
  assert.equal(current.aquiferEnd, old.aquiferEnd + current.aquiferRiverRecharge);
  assert.equal(current.downstreamFlow, old.downstreamFlow - current.aquiferRiverRecharge);
  assert.equal(current.reservoirEnd, old.reservoirEnd);
  assert.equal(current.massBalanceError, 0);
});

test('Recarga fluvial: río cero no recarga; nieve cero no impide infiltración de lluvia llegada al río', () => {
  assert.equal(resolve(fixture()).balance.aquiferRiverRecharge, 0);
  const rainfall = resolve(fixture({ seasonRainfall: 20, surfaceRunoff: 20, directRiverRain: 20 })).balance;
  assert.equal(rainfall.snowMelt, 0);
  assert.equal(rainfall.aquiferRiverRecharge, 1);
  assert.equal(rainfall.massBalanceError, 0);
});

test('Recarga fluvial: saturación y espacio disponible limitan transferencia antes del bombeo', () => {
  const full = resolve(fixture({ snowReserveStart: 20, snowMelt: 20, aquiferStart: 100 })).balance;
  assert.equal(full.aquiferRiverRecharge, 0);
  assert.equal(full.aquiferEnd, 100);
  const oneLeft = resolve(fixture({ snowReserveStart: 100, snowMelt: 100, aquiferStart: 99 })).balance;
  assert.equal(oneLeft.aquiferRiverRecharge, 1);
  assert.equal(oneLeft.aquiferEnd, 100);
  const thenPumped = resolve(fixture({ snowReserveStart: 20, snowMelt: 20, aquiferStart: 100,
    allocations: { ...allocations, population: 40 } })).balance;
  assert.equal(thenPumped.aquiferRiverRecharge, 0, 'No usa hueco que el bombeo hará después');
  assert.ok(thenPumped.aquiferWithdrawal > 0);
  for (const b of [full, oneLeft, thenPumped]) assert.equal(b.massBalanceError, 0);
});

test('Recarga fluvial: overflow de lluvia existente sigue al río; no se infiltra dos veces', () => {
  const f = fixture({ seasonRainfall: 20, soilInfiltration: 20, baseFlow: 20, aquiferStart: 100 });
  const current = resolve(f).balance;
  const old = new Water24().resolveSeason(f.input, f.state, 85, 80, 75).balance;
  assert.equal(current.aquiferRiverRecharge, 0);
  assert.equal(current.aquiferOverflow, 17);
  assert.equal(current.downstreamFlow, old.downstreamFlow);
  assert.equal(current.massBalanceError, 0);
});

test('Recarga fluvial: redondeo permite cero y conserva límite de bypass con recarga gestionada N0–N3', () => {
  const tiny = resolve(fixture({ snowReserveStart: 10, snowMelt: 10 })).balance;
  assert.equal(tiny.aquiferRiverRecharge, 0, 'Bypass3×10%=0.3 redondea0, sin mínimo ficticio');
  for (const level of [0, 1, 2, 3]) for (const aquiferStart of [0, 50, 99, 100]) {
    const result = resolve(fixture({ seasonRainfall: 20, soilInfiltration: 5, surfaceRunoff: 10,
      directRiverRain: 4, evaporatedRain: 5, snowReserveStart: 40, snowMelt: 40,
      aquiferStart, upgrades: { recarga_acuifero: level } })).balance;
    const bypass = result.riverInflow - result.directRiverIntake - result.reservoirInflow;
    assert.ok(result.aquiferRiverRecharge <= bypass);
    assert.ok(result.aquiferRiverRecharge <= Math.max(0, 100 - aquiferStart - result.aquiferNaturalRecharge - result.aquiferArtificialRecharge));
    assert.equal(result.massBalanceError, 0);
  }
});

test('Modelo2.5: mismas decisiones conservan clima y PRNG frente a2.4 en veinte turnos y tres escenarios', () => {
  for (const scenario of ['cuenca_central', 'cuenca_arida', 'cuenca_abundante']) {
    const engines = [new Model24(scenario, 'RIO-CLIMA-2026', true), new SimulationEngine(scenario, 'RIO-CLIMA-2026', true, 'legacy')];
    for (let turn = 1; turn <= 20; turn++) {
      assert.deepEqual(forcing(engines[0]), forcing(engines[1]));
      engines.forEach(engine => {
        const state = engine.getState();
        const event = state.activeInteractiveEvent;
        if (event) engine.chooseEventOption(event.options.find(option => engine.canChooseEventOption(option.id).allowed).id);
        // Explicit same fixed requests, not an adaptive allocation that would hide differing decisions.
        for (const id of sectors) engine.setSectorAllocation(id, id === 'ecosystem' ? 0 : 5);
        const result = engine.resolveSeason();
        assert.equal(result.balance.massBalanceError, 0);
      });
      if (turn < 20) engines.forEach(engine => engine.advanceToNextTurn());
    }
    assert.equal(engines[1].getState().isGameOver, true);
    assert.deepEqual(forcing(engines[0]), forcing(engines[1]));
  }
});

test('Modelo2.5: consultas puras y replay reconstruyen recarga, eventos, reservas y PRNG hasta turno20', () => {
  function play(scenario) {
    const engine = new SimulationEngine(scenario, 'RIO-REPLAY-2026', true, 'legacy');
    const log = new SessionLog(engine.getState());
    for (let turn = 1; turn <= 20; turn++) {
      const state = engine.getState();
      const event = state.activeInteractiveEvent;
      if (event) {
        const option = event.options.find(item => engine.canChooseEventOption(item.id).allowed);
        log.captureAllocations(state);
        engine.chooseEventOption(option.id);
        log.record({ type: 'event-choice', turn, eventId: event.id, optionId: option.id });
      }
      if (turn === 1) {
        log.captureAllocations(state);
        assert.equal(engine.purchaseUpgrade('reparacion_red').success, true);
        log.record({ type: 'purchase', turn, upgradeId: 'reparacion_red' });
      }
      for (const id of sectors) engine.setSectorAllocation(id, id === 'ecosystem' ? 0 : 7);
      const fingerprint = JSON.stringify(engine);
      engine.previewSeason();
      engine.previewUpgradeWater('recirculacion_minera', 'same_requests');
      engine.previewUpgradeWater('recirculacion_minera', 'reduce_affected_requests');
      assert.equal(JSON.stringify(engine), fingerprint, 'No mutación ni sorteo de UI');
      log.captureAllocations(state);
      assert.equal(engine.resolveSeason().balance.massBalanceError, 0);
      log.record({ type: 'resolve', turn });
      if ([1, 4, 19, 20].includes(turn)) {
        const replay = replayRecovery(createRecoveryPacket(state, log, '2026-10-08T00:00:00Z'));
        assert.equal(replay.ok, true, replay.reason);
        assert.deepEqual(replay.engine.getState(), state);
        assert.deepEqual(forcing(replay.engine), forcing(engine));
      }
      if (turn < 20) { engine.advanceToNextTurn(); log.record({ type: 'advance', turn }); }
    }
    return engine.getState();
  }
  for (const scenario of ['cuenca_central', 'cuenca_arida', 'cuenca_abundante']) assert.deepEqual(play(scenario), play(scenario));
});

test('Recuperación2.4 no se interpreta silenciosamente con nueva hidrología2.5', () => {
  const old = new Model24('cuenca_central', 'RIO-ANTIGUA-2026', true);
  const packet = createRecoveryPacket(old.getState(), new SessionLog(old.getState()), '2026-10-08T00:00:00Z');
  packet.session.modelVersion = '2.4';
  const original = JSON.stringify(packet);
  const result = replayRecovery(packet);
  assert.equal(result.ok, false);
  assert.match(result.reason, /otra versión/);
  assert.equal(JSON.stringify(packet), original);
});
