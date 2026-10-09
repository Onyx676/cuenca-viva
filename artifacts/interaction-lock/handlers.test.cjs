const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
const path = require('node:path');
require.extensions['.ts'] = (m, file) => m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText, file);
const root = path.resolve(__dirname, '../..');
const main = fs.readFileSync(path.join(root, process.env.INTERACTION_LOCK_USE_ROOT === '1' ? 'src/main.ts' : 'artifacts/interaction-lock/candidate/src/main.ts'), 'utf8');
const parsed = ts.createSourceFile('main.ts', main, ts.ScriptTarget.Latest, true);
const { SimulationEngine } = require(root + '/src/simulation/SimulationEngine.ts');
const { SessionLog, createSessionExport } = require(root + '/src/sessionExport.ts');
const { SEASONS_INFO, getNextSeason } = require(root + '/src/models/Season.ts');
const sectors = ['population', 'agriculture', 'livestock', 'mining', 'ecosystem'];
const handlers = {};
const functions = {};
function visit(n) {
  if (ts.isFunctionDeclaration(n) && n.name) functions[n.name.text] = n.getText(parsed);
  if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression)
      && n.expression.name.text === 'addEventListener' && ts.isIdentifier(n.expression.expression)
      && n.arguments[0]?.text === 'click' && ts.isArrowFunction(n.arguments[1])) handlers[n.expression.expression.text] = n.arguments[1].getText(parsed);
  ts.forEachChild(n, visit);
}
visit(parsed);
let eventCode, purchaseCode;
function nested(n) {
  if (ts.isArrowFunction(n)) {
    const text = n.getText(parsed);
    if (text.startsWith('() => {') && text.includes('if (!canUseControl(card)') && text.includes('engine.chooseEventOption')) eventCode = text;
    if (text.startsWith('(e) => {') && text.includes('if (!canUseControl(btn)') && text.includes('engine.purchaseUpgrade')) purchaseCode = text;
  }
  ts.forEachChild(n, nested);
}
nested(parsed);
class MockElement {
  constructor() {
    this.children = []; this.parent = null; this.attributes = {}; this.inert = false; this.textContent = ''; this.dataset = {}; this.style = { pointerEvents: '' };
    this.classes = new Set(); this.classList = { add: (...s) => s.forEach(v => this.classes.add(v)), remove: (...s) => s.forEach(v => this.classes.delete(v)), contains: s => this.classes.has(s) };
  }
  contains(el) { return !!el && (el === this || this.children.some(c => c.contains(el))); }
  attach(el) { this.children.push(el); el.parent = this; }
  focus() { if (this.owner) this.owner.activeElement = this; }
  setAttribute(k, v) { this.attributes[k] = v; }
  getAttribute(k) { return this.attributes[k] ?? null; }
  hasAttribute(k) { return k in this.attributes; }
  getClientRects() { return [{}]; }
  closest(selector) { let el = this; while (el) { if (selector === '[inert]' && el.inert || selector === '.modal-backdrop' && el.isModal) return el; el = el.parent; } return null; }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(el => el !== this); this.parent = null; }
  querySelectorAll() { return this.children.flatMap(el => [el, ...el.querySelectorAll()]).filter(el => el.isControl); }
  querySelector() { return this.querySelectorAll()[0] ?? null; }
  replaceChildren() {}
}
class MockEvent { constructor(target, type = 'click') { this.target = target; this.type = type; this.prevented = false; this.stopped = false; } preventDefault() { this.prevented = true; } stopImmediatePropagation() { this.stopped = true; } }
class MockKeyboardEvent extends MockEvent { constructor(target, key, shiftKey = false) { super(target, 'keydown'); this.key = key; this.shiftKey = shiftKey; } }
function element() { return new MockElement(); }
function fixture(scenario = 'cuenca_central', seed = 'AULA-2026-001') {
  const c = { SimulationEngine, SessionLog, currentScenario: scenario, currentSeed: seed, engine: new SimulationEngine(scenario, seed, true), tutorialModeSetting: 'disabled', activeTutorial: false,
    lastNewspaperEdition: null, openedNewspaperEdition: null, pendingNewspaperEdition: null, newspaperReplayToken: 0, callbacks: [], yearEnds: 0, finalReports: 0, cleared: 0, disconnected: 0, observed: 0,
    sound: { pop() {}, paperRustle() {} }, SEASONS_INFO, getNextSeason, sessionLog: null,
    newspaperModalObserver: { disconnect() { c.disconnected++; }, observe() { c.observed++; } },
    tutorialManager: { isActive: () => c.activeTutorial, exitTutorial() { c.activeTutorial = false; } },
    // Storage/recovery behavior is exercised by the dedicated recovery suite.
    saveRecovery() {}, scheduleRecoverySave() {}, beginFreshRecovery() {}, dismissRecoveryChoice() {},
    closeDistributionTip() {}, prepareTurnStartingDistribution() {}, updateUI() {}, recordTurnInitialAllocations() {}, closeSectorEditor() {}, playPendingUpgradeConstruction() {}, getCurrentSeasonalGoal: () => undefined,
    renderAgileSeasonFeedback(r) { c.lastNewspaperEdition = edition(r.turn); c.cardSeasonFeedback.classList.add('open'); },
    showYearEndModal() { c.yearEnds++; c.modalYearEnd.classList.add('open'); },
    showFinalReport() { c.finalReports++; c.modalFinalReport.classList.add('open'); },
    showInteractiveEventModal() { c.modalInteractiveEvent.classList.add('open'); },
    BasinScene: { instance: { clearWaterReplay() { c.cleared++; c.cardSeasonFeedback.classList.remove('water-replay-active'); }, replaySeasonWater(b, done) { c.callbacks.push(done); c.cardSeasonFeedback.classList.add('water-replay-active'); }, updateGameState() {}, setEventWeatherOverride() {} } },
    btnTutNext: {}, tutorialGuideBanner: { style: {} }, sectorUI: {}, PLAYABLE_SECTORS: sectors, __handlers: {},
  };
  for (const name of ['modalNewspaper', 'cardSeasonFeedback', 'btnNewsContinue', 'btnFbContinue', 'modalYearEnd', 'modalFinalReport', 'modalWelcome', 'modalInteractiveEvent', 'newsDate', 'newsMainHeadline', 'newsMainSubhead', 'newsPhotoEmoji', 'newsPhotoCaption', 'btnOpenNewspaper', 'fbSeasonTitle', 'fbGoalBadge', 'fbPop', 'fbAgri', 'fbHealth', 'fbMoney', 'fbAdviceText']) c[name] = element();
  for (const id of sectors) c.sectorUI[id] = { card: element(), slider: {}, btnMinus: {}, btnPlus: {} };
  const app = element();
  c.getSeasonVerdict = () => ({ kind: 'normal', label: 'Balance', message: '' });
  c.generateNewspaperEdition = r => edition(r.turn);
  c.renderSeasonWaterSummary = () => {};
  c.document = { createElement: () => element(), getElementById: () => app, querySelector: () => null, querySelectorAll: () => [c.modalNewspaper, c.modalYearEnd, c.modalFinalReport, c.modalWelcome, c.modalInteractiveEvent] };
  c.sessionLog = new SessionLog(c.engine.getState());
  const names = ['advanceRecordedTurn', 'createRecordedEngine', 'exitTutorialToYearOne', 'cancelPendingNewspaper', 'openPendingNewspaper', 'showNewspaperModal', 'closeNewspaperToSummary', 'continueResolvedSeason', 'renderAgileSeasonFeedback', 'activeInteractionSurface', 'backgroundInteractionBlocked', 'canUseControl', 'focusInteractionSurface', 'syncInteractionLock', 'guardBackgroundEvent', 'selectMapSector', 'handleMapElementClick', 'onAllocationChange'];
  const eventStart = main.indexOf('        const state = engine.getState();');
  const eventEnd = main.indexOf('        BasinScene.instance?.setEventWeatherOverride', eventStart);
  assert.ok(eventStart >= 0 && eventEnd > eventStart);
  const code = names.map(n => { assert.ok(functions[n], n); return functions[n]; }).join('\n')
    + `\n__eventChoice = opt => { ${main.slice(eventStart, eventEnd)} };`
    + Object.entries(handlers).filter(([n]) => ['btnNewsContinue', 'btnCloseNewspaper', 'btnFbContinue', 'btnYearendContinue', 'btnResolveSeason', 'btnRestart', 'btnSuggestedDist', 'btnResetDist', 'btnDistributionTip', 'btnOpenUpgrades', 'btnHelp', 'btnClassroom', 'btnYearendUpgrades', 'btnCloseUpgrades', 'btnCloseHelp', 'btnCloseClassroom'].includes(n))
      .map(([n, code]) => `\n__handlers.${n} = ${code};`).join('');
  vm.runInNewContext(ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText, c);
  c.HTMLElement = c.Node = MockElement; c.KeyboardEvent = MockKeyboardEvent;
  c.interactionPointerStyles = new WeakMap(); c.selectedSector = null;
  c.contextualCard = element(); c.toastTip = element();
  c.closeDistributionTip = () => c.toastTip.classList.remove('open');
  for (const name of ['modalUpgrades', 'modalHelp', 'modalClassroom', 'btnCloseHelp', 'btnCloseClassroom', 'btnSuggestedDist', 'btnResetDist', 'btnDistributionTip', 'btnOpenUpgrades', 'btnHelp', 'btnClassroom', 'btnYearendUpgrades', 'btnYearendContinue', 'btnRestart', 'btnCloseUpgrades', 'btnResolveSeason', 'eventButton', 'buyButton']) c[name] = element();
  const appRoot = element(); const background = element(); const map = element();
  appRoot.attach(background); appRoot.attach(map); appRoot.attach(c.contextualCard); appRoot.attach(c.toastTip);
  const modals = [c.modalInteractiveEvent, c.modalYearEnd, c.modalUpgrades, c.modalFinalReport, c.modalClassroom, c.modalHelp, c.modalWelcome, c.modalNewspaper];
  for (const modal of modals) { modal.isModal = true; appRoot.attach(modal); }
  appRoot.attach(c.cardSeasonFeedback);
  const attachControls = (parent, names) => names.forEach(name => { c[name].isControl = true; parent.attach(c[name]); });
  attachControls(background, ['btnSuggestedDist', 'btnResetDist', 'btnDistributionTip', 'btnOpenUpgrades', 'btnHelp', 'btnClassroom', 'btnResolveSeason']);
  attachControls(c.modalNewspaper, ['btnNewsContinue']); attachControls(c.cardSeasonFeedback, ['btnFbContinue']);
  attachControls(c.modalYearEnd, ['btnYearendUpgrades', 'btnYearendContinue']); attachControls(c.modalFinalReport, ['btnRestart']);
  attachControls(c.modalUpgrades, ['btnCloseUpgrades', 'buyButton']); attachControls(c.modalInteractiveEvent, ['eventButton']);
  attachControls(c.modalHelp, ['btnCloseHelp']); attachControls(c.modalClassroom, ['btnCloseClassroom']);
  const doc = { activeElement: appRoot,
    getElementById: id => id === 'app' ? appRoot : element(),
    createElement: () => element(), querySelector: () => null,
    querySelectorAll: selector => selector === '.modal-backdrop.open' ? modals.filter(m => m.classList.contains('open')) : selector === '.modal-backdrop' ? modals : []
  };
  function setOwner(el) { el.owner = doc; el.children.forEach(setOwner); } setOwner(appRoot);
  c.document = doc; c.appRoot = appRoot; c.background = background; c.map = map;
  c.inputSeed = { value: '' }; c.selectScenario = { value: '' };
  c.BasinScene.instance.input = { enabled: true };
  c.updateUI = () => c.syncInteractionLock();
  c.renderUpgradesList = () => {};
  c.upgSys = c.engine.getUpgradeSystem(); c.pendingUpgradeConstruction = new Set(); c.alert = () => {};
  c.applySuggestedDistribution = () => { c.suggestedCalls = (c.suggestedCalls ?? 0) + 1; };
  c.resetCurrentDistribution = () => { c.resetCalls = (c.resetCalls ?? 0) + 1; };
  assert.ok(eventCode && purchaseCode);
  vm.runInNewContext(ts.transpileModule(`
    __eventChoice = opt => { const card = eventButton; const event = engine.getState().activeInteractiveEvent; (${eventCode})(); };
    __buyUpgrade = e => { const btn = buyButton; (${purchaseCode})(e); };
  `, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText, c);

  return c;
}
function edition(turn) { return { editionNumber: turn, dateString: '', mainArticle: { headline: '', subhead: '', photoEmoji: '' }, secondaryArticles: [], label: '', kind: 'normal', price: '' }; }
function replay(c) {
  const data = createSessionExport(c.engine.getState(), SimulationEngine.MODEL_VERSION, c.sessionLog, 'now');
  const e = new SimulationEngine(data.metadata.scenarioId, data.metadata.seed, data.metadata.isClassroomMode);
  for (const a of data.recording.actions) {
    assert.equal(e.getState().turn, a.turn);
    if (a.type === 'allocation') for (const id of sectors) e.setSectorAllocation(id, a.values[id]);
    else if (a.type === 'event-choice') e.chooseEventOption(a.optionId);
    else if (a.type === 'resolve') e.resolveSeason();
    else if (a.type === 'advance') e.advanceToNextTurn();
    else if (a.type === 'purchase') assert.equal(e.purchaseUpgrade(a.upgradeId).success, true);
    else assert.fail(a.type);
  }
  assert.deepEqual(e.getState(), data.snapshot);
  return data;
}
function blockedActions(c) {
  const before = JSON.stringify(c.engine.getState()); const log = JSON.stringify(c.sessionLog.snapshot(c.engine.getState()));
  c.handleMapElementClick('dam'); c.selectMapSector('population'); c.onAllocationChange('population', 0);
  for (const name of ['btnSuggestedDist', 'btnResetDist', 'btnDistributionTip', 'btnOpenUpgrades', 'btnClassroom', 'btnHelp', 'btnResolveSeason']) c.__handlers[name]();
  assert.equal(JSON.stringify(c.engine.getState()), before);
  assert.equal(JSON.stringify(c.sessionLog.snapshot(c.engine.getState())), log);
  assert.equal(c.selectedSector, null);
  assert.equal(c.suggestedCalls, undefined); assert.equal(c.resetCalls, undefined);
  assert.equal(c.modalUpgrades.classList.contains('open'), false);
}
for (const scenario of ['cuenca_central', 'cuenca_arida', 'cuenca_abundante']) test(`${scenario}: real guarded handlers 20 turns, lock phases, annual purchases and exact action replay`, () => {
  const c = fixture(scenario); let events = 0, purchases = 0;
  for (let turn = 1; turn <= 20; turn++) {
    const st = c.engine.getState();
    if (st.activeInteractiveEvent) {
      c.modalInteractiveEvent.classList.add('open'); c.syncInteractionLock(); blockedActions(c);
      const opt = st.activeInteractiveEvent.options.find(o => c.engine.canChooseEventOption(o.id).allowed);
      c.__eventChoice(opt); events++;
      assert.equal(st.activeInteractiveEvent, null);
    }
    c.syncInteractionLock(); assert.equal(c.background.inert, false); assert.equal(c.BasinScene.instance.input.enabled, true);
    for (const id of sectors) c.engine.setSectorAllocation(id, Math.floor(st.sectors[id].currentDemand * .8));
    c.__handlers.btnResolveSeason(); c.__handlers.btnResolveSeason();
    c.syncInteractionLock(); assert.equal(c.background.inert, true); assert.equal(c.map.style.pointerEvents, 'none'); assert.equal(c.BasinScene.instance.input.enabled, false);
    blockedActions(c); const done = c.callbacks.at(-1); done(); done();
    c.syncInteractionLock(); assert.ok(c.modalNewspaper.classList.contains('open')); assert.equal(c.modalNewspaper.inert, false); blockedActions(c);
    c.__handlers.btnNewsContinue(); c.__handlers.btnNewsContinue(); c.syncInteractionLock();
    assert.ok(c.cardSeasonFeedback.classList.contains('open')); assert.equal(c.cardSeasonFeedback.inert, false); blockedActions(c);
    c.__handlers.btnFbContinue(); c.__handlers.btnFbContinue(); done();
    if (turn % 4 === 0) {
      c.syncInteractionLock(); assert.ok(c.modalYearEnd.classList.contains('open')); assert.equal(st.turn, turn);
      if (turn < 20) {
        c.__handlers.btnYearendUpgrades(); c.syncInteractionLock();
        assert.ok(c.modalUpgrades.classList.contains('open')); assert.equal(c.modalUpgrades.inert, false); assert.equal(c.modalYearEnd.inert, true);
        c.__handlers.btnYearendContinue(); assert.equal(st.turn, turn, 'Annual background cannot advance behind upgrades');
        c.buyButton.setAttribute('data-id', 'reparacion_red'); const level = st.upgrades.reparacion_red?.currentLevel ?? 0;
        c.__buyUpgrade({ currentTarget: c.buyButton });
        if ((st.upgrades.reparacion_red?.currentLevel ?? 0) > level) purchases++;
        replay(c); c.__handlers.btnCloseUpgrades(); c.syncInteractionLock(); assert.equal(c.modalYearEnd.inert, false);
      }
      c.__handlers.btnYearendContinue(); c.__handlers.btnYearendContinue();
    }
    replay(c);
  }
  assert.ok(events > 0); assert.ok(purchases > 0);
  const data = replay(c); assert.equal(data.recording.actions.filter(a => a.type === 'advance').length, 19); assert.equal(data.recording.actions.filter(a => a.type === 'resolve').length, 20);
  assert.equal(c.finalReports, 1); c.syncInteractionLock(); assert.equal(c.modalFinalReport.inert, false);
  c.__handlers.btnRestart(); c.callbacks.at(-1)(); c.syncInteractionLock(); assert.equal(c.engine.getState().turn, 1); assert.equal(c.background.inert, false); replay(c);
});
test('capture blocks pointer/click/input/keyboard and focuses active surface; modal controls stay enabled', () => {
  const c = fixture(); c.engine.resolveSeason(); c.syncInteractionLock();
  for (const type of ['pointerdown', 'pointermove', 'click', 'input', 'change', 'keydown']) {
    const event = new MockEvent(c.btnResetDist, type); c.guardBackgroundEvent(event); assert.ok(event.prevented && event.stopped, type);
  }
  c.modalNewspaper.classList.add('open'); c.syncInteractionLock();
  const inside = new MockEvent(c.btnNewsContinue); c.guardBackgroundEvent(inside); assert.equal(inside.stopped, false);
  c.guardBackgroundEvent(new MockEvent(c.btnHelp, 'focusin')); assert.equal(c.document.activeElement, c.btnNewsContinue);
  const tab = new MockKeyboardEvent(c.btnNewsContinue, 'Tab'); c.guardBackgroundEvent(tab); assert.ok(tab.prevented); assert.equal(c.document.activeElement, c.btnNewsContinue);
  const shift = new MockKeyboardEvent(c.btnNewsContinue, 'Tab', true); c.guardBackgroundEvent(shift); assert.ok(shift.prevented);
});
test('closed purchase modal and stale event controls cannot mutate/log; resolved replay cannot purchase', () => {
  const c = fixture(); c.buyButton.setAttribute('data-id', 'reparacion_red');
  const initial = JSON.stringify(c.engine.getState()); c.__buyUpgrade({ currentTarget: c.buyButton }); assert.equal(JSON.stringify(c.engine.getState()), initial);
  c.__handlers.btnResolveSeason(); const before = JSON.stringify(c.engine.getState()); c.__buyUpgrade({ currentTarget: c.buyButton }); assert.equal(JSON.stringify(c.engine.getState()), before);
  c.cancelPendingNewspaper(); c.callbacks.at(-1)(); c.syncInteractionLock(); assert.equal(c.background.inert, true); assert.equal(c.BasinScene.instance.input.enabled, false);
});
test('help/classroom active controls work; background cannot open another modal or modify map', () => {
  const c = fixture();
  c.__handlers.btnHelp(); c.syncInteractionLock(); assert.equal(c.modalHelp.inert, false); blockedActions(c);
  assert.equal(c.modalClassroom.classList.contains('open'), false);
  c.__handlers.btnCloseHelp(); c.syncInteractionLock(); assert.equal(c.background.inert, false);
  c.__handlers.btnClassroom(); c.syncInteractionLock(); assert.equal(c.modalClassroom.inert, false); blockedActions(c);
  c.__handlers.btnCloseClassroom(); c.syncInteractionLock(); assert.equal(c.background.inert, false);
});
test('stale closed modal controls and detached purchase doubleclick cannot reset/advance/purchase', () => {
  const c = fixture(); const original = c.engine;
  c.__handlers.btnRestart(); assert.equal(c.engine, original, 'Closed final report cannot reset');
  c.__handlers.btnYearendContinue(); assert.equal(c.engine.getState().turn, 1);
  c.modalUpgrades.classList.add('open'); c.syncInteractionLock();
  c.buyButton.setAttribute('data-id', 'reparacion_red'); c.__buyUpgrade({ currentTarget: c.buyButton });
  const before = JSON.stringify(c.engine.getState()); const log = JSON.stringify(c.sessionLog.snapshot(c.engine.getState()));
  c.buyButton.remove(); c.__buyUpgrade({ currentTarget: c.buyButton });
  assert.equal(JSON.stringify(c.engine.getState()), before); assert.equal(JSON.stringify(c.sessionLog.snapshot(c.engine.getState())), log);
  replay(c);
});
