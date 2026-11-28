const test = require('node:test');
const assert = require('node:assert/strict');
const { diasCalendario, dataPublicada, noticiasPublicas, resumoSemanal, promessaPublica, linhaPublica } = require('../lib/editorial');
const legados = require('../lib/registros-legados.json');
test('conta dias pelo calendário de São Paulo, sem tornar datas futuras positivas',()=>{
  assert.equal(diasCalendario('2026-02-24T00:00:00-03:00','2026-11-28T12:00:00-03:00'),277);
  assert.equal(diasCalendario('2026-11-27T23:59:00-03:00','2026-11-28T00:01:00-03:00'),1);
  assert.equal(diasCalendario('2026-11-29','2026-11-28'),0);
  assert.equal(diasCalendario('inválida'),0);
});
test('data da coleta não transforma notícia antiga ou sem data em notícia semanal',()=>{
  const agora=new Date('2026-11-28T15:00:00Z');
  const itens=[{fonteUrl:'https://example.com/old',titulo:'Antiga',dataPublicacao:'2025-10-01',dataCriacao:agora},{fonteUrl:'https://example.com/unknown',titulo:'Sem data',dataCriacao:agora}];
  const semanal=resumoSemanal(itens,agora);
  assert.ok(!semanal.some(m=>['Antiga','Sem data'].includes(m.titulo)));
  assert.ok(semanal.some(m=>m.fonteNome==='No Ataque'));
  assert.deepEqual(resumoSemanal(itens,new Date('2027-01-01')),[]);
});
test('fontes revisadas não duplicam, datas futuras são rejeitadas e texto antigo não é republicado',()=>{
  assert.equal(dataPublicada({pubDate:'2099-01-01'}),null);
  assert.equal(dataPublicada({pubDate:'inválida'}),null);
  const itens=noticiasPublicas([{fonteUrl:'https://example.com',titulo:'Título',conteudo:'Texto integral sem licença'}]);
  assert.ok(!itens.find(m=>m.fonteUrl==='https://example.com').conteudo.includes('sem licença'));
  assert.ok(!noticiasPublicas([{fonteUrl:'javascript:alert(1)',titulo:'Link inválido'}]).some(m=>m.titulo==='Link inválido'));
  const revisada=noticiasPublicas([])[0];
  assert.equal(noticiasPublicas([revisada,revisada]).filter(m=>m.fonteUrl===revisada.fonteUrl).length,1);
});
test('arquivo sem comprovação não recebe classificação de descumprimento e preserva o original',()=>{
  const p={chave:'sanear_dividas',titulo:'Promessa',status:'Descumprida',situacao:legados.situacoes[0]};
  const publico=promessaPublica(p);
  assert.equal(publico.status,'Sob verificação');
  assert.equal(publico.fontes.length,2);
  assert.equal(p.situacao,legados.situacoes[0]);
  const editada={...p,situacao:'Registro corrigido manualmente com nova fonte'};
  assert.equal(promessaPublica(editada).situacao,editada.situacao);
  const novoMarco={data:'28/11/2026',titulo:'Atualização manual',desc:'Nova informação verificada'};
  assert.ok(linhaPublica([...legados.marcos,novoMarco]).some(m=>m.titulo===novoMarco.titulo));
  assert.ok(!linhaPublica(legados.marcos).some(m=>m.desc===legados.marcos[0].desc));
});
