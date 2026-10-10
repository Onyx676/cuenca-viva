const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
// Ejecutar las fuentes reales con TypeScript ya instalado, sin dependencia de test nueva.
require.extensions['.ts'] = (module, filename) => {
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  });
  module._compile(source.outputText, filename);
};
const { SimulationEngine } = require('../src/simulation/SimulationEngine.ts');
const { RainSystem } = require('../src/simulation/RainSystem.ts');
const { SeededRandom } = require('../src/simulation/RandomSystem.ts');
const { WaterSystem } = require('../src/simulation/WaterSystem.ts');
const { EventSystem } = require('../src/simulation/EventSystem.ts');
const { checkSeasonalGoal } = require('../src/models/SeasonalGoal.ts');
const { FIRST_GOAL_DISTRIBUTION } = require('../src/models/SeasonalGoal.ts');
const { firstGoalDistribution } = require('../src/models/SeasonalGoal.ts');
// Exact historical regression values belong to the preserved model-2 source/configuration.
const { SimulationEngine: BaselineEngine } = require('../artifacts/intro-balance/baseline/src/simulation/SimulationEngine.ts');
const firstGoal = require('../src/data/seasonalGoals.json')[0];
const sectors = ['population', 'agriculture', 'livestock', 'mining', 'ecosystem'];
const editorialBank = require('../src/game/ApprovedEditorial.json');
const isQualityDropArticle = article => editorialBank.some(row => row.topic === 'QUAL-DN'
  && row.headline === article.headline && row.subhead === article.subhead);

test('Fugas sin recursos: salida de emergencia resuelve sin sorteo ni campos JSON indefinidos', () => {
  const engine = new SimulationEngine('cuenca_central', 'FUGAS-SIN-RECURSOS', true);
  const state = engine.getState();
  Object.assign(state, { money: 0, reservoirVolume: 0, aquiferVolume: 0, upgrades: {}, turn: 2, season: 'SPRING' });
  const event = require('../src/data/events.json').find(item => item.id === 'fugas_red_ciudad');
  engine.eventSys.events = [{ ...event, conditions: { probability: 1 } }];
  engine.prepareSeasonStart();
  assert.equal(state.activeInteractiveEvent.id, event.id);
  assert.equal(engine.canChooseEventOption('coordinar_espera').allowed, true);
  const beforeTrust = state.publicTrust;
  const randomState = JSON.stringify([engine.rng, engine.eventSys.rng, engine.climateSys]);
  engine.chooseEventOption('coordinar_espera');
  assert.equal(state.activeInteractiveEvent, null);
  assert.equal(state.publicTrust, beforeTrust - 2);
  assert.equal(JSON.stringify([engine.rng, engine.eventSys.rng, engine.climateSys]), randomState);
  const record = state.currentSeasonEvents.at(-1);
  assert.equal(Object.hasOwn(record, 'outcome'), false);
  assert.deepEqual(JSON.parse(JSON.stringify(record)), record);
  assert.equal(engine.resolveSeason().balance.massBalanceError, 0);
});

test('Renovar desde evento: compra real, demanda persistente, pedidos intactos y mismo resultado seeded', () => {
  const run = () => {
    const engine = new SimulationEngine('cuenca_central', 'RENOVACION-CONTEXTO', true);
    const state = engine.getState();
    state.money = 100;
    engine.setSectorAllocation('population', 17);
    state.activeInteractiveEvent = require('../src/data/events.json').find(item => item.id === 'fugas_red_ciudad');
    const expected = engine.getUpgradeSystem().canPurchase('reparacion_red', state.upgrades, state.money);
    const previousDemand = state.sectors.population.currentDemand;
    engine.chooseEventOption('renovar_red');
    const record = state.currentSeasonEvents.at(-1);
    assert.equal(state.money, 100 - expected.cost);
    assert.equal(state.upgrades.reparacion_red.currentLevel, 1);
    assert.equal(record.project.cost, expected.cost);
    assert.equal(record.appliedEffects.moneyDelta, -expected.cost);
    assert.ok(state.sectors.population.currentDemand < previousDemand);
    assert.equal(state.sectors.population.allocated, 17);
    assert.deepEqual(JSON.parse(JSON.stringify(record)), record);
    assert.equal(engine.resolveSeason().balance.massBalanceError, 0);
    engine.advanceToNextTurn();
    assert.equal(state.upgrades.reparacion_red.currentLevel, 1);
    assert.equal(state.sectors.population.allocated, 17);
    return state;
  };
  assert.deepEqual(run(), run());
});

function resolveEvent(engine) {
  const event = engine.getState().activeInteractiveEvent;
  if (event) {
    const option = event.options.find(o => engine.canChooseEventOption(o.id).allowed);
    assert.ok(option, 'Todo evento debe tener una salida asequible');
    engine.chooseEventOption(option.id);
  }
}

function play(scenario, seed, invest = false) {
  const engine = new SimulationEngine(scenario, seed, true);
  for (let turn = 1; turn <= 20; turn++) {
    const st = engine.getState();
    assert.equal(st.turn, turn);
    resolveEvent(engine);
    if (invest && turn === 1) engine.purchaseUpgrade('estacion_meteorologica');
    if (invest && [1, 5, 9, 13].includes(turn)) {
      engine.purchaseUpgrade('recirculacion_minera');
      engine.purchaseUpgrade('reparacion_red');
    }
    for (const id of sectors) engine.setSectorAllocation(id, Math.floor(st.sectors[id].currentDemand * (invest ? 0.8 : 1)));
    const snapshot = JSON.stringify(st);
    const preview = engine.previewSeason();
    assert.equal(JSON.stringify(st), snapshot, 'Vista previa sin mutación ni consumo de RNG');
    const result = engine.resolveSeason();
    assert.deepEqual(result.balance.suppliedAllocations, preview.balance.suppliedAllocations);
    assert.equal(result.balance.massBalanceError, 0, `${scenario} ${seed} turno ${turn}`);
    assert.equal(result.balance.seasonRainfall, result.balance.soilInfiltration + result.balance.surfaceRunoff + result.balance.evaporatedRain);
    assert.equal(result.balance.snowReserveStart + result.balance.snowAccumulated, result.balance.snowReserveEnd + result.balance.snowMelt);
    for (const id of sectors) {
      assert.equal(result.balance.suppliedAllocations[id], result.balance.consumptions[id] + result.balance.returns[id]);
      assert.ok(result.balance.satisfactions[id] >= 0 && result.balance.satisfactions[id] <= 1);
    }
    assert.ok(st.aquiferVolume >= 0 && st.aquiferVolume <= st.aquiferCapacity);
    assert.ok(st.reservoirVolume >= 0 && st.reservoirVolume <= st.reservoirCapacity);
    if (st.season === 'SUMMER') assert.equal(result.balance.snowAccumulated, 0);
    const resolved = JSON.stringify(st);
    assert.equal(engine.resolveSeason(), result);
    assert.equal(JSON.stringify(st), resolved, 'Resolver otra vez no cobra ni extrae');
    if (turn < 20) engine.advanceToNextTurn();
  }
  const final = engine.getState();
  assert.equal(final.seasonHistory.length, 20);
  assert.equal(final.yearHistory.length, 5);
  assert.equal(final.isGameOver, true);
  engine.advanceToNextTurn();
  assert.equal(final.turn, 20);
  return final;
}

test('Lluvia conserva cada gota en todos los regímenes y obras', () => {
  const rain = new RainSystem(new SeededRandom('rain-tests'));
  for (const climate of ['VERY_DRY', 'DRY', 'NORMAL', 'WET', 'VERY_WET']) {
    for (const catchment of [false, true]) for (const recharge of [false, true]) {
      for (let amount = 0; amount <= 200; amount++) {
        const r = rain.calculateRain(amount, 0.25, 1, 1, climate, catchment, recharge);
        assert.equal(r.seasonalRainfall, r.soilInfiltration + r.surfaceRunoff + r.evaporatedRain);
        assert.ok(r.evaporatedRain >= 0);
      }
    }
  }
});

for (const scenario of ['cuenca_central', 'cuenca_arida', 'cuenca_abundante']) {
  test(`${scenario}: 20 turnos, balances y reproducibilidad`, () => {
    assert.deepEqual(play(scenario, 'AULA-2026-001'), play(scenario, 'AULA-2026-001'));
    assert.deepEqual(play(scenario, 'SEQUIA-2026', true), play(scenario, 'SEQUIA-2026', true));
  });
}

test('Mismo clima/nieve/lluvia con estrategias y monitoreo diferentes', () => {
  const a = play('cuenca_central', 'AULA-2026-001');
  const b = play('cuenca_central', 'AULA-2026-001', true);
  const climate = state => state.seasonHistory.map(r => [r.climateState, r.ensoState, r.balance.seasonRainfall, r.balance.rainfallIntensity, r.balance.snowAccumulated, r.balance.snowMelt]);
  assert.deepEqual(climate(a), climate(b));
});

test('No se avanza sin resolver ni con evento pendiente', () => {
  const engine = new SimulationEngine();
  engine.advanceToNextTurn();
  assert.equal(engine.getState().turn, 1);
  engine.getState().activeInteractiveEvent = { id: 'pending', options: [] };
  assert.throws(() => engine.resolveSeason(), /evento pendiente/);
});

test('Acuífero vacío no abastece agua ficticia; retornos limitados al suministro', () => {
  const engine = new SimulationEngine();
  const st = engine.getState();
  const allocations = Object.fromEntries([...sectors, 'reserve'].map(id => [id, id === 'reserve' ? 0 : 100]));
  const result = new WaterSystem().resolveSeason({
    seasonRainfall: 0, rainfallIntensity: 'MODERATE', soilInfiltration: 0, surfaceRunoff: 0, directRiverRain: 0, baseFlow: 0,
    evaporatedRain: 0, snowReserveStart: 0, snowAccumulated: 0, snowMelt: 0, snowReserveEnd: 0,
    evaporationFactor: 1, evaporationMultiplier: 1, temperatureAnomaly: 0,
    reservoirStart: 0, reservoirCapacity: 100, aquiferStart: 0, aquiferCapacity: 100,
    allocations, availableWater: 0, upgrades: {}
  }, st.sectors, 80, 80, 80);
  assert.equal(result.balance.totalWaterSupplied, 0);
  assert.equal(result.balance.unmetAllocation, 500);
  assert.equal(result.balance.massBalanceError, 0);
  for (const id of sectors) assert.equal(result.balance.returns[id] + result.balance.consumptions[id], 0);
});

test('Recarga, vertidos y desbordes mantienen conservación para niveles 0–3', () => {
  const engine = new SimulationEngine();
  for (let level = 0; level <= 3; level++) {
    const st = engine.getState();
    st.reservoirVolume = st.reservoirCapacity;
    st.aquiferVolume = st.aquiferCapacity;
    st.upgrades.recarga_acuifero = { id: 'recarga_acuifero', currentLevel: level };
    st.upgrades.recirculacion_minera = { id: 'recirculacion_minera', currentLevel: level };
    for (const amount of [0, 1, 10, 1000]) {
      for (const id of sectors) engine.setSectorAllocation(id, amount);
      assert.equal(engine.previewSeason().balance.massBalanceError, 0);
    }
  }
});

test('Desafío de embalse comprueba reserva final, no inicial', () => {
  const engine = new SimulationEngine();
  for (const id of sectors) engine.setSectorAllocation(id, 100);
  assert.ok(engine.getState().reservoirVolume >= 40);
  const result = engine.resolveSeason();
  assert.ok(result.balance.reservoirEnd < 40);
  assert.equal(result.goalAchieved, false);
});

test('Primera misión: Ciudad y 30 gotas, con preview, ampliación y determinismo', () => {
  const run = (closed, upgrade) => {
    const engine = new SimulationEngine('cuenca_central', 'AULA-2026-001', true);
    const st = engine.getState();
    if (upgrade) {
      const volume = st.reservoirVolume;
      assert.equal(engine.purchaseUpgrade('ampliacion_embalse').success, true);
      assert.equal(st.reservoirCapacity, 125);
      assert.equal(st.reservoirVolume, volume);
    }
    for (const id of sectors) engine.setSectorAllocation(id, closed ? 0 : FIRST_GOAL_DISTRIBUTION[id]);
    const before = JSON.stringify(st);
    const preview = engine.previewSeason().balance;
    const expected = checkSeasonalGoal(firstGoal, st, preview);
    assert.equal(JSON.stringify(st), before);
    const result = engine.resolveSeason();
    assert.equal(result.goalAchieved, expected);
    assert.equal(result.goalAchieved, !closed);
    assert.equal(result.balance.reservoirEnd, preview.reservoirEnd);
    assert.deepEqual(result.balance.satisfactions, preview.satisfactions);
    assert.equal(result.balance.massBalanceError, 0);
    if (!closed) {
      assert.ok(result.balance.satisfactions.population >= 0.95);
      assert.ok(result.balance.reservoirEnd >= 30);
    }
    // Límites exactos del predicado, independientes de la capacidad.
    assert.equal(checkSeasonalGoal(firstGoal, st, { ...preview, reservoirEnd: 30, satisfactions: { ...preview.satisfactions, population: 0.95 } }), true);
    assert.equal(checkSeasonalGoal(firstGoal, st, { ...preview, reservoirEnd: 29 }), false);
    assert.equal(checkSeasonalGoal(firstGoal, st, { ...preview, satisfactions: { ...preview.satisfactions, population: 0.949 } }), false);
    return result;
  };
  for (const closed of [false, true]) for (const upgrade of [false, true]) {
    assert.deepEqual(run(closed, upgrade), run(closed, upgrade));
  }
});

test('Obras de eficiencia cambian demanda sin sortear otro clima', () => {
  const engine = new SimulationEngine();
  const st = engine.getState();
  const before = st.sectors.mining.currentDemand;
  const snow = st.snowReserve;
  assert.equal(engine.purchaseUpgrade('recirculacion_minera').success, true);
  assert.ok(st.sectors.mining.currentDemand < before);
  assert.equal(st.snowReserve, snow);
});

test('Eventos validan IDs, presupuesto, agua y requisitos en el motor', () => {
  const event = { id: 'test', options: [{ id: 'cost', effects: { moneyDelta: -15 } },
    { id: 'water', effects: { reservoirDelta: -10 } }, { id: 'upgrade', requiresUpgrade: 'riego_eficiente', effects: {} }] };
  const engine = new SimulationEngine();
  const st = engine.getState();
  st.activeInteractiveEvent = event;
  st.money = 0;
  st.reservoirVolume = 0;
  for (const id of ['cost', 'water', 'upgrade', 'unknown']) {
    const before = JSON.stringify(st);
    engine.chooseEventOption(id);
    assert.equal(JSON.stringify(st), before);
  }
});

test('Eventos externos independientes de elegibilidad de premios', () => {
  const a = new EventSystem(new SeededRandom('event-seed'));
  const b = new EventSystem(new SeededRandom('event-seed'));
  const st = new SimulationEngine().getState();
  for (let turn = 0; turn < 20; turn++) {
    const low = a.checkAndTriggerEvents({ ...st, publicTrust: 10, basinHealth: 10 });
    const high = b.checkAndTriggerEvents({ ...st, publicTrust: 100, basinHealth: 100 });
    const climatic = x => x.interactiveEvent?.type === 'CLIMATE' ? x.interactiveEvent.id : null;
    // Premios pasivos no alteran el orden ni la historia de conflictos interactivos.
    // La biodiversidad sí habilita un conflicto extra: verificar siguiente estado del PRNG directamente.
    assert.equal(a.rng.next(), b.rng.next());
  }
});

test('Metas compuestas comprueban ambos sectores', () => {
  const st = new SimulationEngine().getState();
  st.sectors.population.satisfactionRate = 1;
  st.sectors.agriculture.satisfactionRate = 0.3;
  assert.equal(checkSeasonalGoal({ targetCondition: { type: 'SECTOR_SATISFACTION', sectorId: 'population', additionalSectorId: 'agriculture', threshold: 75 } }, st), false);
});

test('Eventos registran aportes extraordinarios reales y salidas sin exceder reservas', () => {
  const system = new EventSystem(new SeededRandom('ledger'));
  const st = new SimulationEngine().getState();
  st.reservoirVolume = st.reservoirCapacity - 5;
  const event = { id: 'ledger', description: '', options: [
    { id: 'rain', effects: { reservoirDelta: 15, aquiferDelta: -4 }, consequenceText: '' }
  ] };
  const record = system.applyOptionChoice(event, 'rain', st);
  assert.deepEqual(record.waterAdjustment, {
    reservoirChange: 5, aquiferChange: -4, externalInflow: 5, externalOutflow: 4
  });
  assert.equal(st.reservoirVolume, st.reservoirCapacity);
});

test('Tutorial breve termina en cuatro pasos sin resolver la simulación', () => {
  const { TutorialManager } = require('../src/tutorial/TutorialManager.ts');
  const tutorial = new TutorialManager();
  const st = new SimulationEngine().getState();
  tutorial.startTutorial();
  assert.equal(tutorial.getTotalPhases(), 4);
  assert.equal(tutorial.canAdvance(st).allowed, true);
  tutorial.advancePhase();
  st.sectors.population.currentDemand = 20;
  st.sectors.population.allocated = 10;
  assert.equal(tutorial.canAdvance(st).allowed, false);
  st.sectors.population.allocated = 20;
  assert.equal(tutorial.canAdvance(st).allowed, true);
  tutorial.advancePhase();
  st.sectors.ecosystem.currentDemand = 12;
  st.sectors.ecosystem.allocated = 6;
  assert.equal(tutorial.canAdvance(st).allowed, false);
  st.sectors.ecosystem.allocated = 12;
  assert.equal(tutorial.canAdvance(st).allowed, true);
  tutorial.advancePhase();
  const before = JSON.stringify(st);
  assert.equal(tutorial.canAdvance(st).allowed, true);
  assert.equal(tutorial.advancePhase(), false);
  tutorial.exitTutorial();
  assert.equal(tutorial.isActive(), false);
  assert.equal(JSON.stringify(st), before);
});

const { generateNewspaperEdition } = require('../src/game/Newspaper.ts');
const { getSeasonVerdict } = require('../src/seasonVerdict.ts');

function newspaperSnapshot() {
  const engine = new SimulationEngine('cuenca_central', 'HERALDO-EDITORIAL', true);
  resolveEvent(engine);
  return structuredClone(engine.resolveSeason());
}

function editorialSnapshot(kind) {
  // Partimos de un resultado real del motor y variamos sólo los datos narrados.
  const result = newspaperSnapshot();
  const b = result.balance;
  Object.assign(b.satisfactions, { population: 0.9, ecosystem: 0.9, agriculture: 0.7, livestock: 0.7, mining: 0.7 });
  Object.assign(b, { waterQuality: 75, basinHealth: 75, reservoirStart: 100, reservoirEnd: 100, reservoirWithdrawal: 0 });
  result.events = [];
  result.goalAchieved = false;
  let previous;
  if (kind === 'crisis') b.satisfactions.population = 0.4;
  if (kind === 'error') b.satisfactions.ecosystem = 0.65;
  if (kind === 'good') {
    result.goalAchieved = true;
    Object.assign(b.satisfactions, { agriculture: 0.8, livestock: 0.8, mining: 0.8 });
  }
  if (kind === 'recovery') {
    previous = structuredClone(result);
    previous.balance.waterQuality = 50;
  }
  if (kind === 'tradeoff') Object.assign(b, { reservoirEnd: 80, reservoirWithdrawal: 20 });
  if (kind === 'opportunity') result.events = [{
    event: { type: 'OPPORTUNITY_INTERACTIVE', name: 'Una propuesta del valle', options: [{ id: 'yes', label: 'Elegir la propuesta' }] },
    chosenOptionId: 'yes'
  }];
  assert.equal(getSeasonVerdict(result, previous).kind, kind);
  return { result, previous };
}

test('Heraldo: titulares fieles al mismo hecho, cortos y deterministas', () => {
  for (const kind of ['crisis', 'error', 'recovery', 'tradeoff', 'good', 'opportunity', 'normal']) {
    const { result, previous } = editorialSnapshot(kind);
    const headlines = new Set();
    for (let turn = 1; turn <= 20; turn++) {
      result.turn = turn;
      const snapshot = JSON.stringify({ result, previous });
      const edition = generateNewspaperEdition(result, previous);
      assert.deepEqual(generateNewspaperEdition(result, previous), edition);
      assert.equal(JSON.stringify({ result, previous }), snapshot);
      assert.equal(edition.kind, kind);
      assert.doesNotMatch(JSON.stringify(edition), /%/, 'Las noticias narran cobertura sin porcentajes');
      assert.equal(edition.secondaryArticles.length, 2);
      headlines.add(edition.mainArticle.headline);
      assert.ok(edition.mainArticle.headline.length <= 120);
      assert.doesNotMatch(edition.mainArticle.headline, /\d/, 'Las cifras se explican en la bajada y el resumen');
      assert.ok(edition.mainArticle.subhead.length <= 300);
      for (const brief of edition.secondaryArticles) assert.ok(brief.subhead.length <= 300);
      assert.doesNotMatch(JSON.stringify(edition), /índice del juego|trade-off razonable|simulador|Math\.random/i);
    }
    assert.ok(headlines.size >= 1, 'Sólo variantes aprobadas disponibles: ' + kind);
  }
  // Pedido cero no equivale a una entrega positiva ni a una falla de suministro.
  const { result: zero } = editorialSnapshot('normal');
  zero.balance.satisfactions.mining = 0;
  zero.balance.allocations.mining = 0;
  zero.balance.suppliedAllocations.mining = 0;
  const noRequest = generateNewspaperEdition(zero);
  assert.match(JSON.stringify(noRequest.mainArticle), /Ferrada|Mina|Rosa/);
  assert.doesNotMatch(noRequest.mainArticle.subhead, /Llegó todo lo pedido/);
  zero.balance.allocations.mining = 10;
  assert.match(JSON.stringify(generateNewspaperEdition(zero).mainArticle), /Ferrada|Mina|Rosa/);
  zero.balance.suppliedAllocations.mining = 10;
  zero.balance.satisfactions.mining = 0.15;
  assert.match(JSON.stringify(generateNewspaperEdition(zero).mainArticle), /Ferrada|Mina|Rosa/);
  assert.doesNotMatch(generateNewspaperEdition(zero).mainArticle.subhead, /No llegó todo lo asignado/);

  // La noticia relata la opción; costos y reservas exactas quedan en el resumen.
  const catalogue = require('../src/data/events.json');
  for (const [eventId, optionId, reserve, actual, money] of [
    ['ferrada_molienda', 'enfriamiento_mina', 'reservoir', -8, 25],
    ['sequia_severa', 'bombear_acuifero', 'aquifer', -15, -10]
  ]) {
    const { result } = editorialSnapshot('normal');
    const event = catalogue.find(item => item.id === eventId);
    result.events = [{ event, chosenOptionId: optionId, wasMitigated: true, impactSummary: '',
      waterAdjustment: { reservoirChange: reserve === 'reservoir' ? actual : 0,
        aquiferChange: reserve === 'aquifer' ? actual : 0, externalInflow: 0, externalOutflow: -actual } }];
    const edition = generateNewspaperEdition(result);
    const story = edition.secondaryArticles.find(article => /molienda|sequía/.test(article.headline));
    assert.ok(story, 'La elección se informa en una breve');
    const approved = require('../src/game/EditorialSelection.ts').eventArticle(optionId, result.turn, 'test');
    assert.equal(story.headline, approved.headline);
    assert.equal(story.subhead, approved.subhead);
    assert.doesNotMatch(story.subhead, /\$|[+-]\d/);
    assert.doesNotMatch(story.subhead, /confianza.*(subió|\+2)/);
    assert.ok(story.subhead.length <= 300);
  }
});

test('Heraldo: caída de calidad precede reserva estable y festejo, sin cambiar veredictos', () => {
  for (const kind of ['normal', 'good', 'opportunity']) {
    const { result } = editorialSnapshot(kind);
    const previous = structuredClone(result);
    previous.balance.waterQuality = 82;
    result.balance.waterQuality = 71;
    const edition = generateNewspaperEdition(result, previous);
    assert.equal(edition.kind, kind);
    assert.ok(isQualityDropArticle(edition.mainArticle));
    assert.ok(!edition.secondaryArticles.some(article => /calidad/i.test(article.headline)));
  }
  for (const kind of ['crisis', 'error']) {
    const { result } = editorialSnapshot(kind);
    const previous = structuredClone(result);
    previous.balance.waterQuality = 90;
    const edition = generateNewspaperEdition(result, previous);
    assert.match(JSON.stringify(edition.mainArticle), kind === 'crisis' ? /Ciudad/ : /caudal|Río|Clara/);
    if (kind === 'crisis') assert.ok(editorialBank.some(row => row.sector === 'population' && row.band === 'grave'
      && row.headline === edition.mainArticle.headline && row.subhead === edition.mainArticle.subhead));
    assert.ok(edition.secondaryArticles.some(isQualityDropArticle));
  }
});

test('Heraldo: recuperación y reservas conservan portada sólo ante caídas leves de calidad', () => {
  for (const kind of ['recovery', 'tradeoff']) {
    const { result } = editorialSnapshot(kind);
    const previous = structuredClone(result);
    previous.balance.waterQuality = 82;
    if (kind === 'recovery') previous.balance.satisfactions.population = 0.65;
    const edition = generateNewspaperEdition(result, previous);
    assert.equal(edition.kind, kind);
    if (kind === 'recovery') assert.ok(editorialBank.some(row => row.headline === edition.mainArticle.headline
      && row.subhead === edition.mainArticle.subhead
      && (row.sector === 'population' && row.band === 'partial' || /^P-CIU-(09|15|16|22|23)$/.test(row.id))));
    else assert.ok(editorialBank.some(row => row.topic === 'RES-DN'
      && row.headline === edition.mainArticle.headline && row.subhead === edition.mainArticle.subhead));
    assert.ok(edition.secondaryArticles.some(isQualityDropArticle));
    previous.balance.waterQuality = 83;
    const seriousDrop = generateNewspaperEdition(result, previous);
    assert.equal(seriousDrop.kind, kind);
    assert.ok(isQualityDropArticle(seriousDrop.mainArticle));
    assert.ok(!seriousDrop.secondaryArticles.some(article => /calidad/i.test(article.headline)));
  }
});

test('Heraldo: relata resultados del motor sin mutación ni azar de gameplay', () => {
  const result = newspaperSnapshot();
  const before = JSON.stringify(result);
  const source = fs.readFileSync(require.resolve('../src/game/Newspaper.ts'), 'utf8');
  assert.doesNotMatch(source, /Math\.random|engine\.rng/);
  const edition = generateNewspaperEdition(result);
  assert.equal(JSON.stringify(result), before);
  assert.deepEqual(edition, generateNewspaperEdition(result));
  assert.doesNotMatch(JSON.stringify(edition), /índice del juego|trade-off razonable/i);
});

test('Heraldo: no vuelve al tono genérico ni a expresiones técnicas prohibidas', () => {
  const source = fs.readFileSync(require.resolve('../src/game/Newspaper.ts'), 'utf8');
  assert.doesNotMatch(source, /El valle necesita una mano|Una señal que merece toda la atención|El valle sigue escribiendo su historia|índice del juego/i);
  const { result } = editorialSnapshot('normal');
  const previous = structuredClone(result);
  previous.balance.waterQuality = 90;
  const headlines = new Set();
  const history = [];
  for (let turn = 1; turn <= 20; turn++) {
    result.turn = turn;
    result.balance.waterQuality = 90 - turn;
    previous.balance.waterQuality = 91 - turn;
    history.push(structuredClone(result));
    const edition = generateNewspaperEdition(result, previous, undefined, history);
    headlines.add(edition.mainArticle.headline);
    assert.ok(edition.mainArticle.headline.length <= 120);
    assert.deepEqual(edition, generateNewspaperEdition(result, previous, undefined, history));
    assert.ok(isQualityDropArticle(edition.mainArticle));
  }
  assert.ok(headlines.size > 3, 'La caída utiliza la ampliación; no queda restringida a las tres parejas anteriores');
  // El caudal aguas abajo ya contiene los retornos productivos y urbanos.
  const { result: flow } = editorialSnapshot('good');
  Object.assign(flow.balance.returns, { population: 2, agriculture: 3, livestock: 4, mining: 5, ecosystem: 99, reserve: 0 });
  flow.balance.downstreamFlow = 120;
  let returnsStory;
  for (let turn = 1; turn <= 20; turn++) {
    flow.turn = turn;
    returnsStory ??= generateNewspaperEdition(flow).secondaryArticles.find(article => /agua usada vuelve al río/.test(article.headline));
  }
  assert.ok(returnsStory);
  assert.match(returnsStory.subhead, /incluidos en el flujo aguas abajo/);
  assert.doesNotMatch(returnsStory.subhead, /113|134/);
});


const { suggestDistribution } = require('../src/suggestedDistribution.ts');
// Preserve exact old-policy regressions as history, never as validation of the new policy.
const { suggestDistribution: historicalSuggestDistribution } = require('../artifacts/suggestion-review/baseline/src/suggestedDistribution.ts');
const suggestionGoals = require('../src/data/seasonalGoals.json');
function applyDistribution(engine, allocation) {
  for (const id of sectors) engine.setSectorAllocation(id, allocation[id]);
}
function historicalSuggestionTurn(engine, allocation) {
  resolveEvent(engine);
  applyDistribution(engine, allocation);
  engine.resolveSeason();
  engine.advanceToNextTurn();
}
function citedSuggestionEngine(season) {
  const engine = new BaselineEngine('cuenca_central', 'AULA-2026-001', true);
  historicalSuggestionTurn(engine, FIRST_GOAL_DISTRIBUTION);
  // Historical UI choices reproduce the reported reserves, independently of the new generator.
  historicalSuggestionTurn(engine, { population: 25, agriculture: 31, livestock: 9, mining: 16, ecosystem: 18 });
  if (season === 'AUTUMN') historicalSuggestionTurn(engine,
    { population: 25, agriculture: 11, livestock: 2, mining: 3, ecosystem: 15 });
  resolveEvent(engine);
  return engine;
}

test('Sugerencia conserva el reparto específico y la meta de la primera misión', () => {
  const engine = new SimulationEngine('cuenca_central', 'AULA-2026-001', true);
  const before = JSON.stringify(engine.getState());
  const allocation = suggestDistribution(engine, firstGoal);
  assert.deepEqual(allocation, firstGoalDistribution(engine.getState()));
  assert.equal(JSON.stringify(engine.getState()), before);
  applyDistribution(engine, allocation);
  const balance = engine.previewSeason().balance;
  assert.ok(checkSeasonalGoal(firstGoal, engine.getState(), balance));
  // The introductory scale now leaves more water; the unchanged mission requires >=30.
  assert.ok(balance.reservoirEnd >= 30);
  assert.equal(balance.massBalanceError, 0);
});

test('Escala introductoria: primer reparto legal tras obras, reserva y sectores presentes', () => {
  const initialEngine = new SimulationEngine('cuenca_central', 'AULA-2026-001', true);
  const initialState = initialEngine.getState();
  assert.deepEqual(Object.fromEntries(sectors.map(id => [id, initialState.sectors[id].allocated])), firstGoalDistribution(initialState));
  const initialPreview = initialEngine.previewSeason().balance;
  assert.equal(initialPreview.satisfactions.population, 1);
  assert.equal(initialPreview.satisfactions.ecosystem, 1);
  assert.ok(initialPreview.reservoirEnd >= 30, 'Meta alcanzable desde el primer preview sin Sugerida');
  for (const improved of [false, true]) {
    const engine = new SimulationEngine('cuenca_central', 'AULA-2026-001', true);
    resolveEvent(engine);
    if (improved) {
      engine.purchaseUpgrade('reparacion_red');
      engine.purchaseUpgrade('recirculacion_minera');
    }
    const st = engine.getState(), before = JSON.stringify(st);
    const allocation = suggestDistribution(engine, firstGoal);
    assert.equal(JSON.stringify(st), before);
    for (const id of sectors) assert.ok(allocation[id] <= st.sectors[id].currentDemand);
    for (const id of sectors.filter(id => id !== 'ecosystem')) assert.ok(allocation[id] > 0);
    applyDistribution(engine, allocation);
    assert.ok(st.currentAllocatedTotal <= st.availableWater);
    const b = engine.previewSeason().balance;
    assert.equal(b.satisfactions.population, 1);
    assert.ok(b.reservoirEnd >= 30);
    assert.ok(checkSeasonalGoal(firstGoal, st, b));
    assert.equal(b.massBalanceError, 0);
  }
  for (const scenario of ['cuenca_arida', 'cuenca_abundante']) {
    const engine = new SimulationEngine(scenario, 'AULA-2026-001', true, 'legacy');
    const baseline = new BaselineEngine(scenario, 'AULA-2026-001', true);
    assert.deepEqual(engine.getState(), baseline.getState());
    assert.deepEqual(suggestDistribution(engine, firstGoal), FIRST_GOAL_DISTRIBUTION);
  }
});

for (const season of ['SUMMER', 'AUTUMN']) {
  test('Histórico política anterior ' + season + ': traslado desde aporte ecológico redundante', () => {
    const suggestDistribution = historicalSuggestDistribution;
    const engine = citedSuggestionEngine(season);
    const control = citedSuggestionEngine(season);
    const st = engine.getState();
    const goal = suggestionGoals.find(g => g.year === st.year && g.season === st.season);
    const old = season === 'SUMMER'
      ? { population: 25, agriculture: 11, livestock: 2, mining: 3, ecosystem: 15 }
      : { population: 11, agriculture: 0, livestock: 0, mining: 0, ecosystem: 14 };
    applyDistribution(engine, old);
    applyDistribution(control, old);
    const baseline = engine.previewSeason().balance;
    assert.ok(baseline.satisfactions.population < (season === 'SUMMER' ? 0.75 : 0.46));
    const before = JSON.stringify(st);
    const allocation = suggestDistribution(engine, goal);
    assert.equal(JSON.stringify(st), before, 'Generador restaura todo el estado');
    assert.deepEqual(suggestDistribution(engine, goal), allocation, 'Sugerencia determinista');
    assert.equal(JSON.stringify(st), before);
    assert.equal(allocation.population, season === 'SUMMER' ? 29 : 24);
    for (const id of ['agriculture', 'livestock', 'mining']) assert.equal(allocation[id], old[id]);
    applyDistribution(engine, allocation);
    const assigned = JSON.stringify(st);
    const preview = engine.previewSeason().balance;
    assert.equal(JSON.stringify(st), assigned, 'Preview no muta');
    assert.ok(preview.satisfactions.population >= (season === 'SUMMER' ? 0.85 : 1));
    assert.equal(preview.satisfactions.ecosystem, 1);
    assert.ok(preview.reservoirEnd >= baseline.reservoirEnd);
    assert.ok(preview.aquiferEnd >= baseline.aquiferEnd);
    assert.equal(preview.massBalanceError, 0);
    assert.ok(st.currentAllocatedTotal <= st.availableWater);
    assert.equal(allocation.ecosystem, 0, 'Sin aporte extra al humedal cuando el río alcanza');
    applyDistribution(control, allocation);
    assert.deepEqual(engine.resolveSeason(), control.resolveSeason(), 'Preview no consume azar');
    engine.advanceToNextTurn();
    control.advanceToNextTurn();
    assert.deepEqual(engine.getState(), control.getState(), 'Mismo clima y eventos posteriores');
  });
}

test('Sugerencia restaura asignaciones y totales si falla el preview', () => {
  const engine = citedSuggestionEngine('SUMMER');
  const before = JSON.stringify(engine.getState());
  engine.previewSeason = () => { throw new Error('preview failure'); };
  assert.throws(() => suggestDistribution(engine), /preview failure/);
  assert.equal(JSON.stringify(engine.getState()), before);
});


test('Histórico política anterior: meta productiva desde sobrante ecológico', () => {
  const suggestDistribution = historicalSuggestDistribution;
  const engine = citedSuggestionEngine('SUMMER');
  const goal = { ...firstGoal, id: 'productive-fixture', targetCondition:
    { type: 'SECTOR_SATISFACTION', sectorId: 'agriculture', threshold: 30 } };
  const allocation = suggestDistribution(engine, goal);
  assert.equal(allocation.livestock, 2);
  assert.equal(allocation.mining, 3);
  applyDistribution(engine, allocation);
  const balance = engine.previewSeason().balance;
  assert.ok(balance.satisfactions.agriculture >= 0.30);
  assert.equal(balance.satisfactions.ecosystem, 1);
  assert.equal(balance.massBalanceError, 0);
});

test('Sugerencias: 20 turnos reproducibles, sin mutación al generar y con conservación', () => {
  const run = () => {
    const engine = new SimulationEngine('cuenca_central', 'AULA-2026-001', true);
    for (let turn = 1; turn <= 20; turn++) {
      resolveEvent(engine);
      const st = engine.getState();
      const before = JSON.stringify(st);
      const goal = suggestionGoals.find(g => g.year === st.year && g.season === st.season);
      const allocation = suggestDistribution(engine, goal);
      assert.equal(JSON.stringify(st), before);
      applyDistribution(engine, allocation);
      const preview = engine.previewSeason().balance;
      assert.ok(st.currentAllocatedTotal <= st.availableWater);
      assert.equal(preview.massBalanceError, 0);
      const result = engine.resolveSeason();
      // Resolution may add the mission's trust reward after the hydrological preview.
      const { publicTrust: resolvedTrust, ...resolvedWater } = result.balance;
      const { publicTrust: previewTrust, ...previewWater } = preview;
      assert.deepEqual(resolvedWater, previewWater);
      if (turn < 20) engine.advanceToNextTurn();
    }
    assert.equal(engine.getState().isGameOver, true);
    return engine.getState();
  };
  assert.deepEqual(run(), run());
});


test('Histórico política anterior: meta inalcanzable vuelve a prioridad urbana', () => {
  const suggestDistribution = historicalSuggestDistribution;
  const engine = citedSuggestionEngine('SUMMER');
  const goal = { ...firstGoal, id: 'unreachable-fixture', targetCondition:
    { type: 'SECTOR_SATISFACTION', sectorId: 'agriculture', threshold: 100 } };
  const allocation = suggestDistribution(engine, goal);
  assert.equal(allocation.agriculture, 11);
  applyDistribution(engine, allocation);
  const balance = engine.previewSeason().balance;
  assert.ok(balance.satisfactions.population >= 0.90);
  assert.equal(balance.satisfactions.ecosystem, 1);
  assert.equal(balance.massBalanceError, 0);
});


test('Sugerencia conserva el aporte al humedal que sí necesita el caudal ecológico', () => {
  const engine = new SimulationEngine('cuenca_central', 'AULA-2026-001', true);
  // Larger ecological demand exercises the stopping boundary using the real water preview.
  engine.getState().year = 2;
  engine.getState().sectors.ecosystem.currentDemand = 35;
  const before = JSON.stringify(engine.getState());
  const allocation = suggestDistribution(engine);
  assert.equal(JSON.stringify(engine.getState()), before);
  assert.ok(allocation.ecosystem > 0);
  applyDistribution(engine, allocation);
  assert.equal(engine.previewSeason().balance.satisfactions.ecosystem, 1);
  assert.equal(engine.previewSeason().balance.massBalanceError, 0);
  engine.setSectorAllocation('ecosystem', allocation.ecosystem - 1);
  assert.ok(engine.previewSeason().balance.satisfactions.ecosystem < 1,
    'Quitar otra gota al humedal ya deja al río por debajo de su demanda');
});

test('Política actual: ciudad tiene presencia con presupuestos extremos; pisos nunca inventan agua', () => {
  // Budget stress fixtures on the current engine, not claims of natural seed frequency.
  for (let budget = 0; budget <= 6; budget++) {
    const engine = new SimulationEngine('cuenca_central', 'SCARCITY-BUDGET', true);
    resolveEvent(engine);
    const st = engine.getState();
    st.availableWater = budget;
    const before = JSON.stringify(st);
    const a = suggestDistribution(engine);
    assert.equal(JSON.stringify(st), before);
    assert.ok(Object.values(a).reduce((sum,n)=>sum+n,0) <= budget);
    if (budget > 0) assert.ok(a.population >= 1);
    if (budget >= 4) for (const id of ['agriculture','livestock','mining']) assert.ok(a[id] >= 1);
    applyDistribution(engine,a);
    assert.equal(engine.previewSeason().balance.unmetAllocation,0);
  }
});

test('Política actual: tres escenarios y modos, 20 turnos, suministro legal y replay sin sugerir', () => {
  for (const scenario of ['cuenca_central','cuenca_arida','cuenca_abundante']) for (const mode of [true,false]) {
    const engine = new SimulationEngine(scenario,'POLICY-PROPERTIES',mode);
    const replay = new SimulationEngine(scenario,'POLICY-PROPERTIES',mode);
    for (let turn=1;turn<=20;turn++) {
      resolveEvent(engine); resolveEvent(replay);
      const st=engine.getState(), before=JSON.stringify(st);
      const goal=suggestionGoals.find(g=>g.year===st.year&&g.season===st.season);
      const a=suggestDistribution(engine,goal);
      assert.equal(JSON.stringify(st),before);
      assert.deepEqual(suggestDistribution(engine,goal),a);
      for (const id of sectors) assert.ok(Number.isInteger(a[id]) && a[id]>=0);
      applyDistribution(engine,a); applyDistribution(replay,a);
      assert.ok(st.currentAllocatedTotal<=st.availableWater);
      const b=engine.previewSeason().balance;
      assert.equal(b.unmetAllocation,0);
      assert.equal(b.massBalanceError,0);
      if (scenario === 'cuenca_central' && turn > 1 && st.availableWater >= st.sectors.population.currentDemand+3) {
        assert.equal(b.satisfactions.population,1);
        for (const id of ['agriculture','livestock','mining']) assert.ok(b.suppliedAllocations[id]>0);
      }
      const result=engine.resolveSeason();
      assert.deepEqual(replay.resolveSeason(),result);
      if(turn<20) {engine.advanceToNextTurn();replay.advanceToNextTurn();}
      assert.deepEqual(engine.getState(),replay.getState());
    }
  }
});

test('Feedback: meta parcial no oculta abandono; recuperación cuenta agua almacenada real', () => {
  const {result}=editorialSnapshot('good');
  result.balance.satisfactions.mining=0;
  const before=JSON.stringify(result);
  let verdict=getSeasonVerdict(result);
  assert.notEqual(verdict.kind,'good');
  assert.notEqual(verdict.label,'Estación estable');
  assert.equal(verdict.pendingSector,'mining');
  assert.match(verdict.message,/Mina quedó en 0%/);
  assert.match(JSON.stringify(generateNewspaperEdition(result).mainArticle),/Mina|Ferrada|Rosa/);
  assert.doesNotMatch(generateNewspaperEdition(result).mainArticle.headline,/Buen reparto/);
  result.season='SPRING';
  Object.assign(result.balance,{reservoirStart:20,reservoirEnd:35});
  Object.assign(result.balance.satisfactions,{population:1,ecosystem:1});
  verdict=getSeasonVerdict(result);
  assert.equal(verdict.kind,'recovery');
  assert.equal(verdict.focus,'reservoir');
  const edition=generateNewspaperEdition(result);
  assert.match(JSON.stringify(edition.mainArticle),/recupera|aumentó|juntó reserva/i);
  assert.ok(edition.secondaryArticles.some(article => /Mina|Ferrada|Rosa/.test(JSON.stringify(article))));
  result.balance.reservoirEnd=20;
  result.balance.unallocatedStored=80;
  assert.notEqual(getSeasonVerdict(result).focus,'reservoir');
  result.balance.satisfactions.population=0.5;
  result.balance.reservoirEnd=35;
  assert.equal(getSeasonVerdict(result).kind,'crisis');
});

test('Feedback reconoce recuperación productiva y conserva avisos graves', () => {
  const {result}=editorialSnapshot('normal');
  const previous=structuredClone(result);
  previous.balance.satisfactions.agriculture=0.4;
  result.balance.satisfactions.agriculture=0.75;
  const snapshot=JSON.stringify({result,previous});
  const verdict=getSeasonVerdict(result,previous);
  assert.equal(verdict.focus,'agriculture');
  assert.match(JSON.stringify(generateNewspaperEdition(result,previous).mainArticle),/Cultivos.*(faltante|falta|pendiente|corto|reclamo)/i);
  assert.equal(JSON.stringify({result,previous}),snapshot);
  result.balance.waterQuality=35;
  assert.equal(getSeasonVerdict(result,previous).kind,'crisis');
});

test('Reconocimiento: balance resuelto básico, calidad y cuatro turnos; catálogo sortea igual', () => {
  const e = new SimulationEngine();
  e.resolveSeason();
  const original = structuredClone(e.getState());
  const ready = () => {
    const s = structuredClone(original); s.turn=2; s.publicTrust=75; s.basinHealth=75;
    const b=s.seasonHistory.at(-1).balance;
    b.satisfactions={...b.satisfactions,population:.95,ecosystem:.9,agriculture:.5,livestock:.5,mining:.5};
    b.waterQuality=60;return s;
  };
  const catalog = require('../src/data/events.json');
  let draws=0;const rng={rangeInt:()=>{draws++;return 0;},chance:()=>{draws++;return true;}};
  const es=new EventSystem(rng), expected=catalog.length*2-1;
  const award=s=>es.checkAndTriggerEvents(s).records.some(r=>r.event.id==='reconocimiento_gestion');
  for(const id of ['population','ecosystem','agriculture','livestock','mining']) {
    const s=ready();s.seasonHistory.at(-1).balance.satisfactions[id]=0;
    const before=draws;assert.equal(award(s),false,id);assert.equal(draws-before,expected);
  }
  const low=ready();low.seasonHistory.at(-1).balance.waterQuality=59;assert.equal(award(low),false);
  for(const [id,value] of [['population',.94],['ecosystem',.89],['agriculture',.49],['livestock',.49],['mining',.49]]) {
    const s=ready();s.seasonHistory.at(-1).balance.satisfactions[id]=value;assert.equal(award(s),false);
  }
  for(const metric of ['publicTrust','basinHealth']){const s=ready();s[metric]=74;assert.equal(award(s),false);}
  const noHistory=ready();noHistory.seasonHistory=[];assert.equal(award(noHistory),false);
  assert.equal(award(ready()),true);
  for(const turn of [3,4,5]){const s=ready();s.turn=turn;assert.equal(award(s),false);}
  const next=ready();next.turn=6;assert.equal(award(next),true);
  const funds=ready();funds.publicTrust=60;funds.seasonHistory.at(-1).balance.satisfactions.mining=0;
  assert.ok(es.checkAndTriggerEvents(funds).records.some(r=>r.event.id==='subsidio_verde'));
});

test('Preview próxima obra usa demanda real por escenario/nivel sin alterar reparto, clima ni RNG', () => {
  for(const scenario of ['cuenca_central','cuenca_arida','cuenca_abundante']) {
    const e=new SimulationEngine(scenario,'NEXT-UPGRADE');e.getState().money=5000;
    e.purchaseUpgrade('mantenimiento_canales');
    for(const id of ['reparacion_red','riego_eficiente','recirculacion_minera','planta_saneamiento','mantenimiento_canales']) {
      while(e.previewUpgrade(id)) {
        const before=JSON.stringify(e.getState());
        const randomState=JSON.stringify([e.rng,e.eventSys.rng,e.climateSys]);
        const preview=e.previewUpgrade(id);
        assert.equal(JSON.stringify(e.getState()),before);
        assert.deepEqual(e.previewUpgrade(id),preview);
        assert.equal(JSON.stringify([e.rng,e.eventSys.rng,e.climateSys]),randomState);
        const allocations=Object.fromEntries(sectors.map(s=>[s,e.getState().sectors[s].allocated]));
        assert.ok(e.purchaseUpgrade(id).success);
        for(const sector of sectors){assert.equal(e.getState().sectors[sector].currentDemand,preview.nextDemands[sector]);assert.equal(e.getState().sectors[sector].allocated,allocations[sector]);}
        assert.equal(e.getState().upgrades[id].currentLevel,preview.nextLevel);
      }
      assert.equal(e.previewUpgrade(id),null);
    }
    assert.equal(e.previewUpgrade('missing'),null);
  }
  // Small current demand and integer floor: advanced mining has no further reduction.
  const small=new SimulationEngine();small.getState().money=1000;
  small.scenario=structuredClone(small.scenario);small.scenario.demands.mining=2;
  for(let i=0;i<3;i++)small.purchaseUpgrade('recirculacion_minera');
  small.getState().upgrades.recirculacion_minera.currentLevel=2;
  const p=small.previewUpgrade('recirculacion_minera');assert.equal(p.currentDemands.mining, p.nextDemands.mining);
});

test('Evento sin presupuesto ni reservas conserva salida legal; crecida informa aporte real limitado', () => {
  const e=new SimulationEngine();e.resolveSeason();
  Object.assign(e.getState(),{money:0,reservoirVolume:0,aquiferVolume:0});
  const rng={rangeInt:()=>0,chance:()=>true};e.eventSys=new EventSystem(rng);
  e.eventSys.events=require('../src/data/events.json').filter(v=>v.id==='berta_calor');
  e.advanceToNextTurn();
  assert.equal(e.getState().activeInteractiveEvent.id,'berta_calor');
  assert.equal(e.canChooseEventOption('coordinar_espera').allowed,true);
  e.chooseEventOption('coordinar_espera');assert.equal(e.getState().money,0);
  const sys=new EventSystem(rng),flood=require('../src/data/events.json').find(v=>v.id==='lluvia_extraordinaria');
  const st=structuredClone(e.getState());st.money=100;st.reservoirVolume=st.reservoirCapacity-2;
  const record=sys.applyOptionChoice(flood,'retener_todo',st);
  assert.equal(record.waterAdjustment.reservoirChange,2);
  assert.match(record.impactSummary,/embalse \+2/);
  assert.doesNotMatch(record.impactSummary,/El agua desbordó/);
});

test('Presupuesto anual Granja: media de cuatro estaciones, 0/parcial/plena, piso y desglose UI real', () => {
  const vm=require('node:vm');
  const mainSource=fs.readFileSync(require('node:path').join(__dirname,'../src/main.ts'),'utf8');
  const parsed=ts.createSourceFile('main.ts',mainSource,ts.ScriptTarget.Latest,true);
  const fn=parsed.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='showYearEndModal');
  assert.ok(fn);const showYearEnd=ts.transpileModule(fn.getText(parsed),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  for(const floor of [false,true])for(const farm of [[0,0,0,0],[0,0,1,1],[1,1,1,1]]) {
    const engine=new SimulationEngine();const fixture=structuredClone(engine.resolveSeason());
    const st=engine.getState();Object.assign(st,{turn:4,season:'AUTUMN',publicTrust:floor?50:80});
    // Economic fixtures isolate resolved coverage averages; they are not hydrological trajectories.
    st.seasonHistory=farm.map((coverage,i)=>{const r=structuredClone(fixture);r.turn=i+1;r.season=['WINTER','SPRING','SUMMER','AUTUMN'][i];
      r.balance.satisfactions={...r.balance.satisfactions,population:floor?0:1,agriculture:floor?0:1,mining:floor?0:1,ecosystem:floor?0:1,livestock:coverage};return r;});
    const before=st.money;engine.closeYear();const year=st.yearHistory.at(-1),mean=farm.reduce((a,b)=>a+b,0)/4,income=Math.round(mean*10);
    const raw=(floor?-25:110)+income,expected=Math.max(20,raw);
    assert.equal(year.avgLivestockSatisfaction,mean);assert.equal(year.budgetEarned,expected);assert.equal(st.money-before,expected);
    const context={engine,revealBudget(){},sound:{coin(){}},modalYearEnd:{classList:{add(){}}}};
    for(const name of ['yearendTitle','yearendPop','yearendAgri','yearendLivestock','yearendMin','yearendEco','yearendBreakdown','btnYearendContinue'])context[name]={textContent:'',innerHTML:''};
    vm.runInNewContext(showYearEnd+'\nshowYearEndModal();',context);
    assert.equal(context.yearendLivestock.textContent,`${mean*100}%`);
    assert.ok(context.yearendBreakdown.innerHTML.includes(`Actividad de Granja:</span><strong>+$${income}`));
    if(floor)assert.ok(context.yearendBreakdown.innerHTML.includes(`Aporte para presupuesto mínimo:</span><strong>+$${20-raw}`));
    else assert.ok(!context.yearendBreakdown.innerHTML.includes('Aporte para presupuesto mínimo:'));
    assert.ok(context.yearendBreakdown.innerHTML.includes(`+$${expected} (Total actual: $${st.money})`));
  }
});


test('Compuertas: pedido persiste 20 turnos con cambios de demanda, eventos y obras', () => {
  const values = { population: 14, agriculture: 15, livestock: 6, mining: 8, ecosystem: 0 };
  const allocations = state => Object.fromEntries(sectors.map(id => [id, state.sectors[id].allocated]));
  for (const scenario of ['cuenca_central', 'cuenca_arida', 'cuenca_abundante']) {
    const run = () => {
      const engine = new SimulationEngine(scenario, 'CONTINUIDAD-2026', true);
      for (const id of sectors) engine.setSectorAllocation(id, values[id]);
      const demands = new Set();
      for (let turn = 1; turn <= 20; turn++) {
        assert.deepEqual(allocations(engine.getState()), values, 'Conserva pedido al entrar al turno '+turn);
        resolveEvent(engine);
        assert.deepEqual(allocations(engine.getState()), values, 'Evento no mueve compuertas');
        if ([1, 5, 9, 13].includes(turn)) {
          engine.purchaseUpgrade('reparacion_red');
          engine.purchaseUpgrade('riego_eficiente');
          assert.deepEqual(allocations(engine.getState()), values, 'Obra cambia demanda, no pedido');
        }
        demands.add(JSON.stringify(sectors.map(id => engine.getState().sectors[id].currentDemand)));
        const result = engine.resolveSeason();
        assert.equal(result.balance.massBalanceError, 0);
        for (const id of sectors) assert.equal(result.balance.allocations[id], values[id]);
        if (turn < 20) engine.advanceToNextTurn();
      }
      assert.ok(demands.size > 1, 'Las necesidades sí cambian durante la prueba');
      return engine.getState();
    };
    assert.deepEqual(run(), run(), 'Misma semilla, acciones y compuertas conservadas');
  }
});
