'use strict';
const PROFILE_KEY='bracks-torcedor-v1',TERMS_VERSION='2';
const profileOptions={skin:['#e9c4a7','#c6a183','#a77552','#805337','#513526'],hairStyle:['curto','crespo','longo','careca'],hairColor:['#302b25','#795136','#c2a467','#b6b5aa','#a95535'],shirt:['listrada','preta','branca'],accessory:['bone','faixa','cachecol','nenhum']};
let startAfterRegistration=false;
function validateProfile(p){
 const errors=[];for(const [key,label,min,max] of [['firstName','Nome',1,40],['lastName','Sobrenome',1,40],['nickname','Apelido',2,20],['idol','Ídolo favorito',1,40]])if(typeof p[key]!=='string'||p[key].trim().length<min||p[key].trim().length>max)errors.push(label+' inválido.');
 if(p.onlineConsent&&/[<>@\u0000-\u001f]/.test(p.nickname))errors.push('Para o ranking, use um apelido sem email, símbolos de HTML ou caracteres de controle.');
 if(!Number.isInteger(p.age)||p.age<1||p.age>120)errors.push('Informe uma idade inteira entre 1 e 120.');
 if(!p.termsAccepted||p.termsVersion!==TERMS_VERSION)errors.push('Leia e aceite os termos de uso.');
 if(!Number.isInteger(p.avatar?.number)||p.avatar.number<1||p.avatar.number>99)errors.push('Escolha um número de camisa de 1 a 99.');
 for(const key of Object.keys(profileOptions))if(!profileOptions[key].includes(p.avatar?.[key]))errors.push('Aparência inválida: '+key+'.');return errors;
}
function readForm(){return {firstName:$('#first-name').value.trim(),lastName:$('#last-name').value.trim(),nickname:$('#nickname').value.trim(),age:Number($('#age').value),idol:$('#idol').value.trim(),persistence:$('#persistence').value,onlineConsent:$('#online-consent').checked&&Number($('#age').value)>=18,termsAccepted:$('#accept-terms').checked,termsVersion:TERMS_VERSION,avatar:{skin:$('#skin').value,hairStyle:$('#hair-style').value,hairColor:$('#hair-color').value,shirt:$('#shirt').value,accessory:$('#accessory').value,number:Number($('#shirt-number').value),idol:$('#idol').value.trim()}};}
function previewAvatar(){
 const draft=readForm();avatar={...defaultAvatar,...draft.avatar};const c=$('#avatar-preview').getContext('2d');c.fillStyle='#15181e';c.fillRect(0,0,400,350);for(let y=20;y<350;y+=32){c.fillStyle='#303640';c.fillRect(0,y,400,1);}c.fillStyle='#090b0f';c.fillRect(100,305,200,10);person(c,200,178,4,4.4);
 $('#avatar-nickname').textContent=draft.nickname||'SEU APELIDO';$('#avatar-idol').textContent=draft.idol?'Ídolo: '+draft.idol:'Escolha seu ídolo favorito.';
 $('#online-consent').disabled=draft.age<18; if(draft.age<18)$('#online-consent').checked=false;
}
function openRegistration(playAfter=false){
 startAfterRegistration=playAfter;phase='profile';keys={};$('#menu').classList.add('hidden');$('#game').classList.add('hidden');$('#registration').classList.remove('hidden');$('#settings').disabled=true;$('#profile-error').textContent='';
 const p=profile||{firstName:'',lastName:'',nickname:'',age:'',idol:'',avatar:{...defaultAvatar},termsAccepted:false};
 for(const [id,key] of [['first-name','firstName'],['last-name','lastName'],['nickname','nickname'],['age','age']])$("#"+id).value=p[key];
 $('#idol').value=p.idol||'';$('#persistence').value=p.persistence||'local';$('#online-consent').checked=!!p.onlineConsent;
 for(const [id,key] of [['skin','skin'],['hair-style','hairStyle'],['hair-color','hairColor'],['shirt','shirt'],['accessory','accessory'],['shirt-number','number']])$('#'+id).value=p.avatar[key];
 $('#accept-terms').checked=!!p.termsAccepted&&p.termsVersion===TERMS_VERSION;$('#save-profile').textContent=playAfter?'SALVAR E ENTRAR NO JOGO':'SALVAR MEU TORCEDOR';previewAvatar();$('#first-name').focus();
}
function syncProfileMenu(){
 $('#edit-profile').textContent=profile?'EDITAR MEU TORCEDOR':'CRIAR MEU TORCEDOR';$('#profile-summary').textContent=profile?profile.nickname+' · Ídolo: '+profile.idol:'Crie seu torcedor, escolha seu ídolo e vista a camisa.';
 $('#start-label').textContent=profile?'INICIAR A COBRANÇA':'CRIAR TORCEDOR E JOGAR';decorateMenu();
}
function persistProfile(data){
 const errors=validateProfile(data);if(errors.length)return {ok:false,errors};
 profile={...data,onlineConsent:!!data.onlineConsent&&data.age>=18,persistence:data.persistence==='session'?'session':'local',avatar:{...data.avatar,idol:data.idol.trim()},firstName:data.firstName.trim(),lastName:data.lastName.trim(),nickname:data.nickname.trim(),idol:data.idol.trim(),acceptedAt:new Date().toISOString()};avatar={...profile.avatar};let saved=true;
 try{localStorage.removeItem(PROFILE_KEY);sessionStorage.removeItem(PROFILE_KEY);(profile.persistence==='session'?sessionStorage:localStorage).setItem(PROFILE_KEY,JSON.stringify(profile));}catch{saved=false;}
 return {ok:true,saved};
}
$('#registration-form').addEventListener('submit',async e=>{
 e.preventDefault();if(!$('#registration-form').reportValidity())return;const draft=readForm();const errors=validateProfile(draft);if(errors.length){$('#profile-error').textContent=errors.join(' ');return;}const withdrawing=profile?.onlineConsent&&!draft.onlineConsent;const result=persistProfile(draft);if(withdrawing&&typeof gameOnline!=='undefined')gameOnline.stop();const pendingErase=withdrawing&&typeof gameOnline!=='undefined'&&!await gameOnline.erase();if(!result.ok){$('#profile-error').textContent=result.errors.join(' ');return;}
 $('#registration').classList.add('hidden');syncProfileMenu();if(startAfterRegistration)start();else menu();
 if(pendingErase)toast('Adesão retirada. Exclusão online pendente: use Apagar perfil para tentar novamente.');else if(!result.saved)toast('O perfil vale nesta sessão, mas o navegador não permitiu salvá-lo.');
});
$('#registration-form').addEventListener('input',previewAvatar);$('#registration-form').addEventListener('change',previewAvatar);
$('#registration-back').onclick=()=>{$('#registration').classList.add('hidden');avatar={...(profile?.avatar||defaultAvatar)};menu();syncProfileMenu();};$('#edit-profile').onclick=()=>openRegistration(false);
$('#view-terms').onclick=()=>modal('Termos e privacidade.','<b>Obra de ficção.</b> O Clube da Arquibancada, seus dirigentes, os Carimbados, as falas, os locais e os acontecimentos da história são inventados. Nenhum personagem representa uma pessoa real. A demissão ocorre apenas no universo fictício do jogo. Não use o jogo para ameaçar, perseguir ou divulgar dados de terceiros.<br><br><b>Perfil local.</b> Nome, sobrenome, idade, ídolo e aparência ficam neste navegador. Você escolhe salvar até apagar ou somente nesta aba. Não há conta sincronizada.<br><br><b>Ranking opcional.</b> Nesta versão, adesão apenas para quem declara 18 anos ou mais. Com sua autorização, enviamos apelido, identificadores aleatórios, versão do consentimento, início e resultado da partida e ações de compartilhamento. Só apelido, pontos e tempo aparecem no placar público. Nome civil, idade e ídolo não são enviados. Abrir o X não comprova publicação.<br><br><b>Prazo e controle.</b> Registros online expiram em até 90 dias, com remoção automática em seguida. Retire a adesão no cadastro ou apague o perfil para solicitar exclusão. Se o serviço estiver indisponível, preservamos a chave local para você tentar de novo. Limpar o navegador antes disso pode impedir a exclusão pelo próprio jogo. Provedores de hospedagem podem tratar registros técnicos de conexão.<br><br><b>Galo do Povo.</b> Contato para privacidade, correção e retirada de conteúdo: <a href="/#form-massa" target="_blank" rel="noopener noreferrer">contato por e-mail do portal</a>. Não há compras nem prêmios. O placar é recreativo, sujeito a revisão. Ao compartilhar, o conteúdo e a imagem ficam sujeitos às regras da rede escolhida.<br><br><a href="termos.html" target="_blank" rel="noopener noreferrer">Ler os termos completos e o aviso de privacidade</a>. Privacidade: versão 2 · Edição ficcional: 28/11/2026.',[['VOLTAR AO CADASTRO',()=>{}]],'TERMOS DE USO E PRIVACIDADE');
$('#delete-profile').onclick=()=>modal('Apagar seu torcedor?','Remove o perfil deste navegador e solicita a exclusão dos seus registros do ranking, se houver. Isso não apaga publicações que você fez em outras redes.',[['APAGAR PERFIL LOCAL',async()=>{if(typeof gameOnline!=='undefined')gameOnline.stop();try{localStorage.removeItem(PROFILE_KEY);sessionStorage.removeItem(PROFILE_KEY);}catch{}profile=null;avatar={...defaultAvatar};menu();syncProfileMenu();const erased=typeof gameOnline==='undefined'||await gameOnline.erase();toast(erased?'Perfil apagado.':'Perfil local apagado. Exclusão online pendente: use Apagar perfil para tentar novamente.');}],['MANTER MEU PERFIL',()=>{}]]);
try{const saved=JSON.parse(sessionStorage.getItem(PROFILE_KEY)||localStorage.getItem(PROFILE_KEY)||'null');if(saved&&validateProfile({...saved,termsVersion:TERMS_VERSION}).length===0){profile=saved;avatar={...saved.avatar,idol:saved.idol};}}catch{}
const profileStart=start;start=function(level=0){if(profile?.termsVersion!==TERMS_VERSION){openRegistration(true);return;}profileStart(level);};$('#start').onclick=()=>start();
syncProfileMenu();
