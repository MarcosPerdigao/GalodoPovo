// Revisão editorial de 28/11/2026. Mantém registros originais no admin/banco.
const legados = require('./registros-legados.json');
const RELATORIO = 'https://atletico.com.br/wp-content/uploads/2026/04/20260430-Relatorio-Integrado-AM-SAFGALO.pdf';
const ATA = 'https://atletico.com.br/wp-content/uploads/2026/09/Conselho-da-Massa-Ata-de-Reuniao-Ordinaria_15.09.2026-assinada.pdf';
const COACH = 'https://atletico.com.br/eduardo-dominguez-e-o-novo-tecnico-do-galo/';
const linhaRevisada = [
  { data:'20/07/2023', titulo:'Conselho aprova a SAF', desc:'Aprovação anunciada pelo clube. A participação aprovada naquele momento não deve ser confundida com a composição societária atual.', fonteUrl:'https://atletico.com.br/conselho-do-galo-aprova-a-maior-saf-do-brasil/' },
  { data:'01/11/2023', titulo:'Conclusão da transição para SAF', desc:'O clube anunciou a conclusão da operação. Esta é a referência do contador de dias sob SAF.', fonteUrl:'https://atletico.com.br/clube-conclui-transicao-para-saf-e-recebe-investimento-da-galo-holding/' },
  { data:'24/02/2026', titulo:'Eduardo Domínguez é anunciado', desc:'O anúncio oficial informa a contratação do treinador. O contador usa esta data e dias de calendário em São Paulo.', fonteUrl:COACH },
  { data:'30/04/2026', titulo:'Publicação do Relatório Integrado de 2025', desc:'Documento com dados históricos de 31/12/2025; os valores não representam o saldo em tempo real.', fonteUrl:RELATORIO },
  { data:'15/09/2026', titulo:'Ata registra aporte e medidas financeiras', desc:'O Conselho da Massa registra aporte destinado a dívidas bancárias e medidas para outros compromissos.', fonteUrl:ATA },
];
const finanças = {
  revisadoEm: '2026-11-28', dataBase: '2025-12-31',
  endividamentoLiquido: 1772000000, dividaOnerosa: 1037000000,
  encargosFinanciamentos: 176196000,
  fonteUrl: RELATORIO, fonteNome: 'Relatório Integrado 2025, pp. 52 e 171',
  atualizacao: 'A ata de 15/09/2026 registra aporte de R$ 530.000.721,59 destinado à quitação de dívidas bancárias. Isso não comprova a quitação de todo o passivo nem permite calcular o saldo atual por simples subtração.',
  atualizacaoUrl: ATA,
};
const noticiasRevisadas = [
  { _id: 'revisao-bracks-20261127', titulo: 'No Ataque relata reunião de Bracks com lideranças de torcidas', conteudo: 'Segundo reportagem de 27/11, o encontro ocorreu em 26/11 na Cidade do Galo. Consulte a fonte para o relato completo.', fonteNome: 'No Ataque', fonteUrl: 'https://noataque.com.br/futebol/time/atletico-mg/noticia/2026/11/27/bracks-se-reune-com-organizadas-do-atletico-na-cidade-do-galo/', dataPublicacao: '2026-11-27T12:00:00-03:00', dataEvento: '2026-11-26', dataCriacao: '2026-11-28T00:00:00-03:00', tag: 'Gestão' },
  { _id: 'revisao-protesto-20261127', titulo: 'Organizadas anunciaram convocação de protesto no CT, relata No Ataque', conteudo: 'A reportagem de 27/11 informou uma convocação para 28/11. Este registro documenta o anúncio e não confirma a realização do ato.', fonteNome: 'No Ataque', fonteUrl: 'https://noataque.com.br/futebol/time/atletico-mg/noticia/2026/11/27/organizadas-do-atletico-irao-ao-ct-em-protesto-neste-sabado/', dataPublicacao: '2026-11-27T12:00:00-03:00', dataEvento: '2026-11-28', dataCriacao: '2026-11-28T00:00:00-03:00', tag: 'Torcida' },
  { _id: 'revisao-aporte-20260915', titulo: 'Ata do Conselho da Massa registra aporte para dívidas bancárias', conteudo: 'Documento de 15/09 registra R$ 530 milhões destinados à quitação de dívidas bancárias. O valor não equivale ao saldo atualizado de toda a dívida.', fonteNome: 'Atlético — Conselho da Massa', fonteUrl: ATA, dataPublicacao: '2026-09-15T19:00:00-03:00', dataCriacao: '2026-11-28T00:00:00-03:00', tag: 'Finanças' },
];
const titulos = {
  sanear_dividas: 'Saneamento das dívidas', acabar_com_juros: 'Redução dos encargos financeiros',
  clube_autossustentavel: 'Sustentabilidade financeira', aporte_500_milhoes: 'Aportes na SAF',
  time_primeira_prateleira: 'Competitividade esportiva', gestao_profissional: 'Planejamento e continuidade',
  obrigacoes_em_dia: 'Regularidade das obrigações financeiras', transparencia_governanca: 'Transparência e governança',
  parceiro_estrangeiro: 'Composição do capital e investidores', reaproximar_massa: 'Participação e acesso da torcida',
};
function promessaPublica(p) {
  // A revisão substitui apenas textos que estavam publicados no momento da auditoria.
  // Uma edição manual posterior continua aparecendo pelas rotas existentes.
  if (!legados.situacoes.includes(p.situacao)) return { id:p.chave, titulo:p.titulo, status:p.status, resumo:p.resumo, situacao:p.situacao, fontes:p.fontes || [] };
  const financeiro = ['sanear_dividas', 'acabar_com_juros', 'clube_autossustentavel', 'aporte_500_milhoes'].includes(p.chave);
  return { id: p.chave, titulo: titulos[p.chave] || p.titulo, status: 'Sob verificação',
    resumo: financeiro ? 'Acompanhamento documental: balanço de 2025 e ata de setembro de 2026.' : 'Registro editorial em revisão de fontes e atribuição da declaração original.',
    situacao: financeiro ? 'O balanço refere-se a 31/12/2025; a ata posterior registra novo aporte bancário. Esses documentos não permitem concluir, sozinhos, que uma promessa foi cumprida ou descumprida.' : 'A atribuição, a data e o alcance da promessa precisam ser documentados antes de uma conclusão pública. O texto anterior permanece no arquivo administrativo.',
    fontes: financeiro ? [{ nome: 'Balanço de 2025', url: RELATORIO }, { nome: 'Ata de 15/09/2026', url: ATA }] : [], revisadoEm: '2026-11-28' };
}
function linhaPublica(lista) {
  const editados = lista.filter(item => !legados.marcos.some(antigo => antigo.desc === item.desc));
  return [...linhaRevisada, ...editados.map(item => ({data:item.data,titulo:item.titulo,desc:item.desc,fonteUrl:item.fonteUrl}))];
}
function diasCalendario(inicio, fim = new Date()) {
  if (!Number.isFinite(new Date(inicio).getTime()) || !Number.isFinite(new Date(fim).getTime())) return 0;
  const dia = d => { const s = new Intl.DateTimeFormat('en-CA', {timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(d)); return Date.parse(s+'T00:00:00Z'); };
  const a=dia(inicio), b=dia(fim);
  return Number.isFinite(a)&&Number.isFinite(b) ? Math.max(0, Math.round((b-a)/86400000)) : 0;
}
function dataPublicada(item, agora = new Date()) {
  const data = new Date(item.isoDate || item.pubDate || item.dataPublicacao || '');
  return Number.isFinite(data.getTime()) && data <= agora ? data : null;
}
function noticiasPublicas(lista, agora = new Date(), incluirRevisadas = true) {
  const porUrl = new Map();
  for (const item of [...lista, ...(incluirRevisadas ? noticiasRevisadas : [])]) {
    const m = item.toObject ? item.toObject() : item;
    try { if (!['https:', 'http:'].includes(new URL(m.fonteUrl).protocol)) continue; } catch { continue; }
    const revisada = noticiasRevisadas.find(n => n.fonteUrl === m.fonteUrl);
    porUrl.set(m.fonteUrl, {...m, conteudo: revisada ? revisada.conteudo : 'Leia a reportagem completa na fonte. Este link foi reunido para consulta; não implica confirmação editorial de todas as afirmações.', dataPublicacao: dataPublicada(m, agora)});
  }
  return [...porUrl.values()].sort((a,b)=> new Date(b.dataPublicacao || 0)-new Date(a.dataPublicacao || 0));
}
function resumoSemanal(lista, agora = new Date()) {
  return noticiasPublicas(lista, agora).filter(m=>m.dataPublicacao && agora-m.dataPublicacao<=7*86400000).slice(0,3).map(m=>({...m, resumo:m.conteudo,tag:m.tag||'Notícias',impacto:'Registro de fonte'}));
}
module.exports = { finanças, COACH, linhaRevisada, linhaPublica, noticiasRevisadas, promessaPublica, diasCalendario, dataPublicada, noticiasPublicas, resumoSemanal };
