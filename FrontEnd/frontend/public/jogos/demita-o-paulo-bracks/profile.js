'use strict';
const PROFILE_KEY='bracks-torcedor-v1',TERMS_VERSION='1';
const profileOptions={skin:['#e9c4a7','#c6a183','#a77552','#805337','#513526'],hairStyle:['curto','crespo','longo','careca'],hairColor:['#302b25','#795136','#c2a467','#b6b5aa','#a95535'],shirt:['listrada','preta','branca'],accessory:['bone','faixa','cachecol','nenhum']};
let startAfterRegistration=false;
function validateProfile(p){
 const errors=[];for(const [key,label,min,max] of [['firstName','Nome',1,40],['lastName','Sobrenome',1,40],['nickname','Apelido',2,20],['idol','Ídolo favorito',1,40]])if(typeof p[key]!=='string'||p[key].trim().length<min||p[key].trim().length>max)errors.push(label+' inválido.');
 if(!Number.isInteger(p.age)||p.age<1||p.age>120)errors.push('Informe uma idade inteira entre 1 e 120.');
 if(!p.termsAccepted||p.termsVersion!==TERMS_VERSION)errors.push('Leia e aceite os termos de uso.');
 if(!Number.isInteger(p.avatar?.number)||p.avatar.number<1||p.avatar.number>99)errors.push('Escolha um número de camisa de 1 a 99.');
 for(const key of Object.keys(profileOptions))if(!profileOptions[key].includes(p.avatar?.[key]))errors.push('Aparência inválida: '+key+'.');return errors;
}
function readForm(){const idol=$('#idol').value;return {firstName:$('#first-name').value.trim(),lastName:$('#last-name').value.trim(),nickname:$('#nickname').value.trim(),age:Number($('#age').value),idol:idol==='Outro'?$('#other-idol').value.trim():idol,termsAccepted:$('#accept-terms').checked,termsVersion:TERMS_VERSION,avatar:{skin:$('#skin').value,hairStyle:$('#hair-style').value,hairColor:$('#hair-color').value,shirt:$('#shirt').value,accessory:$('#accessory').value,number:Number($('#shirt-number').value)}};}
function previewAvatar(){
 const draft=readForm();avatar={...defaultAvatar,...draft.avatar};const c=$('#avatar-preview').getContext('2d');c.fillStyle='#202c20';c.fillRect(0,0,400,350);for(let y=20;y<350;y+=32){c.fillStyle='#2d3c2a';c.fillRect(0,y,400,1);}c.fillStyle='#152115';c.fillRect(100,290,200,10);person(c,200,172,4,4.4);
 $('#avatar-nickname').textContent=draft.nickname||'SEU APELIDO';$('#avatar-idol').textContent=draft.idol?'Ídolo: '+draft.idol:'Escolha seu ídolo favorito.';
 const other=$('#idol').value==='Outro';$('#other-idol-label').classList.toggle('hidden',!other);$('#other-idol').required=other;
}
function openRegistration(playAfter=false){
 startAfterRegistration=playAfter;phase='profile';keys={};$('#menu').classList.add('hidden');$('#game').classList.add('hidden');$('#registration').classList.remove('hidden');$('#settings').disabled=true;$('#profile-error').textContent='';
 const p=profile||{firstName:'',lastName:'',nickname:'',age:'',idol:'',avatar:{...defaultAvatar},termsAccepted:false};
 for(const [id,key] of [['first-name','firstName'],['last-name','lastName'],['nickname','nickname'],['age','age']])$("#"+id).value=p[key];
 const known=['Reinaldo','Ronaldinho','Hulk','Victor','Diego Tardelli','Marques','Dadá Maravilha'];$('#idol').value=p.idol?(known.includes(p.idol)?p.idol:'Outro'):'';$('#other-idol').value=p.idol&&!known.includes(p.idol)?p.idol:'';
 for(const [id,key] of [['skin','skin'],['hair-style','hairStyle'],['hair-color','hairColor'],['shirt','shirt'],['accessory','accessory'],['shirt-number','number']])$('#'+id).value=p.avatar[key];
 $('#accept-terms').checked=!!p.termsAccepted;$('#save-profile').textContent=playAfter?'SALVAR E ENTRAR NO JOGO':'SALVAR MEU TORCEDOR';previewAvatar();$('#first-name').focus();
}
function syncProfileMenu(){
 $('#edit-profile').textContent=profile?'EDITAR MEU TORCEDOR':'CRIAR MEU TORCEDOR';$('#profile-summary').textContent=profile?profile.nickname+' · Ídolo: '+profile.idol:'Crie seu torcedor, escolha seu ídolo e vista a camisa.';
 $('#start-label').textContent=profile?'INICIAR A COBRANÇA':'CRIAR TORCEDOR E JOGAR';decorateMenu();
}
function persistProfile(data){
 const errors=validateProfile(data);if(errors.length)return {ok:false,errors};
 profile={...data,avatar:{...data.avatar},firstName:data.firstName.trim(),lastName:data.lastName.trim(),nickname:data.nickname.trim(),idol:data.idol.trim(),acceptedAt:profile?.acceptedAt||new Date().toISOString()};avatar={...profile.avatar};let saved=true;
 try{localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));}catch{saved=false;}
 return {ok:true,saved};
}
$('#registration-form').addEventListener('submit',e=>{
 e.preventDefault();if(!$('#registration-form').reportValidity())return;const result=persistProfile(readForm());if(!result.ok){$('#profile-error').textContent=result.errors.join(' ');return;}
 $('#registration').classList.add('hidden');syncProfileMenu();if(startAfterRegistration)start();else menu();
 if(!result.saved)toast('O perfil vale nesta sessão, mas o navegador não permitiu salvá-lo.');
});
$('#registration-form').addEventListener('input',previewAvatar);$('#registration-form').addEventListener('change',previewAvatar);
$('#registration-back').onclick=()=>{$('#registration').classList.add('hidden');avatar={...(profile?.avatar||defaultAvatar)};menu();syncProfileMenu();};$('#edit-profile').onclick=()=>openRegistration(false);
$('#view-terms').onclick=()=>modal('Termos e aviso de dados.','<b>Sobre o jogo.</b> Esta é uma paródia de torcedor, não oficial e sem vínculo com o clube. Falas, habilidades, situações e o grupo Galouvendidos são fictícios. Os confrontos acontecem apenas no universo arcade do jogo.<br><br><b>Seu perfil.</b> Nome, sobrenome, apelido, idade, ídolo e aparência ficam no armazenamento deste navegador. O formulário não envia esses dados a um servidor e não cria uma conta online.<br><br><b>Seu controle.</b> Você pode editar ou apagar o perfil no menu. Limpar os dados do navegador também o remove. O perfil não acompanha você automaticamente em outros aparelhos.<br><br><b>Uso recreativo.</b> A sátira não é um canal para perseguir pessoas reais. Não há compras, prêmios ou pagamentos no jogo.<br><br>Versão 1. Ao marcar a caixa, você confirma que leu estas informações.',[['VOLTAR AO CADASTRO',()=>{}]],'TERMOS DE USO · PERFIL LOCAL');
$('#delete-profile').onclick=()=>modal('Apagar seu perfil local?','Isso remove deste navegador o cadastro e a aparência do torcedor. Você poderá criar outro perfil depois.',[['APAGAR PERFIL LOCAL',()=>{try{localStorage.removeItem(PROFILE_KEY);}catch{}profile=null;avatar={...defaultAvatar};menu();syncProfileMenu();toast('Perfil local apagado.');}],['MANTER MEU PERFIL',()=>{}]]);
try{const saved=JSON.parse(localStorage.getItem(PROFILE_KEY)||'null');if(saved&&validateProfile(saved).length===0){profile=saved;avatar={...saved.avatar};}}catch{}
syncProfileMenu();
