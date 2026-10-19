import {missions, dependent, dependentOptions, tests, stages} from './data.js?v=2';

const $ = id => document.getElementById(id);
const state = {mission:0, stage:0, mode:'challenge', completed:new Set(), setup:{A:'',B:''}, attempts:0, message:''};
let world;
const current = () => missions[state.mission];
const condition = id => current().conditions.find(c => c.id === id);

function option(value,label,selected='') { return `<option value="${value}" ${selected===value?'selected':''}>${label}</option>`; }
function choices(items, name) { return `<option value="">請選擇…</option>${items.map(x=>option(x,x)).join('')}`; }
function stationSelect(key) { const m=current(); return `<label class="station-select"><span class="station-letter">${key}</span><span class="field-body"><strong>${key} 組的條件</strong><select name="${key}" data-setup="${key}">${option('','請選擇條件…')}${m.conditions.map(c=>option(c.id,c.name,state.setup[key])).join('')}</select></span></label>`; }
function miniStep() { return `<div class="work-top"><span>第 ${state.mission+1} 項探究</span><strong>${String(state.stage+1).padStart(2,'0')} / 06</strong></div><div class="step-track">${stages.map((s,i)=>`<span class="${i<state.stage?'done':''} ${i===state.stage?'active':''}" title="${s}"></span>`).join('')}</div><p class="step-name">STEP ${String(state.stage+1).padStart(2,'0')} · ${stages[state.stage]}</p>`; }
function feedback() { return state.message ? `<div class="feedback ${state.mode==='cleared'?'correct':'incorrect'}" role="status"><span>${state.mode==='cleared'?'✓':'! '}</span><p>${state.message}</p></div>` : '<div class="feedback-placeholder" aria-hidden="true"></div>'; }
function actions() { return `<div class="work-actions">${state.mode==='cleared'?`<button class="primary" data-action="next">${state.stage===5?'查看實驗結論':'繼續下一步'} <span aria-hidden="true">→</span></button>`:`<button class="primary" data-action="check">檢查答案 <span aria-hidden="true">→</span></button>`}<span class="attempt-note">${state.mode==='cleared'?'做得好！':state.attempts>0?'可修改答案後再試':'不限時，可重試'}</span></div>`; }

function stageBody() {
  const m=current();
  switch(state.stage) {
    case 0: return `<h2>用甚麼材料探究<br><em>「${m.title}」？</em></h2><p class="instruction">${m.question} 先選出最關鍵的材料。</p><div class="choice-list">${m.materials.map((x,i)=>`<label class="choice"><input type="radio" name="material" value="${i}"><span class="choice-index">${String.fromCharCode(65+i)}</span><span>${x}</span><span class="choice-indicator"></span></label>`).join('')}</div>`;
    case 1: return `<h2>安排兩個<br><em>比較條件</em></h2><div class="setup-fields">${stationSelect('A')}${stationSelect('B')}</div>`;
    case 2: return `<h2>哪一組是<br><em>實驗組？</em></h2><p class="instruction">實驗組移除正在探究的因素；對照組維持正常條件。</p><div class="comparison-recap"><span><b>A</b>${condition(state.setup.A)?.short}</span><span><b>B</b>${condition(state.setup.B)?.short}</span></div><div class="field-grid"><label class="field"><span>實驗組</span><select name="experimental"><option value="">請選擇…</option>${option('A','A 組')}${option('B','B 組')}</select></label><label class="field"><span>對照組</span><select name="control"><option value="">請選擇…</option>${option('A','A 組')}${option('B','B 組')}</select></label></div>`;
    case 3: return `<h2>讀懂實驗的<br><em>三種變因</em></h2><p class="instruction">獨立變因是刻意改變的；應變變因是觀察的結果；控制變因需保持一致。</p><div class="variable-fields"><label class="field"><span>獨立變因 <small>IV</small></span><select name="iv">${choices(m.ivOptions)}</select></label><label class="field"><span>應變變因 <small>DV</small></span><select name="dv">${choices(dependentOptions)}</select></label><label class="field"><span>控制變因 <small>CV</small></span><select name="cv">${choices(m.cvOptions)}</select></label></div>`;
    case 4: return `<h2>如何檢測<br><em>有沒有澱粉？</em></h2><p class="instruction">要判斷葉片是否進行光合作用並製造澱粉，應選用哪一個測試？</p><div class="choice-list">${tests.map((x,i)=>`<label class="choice"><input type="radio" name="test" value="${i}"><span class="choice-index">${String.fromCharCode(65+i)}</span><span>${x}</span><span class="choice-indicator"></span></label>`).join('')}</div><p class="note-line"><b>實驗提示</b>測試前，先用熱水及酒精水浴為葉片脫色，沖洗後再滴試劑。</p>`;
    case 5: return `<h2>預測兩組的<br><em>碘液結果</em></h2><p class="instruction">藍黑色代表有澱粉；黃褐色代表沒有檢測到澱粉。完成後模型會顯示結果。</p><div class="prediction-fields">${['A','B'].map(key=>`<label class="field prediction"><span><b class="small-letter">${key}</b>${condition(state.setup[key])?.short}</span><select name="result${key}"><option value="">請選擇結果…</option>${option('blue','藍黑色（有澱粉）')}${option('brown','黃褐色（沒有檢測到澱粉）')}</select></label>`).join('')}</div>`;
  }
}

function summary() {
  const m=current();
  const exp = state.setup.A==='removed'?'A':'B';
  const con = exp==='A'?'B':'A';
  return `<div class="summary-kicker">探究 ${m.number} 完成 <span>✓</span></div><h2>證據指向<br><em>「${m.title}」</em></h2><p class="summary-lead">${m.conclusion}</p><div class="result-table"><div><span>實驗組 · ${exp}</span><strong>黃褐色</strong><small>缺少${m.title} → 沒有檢測到澱粉</small></div><div><span>對照組 · ${con}</span><strong>藍黑色</strong><small>具備${m.title} → 有澱粉</small></div></div><div class="takeaway"><span>科學筆記</span><p>獨立變因：${m.iv}<br>應變變因：${dependent}<br>控制變因：${m.cv}</p></div><div class="work-actions"><button class="primary" data-action="nextMission">${state.completed.size===missions.length?'查看全部成果':'開始下一項探究'} <span aria-hidden="true">→</span></button><button class="text-button" data-action="retry">重做這一關</button></div>`;
}

function allDone() {
  return `<div class="summary-kicker">INVESTIGATION COMPLETE <span>✳</span></div><h2>你完成了<br><em>三項探究！</em></h2><p class="summary-lead">你已利用公平測試和碘液結果，找出製造澱粉所需的三個因素。</p><div class="all-list">${missions.map(m=>`<div><span class="all-icon">${m.icon}</span><strong>${m.title}</strong><small>必要因素</small><span class="all-check">✓</span></div>`).join('')}</div><div class="takeaway"><span>記住這個判斷方法</span><p>只改變一個因素 → 保持其他條件相同 → 用碘液測試澱粉 → 比較實驗組與對照組。</p></div><div class="work-actions"><button class="primary" data-action="restart">再玩一次 <span aria-hidden="true">↺</span></button></div>`;
}

function renderNav() {
  $('missionNav').innerHTML = missions.map((m,i)=>`<button class="mission-tab ${i===state.mission?'current':''} ${state.completed.has(i)?'completed':''}" data-mission="${i}" type="button" ${i===state.mission?'aria-current="step"':''}><span class="tab-num">${m.number}</span><span class="tab-title">${m.title}<small>${m.en}</small></span><span class="tab-symbol">${state.completed.has(i)?'✓':m.icon}</span></button>`).join('');
}
function renderScene() {
  const m=current();
  const showConditions=state.stage>=1||state.mode==='summary'||state.mode==='all';
  for(const key of ['A','B']) $('label'+key).textContent=showConditions?(condition(state.setup[key])?.short||'待設定'):'待設定';
  const reveal=state.stage===5&&state.mode==='cleared'||state.mode==='summary'||state.mode==='all';
  const materialReady=state.stage>0||state.mode==='cleared'||state.mode==='summary'||state.mode==='all';
  world?.setExperiment(m.id,showConditions?state.setup:{A:'',B:''},reveal,materialReady);
  $('fallback').dataset.mission=m.id;
  $('fallback').dataset.a=showConditions?state.setup.A:'';
  $('fallback').dataset.b=showConditions?state.setup.B:'';
  $('fallback').dataset.ready=String(materialReady);
  $('fallback').dataset.reveal=String(reveal);
  $('sceneNote').textContent='拖動旋轉 · 雙指縮放';
  $('scene').setAttribute('aria-label',m.id==='carbon'?'同一株植物的兩片葉，答對材料後出現透明膠袋及鈉石灰':'同一株植物上的一塊葉片，答對材料後顯示斑葉或黑紙');
  $('sceneStep').textContent=state.mode==='summary'?'結果已揭曉':state.mode==='all'?'探究完成':stages[state.stage];
  $('sceneStatus').textContent=reveal?'葉片碘液結果：藍黑色＝有澱粉；黃褐色＝沒有檢測到澱粉。':state.stage===0?(materialReady?'材料已加入，觀察葉片的變化。':'選對材料後，觀察實驗裝置的變化。'):state.stage===1?'為 A、B 選擇比較條件。':'觀察葉片上 A、B 所指的部分。';
}
function render() {
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
      if(v==='') return incorrect('先選一種材料，再檢查答案。');
      if(Number(v)!==m.materialAnswer) return incorrect('這件材料不能直接改變本關探究的因素。想想要讓哪個條件「有」和「沒有」。');
      return correct(m.materialWhy);
    }
    case 1: {
      const a=selected('A'),b=selected('B'); state.setup={A:a,B:b};
      if(!a||!b) return incorrect('A 和 B 都要設定條件，才可以比較。');
      if(a===b) return incorrect('兩組用了同一條件；公平測試需要一組有受測因素，另一組沒有。');
      if(![a,b].includes('normal')||![a,b].includes('removed')) return incorrect(m.setupWrong);
      return correct('配對正確，兩組比較的是本關探究的因素。');
    }
    case 2: {
      const exp=selected('experimental'),con=selected('control');
      const expected=state.setup.A==='removed'?'A':'B';
      if(!exp||!con) return incorrect('請指出實驗組和對照組。');
      if(exp===con) return incorrect('同一組不能同時是實驗組和對照組。');
      if(exp!==expected) return incorrect(`先找出缺少「${m.title}」的是哪一組；它就是實驗組。`);
      return correct(m.roleWhy);
    }
    case 3: {
      const iv=selected('iv'),dv=selected('dv'),cv=selected('cv');
      if(!iv||!dv||!cv) return incorrect('請填妥三種變因。');
      const wrong=[]; if(iv!==m.iv)wrong.push('獨立變因');if(dv!==dependent)wrong.push('應變變因');if(cv!==m.cv)wrong.push('控制變因');
      if(wrong.length) return incorrect(`再想想：${wrong.join('、')}。獨立變因是刻意改變的；應變變因是量度的結果。`);
      return correct(`正確：改變「${m.iv}」，觀察葉片有沒有產生澱粉，其他條件保持一致。`);
    }
    case 4: {
      const v=selected('test');
      if(v==='') return incorrect('先選一種測試方法。');
      if(v!=='0') return incorrect('想一想：要檢測的是澱粉，而不是二氧化碳或還原糖。');
      return correct('用碘液測試澱粉。先以熱水處理葉片，再以酒精水浴脫色、清水沖洗，最後滴碘液；有澱粉會變藍黑色。');
    }
    case 5: {
      const a=selected('resultA'),b=selected('resultB');
      if(!a||!b) return incorrect('請預測 A、B 兩組的碘液結果。');
      if(a!==condition(state.setup.A)?.result||b!==condition(state.setup.B)?.result) return incorrect(`有「${m.title}」的部分可製造澱粉，碘液會變藍黑色；缺少它的部分沒有檢測到澱粉。`);
      return correct('兩組結果不同，為這項探究提供了證據。看看 3D 實驗台上的碘液顏色。');
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
    const remaining=missions.findIndex((m,i)=>!state.completed.has(i));
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
$('brand').addEventListener('click',e=>{e.preventDefault();startMission(0);});
$('resetView').addEventListener('click',()=>world?.resetView());
$('helpButton').addEventListener('click',()=>$('helpDialog').showModal());
$('closeHelp').addEventListener('click',()=>$('helpDialog').close());
$('helpDialog').addEventListener('click',e=>{if(e.target===$('helpDialog'))$('helpDialog').close();});

render();
try {
  const {LabWorld}=await import('./world.js?v=2');
  world=new LabWorld($('scene'));
  if(!world.available)throw new Error('WebGL unavailable');
  renderScene();
} catch(error) {
  console.warn('3D model unavailable; using a schematic fallback.',error);
  $('scene').hidden=true;$('fallback').hidden=false;$('resetView').hidden=true;
}
window.addEventListener('pagehide',()=>world?.dispose(),{once:true});
