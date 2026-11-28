'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const defaultAvatar={skin:'#c6a183',hairStyle:'curto',hairColor:'#302b25',shirt:'listrada',accessory:'bone',number:12};
let profile=null,avatar={...defaultAvatar};
const FAN_LEVELS=[{xp:0,name:'Torcedor',power:'Chute simples'},{xp:300,name:'Fôlego',power:'Regeneração'},{xp:950,name:'Dobradinha',power:'Chute duplo'},{xp:1800,name:'Arquibancada',power:'Leque de bolas'},{xp:3000,name:'Torcida completa',power:'Chute circular'}];
let bossTutorialSeen=false;try{bossTutorialSeen=localStorage.getItem('gdp-boss-tutorial-v1')==='seen';}catch{}
function fanLevelForXP(xp){let level=1;while(level<FAN_LEVELS.length&&xp>=FAN_LEVELS[level].xp)level++;return level;}
function gainXP(amount){
 if(!state||amount<=0)return;const before=state.fanLevel;state.xp+=amount;state.fanLevel=fanLevelForXP(state.xp);
 if(state.fanLevel>before){state.upgradeUntil=state.time+5;toast('NÍVEL '+state.fanLevel+' · '+FAN_LEVELS[state.fanLevel-1].power.toUpperCase()+' DESBLOQUEADO!');beep(820,.18);}updateXPHud();
}
function fanShotAngles(angle){if(state.fanLevel>=5)return [-.28,-.14,0,.14,.28,Math.PI/2,Math.PI,Math.PI*1.5].map(a=>angle+a);if(state.fanLevel>=4)return [-.28,-.14,0,.14,.28].map(a=>angle+a);if(state.fanLevel>=3)return [angle-.06,angle+.06];return [angle];}
function updateXPHud(){
 if(!state)return;const level=state.fanLevel||1,current=FAN_LEVELS[level-1],next=FAN_LEVELS[level],earned=state.xp-current.xp,needed=next?next.xp-current.xp:0;
 $('#fan-level').textContent='NÍVEL '+level+' · '+current.name.toUpperCase();$('#xp-count').textContent=next?earned+' / '+needed+' XP':state.xp+' XP · MÁXIMO';const percent=next?Math.min(100,earned/needed*100):100;$('#xp-bar').style.width=percent+'%';$('#xp-progress').setAttribute('aria-valuenow',String(Math.round(percent)));$('#xp-progress').setAttribute('aria-valuetext',state.xp+' XP, nível '+level);
 $('#xp-next').textContent=next?'PRÓXIMO: '+next.power.toUpperCase():'TODOS OS PODERES DESBLOQUEADOS';$('#xp-powers').textContent=(state.upgradeUntil>state.time?'NOVO: ':'')+(level===2?'Regeneração após 5s sem dano':current.power)+(level>=3?' · Regeneração após 5s sem dano':'');$('#xp-progress').classList.toggle('xp-upgrade',state.upgradeUntil>state.time);
}
function drawRoomDecor(){}
function drawRoomStation(){}
function updateBossDialogue(){}
function drawBossDialogue(b){label(b.quote||levels[state.level].quote,b.x,b.y+84,'#e2dbb9',14);}
const levels=[
 {boss:'Nestor Carimbo',area:'CENTRO DE TREINAMENTO',title:'O futebol pede explicações.',color:'#28392b',hp:22,quote:'“Minha caneta só assina em ano bissexto.”',attack:'PROCESSO',pautas:['Planejamento do elenco','Critérios de contratação','Resultados do futebol'],cleared:'Você furou a blindagem do futebol. Agora leve o processo ao Célio Parecer.'},
 {boss:'Célio Parecer',area:'ESCRITÓRIO DO CEO',title:'O labirinto dos pareceres.',color:'#29353c',hp:28,quote:'“Esse carimbo está no modo avião.”',attack:'PARECER',pautas:['Parecer jurídico','Validação financeira','Plano de transição'],cleared:'O processo saiu da mesa do CEO. Bento ainda precisa autorizar.'},
 {boss:'Bento Protocolo',area:'GABINETE / AUTORIZAÇÃO',title:'Autorizado a pedir autorização.',color:'#3a342b',hp:34,quote:'“A autorização ficou presa no elevador.”',attack:'REUNIÃO',pautas:['Resposta à torcida','Responsável interino','Prioridades do futebol'],cleared:'Bento autorizou o encaminhamento. A decisão final é na mesa de Otávio.'},
 {boss:'Otávio Martelo',area:'CONSELHO / DECISÃO FINAL',title:'A última palavra custa caro.',color:'#362b36',hp:42,quote:'“Esta reunião dura até acabar o café.”',attack:'JUROS',pautas:['Custo da rescisão','Plano de sucessão','Origem dos recursos'],cleared:'Todas as instâncias vencidas. O botão finalmente está liberado.'}
];
const types={
 boleto:{name:'BOLETO',hp:1,speed:90,damage:7,color:'#e4dbb9',tip:'Persegue você. Derrube com uma cobrança.'},
 contrato:{name:'CONTRATO',hp:2,speed:64,damage:6,color:'#b7c8e1',tip:'Resiste a duas cobranças e deixa você lento.'},
 bagre:{name:'BAGRE',hp:1,speed:82,damage:6,color:'#d8ad77',tip:'Jogador fictício. Chuta bolas para todo lado.'},
 empresario:{name:'EMPRESÁRIO',hp:2,speed:48,damage:9,color:'#c9a1bf',tip:'Avança em rajadas. Não fique parado.'},
 carimbado:{name:'CARIMBADO',hp:2,speed:108,damage:7,color:'#d3a1a1',tip:'Adversário fictício. Avança em grupo e lança faixas de passa-pano.'}
};
let phase='menu',state=null,keys={},last=0,sound=false,audio,toastUntil=0,pausedFrom='corridor',best=0;
const FIXED_STEP=1/120;let accumulator=0,hudElapsed=0,renderAlpha=1;
try{best=Number(localStorage.getItem('bracks-fan-best'))||0}catch{}
const canvas=$('#world'),ctx=canvas.getContext('2d');
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function label(s,x,y,c='#cad6bc',size=12){ctx.fillStyle=c;ctx.font=`bold ${size}px monospace`;ctx.textAlign='center';ctx.fillText(s,x,y)}
function person(c,x,y,id=4,scale=1,walk=0){
 c.save();c.translate(x,y);c.scale(scale,scale);
 const r=(a,b,w,h,col)=>{c.fillStyle=col;c.fillRect(a,b,w,h)};
 const skin=id===4?avatar.skin:'#c6a183',shirt=avatar.shirt==='preta'?'#222b24':'#e5e6da';
 r(-12,17,25,5,'#0005');r(-8,-5,17,23,id===4?shirt:(['#7b8972','#99a994','#789d99','#bda477','#e5e6da'][id]||'#938477'));
 if(id===4){if(avatar.shirt==='listrada')for(let i=0;i<3;i++)r(-6+i*6,-5,3,23,'#202821');r(-4,-7,8,3,'#111b15');r(-12,-4,5,13,skin);r(9,-4,5,13,skin);r(-15,4,8,4,'#e5e6da');r(10,4,10,4,'#e5e6da');c.font='bold 6px monospace';c.textAlign='center';c.fillStyle=avatar.shirt==='preta'?'#e5e6da':'#687958';c.fillText(String(avatar.number||12),0,12);}
 else{r(-3,-5,7,18,'#e5e4d7');r(-1,-3,3,15,'#344037');r(-11,-3,3,15,'#c6a183');r(9,-3,3,15,'#c6a183');}
 r(-7,17,5,9+walk,'#151e19');r(3,17,5,9-walk,'#151e19');r(-7,-23,16,17,skin);
 if(id!==4)r(-8,-25,18,5,id===3?'#b7b8a7':'#3c3b31');
 else if(avatar.hairStyle!=='careca'){r(-8,-25,18,5,avatar.hairColor);if(avatar.hairStyle==='crespo'){r(-10,-27,22,7,avatar.hairColor);r(-8,-30,18,4,avatar.hairColor);}if(avatar.hairStyle==='longo'){r(-10,-22,4,20,avatar.hairColor);r(8,-22,4,20,avatar.hairColor);}}
 if(id===3){r(-8,-22,3,8,'#b7b8a7');r(7,-22,3,8,'#b7b8a7');}
 if(id===1){r(-6,-17,6,4,'#303d35');r(2,-17,6,4,'#303d35');r(0,-16,2,1,'#303d35');}
 else{r(-4,-16,2,2,'#222b23');r(4,-16,2,2,'#222b23');}
 r(-1,-10,4,1,'#795846');if(id===4){if(avatar.accessory==='bone'){r(-8,-26,19,4,'#e1e3d9');r(-8,-29,15,4,'#1e2b20');r(6,-26,9,3,'#e1e3d9');}if(avatar.accessory==='faixa')r(-8,-22,18,3,'#ededdf');if(avatar.accessory==='cachecol'){r(-10,-5,22,5,'#ededdf');r(5,-2,5,16,'#ededdf');r(6,3,3,3,'#1e2b20');}}
 c.restore();
}
function beep(f=440,d=.07){if(!sound)return;try{audio ||= new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type='square';o.frequency.value=f;g.gain.value=.025;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.stop(audio.currentTime+d)}catch{}}
function toast(s){$('#toast').textContent=s;$('#toast').style.display='block';toastUntil=performance.now()+3600;}
function modal(title,body,buttons,tag='ARQUIBANCADA / CENTRAL DE COBRANÇA'){
 keys={};const m=$('#modal');$('#modal-content').innerHTML=`<div class="modal-icon">${tag}</div><h2>${title}</h2><p>${body}</p>`;
 buttons.forEach(([text,fn],i)=>{const b=document.createElement('button');b.className=i?'small':'primary';b.textContent=text;b.onclick=()=>{m.close();fn();};$('#modal-content').appendChild(b);});if(!m.open)m.showModal();
}
function instructions(){modal('Da arquibancada à decisão.','Você é o <b>torcedor</b>. Atravesse quatro fases: Nestor Carimbo, Célio Parecer, Bento Protocolo e Otávio Martelo.<br><br><b>1.</b> Reúna as três pautas nos balcões. Aproxime-se e aperte <b>E</b>.<br><b>2.</b> Vá à porta do chefe e aperte <b>E</b> para iniciar o confronto.<br><b>3.</b> Segure <b>E ou J</b> para lançar bolas de futebol com mira automática, com intervalo de 0,45 segundo entre chutes. Desvie das respostas até esvaziar a barra de resistência.<br><br><b>WASD / setas:</b> mover.<br><b>Espaço:</b> Raça, que afasta adversários e limpa os obstáculos próximos.<br><br>No celular: direcional, botão CHUTAR e botão RAÇA. Café recupera sanidade uma vez por fase. <b>XP:</b> pautas e vitórias desbloqueiam regeneração após 5s sem dano, chute duplo, leque e chute circular. A progressão vale nesta partida. <b>Shift / ESQUIVAR:</b> avanço curto com proteção e recarga. Observe os avisos no chão antes dos ataques dos chefes.',[['PARTIU COBRAR',()=>{}]]);}
function menu(){$('#registration').classList.add('hidden');phase='menu';keys={};$('#menu').classList.remove('hidden');$('#game').classList.add('hidden');$('#settings').disabled=false;}
function start(level=0){
 if(!profile){openRegistration(true);return;}
 state={level,x:85,y:305,patience:100,time:0,score:0,xp:0,fanLevel:1,checkpointXP:0,lastDamageAt:0,upgradeUntil:0,pautas:[false,false,false],defeated:Array(4).fill(false),shots:[],hazards:[],enemies:[],particles:[],cooldown:0,shotAt:0,inv:2,slow:0,stun:0,coffee:false,boss:null,interlude:null,spawnAt:0,checkpointScore:0,checkpointTime:0};
 for(let i=0;i<level;i++)state.defeated[i]=true;
 $('#menu').classList.add('hidden');$('#game').classList.remove('hidden');$('#settings').disabled=true;
 loadLevel(level);toast('Você é a voz da Massa. Reúna as três pautas e procure o chefe.');$('#world').focus();
}
function createStationLayout(random=Math.random){
 const slots=[155,465,790].flatMap(x=>[140,410].map(y=>({x,y})));
 for(let i=slots.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[slots[i],slots[j]]=[slots[j],slots[i]];}
 return slots.slice(0,5).map(p=>({x:p.x+Math.floor(random()*21)-10,y:p.y+Math.floor(random()*21)-10}));
}
function stations(){return [
 {x:155,y:140,w:150,h:65,kind:'pauta',n:0,name:levels[state.level].pautas[0]},
 {x:465,y:140,w:150,h:65,kind:'pauta',n:1,name:levels[state.level].pautas[1]},
 {x:790,y:140,w:150,h:65,kind:'pauta',n:2,name:levels[state.level].pautas[2]},
 {x:160,y:400,w:150,h:65,kind:'coffee',name:'CAFÉ DA MASSA'},
 {x:900,y:400,w:150,h:65,kind:'gate',name:levels[state.level].boss.toUpperCase()}
 ].map((d,i)=>({...d,...state.stationLayout?.[i]}));}
function near(){return stations().find(d=>Math.hypot(state.x-d.x-d.w/2,state.y-d.y-d.h/2)<125);}
function spawnEnemy(type,x,y){state.enemies.push({type,x,y,hp:types[type].hp,clock:Math.random()*2,fireAt:1.5+Math.random(),dash:0});}
function placePlayer(x,y){state.x=x;state.y=y;state.prevX=x;state.prevY=y;state.vx=0;state.vy=0;state.walkCycle=0;state.cameraX=Math.max(0,Math.min(560,x-280));}
function spawnReinforcements(count){
 const pool=['boleto','contrato','bagre','empresario'];
 for(let i=0;i<count;i++){const side=(Math.floor(state.time)+i)%4;const x=side===0?45:side===1?1075:150+Math.random()*820,y=side===2?95:side===3?545:120+Math.random()*390;
  if(Math.hypot(x-state.x,y-state.y)<180){spawnEnemy(pool[(i+state.level)%4],x<560?1070:45,y);}else spawnEnemy(pool[(i+Math.floor(state.time))%4],x,y);
 }
}
function loadLevel(level){
 state.stationLayouts ||= {};state.stationLayout=state.stationLayouts[level] ||= createStationLayout();
 state.level=level;placePlayer(85,305);state.pautas=[false,false,false];state.shots=[];state.hazards=[];state.enemies=[];state.inv=2;state.slow=0;state.stun=0;state.cooldown=0;state.shotAt=0;state.coffee=false;state.boss=null;state.spawnAt=0;
 state.interlude=null;state.checkpointScore=state.score;state.checkpointTime=state.time;state.checkpointXP=state.xp;phase='corridor';
 spawnEnemy('boleto',370,300);spawnEnemy('contrato',720,300);spawnEnemy('bagre',980,300);spawnEnemy('empresario',570,500);
 spawnReinforcements(3+level*2);
 $('#boss-panel').classList.add('hidden');updateHud();draw();
}
function interact(){
 if(phase==='finale'){if(Math.hypot(state.x-560,state.y-260)<135)beginDismissal();else toast('A decisão já foi tomada. Vá até a mesa para assinar.');return;}
 if(phase!=='corridor')return;const d=near();if(!d)return;
 if(d.kind==='pauta'){if(!state.pautas[d.n]){state.pautas[d.n]=true;state.score+=150;toast('PAUTA REUNIDA: '+d.name+'.');gainXP(75);beep(750);}else toast('Essa pauta já está na cobrança.');}
 if(d.kind==='coffee'){if(state.coffee)toast('O café acabou. Só na próxima fase.');else{state.coffee=true;state.patience=Math.min(100,state.patience+18);toast('Café da Massa: +18 de sanidade.');beep(660);}}
 if(d.kind==='gate'){if(state.pautas.filter(Boolean).length<3){toast('Reúna as três pautas antes de cobrar '+levels[state.level].boss+'.');beep(120);}else beginBoss();}
 updateHud();
}
function beginBoss(){
 const cfg=levels[state.level];keys={};$('#prompt').style.display='none';const fight=()=>{
  phase='boss';state.enemies=[];state.shots=[];state.hazards=[];placePlayer(560,485);state.inv=2;
  state.boss={x:560,y:145,hp:cfg.hp,max:cfg.hp,clock:0,fireAt:.7,spawnAt:2.5,shield:false,flash:0,quote:cfg.quote,quoteAt:4.5,quoteBand:'normal',quoteIndex:0};
  $('#boss-panel').classList.remove('hidden');$('#boss-quote').textContent='FALA FICTÍCIA · '+cfg.quote;updateHud();draw();$('#world').focus();
 };if(bossTutorialSeen){fight();return;}phase='briefing';
 modal('Primeiro confronto com um chefe.','<b>Segure E ou J</b> para chutar com mira automática e intervalo de 0,45 segundo. Desvie das áreas marcadas no chão.<br><br><b>Shift:</b> esquiva. <b>Espaço:</b> Raça. A barra vermelha é a resistência do chefe.<br><br>Ganhe XP com pautas e adversários para desbloquear poderes. Este aviso aparece uma vez neste navegador; você pode consultar COMO JOGAR no menu.',[['COMEÇAR A COBRANÇA',()=>{bossTutorialSeen=true;try{localStorage.setItem('gdp-boss-tutorial-v1','seen');}catch{}fight();}]],'TUTORIAL · CONFRONTO ARCADE');
}
const SHOT_INTERVAL=.45;
function shoot(){
 if(!state||!['corridor','boss','interlude'].includes(phase)||state.shotAt>0)return;
 let target=phase==='boss'?state.boss:state.enemies.reduce((a,e)=>!a||Math.hypot(e.x-state.x,e.y-state.y)<Math.hypot(a.x-state.x,a.y-state.y)?e:a,null);
 const angle=target?Math.atan2(target.y-state.y,target.x-state.x):-Math.PI/2;
 for(const direction of fanShotAngles(angle))state.shots.push({kind:'bola',x:state.x,y:state.y-8,vx:Math.cos(direction)*650,vy:Math.sin(direction)*650,life:1.8});state.shotAt=SHOT_INTERVAL;beep(480,.025);
}
function special(){
 if(!state||!['corridor','boss','interlude'].includes(phase)||state.cooldown>0)return;
 state.cooldown=12;state.stun=3;state.hazards=[];
 state.enemies.forEach(e=>{if(e.hp>0&&Math.hypot(e.x-state.x,e.y-state.y)<300){e.hp=0;state.score+=100;gainXP(e.type==='carimbado'?35:40);}});
 if(phase==='boss'&&Math.hypot(state.boss.x-state.x,state.boss.y-state.y)<350&&!state.boss.shield){state.boss.hp=Math.max(0,state.boss.hp-3);state.boss.flash=.2;}
 state.particles.push({x:state.x,y:state.y,life:.6,r:15});toast('RAÇA! Obstáculos limpos. Adversários atordoados por 3s.');beep(160,.3);
 if(phase==='boss'&&state.boss.hp<=0)winBoss();updateHud();
}
function hurt(amount,text){if(state.inv>0||!['corridor','boss','interlude'].includes(phase))return;state.patience=Math.max(0,state.patience-amount);state.lastDamageAt=state.time;state.inv=1.4;beep(110,.12);toast(text+' −'+amount+' de sanidade.');if(state.patience<=0)lose();}
function fireHazard(x,y,angle,speed,text,damage=7){state.hazards.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,text,damage,life:8});}
function movePlayer(dt){
 const dx=Number(!!(keys.d||keys.arrowright))-Number(!!(keys.a||keys.arrowleft)),dy=Number(!!(keys.s||keys.arrowdown))-Number(!!(keys.w||keys.arrowup)),len=Math.hypot(dx,dy)||1,speed=state.slow>0?180:305;
 const response=1-Math.exp(-dt/((dx||dy)?0.045:0.032));state.prevX=state.x;state.prevY=state.y;
 state.vx=(state.vx||0)+(dx/len*speed-(state.vx||0))*response;state.vy=(state.vy||0)+(dy/len*speed-(state.vy||0))*response;
 const hit=(x,y)=>phase==='corridor'?stations().some(d=>x>d.x-15&&x<d.x+d.w+15&&y>d.y-12&&y<d.y+d.h+20):phase==='finale'&&x>455&&x<665&&y>180&&y<285;
 const steps=Math.max(1,Math.ceil(Math.hypot(state.vx,state.vy)*dt/5));
 for(let i=0;i<steps;i++){const nx=Math.max(35,Math.min(1085,state.x+state.vx*dt/steps)),ny=Math.max(95,Math.min(550,state.y+state.vy*dt/steps));if(!hit(nx,state.y))state.x=nx;else state.vx=0;if(!hit(state.x,ny))state.y=ny;else state.vy=0;}
 state.walkCycle=(state.walkCycle||0)+Math.hypot(state.vx,state.vy)*dt*.075;
 const cameraTarget=Math.max(0,Math.min(560,state.x-280));state.cameraX=(state.cameraX??cameraTarget)+(cameraTarget-(state.cameraX??cameraTarget))*(1-Math.exp(-dt*12));
}
function updateEnemies(dt){
 for(const e of state.enemies){if(e.hp<=0)continue;e.clock+=dt;if(state.stun>0)continue;const t=types[e.type],angle=Math.atan2(state.y-e.y,state.x-e.x);
  if(e.type==='contrato'){e.x+=Math.cos(angle+.8*Math.sin(e.clock*2))*t.speed*dt;e.y+=Math.sin(angle+.8*Math.sin(e.clock*2))*t.speed*dt;}
  else if(e.type==='carimbado'){e.x+=Math.cos(angle)*t.speed*dt;e.y+=Math.sin(angle)*t.speed*dt;e.fireAt-=dt;if(e.fireAt<=0){fireHazard(e.x,e.y,angle,165,'PASSA PANO',6);e.fireAt=2;}}
  else if(e.type==='bagre'){e.x+=Math.cos(e.clock*1.6)*t.speed*dt;e.y+=Math.sin(e.clock*1.1)*t.speed*dt;e.fireAt-=dt;if(e.fireAt<=0){fireHazard(e.x,e.y,angle,165,'BOLA',5);e.fireAt=1.65;}}
  else{const speed=e.type==='empresario'?(e.clock%2.4<.65?265:45):t.speed;e.x+=Math.cos(angle)*speed*dt;e.y+=Math.sin(angle)*speed*dt;}
  e.x=Math.max(35,Math.min(1085,e.x));e.y=Math.max(95,Math.min(550,e.y));
  if(Math.hypot(e.x-state.x,e.y-state.y)<29&&state.inv<=0){if(e.type==='contrato')state.slow=2.5;hurt(t.damage,e.type==='contrato'?'CONTRATO ENROLADO. Movimento lento!':t.name+' ATRAPALHOU A COBRANÇA.');const push=Math.atan2(e.y-state.y,e.x-state.x);e.x+=Math.cos(push)*80;e.y+=Math.sin(push)*80;}
 }
 state.enemies=state.enemies.filter(e=>e.hp>0);
}
function updateBoss(dt){
 const b=state.boss,cfg=levels[state.level];b.clock+=dt;b.flash=Math.max(0,b.flash-dt);b.x=560+Math.sin(b.clock*(.6+state.level*.12))*(160+state.level*35);b.shield=state.level>0&&b.clock%7>5.3;
 if(state.stun>0)return;
 b.fireAt-=dt;if(b.fireAt<=0){const a=Math.atan2(state.y-b.y,state.x-b.x),spread=state.level===0?[0]:state.level===1?[-.17,.17]:[-.26,0,.26];for(const delta of spread)fireHazard(b.x,b.y+20,a+delta,165+state.level*18,cfg.attack,6+state.level);b.fireAt=.95-state.level*.1;}
 b.spawnAt-=dt;if(b.spawnAt<=0){spawnEnemy(['boleto','contrato','empresario','bagre'][state.level],80,370);spawnEnemy(['contrato','bagre','boleto','empresario'][state.level],1040,370);b.spawnAt=3.5;}
 if(Math.hypot(state.x-b.x,state.y-b.y)<55)hurt(10,'CHEGOU PERTO DEMAIS DA MESA.');
}
function updateShots(dt){
 for(const p of state.shots){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
  if(phase==='boss'&&Math.hypot(p.x-state.boss.x,p.y-state.boss.y)<44){p.life=0;if(!state.boss.shield){state.boss.hp=Math.max(0,state.boss.hp-1);state.boss.flash=.12;state.score+=20;}}
  else for(const e of state.enemies){if(e.hp>0&&Math.hypot(p.x-e.x,p.y-e.y)<24){p.life=0;e.hp--;if(e.hp<=0){state.score+=100;gainXP(e.type==='carimbado'?35:40);state.particles.push({x:e.x,y:e.y,life:.35,r:8});}break;}}
 }
 state.shots=state.shots.filter(p=>p.life>0);
 for(const p of state.hazards){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(Math.hypot(p.x-state.x,p.y-state.y)<23){p.life=0;hurt(p.damage,p.text==='BOLA'?'CHUTE DO BAGRE.':'RESPOSTA: '+p.text+'.');}}
 state.hazards=state.hazards.filter(p=>p.life>0&&p.x>-30&&p.x<1150&&p.y>30&&p.y<640);
}
function step(dt){
 if(state&&phase==='dismissal'){state.cinematic.time+=dt;if(!state.cinematic.stamped&&state.cinematic.time>=2.5){state.cinematic.stamped=true;beep(130,.28);}if(state.cinematic.time>=7.5)victory();return;}
 if(state&&phase==='finale'){movePlayer(dt);return;}
 if(!state||!['corridor','boss','interlude'].includes(phase))return;
 state.time+=dt;state.patience=Math.max(0,state.patience-dt*.16);
 if(state.fanLevel>=2&&state.patience>0&&state.time-state.lastDamageAt>=5)state.patience=Math.min(100,state.patience+dt*.75);
 for(const k of ['cooldown','shotAt','inv','slow','stun'])state[k]=Math.max(0,state[k]-dt);
 movePlayer(dt);if(keys.e||keys.j||keys.cobrar)shoot();
 updateEnemies(dt);if(!['corridor','boss','interlude'].includes(phase))return;
 if(phase==='boss')updateBoss(dt);else if(phase==='corridor'){state.spawnAt+=dt;if(state.spawnAt>=2.2&&state.enemies.length<14+state.level*2){spawnReinforcements(Math.min(2,14+state.level*2-state.enemies.length));state.spawnAt=0;}}
 updateShots(dt);if(!['corridor','boss','interlude'].includes(phase))return;
 state.enemies=state.enemies.filter(e=>e.hp>0);state.particles.forEach(p=>{p.life-=dt;p.r+=dt*350;});state.particles=state.particles.filter(p=>p.life>0);
 if(state.patience<=0)lose();else if(phase==='boss'&&state.boss.hp<=0)winBoss();else if(phase==='interlude'){
  state.interlude.nextWaveAt-=dt;
  if(state.interlude.wave<state.interlude.total&&(state.enemies.length<=2||state.interlude.nextWaveAt<=0))spawnOrganizadaWave();
  else if(state.enemies.length===0&&state.interlude.wave===state.interlude.total)winInterlude();
 }
}
function winBoss(){
 const index=state.level;state.defeated[index]=true;state.score+=1000;gainXP(500);phase='transition';keys={};$('#boss-panel').classList.add('hidden');beep(900,.3);updateHud();
 if(index===3){beginFinale();return;}
 modal(levels[index].boss+': cobrança vencida.','<b>'+levels[index].cleared+'</b><br><br>Mas o caminho foi bloqueado pela torcida fictícia <b>Carimbados</b>. Vença as ondas para chegar ao próximo chefe.<br><br>Próximo chefe: <b>'+levels[index+1].boss+'</b>. Sua sanidade continua com o valor atual.',[['ENFRENTAR OS CARIMBADOS',beginInterlude]],'CHEFE '+(index+1)+' / 4 · PASSAGEM BLOQUEADA');
}
function beginInterlude(){
 state.interlude={wave:0,total:3,nextWaveAt:4.5};placePlayer(560,450);state.enemies=[];state.shots=[];state.hazards=[];state.particles=[];state.boss=null;state.inv=2;state.cooldown=0;state.slow=0;state.stun=0;state.shotAt=0;keys={};
 state.checkpointScore=state.score;state.checkpointTime=state.time;state.checkpointXP=state.xp;phase='interlude';spawnOrganizadaWave();updateHud();draw();$('#world').focus();
}
function spawnOrganizadaWave(){
 state.interlude.wave++;state.interlude.nextWaveAt=4.5;state.inv=Math.max(state.inv,1);const count=5+state.level*2;
 for(let i=0;i<count;i++){const side=i%2===0;spawnEnemy('carimbado',side?90:1030,100+(Math.floor(i/2)*95)%410);}
 toast('CARIMBADOS · ONDA '+state.interlude.wave+' / '+state.interlude.total+'. Abra caminho com as bolas de futebol!');
}
function winInterlude(){
 phase='transition';keys={};state.score+=500;gainXP(150);state.hazards=[];
 modal('Caminho livre.','Os Carimbados saíram da passagem.<br><br>Próxima parada: <b>'+levels[state.level+1].boss+'</b>.<br>Sua sanidade continua com o valor atual.',[['ENTRAR NA PRÓXIMA FASE',()=>{loadLevel(state.level+1);$('#world').focus();}]],'INTERVALO VENCIDO · TORCIDA FICTÍCIA');
}
function beginFinale(){
 phase='finale';keys={};state.enemies=[];state.shots=[];state.hazards=[];state.particles=[];state.boss=null;state.interlude=null;state.cinematic=null;state.slow=0;placePlayer(560,485);
 $('#boss-panel').classList.add('hidden');toast('Otávio aprovou. Vá até a mesa e aperte E para assinar a demissão.');updateHud();draw();$('#world').focus();
}
function beginDismissal(){
 if(phase!=='finale'||!state.defeated.every(Boolean))return;
 phase='dismissal';keys={};placePlayer(560,350);state.cinematic={time:0,stamped:false};$('#toast').style.display='none';$('#prompt').style.display='none';updateHud();draw();
}
function drawFinale(){
 const t=phase==='dismissal'?state.cinematic.time:-1;
 let viewX=state.cameraX??280;if(t>=0){viewX=t>3.4&&t<5.2?Math.min(560,280+(t-3.4)*155):280;}
 canvas.style.transform=window.innerWidth<=720?`translateX(${-viewX/1120*100}%)`:'';
 rect(0,0,1120,600,'#17231b');for(let y=60;y<590;y+=40)for(let x=24;x<1100;x+=40)rect(x,y,38,38,'#2a3829');
 rect(0,0,1120,60,'#101b14');label('CONSELHO / A ÚLTIMA ASSINATURA',560,35,'#c4f367',17);
 rect(1000,185,85,170,'#131c16');label('SAÍDA',1042,170,'#c4cdb6',13);
 rect(425,195,270,80,'#788060');rect(425,267,270,18,'#46533a');rect(448,280,18,45,'#35412e');rect(654,280,18,45,'#35412e');
 rect(503,205,112,49,'#e3e5d4');label('DESLIGAMENTO',559,221,'#38462d',10);rect(515,230,85,2,'#a8ae98');
 const exitProgress=t>3.4?Math.min(1,(t-3.4)/1.7):0;
 if(exitProgress<1){person(ctx,825+exitProgress*240,230+exitProgress*50,0,1.8,exitProgress?Math.sin(t*20)*2:0);rect(845+exitProgress*240,250+exitProgress*50,20,15,'#9e724f');if(t<3.4)label('DIRETOR DE FUTEBOL',825,175,'#d9cdb2',12);}
 const px=state.prevX+(state.x-state.prevX)*renderAlpha,py=state.prevY+(state.y-state.prevY)*renderAlpha;
 person(ctx,px,py,4,1.8,phase==='finale'?Math.sin(state.walkCycle)*2:0);label((profile?.nickname||'TORCEDOR').toUpperCase(),px,py+63,'#e1ebce',12);
 $('#prompt').style.display='none';
 if(t<0){label('TODAS AS APROVAÇÕES CONQUISTADAS',560,115,'#d3dfc4',16);label('A vitória ainda precisa da sua assinatura.',560,145,'#9dad90',13);
  const close=Math.hypot(state.x-560,state.y-260)<135;
  $('#prompt').style.display='block';$('#prompt').textContent=close?'[E] ASSINAR A DEMISSÃO':'CAMINHE ATÉ A MESA PARA ASSINAR';
  if(close){ctx.strokeStyle='#c4f367';ctx.lineWidth=2;ctx.strokeRect(420,190,280,100);}
 }else{
  label(t<1.2?'PREPARANDO O TERMO...':t<2.5?'ASSINANDO...':t<3.4?'DEMISSÃO FORMALIZADA':t<5.3?'ENCERRANDO O EXPEDIENTE...':'A MASSA FEZ A DECISÃO ANDAR.',560,110,'#c4f367',17);
  if(t>1.2){const progress=Math.min(1,(t-1.2)/1);ctx.strokeStyle='#30462b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(520,245);for(let i=0;i<=Math.floor(progress*35);i++)ctx.lineTo(520+i*2,245+Math.sin(i*1.3)*4);ctx.stroke();}
  if(t>=2.5){const drop=Math.min(1,(t-2.5)/.3);ctx.save();ctx.translate(560,240-(1-drop)*180);ctx.rotate(-.11);ctx.strokeStyle='#ce5142';ctx.lineWidth=4;ctx.strokeRect(-108,-27,216,54);ctx.fillStyle='#ce5142';ctx.font='bold 31px monospace';ctx.textAlign='center';ctx.fillText('DEMITIDO',0,10);ctx.restore();}
  if(t>=5.3){rect(245,175,630,250,'#e5e7d7');label('NOTA OFICIAL · FICÇÃO',560,215,'#3a4b31',14);label('CLUBE DA ARQUIBANCADA',560,258,'#24371f',25);label('O clube comunica o desligamento',560,304,'#344b2c',17);label('de Nestor Carimbo, personagem fictício.',560,334,'#344b2c',17);label('Obrigado pelos serviços prestados.',560,386,'#617153',13);
   for(let i=0;i<40;i++){const x=70+(i*127)%980,y=65+((t-5.3)*100+i*37)%490;rect(x,y,5,10,i%2?'#c4f367':'#e9eddc');}
  }
 }
 const m=$('#minimap').getContext('2d');m.fillStyle='#102016';m.fillRect(0,0,140,75);m.fillStyle='#c4f367';m.fillRect(53,24,34,11);m.fillStyle='#fff';m.fillRect(state.x/8-2,state.y/8-2,4,4);
}
function victory(){
 phase='end';const score=Math.max(0,Math.round(state.score+state.patience*30-state.time*5));best=Math.max(best,score);try{localStorage.setItem('bracks-fan-best',best)}catch{}
 const result=Object.freeze({score,seconds:Math.floor(state.time)});state.lastResult=result;
 modal('A torcida venceu.','<b>NESTOR CARIMBO DEMITIDO. NO JOGO.</b><br><br>Quatro chefes vencidos em '+result.seconds+' segundos. A última assinatura saiu!<br>Pontuação: <b>'+score.toLocaleString('pt-BR')+'</b> · Recorde: '+best.toLocaleString('pt-BR'),[['JOGAR DE NOVO',()=>start()],['VOLTAR À ARQUIBANCADA',menu]],'CARIMBO FINAL · DEFERIDO');
 appendVictoryShare(result);
}
const PUBLIC_GAME_URL='https://www.galodopovo.com.br/jogos/demita-o-diretor/';
function victoryShareText(result){
 const minutes=Math.floor(result.seconds/60),seconds=result.seconds%60;
 return 'Demiti Nestor Carimbo no jogo Demita o Diretor! ⚽\nVenci os 4 chefes com '+result.score.toLocaleString('pt-BR')+' pontos em '+minutes+'min '+String(seconds).padStart(2,'0')+'s.\nSua vez de vencer a burocracia!\n#DiretorDemitidoNoJogo';
}
function victoryShareUrl(result){return 'https://x.com/intent/tweet?'+new URLSearchParams({text:victoryShareText(result),url:PUBLIC_GAME_URL}).toString();}
function createVictoryImage(result){
 const previousPhase=phase,previousCinematic=state.cinematic,previousPosition={x:state.x,y:state.y,prevX:state.prevX,prevY:state.prevY};
 try{phase='dismissal';state.cinematic={time:6.6,stamped:true};state.x=100;state.y=350;state.prevX=100;state.prevY=350;drawFinale();}finally{phase=previousPhase;state.cinematic=previousCinematic;Object.assign(state,previousPosition);}
 const picture=document.createElement('canvas');picture.width=1200;picture.height=675;const c=picture.getContext('2d');c.drawImage(canvas,0,0,1200,643);
 c.fillStyle='#101a12';c.fillRect(0,0,1200,72);c.fillRect(0,588,1200,87);c.textAlign='left';c.font='bold 33px monospace';c.fillStyle='#c4f367';c.fillText('A TORCIDA VENCEU!',30,46);c.textAlign='right';c.font='bold 22px monospace';c.fillStyle='#f0f2e3';c.fillText('#DiretorDemitidoNoJogo',1170,44);
 c.textAlign='left';c.font='bold 25px monospace';c.fillStyle='#f0f2e3';c.fillText(result.score.toLocaleString('pt-BR')+' PONTOS · '+Math.floor(result.seconds/60)+'min '+String(result.seconds%60).padStart(2,'0')+'s',30,626);c.font='16px monospace';c.fillStyle='#aebfa2';c.fillText('RESULTADO DE JOGO · PERSONAGENS FICTÍCIOS',30,655);c.textAlign='right';c.fillStyle='#c4f367';c.font='bold 22px monospace';c.fillText('galodopovo.com.br',1170,641);
 const src=picture.toDataURL('image/png');let file=null;
 try{const bytes=Uint8Array.from(atob(src.split(',')[1]),char=>char.charCodeAt(0));file=new File([bytes],'diretor-demitido-'+result.score+'.png',{type:'image/png'});}catch{}
 return {src,file};
}
function appendVictoryShare(result){
 const section=document.createElement('section');section.className='result-share';section.setAttribute('aria-label','Compartilhar o resultado da partida');
 const heading=document.createElement('h3');heading.textContent='Leve a vitória para o X.';section.appendChild(heading);
 const description=document.createElement('p');description.textContent='Sugestão de publicação: revise o texto e publique na sua conta.';section.appendChild(description);
 let image=null;try{image=createVictoryImage(result);}catch{}
 if(image){const preview=document.createElement('img');preview.className='victory-share-image';preview.src=image.src;preview.alt='Comemoração da demissão no jogo, com pontuação, tempo e #DiretorDemitidoNoJogo';preview.width=1200;preview.height=675;section.appendChild(preview);}
 const field=document.createElement('textarea');field.readOnly=true;field.rows=5;field.value=victoryShareText(result)+'\n'+PUBLIC_GAME_URL;field.setAttribute('aria-label','Sugestão de publicação no X');section.appendChild(field);
 const status=document.createElement('p');status.className='share-status';status.setAttribute('role','status');
 const canCopyImage=!!(image?.file&&navigator.clipboard?.write&&typeof ClipboardItem!=='undefined');
 if(canCopyImage){const share=document.createElement('button');share.type='button';share.className='primary';share.dataset.shareAction='image-x';share.textContent='COPIAR IMAGEM E ABRIR O X';share.onclick=async()=>{share.disabled=true;try{await navigator.clipboard.write([new ClipboardItem({'image/png':image.file})]);status.textContent='Imagem copiada! Cole no X com Ctrl+V ou Colar.';share.dispatchEvent(new Event('game-x-open'));window.location.assign(victoryShareUrl(result));}catch{status.textContent='O navegador não permitiu copiar a imagem. Baixe o PNG, abra o X com o texto e anexe o arquivo.';}finally{share.disabled=false;}};section.appendChild(share);}
 if(image){const download=document.createElement('a');download.className='small share-download';download.textContent='BAIXAR IMAGEM DA VITÓRIA';download.href=image.src;download.download='diretor-demitido-'+result.score+'.png';section.appendChild(download);}
 const link=document.createElement('a');link.className=canCopyImage?'small':'primary';link.textContent='ABRIR X COM O TEXTO';link.href=victoryShareUrl(result);link.target='_blank';link.rel='noopener noreferrer';section.appendChild(link);
 if(image){const hint=document.createElement('p');hint.className='share-hint';hint.textContent=canCopyImage?'O primeiro botão copia a imagem e abre o X nesta aba com o texto pronto. No X, pressione Ctrl+V (ou Colar) para anexar a imagem e revise antes de publicar.':'Neste navegador, baixe a imagem e anexe o PNG ao texto sugerido no X.';section.appendChild(hint);}
 const copy=document.createElement('button');copy.type='button';copy.className='small';copy.dataset.shareAction='text_copy';copy.textContent='COPIAR TEXTO';section.appendChild(copy);
 section.appendChild(status);
 copy.onclick=async()=>{try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(field.value);status.textContent='Texto copiado. Cole no X ou onde preferir.';}catch{field.focus();field.select();status.textContent='Texto selecionado. Use a opção Copiar do seu aparelho ou Ctrl+C.';}};
 const content=$('#modal-content');content.insertBefore(section,content.querySelector('button'));
}
function lose(){
 if(phase==='end')return;const wasInterlude=phase==='interlude';phase='end';keys={};$('#boss-panel').classList.add('hidden');state.patience=0;updateHud();const checkpoint=state.level,score=state.checkpointScore,time=state.checkpointTime,xp=state.checkpointXP;
 modal('Prestigiado.','“Após 48 carimbos, o conselho fictício adiou a decisão.”<br><br>A sanidade acabou '+(wasInterlude?'no bloqueio dos <b>Carimbados</b>':'na fase de <b>'+levels[checkpoint].boss+'</b>')+'. A cobrança ficou para a próxima reunião.<br><br>Repita este confronto com sanidade cheia e o XP do início dele.',[['TENTAR ESTE CONFRONTO DE NOVO',()=>{state.patience=100;state.score=score;state.time=time;state.xp=xp;state.fanLevel=fanLevelForXP(xp);state.lastDamageAt=time;state.upgradeUntil=0;if(wasInterlude)beginInterlude();else loadLevel(checkpoint);$('#world').focus();}],['VOLTAR À ARQUIBANCADA',menu]],'NOTA OFICIAL FICTÍCIA · FINAL RUIM');
}
function updateHud(){
 if(!state)return;const cfg=levels[state.level];$('#stage-label').textContent=`${profile?.nickname||'TORCEDOR'} · FASE ${state.level+1} / 4 · ${cfg.area}`;
 updateXPHud();
 $('#objective').textContent=phase==='boss'?'Enfrente '+cfg.boss+': segure E / J para lançar bolas de futebol.':phase==='interlude'?'Os Carimbados bloquearam a passagem. Vença todas as ondas.':'Reúna as três pautas e procure '+cfg.boss+'.';
 if(phase==='interlude')$('#stage-label').textContent=`INTERVALO ${state.level+1} / 3 · CARIMBADOS · TORCIDA FICTÍCIA`;
 $('#patience-value').textContent=Math.ceil(state.patience)+'%';$('#patience-bar').style.width=state.patience+'%';$('#patience-bar').style.background=state.patience<30?'var(--red)':'var(--lime)';
 $('#signs').textContent=phase==='interlude'?state.interlude.wave+'/'+state.interlude.total+' ondas':state.pautas.filter(Boolean).length+'/3';$('#money').textContent=state.score.toLocaleString('pt-BR');$('#timer').textContent=String(Math.floor(state.time/60)).padStart(2,'0')+':'+String(Math.floor(state.time%60)).padStart(2,'0');
 $('#special').textContent=state.cooldown>0?'RAÇA · '+Math.ceil(state.cooldown)+'s':'RAÇA';$('#special').disabled=state.cooldown>0||!['corridor','boss','interlude'].includes(phase);
 $('#campaign-route').classList.remove('hidden');$('#checklist').classList.remove('hidden');const route=levels.map((l,i)=>`<span class="${state.defeated[i]?'done':i===state.level?'current':''}">${state.defeated[i]?'✓':i+1} ${l.boss}</span>`).join('');if($('#campaign-route').innerHTML!==route)$('#campaign-route').innerHTML=route;
 const checklist=cfg.pautas.map((p,i)=>`<span class="${state.pautas[i]?'checked':''}">${state.pautas[i]?'✓':'□'} ${p}</span>`).join('');if($('#checklist').innerHTML!==checklist)$('#checklist').innerHTML=checklist;
 if(phase==='interlude')$('#checklist').textContent='Onda '+state.interlude.wave+' de '+state.interlude.total+' · '+state.enemies.filter(e=>e.hp>0).length+' adversários restantes · Segure E / J para lançar bolas de futebol.';
 $('#interact').disabled=phase==='dismissal';$('#interact').textContent=phase==='finale'?'ASSINAR / E':'CHUTAR / PEGAR';
 if(phase==='finale'||phase==='dismissal'){$('#stage-label').textContent='EPÍLOGO · A ÚLTIMA ASSINATURA';$('#objective').textContent=phase==='finale'?'Caminhe até a mesa e aperte E para demitir o diretor.':'Demissão em andamento...';$('#checklist').textContent='Nestor Carimbo, Célio Parecer, Bento Protocolo e Otávio Martelo: todas as etapas concluídas.';$('#signs').textContent='OK';}
}
function drawBall(p){
 ctx.save();ctx.strokeStyle='#c4f36766';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(p.x-p.vx*.035,p.y-p.vy*.035);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.translate(p.x,p.y);ctx.rotate(state.time*16);ctx.fillStyle='#f3f4df';ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1c2c22';ctx.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.lineTo(Math.cos(a)*3.5,Math.sin(a)*3.5);}ctx.closePath();ctx.fill();for(let i=0;i<3;i++){const a=i*Math.PI*2/3;ctx.fillRect(Math.cos(a)*6-1.5,Math.sin(a)*6-1.5,3,3);}ctx.restore();
}
function drawEnemy(e){
 const t=types[e.type];if(e.type==='carimbado'){person(ctx,e.x,e.y,6,1.2);rect(e.x-12,e.y-29,24,4,'#a9554d');rect(e.x-12,e.y-3,24,15,'#74413e');label('AM',e.x,e.y+10,'#f1e0ca',10);}
 else if(e.type==='bagre'){person(ctx,e.x,e.y,5,1.2);rect(e.x-10,e.y-5,22,15,'#a5845d');rect(e.x+12,e.y+17,9,9,'#e2e5da');}
 else if(e.type==='empresario'){person(ctx,e.x,e.y,0,1.2);rect(e.x+12,e.y+3,15,14,'#ab6e4d');}
 else{rect(e.x-14,e.y-21,28,38,t.color);rect(e.x-9,e.y-14,18,4,'#9f584b');if(e.type==='boleto')for(let i=0;i<5;i++)rect(e.x-10+i*4,e.y+5,2,8,'#303a2a');else{rect(e.x-9,e.y-4,18,2,'#6b768b');rect(e.x-9,e.y+2,14,2,'#6b768b');}}
 label(t.name,e.x,e.y-32,state.stun>0?'#c4f367':t.color,10);if(e.hp>1)label('■■',e.x,e.y+36,t.color,9);
}
function draw(){
 if(state&&(phase==='finale'||phase==='dismissal')){drawFinale();return;}
 if(!state)return;const cfg=levels[state.level];rect(0,0,1120,600,'#131d16');for(let y=60;y<580;y+=40)for(let x=24;x<1100;x+=40)rect(x,y,38,38,cfg.color);
 drawRoomDecor();
 canvas.style.transform=window.innerWidth<=720?`translateX(${-(state.cameraX||0)/1120*100}%)`:'';
 const mini=$('#minimap').getContext('2d');mini.fillStyle='#101b12';mini.fillRect(0,0,140,75);
 if(phase==='corridor')stations().forEach(d=>{mini.fillStyle=d.kind==='gate'?'#ef9982':d.kind==='pauta'&&state.pautas[d.n]?'#69795c':'#c4f367';mini.fillRect(d.x/8,d.y/8,d.w/8,d.h/8);});
 else if(phase==='interlude'){state.enemies.forEach(e=>{mini.fillStyle='#ef9982';mini.fillRect(e.x/8-2,e.y/8-2,4,4);});}
 else if(state.boss){mini.fillStyle='#ef9982';mini.fillRect(state.boss.x/8-3,state.boss.y/8-3,6,6);}
 mini.fillStyle='#fff';mini.fillRect(state.x/8-2,state.y/8-2,4,4);
 rect(0,0,1120,58,'#141e17');label(cfg.area+' / '+(phase==='boss'?'SALA DO CHEFE':phase==='interlude'?'PASSAGEM BLOQUEADA':'CORREDOR DA BUROCRACIA'),560,34,'#bcccac',14);
 if(phase==='interlude'){label('CARIMBADOS',560,105,'#e8b5a7',26);label('TORCIDA FICTÍCIA · ONDA '+state.interlude.wave+' / '+state.interlude.total,560,132,'#c4d7ba',13);label('ABRA CAMINHO COM AS BOLAS',560,560,'#c4f367',13);}
 else if(phase==='boss'&&state.boss){const b=state.boss;rect(b.x-72,b.y+20,145,34,'#667052');person(ctx,b.x,b.y,state.level,2.2);if(b.flash>0)rect(b.x-20,b.y-50,40,3,'#c4f367');
  label(cfg.boss.toUpperCase(),560,82,'#f0e9cf',18);rect(300,94,520,12,'#492f2c');rect(300,94,520*b.hp/b.max,12,b.shield?'#8faaa2':'#ec795f');
  label(b.shield?'EM REUNIÃO · ESCUDO TEMPORÁRIO':'RESISTÊNCIA À COBRANÇA: '+b.hp+' / '+b.max,560,125,b.shield?'#a6cfc1':'#e8b7a3',11);
  drawBossDialogue(b);
 }else{
  stations().forEach(d=>{const done=d.kind==='pauta'?state.pautas[d.n]:d.kind==='coffee'?state.coffee:false;rect(d.x-4,d.y-4,d.w+8,d.h+8,near()===d?'#c4f367':'#152017');rect(d.x,d.y,d.w,d.h,d.kind==='gate'?'#74503c':'#626e52');rect(d.x,d.y+d.h-12,d.w,12,'#394732');
   if(d.kind==='gate')person(ctx,d.x+75,d.y+10,state.level,1.3);else{rect(d.x+22,d.y+13,35,24,'#d6d9c3');rect(d.x+27,d.y+19,25,3,done?'#679d4b':'#919a80');}
   drawRoomStation(d);label(d.name.toUpperCase(),d.x+d.w/2,d.y-17,d.kind==='gate'?'#eeb18e':'#d3dec5',10);if(done)label('✓ REUNIDA',d.x+d.w/2,d.y+d.h+23,'#c4f367',11);
  });
 }
 state.enemies.filter(e=>e.hp>0).forEach(drawEnemy);
 state.shots.forEach(p=>drawBall(p));
 state.hazards.forEach(p=>{if(p.text==='BOLA'){ctx.fillStyle='#e6e6d2';ctx.beginPath();ctx.arc(p.x,p.y,7,0,Math.PI*2);ctx.fill();}else{rect(p.x-26,p.y-11,52,22,'#a75a48');label(p.text,p.x,p.y+4,'#fff0d0',9);}});
 state.particles.forEach(p=>{ctx.strokeStyle='#c4f367';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.stroke();});
 const px=state.prevX+(state.x-state.prevX)*renderAlpha,py=state.prevY+(state.y-state.prevY)*renderAlpha;
 if(!(state.inv>0&&Math.floor(state.time*12)%2))person(ctx,px,py,4,1.55,Math.hypot(state.vx,state.vy)>10?Math.sin(state.walkCycle)*2:0);label((profile?.nickname||'TORCEDOR').toUpperCase(),px,py+52,'#d2e2b9',10);
 if(state.slow>0)label('PRESO NO CONTRATO',state.x,state.y-50,'#b7c8e1',10);
 $('#prompt').style.display='none';if(phase==='corridor'){const d=near();if(d){$('#prompt').style.display='block';$('#prompt').textContent='[E] '+(d.kind==='pauta'?'Reunir pauta':d.kind==='coffee'?'Tomar café':'Cobrar '+cfg.boss);}}
}
function pause(){if(!['corridor','boss','interlude','finale','dismissal'].includes(phase))return;pausedFrom=phase;phase='paused';modal('Cobrança suspensa.','A burocracia pode esperar. A sanidade também.',[['VOLTAR À COBRANÇA',()=>{phase=pausedFrom;$('#world').focus();}],['VOLTAR À ARQUIBANCADA',menu]]);}
$('#pause').onclick=pause;$('#how').onclick=instructions;$('#start').onclick=()=>start();$('#special').onclick=special;
$('#sound').onclick=()=>{sound=!sound;$('#sound').textContent='SOM: '+(sound?'ON':'OFF');$('#sound').setAttribute('aria-label',sound?'Desativar som':'Ativar som');beep();};
$('#settings').onclick=()=>modal('Configurações','<label><input type="checkbox" id="skip"> Pular burocracia</label><br><br>Qualidade da gestão: indefinida.',[['SALVAR PREFERÊNCIAS',()=>{if($('#skip').checked)modal('Solicitação enviada.','Prazo de análise: <b>15 dias úteis.</b><br>O torcedor continua aguardando.',[['AGUARDAR SENTADO',()=>{}]]);}]]);
$('#modal').addEventListener('cancel',e=>{e.preventDefault();if(phase==='paused'){phase=pausedFrom;$('#modal').close();}else if(phase==='menu'||phase==='profile')$('#modal').close();});
window.addEventListener('keydown',e=>{
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)&&phase!=='menu'&&phase!=='profile')e.preventDefault();if($('#modal').open)return;
 if(phase==='profile')return;keys[e.key.toLowerCase()]=true;if(e.repeat)return;if(e.key==='Enter'&&phase==='menu')start();if(e.key.toLowerCase()==='e'){interact();shoot();}if(e.key.toLowerCase()==='j')shoot();if(e.key===' ')special();if(e.key==='Escape')pause();
});window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);window.addEventListener('blur',()=>{keys={};pause();});
$$('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[b.dataset.key.toLowerCase()]=true;};b.onpointerup=b.onpointercancel=()=>keys[b.dataset.key.toLowerCase()]=false;});
$('#interact').onpointerdown=e=>{e.preventDefault();$('#interact').setPointerCapture(e.pointerId);keys.cobrar=true;interact();shoot();};$('#interact').onpointerup=$('#interact').onpointercancel=()=>keys.cobrar=false;
function decorateMenu(){
 const card=$('#characters');card.replaceChildren();levels.forEach((l,i)=>{const b=document.createElement('div');b.className='character boss-card';b.innerHTML=`<span class="boss-order">CHEFE ${i+1}</span><span class="portrait"><canvas width="64" height="80" aria-hidden="true"></canvas></span><strong>${l.boss}</strong><small>${['O futebol','O processo','A autorização','A decisão final'][i]}</small>`;card.appendChild(b);person(b.querySelector('canvas').getContext('2d'),32,42,i,1.5);});
 const c=$('#preview').getContext('2d');c.fillStyle='#20242c';c.fillRect(0,0,640,510);for(let y=0;y<510;y+=42){c.fillStyle='#353b46';c.fillRect(0,y,640,2);}c.fillStyle='#11151b';c.fillRect(80,70,480,110);c.fillStyle='#e8e8e1';c.font='bold 30px monospace';c.fillText('A VOZ DA MASSA',160,130);person(c,310,265,4,5);c.fillStyle='#59616e';c.fillRect(55,290,140,30);c.fillRect(435,290,140,30);
}
decorateMenu();
function advanceFrame(elapsed){
 const active=state&&['corridor','boss','interlude','finale','dismissal'].includes(phase);
 if(active){accumulator+=Math.max(0,Math.min(elapsed,.1));let steps=0;while(accumulator+1e-9>=FIXED_STEP&&steps<12){step(FIXED_STEP);accumulator=Math.max(0,accumulator-FIXED_STEP);steps++;}}else accumulator=0;
 renderAlpha=accumulator/FIXED_STEP;if(active){hudElapsed+=Math.max(0,elapsed);if(hudElapsed>=.1){updateHud();hudElapsed=0;}}else hudElapsed=0;
}
function tick(now){const dt=last?Math.max(0,(now-last)/1000):0;last=now;advanceFrame(dt);if(state&&['corridor','boss','interlude','finale','dismissal'].includes(phase))draw();if(now>toastUntil)$('#toast').style.display='none';requestAnimationFrame(tick);}requestAnimationFrame(tick);
