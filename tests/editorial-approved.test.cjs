const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (m, file) => m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText, file);
const bank = require('../src/game/ApprovedEditorial.json');
const { EDITORIAL_SECTORS, sectorArticle, mapStory, eventArticle } = require('../src/game/EditorialSelection.ts');

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
