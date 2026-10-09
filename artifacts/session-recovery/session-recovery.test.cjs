const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const root=process.env.SESSION_RECOVERY_USE_ROOT==='1'?path.resolve(__dirname,'../..'):path.join(__dirname,'verification');
const {SimulationEngine}=require(`${root}/src/simulation/SimulationEngine.ts`);
const {SessionLog}=require(`${root}/src/sessionExport.ts`);
const {createRecoveryPacket,replayRecovery,readRecovery,writeRecovery,RECOVERY_KEY,RECOVERY_BACKUP_KEY}=require(`${root}/src/sessionRecovery.ts`);
const {SEASONS_INFO}=require(`${root}/src/models/Season.ts`);
const tutorialData=require(`${root}/src/data/tutorial.json`);
const main=fs.readFileSync(`${root}/src/main.ts`,'utf8').replaceAll('\r\n','\n');
const syntax=ts.createSourceFile('main.ts',main,ts.ScriptTarget.ES2022,true);
const sectors=['population','agriculture','livestock','mining','ecosystem'];
function declaration(name){const node=syntax.statements.find(n=>ts.isFunctionDeclaration(n)&&n.name?.text===name);assert.ok(node,name);return node.getText(syntax);}
function callback(owner){let found;function visit(node){if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&node.expression.name.text==='addEventListener'&&node.expression.expression.getText(syntax)===owner&&node.arguments[0]?.getText(syntax)==="'click'")found=node.arguments[1].getText(syntax);ts.forEachChild(node,visit);}visit(syntax);assert.ok(found,owner);return found;}
function section(a,b){const start=main.indexOf(a),end=main.indexOf(b,start);assert.ok(start>=0&&end>start,a);return main.slice(start,end);}
function run(code,c){vm.runInContext(ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,c);}
function memory(initial){const map=new Map(initial===undefined?[]:[[RECOVERY_KEY,initial]]);return {map,writes:[],getItem(key){return map.get(key)??null;},setItem(key,value){this.writes.push(key);map.set(key,value);}};}
function node(){const classes=new Set();return {hidden:false,disabled:false,style:{},textContent:'',classList:{add:(...v)=>v.forEach(x=>classes.add(x)),remove:(...v)=>v.forEach(x=>classes.delete(x)),contains:v=>classes.has(v)},addEventListener(){}};}
function ui(engine,log,storage=memory()){
 const calls=[],timers=new Map();let nextTimer=0;
 const context={engine,sessionLog:log,currentScenario:engine.getState().scenarioId,currentSeed:engine.getState().seed,
  SimulationEngine,SessionLog,createRecoveryPacket,readRecovery,writeRecovery,SEASONS_INFO,tutorialData,PLAYABLE_SECTORS:sectors,
  recoveryWritesEnabled:true,preserveRecoveryOriginal:false,recoverySaveTimer:undefined,recoveryWarningShown:false,recoveryChoiceVisible:false,
  canUseControl:()=>true,syncInteractionLock:()=>calls.push('lock'),tutorialModeSetting:'optional',recoveryChoice:node(),welcomeNewChoices:node(),recoveryDescription:node(),btnContinueRecovery:node(),btnRestartRecovery:node(),btnDownloadRecovery:node(),
  modalWelcome:node(),tutorialGuideBanner:node(),seasonalGoalBanner:node(),btnTutNext:node(),cardSeasonFeedback:node(),
  sectorUI:Object.fromEntries(sectors.map(id=>[id,{card:node(),slider:node(),btnMinus:node(),btnPlus:node()}])),
  tutorialManager:{active:false,isActive(){return this.active;},exitTutorial(){this.active=false;},startTutorial(){this.active=true;}},
  window:{localStorage:storage,clearTimeout:id=>timers.delete(id),setTimeout:fn=>{timers.set(++nextTimer,fn);return nextTimer;}},
  document:{querySelectorAll:()=>[],querySelector:()=>null,getElementById:()=>node()},BasinScene:{},
  cancelPendingNewspaper:()=>calls.push('cancel'),recordTurnInitialAllocations:()=>calls.push('initial-alloc'),updateUI:()=>calls.push('update'),setupTutorialPhaseUI:()=>{},
  showFinalReport:()=>calls.push('final'),showYearEndModal:()=>calls.push('annual'),renderAgileSeasonFeedback:()=>calls.push('summary'),getCurrentSeasonalGoal:()=>undefined,
  showToastTip:()=>calls.push('save-error'),downloadJSON:(raw)=>{calls.push('download');context.downloaded=raw;},
 };
 vm.createContext(context);
 run(['setRecoveryStatus','saveRecovery','scheduleRecoverySave','dismissRecoveryChoice','beginFreshRecovery','showRecoveryChoice','createRecordedEngine','advanceRecordedTurn','startTutorial','exitTutorialToYearOne'].map(declaration).join('\n'),context);
 return {context,calls,timers,storage};
}
const snippets={
 event:section('        const state = engine.getState();\n        const eventId','        BasinScene.instance?.setEventWeatherOverride'),
 purchase:section('        sessionLog?.captureAllocations(engine.getState());','          renderUpgradesList();')+'\n}',
 resolve:section('  sessionLog?.captureAllocations(st);','  closeDistributionTip();'),
};
function action(env,type,extra={}){Object.assign(env.context,extra,{st:env.context.engine.getState()});run(type==='advance'?'advanceRecordedTurn();':'{'+snippets[type]+'}',env.context);}
function serialized(engine,log){return JSON.stringify(createRecoveryPacket(engine.getState(),log,'2026-10-08T00:00:00Z'));}
function restore(raw){const result=replayRecovery(JSON.parse(raw));assert.equal(result.ok,true,result.reason);return result;}
function verifyCheckpoint(env){
 const {engine,sessionLog}=env.context;
 const raw=env.storage.getItem(RECOVERY_KEY);assert.ok(raw);
 const result=restore(raw);
 assert.deepEqual(result.engine.getState(),engine.getState());
 // Continue using the restored log; repeated load/save must not inflate it.
 const originalActions=JSON.parse(raw).session.recording.actions;
 for(let n=0;n<3;n++){
  const data=createRecoveryPacket(result.engine.getState(),result.log,'now');
  assert.deepEqual(data.session.recording.actions,originalActions);
  const repeat=restore(JSON.stringify(data));
  assert.deepEqual(repeat.engine.getState(),result.engine.getState());
 }
 env.context.engine=result.engine;env.context.sessionLog=result.log;
}
for(const scenario of ['cuenca_central','cuenca_arida','cuenca_abundante'])test(`${scenario}: 20 turns through actual candidate action/save hooks, exact replay and continuation`,()=>{
 const baseline=new SimulationEngine(scenario,'AULA-2026-001',true);
 const first=new SimulationEngine(scenario,'AULA-2026-001',true);
 const env=ui(first,new SessionLog(first.getState()));
 run('saveRecovery();',env.context);verifyCheckpoint(env);
 for(let turn=1;turn<=20;turn++){
  const engine=env.context.engine,st=engine.getState();assert.equal(st.turn,turn);
  if(st.activeInteractiveEvent){
   const opt=st.activeInteractiveEvent.options.find(o=>engine.canChooseEventOption(o.id).allowed);
   action(env,'event',{opt});baseline.chooseEventOption(opt.id);verifyCheckpoint(env);
  }
  if([1,5,9,13].includes(turn)){
   action(env,'purchase',{upgId:'reparacion_red'});baseline.purchaseUpgrade('reparacion_red');verifyCheckpoint(env);
  }
  for(const id of sectors){const value=Math.floor(st.sectors[id].currentDemand*0.8);env.context.engine.setSectorAllocation(id,value);baseline.setSectorAllocation(id,value);}
  run('scheduleRecoverySave();saveRecovery();',env.context);verifyCheckpoint(env);
  action(env,'resolve');baseline.resolveSeason();verifyCheckpoint(env);
  assert.equal(env.context.engine.getState().seasonHistory.at(-1).balance.massBalanceError,0);
  assert.deepEqual(env.context.engine.getState(),baseline.getState(),'private RNG continuation matches uninterrupted game');
  if(env.context.engine.getState().isYearEndPhase&&!env.context.engine.getState().isGameOver){
   action(env,'purchase',{upgId:'recirculacion_minera'});baseline.purchaseUpgrade('recirculacion_minera');verifyCheckpoint(env);
  }
  if(turn<20){action(env,'advance');baseline.advanceToNextTurn();verifyCheckpoint(env);}
 }
 assert.equal(env.context.engine.getState().isGameOver,true);
 assert.equal(env.context.engine.getState().seasonHistory.length,20);
 assert.equal(env.context.engine.getState().yearHistory.length,5);
 const writes=env.storage.writes.length;action(env,'advance');assert.equal(env.storage.writes.length,writes);
});
test('startup optional/mandatory/disabled preserves valid, corrupt and old-version originals until explicit choice',()=>{
 const e=new SimulationEngine(),log=new SessionLog(e.getState());
 const valid=serialized(e,log),old=JSON.parse(valid);old.session.modelVersion='2.3';
 for(const mode of ['optional','mandatory','disabled'])for(const raw of [valid,'{bad',JSON.stringify(old)]){
  const storage=memory(raw),env=ui(new SimulationEngine(),new SessionLog(new SimulationEngine().getState()),storage);
  env.context.recoveryWritesEnabled=false;
  env.context.document.getElementById=id=>id==='select-tutorial-mode'?{value:mode}:node();
  let resets=0;env.context.startTutorial=()=>resets++;env.context.exitTutorialToYearOne=()=>resets++;
  run(main.slice(main.indexOf('// --- ARRANQUE INICIAL ---')),env.context);
  run('saveRecovery();',env.context); // unload while welcome is open
  assert.equal(resets,0);assert.equal(storage.getItem(RECOVERY_KEY),raw);assert.equal(storage.writes.length,0);
  assert.equal(env.context.recoveryChoiceVisible,true);assert.equal(env.context.welcomeNewChoices.hidden,true);
  assert.equal(env.context.btnContinueRecovery.disabled,raw!==valid);
  env.context.btnDownloadRecovery.onclick();assert.equal(env.context.downloaded,raw);
 }
});
test('Continue uses correct UI phase, exact state, no reroll and ignores a second click',()=>{
 const engine=new SimulationEngine(),log=new SessionLog(engine.getState());
 const checkpoints=[serialized(engine,log)];
 for(let turn=1;turn<=20;turn++){
  const st=engine.getState(),event=st.activeInteractiveEvent;
  if(event){log.captureAllocations(st);const option=event.options.find(o=>engine.canChooseEventOption(o.id).allowed);engine.chooseEventOption(option.id);log.record({type:'event-choice',turn,eventId:event.id,optionId:option.id});}
  log.captureAllocations(st);engine.resolveSeason();log.record({type:'resolve',turn});
  if([1,4,19,20].includes(turn))checkpoints.push(serialized(engine,log));
  if(turn<20){engine.advanceToNextTurn();log.record({type:'advance',turn});if(engine.getState().turn===19)checkpoints.push(serialized(engine,log));}
 }
 for(const raw of checkpoints){
  const storage=memory(raw),env=ui(new SimulationEngine(),new SessionLog(new SimulationEngine().getState()),storage);
  env.context.recoveryWritesEnabled=false;
  run('showRecoveryChoice(readRecovery(() => window.localStorage));',env.context);
  run(`var clickContinue=${callback('btnContinueRecovery')};clickContinue();`,env.context);
  const state=env.context.engine.getState();assert.deepEqual(state,JSON.parse(raw).session.snapshot);
  const destination=state.isGameOver?'final':state.isYearEndPhase?'annual':state.isSeasonResolved?'summary':null;
  if(destination)assert.ok(env.calls.includes(destination));
  if(destination==='summary'){assert.equal(env.context.cardSeasonFeedback.inert,false);assert.ok(env.context.cardSeasonFeedback.classList.contains('open'));}
  const before=JSON.stringify(state),calls=env.calls.length;
  run('clickContinue();',env.context);assert.equal(JSON.stringify(env.context.engine.getState()),before);assert.equal(env.calls.length,calls);
  assert.equal(storage.writes.length,0); // choosing Continue never blindly overwrites original
  run('saveRecovery();',env.context);assert.equal(readRecovery(()=>storage).kind,'ready');
 }
});
test('tutorial keeps real session separate; skip/new game archives exact old bytes before saving',()=>{
 const e=new SimulationEngine('cuenca_arida','TUTORIAL',true),log=new SessionLog(e.getState());
 const raw=serialized(e,log),storage=memory(raw),env=ui(e,log,storage);
 run('startTutorial();saveRecovery();',env.context);
 assert.equal(env.context.engine.getState().turn,0);assert.equal(env.context.sessionLog,null);
 assert.equal(storage.getItem(RECOVERY_KEY),raw.replace('2026-10-08T00:00:00Z',JSON.parse(storage.getItem(RECOVERY_KEY)).session.exportedAt));
 const protectedRaw=storage.getItem(RECOVERY_KEY),writes=storage.writes.length;
 run('saveRecovery();',env.context);assert.equal(storage.writes.length,writes);
 run('exitTutorialToYearOne();',env.context);
 assert.equal(env.context.engine.getState().turn,1);assert.equal(env.context.tutorialManager.isActive(),false);
 assert.equal(storage.getItem(RECOVERY_BACKUP_KEY),protectedRaw);assert.equal(readRecovery(()=>storage).kind,'ready');
 assert.equal(createRecoveryPacket({...e.getState(),turn:0,year:0},null,'now'),null);
});
test('corruption/version/config/actions are rejected without changing original storage or a live engine',()=>{
 const e=new SimulationEngine(),log=new SessionLog(e.getState());
 const packet=JSON.parse(serialized(e,log));
 const mutations=[
  p=>p.recoverySchemaVersion=99,p=>p.session.schemaVersion=99,p=>p.session.modelVersion='2.3',
  p=>p.session.metadata.context='tutorial',p=>p.session.metadata.scenarioId='unknown',p=>p.session.metadata.seed='other',
  p=>p.session.recording.kind='snapshot-only',p=>p.session.recording.initialState.money++,p=>p.session.snapshot.money++,
  p=>p.session.recording.actions[0].values.population=-1,p=>p.session.recording.actions[0].values.population=0.5,
  p=>p.session.recording.actions[0].values.other=0,p=>p.session.recording.actions[0].turn=2,
  p=>p.session.recording.actions.push({type:'advance',turn:1}),p=>p.session.recording.actions.push({type:'event-choice',turn:1,eventId:'no',optionId:'no'}),
  p=>p.session.recording.actions.push({type:'purchase',turn:1,upgradeId:'no'}),p=>p.session.recording.actions.push({type:'unknown',turn:1}),
  p=>p.session.recording.actions=Array(10001).fill(p.session.recording.actions[0]),
 ];
 const live=JSON.stringify(e.getState());
 for(const mutate of mutations){const copy=structuredClone(packet);mutate(copy);const raw=JSON.stringify(copy),storage=memory(raw);assert.equal(readRecovery(()=>storage).kind,'rejected');assert.equal(storage.getItem(RECOVERY_KEY),raw);assert.equal(storage.writes.length,0);assert.equal(JSON.stringify(e.getState()),live);}
 const resolved=structuredClone(packet);e.resolveSeason();log.captureAllocations(e.getState());log.record({type:'resolve',turn:1});
 const full=JSON.parse(serialized(e,log));full.session.recording.actions.push({type:'resolve',turn:1});assert.equal(replayRecovery(full).ok,false);
 for(const raw of ['','{','null','[]','x'.repeat(4_000_001)]){const storage=memory(raw);assert.equal(readRecovery(()=>storage).kind,'rejected');assert.equal(storage.getItem(RECOVERY_KEY),raw);}
});
test('storage denial/quota do not block gameplay; original is archived before intentional replacement',()=>{
 assert.equal(readRecovery(()=>{throw Error('denied');}).kind,'unavailable');
 const e=new SimulationEngine(),log=new SessionLog(e.getState()),packet=createRecoveryPacket(e.getState(),log,'now');
 const original='{invalid old JSON',storage=memory(original);
 assert.equal(writeRecovery(()=>storage,packet,true).ok,true);assert.equal(storage.getItem(RECOVERY_BACKUP_KEY),original);assert.equal(readRecovery(()=>storage).kind,'ready');
 const quota=memory(original);quota.setItem=()=>{throw Error('quota');};
 assert.equal(writeRecovery(()=>quota,packet,true).ok,false);assert.equal(quota.getItem(RECOVERY_KEY),original);
 const env=ui(new SimulationEngine(),new SessionLog(new SimulationEngine().getState()),quota);env.context.preserveRecoveryOriginal=true;
 run('saveRecovery();saveRecovery();',env.context);assert.equal(env.calls.filter(c=>c==='save-error').length,1);
 action(env,'resolve');assert.equal(env.context.engine.getState().isSeasonResolved,true);assert.equal(quota.getItem(RECOVERY_KEY),original);
});
test('allocation saves use a single cancellable timer and never inflate the committed log; unload/HMR hooks present',()=>{
 const e=new SimulationEngine(),log=new SessionLog(e.getState()),env=ui(e,log);
 const count=log.snapshot(e.getState()).actions.length;
 for(let i=1;i<=50;i++){e.setSectorAllocation('population',i);run('scheduleRecoverySave();',env.context);}
 assert.equal(env.timers.size,1);assert.equal(log.snapshot(e.getState()).actions.length,count);
 for(const fn of [...env.timers.values()])fn();assert.equal(env.timers.size,0);assert.equal(readRecovery(()=>env.storage).engine.getState().sectors.population.allocated,50);
 assert.ok(main.includes("window.addEventListener('beforeunload', saveRecovery)"));assert.ok(main.includes("window.addEventListener('pagehide', saveRecovery)"));assert.ok(main.includes('.hot?.dispose(() => {'));
});


test('recovery controls respect interaction lock; Restart archives rejected original only after explicit choice',()=>{
 const e=new SimulationEngine(),log=new SessionLog(e.getState());
 for(const mode of ['optional','mandatory','disabled']){
  const original='{old incompatible',storage=memory(original),env=ui(e,log,storage);
  env.context.recoveryWritesEnabled=false;env.context.tutorialModeSetting=mode;
  run('showRecoveryChoice(readRecovery(() => window.localStorage));',env.context);
  run(`var restart=${callback('btnRestartRecovery')};var resume=${callback('btnContinueRecovery')};`,env.context);
  env.context.canUseControl=()=>false;
  run('restart();resume();',env.context);env.context.btnDownloadRecovery.onclick();
  assert.equal(storage.getItem(RECOVERY_KEY),original);assert.equal(env.calls.length,0);
  env.context.canUseControl=()=>true;
  run('restart();',env.context);
  assert.equal(env.context.modalWelcome.classList.contains('open'),false,'Reiniciar cierra la bienvenida y libera el mapa');
  if(mode==='mandatory'){
   assert.equal(storage.getItem(RECOVERY_KEY),original);assert.equal(env.context.tutorialManager.isActive(),true);
   run('exitTutorialToYearOne();',env.context);
  }
  assert.equal(storage.getItem(RECOVERY_BACKUP_KEY),original);assert.equal(readRecovery(()=>storage).kind,'ready');
 }
});

test('beforeunload/pagehide/HMR disposal execute real save handler, even with pending slider timer',()=>{
 const e=new SimulationEngine(),env=ui(e,new SessionLog(e.getState()));
 const hooks={};env.context.window.removeEventListener=()=>{};env.context.window.addEventListener=(event,fn)=>{hooks[event]=fn;};
 const code=section("window.addEventListener('beforeunload', saveRecovery);",'// --- MODO AULA ESCOLAR ---')
  .replace('(import.meta as ImportMeta & { hot?: { dispose(callback: () => void): void } }).hot?.dispose(', 'hot.dispose(');
 env.context.hot={dispose:fn=>hooks.hmr=fn};run(code,env.context);
 for(const event of ['beforeunload','pagehide','hmr']){
  e.setSectorAllocation('population',e.getState().sectors.population.allocated+1);
  run('scheduleRecoverySave();',env.context);assert.equal(env.timers.size,1);
  hooks[event]();assert.equal(env.timers.size,0);assert.equal(readRecovery(()=>env.storage).engine.getState().sectors.population.allocated,e.getState().sectors.population.allocated);
 }
});

