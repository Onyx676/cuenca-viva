const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText, filename);
const { evaluateFinalHistory } = require('../src/game/FinalEvaluation.ts');
const { SimulationEngine } = require('../src/simulation/SimulationEngine.ts');
const { SeededRandom } = require('../src/simulation/RandomSystem.ts');
const clone = value => JSON.parse(JSON.stringify(value));
function freeze(value) { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; }
function record(turn, rates = {}, extra = {}) {
  const satisfaction = { population: 1, agriculture: 1, livestock: 1, mining: 1, ecosystem: 1, reserve: 1, ...rates };
  const amounts = { population: 10, agriculture: 10, livestock: 10, mining: 10, ecosystem: 0, reserve: 0 };
  return { turn, events: [], balance: { satisfactions: satisfaction, allocations: amounts, suppliedAllocations: { ...amounts },
    waterQuality: 80, reservoirStart: 50, reservoirEnd: 50, aquiferStart: 70, aquiferEnd: 70,
    aquiferNaturalRecharge: 5, aquiferArtificialRecharge: 1, aquiferWithdrawal: 6, ...extra } };
}
test('No records and preserved histories without river recharge remain explicit and finite', () => {
  const empty = evaluateFinalHistory({ seasonHistory: [] });
  assert.match(empty.title, /Sin registros/); assert.equal(empty.aquifer.initial, null); assert.deepEqual(empty.quiz, []);
  const old = evaluateFinalHistory({ seasonHistory: [record(1)] });
  assert.equal(old.recharge.river, 0); assert.equal(old.river.qualityMean, 80);
});
test('Sector means never hide zero coverage, and runs describe consecutive unmet demand', () => {
  const result = evaluateFinalHistory({ seasonHistory: [record(1, { mining: 0 }), record(2, { mining: .5 }), record(3), record(4, { mining: .5 })] });
  const mine = result.coverage.find(row => row.id === 'mining');
  assert.equal(mine.worst, 0); assert.equal(mine.mean, .5); assert.equal(mine.incompleteRun, 2); assert.equal(mine.zeroTurns, 1);
  assert.equal(result.zeroTurns, 1); assert.match(result.title, /sin abastecer/);
  assert.match(result.quiz[0].explanation, /3 estaciones/);
});
test('Initial event correction, opposing exceptional adjustments and capacity expansion do not invent losses', () => {
  const first = record(1, {}, { reservoirStart: 55, reservoirEnd: 52, aquiferStart: 70, aquiferEnd: 70 });
  first.events = [{ waterAdjustment: { reservoirChange: 10, aquiferChange: 0 } }, { waterAdjustment: { reservoirChange: -5, aquiferChange: 0 } }];
  const state = freeze({ reservoirCapacity: 1000, seasonHistory: [first] });
  const result = evaluateFinalHistory(state);
  assert.equal(result.reservoir.initial, 50); assert.equal(result.reservoir.change, 2);
  assert.equal(result.reservoir.eventAdded, 10); assert.equal(result.reservoir.eventRemoved, 5); assert.equal(result.reservesFell, false);
  assert.equal(evaluateFinalHistory({ ...state, reservoirCapacity: 100 }).reservesFell, false);
});
test('River quantity and quality are separate; no extra wetland allocation can still reach reference', () => {
  const result = evaluateFinalHistory({ seasonHistory: [record(1, {}, { waterQuality: 30 }), record(2, { ecosystem: 0 }, { waterQuality: 90 })] });
  assert.equal(result.river.referenceTurns, 1); assert.equal(result.river.qualityMean, 60); assert.equal(result.river.qualityWorst, 30);
  assert.equal(result.river.qualityClose, 90); assert.equal(result.river.belowReferenceRun, 1);
  assert.match(result.quiz[1].explanation, /estación 1/); assert.deepEqual(result.quiz.map(row => row.correct), [1, 2, 0]);
  assert.match(result.quiz[2].options[result.quiz[2].correct], /abastecimiento, caudal y calidad/);
});
test('Full coverage can explicitly coexist with declining reserves', () => {
  const result = evaluateFinalHistory({ seasonHistory: [record(1, {}, { aquiferEnd: 50 })] });
  assert.match(result.title, /completo con reservas en descenso/); assert.equal(result.aquifer.change, -20);
});
test('Three real 20-turn campaigns stay deterministic and evaluation never changes engine or PRNG', () => {
  for (const policy of ['zero', 'full-with-works', 'random']) {
    const campaign = () => {
      const engine = new SimulationEngine('cuenca_central', 'AULA-2026-001', true);
      const policyRng = new SeededRandom('EVALUATION-POLICY');
      for (let turn = 1; turn <= 20; turn++) {
        const state = engine.getState();
        while (state.activeInteractiveEvent) {
          const option = state.activeInteractiveEvent.options.find(row => engine.canChooseEventOption(row.id).allowed);
          assert.ok(option); engine.chooseEventOption(option.id);
        }
        if (policy === 'full-with-works') for (const id of ['riego_eficiente', 'reparacion_red', 'recirculacion_minera']) engine.purchaseUpgrade(id);
        for (const id of ['population', 'agriculture', 'livestock', 'mining', 'ecosystem']) engine.setSectorAllocation(id,
          policy === 'zero' ? 0 : Math.round(state.sectors[id].currentDemand * (policy === 'random' ? policyRng.next() : 1)));
        const resolved = engine.resolveSeason(); assert.equal(resolved.balance.massBalanceError, 0);
        const before = JSON.stringify(engine); const evaluated = evaluateFinalHistory(freeze(clone(state)));
        assert.equal(JSON.stringify(engine), before); assert.equal(evaluated.count, turn);
        if (turn < 20) engine.advanceToNextTurn();
      }
      return clone(engine.getState().seasonHistory);
    };
    assert.deepEqual(campaign(), campaign());
  }
});
test('Saved/printed document opens explanations on its clone without changing live quiz or details', () => {
  const source = fs.readFileSync(require.resolve('../src/main.ts'), 'utf8');
  const ast = ts.createSourceFile('main.ts', source, ts.ScriptTarget.Latest, true);
  const node = ast.statements.find(item => ts.isFunctionDeclaration(item) && item.name?.text === 'learningReportHTML');
  const code = ts.transpileModule(node.getText(ast), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const liveDetail = { open: false }, liveAnswer = { hidden: true };
  const copiedDetail = { ...liveDetail }, copiedAnswer = { ...liveAnswer };
  let removed = false;
  const copy = { innerHTML: '<p>results</p>', querySelector: () => ({ remove: () => { removed = true; } }),
    querySelectorAll: selector => selector === 'details' ? [copiedDetail] : [copiedAnswer] };
  const report = new Function('modalFinalReport', 'engine', 'createLearningReport', `${code}; return learningReportHTML();`)(
    { querySelector: () => ({ cloneNode: () => copy }) }, { getState: () => ({}) }, (_state, html) => html);
  assert.equal(report, copy.innerHTML); assert.equal(removed, true); assert.equal(copiedDetail.open, true); assert.equal(copiedAnswer.hidden, false);
  assert.equal(liveDetail.open, false); assert.equal(liveAnswer.hidden, true);
});
