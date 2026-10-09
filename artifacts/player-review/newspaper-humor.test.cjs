const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
  });
  module._compile(result.outputText, filename);
};
const { SimulationEngine } = require('../../src/simulation/SimulationEngine.ts');
const { generateNewspaperEdition } = require('../../src/game/Newspaper.ts');

test('Heraldo: humor editorial variado, breve y sin alterar partida/PRNG', () => {
  const engine = new SimulationEngine('cuenca_central', 'HUMOR-2026', true);
  if (engine.getState().activeInteractiveEvent) {
    const option = engine.getState().activeInteractiveEvent.options.find(option => engine.canChooseEventOption(option.id).allowed);
    engine.chooseEventOption(option.id);
  }
  const result = structuredClone(engine.resolveSeason());
  Object.assign(result.balance.satisfactions, { population: .9, ecosystem: .9, agriculture: .7, livestock: .7, mining: .7 });
  Object.assign(result.balance, { waterQuality: 75, basinHealth: 75, reservoirStart: 100, reservoirEnd: 100, reservoirWithdrawal: 0 });
  result.events = [];
  result.goalAchieved = false;
  const headlines = new Set();
  for (let turn = 1; turn <= 20; turn++) {
    result.turn = turn;
    const before = JSON.stringify([result, engine.getState(), engine.rng]);
    const edition = generateNewspaperEdition(result);
    assert.deepEqual(generateNewspaperEdition(result), edition);
    assert.equal(JSON.stringify([result, engine.getState(), engine.rng]), before);
    headlines.add(edition.mainArticle.headline);
    assert.doesNotMatch(edition.mainArticle.headline, /\d|💧/);
    assert.ok(edition.mainArticle.headline.length <= 65);
    assert.equal(edition.secondaryArticles.length, 2);
    assert.ok(edition.secondaryArticles.every(article => article.subhead.length <= 160));
  }
  assert.ok(headlines.size >= 15);
});

test('Heraldo: evento actual cuenta decisión y efectos sin repetir cifras del resumen', () => {
  const engine = new SimulationEngine('cuenca_central', 'HUMOR-EVENTO', true);
  if (engine.getState().activeInteractiveEvent) {
    const option = engine.getState().activeInteractiveEvent.options.find(option => engine.canChooseEventOption(option.id).allowed);
    engine.chooseEventOption(option.id);
  }
  const result = structuredClone(engine.resolveSeason());
  Object.assign(result.balance.satisfactions, { population: .9, ecosystem: .9, agriculture: .7, livestock: .7, mining: .7 });
  Object.assign(result.balance, { waterQuality: 75, basinHealth: 75, reservoirStart: 100, reservoirEnd: 100, reservoirWithdrawal: 0 });
  const event = { name: 'Fugas en la red', type: 'HUMAN_CONDITIONAL', options: [{ id: 'repair', label: 'Reparar' }] };
  result.events = [{ event, chosenOptionId: 'repair', wasMitigated: true, impactSummary: '', appliedEffects: { moneyDelta: -10, trustDelta: 0, basinHealthDelta: 0, waterQualityDelta: 0 } }];
  const edition = generateNewspaperEdition(result);
  const article = edition.secondaryArticles.find(article => article.headline === event.name);
  assert.ok(article);
  assert.match(article.subhead, /Se eligió «Reparar».*presupuesto/);
  assert.doesNotMatch(article.subhead, /\d|confianza|gotas|Ver resumen/);
  result.events[0].appliedEffects.moneyDelta = 0;
  assert.match(generateNewspaperEdition(result).secondaryArticles.find(article => article.headline === event.name).subhead, /Sin cambio directo registrado/);
});
