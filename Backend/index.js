require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const Parser = require("rss-parser");
const cron = require("node-cron");
const mongoose = require("mongoose"); // Banco de dados

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// 📦 CONEXÃO COM O MONGODB (O COFRE ETERNO)
// ----------------------------------------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("📦 Conectado ao MongoDB! O dossiê agora é eterno."))
  .catch((err) => console.error("❌ Erro ao conectar no banco:", err));

// Molde da notícia no banco
const materiaSchema = new mongoose.Schema({
  titulo: String,
  conteudo: String,
  link: String,
  fonteNome: String,
  fonteUrl: String,
  dataCriacao: { type: Date, default: Date.now }, // DATA E HORA DA CAPTURA
});

const Materia = mongoose.model("Materia", materiaSchema);

// ----------------------------------------------------
// 🤖 PULGUINHA: BUSCA E SALVA NO BANCO
// ----------------------------------------------------
const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0" },
});

// LISTA DE FONTES DO PULGUINHA
const fontesRSS = [
  {
    nome: "GE.globo",
    url: "https://ge.globo.com/rss/futebol/times/atletico-mg/",
  },
  { nome: "FalaGalo", url: "https://falagalo.com.br/feed/" },
  {
    nome: "Google News",
    url: "https://news.google.com/rss/search?q=atletico+mg+saf&hl=pt-BR&gl=BR&ceid=BR:pt-419",
  },
  {
    nome: "No Ataque",
    url: "https://noataque.com.br/clubes/atletico-mg/feed/",
  },
  { nome: "Trivela", url: "https://trivela.com.br/feed/" },
  { nome: "O Tempo", url: "https://www.otempo.com.br/rss/sports" },
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
        const palavrasChave = [
          "saf",
          "menin",
          "divida",
          "atletico",
          "galo",
          "arena mrv",
          "bracks",
          "milhoes",
        ];

        if (palavrasChave.some((p) => textoParaVerificar.includes(p))) {
          // VERIFICA SE JÁ EXISTE NO BANCO (para não duplicar)
          const existe = await Materia.findOne({ titulo: item.title });

          if (!existe) {
            await Materia.create({
              titulo: item.title,
              conteudo: item.contentSnippet
                ? item.contentSnippet.substring(0, 200) + "..."
                : "Clique no link para ler.",
              link: "#",
              fonteNome: "Pulguinha (Bot)",
              fonteUrl: item.link,
            });
            console.log(`✅ Nova matéria salva: ${item.title}`);
          }
        }
      }
    } catch (err) {
      console.log(`❌ Erro na fonte ${fonte.nome}:`, err.message);
    }
  }
}

// Roda a cada 1 hora
cron.schedule("0 * * * *", buscarNoticiasAutomaticas);
// Roda uma vez ao ligar o servidor
buscarNoticiasAutomaticas();

// ----------------------------------------------------
// 🛣️ ROTAS DA API
// ----------------------------------------------------

app.get("/api/contador", (req, res) => {
  const hoje = new Date();

  // 1. CÁLCULO AUTOMÁTICO DOS DIAS DA SAF (Início oficial: 01/11/2023)
  const dataInicioSAF = new Date("2023-11-01T00:00:00-03:00");
  const diffSAF = Math.abs(hoje - dataInicioSAF);
  const diasSAF = Math.floor(diffSAF / (1000 * 60 * 60 * 24));

  // 2. CÁLCULO AUTOMÁTICO DO TÉCNICO (Contratação: 24/02/2026)
  const dataInicioTecnico = new Date("2026-02-24T00:00:00-03:00");
  const diffTecnico = Math.abs(hoje - dataInicioTecnico);
  const diasTecnico = Math.floor(diffTecnico / (1000 * 60 * 60 * 24));

  // 3. PROMESSAS QUEBRADAS (Altere este número quando quiser)
  const totalPromessasQuebradas = 27;

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

// Envio de e-mail (Denúncias e Vazamentos)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: "galodopovo13@gmail.com", pass: process.env.EMAIL_PASSWORD },
});

app.post("/api/sugestoes", async (req, res) => {
  // Agora recebemos a "midia" também
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
