const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');
require.extensions['.ts'] = (m,f) => m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}
}).outputText,f);
const { SimulationEngine } = require('../src/simulation/SimulationEngine.ts');
const { checkSeasonalGoal } = require('../src/models/SeasonalGoal.ts');
const { goalProgress } = require('../src/simulation/MissionSystem.ts');
const { createRecoveryPacket, replayRecovery } = require('../src/sessionRecovery.ts');
const fixtures = ['pending','resolved'].map(phase => require(`./fixtures/recovery-2.6-${phase}-mixed.json`));

test('2.7: ambas reservas requieren sólo foco y gotas, aun con antiguos pisos guardados', () => {
  const e = new SimulationEngine(), st=e.getState();
  const b={...e.previewSeason().balance, reservoirEnd:53,aquiferEnd:53,
    satisfactions:{population:0,agriculture:.8,livestock:0,mining:0,ecosystem:0}};
  for(const type of ['COVERAGE_AND_RESERVOIR','COVERAGE_AND_AQUIFER']) {
    const goal={targetCondition:{type,sectorId:'agriculture',threshold:80,reserveTarget:53,
      cityCoverageThreshold:85,riverCoverageThreshold:80,minimumProductiveCoverage:70,requireNoDeficit:true}};
    assert.equal(checkSeasonalGoal(goal,st,b),true);
    assert.equal(checkSeasonalGoal(goal,st,{...b,satisfactions:{...b.satisfactions,agriculture:.79}}),false);
    assert.equal(checkSeasonalGoal(goal,st,{...b,reservoirEnd:52,aquiferEnd:52}),false);
    assert.equal(checkSeasonalGoal(goal,st,{...b,reservoirEnd:0,aquiferEnd:0}),false);
    const progress=goalProgress(goal,b);
    assert.match(progress,/Cultivos 80\/80%/);
    assert.doesNotMatch(progress,/Ciudad|otros|río/);
  }
});

test('2.7: CITY_AND_SECTOR conserva todos sus pisos y no se confunde con reserva', () => {
  const e=new SimulationEngine(),st=e.getState(),b={...e.previewSeason().balance,
    satisfactions:{population:.85,agriculture:.8,livestock:.7,mining:.7,ecosystem:.8}};
  const goal={targetCondition:{type:'CITY_AND_SECTOR',sectorId:'agriculture',threshold:80,
    cityCoverageThreshold:85,riverCoverageThreshold:80,minimumProductiveCoverage:70}};
  assert.equal(checkSeasonalGoal(goal,st,b),true);
  for(const [id,rate] of [['population',.84],['agriculture',.79],['livestock',.69],['mining',.69],['ecosystem',.79]])
    assert.equal(checkSeasonalGoal(goal,st,{...b,satisfactions:{...b.satisfactions,[id]:rate}}),false);
});

test('2.7: generación conserva targets y azar 2.6, con descripción y condiciones de sólo foco/reserva', () => {
  for(const seed of ['AULA-2026-001','AULA-2026-260']) {
    const old=new SimulationEngine('cuenca_central',seed,true,'contextual-v1');
    const fresh=new SimulationEngine('cuenca_central',seed,true);
    for(const e of [old,fresh]) {e.resolveSeason();e.advanceToNextTurn();}
    const a=old.getCurrentSeasonalGoal(),b=fresh.getCurrentSeasonalGoal();
    assert.equal(b.targetCondition.type,a.targetCondition.type);
    assert.equal(b.targetCondition.reserveTarget,a.targetCondition.reserveTarget);
    assert.equal(b.targetCondition.sectorId,a.targetCondition.sectorId);
    assert.deepEqual(old.rng,fresh.rng);
    assert.deepEqual(old.eventSys.rng,fresh.eventSys.rng);
    assert.deepEqual(old.climateSys,fresh.climateSys);
    assert.doesNotMatch(b.description,/Ciudad|otros|río/);
    for(const field of ['cityCoverageThreshold','minimumProductiveCoverage','riverCoverageThreshold'])
      assert.equal(Object.hasOwn(b.targetCondition,field),false);
  }
});

test('Fixtures anteriores 2.6 se verifican exactos; migración pendiente conserva meta e historia y no duplica dinero', () => {
  for(const packet of fixtures) {
    const recovered=replayRecovery(packet);
    assert.ok(recovered.ok,recovered.reason);
    assert.deepEqual(recovered.engine.getState(),packet.session.snapshot);
    assert.equal(recovered.engine.getModelVersion(),'2.6');
  }
  const saved=replayRecovery(fixtures[0]), e=saved.engine,st=e.getState();
  const original=structuredClone(st), rng=JSON.stringify([e.rng,e.eventSys.rng,e.climateSys]);
  assert.equal(checkSeasonalGoal(e.getCurrentSeasonalGoal(),st,e.previewSeason().balance),false);
  saved.log.captureAllocations(st);
  assert.equal(e.upgradeGoalRules(),true);
  saved.log.record({type:'upgrade-goal-rules',turn:st.turn});
  assert.deepEqual(st,{...original,goalRulesVersion:'contextual-v2'});
  assert.equal(JSON.stringify([e.rng,e.eventSys.rng,e.climateSys]),rng);
  assert.equal(checkSeasonalGoal(e.getCurrentSeasonalGoal(),st,e.previewSeason().balance),true);
  const migrated=createRecoveryPacket(st,saved.log,'2026-10-10T00:00:00Z');
  assert.equal(migrated.session.modelVersion,'2.7');
  assert.equal(migrated.session.recording.initialState.goalRulesVersion,'contextual-v1');
  const replay=replayRecovery(migrated);
  assert.ok(replay.ok,replay.reason); assert.deepEqual(replay.engine.getState(),st);
  saved.log.captureAllocations(st);
  const before=st.money,result=e.resolveSeason();saved.log.record({type:'resolve',turn:st.turn});
  assert.equal(result.goalAchieved,true);
  assert.equal(st.money,before+e.getCurrentSeasonalGoal().reward.moneyBonus);
  e.resolveSeason();assert.equal(st.money,before+e.getCurrentSeasonalGoal().reward.moneyBonus);
  const after=replayRecovery(createRecoveryPacket(st,saved.log,'2026-10-10T00:00:00Z'));
  assert.ok(after.ok,after.reason);assert.deepEqual(after.engine.getState(),st);
});

test('Migración al avanzar una estación resuelta no reinterpreta historia ni acredita su misión fallida', () => {
  const saved=replayRecovery(fixtures[1]),e=saved.engine,st=e.getState();
  assert.equal(st.seasonHistory.at(-1).goalAchieved,false);
  const history=structuredClone(st.seasonHistory),money=st.money,goal=structuredClone(e.getCurrentSeasonalGoal());
  assert.equal(e.upgradeGoalRules(),true);saved.log.record({type:'upgrade-goal-rules',turn:st.turn});
  assert.deepEqual(st.seasonHistory,history);assert.equal(st.money,money);
  assert.deepEqual(e.getCurrentSeasonalGoal(),goal);
  e.advanceToNextTurn();saved.log.record({type:'advance',turn:2});
  assert.equal(st.turn,3);assert.deepEqual(st.seasonHistory,history);
  assert.equal(st.goalRulesVersion,'contextual-v2');
  const replay=replayRecovery(createRecoveryPacket(st,saved.log,'2026-10-10T00:00:00Z'));
  assert.ok(replay.ok,replay.reason);assert.deepEqual(replay.engine.getState(),st);
  const duplicated=createRecoveryPacket(st,saved.log,'2026-10-10T00:00:00Z');
  duplicated.session.recording.actions.push({type:'upgrade-goal-rules',turn:3});
  assert.equal(replayRecovery(duplicated).ok,false);
});

test('Presentación de metas guardadas muestra sólo foco/reserva y oculta detalles sin alterar la meta', () => {
  const source=fs.readFileSync(require.resolve('../src/main.ts'),'utf8');
  const ast=ts.createSourceFile('main.ts',source,ts.ScriptTarget.Latest,true);
  const names=['contextualGoalLines','readableGoalProgress','updateSeasonalGoalDisplay'];
  const selected=ast.statements.filter(node=>names.includes(node.name?.text)
    || (ts.isVariableStatement(node)&&node.declarationList.declarations.some(d=>d.name.getText(ast)==='goalSectorNames')));
  assert.equal(selected.length,4);
  const code=ts.transpileModule(selected.map(node=>node.getText(ast)).join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
  let rules='contextual-v2';
  const goal={id:'saved-goal',title:'Granja y reserva',description:'Ciudad ≥85% · Granja ≥80% · otros ≥70% · río ≥80%.',hint:'Meta fija',reward:{moneyBonus:10},
    targetCondition:{type:'COVERAGE_AND_RESERVOIR',sectorId:'livestock',threshold:80,reserveTarget:53,cityCoverageThreshold:85,minimumProductiveCoverage:70,riverCoverageThreshold:80}};
  const balance={satisfactions:{population:0,agriculture:0,livestock:.71,mining:0,ecosystem:0},reservoirEnd:55,aquiferEnd:60};
  const before=JSON.stringify(goal),summary={textContent:''};
  const scope={engine:{getState:()=>({turn:2,goalRulesVersion:rules,isSeasonResolved:false}),previewSeason:()=>({balance})},
    getCurrentSeasonalGoal:()=>goal,isFirstWinterDecision:()=>false,
    document:{getElementById:()=>({classList:{contains:()=>false}}),createElement:()=>({textContent:''})},
    seasonalGoalBanner:{style:{}},goalTitle:{},goalDetails:{hidden:false,dataset:{},querySelector:()=>summary},
    goalDesc:{},goalRequirements:{children:[],replaceChildren(){this.children=[];},appendChild(node){this.children.push(node);}},goalRewardBadge:{}};
  vm.createContext(scope);vm.runInContext(code,scope);
  for(const type of ['COVERAGE_AND_RESERVOIR','COVERAGE_AND_AQUIFER']) {
    goal.targetCondition.type=type;
    scope.updateSeasonalGoalDisplay();
    assert.equal(scope.goalDetails.hidden,true);
    assert.equal(scope.goalRequirements.children.length,0);
    assert.match(scope.goalDesc.textContent,/Granja: al menos 80%/);
    assert.match(scope.goalDesc.textContent,/53 gotas/);
    assert.doesNotMatch(scope.goalDesc.textContent,/Ciudad|Cultivos|Mina|Río|Todas las metas/);
    assert.equal(scope.readableGoalProgress(goal,balance),'Faltó: Granja 71% (meta: 80%)');
  }
  goal.targetCondition.type='COVERAGE_AND_RESERVOIR';assert.equal(JSON.stringify(goal),before);
  rules='contextual-v1';scope.updateSeasonalGoalDisplay();
  assert.equal(scope.goalDetails.hidden,false);
  assert.match(scope.readableGoalProgress(goal,balance),/Ciudad 0%.*Granja 71%.*Cultivos 0%.*Mina 0%.*Río 0%/);
  rules='contextual-v2';goal.targetCondition.type='CITY_AND_SECTOR';scope.updateSeasonalGoalDisplay();
  assert.equal(scope.goalDetails.hidden,false);
  assert.match(scope.readableGoalProgress(goal,balance),/Ciudad 0%.*Río 0%/);
});
