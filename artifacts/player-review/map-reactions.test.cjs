const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText, filename);
const { getMapResultStory } = require('../../src/game/MapResultStories.ts');
const filename = require('node:path').resolve('src/game/BasinScene.ts');
const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true }
}).outputText;
let blocked = false;
let reducedMotion = true;
const moduleObject = { exports: {} };
vm.runInNewContext(output, {
  module: moduleObject, exports: moduleObject.exports,
  require: name => name === 'phaser' ? { Scene: class {} } : name.endsWith('upgrades.json') ? [] : name === './MapResultStories' ? { getMapResultStory } : (() => { throw new Error(name); })(),
  document: { querySelector: () => blocked ? {} : null }, window: { matchMedia: () => ({ matches: reducedMotion }) }
}, { filename });
const { BasinScene } = moduleObject.exports;

test('Mapa: escenas aprobadas por sector y cobertura, estables y sin frases de éxito ante faltante', () => {
  for (const sector of ['population', 'agriculture', 'livestock', 'mining', 'ecosystem']) {
    for (const rate of [1, .9, .6, .2]) {
      const texts = new Set(), variants = new Set();
      for (let turn = 1; turn <= 15; turn++) {
        const story = getMapResultStory(sector, rate, undefined, turn, 'MISMA-CUENCA');
        assert.deepEqual(getMapResultStory(sector, rate, undefined, turn, 'MISMA-CUENCA'), story);
        if (rate < 1) assert.doesNotMatch(story.text, /Alcanzó el agua|Hoy no me puedo quejar|Las vacas tienen agua/);
        texts.add(story.text); variants.add(story.variant);
      }
      assert.ok(texts.size >= 1);
      assert.ok([...variants].every(value => value >= 0 && value <= 2));
    }
  }
  for (const rate of [1, .6]) for (let turn = 1; turn <= 15; turn++) {
    const scenes = ['population', 'agriculture', 'livestock', 'mining', 'ecosystem'].map(sector =>
      getMapResultStory(sector, rate, undefined, turn, 'MISMA-CUENCA').text);
    assert.equal(new Set(scenes).size, 5, 'No repetir el mismo chiste entre sectores');
  }
});

test('Mapa: reacciones usan resultado real, no preview, y sobreviven avance sin mutar estado', () => {
  const scene = new BasinScene();
  const state = { turn: 3, sectors: Object.fromEntries([
    ['population', .95], ['agriculture', .7], ['livestock', .4], ['mining', .9], ['ecosystem', 1]
  ].map(([id, satisfactionRate]) => [id, { satisfactionRate }])) };
  const before = JSON.stringify(state);
  scene.decisionPreview = { satisfactions: { livestock: 1 } };
  scene.prepareResultReactions(state);
  assert.equal(JSON.stringify(state), before);
  assert.equal(scene.resultReactions.length, 2);
  assert.equal(scene.resultReactions[0].sector, 'livestock');
  assert.match(scene.resultReactions[0].text, /Resultado T3.*Granja 40%.*\n.*reclamo/);
  assert.match(scene.resultReactions[1].text, /Caudal del río 100%/);
  state.sectors.livestock.satisfactionRate = 1;
  state.turn = 4;
  assert.match(scene.resultReactions[0].text, /Resultado T3.*40%/);
});

test('Mapa: burbuja única, reloj pausado en replay/modales, termina y no crece por frame', () => {
  const scene = new BasinScene();
  scene.gameState = { isSeasonResolved: true };
  let created = 0;
  const label = { width: 180, height: 64, visible: false,
    setDepth() { return this; }, setOrigin() { return this; },
    setText(text) { this.text = text; return this; },
    setVisible(value) { this.visible = value; return this; },
    setPosition(x, y) { this.x = x; this.y = y; return this; }
  };
  scene.add = { text: () => { created++; return label; } };
  scene.getMapAnchor = () => ({ x: 170, y: 300 });
  scene.getIntakeAnchor = () => ({ x: 246, y: 300 });
  scene.getMapLayout = () => ({ width: 390, height: 500, top: 80 });
  scene.resultReactions = [{ sector: 'livestock', text: 'Resultado T3 · Granja 40%' }];
  scene.reactionVisibleMs = 0;
  blocked = true;
  scene.updateResultReaction(30);
  assert.equal(created, 0);
  assert.equal(scene.reactionVisibleMs, 0);
  blocked = false;
  scene.updateResultReaction(30);
  assert.equal(created, 1);
  assert.equal(label.visible, true);
  assert.ok(label.x >= 8 && label.x + label.width <= 390 - 8);
  assert.ok(label.x + label.width < 246 - 20, 'En compacto queda fuera de la compuerta');
  scene.getMapAnchor = () => ({ x: 1056 * .54, y: 190 });
  scene.getIntakeAnchor = () => ({ x: 1056 * .63, y: 190 });
  scene.getMapLayout = () => ({ width: 1056, height: 650, top: 0 });
  scene.updateResultReaction(0);
  assert.ok(label.x > 1056 * .63 + 35, 'A la derecha de la toma, sin tapar compuerta');
  assert.ok(label.x + label.width <= 1056 - 8);
  scene.waterReplay = {};
  scene.updateResultReaction(30);
  assert.equal(label.visible, false);
  assert.equal(scene.reactionVisibleMs, 30);
  scene.waterReplay = undefined;
  scene.reactionVisibleMs = 9000;
  scene.updateResultReaction(30);
  assert.equal(label.visible, false);
  assert.equal(created, 1);
});

test('Mapa: avanzar oculta el cartel inmediatamente y no reaparece al planificar o recuperar', () => {
  const scene = new BasinScene();
  const label = { visible: true, setVisible(value) { this.visible = value; return this; } };
  scene.reactionText = label;
  scene.reactionTurn = 3;
  scene.reactionVisibleMs = 50;
  scene.resultReactions = [{ sector: 'livestock', text: 'Resultado T3' }];
  scene.resolvedCoverage = { livestock: .4 };
  scene.clearWaterReplay = () => {};
  const planning = { turn: 4, isSeasonResolved: false, seasonHistory: [{ turn: 3 }] };
  const before = JSON.stringify(planning);
  blocked = false;
  scene.updateGameState(planning);
  assert.equal(label.visible, false, 'No espera al siguiente frame ni al temporizador');
  for (let frame = 0; frame < 100; frame++) scene.updateResultReaction(16);
  assert.equal(label.visible, false);
  assert.equal(scene.reactionVisibleMs, 50);
  assert.equal(scene.resolvedCoverage.livestock, .4, 'Las escenas del último reparto se conservan');
  scene.replayResultReactions();
  scene.updateResultReaction(16);
  assert.equal(label.visible, false, 'Reiniciar el reloj tampoco abre carteles durante planificación');
  assert.equal(JSON.stringify(planning), before);
});

test('Mapa: reanudar planificación usa el resultado registrado, no la previsión ni asignación nueva', () => {
  const scene = new BasinScene();
  const satisfactions = { population: 1, agriculture: .7, livestock: .3, mining: .9, ecosystem: .95 };
  const state = { turn: 4, isSeasonResolved: false, waterQuality: 90, basinHealth: 100,
    sectors: Object.fromEntries(Object.keys(satisfactions).map(id => [id, { satisfactionRate: 1 }])),
    seasonHistory: [{ turn: 3, balance: { satisfactions, waterQuality: 40, basinHealth: 50 } }]
  };
  const before = JSON.stringify(state);
  scene.prepareResultReactions(state);
  assert.equal(JSON.stringify(state), before);
  assert.equal(scene.reactionTurn, 3);
  assert.equal(scene.resolvedCoverage.livestock, .3);
  assert.equal(scene.resolvedRiverHealthy, false, 'Caudal cubierto no implica calidad ni salud adecuadas');
  state.seasonHistory[0].balance.satisfactions.livestock = 1;
  assert.equal(scene.resolvedCoverage.livestock, .3, 'La escena conserva una copia del resultado');
  scene.reactionVisibleMs = 18000;
  scene.replayResultReactions();
  assert.equal(scene.reactionVisibleMs, 18000);
  const cards = scene.getResultReactionCards();
  assert.equal(cards.length, 5);
  assert.match(cards.find(card => card.sector === 'livestock').title, /30%/);
  cards[0].text = 'Cambio local';
  assert.notEqual(scene.getResultReactionCards()[0].text, 'Cambio local');
  assert.equal(scene.reactionTurn, 3);
  assert.match(scene.resultReactions[0].text, /Resultado T3.*30%/);
});

test('Mapa: escenas persistentes de los cinco sectores, ocultas en modal y sin objetos por frame', () => {
  const scene = new BasinScene();
  const calls = [];
  let graphicsCount = 0, textCount = 0;
  const graphics = new Proxy({}, { get: (_, name) => (...args) => { calls.push([name, ...args]); return graphics; } });
  const label = { visible: false, setDepth() { return this; }, setText(text) { this.text = text; return this; },
    setPosition() { return this; }, setVisible(value) { this.visible = value; return this; } };
  scene.add = { graphics: () => { graphicsCount++; return graphics; }, text: () => { textCount++; return label; } };
  scene.getMapLayout = () => ({ width: 390, height: 500, top: 80 });
  scene.getMapAnchor = () => ({ x: 200, y: 300 });
  scene.resolvedCoverage = { population: 1, agriculture: .9, livestock: .3, mining: .6, ecosystem: 1 };
  scene.reactionTurn = 3;
  blocked = false;
  scene.drawResultActivity();
  assert.equal(calls.filter(([name]) => name === 'fillEllipse').length, 5);
  assert.equal(label.text, 'Reacciones al último reparto · T3');
  assert.equal(label.visible, true);
  const firstDraw = JSON.stringify(calls.filter(([name]) => name !== 'setDepth'));
  calls.length = 0;
  scene.reactionVisibleMs = 20000;
  scene.drawResultActivity();
  assert.equal(JSON.stringify(calls), firstDraw, 'El dibujo persiste después de la burbuja y no depende del reloj');
  assert.equal(graphicsCount, 1);
  assert.equal(textCount, 1);
  scene.gameState = { isSeasonResolved: true };
  reducedMotion = false;
  calls.length = 0; scene.animTimer = 0; scene.drawResultActivity();
  const standing = JSON.stringify(calls);
  calls.length = 0; scene.animTimer = .5; scene.drawResultActivity();
  assert.notEqual(JSON.stringify(calls), standing, 'Los gestos cambian con el reloj visual');
  reducedMotion = true;
  calls.length = 0; scene.drawResultActivity();
  const reduced = JSON.stringify(calls);
  calls.length = 0; scene.animTimer = 1.5; scene.drawResultActivity();
  assert.equal(JSON.stringify(calls), reduced, 'Movimiento reducido conserva la escena estática');
  assert.equal(graphicsCount, 1); assert.equal(textCount, 1);
  blocked = true;
  calls.length = 0;
  scene.drawResultActivity();
  assert.deepEqual(calls, [['clear']]);
  assert.equal(label.visible, false);
  blocked = false;
  scene.drawResultActivity();
  assert.equal(label.visible, true);
  scene.resolvedCoverage = undefined;
  scene.drawResultActivity();
  assert.equal(label.visible, false, 'Nueva partida no hereda el resultado anterior');
});
