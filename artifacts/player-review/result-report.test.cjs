const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
require.extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText, file);
const { SimulationEngine } = require(root + '/src/simulation/SimulationEngine.ts');
const { createLearningReport } = require(root + '/src/resultReport.ts');
function completedGame() {
  const engine = new SimulationEngine('cuenca_central', 'RESULTADOS-2026', true);
  for (let turn = 1; turn <= 20; turn++) {
    const state = engine.getState();
    if (state.activeInteractiveEvent) engine.chooseEventOption(state.activeInteractiveEvent.options.find(o => engine.canChooseEventOption(o.id).allowed).id);
    for (const id of ['population', 'agriculture', 'livestock', 'mining', 'ecosystem']) engine.setSectorAllocation(id, Math.floor(state.sectors[id].currentDemand * .8));
    engine.resolveSeason();
    if (turn < 20) engine.advanceToNextTurn();
  }
  return engine;
}
test('Printable report preserves all twenty seasons, actual event choices and simulation state', () => {
  const engine = completedGame(), state = engine.getState();
  const before = JSON.stringify(state), rng = JSON.stringify(engine.rng);
  const html = createLearningReport(state, '<h2>Así quedó tu cuenca</h2>');
  assert.equal((html.match(/<tr>/g) ?? []).length, 21);
  for (const row of state.seasonHistory) assert.ok(html.includes(`<td>${row.turn}</td>`));
  assert.match(html, /mismo escenario y semilla/);
  assert.match(html, /sin calibración regional/);
  assert.match(html, /Imprimir.*papel o PDF/);
  assert.doesNotMatch(html, /<script|<link|<img|<iframe/i);
  for (const row of state.seasonHistory) for (const event of row.events.filter(e => e.chosenOptionId)) assert.ok(html.includes(event.event.name));
  assert.equal(JSON.stringify(state), before); assert.equal(JSON.stringify(engine.rng), rng);
});
test('Player-controlled scenario and seed are escaped in a standalone document', () => {
  const state = completedGame().getState();
  state.scenarioName = '<script>alert(1)</script>'; state.seed = '"<&\'';
  const html = createLearningReport(state, '');
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(html.includes('&quot;&lt;&amp;&#39;'));
  assert.doesNotMatch(html, /<script/i);
});
const source = ts.createSourceFile('main.ts', fs.readFileSync(root + '/src/main.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const reportFunction = source.statements.find(s => ts.isFunctionDeclaration(s) && s.name?.text === 'learningReportHTML').getText(source);
const registrations = source.statements.filter(s => ts.isExpressionStatement(s) && /^document\.querySelectorAll/.test(s.getText(source)) && /\[data-(save|print)-results\]/.test(s.getText(source))).map(s => s.getText(source));
function fixture({ blocked = false, allowed = true, finished = true } = {}) {
  const buttons = { '[data-save-results]': { addEventListener: (_, fn) => buttons.save = fn }, '[data-print-results]': { addEventListener: (_, fn) => buttons.print = fn } };
  const status = { hidden: true }, downloads = [], written = [];
  let footerRemoved = false, printed = 0, cloned = 0;
  const detail = { open: false };
  const clone = { querySelector: () => ({ remove() { footerRemoved = true; } }), querySelectorAll: () => [detail], get innerHTML() { return footerRemoved && detail.open ? '<h2>Contenido completo</h2>' : 'INCOMPLETE'; } };
  const c = { engine: { getState: () => ({ isGameOver: finished }) }, canUseControl: () => allowed,
    modalFinalReport: { querySelector: selector => selector === '[data-export-status]' ? status : { cloneNode(deep) { assert.equal(deep, true); cloned++; return clone; } } },
    createLearningReport: (_, html) => html, downloadJSON: (...args) => downloads.push(args),
    document: { querySelectorAll: selector => [buttons[selector]] },
    window: { open: () => blocked ? null : { document: { open() {}, write(html) { written.push(html); }, close() {} }, focus() {}, print() { printed++; } } }
  };
  vm.runInNewContext(ts.transpileModule(reportFunction + '\n' + registrations.join('\n'), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, c);
  return { buttons, status, downloads, written, printed: () => printed, cloned: () => cloned };
}
test('Save and print use the complete cloned report and a readable HTML download', () => {
  const f = fixture(); f.buttons.save(); f.buttons.print();
  assert.deepEqual(Array.from(f.downloads[0]), ['<h2>Contenido completo</h2>', 'cuenca-viva-mis-resultados.html', 'text/html']);
  assert.deepEqual(f.written, ['<h2>Contenido completo</h2>']); assert.equal(f.printed(), 1);
});
test('Blocked printing offers a real download alternative; inactive or unfinished controls do nothing', () => {
  const f = fixture({ blocked: true }); f.buttons.print();
  assert.equal(f.printed(), 0); assert.match(f.status.textContent, /No se pudo.*Guardar datos/);
  for (const options of [{ allowed: false }, { finished: false }]) {
    const guarded = fixture(options); guarded.buttons.save(); guarded.buttons.print();
    assert.equal(guarded.cloned(), 0); assert.equal(guarded.downloads.length, 0); assert.equal(guarded.printed(), 0);
  }
});
