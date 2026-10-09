const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const parsed = ts.createSourceFile('main.ts', fs.readFileSync(path.resolve(__dirname, '../src/main.ts'), 'utf8'), ts.ScriptTarget.Latest, true);
const helpers = parsed.statements.filter(n => ts.isFunctionDeclaration(n) && ['visibleBudget', 'renderBudget', 'revealBudget'].includes(n.name?.text)).map(n => n.getText(parsed)).join('\n');
function fixture(reducedMotion = true) {
  const state = { money: 250, turn: 4 };
  const receipt = { hidden: true, textContent: '', setAttribute() {} };
  const engine = { getState: () => state };
  const pending = { season: 10, annual: 120 };
  let coins = 0;
  const frames = [];
  const context = { engine, budgetPresentations: new WeakMap([[engine, pending]]), budgetAnimation: undefined,
    statMoney: {}, btnUpgradesMoney: {}, fbBudgetReceipt: receipt,
    yearendBreakdown: { querySelector: () => receipt }, sound: { coin() { coins++; } },
    window: { matchMedia: () => ({ matches: reducedMotion }) }, performance: { now: () => 0 },
    requestAnimationFrame: fn => { frames.push(fn); return frames.length; }, cancelAnimationFrame() {} };
  vm.runInNewContext(ts.transpileModule(helpers, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText, context);
  return { context, state, pending, frames, coins: () => coins };
}
test('Créditos reales quedan ocultos antes del resumen; desafío y cierre se revelan una sola vez', () => {
  const f = fixture(); const { context: c, state } = f;
  assert.equal(c.visibleBudget(), 120); assert.equal(state.money, 250);
  c.revealBudget('season'); assert.equal(c.statMoney.textContent, '$130'); assert.equal(f.coins(), 1);
  c.revealBudget('season'); assert.equal(f.coins(), 1); assert.equal(c.visibleBudget(), 130);
  c.revealBudget('annual'); assert.equal(c.statMoney.textContent, '$250'); assert.equal(f.coins(), 2);
  c.revealBudget('annual'); assert.equal(f.coins(), 2); assert.equal(state.money, 250);
});
test('Cambiar turno o comprar mientras cuenta cancela el contador sin sobrescribir presupuesto real', () => {
  for (const action of ['advance', 'purchase']) {
    const f = fixture(false); const { context: c, state, frames } = f;
    c.revealBudget('season'); frames.shift()(400);
    assert.ok(Number(c.statMoney.textContent.slice(1)) > 120);
    if (action === 'advance') state.turn++;
    else state.money -= 20;
    frames.shift()(850);
    assert.equal(c.statMoney.textContent, `$${c.visibleBudget()}`);
    assert.equal(c.budgetAnimation, undefined); assert.equal(f.coins(), 1);
  }
});
test('Motor nuevo o recuperación sin créditos pendientes no repite sonido ni genera dinero', () => {
  const f = fixture(); const { context: c } = f;
  c.engine = { getState: () => ({ money: 77, turn: 4 }) };
  c.revealBudget('season'); c.revealBudget('annual');
  assert.equal(c.visibleBudget(), 77); assert.equal(f.coins(), 0);
});

