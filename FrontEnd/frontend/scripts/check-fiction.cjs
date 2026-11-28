const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),game=path.join(root,'public/jogos/demita-o-diretor');
test('a nova narrativa não publica os nomes e referências reais removidos',()=>{
 for(const oldPhoto of ['rosto-rubens.jpg','rosto-rafael.jpg']) assert.ok(!fs.existsSync(path.join(root,'public',oldPhoto)),'Foto antiga não deve ser publicada: '+oldPhoto);
 const forbidden=/\b(?:Paulo\s+Bracks|Bracks|Pedro\s+Daniel|Rafael|Rubens|Menin|Cidade\s+do\s+Galo|Clube\s+Atlético\s+Mineiro|Arena\s+MRV)\b/i;
 for(const file of fs.readdirSync(game)){
  // Chaves técnicas legadas mantêm os perfis e recordes existentes no mesmo domínio.
  const text=fs.readFileSync(path.join(game,file),'utf8').replaceAll('bracks-fan-best','legacy-best').replaceAll('bracks-torcedor-v1','legacy-profile');
  assert.equal(forbidden.test(text),false,'Referência antiga em '+file);
 }
 const html=fs.readFileSync(path.join(game,'index.html'),'utf8');assert.ok(html.includes('OBRA DE FICÇÃO'));assert.ok(html.includes('Não representam pessoas, instituições ou fatos reais.'));assert.ok(html.includes('https://www.galodopovo.com.br/jogos/demita-o-diretor/'));
 const source=fs.readFileSync(path.join(game,'fan-game.js'),'utf8');for(const name of ['Nestor Carimbo','Célio Parecer','Bento Protocolo','Otávio Martelo'])assert.ok(source.includes(name));assert.ok(source.includes('#DiretorDemitidoNoJogo'));assert.ok(source.includes('PERSONAGENS FICTÍCIOS'));
});
test('links antigos redirecionam para a nova obra, inclusive seus arquivos',()=>{
 const config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8'));const rule=config.redirects.find(r=>r.source==='/jogos/demita-o-paulo-bracks/:path*');assert.ok(rule);assert.equal(rule.destination,'/jogos/demita-o-diretor/:path*');assert.equal(rule.permanent,true);
 const trailing=config.redirects.find(r=>r.source==='/jogos/demita-o-paulo-bracks/');assert.ok(trailing);assert.equal(trailing.destination,'/jogos/demita-o-diretor/');assert.equal(trailing.permanent,true);
 const sitemap=fs.readFileSync(path.join(root,'public/sitemap.xml'),'utf8');assert.ok(sitemap.includes('/jogos/demita-o-diretor/'));assert.ok(!sitemap.includes('/jogos/demita-o-paulo-bracks/'));
});
