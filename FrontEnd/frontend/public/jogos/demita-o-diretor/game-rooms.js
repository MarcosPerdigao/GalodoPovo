'use strict';
// Elenco de cartum do universo fictício; sem retratos ou uniformes de pessoas reais.
const fictionPerson=person;
person=function(c,x,y,id=4,scale=1,walk=0){
 if(id===4){fictionPerson(c,x,y,id,scale,walk);return;}const index=Math.max(0,Math.min(3,id)),coats=['#8164a8','#517bba','#bc8353','#a65e8c'],skins=['#c68f70','#e7c3a0','#795841','#a77e61'];
 c.save();c.translate(x,y);c.scale(scale,scale);const r=(a,b,w,h,color)=>{c.fillStyle=color;c.fillRect(a,b,w,h);};
 r(-14,24,29,4,'#0006');r(-9,16,7,10+walk,'#252838');r(4,16,7,10-walk,'#252838');r(-12,-5,25,23,coats[index]);r(-17,-3,5,16,skins[index]);r(13,-3,5,16,skins[index]);r(-3,-5,6,22,'#eee7d8');r(-1,-1,3,13,'#e6ba58');r(-8,-23,18,18,skins[index]);
 if(index===0){r(-12,-24,26,4,'#443852');r(-8,-28,18,5,'#b1a1c8');r(2,-26,6,2,'#f0d894');}
 if(index===1){r(-10,-26,22,5,'#a95148');r(-7,-18,7,5,'#32384c');r(3,-18,7,5,'#32384c');r(0,-17,3,2,'#32384c');}
 if(index===2){r(-10,-25,22,4,'#dfdcc9');r(-6,-28,14,3,'#faf1d3');r(-4,-18,3,3,'#19222e');r(5,-18,3,3,'#19222e');r(9,-9,11,3,'#d6d0ba');}
 if(index===3){r(-12,-24,26,4,'#384d69');r(-7,-28,16,5,'#6584ad');r(-4,-18,3,3,'#1a2130');r(4,-19,7,7,'#e3d08e');r(6,-17,3,3,'#3c526a');r(-5,-11,15,3,'#54433d');}
 if(index===0)r(-4,-17,12,3,'#352d45');r(-1,-8,5,1,'#6f483a');c.restore();
};
// Objetos nas laterais e sobre as mesas; o caminho entre as mesas permanece livre.
const ROOM_THEMES=[
 {name:'DEPARTAMENTO DE FUTEBOL',accent:'#d7e4ba',desk:'#555e68',edge:'#303741'},
 {name:'ESCRITÓRIO DO CEO',accent:'#dbc59d',desk:'#685d55',edge:'#3a3430'},
 {name:'GABINETE DE AUTORIZAÇÕES',accent:'#b4cfeb',desk:'#526778',edge:'#2d3a47'},
 {name:'SALA DO CONSELHO',accent:'#f2d077',desk:'#686053',edge:'#383329'}
];
const BOSS_LINES=[
 {normal:['A planilha está invicta fora de campo.','O relatório tem mais páginas que finalizações.','Precisamos de mais uma janela para explicar a janela.'],pressure:['Essa cobrança não estava no planejamento.','A apresentação tinha menos bolas que isso.','Alguém abre a aba das justificativas!'],critical:['Tem como remarcar essa pressão para segunda?','O processo está ficando apertado!']},
 {normal:['Antes de aprovar, precisamos aprovar a aprovação.','Faltou rubricar o rodapé da primeira via.','Esse pedido precisa circular por mais três setores.'],pressure:['O carimbo está em reunião.','A fila de pareceres acabou de crescer.','Precisamos de um protocolo para essa pressão!'],critical:['Quem assinou a autorização para esses chutes?','Nem o formulário tem mais campo para isso!']},
 {normal:['Recebi o pedido. Falta autorizar o recebimento.','Vou encaminhar seu encaminhamento.','Isso precisa caber no próximo alinhamento.'],pressure:['Essa reunião ganhou intensidade.','Temos autorização para pedir uma pausa?','O painel não previa essa quantidade de bolas.'],critical:['Quem aprovou essa pressão toda?','A próxima assinatura já está chegando perto!']},
 {normal:['Qual é o custo dessa última assinatura?','Vamos projetar essa pressão em doze parcelas.','A reunião só termina depois da última palavra.'],pressure:['O conselho pede uma pausa para o café.','Essa cobrança não para de entrar na pauta.','Precisamos recalcular o tempo desta reunião.'],critical:['Já podemos colocar a caneta na mesa?','Essa vai ser a última deliberação!']}
];
function roomFrame(x,y,w,h,color){rect(x-3,y-3,w+6,h+6,'#0b0e13');rect(x,y,w,h,color);}
function roomPlant(x,y){rect(x-12,y+12,24,22,'#73645a');rect(x-8,y+15,16,4,'#aa9882');rect(x-2,y-15,4,28,'#718879');rect(x-19,y-9,19,9,'#7a9786');rect(x+2,y-21,17,10,'#9aa98b');rect(x-13,y-28,13,12,'#9aa98b');}
function roomFiles(x,y,w,h,accent){roomFrame(x,y,w,h,'#333b46');for(let top=y+10;top<y+h-24;top+=41){rect(x+7,top,w-14,31,'#505a67');rect(x+w/2-11,top+13,22,4,accent);}}
function roomCup(x,y,accent){rect(x-11,y,22,15,accent);rect(x-16,y+2,5,9,accent);rect(x+11,y+2,5,9,accent);rect(x-3,y+15,6,10,accent);rect(x-13,y+25,26,5,accent);}
function roomMonitor(x,y,w,h,accent){roomFrame(x,y,w,h,'#0f1822');for(let i=0;i<4;i++)rect(x+9+i*(w-18)/4,y+h-12-i*12,10,8+i*12,accent);rect(x+w/2-3,y+h,6,10,'#707c8a');rect(x+w/2-20,y+h+10,40,4,'#707c8a');}
drawRoomDecor=function(){
 const index=state.level,theme=ROOM_THEMES[index],accent=theme.accent;
 rect(24,60,1072,6,theme.edge);rect(24,584,1072,7,theme.edge);rect(24,60,5,530,accent);rect(1091,60,5,530,accent);
 ctx.save();ctx.globalAlpha=.09;rect(267,255,586,240,accent);rect(275,263,570,224,theme.edge);ctx.restore();
 if(index===0){
  roomFrame(43,150,93,167,'#273a36');rect(51,160,77,146,'#52665a');ctx.strokeStyle='#d6dfcd';ctx.lineWidth=2;ctx.strokeRect(59,170,61,123);ctx.beginPath();ctx.moveTo(59,232);ctx.lineTo(120,232);ctx.stroke();ctx.beginPath();ctx.arc(89,232,15,0,Math.PI*2);ctx.stroke();rect(77,170,24,19,'#8d9b84');rect(77,274,24,19,'#8d9b84');label('TÁTICA',90,337,accent,14);
  roomFrame(995,151,83,177,'#353d48');for(let i=0;i<3;i++){rect(1002,196+i*49,69,4,'#87908d');ctx.fillStyle='#e6e6db';ctx.beginPath();ctx.arc(1020+i%2*27,182+i*49,12,0,Math.PI*2);ctx.fill();rect(1016+i%2*27,178+i*49,8,8,'#30343b');}label('ELENCO',1036,350,accent,14);roomPlant(94,474);
 }else if(index===1){
  roomFiles(43,151,91,249,accent);label('ARQUIVO',90,424,accent,14);roomFiles(996,151,81,190,accent);for(let i=0;i<3;i++){rect(1005+i*2,367+i*14,61,10,i%2?'#c7c4b8':'#e8e4d7');}label('VIAS',1037,433,accent,14);rect(49,464,77,37,'#c5bdab');label('PENDENTE',87,488,'#713f35',13);
 }else if(index===2){
  for(const x of [44,996]){roomFrame(x,147,80,205,'#273b4a');for(let y=159;y<340;y+=41)rect(x+7,y,65,2,'#7294aa');rect(x+38,149,3,197,'#8da8b9');}roomMonitor(46,379,78,65,accent);label('PAINEL',85,474,accent,14);roomPlant(1035,463);
 }else{
  roomFrame(43,149,91,247,'#282b34');for(let i=0;i<3;i++){rect(50,217+i*72,77,4,'#9b8d6d');roomCup(89,179+i*72,accent);}label('GALERIA',90,420,accent,14);
  roomFrame(993,149,88,234,'#202c3c');rect(1001,160,72,89,'#85909b');for(let i=0;i<6;i++)rect(1004+i*11,238-(i%3)*12,7,26+(i%3)*12,'#414c5c');rect(1001,269,72,105,'#101924');rect(1035,152,3,225,'#a6afb7');label('CONSELHO',1037,407,accent,13);roomPlant(1035,478);
 }
 label(theme.name,560,577,accent,14);
};
drawRoomStation=function(d){
 if(d.kind==='gate')return;const theme=ROOM_THEMES[state.level];rect(d.x,d.y,d.w,d.h,theme.desk);rect(d.x,d.y+d.h-10,d.w,10,theme.edge);
 if(d.kind==='coffee'){rect(d.x+26,d.y+12,26,28,'#222831');rect(d.x+30,d.y+7,18,7,'#b5bdc1');rect(d.x+73,d.y+22,20,20,'#e6e3d9');rect(d.x+93,d.y+25,6,11,'#b5bdc1');return;}
 if(state.level===0){rect(d.x+17,d.y+11,59,34,'#263c34');rect(d.x+23,d.y+16,47,23,'#829780');rect(d.x+44,d.y+17,2,21,'#dfe6d5');rect(d.x+99,d.y+15,23,30,'#e2e3d6');}
 else if(state.level===1){for(let i=0;i<3;i++)rect(d.x+17+i*4,d.y+17-i*4,55,24,i%2?'#d0c4ae':'#f0e8d6');rect(d.x+97,d.y+14,13,17,'#282a30');rect(d.x+89,d.y+31,30,9,'#a95f4e');}
 else{rect(d.x+19,d.y+10,65,32,'#222b36');rect(d.x+24,d.y+14,55,23,theme.accent);rect(d.x+15,d.y+42,74,6,'#b5bdc1');rect(d.x+109,d.y+20,13,23,'#1a2028');rect(d.x+99,d.y+43,33,4,'#c3c5c2');}
};
updateBossDialogue=function(b){
 const ratio=b.hp/b.max,band=ratio<=.3?'critical':ratio<=.65?'pressure':'normal';if(b.quoteBand===band&&b.clock<b.quoteAt)return;
 const lines=BOSS_LINES[state.level][band];b.quote=lines[(b.quoteIndex||0)%lines.length];b.quoteIndex=(b.quoteIndex||0)+1;b.quoteAt=b.clock+4.5;b.quoteBand=band;$('#boss-quote').textContent='FALA FICTÍCIA · '+b.quote;
};
drawBossDialogue=function(b){
 const words=(b.quote||levels[state.level].quote).split(' '),lines=[''];for(const word of words){const last=lines.length-1;if((lines[last]+' '+word).trim().length>40)lines.push(word);else lines[last]+=(lines[last]?' ':'')+word;}
 const center=Math.max(220,Math.min(900,b.x)),top=b.y+65,width=360,height=lines.length*18+21;rect(center-width/2-2,top-2,width+4,height+4,ROOM_THEMES[state.level].accent);rect(center-width/2,top,width,height,'#11161ef5');lines.forEach((line,i)=>label(line,center,top+21+i*18,'#f2eee2',14));
};
decorateMenu();
