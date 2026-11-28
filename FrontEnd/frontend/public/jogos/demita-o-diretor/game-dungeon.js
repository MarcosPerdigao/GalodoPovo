'use strict';
// Salas de combate vistas de cima; o mapa de deslocamento entre locais virá depois.
levels[0].color='#272b32';levels[1].color='#292b31';levels[2].color='#302d29';levels[3].color='#252a30';
const oldLabel=label;label=function(s,x,y,color,size=12){oldLabel(s,x,y,color,Math.max(13,size));};
const oldRect=rect;rect=function(x,y,w,h,color){const palette={'#131d16':'#12151a','#141e17':'#101318','#17231b':'#12151a','#2a3829':'#292d34','#28392b':'#272b32','#29353c':'#292b31','#3a342b':'#302d29','#362b36':'#252a30','#c4f367':'#f2c230','#152017':'#0f1115','#626e52':'#555b67','#394732':'#30343c'};oldRect(x,y,w,h,palette[color]||color);};
const oldPerson=person;person=function(c,x,y,id=4,scale=1,walk=0){
 if(id!==4){oldPerson(c,x,y,id,scale,walk);return;}
 c.save();c.translate(x,y);c.scale(scale,scale);const r=(a,b,w,h,col)=>{c.fillStyle=col;c.fillRect(a,b,w,h);},skin=avatar.skin,shirt=avatar.shirt==='preta'?'#171a20':'#f1f1ea';
 r(-16,28,32,4,'#0007');r(-11,19,8,11+walk,'#11141a');r(4,19,8,11-walk,'#11141a');r(-14,-6,28,27,shirt);if(avatar.shirt==='listrada'){for(let i=0;i<4;i++)r(-12+i*7,-6,3,27,'#252932');}r(-19,-4,5,17,skin);r(14,-4,5,17,skin);r(-8,-26,17,19,skin);
 const hair=avatar.hairColor;if(avatar.hairStyle!=='careca'){r(-9,-28,19,6,hair);if(avatar.hairStyle==='crespo'){r(-11,-30,23,7,hair);r(-8,-33,17,5,hair);}if(avatar.hairStyle==='longo'){r(-11,-25,4,22,hair);r(9,-25,4,22,hair);}}
 r(-4,-18,2,2,'#171a20');r(4,-18,2,2,'#171a20');r(-1,-12,4,1,'#784f37');
 if(avatar.accessory==='bone'){r(-10,-28,23,4,'#eee');r(-9,-32,17,5,'#242830');r(9,-28,9,3,'#eee');}if(avatar.accessory==='faixa')r(-9,-24,19,4,'#eee');if(avatar.accessory==='cachecol'){r(-15,-7,30,5,'#ddd');r(10,-3,5,17,'#ddd');r(10,4,5,3,'#343943');}
 // Faixas sólidas dão contraste ao texto mesmo na camisa listrada.
 r(-12,-3,24,7,avatar.shirt==='preta'?'#171a20':'#eee');r(-8,4,16,15,avatar.shirt==='preta'?'#171a20':'#eee');c.fillStyle=avatar.shirt==='preta'?'#fff':'#111';c.textAlign='center';const idol=String(avatar.idol||profile?.idol||'CDA').toUpperCase().slice(0,12);c.font='bold '+Math.min(4,23/(idol.length*.62))+'px monospace';c.fillText(idol,0,2);c.font='bold 12px monospace';c.fillText(String(avatar.number||12),0,16);c.restore();
};
const originalStart=start;start=function(level=0){originalStart(level);if(state&&phase==='corridor'){state.dodgeCooldown=0;state.dodgeTime=0;state.attackCues=[];$('#settings').disabled=false;}};$('#start').onclick=()=>start();
const originalLoad=loadLevel;loadLevel=function(level){originalLoad(level);state.dodgeCooldown=0;state.dodgeTime=0;state.attackCues=[];$('#settings').disabled=false;};
function dodge(){if(!state||!['corridor','boss','interlude'].includes(phase)||state.dodgeCooldown>0)return;state.dodgeTime=.17;state.dodgeCooldown=1.5;state.inv=Math.max(state.inv,.24);beep(210,.04);}
const originalMove=movePlayer;movePlayer=function(dt){if(state.dodgeTime>0){const dx=Number(!!(keys.d||keys.arrowright))-Number(!!(keys.a||keys.arrowleft)),dy=Number(!!(keys.s||keys.arrowdown))-Number(!!(keys.w||keys.arrowup));const length=Math.hypot(dx,dy)||1;state.vx=(dx||(!dy?1:0))*650/length;state.vy=dy*650/length;}originalMove(dt);state.dodgeTime=Math.max(0,(state.dodgeTime||0)-dt);state.dodgeCooldown=Math.max(0,(state.dodgeCooldown||0)-dt);};
window.addEventListener('keydown',e=>{if(e.key==='Shift'&&!$('#modal').open){e.preventDefault();dodge();}});$('#dodge').onclick=dodge;
function cue(kind,b,angle){state.attackCues ||= [];state.attackCues.push({kind,x:b.x,y:b.y,angle,timer:kind==='stamp'?.85:.55,targetX:state.x,targetY:state.y});}
updateBoss=function(dt){
 const b=state.boss;b.clock+=dt;b.flash=Math.max(0,b.flash-dt);const idleX=560+Math.sin(b.clock*(.65+state.level*.1))*(170+state.level*35),idleY=155+Math.sin(b.clock*.85+state.level)*65;
 if(b.dash){b.dash.time+=dt;const t=Math.min(1,b.dash.time/.4);b.x=b.dash.x+(b.dash.targetX-b.dash.x)*t;b.y=b.dash.y+(b.dash.targetY-b.dash.y)*t;if(t>=1)b.dash=null;}else{b.x+=(idleX-b.x)*(1-Math.exp(-dt*4));b.y+=(idleY-b.y)*(1-Math.exp(-dt*4));}b.shield=state.level===1&&b.clock%8>6.6;
 updateBossDialogue(b);if(state.stun>0)return;b.fireAt-=dt;if(b.fireAt<=0){const a=Math.atan2(state.y-b.y,state.x-b.x),n=b.attackIndex||0,patterns=[['spread','ring','spread'],['stamp','sweep','stamp'],['dash','ring','spread'],['ring','stamp','sweep','dash']];cue(patterns[state.level][n%patterns[state.level].length],b,a);b.attackIndex=n+1;b.fireAt=b.hp<b.max*.5?1.1:1.65;}
 b.spawnAt-=dt;if(b.spawnAt<=0){spawnEnemy(['boleto','contrato','empresario','bagre'][state.level],80,370);spawnEnemy(['contrato','bagre','boleto','empresario'][state.level],1040,370);b.spawnAt=5;}
 if(Math.hypot(state.x-b.x,state.y-b.y)<52)hurt(9,'A MESA AVANÇOU SOBRE A COBRANÇA.');
};
const originalStep=step;step=function(dt){originalStep(dt);if(!state||phase!=='boss')return;state.attackCues ||= [];for(const c of state.attackCues){c.timer-=dt;if(c.timer>0)continue;if(c.kind==='stamp'){if(Math.hypot(state.x-c.targetX,state.y-c.targetY)<68)hurt(11,'CARIMBO NO CHÃO!');state.particles.push({x:c.targetX,y:c.targetY,life:.35,r:25});}else if(c.kind==='dash'){state.boss.dash={time:0,x:state.boss.x,y:state.boss.y,targetX:c.targetX,targetY:Math.max(120,Math.min(460,c.targetY))};for(let i=-1;i<=1;i++)fireHazard(c.x,c.y,c.angle+i*.16,200,'REUNIÃO',8);}else if(c.kind==='ring'){for(let i=0;i<12;i++)fireHazard(c.x,c.y,i*Math.PI/6+state.time*.2,140+state.level*10,'JUROS',7);}else{const count=c.kind==='sweep'?7:5;for(let i=0;i<count;i++)fireHazard(c.x,c.y,c.angle+(i-(count-1)/2)*.18,180,'COBRANÇA',7);}}state.attackCues=state.attackCues.filter(c=>c.timer>0);};
const originalDraw=draw;draw=function(){originalDraw();if(!state||!['corridor','boss','interlude'].includes(phase))return;
 // Colunas e bordas desenham a sala sem alterar o mapa de colisão existente.
 for(const [x,y] of [[28,76],[1068,76],[28,520],[1068,520]]){rect(x,y,24,40,'#11141a');rect(x+4,y,16,5,'#666d7b');}
 for(const c of state.attackCues||[]){ctx.save();ctx.strokeStyle='#ff856d';ctx.fillStyle='#e44e382d';ctx.lineWidth=3;if(c.kind==='stamp'){ctx.beginPath();ctx.arc(c.targetX,c.targetY,68,0,Math.PI*2);ctx.fill();ctx.stroke();label('CARIMBO',c.targetX,c.targetY-75,'#ffd1c5',17);}else{ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(c.x+Math.cos(c.angle)*240,c.y+Math.sin(c.angle)*240);ctx.stroke();label(c.kind==='ring'?'CERCO':c.kind==='dash'?'AVANÇO':'RAJADA',c.x,c.y-52,'#ffd1c5',17);}ctx.restore();}
 $('#dodge').textContent=state.dodgeCooldown>0?'ESQUIVA '+state.dodgeCooldown.toFixed(1)+'s':'ESQUIVAR · SHIFT';$('#dodge').disabled=state.dodgeCooldown>0;
};
const originalAdvance=advanceFrame;advanceFrame=function(dt){originalAdvance(dt);if(state&&['corridor','boss','interlude','finale','dismissal'].includes(phase))$('#settings').disabled=false;};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
$('#modal').addEventListener('cancel',()=>{if(phase==='audio-settings'){phase=pausedFrom;$('#modal').close();}});

decorateMenu();
