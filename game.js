(() => {
  'use strict';
  const KEY = 'fogport-seventh-night-v3';
  const $ = (s) => document.querySelector(s);
  const body = $('#scene-body'), choices = $('#choices'), title = $('#scene-title');
  const notebook = $('#notebook'), notebookContent = $('#notebook-content'), caseCount = $('#case-count');
  const modal = $('#system-modal'), modalCopy = $('#modal-copy'), modalOk = $('#modal-ok'), modalCancel = $('#modal-cancel');
  const capture = $('#evidence-capture'), captureSubject = $('#capture-subject'), captureLabel = $('#capture-label'), captureStore = $('#capture-store');
  const audio = Object.fromEntries(['ambience','rain','click-sfx','choice-sfx','popup-sfx','correct-sfx','error-sfx','system-sfx','startup-sfx','rewind-sfx','chapter-sfx'].map(id => [id, $('#' + id)]));
  let modalAction = null, modalCancelAction = null, captureItem = null, pollutionTimer = null;
  const blank = () => ({ scene:'idle', powered:false, name:'', persona:'', pollution:null, submission:'', clues:[], marked:{}, deskDone:[] });
  let s;
  try { s = { ...blank(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { s = blank(); }
  const save = () => localStorage.setItem(KEY, JSON.stringify(s));
  const play = (name, volume = 1) => { const a = audio[name]; if (!a) return; a.pause(); a.currentTime = 0; a.volume = volume; a.play().catch(() => {}); };
  const click = () => play('choice-sfx', .58);
  const scene = (name, html, buttons = []) => { s.scene = name; save(); title.textContent = name === 'idle' ? '终端未启动' : '雾港日报 / 夜班编辑部'; body.innerHTML = html; choices.innerHTML = ''; buttons.forEach(({ text, fn, cls = '' }) => { const b = document.createElement('button'); b.className = cls; b.textContent = '＞ ' + text; b.addEventListener('click', () => { click(); fn(); }); choices.appendChild(b); }); };
  const setSoundscape = (kind) => {
    if (kind === 'storm') { audio.ambience.volume = .08; audio.rain.volume = .62; }
    else { audio.ambience.volume = .28; audio.rain.volume = .13; }
    [audio.ambience,audio.rain].forEach(a => a.play().catch(() => {}));
  };
  const aside = () => {
    const lists = {
      '毒舌':['世界没挑你，挺公平的。','材料堆得很整齐，像一场精心布置的推诿。','你继续点，真相不会自己从抽屉里爬出来。','这份稿子很安全，安全到像没发生过事。','挺好，至少你还知道先看再下结论。'],
      '温柔':['终于见面了呀。希望你会喜欢这里，嘻嘻。','慢一点也没关系，急着盖章的人通常最怕你看清。','这盏灯一直亮着呢，好像有人还在等你。','请把它收好呀，有些话一旦散了，就很难拼回来。','别怕，门会开的；会关上的，通常是人心。'],
      '梗王':['世界匹配成功。不是弹窗广告，真·沉浸式副本。','这材料的信息密度，属于复制到拼多多也没反应那档。','档案权限解锁。家人们，副本现在开始上强度。','这个修改记录，疑似有低人指点。','看懂的扣 1，看不懂的先别急着开庭。']
    };
    const a = lists[s.persona] || lists['梗王']; return a[Math.floor(Math.random() * a.length)];
  };
  const systemBlock = (fact, data = '') => `<div class="system"><div class="system__head">系统</div><p class="system__fact">${fact}</p><p class="system__aside">${aside()}</p>${data ? `<p class="system__data">${data}</p>` : ''}</div>`;
  const showModal = (html, ok = null, cancel = null, titleText = '人生系统 · 警告', okText = '收到', cancelText = '取消') => { modal.classList.remove('hidden'); modal.querySelector('.pixel-title').textContent = titleText; modalCopy.innerHTML = html; modalOk.textContent = okText; modalCancel.textContent = cancelText; modalCancel.classList.toggle('hidden', !cancel); modalAction = ok; modalCancelAction = cancel; play('popup-sfx', .62); };
  modalOk.onclick = () => { click(); modal.classList.add('hidden'); const fn = modalAction; modalAction = null; fn && fn(); };
  modalCancel.onclick = () => { click(); modal.classList.add('hidden'); const fn = modalCancelAction; modalCancelAction = null; fn && fn(); };
  const addClue = (id, label, type, detail) => { if (!s.clues.some(c => c.id === id)) s.clues.push({id,label,type,detail}); save(); renderNotebook(); };
  const renderNotebook = () => { caseCount.textContent = String(s.clues.length).padStart(2,'0'); notebookContent.innerHTML = s.clues.length ? s.clues.map(c => `<button class="evidence-card evidence-card--${c.type || 'note'}" data-clue="${c.id}"><b>${c.label}</b><small>${c.detail || '已归档'}</small></button>`).join('') : '<p class="case-empty">尚未归档物证。</p>'; notebookContent.querySelectorAll('[data-clue]').forEach(b => b.onclick = () => showModal(`<strong>${s.clues.find(c=>c.id===b.dataset.clue).label}</strong><p>${s.clues.find(c=>c.id===b.dataset.clue).detail}</p>`)); };
  $('#notebook-toggle').onclick = () => { click(); notebook.classList.remove('hidden'); renderNotebook(); };
  $('#notebook-close').onclick = () => { click(); notebook.classList.add('hidden'); };
  function captureEvidence(item) { captureItem = item; captureSubject.className = 'photo-subject ' + item.type; captureSubject.innerHTML = item.art || ''; captureLabel.textContent = item.label; capture.classList.remove('hidden'); capture.setAttribute('aria-hidden','false'); play('correct-sfx', .68); }
  captureStore.onclick = () => { click(); if (captureItem) addClue(captureItem.id, captureItem.label, captureItem.type, captureItem.detail); capture.classList.add('hidden'); capture.setAttribute('aria-hidden','true'); captureItem = null; if (s.scene === 'desk' || s.scene.startsWith('inspect-')) desk(); };
  function powerOn() { if (s.powered) return; s.powered = true; save(); play('click-sfx', .65); play('startup-sfx', .58); setSoundscape('intro'); scene('boot', '<div class="boot-screen"><div><div class="winmark">▣</div><h1>Windows</h1><div class="loadbar"><b></b></div><p>正在启动雾港日报终端……</p></div></div>'); setTimeout(bindingStart, 2700); }
  $('#power-button').onclick = powerOn;
  $('#rewind-button').onclick = () => { if (!s.powered) return; showModal('<p><strong>是否回溯至最初绑定？</strong></p><p>本机进度与已归档线索将被清空。</p>', () => { play('rewind-sfx', .7); $('#glitch-overlay').classList.add('active'); localStorage.removeItem(KEY); setTimeout(() => location.reload(), 900); }, null, '人生系统 · 回溯确认', '确认回溯'); };
  function bindingStart() { scene('bind', `<div class="intro-copy"><h2>人生系统正在接管终端</h2><p>正在检测可绑定对象……</p><p class="small-muted">请确认是否接受绑定。</p></div>`, [{text:'接受绑定', fn:nameInput}]); }
  function nameInput() { scene('name', `<div class="intro-copy"><h2>请输入你的名字。</h2><p>该名称将用于本次试炼世界的临时身份记录。</p><div class="bind-form"><input id="name-input" maxlength="12" autocomplete="off" placeholder="输入姓名或昵称"></div></div>`, [{text:'确认', fn:() => { const n = $('#name-input').value.trim(); if (!n) { play('error-sfx',.65); $('#name-input').focus(); return; } s.name = n; save(); personaPick(); }}]); setTimeout(() => $('#name-input')?.focus(), 50); }
  function personaPick() { scene('persona', `<div class="intro-copy"><h2>请选择与你同行的系统人格。</h2><p>它会影响系统的说话方式，不会影响结局。</p><div class="persona-grid"><button class="persona-card" data-p="毒舌"><h3>毒舌</h3><p>语言犀利，擅长反讽与挑出漏洞。</p></button><button class="persona-card" data-p="温柔"><h3>温柔</h3><p>永远笑眯眯地说话；话里有没有别的意思，慢慢听。</p></button><button class="persona-card" data-p="梗王"><h3>梗王</h3><p>混迹互联网十年的冲浪选手；不保证每个梗都在你的年代。</p></button></div></div>`); document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{ click(); s.persona=b.dataset.p; save(); pollutionDraw(); }); }
  function pollutionDraw() { scene('pollution', `<div class="intro-copy pollution-box"><h2>初始污染度抽取器已就绪</h2><p>该数值仅记录你进入世界时的异常适配度。</p><div id="pollution-number" class="pollution-number">--%</div><p id="pollution-state" class="small-muted">等待抽取。</p></div>`, [{text:'开始抽取', fn: startPollution}]); }
  function startPollution() { const n = $('#pollution-number'), state = $('#pollution-state'); if (!n || pollutionTimer) return; play('system-sfx',.6); let ticks = 0; pollutionTimer = setInterval(()=>{ n.textContent = (Math.floor(Math.random()*61)+20) + '%'; ticks++; if(ticks >= 22){ clearInterval(pollutionTimer); pollutionTimer = null; s.pollution = Math.floor(Math.random()*61)+20; n.textContent = s.pollution + '%'; state.textContent = '抽取完成。该数值已写入本机记录。'; save(); choices.innerHTML = ''; const b=document.createElement('button'); b.textContent='＞ 确认数值'; b.onclick=()=>{click(); loader();}; choices.appendChild(b); }},85); }
  function loader(){ scene('loader', '<div class="boot-screen loading"><div><h1>正在建立试炼连接</h1><div class="loadbar"><b></b></div><p>人格参数已写入。请保持终端连接。</p></div></div>'); setTimeout(bindingSuccess,2600); }
  function bindingSuccess(){ const fact = `✦【绑定成功】<br>绑定对象：${s.name}<br>世界匹配成功。`; const data = `试炼世界：《雾港第七夜》<br>初始污染度：${s.pollution}%`; showModal(`<span class="system-popup__fact">${fact}</span><span class="system-popup__aside">${aside()}</span><span class="system-popup__data">${data}</span>`, projection, null, '人生系统 · 绑定成功'); }
  function projection(){ play('chapter-sfx',.58); scene('projection','<div class="chapter-card"><h1>正在投入试炼世界……</h1><p>请保持终端连接</p></div>'); setTimeout(identity,1700); }
  function identity(){ scene('identity', `<div class="intro-copy"><div class="id-card"><div class="id-card__top">雾港日报　夜班通行证</div><dl class="id-card__grid"><dt>姓名</dt><dd>${s.name}</dd><dt>职业</dt><dd>夜班实习记者</dd><dt>报社</dt><dd>雾港日报</dd><dt>班次</dt><dd>临时顶替</dd><dt>状态</dt><dd class="danger">代班对象失联</dd></dl><small>WG-071 / LOCAL</small></div></div>`, [{text:'确认身份',fn:briefing}]); }
  function briefing(){ scene('briefing', `<div class="intro-copy"><h2>午夜交接</h2><p>你的前辈，<strong>林越</strong>。</p><p>雾港日报夜班记者。</p><p>十二小时前，他在追查一篇被反复撤下的稿件后失联。</p><p>他的工位还亮着。</p></div>`, [{text:'继续',fn:rewindGuide}]); }
  function rewindGuide(){ $('#rewind-button').classList.add('guided'); scene('rewind-guide', `<div class="intro-copy">${systemBlock('【回溯键】','当你想清空本机进度、重新体验时，可按下键盘右上角的回溯键。<br>开机键只在游戏开始前有效；进入世界后不会再响应。')}</div>`, [{text:'我明白了',fn:chapterStart}]); }
  function chapterStart(){ $('#rewind-button').classList.remove('guided'); setSoundscape('storm'); play('chapter-sfx',.58); scene('chapter-card','<div class="chapter-card"><h1>第一章</h1><p>交接前的灯</p><p class="small-muted">雨声载入中……</p></div>',[{text:'开始夜班',fn:environment}]); }
  function environment(){ scene('environment', `<div class="chapter-copy"><p>窗外的雨斜着打在玻璃上，霓虹被雨水揉成模糊的色块。远处港口有一声闷长的汽笛。</p><p>整层编辑部只亮着一盏工位灯。林越的座位没有人，电脑却仍在运行；桌上的答录机指示灯规律闪烁。</p>${systemBlock('加载完成：夜班编辑部。','前辈失联、工位亮着。今晚的交接看起来并不安静。')}</div>`,[{text:'走向林越的工位',fn:desktop}]); }
  function desktop(){ scene('desktop', `<div class="desktop-scene"><div class="guide-tip">林越留下的最终稿似乎尚未提交。<br>点击文件，完成夜班交接。</div><div class="desktop-icons"><button class="desktop-icon"><b></b>我的文档</button><button class="desktop-icon"><b></b>港务浏览器</button><button class="desktop-icon"><b></b>雾港日报内网</button><button class="desktop-icon recycle"><b></b>回收站</button></div><button id="final-doc" class="desktop-doc"><b>W</b>静湖公园女童不慎落水_最终稿.doc</button></div>`); $('#final-doc').onclick=()=>{click(); finalDraft(0);}; }
  const pages = [
    '<h2>《静湖公园女童不慎落水》</h2><p class="small-muted">最终稿 / 待提交</p><p>昨晚，雾港北郊静湖公园发生一起女童落水事件。</p><p>八岁女孩夏满在园内湖岸区域不慎落水，经抢救无效死亡。</p>',
    '<p>据其父亲夏成海口述，当晚他原本带女儿前往公园湖边夜钓。</p><p>天气转冷后，夏满表示身体发冷。</p><p>夏成海称，自己随即返回停车处取厚外套。</p>',
    '<p>其短暂离开期间，孩子意外落水。</p><p>事发后，夏成海情绪激动，认为公园救生设施与夜间巡查存在管理缺口。</p><p>家属已就相关责任与园方协商。</p>'
  ];
  function finalDraft(i){ scene('final-draft', `<div class="word-window"><div class="word-window__bar">静湖公园女童不慎落水_最终稿.doc　_ □ ×</div><div class="word-window__menu">文件　编辑　查看　插入　格式　工具　帮助</div><article class="word-page">${pages[i]}</article><footer class="word-footer"><span>第 ${i+1} 页 / 共 3 页</span><span>最后修改：昨日 20:31</span></footer></div>`, i<2?[{text:'下一页',fn:()=>finalDraft(i+1)}]:[{text:'提交最终稿',fn:submitConfirm}]); }
  function submitConfirm(){ showModal('<p><strong>是否提交《静湖公园女童不慎落水》最终稿？</strong></p><p>提交后将进入印刷流程。</p>',()=>autoClose(),()=>{s.submission='暂不提交';save(); deferPrompt();},'人生系统 · 提交确认','是，提交','否，返回'); }
  function autoClose(){ play('error-sfx',.62); scene('draft-blocked','<div class="word-window"><div class="word-window__bar">静湖公园女童不慎落水_最终稿.doc　_ □ ×</div><article class="word-page"><p>鼠标自行移向右上角。</p><p>咔哒。</p><p class="small-muted">文档窗口已关闭。</p></article></div>'); setTimeout(()=>showModal('<p><strong>当前稿件存在未核验记录。</strong></p><p>是否暂缓提交？</p>',()=>{s.submission='异常中止提交';save(); startCheck();},null,'人生系统 · 异常中止','是，暂缓提交'),700); }
  function deferPrompt(){ showModal('<p><strong>【夜班交接提示】</strong></p><p>你选择暂缓提交。</p><p>在提交前，是否进行一次工位交接核验？</p>',startCheck,()=>finalDraft(2),'人生系统 · 交接核验','开始核验','返回最终稿'); }
  function startCheck(){ scene('check', `<div class="chapter-copy"><h2>雾港日报 · 档案权限</h2><p>地下二层旧档案室处于备用供电状态。</p><p>当前工位交接核验完成后，电梯与档案室权限将恢复。</p>${systemBlock('待核验物品：3 件','林越新闻残页、电脑修改记录、老式电话答录机。')}</div>`,[{text:'开始工位核验',fn:desk}]); }
  const prop = {
    paper:{name:'林越新闻残页',icon:'torn-paper',label:'林越的残页',detail:'被撕去标题的报道残页：夜钓、北侧临水步道、取厚外套。',lines:['“孩子说冷。”','“父亲返回停车处取厚外套。”','“北侧临水步道。”','“当晚原计划夜钓。”'],type:'note'},
    pc:{name:'林越的电脑 / 修改记录',icon:'old-pc',label:'终稿修订记录',detail:'地点与行动被泛化；原始终稿存档在地下二层社会新闻旧档案室。',lines:['昨日 20:14　“北侧临水步道” → “园内湖岸区域”','昨日 20:16　“父亲离开湖岸取外套” → “监护人短暂离开现场”'],type:'rewrite'},
    phone:{name:'老式电话答录机',icon:'answer-phone',label:'邱圆的 MP3 / 未听完的录音',detail:'夏满借过邱圆的 MP3 录琴；电话中途被两名成人打断。',lines:['夏满父亲： “事情已经够乱了。孩子走了，我们比谁都难受……公园该负的责任，我们会自己去谈。”','主编： “今晚锁版前，把稿子按要求交上来。你要是还交不上，就别想在雾港日报活下去。”','邱圆： “夏满之前借过我的 MP3……里面后来有一段不是她弹的。我听见——”　（椅子倒地）男声：“谁让你打这个电话的？” 女声：“给我，别碰那个。”'],type:'answerphone'}
  };
  function desk(){ const done=s.deskDone; if(done.length===3) return restored(); scene('desk', `<div class="chapter-copy"><h2>林越的工位</h2><p>雨声压过走廊尽头的空调声。三件物品安静地留在桌面上。</p><div class="investigation-grid">${Object.entries(prop).map(([id,p])=>`<button class="prop-card ${done.includes(id)?'done':''}" data-prop="${id}"><div class="prop-icon ${p.icon}"></div><h3>${p.name}</h3><p>${done.includes(id)?'已完成核验':'点击查看'}</p></button>`).join('')}</div></div>`); document.querySelectorAll('[data-prop]').forEach(b=>b.onclick=()=>{click(); inspect(b.dataset.prop);}); }
  function inspect(id){ const p=prop[id]; if(s.deskDone.includes(id)){ scene('inspect-'+id, `<div class="evidence-detail"><h3>${p.name}</h3><p class="submission-status">该物品已完成核验，线索已收纳至调查卷宗。</p></div>`, [{text:'返回林越的工位',fn:desk}]); return; } scene('inspect-'+id, `<div class="evidence-detail"><h3>${p.name}</h3><p>请自由标记你希望写入卷宗的信息。所有标记均作为材料归档，不判定对错。</p>${p.lines.map((l,i)=>`<button class="evidence-line" data-line="${i}">${l}</button>`).join('')} ${id==='pc'?'<div class="typed-note cursor">原始终稿存档：地下二层 / 社会新闻旧档案室。</div>':''}</div>`, [{text:'归档已标记信息',fn:()=>{s.deskDone.push(id); save(); captureEvidence({id:p.type==='note'?'clue-paper':p.type==='rewrite'?'clue-rewrite':'clue-phone',label:p.label,detail:p.detail,type:p.type,art:`<strong>${p.name}</strong>`}); }},{text:'返回林越的工位',fn:desk}]); document.querySelectorAll('.evidence-line').forEach(x=>x.onclick=()=>{click();x.classList.toggle('selected');}); }
  function restored(){ play('system-sfx',.65); scene('restored', `<div class="chapter-copy"><div class="access-restored"><p>答录机的红灯熄灭。走廊尽头的电梯指示灯逐级亮起。</p><b>B2 / SOCIAL ARCHIVE / ACCESS RESTORED</b><p>地下二层备用供电已恢复。电梯权限已解除。</p></div>${systemBlock('【任务更新】前往地下二层。', `找到林越存档的原始终稿。<br>当前稿件状态：${s.submission || '暂缓提交'}。`)}</div>`, [{text:'前往地下二层',fn:chapterEnd}]); }
  function chapterEnd(){ scene('chapter-end','<div class="section-complete"><h2>第一章完成</h2><p>原始终稿尚未开启。</p><p>第二章：被撤下的最终版</p></div>',[{text:'查看调查卷宗',fn:()=>{$('#notebook-toggle').click();}},{text:'结束试玩',fn:()=>showModal('<p>试玩章节已完成。</p><p>原始终稿将在下一章开启。</p>')}]); }
  function resume(){
    if(!s.powered){ scene('idle','<div class="boot-screen"><div><p>雾港日报夜班终端</p><p class="small-muted">请按下主机开机键</p></div></div>'); return; }
    setSoundscape(['chapter-card','environment','desktop','final-draft','desk','restored','chapter-end'].includes(s.scene)?'storm':'intro');
    const restore = { bind:bindingStart,name:nameInput,persona:personaPick,pollution:pollutionDraw,loader:loader,identity:identity,briefing:briefing,'rewind-guide':rewindGuide,'chapter-card':chapterStart,environment:environment,desktop:desktop,'final-draft':()=>finalDraft(2),check:startCheck,desk:desk,restored:restored,'chapter-end':chapterEnd };
    (restore[s.scene] || bindingStart)();
  }
  renderNotebook(); resume();
})();
