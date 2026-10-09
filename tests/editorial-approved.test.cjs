const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (m, file) => m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText, file);
const bank = require('../src/game/ApprovedEditorial.json');
const { EDITORIAL_SECTORS, sectorArticle, mapStory } = require('../src/game/EditorialSelection.ts');

test('Editorial: conserva las 104 piezas aprobadas y excluye la rechazada', () => {
  assert.equal(bank.length, 104);
  assert.equal(new Set(bank.map(row => row.id)).size, 104);
  assert.ok(!bank.some(row => row.id === 'R-H-15'));
  assert.match(bank.find(row => row.id === 'A-MAP-03').text, /mi familia pidió que lo ponga/i);
  assert.equal(bank.find(row => row.id === 'H-CIU-01').headline, 'El barrio tuvo agua y encontró otro tema urgente');
});
test('Editorial: cobertura completa, faltante y mejora no se confunden; parejas intactas', () => {
  for (const sector of EDITORIAL_SECTORS) for (let turn = 1; turn <= 20; turn++) {
    const full = sectorArticle(sector, 1, undefined, turn, 'AULA');
    assert.match(full.id, /-0[12]$/);
    assert.deepEqual(full, bank.find(row => row.id === full.id));
    assert.equal(sectorArticle(sector, .9, .9, turn, 'AULA'), undefined);
    const partial = sectorArticle(sector, .9, .5, turn, 'AULA', true);
    assert.match(partial.id, /-03$/);
    const low = sectorArticle(sector, .6, undefined, turn, 'AULA');
    assert.ok(low.id.endsWith('-04') || low.id === 'A-H-16');
    const grave = sectorArticle(sector, .2, undefined, turn, 'AULA');
    assert.ok(grave.id.endsWith('-05') || grave.id === 'A-H-16');
    assert.deepEqual(mapStory(sector, .9, .5, turn, 'AULA'), mapStory(sector, .9, .5, turn, 'AULA'));
    assert.doesNotMatch(mapStory(sector, .9, .9, turn, 'AULA').text, /mejoró|Va mejor|Alcanzó el agua/);
  }
});
test('Editorial: más cobertura no prueba más volumen; carpincho sólo en contexto del evento', () => {
  assert.equal(sectorArticle('mining', .9, .5, 1, 'AULA'), undefined);
  for (let turn = 1; turn <= 20; turn++) {
    assert.doesNotMatch(mapStory('agriculture', .9, .5, turn, 'AULA').text, /Llegó más/);
    assert.doesNotMatch(mapStory('ecosystem', 1, undefined, turn, 'AULA').text, /carpincho/);
  }
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
