(() => {
  'use strict';
  const KEY = 'fogport-seventh-night-v3';
  const $ = (s) => document.querySelector(s);
  const body = $('#scene-body'), choices = $('#choices'), title = $('#scene-title');
  const notebook = $('#notebook'), notebookContent = $('#notebook-content'), caseCount = $('#case-count');
  const modal = $('#system-modal'), modalCopy = $('#modal-copy'), modalOk = $('#modal-ok'), modalCancel = $('#modal-cancel');
  const capture = $('#evidence-capture'), captureSubject = $('#capture-subject'), captureLabel = $('#capture-label'), captureStore = $('#capture-store');
  const audio = Object.fromEntries(['ambience','rain','click-sfx','choice-sfx','popup-sfx','correct-sfx','error-sfx','system-sfx','startup-sfx','rewind-sfx','chapter-sfx'].map(id => [id, $('#' + id)]));
  let modalAction = null, modalCancelAction = null, captureItem = null, pollutionTimer = null, sceneToken = 0;
  const blank = () => ({ scene:'idle', powered:false, name:'', persona:'', pollution:null, submission:'', clues:[], marked:{}, deskDone:[], phoneHeard:[], notebookGuided:false, notebookGuideVersion:0, quipHistory:[] });
  let s;
  try { s = { ...blank(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { s = blank(); }
  const save = () => localStorage.setItem(KEY, JSON.stringify(s));
  const play = (name, volume = 1) => { const a = audio[name]; if (!a) return; a.pause(); a.currentTime = 0; a.volume = volume; a.play().catch(() => {}); };
  const click = () => play('choice-sfx', .58);
  const scene = (name, html, buttons = [], after = null) => {
    const token = ++sceneToken;
    s.scene = name; save(); title.textContent = name === 'idle' ? '终端未启动' : '雾港日报 / 夜班编辑部';
    // Build off-screen first. Typed nodes are emptied before they ever enter the visible DOM,
    // so the player never sees a one-frame flash of the complete paragraph.
    const stage = document.createElement('div');
    stage.className = 'staged-content';
    stage.innerHTML = html;
    stage.querySelectorAll('[data-type]').forEach(node => {
      node.dataset.fullText = node.textContent;
      node.textContent = '';
      node.classList.add('typing-pending');
    });
    body.replaceChildren(stage); choices.innerHTML = '';
    const renderButtons = () => { if (token !== sceneToken) return; buttons.forEach(({ text, fn, cls = '' }) => addChoice(text, fn, cls)); };
    const revealDeferred = () => { if (token !== sceneToken) return; const hasDeferred = !!body.querySelector('.deferred-system'); body.querySelectorAll('.deferred-system').forEach(x => x.classList.add('is-visible')); setTimeout(() => after ? after(renderButtons) : renderButtons(), hasDeferred ? 520 : 240); };
    const lines = [...body.querySelectorAll('[data-type]')];
    let index = 0;
    const typeNext = () => {
      if (token !== sceneToken) return;
      if (index >= lines.length) { revealDeferred(); return; }
      const node = lines[index++], text = node.dataset.fullText || ''; node.classList.remove('typing-pending'); node.classList.add('typing-line'); let pos = 0;
      const timer = setInterval(() => { if (token !== sceneToken) { clearInterval(timer); return; } node.textContent += text[pos++] || ''; if (pos > text.length) { clearInterval(timer); node.classList.remove('typing-line'); setTimeout(typeNext, 420); } }, 52);
    };
    if (lines.length) typeNext(); else setTimeout(revealDeferred, 120);
  };
  const addChoice = (text, fn, cls = '') => { const b = document.createElement('button'); b.className = cls; b.textContent = '＞ ' + text; b.addEventListener('click', () => { click(); fn(); }); choices.appendChild(b); };
  const setSoundscape = (kind) => {
    if (kind === 'storm') { audio.ambience.volume = .08; audio.rain.volume = .62; }
    else { audio.ambience.volume = .28; audio.rain.volume = .13; }
    [audio.ambience,audio.rain].forEach(a => a.play().catch(() => {}));
  };
  const aside = (node = 'general') => {
    // Each personality gets a deliberately large pool. Keep recent lines out of
    // rotation so a replay never sounds like the system is stuck on one catchphrase.
    const lists = {
      '毒舌':['世界没挑你，挺公平的。','材料堆得很整齐，像一场精心布置的推诿。','你继续点，真相不会自己从抽屉里爬出来。','这份稿子很安全，安全到像没发生过事。','挺好，至少你还知道先看再下结论。','一句“意外”就想封箱，省事得令人敬佩。','别急着感动，眼泪不是证据，最多算潮湿。','有人把重点藏得很认真，你也可以找得认真一点。','记录写得越圆滑，越像有人怕你硌着。','别替他们补完解释，那是他们该做的事。','又一份漂亮说辞。包装得像礼物，里面未必有东西。','你终于按对了。别高兴太早，路还长。'],
      '温柔':['终于见面了呀。希望你会喜欢这里，嘻嘻。','慢一点也没关系，急着盖章的人通常最怕你看清。','这盏灯一直亮着呢，好像有人还在等你。','请把它收好呀，有些话一旦散了，就很难拼回来。','别怕，门会开的；会关上的，通常是人心。','这句话很轻呢，可是压在谁身上就不一定轻了。','你看，线索自己不会说话；所以要劳烦你替它记住呀。','先别急着给谁定罪，好吗？急的人往往最想你快一点。','嗯，这份记录很完整。完整得像是被人仔细修剪过。','把它放进卷宗吧。好东西要收好，坏心思也是。','你做得很好呀。再往前一点，就能看见更多了。','别回头。至少现在还不需要。'],
      '梗王':['世界匹配成功。不是弹窗广告，真·沉浸式副本。','这材料的信息密度，属于复制到拼多多也没反应那档。','档案权限解锁。家人们，副本现在开始上强度。','这个修改记录，疑似有低人指点。','看懂的扣 1，看不懂的先别急着开庭。','好家伙，这叙述主打一个“我没说，但你别问”。','信息已入库，属于是电子榨菜里夹到一颗钉子。','这事儿越看越像洋葱：扒一层，眼睛就开始不太舒服。','别急，真相加载慢不是卡，是有人在后台撤回消息。','这条线索有点东西，建议先收藏，别让它被算法埋了。','家人们，疑似发现隐藏支线，先别滑走。','我请问呢，这种说法是准备参加“最会省略细节”大赛吗？']
    };
    const a = lists[s.persona] || lists['梗王'];
    if (!Array.isArray(s.quipHistory)) s.quipHistory = [];
    // Do not repeat a quip during the same playthrough.  Once a whole pool is
    // exhausted, still exclude the immediately preceding one.
    const used = new Set(s.quipHistory);
    let available = a.filter(line => !used.has(line));
    const last = s.quipHistory[s.quipHistory.length - 1];
    if (!available.length) available = a.filter(line => line !== last);
    const picked = (available.length ? available : a)[Math.floor(Math.random() * (available.length || a.length))];
    s.quipHistory.push(picked);
    if (s.quipHistory.length > 24) s.quipHistory = s.quipHistory.slice(-24);
    save();
    return picked;
  };
  const systemPopup = (fact, data = '', withAside = true) => `<div class="system-popup"><p class="system-popup__fact">${fact}</p>${withAside ? `<p class="system-popup__aside">${aside()}</p>` : ''}${data ? `<p class="system-popup__data">${data}</p>` : ''}</div>`;
  const showModal = (html, ok = null, cancel = null, titleText = '人生系统 · 警告', okText = '收到', cancelText = '取消') => { modal.classList.remove('hidden'); modal.querySelector('.pixel-title').textContent = titleText; modalCopy.innerHTML = html; modalOk.textContent = okText; modalCancel.textContent = cancelText; modalCancel.classList.toggle('hidden', !cancel); modalAction = ok; modalCancelAction = cancel; play('popup-sfx', .62); };
  modalOk.onclick = () => { click(); modal.classList.add('hidden'); const fn = modalAction; modalAction = null; fn && fn(); };
  modalCancel.onclick = () => { click(); modal.classList.add('hidden'); const fn = modalCancelAction; modalCancelAction = null; fn && fn(); };
  const addClue = (id, label, type, detail) => { if (!s.clues.some(c => c.id === id)) s.clues.push({id,label,type,detail}); save(); renderNotebook(); };
  const folders = [
    {id:'paper',title:'夏满案 / 当晚行程说法', clue:'clue-paper', icon:'📝'},
    {id:'rewrite',title:'夏满案 / 事发地点初始表述', clue:'clue-rewrite', icon:'▣'},
    {id:'father',title:'夏满案 / 家属口述摘录', clue:'clue-phone-0', icon:'☎'},
    {id:'editor',title:'雾港日报 / 锁版催稿录音', clue:'clue-phone-1', icon:'▣'},
    {id:'qiuyuan',title:'夏满案 / 同学未听完的留言', clue:'clue-phone-2', icon:'♫'},
    {id:'locked-a',title:'雾港旧案 / 未解锁材料', clue:null, icon:'?'},
    {id:'locked-b',title:'社会新闻旧档 / 未解锁材料', clue:null, icon:'?'}
  ];
  const fatherFolder = folders.find(f => f.id === 'father');
  if (fatherFolder) fatherFolder.title = '\u590f\u6ee1\u7236\u4eb2 / \u5bf9\u5916\u53e3\u8ff0';
  const clueFor = id => s.clues.find(c => c.id === id);
  const renderNotebook = (folderId = null) => {
    caseCount.textContent = String(s.clues.length).padStart(2,'0');
    const current = folders.find(f => f.id === folderId);
    const shell = inner => `<div class="explorer-window"><div class="explorer-window__title">调查卷宗　—　${current ? current.title : '案件文件夹'}</div><div class="explorer-toolbar"><span>文件　编辑　查看　收藏　工具　帮助</span><span>⌕</span></div><div class="explorer-main"><aside class="explorer-side"><b>常用位置</b><span>▣ 最近归档</span><span>▣ 夏满案</span><span>▣ 雾港旧案</span><span>▣ 社会新闻</span></aside><section class="explorer-files">${inner}</section></div><div class="explorer-status">${s.clues.length} 个已归档项目　　双击文件夹查看材料</div></div>`;
    if (current) {
      const clue = current.clue && clueFor(current.clue);
      notebookContent.innerHTML = shell(`<button class="explorer-back" data-folder-back>← 返回文件夹</button>${clue ? `<button class="file-row" data-clue="${clue.id}"><i class="file-row__icon">${current.icon}</i><span><b>${clue.label}</b><small>${clue.detail || '已归档'}</small></span></button>` : '<p class="folder-empty">该文件夹尚未写入材料。</p>'}`);
      notebookContent.querySelector('[data-folder-back]').onclick = () => { click(); renderNotebook(); };
      const file = notebookContent.querySelector('[data-clue]');
      if (file) file.onclick = () => { click(); showModal(`<p><strong>${clue.label}</strong></p><p>${clue.detail}</p>`, null, null, '调查卷宗 · 文件详情'); };
      return;
    }
    notebookContent.innerHTML = shell(`<div class="folder-grid">${folders.map(f => { const unlocked=!!(f.clue && clueFor(f.clue)); return `<button class="folder-tile ${unlocked?'unlocked':'locked'}" data-folder="${f.id}" ${unlocked?'':'disabled'}><i class="folder-tile__icon">${unlocked?'': '▧'}</i><span>${f.title}</span><small>${unlocked?'已归档':'未解锁'}</small></button>`; }).join('')}</div>`);
    notebookContent.querySelectorAll('[data-folder]').forEach(b => { const open = () => { click(); renderNotebook(b.dataset.folder); }; b.onclick=open; b.ondblclick=open; });
  };
  $('#notebook-toggle').onclick = () => { click(); notebook.classList.remove('hidden'); renderNotebook(); };
  $('#notebook-close').onclick = () => { click(); notebook.classList.add('hidden'); };
  function captureEvidence(item) { captureItem = item; captureSubject.className = 'photo-subject ' + item.type; captureSubject.innerHTML = item.art || ''; captureLabel.textContent = item.label; capture.classList.remove('hidden'); capture.setAttribute('aria-hidden','false'); play('correct-sfx', .68); }
  captureStore.onclick = () => {
    click();
    const item = captureItem;
    const isNew = item && !s.clues.some(c => c.id === item.id);
    if (item) { addClue(item.id, item.label, item.type, item.detail); item.onStore && item.onStore(); }
    capture.classList.add('hidden'); capture.setAttribute('aria-hidden','true'); captureItem = null;
    if (s.scene === 'desk' || s.scene.startsWith('inspect-')) desk();
    if (isNew && s.notebookGuideVersion !== 2) {
      s.notebookGuided = true; s.notebookGuideVersion = 2; save();
      $('#notebook-toggle').classList.add('guided');
      setTimeout(() => showModal(systemPopup('【调查卷宗已更新】','已归档的物证会保存在屏幕右上角的“调查卷宗”。<br>可按分类文件夹查看材料，不会中断当前调查。'), () => $('#notebook-toggle').classList.remove('guided'), null, '人生系统 · 新手指引', '我明白了'), 180);
    } else if (isNew) {
      setTimeout(() => showModal(systemPopup('【材料已归档】',`${item.label}<br>已写入调查卷宗。`), null, null, '人生系统 · 归档完成'), 180);
    }
  };
  function powerOn() { if (s.powered) return; s.powered = true; save(); play('click-sfx', .65); play('startup-sfx', .58); setSoundscape('intro'); scene('boot', '<div class="boot-screen"><div><div class="winmark">▣</div><h1>Windows</h1><div class="loadbar"><b></b></div><p>正在启动雾港日报终端……</p></div></div>'); setTimeout(bindingStart, 2700); }
  $('#power-button').onclick = powerOn;
  $('#rewind-button').onclick = () => { if (!s.powered) return; showModal('<p><strong>是否回溯至最初绑定？</strong></p><p>本机进度与已归档线索将被清空。</p>', () => { play('rewind-sfx', .7); $('#glitch-overlay').classList.add('active'); localStorage.removeItem(KEY); setTimeout(() => location.reload(), 900); }, null, '人生系统 · 回溯确认', '确认回溯'); };
  function bindingStart() { scene('bind', `<div class="intro-copy"><h2 data-type>人生系统正在接管终端</h2><p data-type>正在检测可绑定对象……</p><p class="small-muted scan-pulse" data-type>请确认是否接受绑定。</p></div>`, [{text:'接受绑定', fn:nameInput}]); }
  function nameInput() { scene('name', `<div class="intro-copy"><h2 data-type>请输入你的名字。</h2><p data-type>该名称将用于本次试炼世界的临时身份记录。</p><div class="bind-form deferred-system"><input id="name-input" maxlength="12" autocomplete="off" placeholder="输入姓名或昵称"></div></div>`, [{text:'确认', fn:() => { const n = $('#name-input').value.trim(); if (!n) { play('error-sfx',.65); $('#name-input').focus(); return; } s.name = n; save(); personaPick(); }}]); setTimeout(() => $('#name-input')?.focus(), 3000); }
  function personaPick() { scene('persona', `<div class="intro-copy"><h2 data-type>请选择与你同行的系统人格。</h2><p data-type>它会影响系统的说话方式，不会影响结局。</p><div class="persona-grid deferred-system"><button class="persona-card" data-p="毒舌"><h3>毒舌</h3><p>语言犀利，擅长反讽与挑出漏洞。</p></button><button class="persona-card" data-p="温柔"><h3>温柔</h3><p>永远笑眯眯地说话；话里有没有别的意思，慢慢听。</p></button><button class="persona-card" data-p="梗王"><h3>梗王</h3><p>混迹互联网十年的冲浪选手；不保证每个梗都在你的年代。</p></button></div></div>`); document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{ click(); s.persona=b.dataset.p; save(); pollutionDraw(); }); }
  function pollutionDraw() { scene('pollution', `<div class="intro-copy pollution-box"><h2 data-type>初始污染度抽取器已就绪</h2><p data-type>该数值仅记录你进入世界时的异常适配度。</p><div class="deferred-system"><div id="pollution-number" class="pollution-number">--%</div><p id="pollution-state" class="small-muted">等待抽取。</p></div></div>`, [{text:'开始抽取', fn: startPollution}]); }
  function startPollution() { const n = $('#pollution-number'), state = $('#pollution-state'); if (!n || pollutionTimer) return; play('system-sfx',.6); let ticks = 0; pollutionTimer = setInterval(()=>{ n.textContent = (Math.floor(Math.random()*61)+20) + '%'; ticks++; if(ticks >= 22){ clearInterval(pollutionTimer); pollutionTimer = null; s.pollution = Math.floor(Math.random()*61)+20; n.textContent = s.pollution + '%'; state.textContent = '抽取完成。该数值已写入本机记录。'; save(); choices.innerHTML = ''; const b=document.createElement('button'); b.textContent='＞ 确认数值'; b.onclick=()=>{click(); loader();}; choices.appendChild(b); }},85); }
  function loader(){ scene('loader', '<div class="boot-screen loading"><div><h1>正在建立试炼连接</h1><div class="loadbar"><b></b></div><p>人格参数已写入。请保持终端连接。</p></div></div>'); setTimeout(bindingSuccess,2600); }
  function bindingSuccess(){ const fact = `✦【绑定成功】<br>绑定对象：${s.name}<br>世界匹配成功。`; const data = `试炼世界：《雾港第七夜》<br>初始污染度：${s.pollution}%`; showModal(systemPopup(fact, data), projection, null, '人生系统 · 绑定成功'); }
  function projection(){ play('chapter-sfx',.58); scene('projection','<div class="chapter-card"><h1 data-type>正在投入试炼世界……</h1><p data-type>请保持终端连接</p></div>'); setTimeout(identity,3400); }
  function identity(){ scene('identity', `<div class="intro-copy"><div class="id-card"><div class="id-card__top">雾港日报　夜班通行证</div><div class="id-card__identity"><img src="assets/player-avatar.png" alt="临时记者头像"><dl class="id-card__grid"><dt>姓名</dt><dd>${s.name}</dd><dt>职业</dt><dd>夜班实习记者</dd><dt>报社</dt><dd>雾港日报</dd><dt>班次</dt><dd>临时顶替</dd><dt>状态</dt><dd class="danger">代班对象失联</dd></dl></div><small>WG-071 / LOCAL</small></div></div>`, [{text:'确认身份',fn:briefing}]); }
  function briefing(){ scene('briefing', `<div class="intro-copy book-copy"><h2 data-type>午夜交接</h2><p data-type>你的前辈，林越。</p><p data-type>雾港日报夜班记者。</p><p data-type>十二小时前，他在追查一篇被反复撤下的稿件后失联。</p><p data-type>他的工位还亮着。</p></div>`, [{text:'继续',fn:rewindGuide}]); }
  function rewindGuide(){ $('#rewind-button').classList.add('guided'); scene('rewind-guide', `<div class="intro-copy book-copy"><h2 data-type>终端操作说明</h2><p data-type>键盘右上角有一枚比其他按键更亮的圆键。</p></div>`, [], () => showModal(systemPopup('【回溯键】', '需要清空本机进度、重新体验时，可按下键盘右上角的回溯键。<br>开机键仅在游戏开始前有效；进入世界后不会再响应。', false), chapterStart, null, '人生系统 · 操作说明', '我明白了')); }
  function chapterStart(){ $('#rewind-button').classList.remove('guided'); setSoundscape('storm'); play('chapter-sfx',.58); scene('chapter-card','<div class="chapter-card"><h1 data-type>第一章</h1><p data-type>交接前的灯</p><p class="small-muted" data-type>雨声载入中……</p></div>',[{text:'开始夜班',fn:environment}]); }
  function environment(){ scene('environment', `<div class="chapter-copy book-copy"><p data-type>窗外的雨斜着打在玻璃上，霓虹被雨水揉成模糊的色块。远处港口有一声闷长的汽笛。</p><p data-type>整层编辑部只亮着一盏工位灯。林越的座位没有人，电脑却仍在运行；桌上的答录机指示灯规律闪烁。</p></div>`,[],() => showModal(systemPopup('加载完成：夜班编辑部。','',true), () => addChoice('走向林越的工位',desktop), null, '人生系统 · 夜班接入')); }
  function desktop(){ scene('desktop', `<div class="desktop-scene"><div class="desktop-icons"><button class="desktop-icon icon-docs"><i></i><span>我的文档</span></button><button class="desktop-icon icon-browser"><i></i><span>港务浏览器</span></button><button class="desktop-icon icon-intranet"><i></i><span>雾港日报内网</span></button><button class="desktop-icon icon-recycle"><i></i><span>回收站</span></button></div><button id="final-doc" class="desktop-doc"><b>W</b>静湖公园女童不慎落水_最终稿.doc</button><div class="guide-tip">林越留下的最终稿尚未提交。<br>双击文档，完成夜班交接。</div></div>`); $('#final-doc').onclick=()=>{click(); finalDraft(0);}; }
  const pages = [
    '<h2>《静湖公园女童不慎落水》</h2><p class="small-muted">最终稿 / 待提交</p><p>昨晚，雾港北郊静湖公园发生一起女童落水事件。</p><p>八岁女孩夏满在园内湖岸区域不慎落水，经抢救无效死亡。</p>',
    '<p>据其父亲夏成海口述，当晚他原本带女儿前往公园湖边夜钓。</p><p>天气转冷后，夏满表示身体发冷。</p><p>夏成海称，自己随即返回停车处取厚外套。</p>',
    '<p>其短暂离开期间，孩子意外落水。</p><p>事发后，夏成海情绪激动，认为公园救生设施与夜间巡查存在管理缺口。</p><p>家属已就相关责任与园方协商。</p>'
  ];
  function finalDraft(i){ scene('final-draft', `<div class="word-window"><div class="word-window__bar">静湖公园女童不慎落水_最终稿.doc　_ □ ×</div><div class="word-window__menu">文件　编辑　查看　插入　格式　工具　帮助</div><article class="word-page">${pages[i]}</article><footer class="word-footer"><span>第 ${i+1} 页 / 共 3 页</span><span>最后修改：昨日 20:31</span></footer></div>`, i<2?[{text:'下一页',fn:()=>finalDraft(i+1)}]:[{text:'提交最终稿',fn:submitConfirm}]); }
  function submitConfirm(){ showModal('<p><strong>是否提交《静湖公园女童不慎落水》最终稿？</strong></p><p>提交后将进入印刷流程。</p>',()=>autoClose(),()=>{s.submission='暂不提交';save(); deferPrompt();},'人生系统 · 提交确认','是，提交','否，返回'); }
  function autoClose(){ play('error-sfx',.62); showModal(systemPopup('当前稿件存在未核验记录。','是否暂缓提交？',false),()=>{s.submission='异常中止提交';save(); startCheck();},null,'人生系统 · 异常中止','是，暂缓提交'); }
  function deferPrompt(){ showModal('<p><strong>【夜班交接提示】</strong></p><p>你选择暂缓提交。</p><p>在提交前，是否进行一次工位交接核验？</p>',startCheck,()=>finalDraft(2),'人生系统 · 交接核验','开始核验','返回最终稿'); }
  function startCheck(){ scene('check', `<div class="chapter-copy book-copy"><h2 data-type>雾港日报 · 档案权限</h2><p data-type>地下二层旧档案室处于备用供电状态。</p><p data-type>当前工位交接核验完成后，电梯与档案室权限将恢复。</p></div>`,[],() => showModal(systemPopup('待核验物品：3 件','林越新闻残页、电脑修改记录、老式电话答录机。',true),()=>addChoice('开始工位核验',desk),null,'人生系统 · 任务通知')); }
  const prop = {
    paper:{name:'林越新闻残页',icon:'torn-paper',label:'林越新闻残页 / 未发表线索',detail:'残页记下了夜钓、北侧临水步道与“取厚外套”的说法。',lines:['“孩子说冷。”','“父亲返回停车处取厚外套。”','“北侧临水步道。”','“当晚原计划夜钓。”'],type:'note'},
    pc:{name:'林越的电脑 / 修改记录',icon:'old-pc',label:'林越的电脑 / 修改记录',detail:'地点与行动被泛化；原始终稿存档在地下二层社会新闻旧档案室。',lines:['昨日 20:14　“北侧临水步道” → “园内湖岸区域”','昨日 20:16　“父亲离开湖岸取外套” → “监护人短暂离开现场”'],type:'rewrite'},
    phone:{name:'老式电话答录机',icon:'answer-phone',type:'answerphone'}
  };
  function desk(){ const done=s.deskDone; if(done.length===3) return restored(); scene('desk', `<div class="chapter-copy"><h2>林越的工位</h2><p>雨声压过走廊尽头的空调声。三件物品安静地留在桌面上。</p><div class="investigation-grid">${Object.entries(prop).map(([id,p])=>`<button class="prop-card ${done.includes(id)?'done':''}" data-prop="${id}"><div class="prop-icon ${p.icon}"></div><h3>${p.name}</h3><p>${done.includes(id)?'已完成核验':'点击查看'}</p></button>`).join('')}</div></div>`); document.querySelectorAll('[data-prop]').forEach(b=>b.onclick=()=>{click(); inspect(b.dataset.prop);}); }
  function inspect(id){
    const p=prop[id];
    if(id==='phone') return inspectAnswerPhone();
    if(s.deskDone.includes(id)){ scene('inspect-'+id, `<div class="evidence-detail"><h3>${p.name}</h3><p class="submission-status">该物品已完成核验，相关材料已收纳至调查卷宗。</p></div>`, [{text:'返回林越的工位',fn:desk}]); return; }
    scene('inspect-'+id, `<div class="evidence-detail"><h3>${p.name}</h3><p>可标记多条材料。它们都会进入卷宗，不判定对错。</p>${p.lines.map((l,i)=>`<button class="evidence-line" data-line="${i}">${l}</button>`).join('')} ${id==='pc'?'<div class="typed-note cursor">原始终稿存档：地下二层 / 社会新闻旧档案室。</div>':''}</div>`, [{text:'归档所选材料',fn:()=>{
      const marked=[...document.querySelectorAll('.evidence-line.selected')];
      if(!marked.length){ play('error-sfx',.65); showModal('<p><strong>尚未标记材料。</strong></p><p>请先点击一条或多条你希望归档的信息。</p>',null,null,'人生系统 · 标记提示'); return; }
      s.deskDone.push(id); save(); captureEvidence({id:p.type==='note'?'clue-paper':'clue-rewrite',label:p.label,detail:p.detail,type:p.type,art:`<strong>${p.name}</strong>`});
    }},{text:'返回林越的工位',fn:desk}]); document.querySelectorAll('.evidence-line').forEach(x=>x.onclick=()=>{click();x.classList.toggle('selected');});
  }
  const answerMessages = [
    {label:'夏满父亲 / 对外口述',detail:'夏满父亲要求报道不要继续发酵，并称会自行与园方谈责任。',voice:'事情已经够乱了。孩子走了，我们比谁都难受。公园该负的责任，我们会自己去谈。'},
    {label:'主编 / 锁版催稿',detail:'主编要求林越按修改意见完成终稿，并以去留施压。',voice:'今晚锁版前，把稿子按要求交上来。你要是还交不上，就别想在雾港日报活下去。'},
    {label:'邱圆 / 未听完的留言',detail:'邱圆提到夏满借过她的 MP3 录琴；留言被两名成人强行打断。',voice:'夏满之前借过我的 MP3。里面后来有一段不是她弹的。我听见—— 谁让你打这个电话的？给我，别碰那个。'}
  ];
  function speakRecording(text, done){
    if(!('speechSynthesis' in window)){ setTimeout(done, 1900); return; }
    speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang='zh-CN'; u.rate=.88; u.pitch=.88; u.onend=done; u.onerror=done; speechSynthesis.speak(u);
  }
  function inspectAnswerPhone(){
    const heard=s.phoneHeard||[];
    scene('inspect-phone', `<div class="answer-machine-panel"><h3>老式电话答录机</h3><p>红灯闪烁。机身里存有三条未听取的语音留言。</p><div class="answer-machine-screen"><b id="answer-status">${heard.length}/3 条留言已播放</b><span>MSG / REC / PLAY</span><i></i><i></i><i></i></div><div class="answer-buttons">${answerMessages.map((m,i)=>`<button data-message="${i}" class="${heard.includes(i)?'heard':''}"><b>▶</b> 留言 ${String(i+1).padStart(2,'0')}　${heard.includes(i)?'已归档':'播放'}</button>`).join('')}</div></div>`, [{text:'返回林越的工位',fn:desk}]);
    document.querySelectorAll('[data-message]').forEach(b=>b.onclick=()=>{
      const i=Number(b.dataset.message); if((s.phoneHeard||[]).includes(i)){ play('error-sfx',.35); return; }
      click(); b.disabled=true; b.innerHTML='<b>▮▮</b> 正在播放…'; document.querySelector('#answer-status').textContent='正在播放语音留言 '+String(i+1).padStart(2,'0');
      speakRecording(answerMessages[i].voice,()=>{
        if(!s.phoneHeard) s.phoneHeard=[]; if(!s.phoneHeard.includes(i)) s.phoneHeard.push(i);
        if(s.phoneHeard.length===answerMessages.length && !s.deskDone.includes('phone')) s.deskDone.push('phone');
        save();
        const m=answerMessages[i]; captureEvidence({id:'clue-phone-'+i,label:m.label,detail:m.detail,type:'answerphone',art:`<strong>${m.label}</strong>`});
      });
    });
  }
  function restored(){ play('system-sfx',.65); scene('restored', `<div class="chapter-copy"><div class="access-restored"><p data-type>答录机的红灯熄灭。走廊尽头的电梯指示灯逐级亮起。</p><b>B2 / SOCIAL ARCHIVE / ACCESS RESTORED</b><p data-type>地下二层备用供电已恢复。电梯权限已解除。</p></div></div>`,[],() => showModal(systemPopup('【任务更新】前往地下二层。', `找到林越存档的原始终稿。<br>当前稿件状态：${s.submission || '暂缓提交'}。`),()=>addChoice('前往地下二层',chapterEnd),null,'人生系统 · 任务通知')); }
  function chapterEnd(){ scene('chapter-end','<div class="section-complete"><h2>第一章完成</h2><p>原始终稿尚未开启。</p><p>第二章：被撤下的最终版</p></div>',[],()=>showModal(systemPopup('【章节节点已抵达】','原始终稿尚未开启。<br>下一站：地下二层 / 社会新闻旧档案室。'),()=>{addChoice('查看调查卷宗',()=>{$('#notebook-toggle').click();});addChoice('结束试玩',()=>showModal(systemPopup('试玩章节已完成。','原始终稿将在下一章开启。'),null,null,'人生系统 · 试玩结束'));},null,'人生系统 · 章节完成','继续')); }
  function resume(){
    if(!s.powered){ scene('idle','<div class="boot-screen"><div><p>雾港日报夜班终端</p><p class="small-muted">请按下主机开机键</p></div></div>'); return; }
    setSoundscape(['chapter-card','environment','desktop','final-draft','desk','restored','chapter-end'].includes(s.scene)?'storm':'intro');
    const restore = { bind:bindingStart,name:nameInput,persona:personaPick,pollution:pollutionDraw,loader:loader,identity:identity,briefing:briefing,'rewind-guide':rewindGuide,'chapter-card':chapterStart,environment:environment,desktop:desktop,'final-draft':()=>finalDraft(2),check:startCheck,desk:desk,restored:restored,'chapter-end':chapterEnd };
    (restore[s.scene] || bindingStart)();
  }
  renderNotebook(); resume();
})();
