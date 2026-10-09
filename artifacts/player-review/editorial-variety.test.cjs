const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText, filename);
const { SimulationEngine } = require('../../src/simulation/SimulationEngine.ts');
const { generateNewspaperEdition, getEventRecap } = require('../../src/game/Newspaper.ts');
const { NEWSPAPER_HEADLINES } = require('../../src/game/NewspaperHeadlines.ts');
const events = require('../../src/data/events.json');

test('Bancos: quince escenas distintas y sorteo editorial separado, reproducible y sin repetición', () => {
  for (const [kind, lines] of Object.entries(NEWSPAPER_HEADLINES)) {
    assert.ok(lines.length >= 15, kind);
    assert.equal(new Set(lines).size, lines.length, kind);
    const limit = kind === 'crisis' || kind === 'error' ? 58 : 65;
    assert.ok(lines.every(line => line.length <= limit), `${kind}: titulares legibles aun con el foco más largo`);
  }
  const engine = new SimulationEngine('cuenca_central', 'AZAR-EDITORIAL', false);
  const original = engine.resolveSeason();
  const history = [];
  const orders = [[], []];
  for (let turn = 1; turn <= 15; turn++) {
    const row = structuredClone(original);
    row.turn = turn;
    row.events = [];
    Object.assign(row.balance.satisfactions, { population: 1, ecosystem: 1, agriculture: 1, livestock: 1, mining: 1 });
    Object.assign(row.balance, { reservoirStart: 60, reservoirEnd: 60, reservoirWithdrawal: 0, waterQuality: 80, basinHealth: 80 });
    history.push(row);
    const before = JSON.stringify([history, engine.getState(), engine.rng]);
    for (let index = 0; index < 2; index++) {
      const seed = `EDITORIAL-${index}`;
      const edition = generateNewspaperEdition(row, history.at(-2), undefined, history, seed);
      assert.equal(edition.kind, 'good');
      assert.deepEqual(generateNewspaperEdition(row, history.at(-2), undefined, history, seed), edition);
      orders[index].push(edition.mainArticle.headline);
    }
    assert.equal(JSON.stringify([history, engine.getState(), engine.rng]), before);
  }
  for (const order of orders) assert.equal(new Set(order).size, 15);
  assert.notDeepEqual(orders[0], orders[1], 'Otra semilla editorial cambia el orden, no los resultados');
});

test('Veinte usos de reservas: ninguna portada repetida; historial y resultado intactos', () => {
  const engine = new SimulationEngine('cuenca_central', 'EDITORIAL', false);
  const original = engine.resolveSeason();
  const history = [];
  const headlines = new Set();
  for (let turn = 1; turn <= 20; turn++) {
    const row = structuredClone(original);
    row.turn = turn;
    row.year = Math.ceil(turn / 4);
    row.events = [];
    Object.assign(row.balance.satisfactions, { population: 1, ecosystem: 1, agriculture: 1, livestock: 1, mining: 1 });
    Object.assign(row.balance, { reservoirStart: 80, reservoirEnd: 60, reservoirWithdrawal: 20, waterQuality: 80, basinHealth: 80 });
    history.push(row);
    const before = JSON.stringify([history, engine.getState(), engine.rng]);
    const edition = generateNewspaperEdition(row, history.at(-2), undefined, history);
    assert.equal(edition.kind, 'tradeoff');
    assert.deepEqual(generateNewspaperEdition(row, history.at(-2), undefined, history), edition);
    assert.equal(JSON.stringify([history, engine.getState(), engine.rng]), before);
    assert.ok(!headlines.has(edition.mainArticle.headline));
    headlines.add(edition.mainArticle.headline);
    assert.match(edition.mainArticle.subhead, /El reparto usó reservas y el embalse bajó/);
  }
  assert.equal(headlines.size, 20);
});

test('Anécdota de vacas visible relata elección, no inventa suministro ni variación nominal', () => {
  const event = events.find(item => item.id === 'berta_calor');
  const record = { event, chosenOptionId: 'agua_fresca_berta', waterAdjustment: { reservoirChange: 0, aquiferChange: 0 } };
  const before = JSON.stringify(record);
  const recap = getEventRecap(record, 15);
  assert.match(recap.headline, /Berta.*bebedero/);
  assert.equal(recap.decision, 'Elegiste renovar los piletones con agua fresca.');
  assert.doesNotMatch(JSON.stringify(recap), /gotas|\d|llenaste|recibieron/);
  assert.equal(JSON.stringify(record), before);
  assert.equal(getEventRecap({ event }, 15), null);
  assert.equal(getEventRecap({ event, chosenOptionId: 'inexistente' }, 15), null);
  const fallback = getEventRecap({ event: { id: 'otro', name: 'Otro evento', options: [{ id: 'x', label: 'Elegir algo' }] }, chosenOptionId: 'x' }, 2);
  assert.deepEqual(fallback, { headline: 'Otro evento', decision: 'Elegiste «Elegir algo».' });
});

test('Cambiar el sector de alerta no reinicia la bolsa editorial', () => {
  const engine = new SimulationEngine('cuenca_central', 'FOCOS', false);
  const original = engine.resolveSeason();
  const history = [];
  const scenes = new Set();
  for (let turn = 1; turn <= 15; turn++) {
    const row = structuredClone(original);
    row.turn = turn;
    row.events = [];
    Object.assign(row.balance.satisfactions, { population: turn % 2 ? .4 : 1, ecosystem: turn % 2 ? 1 : .4, agriculture: 1, livestock: 1, mining: 1 });
    Object.assign(row.balance, { waterQuality: 80, basinHealth: 80 });
    history.push(row);
    const edition = generateNewspaperEdition(row, history.at(-2), undefined, history, 'FOCOS');
    assert.equal(edition.kind, 'crisis');
    const scene = edition.mainArticle.headline.replace(/^(Crisis en [^:]+|Ciudad sin pedido): /, '');
    assert.ok(!scenes.has(scene), scene);
    scenes.add(scene);
  }
});

test('Caídas de calidad alternadas con otras portadas conservan su propia bolsa', () => {
  const engine = new SimulationEngine('cuenca_central', 'CALIDAD', false);
  const original = engine.resolveSeason();
  const history = [];
  const scenes = new Set();
  for (let turn = 1; turn <= 20; turn++) {
    const row = structuredClone(original);
    row.turn = turn;
    row.events = [];
    Object.assign(row.balance.satisfactions, { population: 1, ecosystem: 1, agriculture: 1, livestock: 1, mining: 1 });
    Object.assign(row.balance, { waterQuality: turn % 2 ? 90 : 80, basinHealth: 80, reservoirStart: 60, reservoirEnd: 60, reservoirWithdrawal: 0 });
    history.push(row);
    const edition = generateNewspaperEdition(row, history.at(-2), undefined, history, 'CALIDAD');
    if (turn % 2 === 0) {
      assert.match(edition.mainArticle.subhead, /pasó de 90 a 80/);
      assert.ok(!scenes.has(edition.mainArticle.headline), edition.mainArticle.headline);
      scenes.add(edition.mainArticle.headline);
    }
  }
  assert.equal(scenes.size, 10);
});
