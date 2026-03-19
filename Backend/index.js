require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// SEU BANCO DE DADOS MANUAL (Atualize os valores aqui)
// ----------------------------------------------------
let dadosContador = {
  dias: 1000, // Exemplo de dias
  mentiras: 13, // Exemplo de promessas quebradas
  diasTecnico: 120, // Exemplo de dias do técnico
  valorArrecadado: 250, // <--- ATUALIZE AQUI QUANDO RECEBER OS PIX!
};

const materias = [
  // Suas matérias continuam aqui. Exemplo:
  {
    id: 1,
    titulo: "A Mentira da Dívida",
    conteudo:
      "Prometeram zerar a dívida com a venda do Diamond, mas a dívida só aumentou...",
    link: "#divida",
    fonteNome: "Ge.globo",
    fonteUrl: "https://ge.globo.com",
  },
];

// Rotas da API
app.get("/api/contador", (req, res) => {
  res.json(dadosContador);
});

app.get("/api/materias", (req, res) => {
  res.json(materias);
});

// Configuração do E-mail (Com IP direto para evitar erro de rede)
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
    console.log("✅ E-mail enviado com sucesso!");
    return res
      .status(200)
      .json({ success: true, message: "Recebido! A Massa agradece." });
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail:", error);
    return res
      .status(500)
      .json({ success: false, message: "Erro ao enviar. Tente novamente." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
