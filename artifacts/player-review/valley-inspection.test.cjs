const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const source = ts.createSourceFile('main.ts', fs.readFileSync(root + '/src/main.ts', 'utf8'), ts.ScriptTarget.Latest, true);
const statements = source.statements.filter(s => ts.isExpressionStatement(s) && /^(btnViewValley|btnReturnSummary|btnToggleValleyResults)\.addEventListener/.test(s.getText(source))).map(s => s.getText(source));
const guards = source.statements.filter(s => ts.isFunctionDeclaration(s) && ['activeInteractionSurface', 'backgroundInteractionBlocked', 'canUseControl', 'showValleyInspection', 'openSeasonSummary', 'closeNewspaperToSummary'].includes(s.name?.text)).map(s => s.getText(source));
assert.equal(statements.length, 3);
function fixture() {
  const names = new Set(['open']); const appClasses = new Set(); const handlers = {};
  const state = { isSeasonResolved: true, turn: 3, money: 42 };
  const c = { engine: { getState: () => state }, canUseControl: () => true,
    btnViewValley: { closest: () => null, addEventListener: (_, fn) => handlers.view = fn },
    btnReturnSummary: { hidden: true, closest: () => null, contains: item => item === c.btnReturnSummary, focus() {}, addEventListener: (_, fn) => handlers.back = fn },
    btnResolveSeason: { hidden: false },
    cardSeasonFeedback: { inert: false, contains: item => item === c.btnViewValley, classList: { contains: n => names.has(n), add: n => names.add(n), remove: n => names.delete(n) } },
    valleyResults: { cards: [], replaceChildren() { this.cards = []; }, appendChild(card) { this.cards.push(card); }, querySelectorAll() { return this.cards; } },
    valleyResultsPanel: { hidden: true },
    valleyInspectionControls: { hidden: true, contains: item => [c.btnReturnSummary, c.btnToggleValleyResults, ...c.valleyResults.cards].includes(item) },
    btnToggleValleyResults: { closest: () => null, addEventListener: (_, fn) => handlers.toggle = fn },
    app: { classList: { contains: n => appClasses.has(n), add: n => appClasses.add(n), remove: n => appClasses.delete(n) } },
    goalDetails: { open: true }, seasonalGoalBanner: { style: { display: 'flex' } },
    document: { getElementById: () => c.app, querySelectorAll: () => [], createElement: () => ({ dataset: {}, append() {} }) },
    positionValleyResultCards() {},
    tutorialManager: { isActive: () => false }, cancelPendingNewspaper() {}, revealBudget() {},
    modalNewspaper: { classList: { contains: () => true, remove() {} } },
    lastNewspaperEdition: { editionNumber: 3 },
    requestAnimationFrame: fn => fn(),
    btnFbContinue: { closest: () => null, focus() {} }, BasinScene: { instance: {
      replayResultReactions() { c.replays++; },
      getResultReactionCards() { return ['Ciudad', 'Cultivos', 'Granja', 'Mina', 'Río'].map(title => ({ title, text: 'Resultado' })); }
    } }, replays: 0 };
  c.openedNewspaperEdition = c.lastNewspaperEdition;
  vm.runInNewContext(ts.transpileModule(guards.join('\n') + '\n' + statements.join('\n'), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, c);
  return { c, handlers, state };
}
test('Inspect valley and return to summary preserve the resolved result and permit no duplicate activation', () => {
  const { c, handlers, state } = fixture(); const before = JSON.stringify(state);
  handlers.view(); assert.equal(c.replays, 1); assert.equal(c.cardSeasonFeedback.inert, true); assert.equal(c.btnReturnSummary.hidden, false);
  assert.equal(c.btnResolveSeason.hidden, true);
  assert.equal(c.valleyResults.cards.length, 5);
  assert.equal(c.valleyResults.cards.every(card => card.open), true);
  assert.equal(c.valleyResultsPanel.hidden, false);
  assert.equal(c.app.classList.contains('valley-inspection-active'), true);
  assert.equal(c.goalDetails.open, false);
  assert.equal(c.seasonalGoalBanner.style.display, 'none');
  handlers.toggle(); assert.equal(c.valleyResults.cards.every(card => !card.open), true);
  assert.equal(c.btnToggleValleyResults.textContent, 'Expandir todos');
  handlers.toggle(); assert.equal(c.valleyResults.cards.every(card => card.open), true);
  handlers.view(); assert.equal(c.replays, 1);
  handlers.back(); assert.equal(c.cardSeasonFeedback.classList.contains('open'), true); assert.equal(c.cardSeasonFeedback.inert, false);
  assert.equal(c.app.classList.contains('valley-inspection-active'), false);
  assert.equal(c.btnReturnSummary.hidden, true); assert.equal(JSON.stringify(state), before);
  assert.equal(c.valleyInspectionControls.hidden, true);
  assert.equal(c.btnResolveSeason.hidden, false);
});

test('Heraldo lleva al valle con cinco carteles; el resumen se abre después, sin avanzar', () => {
  const { c, handlers, state } = fixture();
  const before = JSON.stringify(state);
  c.closeNewspaperToSummary();
  assert.equal(c.cardSeasonFeedback.classList.contains('open'), false);
  assert.equal(c.valleyResults.cards.length, 5);
  assert.equal(c.valleyResultsPanel.hidden, false);
  handlers.back();
  assert.equal(c.cardSeasonFeedback.classList.contains('open'), true);
  assert.equal(JSON.stringify(state), before);
});
test('Modal locks and unfinished seasons prevent inspection/return handlers', () => {
  const { c, handlers, state } = fixture(); c.canUseControl = () => false;
  handlers.view(); handlers.back(); assert.equal(c.replays, 0);
  c.canUseControl = () => true; state.isSeasonResolved = false;
  handlers.view(); handlers.back(); assert.equal(c.replays, 0); assert.equal(c.btnReturnSummary.hidden, true);
});
