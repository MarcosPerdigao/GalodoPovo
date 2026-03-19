require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const Parser = require("rss-parser");
const cron = require("node-cron");
const mongoose = require("mongoose"); // A ferramenta do banco de dados

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// 📦 CONEXÃO COM O COFRE DA MASSA (MONGODB)
// ----------------------------------------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("📦 Cofre da Massa (MongoDB) Conectado com Sucesso!"))
  .catch((err) => console.error("❌ Erro ao conectar no Cofre:", err));

// Cria o "Molde" de como uma matéria deve ser salva no banco
const materiaSchema = new mongoose.Schema({
  titulo: String,
  conteudo: String,
  link: String,
  fonteNome: String,
  fonteUrl: String,
  dataCriacao: { type: Date, default: Date.now }, // Guarda a data exata que o Pulguinha achou
});

// Cria a tabela "Materia" no banco
const Materia = mongoose.model("Materia", materiaSchema);

// O Contador continua na memória por enquanto para ser fácil de você editar
let dadosContador = {
  dias: 1000,
  mentiras: 13,
  diasTecnico: 120,
  valorArrecadado: 250,
};

// ----------------------------------------------------
// O ROBÔ "VIGIA DA MASSA" (Bot de Notícias)
// ----------------------------------------------------
const parser = new Parser({
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  },
});

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
];

async function buscarNoticiasAutomaticas() {
  console.log("🤖 Pulguinha Historiador: Buscando notícias...");
  let contadorNovas = 0;

  for (const fonte of fontesRSS) {
    try {
      const feed = await parser.parseURL(fonte.url);
      const ultimasNoticias = feed.items.slice(0, 10);

      for (const item of ultimasNoticias) {
        const textoOriginal = (
          item.title +
          " " +
          (item.contentSnippet || "")
        ).toLowerCase();
        const textoSemAcento = textoOriginal
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

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
        const temPalavraChave = palavrasChave.some((palavra) =>
          textoSemAcento.includes(palavra),
        );

        if (temPalavraChave) {
          // 🔎 PROCURA NO BANCO DE DADOS: Já temos essa matéria?
          const existe = await Materia.findOne({ titulo: item.title });

          if (!existe) {
            // 💾 SALVA NO BANCO DE DADOS
            await Materia.create({
              titulo: item.title,
              conteudo: item.contentSnippet
                ? item.contentSnippet.substring(0, 180) + "..."
                : "Confira a matéria completa no link abaixo.",
              link: "#",
              fonteNome: "Pulguinha (Bot)",
              fonteUrl: item.link,
            });
            contadorNovas++;
          }
        }
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar de ${fonte.nome}:`, error.message);
    }
  }

  if (contadorNovas > 0) {
    console.log(
      `✅ ${contadorNovas} novas matérias guardadas no cofre eterno!`,
    );
  } else {
    console.log("Nada de novo no radar da SAF.");
  }
}

// Configura o relógio para rodar o Bot a cada 1 hora
cron.schedule("0 * * * *", () => {
  buscarNoticiasAutomaticas();
});
// Roda o bot uma vez assim que o servidor liga
buscarNoticiasAutomaticas();

// ----------------------------------------------------
// ROTAS DA API
// ----------------------------------------------------
app.get("/api/contador", (req, res) => {
  res.json(dadosContador);
});

app.get("/api/materias", async (req, res) => {
  try {
    // Busca as matérias do banco, da mais nova pra mais velha (limite de 100 para não travar o celular do usuário)
    const listaMaterias = await Materia.find()
      .sort({ dataCriacao: -1 })
      .limit(100);
    res.json(listaMaterias);
  } catch (error) {
    console.error("Erro ao buscar matérias:", error);
    res.status(500).json([]);
  }
});

// Configuração do E-mail
const transporter = nodemailer.createTransport({
  host: "74.125.193.108",
  port: 587,
  secure: false,
  auth: {
    user: "galodopovo13@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    servername: "smtp.gmail.com",
    rejectUnauthorized: false,
  },
});

app.post("/api/sugestoes", async (req, res) => {
  const { nome, email, mensagem } = req.body;
  const mailOptions = {
    from: "galodopovo13@gmail.com",
    to: "galodopovo13@gmail.com",
    subject: "⚠️ DOSSIÊ OU COMPROVANTE: Galo do Povo",
    text: `Nome: ${nome}\nE-mail: ${email}\n\nMensagem / Link do Comprovante:\n${mensagem}`,
  };
  try {
    await transporter.sendMail(mailOptions);
    return res
      .status(200)
      .json({ success: true, message: "Recebido! A Massa agradece." });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Erro ao enviar. Tente novamente." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
