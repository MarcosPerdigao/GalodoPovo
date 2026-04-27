require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const Parser = require("rss-parser");
const cron = require("node-cron");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// 📦 CONEXÃO COM O MONGODB
// ----------------------------------------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("📦 Conectado ao MongoDB! O dossiê agora é eterno."))
  .catch((err) => console.error("❌ Erro ao conectar no banco:", err));

const materiaSchema = new mongoose.Schema({
  titulo: String,
  conteudo: String,
  link: String,
  fonteNome: String,
  fonteUrl: String,
  dataCriacao: { type: Date, default: Date.now },
});

const Materia = mongoose.model("Materia", materiaSchema);

// ----------------------------------------------------
// 🤖 PULGUINHA: BUSCA COM DUPLA VERIFICAÇÃO (CRUZAMENTO)
// ----------------------------------------------------
const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0" },
});

const fontesRSS = [
  {
    nome: "GE.globo",
    url: "https://ge.globo.com/rss/futebol/times/atletico-mg/",
  },
  { nome: "FalaGalo", url: "https://falagalo.com.br/feed/" },
  {
    nome: "No Ataque",
    url: "https://noataque.com.br/clubes/atletico-mg/feed/",
  },
  { nome: "Trivela", url: "https://trivela.com.br/feed/" },
  { nome: "O Tempo", url: "https://www.otempo.com.br/rss/sports" },
  {
    nome: "Itatiaia",
    url: "https://news.google.com/rss/search?q=atletico+saf+site:itatiaia.com.br&hl=pt-BR&gl=BR&ceid=BR:pt-419",
  },
  {
    nome: "Google News Geral",
    url: "https://news.google.com/rss/search?q=atletico+mg+saf&hl=pt-BR&gl=BR&ceid=BR:pt-419",
  },
];

async function buscarNoticiasAutomaticas() {
  console.log("🤖 Pulguinha em campo buscando notícias...");

  for (const fonte of fontesRSS) {
    try {
      const feed = await parser.parseURL(fonte.url);
      for (const item of feed.items.slice(0, 10)) {
        const textoParaVerificar = (
          item.title +
          " " +
          (item.contentSnippet || "")
        ).toLowerCase();

        // 1. FILTRO DE CONTEXTO: O texto fala do nosso universo?
        const termosClube = [
          "galo",
          "atlético",
          "atletico",
          "saf",
          "arena mrv",
        ];
        const temContextoClube = termosClube.some((t) =>
          textoParaVerificar.includes(t),
        );

        // 2. FILTRO DE ALVOS: O texto cita os investigados ou problemas graves?
        const alvosDossie = [
          "rubens menin",
          "rafael menin",
          "thiago maia",
          "daniel vorcaro",
          "pedro daniel",
          "divida",
          "dívida",
          "bracks",
          "juros",
          "nota 0",
          "frossard",
          "saf", // SAF entra aqui também como alvo direto
        ];
        const temAlvoDossie = alvosDossie.some((t) =>
          textoParaVerificar.includes(t),
        );

        // ⚔️ CRUZAMENTO DE DADOS: Só passa se tiver Contexto + Alvo
        if (temContextoClube && temAlvoDossie) {
          const existe = await Materia.findOne({ titulo: item.title });

          if (!existe) {
            await Materia.create({
              titulo: item.title,
              conteudo: item.contentSnippet
                ? item.contentSnippet.substring(0, 200) + "..."
                : "Clique no link para ler a denúncia completa.",
              link: "#",
              fonteNome: "Pulguinha (Bot)",
              fonteUrl: item.link,
            });
            console.log(`✅ [ALVO CONFIRMADO] Matéria salva: ${item.title}`);
          }
        }
      }
    } catch (err) {
      console.log(`❌ Erro na fonte ${fonte.nome}:`, err.message);
    }
  }
}

cron.schedule("0 * * * *", buscarNoticiasAutomaticas);
buscarNoticiasAutomaticas();

// ----------------------------------------------------
// 🛣️ ROTAS DA API
// ----------------------------------------------------
app.get("/api/contador", (req, res) => {
  const hoje = new Date();

  const dataInicioSAF = new Date("2023-11-01T00:00:00-03:00");
  const diffSAF = Math.abs(hoje - dataInicioSAF);
  const diasSAF = Math.floor(diffSAF / (1000 * 60 * 60 * 24));

  const dataInicioTecnico = new Date("2026-02-24T00:00:00-03:00");
  const diffTecnico = Math.abs(hoje - dataInicioTecnico);
  const diasTecnico = Math.floor(diffTecnico / (1000 * 60 * 60 * 24));

  const totalPromessasQuebradas = 10; // Atualizado para bater com as 10 críticas do front

  res.json({
    dias: diasSAF,
    mentiras: totalPromessasQuebradas,
    diasTecnico: diasTecnico,
  });
});

app.get("/api/materias", async (req, res) => {
  try {
    const lista = await Materia.find().sort({ dataCriacao: -1 }).limit(100);
    res.json(lista);
  } catch (err) {
    res.status(500).json([]);
  }
});

// ----------------------------------------------------
// 🚨 ROTA DE E-MAIL (CENTRAL DE VAZAMENTOS)
// ----------------------------------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: "galodopovo13@gmail.com", pass: process.env.EMAIL_PASSWORD },
});

app.post("/api/sugestoes", async (req, res) => {
  const { nome, email, mensagem, midia } = req.body;

  const mailOptions = {
    from: "galodopovo13@gmail.com",
    to: "galodopovo13@gmail.com",
    subject: "🚨 NOVA DENÚNCIA/VAZAMENTO - Galo do Povo",
    text: `🕵️‍♂️ Nome: ${nome || "Anônimo"}\n📧 E-mail: ${email || "Não informado"}\n\n📝 Relato da Denúncia:\n${mensagem}\n\n📎 Link ou Mídia:\n${midia || "Nenhum link enviado"}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    console.error("Erro no envio do e-mail:", err);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend ON na porta ${PORT}`));
