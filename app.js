import {missions as chineseMissions, dependent, dependentOptions, tests, stages} from './data.js?v=4';
import {englishMissions, englishCommon, ui} from './i18n.js?v=4';

const $ = id => document.getElementById(id);
const state = {lang:'en', mission:0, stage:0, mode:'challenge', completed:new Set(), setup:{A:'',B:''}, attempts:0, message:''};
let world;
const missions = () => state.lang==='en'?englishMissions:chineseMissions;
const current = () => missions()[state.mission];
const common = () => state.lang==='en'?englishCommon:{dependent, dependentOptions, tests, stages};
const t = (key, values={}) => ui[state.lang][key].replace(/\{(\w+)\}/g,(_,name)=>values[name]??'');
const condition = id => current().conditions.find(c => c.id === id);

function option(value,label,selected='') { return `<option value="${value}" ${selected===value?'selected':''}>${label}</option>`; }
function choices(items) { return `<option value="">${t('choose')}</option>${items.map((x,i)=>option(String(i),x)).join('')}`; }
function stationSelect(key) { const m=current(); return `<label class="station-select"><span class="station-letter">${key}</span><span class="field-body"><strong>${t('groupCondition',{key})}</strong><select name="${key}" data-setup="${key}">${option('',t('chooseCondition'))}${m.conditions.map(c=>option(c.id,c.name,state.setup[key])).join('')}</select></span></label>`; }
function miniStep() { const items=common().stages; return `<div class="work-top"><span>${t('investigation',{number:state.mission+1})}</span><strong>${String(state.stage+1).padStart(2,'0')} / 06</strong></div><div class="step-track">${items.map((s,i)=>`<span class="${i<state.stage?'done':''} ${i===state.stage?'active':''}" title="${s}"></span>`).join('')}</div><p class="step-name">${t('stepPrefix')} ${String(state.stage+1).padStart(2,'0')} · ${items[state.stage]}</p>`; }
function feedback() { return state.message ? `<div class="feedback ${state.mode==='cleared'?'correct':'incorrect'}" role="status"><span>${state.mode==='cleared'?'✓':'! '}</span><p>${state.message}</p></div>` : '<div class="feedback-placeholder" aria-hidden="true"></div>'; }
function actions() { return `<div class="work-actions">${state.mode==='cleared'?`<button class="primary" data-action="next">${t(state.stage===5?'seeConclusion':'continue')} <span aria-hidden="true">→</span></button>`:`<button class="primary" data-action="check">${t('check')} <span aria-hidden="true">→</span></button>`}<span class="attempt-note">${t(state.mode==='cleared'?'wellDone':state.attempts>0?'retryNote':'noTime')}</span></div>`; }

function stageBody() {
  const m=current();
  switch(state.stage) {
    case 0: return `<h2>${t('materialHeading',{title:m.title})}</h2><p class="instruction">${t('materialIntro',{question:m.question})}</p><div class="choice-list">${m.materials.map((x,i)=>`<label class="choice"><input type="radio" name="material" value="${i}"><span class="choice-index">${String.fromCharCode(65+i)}</span><span>${x}</span><span class="choice-indicator"></span></label>`).join('')}</div>`;
    case 1: return `<h2>${t('conditionsHeading')}</h2><div class="setup-fields">${stationSelect('A')}${stationSelect('B')}</div>`;
    case 2: return `<h2>${t('rolesHeading')}</h2><p class="instruction">${t('rolesIntro')}</p><div class="comparison-recap"><span><b>A</b>${condition(state.setup.A)?.short}</span><span><b>B</b>${condition(state.setup.B)?.short}</span></div><div class="field-grid"><label class="field"><span>${t('experimental')}</span><select name="experimental">${option('',t('choose'))}${option('A',t('group',{key:'A'}))}${option('B',t('group',{key:'B'}))}</select></label><label class="field"><span>${t('control')}</span><select name="control">${option('',t('choose'))}${option('A',t('group',{key:'A'}))}${option('B',t('group',{key:'B'}))}</select></label></div>`;
    case 3: return `<h2>${t('variablesHeading')}</h2><p class="instruction">${t('variablesIntro')}</p><div class="variable-fields"><label class="field"><span>${t('iv')} <small>IV</small></span><select name="iv">${choices(m.ivOptions)}</select></label><label class="field"><span>${t('dv')} <small>DV</small></span><select name="dv">${choices(common().dependentOptions)}</select></label><label class="field"><span>${t('cv')} <small>CV</small></span><select name="cv">${choices(m.cvOptions)}</select></label></div>`;
    case 4: return `<h2>${t('testHeading')}</h2><p class="instruction">${t('testIntro')}</p><div class="choice-list">${common().tests.map((x,i)=>`<label class="choice"><input type="radio" name="test" value="${i}"><span class="choice-index">${String.fromCharCode(65+i)}</span><span>${x}</span><span class="choice-indicator"></span></label>`).join('')}</div><p class="note-line"><b>${t('testTip')}</b>${t('testNote')}</p>`;
    case 5: return `<h2>${t('resultsHeading')}</h2><p class="instruction">${t('resultsIntro')}</p><div class="prediction-fields">${['A','B'].map(key=>`<label class="field prediction"><span><b class="small-letter">${key}</b>${condition(state.setup[key])?.short}</span><select name="result${key}">${option('',t('chooseResult'))}${option('blue',t('blue'))}${option('brown',t('brown'))}</select></label>`).join('')}</div>`;
  }
}

function summary() {
  const m=current();
  const exp = state.setup.A==='normal'?'A':'B';
  const con = exp==='A'?'B':'A';
  return `<div class="summary-kicker">${t('completed',{number:m.number})} <span>✓</span></div><h2>${t('evidenceHeading',{title:m.title})}</h2><p class="summary-lead">${m.conclusion}</p><div class="result-table"><div><span>${t('experimental')} · ${exp}</span><strong>${t('blueShort')}</strong><small>${t('presentResult',{title:m.title})}</small></div><div><span>${t('control')} · ${con}</span><strong>${t('brownShort')}</strong><small>${t('absentResult',{title:m.title})}</small></div></div><div class="takeaway"><span>${t('notebook')}</span><p>${t('iv')}: ${m.iv}<br>${t('dv')}: ${common().dependent}<br>${t('cv')}: ${m.cv}</p></div><div class="work-actions"><button class="primary" data-action="nextMission">${t(state.completed.size===missions().length?'allResults':'nextInvestigation')} <span aria-hidden="true">→</span></button><button class="text-button" data-action="retry">${t('redo')}</button></div>`;
}

function allDone() {
  return `<div class="summary-kicker">INVESTIGATION COMPLETE <span>✳</span></div><h2>${t('allHeading')}</h2><p class="summary-lead">${t('allLead')}</p><div class="all-list">${missions().map(m=>`<div><span class="all-icon">${m.icon}</span><strong>${m.title}</strong><small>${t('necessary')}</small><span class="all-check">✓</span></div>`).join('')}</div><div class="takeaway"><span>${t('remember')}</span><p>${t('rememberText')}</p></div><div class="work-actions"><button class="primary" data-action="restart">${t('playAgain')} <span aria-hidden="true">↺</span></button></div>`;
}

function renderNav() {
  $('missionNav').innerHTML = missions().map((m,i)=>`<button class="mission-tab ${i===state.mission?'current':''} ${state.completed.has(i)?'completed':''}" data-mission="${i}" type="button" ${i===state.mission?'aria-current="step"':''}><span class="tab-num">${m.number}</span><span class="tab-title">${m.title}${state.lang==='zh'?`<small>${m.en}</small>`:''}</span><span class="tab-symbol">${state.completed.has(i)?'✓':m.icon}</span></button>`).join('');
}
function renderScene() {
  const m=current();
  const showConditions=state.stage>=1||state.mode==='summary'||state.mode==='all';
  for(const key of ['A','B']) $('label'+key).textContent=showConditions?(condition(state.setup[key])?.short||t('unset')):t('unset');
  const reveal=state.stage===5&&state.mode==='cleared'||state.mode==='summary'||state.mode==='all';
  const materialReady=state.stage>0||state.mode==='cleared'||state.mode==='summary'||state.mode==='all';
  world?.setExperiment(m.id,showConditions?state.setup:{A:'',B:''},reveal,materialReady);
  $('fallback').dataset.mission=m.id;
  $('fallback').dataset.a=showConditions?state.setup.A:'';
  $('fallback').dataset.b=showConditions?state.setup.B:'';
  $('fallback').dataset.ready=String(materialReady);
  $('fallback').dataset.reveal=String(reveal);
  $('sceneNote').textContent=t('drag');
  $('scene').setAttribute('aria-label',t(m.id==='carbon'?'sceneCarbon':'sceneSingle'));
  $('sceneStep').textContent=state.mode==='summary'?t('sceneRevealed'):state.mode==='all'?t('sceneFinished'):common().stages[state.stage];
  $('sceneStatus').textContent=reveal?t('sceneResult'):state.stage===0?t(materialReady?'sceneMaterialReady':'sceneMaterialWait'):state.stage===1?t('sceneChoose'):t('sceneObserve');
}
function renderStatic() {
  document.documentElement.lang=state.lang==='en'?'en':'zh-Hant';
  document.title=t('pageTitle');
  document.querySelector('meta[name="description"]').content=t('description');
  $('brand').setAttribute('aria-label',state.lang==='en'?'Return to the first investigation':'回到第一關');
  $('brandSub').textContent=t('brandSub');
  $('courseTag').textContent=t('course');
  $('languageText').textContent=t('language');
  $('languageSelect').setAttribute('aria-label',t('language'));
  $('helpText').textContent=t('help');
  $('introEyebrow').textContent=t('introEyebrow');
  $('helpEyebrow').textContent=t('helpEyebrow');
  $('heroTitle').innerHTML=t('hero');
  $('heroLead').textContent=t('lead');
  $('statInvestigations').textContent=t('investigations');
  $('statDecisions').textContent=t('decisions');
  $('missionNav').setAttribute('aria-label',t('navLabel'));
  $('sceneCard').setAttribute('aria-label',t('sceneLabel'));
  $('labText').textContent=t('lab');
  $('fallback').querySelector('svg').setAttribute('aria-label',t('sceneLabel'));
  $('diagramText').textContent=t('diagram');
  $('resetView').setAttribute('aria-label',t('reset'));
  $('resetText').textContent=t('reset');
  $('fairTitle').textContent=t('fairTitle');
  $('fairText').textContent=t('fairText');
  $('footerText').textContent=t('footer');
  $('modelNote').textContent=t('modelNote');
  $('helpTitle').textContent=t('howTitle');
  $('helpSteps').innerHTML=ui[state.lang].howSteps.map(step=>`<li>${step}</li>`).join('');
  $('helpEnd').textContent=t('howEnd');
  $('closeHelp').setAttribute('aria-label',t('close'));
  $('languageSelect').value=state.lang;
}
function render() {
  renderStatic();
  renderNav();
  $('workCard').innerHTML=state.mode==='all'?allDone():state.mode==='summary'?summary():`${miniStep()}${stageBody()}${feedback()}${actions()}`;
  renderScene();
}

function selected(name) {
  const element=$('workCard').querySelector(`[name="${name}"]`);
  return element?.type==='radio'?($('workCard').querySelector(`[name="${name}"]:checked`)?.value??''):(element?.value??'');
}
function rerenderWithAnswers() {
  const fields=[...$('workCard').querySelectorAll('input,select')].map(el=>({name:el.name,value:el.value,checked:el.checked}));
  const old=document.activeElement?.name;
  render();
  for(const field of fields){
    const elements=[...$('workCard').querySelectorAll(`[name="${field.name}"]`)];
    const el=elements.find(x=>x.tagName==='SELECT')||elements.find(x=>x.value===field.value);
    if(el){el.value=field.value;if(el.type==='radio')el.checked=field.checked;}
  }
  if(state.mode==='cleared')$('workCard').querySelectorAll('input,select').forEach(el=>el.disabled=true);
  if(old)$('workCard').querySelector(`[name="${old}"]`)?.focus();
}
function correct(message) { state.mode='cleared';state.message=message;rerenderWithAnswers(); }
function incorrect(message) { state.attempts++;state.message=message;rerenderWithAnswers(); }
function check() {
  const m=current();
  switch(state.stage) {
    case 0: {
      const v=selected('material');
      if(v==='') return incorrect(t('errorMaterialEmpty'));
      if(Number(v)!==m.materialAnswer) return incorrect(t('errorMaterial'));
      return correct(m.materialWhy);
    }
    case 1: {
      const a=selected('A'),b=selected('B'); state.setup={A:a,B:b};
      if(!a||!b) return incorrect(t('errorSetupEmpty'));
      if(a===b) return incorrect(t('errorSetupSame'));
      if(![a,b].includes('normal')||![a,b].includes('removed')) return incorrect(m.setupWrong);
      return correct(t('setupCorrect'));
    }
    case 2: {
      const exp=selected('experimental'),con=selected('control');
      const expected=state.setup.A==='normal'?'A':'B';
      if(!exp||!con) return incorrect(t('errorRolesEmpty'));
      if(exp===con) return incorrect(t('errorRolesSame'));
      if(exp!==expected) return incorrect(t('errorRoles',{title:m.title}));
      return correct(m.roleWhy);
    }
    case 3: {
      const iv=selected('iv'),dv=selected('dv'),cv=selected('cv');
      if(!iv||!dv||!cv) return incorrect(t('errorVariablesEmpty'));
      const wrong=[]; if(iv!=='0')wrong.push(t('iv'));if(dv!=='0')wrong.push(t('dv'));if(cv!=='0')wrong.push(t('cv'));
      if(wrong.length) return incorrect(t('errorVariables',{names:wrong.join(state.lang==='en'?', ':'、')}));
      return correct(t('variableCorrect',{iv:m.iv}));
    }
    case 4: {
      const v=selected('test');
      if(v==='') return incorrect(t('errorTestEmpty'));
      if(v!=='0') return incorrect(t('errorTest'));
      return correct(t('testCorrect'));
    }
    case 5: {
      const a=selected('resultA'),b=selected('resultB');
      if(!a||!b) return incorrect(t('errorResultsEmpty'));
      if(a!==condition(state.setup.A)?.result||b!==condition(state.setup.B)?.result) return incorrect(t('errorResults',{title:m.title}));
      return correct(t('resultsCorrect'));
    }
  }
}

function startMission(i) { state.mission=i;state.stage=0;state.mode='challenge';state.setup={A:'',B:''};state.attempts=0;state.message='';render(); }
function next() { if(state.stage<5){state.stage++;state.mode='challenge';state.attempts=0;state.message='';render();}else{state.completed.add(state.mission);state.mode='summary';render();} }

$('workCard').addEventListener('click',e=>{
  const action=e.target.closest('[data-action]')?.dataset.action;
  if(!action)return;
  if(action==='check')check();
  if(action==='next')next();
  if(action==='retry')startMission(state.mission);
  if(action==='nextMission'){
    const remaining=missions().findIndex((m,i)=>!state.completed.has(i));
    if(remaining<0){state.mode='all';render();}else startMission(remaining);
  }
  if(action==='restart'){state.completed.clear();startMission(0);}
});
$('workCard').addEventListener('change',e=>{
  if(e.target.matches('[data-setup]')){
    state.setup[e.target.dataset.setup]=e.target.value;
    renderScene();
  }
  if(state.message&&state.mode==='challenge') { state.message='';$('workCard').querySelector('.feedback')?.remove(); }
});
$('missionNav').addEventListener('click',e=>{const b=e.target.closest('[data-mission]');if(b)startMission(Number(b.dataset.mission));});
$('languageSelect').addEventListener('change',e=>{
  state.lang=e.target.value;
  if(state.mode==='cleared') state.message=[current().materialWhy,t('setupCorrect'),current().roleWhy,t('variableCorrect',{iv:current().iv}),t('testCorrect'),t('resultsCorrect')][state.stage];
  else state.message='';
  rerenderWithAnswers();
});
$('brand').addEventListener('click',e=>{e.preventDefault();startMission(0);});
$('resetView').addEventListener('click',()=>world?.resetView());
$('helpButton').addEventListener('click',()=>$('helpDialog').showModal());
$('closeHelp').addEventListener('click',()=>$('helpDialog').close());
$('helpDialog').addEventListener('click',e=>{if(e.target===$('helpDialog'))$('helpDialog').close();});

render();
try {
  const {LabWorld}=await import('./world.js?v=4');
  world=new LabWorld($('scene'));
  if(!world.available)throw new Error('WebGL unavailable');
  renderScene();
} catch(error) {
  console.warn('3D model unavailable; using a schematic fallback.',error);
  $('scene').hidden=true;$('fallback').hidden=false;$('resetView').hidden=true;
}
window.addEventListener('pagehide',()=>world?.dispose(),{once:true});
