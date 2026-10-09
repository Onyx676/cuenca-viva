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
const { SessionLog, createSessionExport } = require(root + '/src/sessionExport.ts');
const source = ts.createSourceFile('main.ts', fs.readFileSync(root + '/src/main.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const functions = {};
const registrations = [];
for (const statement of source.statements) {
  if (ts.isFunctionDeclaration(statement) && statement.name) functions[statement.name.text] = statement.getText(source);
  if (ts.isExpressionStatement(statement) && /^document\.querySelectorAll/.test(statement.getText(source))
      && /\[data-(export|copy)-session\]/.test(statement.getText(source))) registrations.push(statement.getText(source));
}
assert.equal(registrations.length, 2, 'Actual download and clipboard listener registrations are selected');
const sectors = ['population', 'agriculture', 'livestock', 'mining', 'ecosystem'];
function recordedGame(turns = 20) {
  const engine = new SimulationEngine('cuenca_central', 'EXPORT-UI-2026', true);
  const log = new SessionLog(engine.getState());
  for (let turn = 1; turn <= turns; turn++) {
    const state = engine.getState();
    if (state.activeInteractiveEvent) {
      const event = state.activeInteractiveEvent;
      const option = event.options.find(o => engine.canChooseEventOption(o.id).allowed);
      log.captureAllocations(state); engine.chooseEventOption(option.id);
      log.record({ type: 'event-choice', turn, eventId: event.id, optionId: option.id });
    }
    for (const id of sectors) engine.setSectorAllocation(id, Math.floor(state.sectors[id].currentDemand * .8));
    log.captureAllocations(state); engine.resolveSeason(); log.record({ type: 'resolve', turn });
    if (turn < turns) { engine.advanceToNextTurn(); log.record({ type: 'advance', turn }); }
  }
  return { engine, log };
}
class Element {
  constructor(modal = false) { this.modal = modal; this.children = []; this.parent = null; this.listeners = {}; this.hidden = true; this.textContent = ''; this.open = false; this.classList = { contains: name => name === 'open' && this.open }; }
  appendChild(child) { child.parent = this; this.children.push(child); return child; }
  contains(child) { return child === this || this.children.some(c => c.contains(child)); }
  closest(selector) { if (selector === '.modal-backdrop') return this.modal ? this : this.parent?.closest(selector) ?? null; return null; }
  querySelector(selector) { return selector === '[data-export-status]' ? this.status ?? null : null; }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  remove() { this.removed = true; this.parent.children = this.parent.children.filter(c => c !== this); this.parent = null; }
}
function fixture({ rejectClipboard = false, clipboardAbsent = false, turns = 20 } = {}) {
  const { engine, log } = recordedGame(turns);
  const final = new Element(true), closed = new Element(true), body = new Element(); final.open = true;
  body.appendChild(final); body.appendChild(closed);
  const download = final.appendChild(new Element()), copy = final.appendChild(new Element());
  const staleDownload = closed.appendChild(new Element()), staleCopy = closed.appendChild(new Element());
  final.status = new Element(); closed.status = new Element();
  const created = [], urls = new Map(), revoked = [], clicks = [], timers = [], clipboard = [];
  const c = { engine, sessionLog: log, SimulationEngine, createSessionExport, Blob, Node: Element, HTMLElement: Element,
    KeyboardEvent: class {}, cardSeasonFeedback: new Element(), tutorialManager: { isActive: () => false },
    navigator: clipboardAbsent ? {} : { clipboard: { async writeText(value) { if (rejectClipboard) throw new Error('Denied'); clipboard.push(value); } } },
    URL: { createObjectURL(blob) { const key = 'blob:test/' + urls.size; urls.set(key, blob); return key; }, revokeObjectURL(key) { revoked.push(key); urls.delete(key); } },
    window: { setTimeout(fn, ms) { timers.push({ fn, ms }); } },
    document: { body,
      querySelectorAll(selector) {
        if (selector === '.modal-backdrop.open') return [final, closed].filter(el => el.open);
        if (selector === '[data-export-session]') return [download, staleDownload];
        if (selector === '[data-copy-session]') return [copy, staleCopy];
        return [];
      },
      createElement(tag) {
        assert.equal(tag, 'a'); const link = new Element(); created.push(link);
        link.click = () => {
          const event = { target: link, type: 'click', prevented: false, stopped: false,
            preventDefault() { this.prevented = true; }, stopImmediatePropagation() { this.stopped = true; } };
          c.guardBackgroundEvent(event);
          clicks.push({ prevented: event.prevented, stopped: event.stopped, parent: link.parent,
            href: link.href, download: link.download, blob: urls.get(link.href) });
        };
        return link;
      }
    }
  };
  const names = ['activeInteractionSurface', 'backgroundInteractionBlocked', 'canUseControl', 'guardBackgroundEvent', 'focusInteractionSurface', 'downloadSessionDiagnostic', 'downloadJSON'];
  const code = names.map(name => { assert.ok(functions[name], name); return functions[name]; }).join('\n') + '\n' + registrations.join('\n');
  vm.runInNewContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText, c);
  return { c, final, closed, body, download, copy, staleDownload, staleCopy, created, urls, revoked, clicks, timers, clipboard };
}
function replay(data) {
  const engine = new SimulationEngine(data.metadata.scenarioId, data.metadata.seed, data.metadata.isClassroomMode);
  for (const a of data.recording.actions) {
    assert.equal(engine.getState().turn, a.turn);
    if (a.type === 'allocation') for (const id of sectors) engine.setSectorAllocation(id, a.values[id]);
    else if (a.type === 'event-choice') { assert.equal(engine.getState().activeInteractiveEvent.id, a.eventId); engine.chooseEventOption(a.optionId); }
    else if (a.type === 'resolve') engine.resolveSeason();
    else if (a.type === 'advance') engine.advanceToNextTurn();
    else if (a.type === 'purchase') assert.equal(engine.purchaseUpgrade(a.upgradeId).success, true);
    else assert.fail(a.type);
  }
  assert.deepEqual(engine.getState(), data.snapshot);
  return engine;
}
test('Final modal: real download handler creates a usable link inside the active surface despite background guard', async () => {
  const f = fixture(); assert.equal(f.c.backgroundInteractionBlocked(), true);
  f.download.listeners.click();
  assert.equal(f.clicks.length, 1); const click = f.clicks[0];
  assert.equal(click.parent, f.final); assert.equal(click.prevented, false); assert.equal(click.stopped, false);
  assert.ok(click.href.startsWith('blob:')); assert.match(click.download, new RegExp('modelo-' + SimulationEngine.MODEL_VERSION + '-turno-20\\.json$'));
  assert.equal(f.created[0].removed, true); assert.equal(f.final.children.includes(f.created[0]), false);
  assert.equal(f.urls.has(click.href), true, 'URL remains alive after synchronous click and link removal');
  const data = JSON.parse(await click.blob.text()); assert.equal(data.snapshot.seasonHistory.length, 20); replay(data);
  assert.equal(f.final.status.hidden, false); assert.match(f.final.status.textContent, /Descarga solicitada/);
  assert.equal(f.timers.length, 1); assert.equal(f.timers[0].ms, 1000); f.timers[0].fn();
  assert.deepEqual(f.revoked, [click.href]); assert.equal(f.urls.has(click.href), false);
});
test('Clipboard real handler copies the complete twenty-season recording and confirms actual success', async () => {
  const f = fixture(); await f.copy.listeners.click();
  assert.equal(f.clipboard.length, 1); const data = JSON.parse(f.clipboard[0]);
  assert.equal(data.recording.kind, 'complete-action-log'); assert.equal(data.snapshot.seasonHistory.length, 20);
  assert.equal(data.recording.actions.filter(a => a.type === 'resolve').length, 20);
  assert.equal(data.recording.actions.filter(a => a.type === 'advance').length, 19); replay(data);
  assert.equal(f.final.status.hidden, false); assert.match(f.final.status.textContent, /Datos copiados: 20 estaciones/);
});
for (const options of [{ rejectClipboard: true }, { clipboardAbsent: true }]) test('Clipboard rejection/unavailable API reports failure without inventing a successful copy: ' + JSON.stringify(options), async () => {
  const f = fixture(options); await f.copy.listeners.click();
  assert.equal(f.clipboard.length, 0); assert.equal(f.created.length, 0);
  assert.equal(f.final.status.hidden, false); assert.match(f.final.status.textContent, /no permitió copiar/); assert.doesNotMatch(f.final.status.textContent, /JSON copiado/);
});
test('Stale controls in closed modals cannot download, copy or alter their status', async () => {
  const f = fixture(); f.staleDownload.listeners.click(); await f.staleCopy.listeners.click();
  assert.equal(f.created.length, 0); assert.equal(f.clipboard.length, 0); assert.equal(f.closed.status.hidden, true);
  f.final.open = false;
  f.download.listeners.click(); await f.copy.listeners.click();
  assert.equal(f.created.length, 0); assert.equal(f.clipboard.length, 0);
});
test('Download and clipboard do not change engine, log or gameplay PRNG, including an unfinished season', async () => {
  const f = fixture({ turns: 1 });
  f.c.engine.advanceToNextTurn(); f.c.sessionLog.record({ type: 'advance', turn: 1 });
  assert.equal(f.c.engine.getState().isSeasonResolved, false);
  f.c.engine.setSectorAllocation('population', 11);
  const state = JSON.stringify(f.c.engine.getState()), log = JSON.stringify(f.c.sessionLog.snapshot(f.c.engine.getState())), rng = JSON.stringify(f.c.engine.rng);
  f.download.listeners.click(); await f.copy.listeners.click();
  assert.equal(JSON.stringify(f.c.engine.getState()), state); assert.equal(JSON.stringify(f.c.sessionLog.snapshot(f.c.engine.getState())), log); assert.equal(JSON.stringify(f.c.engine.rng), rng);
  const twin = replay(JSON.parse(f.clipboard[0]));
  for (const engine of [f.c.engine, twin]) {
    if (engine.getState().activeInteractiveEvent) {
      const option = engine.getState().activeInteractiveEvent.options.find(o => engine.canChooseEventOption(o.id).allowed);
      engine.chooseEventOption(option.id);
    }
    engine.resolveSeason(); engine.advanceToNextTurn();
  }
  assert.deepEqual(f.c.engine.getState(), twin.getState(), 'Future seeded season remains the same after both exports');
});
