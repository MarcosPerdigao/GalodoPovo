require('dotenv').config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const Parser = require("rss-parser"); // <-- O Bot Leitor
const cron = require("node-cron");    // <-- O Relógio

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// SEU BANCO DE DADOS MANUAL E AUTOMÁTICO
// ----------------------------------------------------
let dadosContador = {
  dias: 1000, 
  mentiras: 13, 
  diasTecnico: 120, 
  valorArrecadado: 250 
};

// Aqui ficam as suas matérias manuais (se quiser adicionar alguma fixa) e as automáticas vão entrar aqui também
let materias = [
  {
    id: 1,
    titulo: "A Mentira da Dívida",
    conteudo: "Prometeram zerar a dívida com a venda do Diamond, mas a dívida só aumentou...",
    link: "#divida",
    fonteNome: "Dossiê da Massa",
    fonteUrl: ""
  }
];

// ----------------------------------------------------
// O ROBÔ "VIGIA DA MASSA" (Bot de Notícias)
// ----------------------------------------------------
const parser = new Parser();

// Links RSS dos portais escolhidos
const fontesRSS = [
  { nome: "GE.globo", url: "https://ge.globo.com/rss/futebol/times/atletico-mg/" },
  { nome: "FalaGalo", url: "https://falagalo.com.br/feed/" },
  // Nota: Alguns sites como Itatiaia e O Tempo mudam o link do RSS constantemente, 
  // esses abaixo são os padrões usados por sites de notícias.
  { nome: "O Tempo", url: "https://www.otempo.com.br/rss/superfc/atletico" }
];

async function buscarNoticiasAutomaticas() {
  console.log("🤖 Vigia da Massa: Buscando novas notícias...");
  
  let novasMaterias = [];

  for (const fonte of fontesRSS) {
    try {
      const feed = await parser.parseURL(fonte.url);
      
      // Pega apenas as 2 últimas notícias de cada site para não poluir demais
      const ultimasNoticias = feed.items.slice(0, 2); 

      ultimasNoticias.forEach(item => {
        // Filtro básico de palavras-chave para focar no que importa
        const texto = (item.title + " " + (item.contentSnippet || "")).toLowerCase();
        
        // Só adiciona se falar de Galo, SAF, Menin, etc (Evita notícias de outros times)
        if (texto.includes('saf') || texto.includes('menin') || texto.includes('dívida') || texto.includes('atlético') || texto.includes('galo')) {
          
          // Verifica se a matéria já não está na nossa lista para não duplicar
          const jaExiste = materias.some(m => m.titulo === item.title);
          
          if (!jaExiste) {
            novasMaterias.push({
              id: Date.now() + Math.random(), // Gera um ID único
              titulo: item.title,
              conteudo: item.contentSnippet ? item.contentSnippet.substring(0, 150) + "..." : "Confira a matéria completa no link abaixo.",
              link: "#",
              fonteNome: fonte.nome,
              fonteUrl: item.link
            });
          }
        }
      });
    } catch (error) {
      console.log(`❌ Erro ao buscar notícias de ${fonte.nome}:`, error.message);
    }
  }

  if (novasMaterias.length > 0) {
    // Adiciona as novas matérias no topo da lista
    materias = [...novasMaterias, ...materias];
    console.log(`✅ ${novasMaterias.length} novas matérias adicionadas ao Dossiê!`);
  } else {
    console.log("Nada de novo no radar da SAF.");
  }
}

// Configura o relógio para rodar o Bot a cada 1 hora (minuto 0)
cron.schedule('0 * * * *', () => {
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

app.get("/api/materias", (req, res) => {
  res.json(materias);
});

// Configuração do E-mail
const transporter = nodemailer.createTransport({
  host: '74.125.193.108', 
  port: 587,
  secure: false,
  auth: {
    user: "galodopovo13@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    servername: 'smtp.gmail.com',
    rejectUnauthorized: false
  }
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
    return res.status(200).json({ success: true, message: "Recebido! A Massa agradece." });
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail:", error);
    return res.status(500).json({ success: false, message: "Erro ao enviar. Tente novamente." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});