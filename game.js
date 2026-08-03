const KEY='fogport-demo-v2',$=s=>document.querySelector(s),T=$('#scene-title'),B=$('#scene-body'),C=$('#choices'),S=$('.screen');
let modalAction=()=>{};
const playCue=type=>{const id=type==='error'?'#error-sfx':type==='archive'?'#correct-sfx':type==='system'?'#system-sfx':'#popup-sfx',audio=$(id);audio.currentTime=0;audio.play().catch(()=>{})};
const playChoiceClick=()=>{const audio=$('#choice-sfx');audio.currentTime=0;audio.play().catch(()=>{})};
const pop=(text,type='warning',onOk=()=>{})=>{playCue(type);$('.pixel-modal').className='pixel-modal '+type;$('#modal-copy').innerHTML='<span class="pixel-icon">'+(type==='error'?'✖':'⚠')+'</span>'+text.replace(/\n/g,'<br>');modalAction=onOk;$('#modal-ok').textContent='收到';$('#modal-cancel').classList.add('hidden');$('#system-modal').classList.remove('hidden')};
let s=JSON.parse(localStorage.getItem(KEY)||'null')||{scene:'boot',powered:false,name:'',wish:'',persona:'冷静',clues:[],seen:[]};
const data={note:['林越的便笺','校门口那个孩子……她一直在等。'],rewrite:['被淡化的报道','“港区小学女生意外身亡”被改成“雨夜安全提醒”。'],program:['撕坏的节目单','……满 / 邱圆'],boss:['总编的电话','“明早之前，别让那件事再上版面。”'],doll:['湿透的玩偶','衣领里夹着一片节目单。'],mark:['雨夜标记','一段无法阅读的涂鸦。'],photo:['被裁掉人物的合照','她和邱圆约好一起上台。']};
const music=$('#ambience'),rainAudio=$('#rain');
const fadeAudio=(audio,target)=>{clearInterval(audio._fogportFade);audio._fogportFade=setInterval(()=>{const next=audio.volume+(target-audio.volume)*.18;if(Math.abs(next-target)<.012){audio.volume=target;clearInterval(audio._fogportFade);return}audio.volume=next},80)};
const setSoundscape=mode=>{const storm=mode==='storm';fadeAudio(music,storm?.08:.30);fadeAudio(rainAudio,storm?.62:.12);if(s.powered){music.play().catch(()=>{});rainAudio.play().catch(()=>{})}};
const save=()=>localStorage.setItem(KEY,JSON.stringify(s)),go=x=>{s.scene=x;if(['chapter1','arrival','desk','rain'].includes(x))setSoundscape('storm');save();render()},btn=a=>{C.innerHTML='';a.forEach(([x,f])=>{let b=document.createElement('button');b.className='choice';b.textContent=x;b.onclick=()=>{playChoiceClick();f()};C.append(b)})},add=x=>{if(!s.clues.includes(x))s.clues.push(x);save()};
const systemCopy={
  '毒舌':{
    binding:n=>'绑定对象：'+n+'。世界也没挑你，挺公平的。',
    arrival:'落地成功。新闻社没有欢迎仪式，只有一张失踪者留下的夜班表。',
    editorTask:'主任务：核对林越留下的四处资料。把他的烂摊子收好，别把自己也归档了。',
    rule:'新规则来了。记住它，毕竟你没有第二条命可以拿来做阅读理解。',
    complete:'四处资料已核对。地下档案室开门了——多么适合加班的地方。',
    demoEnd:'试玩到此。恭喜，你暂时还没被写进明天的讣告。'
  },
  '温柔':{
    binding:n=>'已为 '+n+' 系好投放带哦，嘻嘻。请不要把手伸出世界边界。',
    arrival:'欢迎来到雾港日报的夜班。林越把桌子留给你了，也把没说完的话留给你了呢。',
    editorTask:'请轻轻核对工作台上的四处资料呀。漏掉任何一处都没关系，系统会替你把后果记得很清楚。',
    rule:'新的生存规则送达啦。照着做就好，乖一点总是比较省事的，嘻嘻。',
    complete:'四处资料都整理好了。接下来请去地下档案室，把林越的未完成稿件送进去吧。',
    demoEnd:'试玩暂告一段落。请带好卷宗，雾港会记得你来过。嘻嘻。'
  },
  '梗王':{
    binding:n=>'玩家 '+n+' 已接入，世界匹配成功。不是弹窗广告，真·沉浸式副本，666。',
    arrival:'加载完成：夜班编辑部。前辈失联、工位亮着，这剧情开场多少有点高能。',
    editorTask:'主任务刷新：核对林越留下的四处资料。先别慌，线索不会跑——大概。',
    rule:'规则更新！这题不考选择题，答错直接进入都市传说限定皮肤，OMG。',
    complete:'四份资料打包成功。下一站地下档案室，副本难度疑似上调，请玩家做好表情管理。',
    demoEnd:'试玩章节暂时收工。你还在线，系统也还在线，双赢，老铁。'
  }
};
const resolveSystemCopy=(persona,kind)=>{const value=persona[kind];return typeof value==='function'?value(s.name||'访客'):value};
const sys=(kind,extra='')=>{const persona=systemCopy[s.persona]||systemCopy['梗王'];return '<section class="system system-'+(s.persona||'梗王')+'"><div class="system__head">系统</div><p>'+resolveSystemCopy(persona,kind)+'</p>'+(extra?'<p class="system__data">'+extra+'</p>':'')+'</section>'};
const systemPop=(kind,title,extra='',type='system')=>{const persona=systemCopy[s.persona]||systemCopy['梗王'];pop('【'+title+'】\n'+resolveSystemCopy(persona,kind)+(extra?'\n\n'+extra:''),type)};
function render(){S.classList.toggle('off',!s.powered);$('#power-button').classList.toggle('awaiting-power',!s.powered);if(!s.powered)return;let n=s.name||'访客';
if(s.scene==='boot'){T.textContent='';B.innerHTML='<div class="snow"></div><p class="bootline">▌</p>';C.innerHTML='';setTimeout(()=>{if(s.scene==='boot'){B.innerHTML='<div class="snow"></div><p class="binding">检测到未完成愿望<br>人生系统正在接管终端</p>';btn([['接受绑定',()=>go('name')]])}},700);return}
if(s.scene==='name'){T.textContent='绑定校验';B.innerHTML='<p class="question">请输入你的名字。</p><input id="a" autofocus>';btn([['确认',()=>{let v=$('#a').value.trim();if(v){s.name=v;go('persona')}}]]);return}
if(s.scene==='persona'){T.textContent='绑定校验 / 系统人格';B.innerHTML='<p class="question">请选择与你同行的系统人格。</p><p class="subtle">不同人格会用不同语气发布任务、警告与归档提示。</p>';btn([['毒舌：嘴坏、腹黑、爱讲冷笑话',()=>{s.persona='毒舌';go('pollution')}],['温柔：笑眯眯地说最冷的话，嘻嘻',()=>{s.persona='温柔';go('pollution')}],['梗王：旧聊天室与弹幕梗混合体，666',()=>{s.persona='梗王';go('pollution')}]]);return}
if(s.scene==='pollution'){s.pollution=Math.floor(Math.random()*61)+20;T.textContent='异常检测';B.innerHTML='<p class="question">正在抽取初始污染度……</p><p class="pollution">'+s.pollution+'%</p><p class="subtle">数值越高，异常提示越容易干扰你的判断。</p>';btn([['确认检测结果',()=>go('load')]]);return}
if(s.scene==='load'){T.textContent='世界载入中';B.innerHTML='<p>正在校验身份，请勿关闭终端。</p><div class="progress"><b></b></div><p id="p">0%</p>';C.innerHTML='';let p=0,i=setInterval(()=>{p+=5;$('.progress b').style.width=p+'%';$('#p').textContent=p+'%';if(p>=100){clearInterval(i);go('bound')}},55);return}
if(s.scene==='bound'){T.textContent='人生系统 / 绑定完成';B.innerHTML='<div class="fireworks">✦　✧　✦　✧　✦</div><p class="binding">恭喜，绑定成功。</p>'+sys('binding','试炼世界：<b>《雾港第七夜》</b><br>初始污染度：<b>'+s.pollution+'%</b><br>系统人格：<b>已锁定</b>')+'<p>现在可以投入世界。</p>';btn([['开始投放',()=>{s.powered=false;s.scene='transfer';save();render();setTimeout(()=>{s.powered=true;go('identity')},900)}]]);setTimeout(()=>systemPop('binding','绑定成功','试炼世界：<b>《雾港第七夜》</b><br>请确认即将载入的身份。'),120);return}
if(s.scene==='identity'){T.textContent='身份确认';B.innerHTML='<section class="id-card"><div class="id-card__top">雾港日报　夜班通行证</div><div class="id-card__photo"><img src="assets/player-avatar.png" alt="玩家档案头像"></div><div class="id-card__fields"><p><span>姓名</span><b>'+n+'</b></p><p><span>职业</span><b>夜班实习记者</b></p><p><span>报社</span><b>雾港日报</b></p><p><span>班次</span><b>临时顶替</b></p><p><span>状态</span><b class="id-card__warning">代班对象失联</b></p></div><div class="id-card__code">WG-071 / LOCAL</div></section><p class="subtle">系统将以该身份向世界投放你。</p>';btn([['确认身份',()=>go('briefing')]]);return}
if(s.scene==='briefing'){T.textContent='午夜交接';B.innerHTML='<section class="story-card"><small>前情档案 / 01</small><h2>林越</h2><p>你的前辈，雾港日报夜班记者。</p><p>十二小时前，他在追查一篇被反复撤下的旧稿后失联。</p><p class="quote">他的工位还亮着。</p></section>';btn([['继续',()=>go('briefing2')]]);if(!s.rewindGuided){s.rewindGuided=true;save();setTimeout(()=>{pop('【新手引导：回溯键】\n键盘右上角的发光按键用于回溯至最初绑定。\n\n当你想从头体验时再使用它；开机键在进入世界后不会再响应。','warning',()=>$('#rewind-button').classList.add('rewind-guide'))},250)}return}
if(s.scene==='briefing2'){T.textContent='午夜交接';B.innerHTML='<section class="story-card danger-card"><small>当前情况 / 02</small><h2>封港前的夜班</h2><p>午夜后，港区将临时封闭。</p><p>总编要你完成林越留下的交接，并将未完成稿件送入档案室。</p><p>你只有今夜。</p></section>';btn([['接受交接',()=>go('chapter1')]]);return}
if(s.scene==='chapter1'){T.textContent='';B.innerHTML='<section class="chapter-card"><small>WORLD 071</small><h1>第一章</h1><h2>第七夜来临</h2><p>雾港日报 · 夜班编辑部</p></section>';C.innerHTML='';setTimeout(()=>btn([['进入编辑部',()=>go('arrival')]]),1100);return}
if(s.scene==='arrival'){T.textContent='雾港日报 / 夜班编辑部';B.innerHTML='<p>雨敲着玻璃。整层编辑部只亮着一盏工位灯。</p><p>你闻到冷咖啡、潮湿纸张和旧打印机留下的味道。</p><p>林越的工作台还亮着。桌面散着采访本、撤稿通知和一杯没有喝完的咖啡。</p>'+sys('arrival');btn([['开始夜班',()=>go('desk')]]);return}
if(s.scene==='desk'){T.textContent='第一章 / 第七夜来临';B.innerHTML='<p>暴雨敲着《雾港日报》的窗。编辑部空无一人，只有林越的工位还亮着。</p>'+sys('editorTask')+'<p class="hint">每次调查只显露一小段信息。请主动标记重要文字并存入卷宗。</p>';let a=[];for(let x of ['note','rewrite','program','boss'])if(!s.seen.includes(x))a.push([{'note':'翻看采访本夹层','rewrite':'查看前辈电脑','program':'检查碎纸机','boss':'在总编办公室门外停留'}[x],()=>detail(x)]);if(s.seen.length>=4){setTimeout(()=>{systemPop('complete','场景调查完成','新任务：前往地下档案室，归还林越的未完成稿件。','archive');btn([['接受新任务',()=>go('rain')]])},180)}btn(a);return}
if(s.scene==='rain'){T.textContent='雨中的名字';B.innerHTML='<p>有人在身后准确叫出你的名字：'+n+'。</p>'+sys('rule')+'<p class="hint">屏幕右下角闪过一条红色系统提示。</p>';btn([['保持沉默',()=>{add('doll');go('end')}],['回应声音',()=>{add('mark');go('end')}]]);setTimeout(()=>systemPop('rule','世界生存规则更新','午夜后，若有人在雨中准确叫出你的全名，请保持沉默。\n\n不要回头。不要加快脚步。\n直到听见对方说：“认错人了。”'),220);return}
T.textContent='第二章 / 雨中的名字';B.innerHTML='<p>电话里有人说：林越没有回来。去少年宫，邱圆还在等她。</p>'+sys('demoEnd');btn([['打开调查卷宗',book],['重新开始',()=>{s={scene:'boot',powered:false,name:'',wish:'',clues:[],seen:[]};save();render()}]])}
function detail(x){s.seen.push(x);save();T.textContent='林越的工作台 / 调查';let extra={note:'<section class="prop prop-note"><i>采访本夹层</i><div class="note handwritten">9/17<br><br>又改了。<br><br><s>“意外”</s>这两个字写得真快。<br><br>校门口那个孩子……<br>她一直在等。<br><br><span class="scribble">别再问总编</span><br><br>她同学叫什么？<br>圆？</div></section>',rewrite:'<section class="prop prop-computer"><i>林越的电脑 / 修改记录</i><div class="doc">原题：港区小学女生意外身亡<br><hr>修改后：雨夜安全提醒</div></section>',program:'<section class="prop prop-paper"><i>碎纸机卡住的纸角</i><div class="torn-paper"><b>雾港少年宫 · 夏季汇演</b><br><br>钢琴独奏<br>……满　/　邱圆</div></section>',boss:'<section class="prop prop-door"><i>主编办公室门外</i><div class="door-gap">门缝里透出灯光。<br><br>主编： “明早之前，别让那件事再上版面。”<br>陌生人： “她的家属不想再被打扰。”</div></section>'}[x];B.innerHTML=extra+'<p class="subtle">请选择一段内容，标记为调查线索。</p>';let options={note:['“意外”这两个字写得真快。','校门口那个孩子……她一直在等。','别再问总编'],rewrite:['原题','修改后的标题','电脑的开机时间'],program:['夏季汇演','钢琴独奏','……满 / 邱圆'],boss:['门缝里透出灯光','别让那件事再上版面','她的家属不想再被打扰']}[x],correct={note:1,rewrite:1,program:2,boss:1}[x];btn(options.map((v,i)=>[v,()=>judge(x,i===correct)]).concat([['暂不标记，返回',()=>go('desk')]]))}
let captureStoreAction=()=>{};
function captureEvidence(x,done){const cap=$('#evidence-capture'),subject=$('#capture-subject'),store=$('#capture-store');subject.className='photo-subject '+x;$('#capture-label').textContent='物证 '+data[x][0]+' / '+data[x][1];$('#capture-status').textContent='咔擦 · 物证影像已固定';store.textContent='确认收纳';cap.classList.remove('hidden');$('#click-sfx').currentTime=0;$('#click-sfx').play().catch(()=>{});captureStoreAction=()=>{store.disabled=true;store.textContent='正在卷入调查卷宗…';cap.classList.add('is-storing');$('#click-sfx').currentTime=0;$('#click-sfx').play().catch(()=>{});setTimeout(()=>{cap.classList.add('hidden');cap.classList.remove('is-storing');store.disabled=false;done()},760)}}
function judge(x,ok){if(!ok){pop('【标记失败】\n这段内容暂时无法形成有效线索。\n请重新观察物件。','error');return}pop('【标记正确】\n已锁定可疑信息。\n\n系统将固定该物证影像。','archive',()=>{captureEvidence(x,()=>{add(x);systemPop('editorTask','归档完成','物证影像与线索卡已收录：'+data[x][0]+'。','archive');if(!s.guided){s.guided=true;save();$('#notebook-toggle').classList.add('guide-target')}btn([['打开案件卷宗',book],['返回工作台',()=>go('desk')]])})})}
function book(){let d=$('#notebook-content');$('#notebook-toggle').classList.remove('guide-target');$('#case-count').textContent=String(s.clues.length).padStart(2,'0');d.innerHTML='<div class="evidence-stack">'+Object.keys(data).map(x=>s.clues.includes(x)?'<article class="evidence-card '+x+'-card"><button class="close-evidence" aria-label="收起物证">×</button><div class="evidence-card__visual">'+(x==='boss'?'<img src="assets/flip-phone.png" alt="主编通话记录">':'<span></span>')+'</div><b>'+data[x][0]+'</b><small>'+data[x][1]+'</small></article>':'<article class="evidence-card locked"><div class="evidence-card__visual"><span>?</span></div><b>未显影物证</b><small>████</small></article>').join('')+'</div>';d.querySelectorAll('.evidence-card:not(.locked)').forEach(card=>{card.onclick=e=>{if(e.target.closest('.close-evidence')){card.classList.remove('expanded');return}card.classList.add('expanded')};});$('#notebook').classList.remove('hidden')}
$('#power-button').onclick=()=>{if(s.powered)return;s.powered=true;go('boot')};$('#notebook-toggle').onclick=book;$('#notebook-close').onclick=()=>$('#notebook').classList.add('hidden');$('#modal-ok').onclick=()=>{const next=modalAction;modalAction=()=>{};$('#system-modal').classList.add('hidden');next()};render();
$('#power-button').onclick=()=>{if(!s.powered){$('#click-sfx').play().catch(()=>{});$('#ambience').volume=.32;$('#ambience').play().catch(()=>{});s.powered=true;go('boot');return}if(confirm('是否回溯至最初绑定状态？\n确认后将清空本机进度并重新开始。')){localStorage.removeItem(KEY);location.reload()}};
$('#power-button').onclick=()=>{if(s.powered)return;$('#click-sfx').play().catch(()=>{});s.powered=true;music.volume=.30;rainAudio.volume=.12;setSoundscape('intro');go('boot')};
$('#modal-cancel').onclick=()=>{$('#system-modal').classList.add('hidden');modalAction=()=>{}};
$('#capture-store').onclick=()=>captureStoreAction();
$('#rewind-button').onclick=()=>{if(!s.powered)return;$('#rewind-button').classList.remove('rewind-guide');pop('【回溯确认】\n确定要回溯到最初绑定吗？\n\n当前本机进度将被清空。','warning',()=>{localStorage.removeItem(KEY);location.reload()});$('#modal-ok').textContent='确认回溯';$('#modal-cancel').classList.remove('hidden');$('#modal-cancel').textContent='取消'};
