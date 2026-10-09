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

test('Heraldo: quince bajadas por sector, explicación única y causas de entrega distintas', () => {
  const engine = new SimulationEngine('cuenca_central', 'BAJADAS-2026', true);
  const result = structuredClone(engine.resolveSeason());
  Object.assign(result.balance.satisfactions, { population: 1, ecosystem: 1, agriculture: .67, livestock: .67, mining: .62 });
  for (const id of ['agriculture', 'livestock', 'mining']) {
    result.balance.allocations[id] = 10; result.balance.suppliedAllocations[id] = 10;
  }
  Object.assign(result.balance, { waterQuality: 85, basinHealth: 85, reservoirStart: 65, reservoirEnd: 38 });
  result.events = []; result.goalAchieved = false;
  const before = JSON.stringify([result, engine.getState(), engine.rng]);
  const variants = [new Set(), new Set()];
  const primary = new Set();
  for (let turn = 1; turn <= 15; turn++) {
    const current = { ...result, turn };
    const edition = generateNewspaperEdition(current);
    assert.deepEqual(generateNewspaperEdition(current), edition);
    assert.doesNotMatch(JSON.stringify(edition), /no cubría la demanda/);
    assert.equal(edition.secondaryArticles.length, 2);
    edition.secondaryArticles.forEach((article, i) => {
      variants[i].add(article.subhead);
      assert.doesNotMatch(article.subhead, /pedido|asignad|envío|entero|\bcompleto\b/);
      assert.doesNotMatch(article.subhead, /%/);
      assert.match(article.subhead, /parte|faltante|pendiente|incompleto|debajo|parcialmente|sin alcanzar|por resolver/);
    });
    const normalized = edition.secondaryArticles.map(article => article.subhead.replace(/Cultivos|Granja/g, 'Sector'));
    assert.notEqual(normalized[0], normalized[1], 'Dos breves no usan la misma estructura cambiando sólo el sector');
    assert.match(edition.mainArticle.subhead, /pedido|asignad|asignar|autorizad|acordad/);
    primary.add(edition.mainArticle.subhead);
  }
  variants.forEach(lines => assert.equal(lines.size, 15));
  assert.equal(primary.size, 15);
  assert.equal(JSON.stringify([result, engine.getState(), engine.rng]), before);
});

test('Heraldo: quince variantes por gravedad, sin porcentajes ni éxito ante faltantes', () => {
  const engine = new SimulationEngine('cuenca_central', 'COBERTURA-NARRADA', true);
  const base = structuredClone(engine.resolveSeason());
  base.events = [];
  const before = JSON.stringify([base, engine.getState(), engine.rng]);
  const cases = [
    [0, /sin|no |pendiente/i],
    [.4, /poca|grave|gran parte|lejos|muy por debajo|pequeña parte|mayor parte|mayormente|serio|urgente|gran necesidad|brecha|insuficiente/],
    [.67, /parte|faltante|pendiente|incompleto|debajo|parcialmente|sin alcanzar|por resolver/],
    [.9, /cerca|poco|menor|casi|pequeño/],
    [1, /tod[ao]|cubierto|sin faltantes|alcanzó|suficiente|cubrió|atendida|no dejó faltantes|No quedó|resuelto/]
  ];
  for (const [rate, meaning] of cases) {
    const variants = new Set();
    for (let turn = 1; turn <= 15; turn++) {
      const result = structuredClone(base);
      result.turn = turn;
      Object.assign(result.balance.satisfactions, { population: rate === 0 ? 0 : 1, ecosystem: 1, agriculture: rate, livestock: 1, mining: 1 });
      result.balance.allocations.agriculture = 10;
      result.balance.suppliedAllocations.agriculture = rate === 0 ? 0 : 10;
      result.balance.allocations.population = 10;
      result.balance.suppliedAllocations.population = rate === 0 ? 0 : 10;
      const verdict = rate === 0 ? { kind: 'crisis', focus: 'population', label: 'Crisis' } : { kind: 'recovery', focus: 'agriculture', label: 'Recuperación' };
      const edition = generateNewspaperEdition(result, undefined, verdict);
      assert.doesNotMatch(JSON.stringify(edition), /%/);
      assert.match(edition.mainArticle.subhead, meaning);
      variants.add(edition.mainArticle.subhead);
      assert.deepEqual(generateNewspaperEdition(result, undefined, verdict), edition);
    }
    assert.equal(variants.size, 15);
  }
  assert.equal(JSON.stringify([base, engine.getState(), engine.rng]), before);
});

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
