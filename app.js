const K='cuaderno1',D='DASHBOARD',R='REGISTRO',AG='AGENDA',H='HASHTAGS',SR='BUSCAR',FZ='FINANZAS',DN=['lun','mar','mié','jue','vie','sáb','dom'],MN=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
let S={pages:{},cur:D,mode:'view',ag:{v:'week',d:new Date()},tag:''},open=new Set(),tmr,rt;
try{const j=localStorage.getItem(K);if(j)S.pages=JSON.parse(j)}catch(e){}
const $=s=>document.querySelector(s),app=$('#app');
const sync=()=>{for(const k of Object.keys(S.pages))for(const m of S.pages[k].t.matchAll(/\[\[(\d\d\/\d\d\/\d\d)\]\]/g))if(!S.pages[m[1]])S.pages[m[1]]={t:'',u:false}};
try{if(!localStorage.getItem(K+'m')){const np={};for(const k in S.pages){const p=S.pages[k];p.t=p.t.replace(/\[\[(\d\d)\/(\d\d)\/(\d\d)(?=[\]\/])/g,'[[$3/$2/$1').replace(/(fecha::\s*)(\d\d)\/(\d\d)\/(\d\d)/g,'$1$4/$3/$2');np[k.replace(/^(\d\d)\/(\d\d)\/(\d\d)(?=$|\/)/,'$3/$2/$1')]=p}S.pages=np;localStorage.setItem(K+'m','1');localStorage.setItem(K,JSON.stringify(S.pages))}}catch(e){}
const snap=()=>JSON.stringify(S.pages,(k,v)=>k==='r'?undefined:v);
let UH=[snap()],UI=0;
const persist=()=>{try{localStorage.setItem(K,JSON.stringify(S.pages))}catch(e){}};
const save=()=>{sync();persist();const j=snap();if(j!==UH[UI]){UH=UH.slice(0,UI+1);UH.push(j);if(UH.length>60)UH.shift();UI=UH.length-1}};
const undo=d=>{clearTimeout(tmr);save();const k=UI+d;if(k<0||k>=UH.length)return;UI=k;const old=S.pages;S.pages=JSON.parse(UH[k]);for(const p in S.pages)if(old[p]&&old[p].r)S.pages[p].r=old[p].r;persist();if(!S.pages[S.cur]&&![D,R,AG,H,SR,FZ].includes(S.cur)&&!S.cur.startsWith('REG:'))S.cur=D;draw()};
const pd=n=>(n.match(/^\d\d\/\d\d\/\d\d/)||[''])[0];
const PD=s=>new Date(2000+ +s.slice(0,2),+s.slice(3,5)-1,+s.slice(6,8));
const mins=t=>{const[h,m]=t.split(':');return +h*60+(+m||0)};
let EN={estado:['pagado','pendiente','cancelado'],cuenta:{bp:'Banca personal'},persona:[]};
try{const j=localStorage.getItem(K+'e');if(j)EN=JSON.parse(j)}catch(e){}
const saveEn=()=>{try{localStorage.setItem(K+'e',JSON.stringify(EN))}catch(e){}};
let cl=new Set();try{const u=JSON.parse(localStorage.getItem(K+'u')||'{}');(u.o||[]).forEach(k=>open.add(k));cl=new Set(u.c||[])}catch(e){}
const saveUi=()=>{try{localStorage.setItem(K+'u',JSON.stringify({o:[...open],c:[...cl]}))}catch(e){}};
const p2=n=>String(n).padStart(2,'0');
const fd=d=>p2(d.getFullYear()%100)+'/'+p2(d.getMonth()+1)+'/'+p2(d.getDate());
const today=()=>fd(new Date());
const isD=n=>/^\d\d\/\d\d\/\d\d$/.test(n);
const dk=n=>n.replace(/\//g,'');
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ind=l=>l.match(/^\s*/)[0].length;
const FN=/^(\s*)[-*]\s+([eit])(\d+(?:[.,]\d+)?)(?:\s+(.*))?$/,TD=/^(\s*)[-*]\s*\[( |x|X)\]\s?(.*)$/,AT=/^\s*[-*]?\s*([\wáéíóúñÁÉÍÓÚÑ-]+)::\s*(.*)$/;
const TM=/^(\d{1,2}(?::\d{2})?)(?:\s*-\s*(\d{1,2}(?::\d{2})?))?(?=\s|$)\s*/;
function inl(s){return esc(s).replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|(https?:\/\/[^\s<]+)/g,(m,a,u,b)=>'<a class="l" href="'+(u||b)+'" target="_blank" rel="noopener">'+(a||b)+'</a>').replace(/\{\{crono:(=?)(\d+)\}\}/g,(m,e,n)=>e?'<span class="cr">⏱ '+fmt(+n)+'</span>':'<span class="cr run" data-t="'+n+'"><span>⏱ '+fmt((Date.now()-n)/1000)+'</span> <button class="crb" data-cs="'+n+'" title="Detener">⏹</button></span>').replace(/\[\[([^\]]+)\]\]/g,(m,x)=>'<a class="l'+(x===today()?' tdy':'')+'" data-p="'+x+'">'+x+(x===today()?'<span class="dot" title="Hoy"></span>':'')+'</a>')
.replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\*([^*]+)\*/g,'<i>$1</i>').replace(/`([^`]+)`/g,'<code>$1</code>')
.replace(/(^|\s)#([\wáéíóúñ-]+)/gi,'$1<span class="tag">#$2</span>')}
function ensure(n){if(!S.pages[n]){S.pages[n]={t:'',u:false};save()}}
function newPage(name,t,u){let n=name,i=2;while(S.pages[n])n=name+' '+i++;S.pages[n]={t:t||'',u:!!u};save();return n}
let hs=[D],hi=0;
function go(n,m,np){S.cur=n;S.mode=m||(S.pages[n]&&!S.pages[n].t?'edit':'view');if(S.pages[n]){S.pages[n].r=Date.now();persist()}if(!np&&hs[hi]!==n){hs=hs.slice(0,hi+1);hs.push(n);hi++}hideMenu();draw()}
const hb=d=>{const k=hi+d;if(k<0||k>=hs.length)return;hi=k;go(hs[k],undefined,1)};
function newDaily(){const d=today();let c=Object.keys(S.pages).filter(k=>k.startsWith(d+'/nota')).length+1,n;
do{n=d+'/nota'+String(c++).padStart(3,'0')}while(S.pages[n]);S.pages[n]={t:'',u:false};save();go(n,'edit')}
function records(){const out=[];
for(const pg of Object.keys(S.pages).sort()){const L=S.pages[pg].t.split('\n');let ctx=pd(pg);
for(let i=0;i<L.length;i++){const dm=L[i].trim().match(/^\[\[(\d\d\/\d\d\/\d\d)\]\]$/);if(dm){ctx=dm[1];continue}
const m=L[i].match(TD);if(!m)continue;let tx=m[3],a=null,b=null;const t=tx.match(TM);
if(t){a=t[1];b=t[2]||null;tx=tx.slice(t[0].length)}
const at={};let j=i+1;while(j<L.length&&L[j].trim()&&ind(L[j])>m[1].length){const x=L[j].match(AT);if(x)at[x[1]]=x[2];j++}
out.push({date:ctx,a,b,tx,done:m[2]!==' ',at,pg,i})}}
return out.sort((x,y)=>(x.date?dk(x.date):'~').localeCompare(y.date?dk(y.date):'~')||(x.a||'').localeCompare(y.a||'',0,{numeric:true}))}
function toggle(pg,i){const L=S.pages[pg].t.split('\n');L[i]=L[i].replace(/\[( |x|X)\]/,(m,c)=>c===' '?'[x]':'[ ]');S.pages[pg].t=L.join('\n');save();draw()}
function render(pg,t){const L=t.split('\n');let h='',vn=0;
for(let i=0;i<L.length;i++){const l=L[i],m=l.match(TD);
if(m){const base=m[1].length,ch=[];let j=i+1;while(j<L.length&&L[j].trim()&&ind(L[j])>base){ch.push(L[j]);j++}
let tx=m[3],tm='';const t2=tx.match(TM);if(t2){tm='<span class="tm">'+esc(t2[1]+(t2[2]?'–'+t2[2]:''))+'</span>';tx=tx.slice(t2[0].length)}
const k=pg+':'+i,o=open.has(k);
h+='<div class="td'+(m[2]!==' '?' d':'')+'"><input type="checkbox" data-c="'+i+'" '+(m[2]!==' '?'checked':'')+'><span class="tx">'+tm+inl(tx)+'</span>'+(ch.length?'<button class="dots" data-k="'+esc(k)+'" title="Mostrar u ocultar atributos">'+(o?'▾':'···')+'</button>':'')+'</div>';
if(ch.length&&o)h+='<div class="at">'+ch.map(c=>{const x=c.match(AT);return x?'<span><b>'+esc(x[1])+'::</b> '+inl(x[2])+'</span>':'<span>'+inl(c.trim())+'</span>'}).join('')+'</div>';
i=j-1;continue}
const fm=l.match(FN);if(fm){const base=fm[1].length,ch=[];let j=i+1;while(j<L.length&&L[j].trim()&&ind(L[j])>base){ch.push(L[j]);j++}
const k=pg+':'+i,o=open.has(k),sg=fm[2]==='i'?'+':fm[2]==='t'?'⇄ ':'−';
h+='<div class="td"><span class="tm'+(fm[2]==='e'?' eg':'')+'">'+sg+fm[3]+'</span><span class="tx">'+inl(fm[4]||'')+'</span>'+(ch.length?'<button class="dots" data-k="'+esc(k)+'" title="Mostrar u ocultar atributos">'+(o?'▾':'···')+'</button>':'')+'</div>';
if(ch.length&&o)h+='<div class="at">'+ch.map(c=>{const x=c.match(AT);return x?'<span><b>'+esc(x[1])+'::</b> '+inl(x[2])+'</span>':'<span>'+inl(c.trim())+'</span>'}).join('')+'</div>';
i=j-1;continue}
let x;if(x=l.match(/^(#{2,4})(v?)\s+(.*)/i)){const lv=x[1].length;let c='';if(x[2]){vn++;c='<span class="vn">v'+vn+'</span>'}else if(lv<3)vn=0;const k=pg+':h:'+x[3],col=cl.has(k);
h+='<h'+lv+' id="h'+i+'"><button class="dots" data-ch="'+esc(k)+'" aria-label="Plegar o desplegar">'+(col?'▸':'▾')+'</button>'+inl(x[3])+c+'</h'+lv+'>';
if(col){let j=i+1;while(j<L.length){const y=L[j].match(/^(#{1,4})v?\s/i);if(y&&y[1].length<=lv)break;j++}i=j-1}}
else if(x=l.match(/^(#{1,3})\s+(.*)/)){if(x[1].length<3)vn=0;h+='<h'+x[1].length+' id="h'+i+'">'+inl(x[2])+'</h'+x[1].length+'>'}
else if(x=l.match(/^(\s*)[-*]\s+(.*)/))h+='<div class="ln" style="padding-left:'+(x[1].length*8)+'px">• '+inl(x[2])+'</div>';
else if(x=l.match(/^>\s?(.*)/))h+='<blockquote>'+inl(x[1])+'</blockquote>';
else h+='<div class="ln">'+inl(l)+'</div>'}
return h}
function recTable(rs,title,hide){if(!rs.length)return '<p class="mu">Aún no hay TODOs'+(title?'':' registrados')+'. Escribe una fecha <code>[[dd/mm/aa]]</code> y debajo <code>- [ ] 15:00 tarea</code>.</p>';
return '<div class="wrap"><table><tr><th>Hecho</th>'+(hide?'':'<th>Fecha</th>')+'<th>Hora</th><th>Contenido</th><th>Nota</th><th>Tag</th><th>Otros</th><th>Origen</th></tr>'+rs.map(r=>'<tr><td><input type="checkbox" data-rp="'+esc(r.pg)+'" data-ri="'+r.i+'" '+(r.done?'checked':'')+'> '+(r.done?'Sí':'No')+'</td>'+(hide?'':'<td>'+(r.date?'<a class="l" data-p="'+r.date+'">'+r.date+'</a>':'—')+'</td>')+'<td>'+(r.a?esc(r.a+(r.b?'–'+r.b:'')):'')+'</td><td>'+inl(r.tx)+'</td><td>'+inl(r.at.nota||'')+'</td><td>'+inl(r.at.tag||'')+'</td><td>'+Object.entries(r.at).filter(([k])=>k!=='nota'&&k!=='tag').map(([k,v])=>'<div><b class="mu">'+esc(k)+':</b> '+inl(v)+'</div>').join('')+'</td><td><a class="l" data-p="'+esc(r.pg)+'">'+esc(r.pg)+'</a></td></tr>').join('')+'</table></div>'}
const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function hl(s,tk){const n=norm(s);if(n.length!==s.length)return esc(s);const m=new Array(s.length).fill(0);tk.forEach(t=>{let i=n.indexOf(t);while(i>=0){for(let k=i;k<i+t.length;k++)m[k]=1;i=n.indexOf(t,i+t.length)}});let o='',on=0;for(let k=0;k<s.length;k++){if(m[k]&&!on){o+='<mark>';on=1}if(!m[k]&&on){o+='</mark>';on=0}o+=esc(s[k])}return o+(on?'</mark>':'')}
function sres(q){const tk=norm(q).split(/\s+/).filter(Boolean);if(!tk.length)return '<p class="mu">Escribe una o varias palabras. Busca en los nombres y en todo el texto de tus notas, sin importar mayúsculas ni tildes.</p>';
let h='',tot=0,np=0;const OB=objRecs(),all=t=>tk.every(w=>t.includes(w));
for(const pg of Object.keys(S.pages).sort()){const nm=all(norm(pg)),L=S.pages[pg].t.split('\n'),hits=[],ot={};L.forEach((l,i)=>{if(l.trim()&&all(norm(l)))hits.push(i)});OB.filter(o=>o.pg===pg&&all(norm(o.type+' '+o.name+' '+Object.entries(o.at).map(([k,v])=>k+' '+v).join(' ')))).forEach(o=>{ot[o.i]=o.name+' — '+Object.entries(o.at).filter(([k])=>!['tipo','type'].includes(k)).map(([k,v])=>k+': '+v).join(', ');if(!hits.includes(o.i))hits.push(o.i)});hits.sort((a,b)=>a-b);if(!nm&&!hits.length)continue;np++;tot+=hits.length;
h+='<div class="hi"><a class="l" data-sp="'+esc(pg)+'" data-si="-1">'+hl(pg,tk)+'</a>'+hits.slice(0,6).map(i=>'<div class="sl" data-sp="'+esc(pg)+'" data-si="'+i+'">'+hl(ot[i]||L[i].trim(),tk)+'</div>').join('')+(hits.length>6?'<div class="mu">+'+(hits.length-6)+' más en esta nota</div>':'')+'</div>'}
return np?'<p class="mu">'+tot+' coincidencias en '+np+' notas</p>'+h:'<p class="mu">Sin resultados para “'+esc(q)+'”.</p>'}
function tocH(t){const it=[];let vn=0;t.split('\n').forEach((l,i)=>{let x;if(x=l.match(/^##v\s+(.*)/i))it.push({i,v:++vn,tx:x[1]});else if(x=l.match(/^##\s+(.*)/)){vn=0;it.push({i,v:0,tx:x[1]})}else if(/^#\s/.test(l))vn=0});if(!it.length)return '';const c=S.toc===false;
return '<div class="toc"><button class="dots" data-tg title="Mostrar u ocultar contexto">Contexto '+(c?'···':'▾')+'</button>'+(c?'':it.map(o=>'<a class="l" data-go="'+o.i+'" style="padding-left:'+(o.v?18:0)+'px">'+esc(o.tx)+(o.v?'<span class="vn">v'+o.v+'</span>':'')+'</a>').join(''))+'</div>'}
function fmt(s){s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600);return (h?h+':':'')+p2(Math.floor(s%3600/60))+':'+p2(s%60)}
function crStop(ts){const tok='{{crono:'+ts+'}}';for(const k in S.pages){if(S.pages[k].t.includes(tok)){S.pages[k].t=S.pages[k].t.replace(tok,'{{crono:='+Math.round((Date.now()-ts)/1000)+'}}');break}}save();draw()}
setInterval(()=>document.querySelectorAll('.cr.run').forEach(e=>{e.firstChild.textContent='⏱ '+fmt((Date.now()-e.dataset.t)/1000)}),1000);
const nowTop=()=>{const m=new Date();return (m.getHours()*60+m.getMinutes())*.8};
setInterval(()=>document.querySelectorAll('.now').forEach(e=>e.style.top=nowTop()+'px'),30000);
const sg=n=>{n=n.trim().toLowerCase();if(/ces$/.test(n))return n.slice(0,-3)+'z';if(/[rlndj]es$/.test(n))return n.slice(0,-2);if(/s$/.test(n)&&n.length>3)return n.slice(0,-1);return n};
function objRecs(){const out=[];for(const pg of Object.keys(S.pages).sort()){const L=S.pages[pg].t.split('\n');
for(let i=0;i<L.length;i++){const m=L[i].match(/^(\s*)[-*]\s+(.+)$/);if(!m||AT.test(L[i])||TD.test(L[i])||FN.test(L[i]))continue;
const b=m[1].length,at={};let j=i+1,n=0;while(j<L.length&&L[j].trim()&&ind(L[j])>b){const x=L[j].match(AT);if(x){at[x[1]]=x[2];n++}j++}if(!n)continue;
let ty=(at.tipo||at.type||'').trim().toLowerCase();if(!ty&&!/^\d\d\/\d\d\/\d\d/.test(pg)&&!pg.includes('/'))ty=sg(pg);if(!ty)continue;
out.push({type:ty,name:m[2].trim(),pg,i,base:m[1],at})}}return out}
function regList(){const t=[...new Set(objRecs().map(o=>o.type))].sort();return t.length?'<h2 class="s">Registros</h2><div class="list">'+t.map(x=>'<a data-p="REG:'+esc(x)+'">Registro '+esc(x)+'</a>').join('')+'</div>':''}
function openRef(p){if(p.startsWith('REG:')){go(p);return}const m=p.match(/^([^\/]+)\/(.+)$/);if(m&&!S.pages[p]){const o=objRecs().find(o=>o.type===m[1].toLowerCase()&&o.name.toLowerCase()===m[2].toLowerCase());if(o){S.jump={p:o.pg,i:o.i,q:o.name};S.cur=o.pg;S.mode='edit';S.f=1;draw();return}}ensure(p);go(p)}
function regH(ty){const os=objRecs().filter(o=>o.type===ty),cols=[];os.forEach(o=>Object.keys(o.at).forEach(k=>{if(!['tipo','type'].includes(k)&&!cols.includes(k))cols.push(k)}));
const a=(o,k)=>'data-rg="'+esc(o.pg)+'" data-ri="'+o.i+'" data-rk="'+esc(k)+'" data-rt="'+esc(ty)+'"';
let h='<h1 class="t">Registro '+esc(ty)+'</h1><div class="fz">';
h+=os.length?'<div class="wrap"><table><tr><th>Nombre</th>'+cols.map(c=>'<th>'+esc(c)+'</th>').join('')+'<th>Origen</th></tr>'+os.map(o=>'<tr><td><input '+a(o,'')+' value="'+esc(o.name)+'"></td>'+cols.map(c=>'<td><input '+a(o,c)+' value="'+esc(o.at[c]||'')+'"></td>').join('')+'<td><a class="l" data-p="'+esc(o.pg)+'">'+esc(o.pg)+'</a></td></tr>').join('')+'</table></div>':'<p class="mu">Sin objetos.</p>';
h+='<div class="bar" style="margin-top:12px;flex-wrap:wrap"><input id="ncol" placeholder="Nueva columna"><button data-addc="'+esc(ty)+'">Añadir columna</button><span class="sp"></span><input id="nobj" placeholder="Nombre nuevo"><button class="p" data-addo="'+esc(ty)+'">＋ Añadir</button></div><p class="mu">Referencia desde otras notas: <code>[['+esc(ty)+'/Nombre]]</code></p></div>';return h}
function regSet(pg,i,k,v,ty){if(k===''){v=v.trim();if(!v)return;const L=S.pages[pg].t.split('\n'),m=L[i].match(/^(\s*)[-*]\s+(.+)$/),old=m[2].trim();L[i]=m[1]+'- '+v;S.pages[pg].t=L.join('\n');if(old!==v)for(const p in S.pages)S.pages[p].t=S.pages[p].t.split('[['+ty+'/'+old+']]').join('[['+ty+'/'+v+']]')}else setAt(pg,i,k,v,true);save();draw()}
function regAddCol(ty,c){c=c.trim().replace(/\s+/g,'_');if(!c)return;objRecs().filter(o=>o.type===ty).sort((a,b)=>a.pg<b.pg?-1:a.pg>b.pg?1:b.i-a.i).forEach(o=>{if(!(c in o.at))setAt(o.pg,o.i,c,'',true)});save();draw()}
function regAddObj(ty,nm){nm=nm.trim();const os=objRecs().filter(o=>o.type===ty);if(!nm||!os.length)return;const pg=os[0].pg,cols=[];os.forEach(o=>Object.keys(o.at).forEach(k=>{if(!['tipo','type'].includes(k)&&!cols.includes(k))cols.push(k)}));
S.pages[pg].t=S.pages[pg].t.replace(/\s*$/,'')+'\n- '+nm+'\n'+(cols.length?cols.map(c=>'  - '+c+':: ').join('\n'):'  - tipo:: '+ty)+'\n';save();draw()}
function rename(o,nn){nn=nn.trim().replace(/\s+/g,' ');if(!nn||nn===o||[D,R,AG,H,SR,FZ].includes(nn)||S.pages[nn]){draw();return}
S.pages[nn]=S.pages[o];delete S.pages[o];S.pages[nn].u=false;for(const k in S.pages)S.pages[k].t=S.pages[k].t.split('[['+o+']]').join('[['+nn+']]');S.cur=nn;save();draw()}
function finRecs(){const out=[],cu=EN.cuenta;for(const pg of Object.keys(S.pages).sort()){const L=S.pages[pg].t.split('\n');let ctx=pd(pg);
for(let i=0;i<L.length;i++){const dm=L[i].trim().match(/^\[\[(\d\d\/\d\d\/\d\d)\]\]$/);if(dm){ctx=dm[1];continue}
const m=L[i].match(FN);if(!m)continue;const at={};let j=i+1;while(j<L.length&&L[j].trim()&&ind(L[j])>m[1].length){const x=L[j].match(AT);if(x)at[x[1]]=x[2];j++}
const tk=(m[4]||'').split(/\s+/).filter(Boolean),kn=w=>w&&cu[w.toLowerCase()]!==undefined;let sal='',ent='';
if(m[2]==='e'){if(kn(tk[tk.length-1]))sal=tk.pop()}else if(m[2]==='i'){if(kn(tk[tk.length-1]))ent=tk.pop()}else{if(kn(tk[tk.length-1]))ent=tk.pop();if(kn(tk[tk.length-1]))sal=tk.pop()}
const accs=(m[2]==='e'?[sal]:m[2]==='i'?[ent]:[sal,ent]).filter(Boolean);
out.push({pg,i,base:m[1],tipo:m[2],date:at.fecha||ctx,monto:parseFloat(String(at.monto??m[3]).replace(',','.'))||0,det:at.detalle??tk.join(' '),sal:at.cuenta_salida??sal,ent:at.cuenta_entrada??ent,nota:at.nota||'',estado:at.estado||'pagado',persona:at.persona||'',accs})}}return out}
function setAt(pg,i,k,v,keep){const L=S.pages[pg].t.split('\n'),b=ind(L[i]);let j=i+1,f=-1;while(j<L.length&&L[j].trim()&&ind(L[j])>b){const x=L[j].match(AT);if(x&&x[1]===k)f=j;j++}
if(f>=0){if(v===''&&!keep)L.splice(f,1);else L[f]=L[f].replace(/::\s*.*$/,':: '+v)}else if(v!==''||keep)L.splice(j,0,' '.repeat(b+2)+'- '+k+':: '+v);S.pages[pg].t=L.join('\n')}
function finSet(pg,i,f,v){const r=finRecs().find(x=>x.pg===pg&&x.i===i);if(!r)return;
if(f==='tipo'&&!v)return;if(f==='persona'&&v&&objRecs().some(o=>o.type==='persona'))v='[[persona/'+v+']]';
if(['monto','tipo','det'].includes(f)){setAt(pg,i,'monto','');setAt(pg,i,'detalle','');const n={...r,[f]:v},L=S.pages[pg].t.split('\n');L[i]=r.base+'- '+n.tipo+(parseFloat(n.monto)||0)+' '+n.det+(r.accs.length?' '+r.accs.join(' '):'');S.pages[pg].t=L.join('\n')}
else setAt(pg,i,({sal:'cuenta_salida',ent:'cuenta_entrada'})[f]||f,v);save();draw()}
function parseEn(k,v){const a=v.split(',').map(s=>s.trim()).filter(Boolean);if(k==='cuenta'){const o={};a.forEach(s=>{const[c,...n]=s.split('=');const cc=c.trim().toLowerCase().replace(/\s+/g,'');if(cc)o[cc]=n.join('=').trim()||c.trim()});EN.cuenta=o}else EN[k]=a;saveEn();draw()}
function finH(){const rs=finRecs().sort((a,b)=>(b.date?dk(b.date):'').localeCompare(a.date?dk(a.date):'')||a.pg.localeCompare(b.pg)||a.i-b.i),cu=Object.entries(EN.cuenta).map(([c,n])=>[c,n+' ('+c+')']),es=EN.estado.map(x=>[x,x]),ps=(()=>{const o=objRecs().filter(x=>x.type==='persona').map(x=>[x.name,x.name]);return o.length?o:EN.persona.map(x=>[x,x])})();
const at=(r,f)=>'data-fp="'+esc(r.pg)+'" data-fi="'+r.i+'" data-f="'+f+'"';
const sel=(r,f,o,v)=>{o=o.slice();if(v&&!o.some(x=>x[0]===v))o.push([v,v]);return '<select '+at(r,f)+'><option value=""></option>'+o.map(x=>'<option value="'+esc(x[0])+'"'+(x[0]===v?' selected':'')+'>'+esc(x[1])+'</option>').join('')+'</select>'};
const inp=(r,f,ty,v)=>'<input type="'+ty+'"'+(ty==='number'?' step="any"':'')+' '+at(r,f)+' value="'+esc(String(v))+'">';
const dt=d=>d?'20'+d.slice(0,2)+'-'+d.slice(3,5)+'-'+d.slice(6,8):'',fa=S.fa||'',vs=fa?rs.filter(r=>r.sal===fa||r.ent===fa):rs,bals={};
rs.filter(r=>r.estado==='pagado').forEach(r=>{if(r.tipo!=='i')bals[r.sal]=(bals[r.sal]||0)-r.monto;if(r.tipo!=='e')bals[r.ent]=(bals[r.ent]||0)+r.monto});
const nm=c=>EN.cuenta[c]||c,ks=[...new Set([...Object.keys(EN.cuenta),...Object.keys(bals)])].filter(Boolean),ok2=vs.filter(r=>r.estado==='pagado'),
inc=ok2.filter(r=>fa?(r.ent===fa&&r.tipo!=='e'):r.tipo==='i').reduce((a,r)=>a+r.monto,0),exp=ok2.filter(r=>fa?(r.sal===fa&&r.tipo!=='i'):r.tipo==='e').reduce((a,r)=>a+r.monto,0),
pen=vs.filter(r=>r.estado==='pendiente'&&r.tipo==='e').reduce((a,r)=>a+r.monto,0),tot=Object.values(bals).reduce((a,b)=>a+b,0);
const bal='<div class="bar" style="flex-wrap:wrap"><button data-fa=""'+(fa?'':' class="p"')+'>Todas<br><b>'+tot.toFixed(2)+'</b></button>'+ks.map(c=>'<button data-fa="'+esc(c)+'"'+(fa===c?' class="p"':'')+'>'+esc(nm(c))+'<br><b>'+(bals[c]||0).toFixed(2)+'</b></button>').join('')+'</div><p><b>Ingresos</b> '+inc.toFixed(2)+' &nbsp; <b>Egresos</b> '+exp.toFixed(2)+' &nbsp; <b>Por pagar</b> '+pen.toFixed(2)+'</p>';
let h='<h1 class="t">Registro de finanzas</h1><div class="fz">';
h+=rs.length?bal+'<div class="wrap"><table><tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>Detalle</th><th>Cuenta salida</th><th>Cuenta entrada</th><th>Persona</th><th>Estado</th><th>Nota</th><th>Origen</th></tr>'+vs.map(r=>'<tr><td>'+inp(r,'date','date',dt(r.date))+'</td><td>'+sel(r,'tipo',[['e','Egreso'],['i','Ingreso'],['t','Transferencia']],r.tipo)+'</td><td>'+inp(r,'monto','number',r.monto)+'</td><td>'+inp(r,'det','text',r.det)+'</td><td>'+sel(r,'sal',cu,r.sal)+'</td><td>'+sel(r,'ent',cu,r.ent)+'</td><td>'+sel(r,'persona',ps,r.persona.replace(/^\[\[persona\/(.+)\]\]$/,'$1'))+'</td><td>'+sel(r,'estado',es,r.estado)+'</td><td>'+inp(r,'nota','text',r.nota)+'</td><td><a class="l" data-p="'+esc(r.pg)+'">'+esc(r.pg)+'</a></td></tr>').join('')+'</table></div>':'<p class="mu">Aún no hay movimientos. En cualquier nota escribe, por ejemplo, <code>- e50.4 comida bp</code> (e egreso, i ingreso, t transferencia; al final el código de cuenta).</p>';
h+='<h2 class="s">Listas</h2><p class="mu">Separa con comas. En cuentas usa código=Nombre.</p><div style="display:grid;gap:8px"><label>Estados<input data-en="estado" value="'+esc(EN.estado.join(', '))+'"></label><label>Personas<input data-en="persona" value="'+esc(EN.persona.join(', '))+'"></label><label>Cuentas<input data-en="cuenta" value="'+esc(Object.entries(EN.cuenta).map(([c,n])=>c+'='+n).join(', '))+'"></label></div></div>';return h}
function tagRecs(){const out=[];for(const pg of Object.keys(S.pages).sort()){let ctx=pd(pg);for(const l of S.pages[pg].t.split('\n')){const dm=l.trim().match(/^\[\[(\d\d\/\d\d\/\d\d)\]\]$/);if(dm){ctx=dm[1];continue}
if(/^\s*#{1,6}v?\s/.test(l))continue;const tg=[...l.matchAll(/(^|\s)#([\wáéíóúñ-]+)/gi)].map(m=>m[2].toLowerCase());
if(tg.length)out.push({tags:tg,tx:l.trim().replace(/^[-*]\s*(\[[ xX]\]\s*)?/,''),date:ctx,pg})}}
return out.sort((a,b)=>(a.date?dk(a.date):'').localeCompare(b.date?dk(b.date):''))}
const evc=r=>/#evento\b/i.test(r.tx),ic=r=>evc(r)?'<svg class="ci" width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="#d92d20" stroke-width="1.7" stroke-linecap="round"><rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 7h12M5 1.5v3M11 1.5v3"/></svg>':'',lab=r=>(r.a?r.a+' ':'')+r.tx.replace(/#evento\b/ig,'').trim(),add=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x},mon=d=>add(d,-((d.getDay()+6)%7));
function agenda(){const ag=S.ag,rs=records().filter(r=>r.date),b=new Date(ag.d.getFullYear(),ag.d.getMonth(),ag.d.getDate());
let h='<h1 class="t">Agenda</h1><div class="bar" style="flex-wrap:wrap"><button data-n="-1">◀</button><button data-n="0">Hoy</button><button data-n="1">▶</button><span class="sp"></span>'+[['day','Día'],['3d','3 días'],['week','Semana'],['month','Mes']].map(([k,l])=>'<button data-v="'+k+'"'+(ag.v===k?' class="p"':'')+'>'+l+'</button>').join('')+'</div>';
const cl=r=>(evc(r)?' ev':'')+(r.done?' dn':'');
if(ag.v==='month'){const s=mon(new Date(b.getFullYear(),b.getMonth(),1));h+='<h2 class="s">'+MN[b.getMonth()]+' '+b.getFullYear()+'</h2><div class="mg">'+DN.map(x=>'<b class="mu">'+x+'</b>').join('');
for(let i=0;i<42;i++){const d=add(s,i),k=fd(d),it=rs.filter(r=>r.date===k);h+='<div class="mc'+(d.getMonth()!==b.getMonth()?' of':'')+(k===today()?' td0':'')+'" data-gd="'+k+'"><span>'+d.getDate()+'</span>'+it.slice(0,3).map(r=>'<div class="mi'+cl(r)+'">'+ic(r)+esc(lab(r))+'</div>').join('')+(it.length>3?'<div class="mu">+'+(it.length-3)+' más</div>':'')+'</div>'}h+='</div>';return h}
const n=ag.v==='day'?1:ag.v==='3d'?3:7,s=ag.v==='week'?mon(b):b,ds=[...Array(n).keys()].map(i=>add(s,i));
h+='<div class="agb"><div class="gr" style="--n:'+n+'"><div class="gh"></div>'+ds.map(d=>'<div class="gh" data-gd="'+fd(d)+'"><b>'+DN[(d.getDay()+6)%7]+' '+d.getDate()+'</b></div>').join('')+'<div class="gh mu">día</div>'+
ds.map(d=>'<div class="ad">'+rs.filter(r=>r.date===fd(d)&&!r.a).map(r=>'<div class="mi'+cl(r)+'" data-p="'+esc(r.pg)+'">'+ic(r)+esc(lab(r))+'</div>').join('')+'</div>').join('')+
'<div>'+[...Array(24).keys()].map(i=>'<div class="hr">'+i+':00</div>').join('')+'</div>'+
ds.map(d=>{const it=rs.filter(r=>r.date===fd(d)&&r.a).map(r=>{const st=mins(r.a);return{r,st,e:Math.max(r.b?mins(r.b):st+60,st+30)}}).sort((x,y)=>x.st-y.st),ln=[];
it.forEach(o=>{let i=ln.findIndex(e=>e<=o.st);if(i<0)i=ln.push(0)-1;ln[i]=o.e;o.l=i});
return '<div class="dc">'+(fd(d)===today()?'<div class="now" style="top:'+nowTop()+'px"></div>':'')+it.map(o=>'<div class="bk'+cl(o.r)+'" data-p="'+esc(o.r.pg)+'" style="top:'+o.st*.8+'px;height:'+(o.e-o.st)*.8+'px;left:'+o.l*100/ln.length+'%;width:'+100/ln.length+'%">'+ic(o.r)+esc(lab(o.r))+'</div>').join('')+'</div>'}).join('')+'</div></div>';return h}
function draw(){const n=S.cur;let h='';
if(n===D){const ks=Object.keys(S.pages),jr=ks.filter(isD).sort((a,b)=>dk(b).localeCompare(dk(a))),ot=ks.filter(k=>!isD(k)).sort();
const ln=a=>a.length?a.map(k=>'<a data-p="'+esc(k)+'">'+esc(k)+'</a>').join(''):'<p class="mu">Vacío.</p>';
h='<h1 class="t">DASHBOARD</h1><button class="p" id="bd">＋ Nota de hoy ('+today()+')</button><h2 class="s">Notas</h2><div class="list">'+ln(ot)+'</div><h2 class="s">Journal</h2><div class="list"><a data-p="'+today()+'">Abrir hoy ('+today()+')</a>'+ln(jr.filter(k=>k!==today()))+'</div>'+regList()+'<h2 class="s">Recientes</h2><div class="list">'+ln(ks.filter(k=>S.pages[k].r).sort((a,b)=>S.pages[b].r-S.pages[a].r).slice(0,20))+'</div>'}
else if(n===R){h='<h1 class="t">Registro de TODOs</h1>'+recTable(records())}
else if(n===AG)h=agenda();
else if(n===FZ)h=finH();
else if(n.startsWith('REG:'))h=regH(n.slice(4));
else if(n===SR)h='<h1 class="t">Buscar</h1><input id="sq" type="search" autocomplete="off" placeholder="Buscar en notas y textos…" value="'+esc(S.q||'')+'"><div id="sr">'+sres(S.q||'')+'</div>';
else if(n===H){const tr=tagRecs(),all=[...new Set(tr.flatMap(r=>r.tags))].sort(),f=S.tag;h='<h1 class="t">Hashtags</h1><div class="bar" style="flex-wrap:wrap">'+['',...all].map(t=>'<button data-t="'+esc(t)+'"'+(f===t?' class="p"':'')+'>'+(t?'#'+esc(t):'Todos')+'</button>').join('')+'</div>'+(tr.filter(r=>!f||r.tags.includes(f)).map(r=>'<div class="hi"><div class="mu">'+(r.date?'<a class="l" data-p="'+r.date+'">'+r.date+'</a> ':'')+'<a class="l" data-p="'+esc(r.pg)+'">'+esc(r.pg)+'</a></div><div>'+inl(r.tx)+'</div></div>').join('')||'<p class="mu">Sin resultados. Escribe #etiqueta en cualquier línea.</p>')}
else{const pg=S.pages[n];if(!pg){go(D);return}
h='<div class="bar"><input id="tt" class="t" aria-label="Nombre de la nota" value="'+esc(n)+'"><button id="bm">'+(S.mode==='edit'?'Ver':'Editar')+'</button><button id="bx">Borrar</button></div>';
h+=tocH(pg.t);if(S.mode==='edit')h+='<textarea id="ta" spellcheck="false" placeholder="Escribe aquí. Usa / para comandos. Un # Título nombra la nota.">'+esc(pg.t)+'</textarea>';
else{h+='<div class="blk">'+(pg.t?render(n,pg.t):'<p class="mu">Nota vacía.</p>')+'</div>';
if(isD(n)){const rs=records().filter(r=>r.date===n);h+='<h2 class="s">Registro de este día</h2>'+recTable(rs,1,1)}}}
app.innerHTML=h;app.style.maxWidth=(n===AG||n===R||n===FZ||n.startsWith('REG:'))?'1100px':'';bind()}
function bind(){
app.querySelectorAll('[data-p]').forEach(e=>e.onclick=ev=>{ev.preventDefault();openRef(e.dataset.p)});
const b=$('#bd');if(b)b.onclick=newDaily;
app.querySelectorAll('[data-c]').forEach(e=>e.onchange=()=>toggle(S.cur,+e.dataset.c));
app.querySelectorAll('[data-rp]').forEach(e=>e.onchange=()=>toggle(e.dataset.rp,+e.dataset.ri));
app.querySelectorAll('[data-k]').forEach(e=>e.onclick=()=>{const k=e.dataset.k;open.has(k)?open.delete(k):open.add(k);saveUi();draw()});
app.querySelectorAll('[data-ch]').forEach(e=>e.onclick=()=>{const k=e.dataset.ch;cl.has(k)?cl.delete(k):cl.add(k);saveUi();draw()});
const bm=$('#bm');if(bm)bm.onclick=()=>{S.mode=S.mode==='edit'?'view':'edit';draw()};
const bx=$('#bx');if(bx)bx.onclick=()=>{if(bx.dataset.s){delete S.pages[S.cur];save();go(D)}else{bx.dataset.s=1;bx.textContent='¿Seguro?'}};
app.querySelectorAll('[data-t]').forEach(e=>e.onclick=()=>{S.tag=e.dataset.t;draw()});
app.querySelectorAll('[data-v]').forEach(e=>e.onclick=()=>{S.ag.v=e.dataset.v;draw()});
app.querySelectorAll('[data-n]').forEach(e=>e.onclick=()=>{const k=+e.dataset.n,a=S.ag;if(!k)a.d=new Date();else if(a.v==='month')a.d=new Date(a.d.getFullYear(),a.d.getMonth()+k,1);else a.d=add(a.d,k*({day:1,'3d':3,week:7})[a.v]);draw()});
app.querySelectorAll('[data-gd]').forEach(e=>e.onclick=()=>{S.ag.d=PD(e.dataset.gd);S.ag.v='day';draw()});
const ab=$('.agb');if(ab){const nw=ab.querySelector('.now');ab.scrollTop=nw?Math.max(0,parseFloat(nw.style.top)-160):48*7}
app.querySelectorAll('[data-fa]').forEach(e=>e.onclick=()=>{S.fa=e.dataset.fa;draw()});
app.querySelectorAll('[data-cs]').forEach(e=>e.onclick=ev=>{ev.stopPropagation();crStop(e.dataset.cs)});
const ac=$('[data-addc]');if(ac)ac.onclick=()=>regAddCol(ac.dataset.addc,$('#ncol').value);
const ao=$('[data-addo]');if(ao)ao.onclick=()=>regAddObj(ao.dataset.addo,$('#nobj').value);
app.querySelectorAll('[data-go]').forEach(e=>e.onclick=()=>{const i=+e.dataset.go;if(S.mode==='edit'){const t=$('#ta');if(!t)return;const st=t.value.split('\n').slice(0,i).join('\n').length+(i?1:0);t.focus();t.setSelectionRange(st,st);t.scrollTop=Math.max(0,i*24-60)}else{const el=document.getElementById('h'+i);if(el)el.scrollIntoView({behavior:'smooth',block:'start'})}});
app.querySelectorAll('[data-tg]').forEach(e=>e.onclick=()=>{S.toc=S.toc===false;draw()});
const tt=$('#tt');if(tt){tt.onchange=()=>rename(S.cur,tt.value);tt.onkeydown=e=>{if(e.key==='Enter')tt.blur()}}
const sq=$('#sq');if(sq){sq.focus();sq.oninput=()=>{S.q=sq.value;$('#sr').innerHTML=sres(S.q)}}
const sr=$('#sr');if(sr)sr.onclick=e=>{const t=e.target.closest('[data-sp]');if(!t)return;const p=t.dataset.sp,i=+t.dataset.si;if(i<0){go(p,'view');return}S.jump={p,i,q:S.q};S.cur=p;S.mode='edit';S.f=1;draw()};
app.onchange=e=>{const t=e.target,d=t.dataset;if(d.fp!==undefined){let v=t.value;if(d.f==='date'){v=v?v.slice(2,4)+'/'+v.slice(5,7)+'/'+v.slice(8):'';finSet(d.fp,+d.fi,'fecha',v)}else finSet(d.fp,+d.fi,d.f,v)}else if(d.en)parseEn(d.en,t.value);else if(d.rg!==undefined)regSet(d.rg,+d.ri,d.rk,t.value,d.rt)};
let lt=0;const bl=app.querySelector('.blk');if(bl)bl.onclick=e=>{if(e.target.closest('a,button,input'))return;const t0=Date.now();if(t0-lt<450&&e.target.closest('.ln,.td,h1,h2,h3,blockquote,.at,p')){lt=0;S.mode='edit';S.f=1;draw()}else lt=t0};
app.onclick=e=>{if(S.mode==='edit'&&S.pages[S.cur]&&e.target.isConnected&&!e.target.closest('textarea,button,input,a,.bar')){S.mode='view';draw()}};
const ta=$('#ta');if(ta){editor(ta);if(S.f){ta.focus();S.f=0}if(S.jump&&S.jump.p===S.cur){const L=ta.value.split('\n'),i=S.jump.i,st=L.slice(0,i).join('\n').length+(i?1:0),tk=norm(S.jump.q).split(/\s+/).filter(Boolean),ix=tk.length?norm(L[i]||'').indexOf(tk[0]):-1,a=st+Math.max(ix,0);ta.focus();ta.setSelectionRange(a,a+(ix<0?0:(tk[0]||'').length));ta.scrollTop=Math.max(0,i*24-100);S.jump=null}}}
/* editor */
const CMD=[['Título 1','# '],['Título 2','## '],['Lista','- '],['TODO','- [ ] '],['Atributo (indentado)','\n  - clave:: '],['Cita','> '],['Versión (##v)','##v '],['Egreso','- e'],['Ingreso','- i'],['Crono (cronómetro)','{{crono:@@C}} '],['Código','`código`'],['Negrita','**texto**'],['Fecha de hoy','[['+'T'+']] ']];
let mi=0,ms=0,mp=0,mf=[],mta=null;
function hideMenu(){$('#menu').style.display='none';mf=[]}
function showMenu(q,ta){mta=ta;mf=CMD.filter(c=>c[0].toLowerCase().includes(q.toLowerCase()));
if('fecha'.includes(q.toLowerCase())||!q)mf.push(['date']);
if(!mf.length){hideMenu();return}mi=Math.min(mi,mf.length-1);
const m=$('#menu');m.style.display='block';
m.innerHTML=mf.map((c,i)=>c[0]==='date'?'<div class="'+(i===mi?'on':'')+'" data-i="'+i+'">Elegir fecha <input type="date" id="dp"></div>':'<div class="'+(i===mi?'on':'')+'" data-i="'+i+'">'+esc(c[0])+'</div>').join('');
m.onmousedown=e=>{if(e.target.id!=='dp')e.preventDefault()};
m.querySelectorAll('div').forEach(d=>d.onclick=e=>{if(e.target.id==='dp')return;pick(+d.dataset.i)});
const dp=$('#dp');if(dp)dp.onchange=()=>{if(!dp.value)return;const[y,mo,da]=dp.value.split('-');ins('[['+y.slice(2)+'/'+mo+'/'+da+']] ')}}
function ins(txt){const ta=mta;ta.focus();const ls=ta.value.lastIndexOf('\n',ms-1)+1;if(txt[0]==='\n'&&!ta.value.slice(ls,ms).trim())txt=txt.slice(1);ta.setRangeText(txt.replace('@@C',Date.now()),ms,mp,'end');hideMenu();ta.dispatchEvent(new Event('input'))}
function pick(i){const c=mf[i];if(c[0]==='date'){const d=$('#dp');if(d.showPicker)try{d.showPicker()}catch(e){}return}
ins(c[0]==='Fecha de hoy'?'[['+today()+']] ':c[1])}
function editor(ta){
ta.oninput=()=>{S.pages[S.cur].t=ta.value;S.pages[S.cur].r=Date.now();clearTimeout(tmr);tmr=setTimeout(save,300);clearTimeout(rt);rt=setTimeout(retitle,1000);
const p=ta.selectionStart,ls=ta.value.lastIndexOf('\n',p-1)+1,m=ta.value.slice(ls,p).match(/(^|\s)\/(\S*)$/);
if(m){mp=p;ms=p-m[2].length-1;showMenu(m[2],ta)}else hideMenu()};
ta.onpaste=e=>{const t=(e.clipboardData||window.clipboardData).getData('text').trim(),a=ta.selectionStart,b=ta.selectionEnd;if(a===b||!/^https?:\/\/\S+$/i.test(t))return;e.preventDefault();ta.setRangeText('['+ta.value.slice(a,b)+']('+t+')',a,b,'end');ta.dispatchEvent(new Event('input'))};
ta.onkeydown=e=>{const mo=$('#menu').style.display==='block';
if(mo){if(e.key==='ArrowDown'){mi=(mi+1)%mf.length;e.preventDefault();showMenu(ta.value.slice(ms+1,mp),ta);return}
if(e.key==='ArrowUp'){mi=(mi-1+mf.length)%mf.length;e.preventDefault();showMenu(ta.value.slice(ms+1,mp),ta);return}
if(e.key==='Enter'||e.key==='Tab'){e.preventDefault();pick(mi);return}
if(e.key==='Escape'){hideMenu();return}}
const p=ta.selectionStart,ls=ta.value.lastIndexOf('\n',p-1)+1;let le=ta.value.indexOf('\n',p);if(le<0)le=ta.value.length;const line=ta.value.slice(ls,le);
if(e.key==='Tab'){e.preventDefault();if(e.shiftKey){const n=line.match(/^ {1,2}/);if(n){ta.setRangeText(line.slice(n[0].length),ls,le,'preserve')}}else ta.setRangeText('  '+line,ls,le,'preserve');ta.setSelectionRange(p+(e.shiftKey?-1:2),p+(e.shiftKey?-1:2));ta.dispatchEvent(new Event('input'))}
if(e.key==='Enter'){const m=line.match(/^(\s*)([-*] \[[ xX]\] |-\[[ xX]\] |[-*] )/);if(m&&p>=ls+m[0].length){e.preventDefault();
if(line.trim().length<=m[2].trim().length){ta.setRangeText('',ls,le,'end')}else{const mk=m[2].includes('[')?'- [ ] ':m[2];ta.setRangeText('\n'+m[1]+mk,p,p,'end')}ta.dispatchEvent(new Event('input'))}}};
}
function retitle(){const pg=S.pages[S.cur];if(!pg||!pg.u)return;const m=pg.t.match(/^#\s+(.+)$/m);if(!m)return;
const nm=m[1].trim().replace(/\s+/g,' ').slice(0,80);if(!nm||nm===S.cur)return;
const o=S.cur;delete S.pages[o];let n=nm,i=2;while(S.pages[n])n=nm+' '+i++;pg.u=false;S.pages[n]=pg;S.cur=n;save();
const h=$('#tt');if(h)h.value=n}
/* header */
$('#hD').onclick=()=>go(D);$('#hR').onclick=()=>go(R);$('#hA').onclick=()=>go(AG);$('#hH').onclick=()=>go(H);$('#hF').onclick=()=>go(FZ);$('#hS').onclick=()=>go(SR);$('#hB').onclick=()=>hb(-1);$('#hFw').onclick=()=>hb(1);$('#hU').onclick=()=>undo(-1);$('#hRd').onclick=()=>undo(1);
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();go(SR)}});
$('#hN').onclick=()=>{const n=newPage('Sin título',' ',true);S.pages[n].t='# ';save();go(n,'edit');const ta=$('#ta');if(ta){ta.focus();ta.setSelectionRange(2,2)}};
/* export / import */
const md=$('#modal'),mt=$('#mt'),mm=$('#mm');
const dump=()=>JSON.stringify({app:'cuaderno',v:1,pages:S.pages,enums:EN},null,1);
$('#hX').onclick=()=>{mt.value=dump();mm.textContent=Object.keys(S.pages).length+' notas.';md.style.display='flex'};
$('#mX').onclick=()=>md.style.display='none';
$('#mC').onclick=async()=>{try{await navigator.clipboard.writeText(mt.value);mm.textContent='Copiado.'}catch(e){mt.select();mm.textContent='Selecciona y copia manualmente.'}};
$('#mS').onclick=async()=>{const f=new File([dump()],'cuaderno-'+today().replace(/\//g,'-')+'.json',{type:'application/json'});
try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return}}catch(e){}
const a=document.createElement('a');a.href=URL.createObjectURL(f);a.download=f.name;a.click();mm.textContent='Si no se descargó, usa Copiar y guarda el texto.'};
function imp(txt){try{const j=JSON.parse(txt),p=j.pages||j;let c=0;if(j.enums){EN={...EN,...j.enums};saveEn()}for(const k in p){if(p[k]&&typeof p[k].t==='string'){S.pages[k]={t:p[k].t,u:!!p[k].u,r:p[k].r||0};c++}}save();mm.textContent=c+' notas importadas.';draw()}catch(e){mm.textContent='El contenido no es válido.'}}
$('#mI').onclick=()=>imp(mt.value);
$('#mF').onchange=e=>{const f=e.target.files[0];if(f)f.text().then(t=>{mt.value=t;imp(t)})};
draw();
