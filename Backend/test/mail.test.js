const {test}=require('node:test');const assert=require('node:assert/strict');const nodemailer=require('nodemailer');
test('Nodemailer gera o formato de mensagem do portal sem rede nem envio real',async()=>{
 const transport=nodemailer.createTransport({streamTransport:true,buffer:true,disableFileAccess:true,disableUrlAccess:true});
 const info=await transport.sendMail({from:'portal@example.com',to:'admin@example.com',subject:'Contato do portal',text:'Nome: Teste\nE-mail: massa@example.com\n\nMensagem de privacidade do jogo.'});
 assert.deepEqual(info.envelope.to,['admin@example.com']);assert.ok(info.message.toString().includes('Mensagem de privacidade'));assert.ok(info.message.toString().includes('Subject: Contato do portal'));
});
