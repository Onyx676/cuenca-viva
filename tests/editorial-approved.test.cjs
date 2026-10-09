const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (m, file) => m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText, file);
const bank = require('../src/game/ApprovedEditorial.json');
const { EDITORIAL_SECTORS, sectorArticle, mapStory, eventArticle, pickEditorial, createEditorialLedger } = require('../src/game/EditorialSelection.ts');

test('Editorial: integra la revisión aprobada y excluye las piezas reemplazadas', () => {
  assert.equal(bank.length, 297);
  assert.equal(new Set(bank.map(row => row.id)).size, 297);
  assert.ok(!bank.some(row => row.id === 'R-H-15'));
  assert.match(bank.find(row => row.id === 'A-MAP-03').text, /mi familia me pidió que lo ponga/i);
  assert.ok(!bank.some(row => row.id.startsWith('H-')));
});
test('Editorial: cobertura completa, faltante y mejora no se confunden; parejas intactas', () => {
  for (const sector of EDITORIAL_SECTORS) for (let turn = 1; turn <= 20; turn++) {
    const full = sectorArticle(sector, 1, undefined, turn, 'AULA');
    assert.match(full.id, /-(01|02|10|17)$/);
    assert.deepEqual(full, bank.find(row => row.id === full.id));
    assert.match(sectorArticle(sector, .9, .9, turn, 'AULA').id, /-(03|04|11|12|18|19)$/);
    assert.match(sectorArticle(sector, .91, undefined, turn, 'AULA').id, /-(03|04|11|12|18|19)$/);
    const partial = sectorArticle(sector, .9, .5, turn, 'AULA', true);
    assert.match(partial.id, /-(03|04|11|12|18|19|09|15|16|22|23)$/);
    const low = sectorArticle(sector, .6, undefined, turn, 'AULA');
    assert.match(low.id, /-(05|06|13|20)$/);
    const grave = sectorArticle(sector, .2, undefined, turn, 'AULA');
    assert.match(grave.id, /-(07|08|14|21)$/);
    assert.deepEqual(mapStory(sector, .9, .5, turn, 'AULA'), mapStory(sector, .9, .5, turn, 'AULA'));
    assert.doesNotMatch(mapStory(sector, .9, .9, turn, 'AULA').text, /mejoró|Va mejor|Alcanzó el agua/);
  }
});
test('Editorial: más cobertura no prueba más volumen; carpincho sólo en contexto del evento', () => {
  assert.ok(sectorArticle('mining', .9, .5, 1, 'AULA'));
  for (let turn = 1; turn <= 20; turn++) {
    assert.doesNotMatch(mapStory('agriculture', .9, .5, turn, 'AULA').text, /Llegó más/);
    assert.doesNotMatch(mapStory('mining', .9, .5, turn, 'AULA').text, /llegó más/i);
    assert.doesNotMatch(mapStory('ecosystem', 1, undefined, turn, 'AULA').text, /carpincho/);
  }
});
test('Editorial: las opciones reales tienen parejas propias; consultas no modifican gameplay', () => {
  const events = require('../src/data/events.json');
  for (const row of bank.filter(row => row.optionId)) {
    assert.ok(events.some(event => event.options?.some(option => option.id === row.optionId)), row.id);
    const selected = eventArticle(row.optionId, 1, 'AULA');
    assert.deepEqual(selected, row);
    assert.doesNotMatch(row.subhead, /La bajada|opción registrada|No afirmar/);
  }
  assert.equal(eventArticle('opcion-inexistente', 1, 'AULA'), undefined);
  const { SimulationEngine } = require('../src/simulation/SimulationEngine.ts');
  const engine = new SimulationEngine();
  const before = JSON.stringify(engine.getState());
  for (let turn = 1; turn <= 20; turn++) for (const sector of EDITORIAL_SECTORS) {
    sectorArticle(sector, .91, undefined, turn, 'AULA');
    mapStory(sector, .91, undefined, turn, 'AULA');
  }
  assert.equal(JSON.stringify(engine.getState()), before);
});
test('Editorial: Tito y la reserva sólo aparecen en Ciudad cuando crece el embalse', () => {
  const approved = bank.find(row => row.id === 'A-MAP-26').text;
  const eligible = new Set();
  for (let turn = 1; turn <= 20; turn++) {
    eligible.add(mapStory('population', 1, undefined, turn, 'AULA', false, false, true).text);
    assert.notEqual(mapStory('population', 1, undefined, turn, 'AULA').text, approved);
    assert.notEqual(mapStory('mining', 1, undefined, turn, 'AULA', false, false, true).text, approved);
  }
  assert.ok(eligible.has(approved));
});

test('Editorial: bolsas variables agotan IDs válidos y reabrir no consume otra pieza', () => {
  const run = () => {
    const ledger = createEditorialLedger();
    return Array.from({ length: 20 }, (_, index) => {
      const ids = index % 2 ? ['P-CIU-01', 'P-CIU-02', 'P-CIU-10', 'P-CIU-17'] : ['P-CIU-01', 'P-CIU-02', 'P-CIU-10'];
      const before = [...ledger.used.keys()];
      const chosen = pickEditorial(ids, index + 1, 'AULA', 'city', ledger);
      if (ids.some(id => !before.includes(id))) assert.ok(!before.includes(chosen.id));
      assert.deepEqual(pickEditorial(ids, index + 1, 'AULA', 'city', ledger), chosen);
      return chosen.id;
    });
  };
  assert.deepEqual(run(), run());
  for (const ids of [['V-CIU-01', 'V-CIU-12', 'A-MAP-19'], ['V-MIN-02', 'A-MAP-21', 'V-MIN-01']]) {
    const ledger = createEditorialLedger();
    const first = pickEditorial([ids[0]], 1, 'AULA', 'map', ledger);
    const second = pickEditorial(ids, 2, 'AULA', 'map', ledger);
    assert.equal(first.id, ids[0]);
    assert.equal(second.id, ids[2], 'Otra familia antes que una versión parecida del mismo chiste');
  }
  assert.equal(pickEditorial(['V-RIO-12'], 1, 'AULA', 'river'), undefined);
});

test('Editorial: cinco partidas de igual semilla varían aperturas, sin perro en partidas consecutivas', () => {
  const { editorialSeed, createEditorialSessionCounter } = require('../src/game/EditorialSession.ts');
  const storage = new Map();
  const access = () => ({ getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) });
  const next = createEditorialSessionCounter(access);
  const openings = Array.from({ length: 5 }, () => mapStory('population', 1, undefined, 1, editorialSeed('AULA-2026-001', next())).text);
  assert.equal(new Set(openings).size, 5);
  for (let index = 1; index < openings.length; index++) {
    assert.ok(!(/perro/.test(openings[index]) && /perro/.test(openings[index - 1])));
  }
  assert.equal(createEditorialSessionCounter(access)(), 5, 'El contador continúa al recargar');
  const inaccessible = createEditorialSessionCounter(() => { throw new Error('Storage bloqueado'); });
  assert.deepEqual(Array.from({ length: 5 }, inaccessible), [0, 1, 2, 3, 4]);
});

test('Editorial: ordinal fuera del modelo recupera la edición sin alterar snapshot ni PRNG', () => {
  const { editorialSeed } = require('../src/game/EditorialSession.ts');
  const { SimulationEngine } = require('../src/simulation/SimulationEngine.ts');
  const { SessionLog } = require('../src/sessionExport.ts');
  const { createRecoveryPacket, replayRecovery } = require('../src/sessionRecovery.ts');
  const engine = new SimulationEngine('cuenca_central', 'AULA-2026-001', true);
  const log = new SessionLog(engine.getState());
  const before = JSON.stringify(engine.getState());
  const legacy = createRecoveryPacket(engine.getState(), log, '2026-10-09T00:00:00Z');
  assert.equal(Object.hasOwn(legacy, 'editorialSession'), false);
  for (let ordinal = 0; ordinal < 5; ordinal++) {
    mapStory('population', 1, undefined, 1, editorialSeed(engine.getState().seed, ordinal));
    const packet = createRecoveryPacket(engine.getState(), log, '2026-10-09T00:00:00Z', ordinal);
    assert.deepEqual(packet.session, legacy.session);
    const replay = replayRecovery(JSON.parse(JSON.stringify(packet)));
    assert.equal(replay.ok, true);
    assert.equal(replay.editorialSession, ordinal);
    assert.equal(JSON.stringify(replay.engine.getState()), before);
    assert.deepEqual(mapStory('population', 1, undefined, 1, editorialSeed(replay.engine.getState().seed, replay.editorialSession)),
      mapStory('population', 1, undefined, 1, editorialSeed(engine.getState().seed, ordinal)));
  }
  assert.equal(replayRecovery(legacy).editorialSession, 0);
  assert.equal(replayRecovery({ ...legacy, editorialSession: -1 }).editorialSession, 0);
  assert.equal(JSON.stringify(engine.getState()), before);
});

test('Editorial: reconstruye mapa y Heraldo de 20 turnos sin depender de consultas previas', () => {
  const { SimulationEngine } = require('../src/simulation/SimulationEngine.ts');
  const { generateNewspaperEdition } = require('../src/game/Newspaper.ts');
  const { editorialSeed } = require('../src/game/EditorialSession.ts');
  const seed = editorialSeed('AULA', 2);
  const engine = new SimulationEngine();
  const initial = JSON.stringify(engine.getState());
  // Historial editorial sintético: sólo necesitamos un resultado real como forma base.
  const base = engine.resolveSeason();
  const history = Array.from({ length: 20 }, (_, index) => ({ ...base, turn: index + 1,
    balance: { ...base.balance, satisfactions: { ...base.balance.satisfactions, population: 1, mining: 1, ecosystem: 1 } } }));
  const map = sector => history.map(row => mapStory(sector, 1, 1, row.turn, seed, false, false, false, history).text);
  const city = map('population'), mine = map('mining');
  for (const lines of [city, mine]) for (let i = 1; i < lines.length; i++) assert.notEqual(lines[i], lines[i - 1]);
  for (let i = 1; i < 20; i++) {
    assert.ok(!(/silenció/.test(city[i]) && /silenció/.test(city[i - 1])));
    assert.ok(!(/perro/.test(city[i]) && /perro/.test(city[i - 1])));
    assert.ok(!(/foto.*Ferrada/.test(mine[i]) && /foto.*Ferrada/.test(mine[i - 1])));
  }
  assert.deepEqual(map('population'), city);
  assert.doesNotMatch(map('ecosystem').join(' '), /no tuvo que corregir/);
  const editions = history.map((row, index) => generateNewspaperEdition(row, history[index - 1], undefined, history, seed));
  for (const index of [19, 0, 7, 3]) assert.deepEqual(generateNewspaperEdition(history[index], history[index - 1], undefined, history, seed), editions[index]);
  assert.notEqual(initial, JSON.stringify(engine.getState())); // Sólo resolveSeason avanzó el motor.
  const resolved = JSON.stringify(engine.getState());
  map('mining');
  generateNewspaperEdition(history[19], history[18], undefined, history, seed);
  assert.equal(JSON.stringify(engine.getState()), resolved);
});
