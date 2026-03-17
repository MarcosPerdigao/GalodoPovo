// backend/index.js
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const app = express();
app.use(cors());
app.use(express.json());

// Dossiê de Promessas Quebradas e Realidade da SAF (COMPLETO)
const materias = [
  {
    id: 1,
    titulo: "1. A Dívida que Nunca Acaba e os Juros aos Donos",
    link: "#divida",
    conteudo:
      "A promessa era quitar as dívidas onerosas imediatamente. A realidade é que o Galo continua pagando juros altíssimos. O pior: parte desses juros da dívida contraída antes da SAF agora é paga pela SAF diretamente para a família Menin (Galo Holding), transformando o clube num gerador de juros para os próprios investidores.",
    fonteNome: "GE - Rodrigo Capelo (Análise SAF)",
    fonteUrl: "https://ge.globo.com/futebol/times/atletico-mg/",
  },
  {
    id: 2,
    titulo: '2. Arena MRV: A "Casa do Povo" virou Área VIP',
    link: "#arenamrv",
    conteudo:
      "A Arena MRV foi vendida como o trunfo que mudaria o patamar do clube. Hoje, vemos uma política de preços de ingressos abusiva, expulsando o torcedor comum das arquibancadas. O estádio virou uma máquina de lucro corporativo, ignorando quem sempre carregou o time.",
    fonteNome: "Itatiaia - Reclamações Arena MRV",
    fonteUrl: "https://www.itatiaia.com.br/esportes/atletico",
  },
  {
    id: 3,
    titulo: "3. O Falso 'Time Imbatível' e a Dança dos Técnicos",
    link: "#futebol",
    conteudo:
      "Prometeram um time no topo da América, capaz de 'amassar' os rivais. Na prática, vemos elencos sendo desmanchados para fechar o caixa e uma falta de convicção absurda no futebol, refletida na troca constante e amadora de treinadores.",
    fonteNome: "UOL Esporte - Crise no Futebol",
    fonteUrl: "https://www.uol.com.br/esporte/futebol/times/atletico-mg/",
  },
  {
    id: 4,
    titulo: "4. A Alienação do Patrimônio: Diamond Mall",
    link: "#patrimonio",
    conteudo:
      "A Associação perdeu quase tudo. O Diamond Mall, a grande joia construída pelo clube, foi fatiado e vendido sob o pretexto de abater dívidas que, no fim, continuaram sufocando o clube. O Galo entregou seu passado em troca de um futuro incerto.",
    fonteNome: "Estado de Minas - Venda do Diamond",
    fonteUrl:
      "https://www.mg.superesportes.com.br/app/noticias/futebol/atletico-mg/",
  },
  {
    id: 5,
    titulo: "5. Conflito de Interesses: De Credores a Donos",
    link: "#credores",
    conteudo:
      "A omissão brutal: os compradores eram os próprios mecenas, os maiores credores do clube. Grande parte da operação da SAF foi uma manobra contábil: trocaram a dívida que o Galo tinha com eles por ações do próprio clube.",
    fonteNome: "Deus me Dibre - Bastidores da SAF",
    fonteUrl: "https://deusmedibre.com.br/",
  },
  {
    id: 6,
    titulo: "6. A Caixa Preta e o Silêncio da Associação",
    link: "#transparencia",
    conteudo:
      "A promessa de governança transparente ficou no papel. Conselheiros relatam dificuldades para acessar balanços detalhados da SAF. A Associação (que detém 25%) virou figurante, sem voz ativa para vetar decisões que ferem a cultura do clube.",
    fonteNome: "Fala Galo - Transparência",
    fonteUrl: "https://falagalo.com.br/",
  },
  {
    id: 7,
    titulo: "7. O 'Valuation' Suspeito",
    link: "#valuation",
    conteudo:
      "A SAF incluiu a Arena MRV e a Cidade do Galo no pacote para os investidores. No entanto, o valor total do clube (valuation) foi avaliado muito abaixo do mercado real, garantindo à Holding 75% das ações por um aporte que mal cobria a construção do estádio.",
    fonteNome: "Conselho Deliberativo (Análises)",
    fonteUrl: "",
  },
  {
    id: 8,
    titulo: "8. A Votação 'Goela Abaixo'",
    link: "#votacao",
    conteudo:
      "A democracia do clube foi atropelada. O processo no Conselho Deliberativo foi marcado pela pressa. Documentos de centenas de páginas foram disponibilizados em cima da hora, impedindo auditorias independentes da oposição.",
    fonteNome: "Globo Esporte - Votação SAF",
    fonteUrl: "https://ge.globo.com/futebol/times/atletico-mg/",
  },
  {
    id: 9,
    titulo: "9. O Abandono do Futebol Feminino",
    link: "#feminino",
    conteudo:
      "No discurso, a SAF traria modernização geral. Na realidade, o futebol feminino do Galo foi tratado com total descaso e desinvestimento, recebendo o mínimo apenas para cumprir regulamentos obrigatórios da CBF.",
    fonteNome: "Trivela - Futebol Feminino",
    fonteUrl: "https://trivela.com.br/brasil/atletico-mineiro/",
  },
  {
    id: 10,
    titulo: "10. Descaso com as Categorias de Base",
    link: "#base",
    conteudo:
      "Enquanto rivais faturam centenas de milhões revelando craques, a base do Atlético segue em segundo plano. Poucos sobem para o profissional com espaço real, e as melhorias prometidas para a estrutura da base não acompanham o padrão vendido.",
    fonteNome: "No Ataque",
    fonteUrl: "https://noataque.com.br/futebol/time/atletico-mg/",
  },
  {
    id: 11,
    titulo: "11. A Ilusão do 'Dinheiro Novo'",
    link: "#dinheironovo",
    conteudo:
      "Venderam a ideia de que a SAF traria caminhões de 'dinheiro novo' para contratações de peso. A realidade mostrou que o aporte foi fatiado ao longo dos anos e grande parte foi consumida pela própria operação da dívida, deixando o futebol com o orçamento estrangulado.",
    fonteNome: "Balanço Financeiro SAF",
    fonteUrl: "",
  },
];

// Data de início da SAF
const dataInicio = new Date("2023-07-20T00:00:00Z");
// Data de contratação do técnico atual
const dataInicioTecnico = new Date("2026-02-24T00:00:00Z");

app.get("/api/materias", (req, res) => {
  res.json(materias);
});

app.get("/api/contador", (req, res) => {
  const hoje = new Date();
  const diffTime = hoje - dataInicio;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const diffTimeTecnico = hoje - dataInicioTecnico;
  const diffDaysTecnico = Math.floor(diffTimeTecnico / (1000 * 60 * 60 * 24));

  res.json({
    dias: diffDays,
    mentiras: materias.length,
    diasTecnico: diffDaysTecnico,
  });
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "galodopovo13@gmail.com",
    pass: process.env.EMAIL_PASSWORD, // Deixe assim para manter a segurança!
  },
});

app.post("/api/sugestoes", async (req, res) => {
  const { nome, email, mensagem } = req.body;

  // No mailOptions, atualize também o remetente e destinatário
  const mailOptions = {
    from: "Galo do Povo <galodopovo13@gmail.com>",
    to: "galodopovo13@gmail.com", // Se quiser receber no mesmo e-mail
    subject: "⚠️ NOVA DENÚNCIA: Galo do Povo",
    text: `Nome: ${nome}\nE-mail de contato: ${email}\n\nMensagem:\n${mensagem}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("E-mail enviado com sucesso!");
    res.json({
      success: true,
      message: "Denúncia recebida! O e-mail já chegou para o administrador.",
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    res
      .status(500)
      .json({ success: false, message: "Erro ao processar envio." });
  }
});
const port = 4000;
app.listen(port, () => console.log(`Backend rodando na porta ${port}`));
