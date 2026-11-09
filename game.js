'use strict';
/* DEEPER DUMBER - canvas 320x176, tile 16px. Semua rintangan = instant death, selalu berpola. */
const C=document.getElementById('c'),X=C.getContext('2d'),$=id=>document.getElementById(id);
const T=16,VW=320,VH=176,COLS=72,ROWS=11,GY=104;
const SK={putih:'#f1ebdf',coklat:'#d99a5b',abu:'#9b9b9b'};
const CR='#f1ebdf',GR='#6fcf4f',SU='#d8c42e',DK='#24160d';
const GIFTS=['napas lega','rasa percaya diri palsu','tepukan di punggung','stiker "Hampir"','Mahkota Dumber'];
const TAUNT=['Lantai itu tidak pernah berjanji akan tetap ada.','Tembok tidak selalu nyata. Coba lihat ke belakangmu.','Pintu keluar kadang tidak mau diam.','Sabar. Pola itu ada. Kamu cuma belum melihatnya.','Semakin dalam, semakin... ya begitulah.'];
let skin='putih',st='menu',fr=0,keys={},g,g0,tr,hz,dr,ar,mo,co,ch,door,key,P,cam=0,fx={},got=[0,0,0,0,0],hasKey,hopped,deaths=0,shake=0,sb=[],fade={a:0,d:0,cb:null},AC,toastT;
P={x:24,y:GY-14,w:10,h:14,vx:0,vy:0,g:1,f:1};
for(let i=10;i<15;i++)sb.push({i,x:i*T,y:GY,vy:0,d:99});

function beep(f,d=.1,ty='square',v=.04){try{AC=AC||new AudioContext();const o=AC.createOscillator(),a=AC.createGain();o.type=ty;o.frequency.value=f;a.gain.setValueAtTime(v,AC.currentTime);a.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(a);a.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function say(s,t=2600){const e=$('toast');e.textContent=s;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),t)}
function go2(cb){fade.d=1;fade.cb=cb}

/* ---------- LEVEL ---------- */
function build(){
 g=[];for(let r=0;r<ROWS;r++){g[r]=[];for(let c=0;c<COLS;c++)g[r][c]=(r==0||r>=9||c==0||c==COLS-1)?1:0}
 const box=(a,b,r0,r1,v)=>{for(let r=r0;r<=r1;r++)for(let c=a;c<=b;c++)g[r][c]=v};
 box(1,3,1,8,2);          // tembok palsu (bisa ditembus) = ruang koin ke-5
 box(8,10,0,0,0);         // lubang tempat karakter jatuh
 box(22,22,8,8,1);box(23,23,7,8,1);box(24,24,6,8,1);box(25,25,5,8,1);box(26,30,5,8,1); // tangga + dataran
 g0=g.map(r=>r.slice());
 tr=[];hz=[];dr=[];ar=[];ch=null;fx={};got=[0,0,0,0,0];hasKey=0;hopped=0;
 mo=[{x:57*T,a:56*T,b:60*T,d:1},{x:62*T,a:61*T,b:65*T,d:-1}];mo.forEach(m=>{m.y=9*T-12;m.w=12;m.h=12});
 co=[[18,6],[27,3],[38,6],[54,6],[2,8]].map(([c,r],i)=>({i,x:c*T+4,y:r*T+4}));
 key={x:66*T+3,y:8*T+4,w:10,h:10};door={x:68*T,y:7*T,w:16,h:32};
 const at=(c,f)=>tr.push([c*T,f]),sp=(c,r,o)=>hz.push({t:'s',x:c*T+1,y:r*T+6,w:14,h:10,...o});
 const fall=c=>hz.push({t:'d',x:c*T+1,y:T,w:14,h:10,vy:0,ay:.25,ty:9*T-10});
 at(13.5,()=>box(15,17,9,10,0));                       // lantai amblas
 at(24.5,()=>{box(25,25,5,8,0);sp(25,8)});             // anak tangga lenyap + duri
 at(27.5,()=>sp(29,5,{w:30,y:5*T,ty:5*T-10,vy:-1}));   // duri muncul dari bawah
 at(33,()=>{ch={x:P.x-150,d:1,v:.75}});                // tembok berduri mengejar
 at(33.7,()=>fall(36));at(38.2,()=>fall(40));          // duri jatuh saat didekati
 at(41.5,()=>sp(43,8,{y:9*T,ty:9*T-10,vy:-1.4}));
 at(44.5,()=>{fx.ar=1});                               // panah melesat
}

/* ---------- UPDATE ---------- */
const sol=(c,r)=>c<0||c>=COLS?1:(r<0||r>=ROWS)?0:g[r][c]==1;
function mv(p,dx,dy){p.x+=dx;p.y+=dy;const a=Math.floor(p.x/T),b=Math.floor((p.x+p.w-.01)/T),e=Math.floor(p.y/T),f=Math.floor((p.y+p.h-.01)/T);
 for(let r=e;r<=f;r++)for(let c=a;c<=b;c++)if(sol(c,r)){
  if(dx>0)p.x=c*T-p.w;else if(dx<0)p.x=(c+1)*T;
  else if(dy>0){p.y=r*T-p.h;p.vy=0;p.g=1}else if(dy<0){p.y=(r+1)*T;p.vy=0}
  return}}
function startPlay(){build();P={x:9*T+3,y:-20,w:10,h:14,vx:0,vy:0,g:0,f:1};st='play';say('Cari pintu hijau. Jangan percaya lantai.')}
function die(){if(st!='play')return;st='dead';deaths++;shake=12;beep(110,.45,'sawtooth',.07);setTimeout(()=>showEnd(0),650)}
function showEnd(win){const n=got.reduce((a,b)=>a+b);
 $('et').textContent=win?'SELAMAT!':'KAMU MATI';
 $('ep').textContent=win?'Kamu menemukan pintu keluar... ke lantai yang LEBIH DALAM. Bukan ke permukaan. Kenapa malah turun?! Dasar dumber. '+(n==5?'Semua koin terkumpul! Hadiah rahasia: gelar "Deeper Dumber Sejati".':n?'Koin '+n+'/5. Hadiah: '+got.map((v,i)=>v?GIFTS[i]:'').filter(Boolean).join(', ')+'.':'Tanpa koin, tanpa hadiah. Tapi tetap dumber.'):TAUNT[Math.random()*TAUNT.length|0];
 $('rt').textContent=win?'TURUN LAGI':'ULANGI DARI AWAL';$('end').classList.remove('hide')}
function restart(){if(fade.d||$('end').classList.contains('hide'))return;$('end').classList.add('hide');go2(startPlay)}

function intro(){
 if(!fx.fall){P.vx=1.1;P.x+=1.1;if(P.x+5>10*T){fx.fall=1;sb.forEach((b,i)=>b.d=i*4);beep(160,.3,'square',.05)}}
 else{P.vy+=.22;P.y+=P.vy;sb.forEach(b=>{if(b.d--<0){b.vy+=.3;b.y+=b.vy}});if(P.y>VH+10&&!fade.d)go2(startPlay)}
}
function upd(){
 fr++;if(shake>0)shake--;
 if(fade.d){fade.a+=fade.d*.03;if(fade.a>=1){fade.a=1;fade.d=-1;const f=fade.cb;fade.cb=null;f&&f()}else if(fade.a<=0){fade.a=0;fade.d=0}}
 if(st=='intro')return intro();
 if(st!='play')return;
 const p=P,L=keys.ArrowLeft||keys.KeyA,R=keys.ArrowRight||keys.KeyD,J=keys.ArrowUp||keys.KeyW||keys.Space;
 p.vx=((R?1:0)-(L?1:0))*1.4;if(p.vx)p.f=p.vx>0?1:-1;
 if(J&&p.g){p.vy=-4.3;p.g=0;beep(500,.08)}
 if(!J&&p.vy<-1.5)p.vy=-1.5;
 p.vy=Math.min(p.vy+.22,5);mv(p,p.vx,0);p.g=0;mv(p,0,p.vy);
 cam=Math.max(0,Math.min(COLS*T-VW,p.x-VW/2));
 tr=tr.filter(([x,f])=>p.x+5>=x?(f(),false):true);
 hz.forEach(h=>{if(h.vy||h.ay){h.vy=(h.vy||0)+(h.ay||0);h.y+=h.vy;if(h.ty!=null&&(h.vy>0?h.y>=h.ty:h.y<=h.ty)){h.y=h.ty;h.vy=0;h.ay=0;h.t='s'}}});
 if(fx.ar&&fr%55==0){fx.n=(fx.n||0)+1;ar.push({x:cam+VW+8,y:fx.n%2?8*T+6:6*T+3,w:10,h:4})}   // bawah lalu atas, bergantian
 ar.forEach(a=>a.x-=2.4);ar=ar.filter(a=>a.x>cam-20);
 [51,53].forEach((c,i)=>{if((fr+i*35)%70==0)dr.push({x:c*T+5,y:T,t:0,w:5,h:6})});
 dr.forEach(d=>{if(++d.t>30)d.y+=2.6});dr=dr.filter(d=>d.y<9*T-4);
 mo.forEach(m=>{m.x+=m.d*.6;if(m.x<m.a||m.x>m.b-12)m.d*=-1});
 const hit=a=>p.x+p.w-2>a.x&&p.x+2<a.x+a.w&&p.y+p.h-2>a.y&&p.y+2<a.y+a.h;
 const er=fr%170>=140;
 if(p.y>VH+10||hz.some(hit)||ar.some(hit)||mo.some(hit)||dr.some(d=>d.t>30&&hit(d))||(er&&hit({x:47*T+2,y:3*T,w:28,h:6*T}))||(ch&&(ch.d>0?p.x<ch.x:p.x+p.w>ch.x)))return die();
 if(ch)ch.x+=ch.d*ch.v;
 co.forEach(c=>{if(!got[c.i]&&hit({x:c.x,y:c.y,w:8,h:8})){got[c.i]=1;beep(880,.15);say('Koin! Hadiah: '+GIFTS[c.i]+' ('+got.reduce((a,b)=>a+b)+'/5)')}});
 if(!hasKey&&hit(key)){hasKey=1;beep(660,.12);say('Kunci didapat! Pintu keluar sudah dekat.')}
 if(hit(door)){
  if(!hopped){hopped=1;door.x=6*T;g=g0.map(r=>r.slice());tr=[];hz=[];ch={x:COLS*T,d:-1,v:1};shake=14;beep(200,.3,'sawtooth');
   say(hasKey?'Pintu ini ternyata tidak butuh kunci. Dan... pintunya KABUR ke tempat awal! Kejar!':'Pintunya tidak butuh kunci. Dan... KABUR ke tempat awal! Kejar!',4200)}
  else{st='win';beep(523,.3);setTimeout(()=>showEnd(1),500)}
 }
}

/* ---------- DRAW ---------- */
function drawP(p){const x=Math.round(p.x),y=Math.round(p.y),c=SK[skin],w=Math.floor(fr/6)%2,m=Math.abs(p.vx)>0&&p.g!==0;
 X.fillStyle='#120a05';X.fillRect(x-1,y-3,12,14);
 X.fillStyle=c;X.fillRect(x,y,10,10);X.fillRect(x,y-2,3,2);X.fillRect(x+7,y-2,3,2);
 X.fillRect(x+1,y+10,3,m&&w?2:4);X.fillRect(x+6,y+10,3,m&&!w?2:4);
 X.fillStyle='#120a05';X.fillRect(x+(p.f>0?6:2),y+3,2,3)}
function spk(h){X.fillStyle=CR;for(let i=0;i<Math.ceil(h.w/7);i++){const x=h.x+i*7;X.beginPath();
 if(h.t=='d'){X.moveTo(x,h.y);X.lineTo(x+7,h.y);X.lineTo(x+3.5,h.y+h.h)}else{X.moveTo(x,h.y+h.h);X.lineTo(x+7,h.y+h.h);X.lineTo(x+3.5,h.y)}X.fill()}}

function surface(){
 X.fillStyle='#efe8d6';X.fillRect(0,0,VW,VH);
 X.fillStyle='#fffaf0';[[30,22],[150,14],[250,32]].forEach(([x,y])=>{x=(x+fr*.08)%360-34;X.fillRect(x,y,34,8);X.fillRect(x+6,y-6,20,6)});
 for(let x=0;x<VW;x++){X.fillStyle='#b8946a';X.fillRect(x,(78+Math.sin(x*.03)*12)|0,1,VH);X.fillStyle='#8f6238';X.fillRect(x,(92+Math.sin(x*.05+1)*7)|0,1,VH)}
 [90,270,303].forEach((x,i)=>{const s=i==2?.7:1;X.fillStyle='#4a2c17';X.fillRect(x,GY-22*s,4,22*s);X.fillStyle=GR;X.fillRect(x-8*s,GY-40*s,20*s,20*s);X.fillRect(x-4*s,GY-46*s,12*s,6*s)});
 X.fillStyle=DK;X.fillRect(10*T,GY,5*T,VH-GY);
 for(let i=0;i<20;i++){const b=sb.find(b=>b.i==i)||{x:i*T,y:GY};
  X.fillStyle='#6b4428';X.fillRect(b.x,b.y,T,VH-GY);X.fillStyle='#8d5d36';X.fillRect(b.x+3+(i*5)%9,b.y+10+(i*3)%20,3,2);
  X.fillStyle=GR;X.fillRect(b.x,b.y,T,4);if(i%3==1){X.fillStyle=CR;X.fillRect(b.x+6,b.y-3,2,2)}}
 drawP(P)}

function level(){
 X.fillStyle=DK;X.fillRect(0,0,VW,VH);
 X.fillStyle='#2c1b10';for(let x=-((cam*.5)%32);x<VW;x+=32)for(let y=0;y<VH;y+=16)X.fillRect(x+((y/16)%2?16:0),y,30,14);
 X.save();X.translate(-Math.round(cam),0);
 hz.forEach(spk);
 const c0=Math.floor(cam/T);
 for(let r=0;r<ROWS;r++)for(let c=c0;c<=c0+21&&c<COLS;c++){const v=g[r][c],x=c*T,y=r*T;
  if(v==1){X.fillStyle='#6b4428';X.fillRect(x,y,T,T);X.fillStyle='#8d5d36';X.fillRect(x,y,T,2);X.fillStyle='#4a2c17';X.fillRect(x+T-1,y,1,T);X.fillRect(x,y+T-1,T,1);
   if(r>0&&g[r-1][c]!=1&&r<9||r==9&&g[8][c]!=1){X.fillStyle=GR;X.fillRect(x,y,T,3)}}
  else if(v==2){X.globalAlpha=.55;X.fillStyle='#4a2c17';X.fillRect(x,y,T,T);X.globalAlpha=1}}
 // pintu, kunci, koin
 X.fillStyle=CR;X.fillRect(door.x-2,door.y-2,20,34);X.fillStyle=GR;X.fillRect(door.x,door.y,16,32);X.fillStyle=DK;X.fillRect(door.x+3,door.y+4,10,28);X.fillStyle=CR;X.fillRect(door.x+10,door.y+18,2,2);
 if(!hasKey){X.fillStyle=CR;X.fillRect(key.x,key.y,5,5);X.fillRect(key.x+4,key.y+2,6,2);X.fillRect(key.x+8,key.y+4,2,3)}
 co.forEach(c=>{if(got[c.i])return;const y=c.y+Math.sin(fr*.1+c.i)*1.5;X.fillStyle='#d9e86a';X.fillRect(c.x+1,y,6,8);X.fillRect(c.x,y+1,8,6);X.fillStyle='#8d9a2c';X.fillRect(c.x+3,y+2,2,4)});
 // sulfur: genangan menyembur (fase: tenang -> menggelembung -> semburan)
 const ph=fr%170;X.fillStyle=SU;X.fillRect(47*T,8*T+11,32,5);
 if(ph>=100&&ph<140){X.fillRect(47*T+4+(fr*3)%24,8*T+6-fr%8,3,3);X.fillRect(47*T+20-(fr*2)%16,8*T+8-fr%6,3,3)}
 if(ph>=140){X.fillRect(47*T+6,3*T,20,6*T);X.fillStyle=CR;X.fillRect(47*T+13,3*T,6,6*T)}
 dr.forEach(d=>{X.fillStyle=SU;const s=d.t<30?2+d.t/10:6;X.fillRect(d.x,d.y,Math.min(s,5),s)});
 mo.forEach(m=>{X.fillStyle=GR;X.fillRect(m.x,m.y+3,12,9);X.fillRect(m.x+2,m.y,8,3);X.fillStyle=DK;X.fillRect(m.x+(m.d>0?7:2),m.y+4,3,3)});
 X.fillStyle=CR;ar.forEach(a=>{X.fillRect(a.x+4,a.y+1,8,2);X.fillRect(a.x,a.y,4,4)});
 if(st!='win')drawP(P);
 if(ch){const s=ch.d;X.fillStyle='#3a2415';X.fillRect(s>0?ch.x-80:ch.x,0,80,VH);X.fillStyle=CR;for(let y=0;y<VH;y+=14){X.beginPath();X.moveTo(ch.x,y);X.lineTo(ch.x,y+14);X.lineTo(ch.x+s*10,y+7);X.fill()}}
 X.restore();
 X.font='bold 9px monospace';X.fillStyle=CR;X.fillText('KOIN '+got.reduce((a,b)=>a+b)+'/5   MATI '+deaths,6,12)}

function draw(){
 X.save();if(shake>0)X.translate((Math.random()-.5)*4,(Math.random()-.5)*4);
 (st=='menu'||st=='intro')?surface():level();
 X.restore();
 if(fade.a>0){X.fillStyle='rgba(18,10,5,'+fade.a+')';X.fillRect(0,0,VW,VH)}}

/* ---------- INPUT & LOOP ---------- */
Object.keys(SK).forEach(k=>{const b=document.createElement('button');b.style.background=SK[k];b.title=k;b.setAttribute('aria-label','Warna '+k);if(k==skin)b.className='on';
 b.onclick=()=>{skin=k;[...$('sk').children].forEach(x=>x.className='');b.className='on';beep(400,.05)};$('sk').appendChild(b)});
$('go').onclick=()=>{beep(300,.08);$('menu').classList.add('hide');st='intro'};
$('rt').onclick=restart;
addEventListener('keydown',e=>{keys[e.code]=1;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();if(e.code=='KeyR')restart()});
addEventListener('keyup',e=>keys[e.code]=0);
addEventListener('blur',()=>keys={});
document.querySelectorAll('#pad button').forEach(b=>{const k=b.dataset.k;
 b.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=1});
 ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>keys[k]=0))});
let last=0,acc=0;
(function loop(t){acc+=Math.min(t-last,100);last=t;while(acc>=16.67){upd();acc-=16.67}draw();requestAnimationFrame(loop)})(0);
