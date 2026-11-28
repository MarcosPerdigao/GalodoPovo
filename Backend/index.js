require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const Parser = require("rss-parser");
const cron = require("node-cron");
const mongoose = require("mongoose");
const { normalizarUrl } = require("./lib/urlUtils");
const { createGameRouter, sameHash, hash } = require("./lib/game");

const { finanças, COACH, linhaPublica, noticiasRevisadas, promessaPublica, diasCalendario, dataPublicada, noticiasPublicas, resumoSemanal } = require("./lib/editorial");

const app = express();

const RSS_TIMEOUT_PADRAO_MS = 15000;
const RSS_TIMEOUT_MIN_MS = 3000;
const RSS_TIMEOUT_MAX_MS = 60000;

function limitarNumero(valor, minimo, maximo) {
  return Math.min(Math.max(valor, minimo), maximo);
}

function validarConfiguracoes() {
  const erros = [];
  const avisos = [];
  const ambienteProducao = process.env.NODE_ENV === "production";

  if (!String(process.env.MONGODB_URI || "").trim()) {
    erros.push("MONGODB_URI");
  }

  if (ambienteProducao && !String(process.env.ADMIN_TOKEN || "").trim()) {
    erros.push("ADMIN_TOKEN");
  }

  if (ambienteProducao && !String(process.env.ALLOWED_ORIGINS || "").trim()) {
    avisos.push("ALLOWED_ORIGINS ausente em producao");
  }

  let rssTimeoutMs = RSS_TIMEOUT_PADRAO_MS;
  const rssTimeoutRaw = String(process.env.RSS_TIMEOUT_MS || "").trim();

  if (rssTimeoutRaw) {
    const rssTimeoutInformado = Number(rssTimeoutRaw);

    if (
      Number.isInteger(rssTimeoutInformado) &&
      Number.isFinite(rssTimeoutInformado)
    ) {
      rssTimeoutMs = limitarNumero(
        rssTimeoutInformado,
        RSS_TIMEOUT_MIN_MS,
        RSS_TIMEOUT_MAX_MS,
      );
    } else {
      avisos.push("RSS_TIMEOUT_MS invalido; usando valor padrao");
    }
  }

  for (const aviso of avisos) {
    console.warn(`[config] Aviso: ${aviso}.`);
  }

  if (erros.length > 0) {
    for (const nomeVariavel of erros) {
      console.error(`[config] Erro critico: ${nomeVariavel} ausente.`);
    }

    throw new Error("Configuracao critica ausente");
  }

  return {
    rssTimeoutMs,
  };
}

function carregarConfiguracoesOuEncerrar() {
  try {
    return validarConfiguracoes();
  } catch (err) {
    process.exitCode = 1;
    process.exit(1);
  }
}

const configuracoes = carregarConfiguracoesOuEncerrar();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if ((allowedOrigins.length ? allowedOrigins : ["https://www.galodopovo.com.br", "https://galodopovo.com.br", ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000", "http://127.0.0.1:4175"])]).includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origem não permitida pelo CORS"));
    },
  }),
);

app.use(express.json({ limit: "20kb" }));

function requireAdmin(req, res, next) {
  const chaveRecebida = String(req.headers["x-admin-key"] || "").trim();
  const chaveEsperada = String(process.env.ADMIN_TOKEN || "").trim();

  if (!chaveEsperada) {
    return res.status(500).json({
      success: false,
      message: "ADMIN_TOKEN não configurado no servidor.",
    });
  }

  if (!chaveRecebida || !sameHash(hash(chaveRecebida), hash(chaveEsperada))) {
    return res.status(401).json({
      success: false,
      message: "Acesso administrativo não autorizado.",
    });
  }

  next();
}

app.use("/api/game", createGameRouter({ mongoose, requireAdmin }));

const materiaSchema = new mongoose.Schema({
  titulo: { type: String, required: true, trim: true },
  conteudo: { type: String, default: "" },
  link: { type: String, default: "#" },
  fonteNome: { type: String, default: "Pulguinha (Bot)" },
  fonteUrl: { type: String, required: true, unique: true, trim: true },
  dataCriacao: { type: Date, default: Date.now },
  dataPublicacao: { type: Date, default: null },
});

materiaSchema.index({ fonteUrl: 1 }, { unique: true });
materiaSchema.index({ dataCriacao: -1 });
materiaSchema.index({ dataPublicacao: -1 });

const Materia = mongoose.model("Materia", materiaSchema);

const votoTermometroSchema = new mongoose.Schema({
  itemTipo: { type: String, required: true, trim: true },
  itemId: { type: String, required: true, trim: true },
  voto: {
    type: String,
    required: true,
    enum: ["cobrar_agora", "importa_muito", "nao_prioridade"],
  },
  sessionId: { type: String, required: true, trim: true },
  dataCriacao: { type: Date, default: Date.now },
  dataAtualizacao: { type: Date, default: Date.now },
});

votoTermometroSchema.index(
  { itemTipo: 1, itemId: 1, sessionId: 1 },
  { unique: true },
);

const VotoTermometro = mongoose.model("VotoTermometro", votoTermometroSchema);
const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0" },
  timeout: configuracoes.rssTimeoutMs,
});

let coletaEmAndamento = false;
let inicioColetaAtual = null;
let ultimaColetaInicio = null;
let ultimaColetaFim = null;
let ultimoResumoColeta = null;

const tecnicoSchema = new mongoose.Schema(
  {
    chave: { type: String, required: true, unique: true, trim: true },
    nome: { type: String, required: true, trim: true },
    dataInicio: { type: Date, required: true },
    dataFim: { type: Date, default: null },
    motivo: { type: String, default: "Demissão", trim: true },
    emCargo: { type: Boolean, default: false },
    ordem: { type: Number, default: 0 },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

tecnicoSchema.index({ chave: 1 }, { unique: true });
tecnicoSchema.index({ ativo: 1, ordem: 1 });
tecnicoSchema.index({ emCargo: 1 });

const Tecnico = mongoose.model("Tecnico", tecnicoSchema);

const linhaDoTempoSchema = new mongoose.Schema(
  {
    chave: { type: String, required: true, unique: true, trim: true },
    data: { type: String, required: true, trim: true },
    titulo: { type: String, required: true, trim: true },
    desc: { type: String, required: true, trim: true },
    ordem: { type: Number, default: 0 },
    ativo: { type: Boolean, default: true },
  },
  { timestamps: true },
);

linhaDoTempoSchema.index({ chave: 1 }, { unique: true });
linhaDoTempoSchema.index({ ativo: 1, ordem: 1 });

const LinhaDoTempo = mongoose.model("LinhaDoTempo", linhaDoTempoSchema);

const promessaSchema = new mongoose.Schema(
  {
    chave: { type: String, required: true, unique: true, trim: true },
    titulo: { type: String, required: true, trim: true },
    status: { type: String, default: "Sob cobrança", trim: true },
    resumo: { type: String, default: "", trim: true },
    situacao: { type: String, default: "", trim: true },
    destaqueHome: { type: Boolean, default: false },
    ordem: { type: Number, default: 0 },
    ativa: { type: Boolean, default: true },
  },
  { timestamps: true },
);

promessaSchema.index({ chave: 1 }, { unique: true });
promessaSchema.index({ destaqueHome: 1, ordem: 1 });
promessaSchema.index({ ativa: 1, ordem: 1 });

const Promessa = mongoose.model("Promessa", promessaSchema);

const fontesRSS = [
  // Em 28/11/2026 os feeds diretos do Atlético, GE e FalaGalo responderam
  // 403, 400 e 404. Mantemos a fonte agregadora verificada, sem contornar bloqueios.
  {
    nome: "Google News",
    url: "https://news.google.com/rss/search?q=atletico+mg+saf&hl=pt-BR&gl=BR&ceid=BR:pt-419",
  },
];

const TECNICOS_SEED = [
  {
    chave: "felipao",
    nome: "Luiz Felipe Scolari (Felipão)",
    dataInicio: new Date("2023-06-16T00:00:00-03:00"),
    dataFim: new Date("2024-03-20T00:00:00-03:00"),
    motivo: "Demissão",
    emCargo: false,
    ordem: 1,
    ativo: true,
  },
  {
    chave: "milito",
    nome: "Gabriel Milito",
    dataInicio: new Date("2024-03-24T00:00:00-03:00"),
    dataFim: new Date("2024-12-04T00:00:00-03:00"),
    motivo: "Demissão",
    emCargo: false,
    ordem: 2,
    ativo: true,
  },
  {
    chave: "cuca",
    nome: "Cuca",
    dataInicio: new Date("2024-12-29T00:00:00-03:00"),
    dataFim: new Date("2025-08-29T00:00:00-03:00"),
    motivo: "Demissão",
    emCargo: false,
    ordem: 3,
    ativo: true,
  },
  {
    chave: "sampaoli",
    nome: "Jorge Sampaoli",
    dataInicio: new Date("2025-09-02T00:00:00-03:00"),
    dataFim: new Date("2026-02-12T00:00:00-03:00"),
    motivo: "Demissão",
    emCargo: false,
    ordem: 4,
    ativo: true,
  },
  {
    chave: "eduardo_dominguez",
    nome: "Eduardo Domínguez",
    dataInicio: new Date("2026-02-24T00:00:00-03:00"),
    dataFim: null,
    motivo: "Em cargo",
    emCargo: true,
    ordem: 5,
    ativo: true,
  },
];

const LINHA_DO_TEMPO_SEED = [
  {
    chave: "aprovacao_saf",
    data: "Julho / 2023",
    titulo: "Aprovação da SAF",
    desc: "Venda de 75% do clube aprovada. Promessa de quitação das dívidas onerosas.",
    ordem: 1,
    ativo: true,
  },
  {
    chave: "oficializacao_saf",
    data: "Novembro / 2023",
    titulo: "Oficialização da SAF",
    desc: "A SAF passa a comandar oficialmente o clube. Começa o 'relógio' da gestão.",
    ordem: 2,
    ativo: true,
  },
  {
    chave: "fracasso_esportivo_2024",
    data: "Dezembro / 2024",
    titulo: "Fracasso esportivo",
    desc: "Após um ano de altos e baixos, perda das finais da Copa do Brasil e Libertadores e forte desgaste esportivo.",
    ordem: 3,
    ativo: true,
  },
  {
    chave: "atrasos_protestos_2025",
    data: "Ano de 2025",
    titulo: "Atrasos e protestos",
    desc: "Elenco sofre com atrasos salariais e de imagem. Trocas sucessivas de técnicos e ambiente de instabilidade.",
    ordem: 4,
    ativo: true,
  },
  {
    chave: "queda_sampaoli",
    data: "Fevereiro / 2026",
    titulo: "Queda de Sampaoli",
    desc: "Segunda passagem do técnico termina de forma abrupta, reforçando a crítica sobre falta de planejamento.",
    ordem: 5,
    ativo: true,
  },
  {
    chave: "estopim_massa",
    data: "Abril / 2026",
    titulo: "Estopim da Massa",
    desc: "Goleada para o Flamengo, protestos contra a SAF e campanha #SAFNota0!.",
    ordem: 6,
    ativo: true,
  },
];

async function garantirSeedLinhaDoTempo() {
  const total = await LinhaDoTempo.countDocuments();

  if (total === 0) {
    await LinhaDoTempo.insertMany(LINHA_DO_TEMPO_SEED);
    console.log("🌱 Seed inicial da linha do tempo criada.");
  }
}

async function garantirSeedTecnicos() {
  const total = await Tecnico.countDocuments();

  if (total === 0) {
    await Tecnico.insertMany(TECNICOS_SEED);
    console.log("🌱 Seed inicial de técnicos criada.");
  }
}

const PROMESSAS_SEED = [
  {
    chave: "sanear_dividas",
    titulo: "Assumir e sanear 100% das dívidas do clube",
    status: "Descumprida",
    resumo:
      "A dívida segue em patamar bilionário e os juros continuam consumindo parte relevante das receitas.",
    situacao:
      "A promessa era que a SAF assumiria o passivo. Porém, em abril de 2026, a dívida ainda gira em torno de R$ 1,7 bilhão, sendo R$ 1 bilhão apenas em dívidas bancárias onerosas.",
    destaqueHome: true,
    ordem: 1,
    ativa: true,
  },
  {
    chave: "acabar_com_juros",
    titulo: "Acabar com os juros que 'comiam' o Atlético",
    status: "Descumprida",
    resumo:
      "O passivo oneroso segue no centro do debate e o clube ainda convive com forte pressão financeira.",
    situacao:
      "Na realidade, a gestão financeira admite que o clube ainda paga cerca de R$ 250 milhões por ano somente em juros, fazendo a dívida crescer mesmo com recorde de arrecadação.",
    destaqueHome: true,
    ordem: 2,
    ativa: true,
  },
  {
    chave: "clube_autossustentavel",
    titulo: "Transformar o Galo em um clube autossustentável",
    status: "Parcial",
    resumo:
      "A promessa de equilíbrio estrutural ainda não se confirmou, e a sustentabilidade financeira segue em disputa.",
    situacao:
      "Pedro Daniel admitiu em 2026 que o clube ainda não está sanado. O endividamento segue alto e as receitas são engolidas pelos juros.",
    destaqueHome: true,
    ordem: 3,
    ativa: true,
  },
  {
    chave: "aporte_500_milhoes",
    titulo: "Aporte rápido de R$ 500 milhões para tranquilidade",
    status: "Sob cobrança",
    resumo:
      "O aporte existiu, mas não se traduziu na tranquilidade prometida para o futebol.",
    situacao:
      "Foi prometido que o dinheiro daria 'tranquilidade ao futebol'. O aporte ocorreu, mas a tranquilidade nunca chegou, refletindo-se em instabilidade contínua.",
    destaqueHome: false,
    ordem: 4,
    ativa: true,
  },
  {
    chave: "time_primeira_prateleira",
    titulo: "Time competitivo na 'Primeira Prateleira' do Brasil",
    status: "Sob cobrança",
    resumo:
      "Oscilações esportivas, trocas de comando e falhas de planejamento mantêm a cobrança da Massa em alta.",
    situacao:
      "Promessa de rivalizar com Flamengo e Palmeiras. Na prática: falhas no elenco, perda das finais de 2024 e o time fora da Libertadores de 2025.",
    destaqueHome: true,
    ordem: 5,
    ativa: true,
  },
  {
    chave: "gestao_profissional",
    titulo: "Gestão profissional e planejamento a longo prazo",
    status: "Descumprida",
    resumo:
      "A rotatividade de técnicos e a falta de continuidade desgastaram o discurso de profissionalização.",
    situacao:
      "O discurso corporativo colidiu com a realidade: o Galo virou um 'moedor de técnicos', evidenciando falta de continuidade.",
    destaqueHome: false,
    ordem: 6,
    ativa: true,
  },
  {
    chave: "obrigacoes_em_dia",
    titulo: "Obrigações financeiras rigorosamente em dia",
    status: "Descumprida",
    resumo:
      "Atrasos e notificações colocaram em xeque a promessa de disciplina financeira.",
    situacao:
      "O ano de 2025 foi marcado por atrasos salariais, luvas pendentes, direitos de imagem atrasados e notificações extrajudiciais.",
    destaqueHome: false,
    ordem: 7,
    ativa: true,
  },
  {
    chave: "transparencia_governanca",
    titulo: "Transparência e governança como valores inegociáveis",
    status: "Sob cobrança",
    resumo:
      "A comunicação e a transparência seguem no centro da desconfiança da torcida.",
    situacao:
      "A gestão é ofuscada por crises de comunicação, dúvidas sobre o Fundo Galo Forte e falta de transparência sobre beneficiários.",
    destaqueHome: false,
    ordem: 8,
    ativa: true,
  },
  {
    chave: "parceiro_estrangeiro",
    titulo: "Buscar parceiro estrangeiro para fortalecer o projeto",
    status: "Descumprida",
    resumo:
      "O capital prometido de fora não se consolidou como narrativa real do projeto.",
    situacao:
      "Prometeram buscar capital internacional. No fim, o controle ficou restrito e centralizado nos próprios mecenas/credores locais.",
    destaqueHome: false,
    ordem: 9,
    ativa: true,
  },
  {
    chave: "reaproximar_massa",
    titulo: "Reaproximar a verdadeira Massa Atleticana",
    status: "Descumprida",
    resumo:
      "A percepção de elitização e distanciamento seguiu forte entre os torcedores.",
    situacao:
      "O distanciamento aumentou com ingressos caros, elitização da Arena e um 'Conselho da Massa' sem voz ativa.",
    destaqueHome: false,
    ordem: 10,
    ativa: true,
  },
];

async function garantirSeedPromessas() {
  const total = await Promessa.countDocuments();

  if (total === 0) {
    await Promessa.insertMany(PROMESSAS_SEED);
    console.log("🌱 Seed inicial de promessas criada.");
  }
}

function normalizarTexto(texto = "") {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function pontuarMateria(texto = "") {
  const base = normalizarTexto(texto);
  let pontos = 0;

  if (base.includes("atletico-mg")) pontos += 2;
  if (base.includes("atletico mg")) pontos += 2;
  if (base.includes("clube atletico mineiro")) pontos += 2;
  if (base.includes("galo")) pontos += 2;
  if (base.includes("saf")) pontos += 3;
  if (base.includes("menin")) pontos += 3;
  if (base.includes("arena mrv")) pontos += 2;
  if (base.includes("divida")) pontos += 2;
  if (base.includes("dividas")) pontos += 2;
  if (base.includes("bracks")) pontos += 1;
  if (base.includes("pedro daniel")) pontos += 2;
  if (base.includes("rubens menin")) pontos += 2;
  if (base.includes("rafael menin")) pontos += 2;

  return pontos;
}

function classificarTema(texto = "") {
  const base = normalizarTexto(texto);

  if (
    base.includes("divida") ||
    base.includes("dividas") ||
    base.includes("juros") ||
    base.includes("financeiro") ||
    base.includes("passivo") ||
    base.includes("receita")
  ) {
    return "Finanças";
  }

  if (
    base.includes("tecnico") ||
    base.includes("treinador") ||
    base.includes("elenco") ||
    base.includes("jogador") ||
    base.includes("futebol") ||
    base.includes("sampaoli") ||
    base.includes("cuca") ||
    base.includes("milito")
  ) {
    return "Futebol";
  }

  if (
    base.includes("governanca") ||
    base.includes("transparencia") ||
    base.includes("conselho") ||
    base.includes("gestao") ||
    base.includes("arena") ||
    base.includes("ingresso") ||
    base.includes("fundo")
  ) {
    return "Governança";
  }

  return "SAF";
}

function classificarImpacto(score = 0) {
  if (score >= 8) return "Alto impacto";
  if (score >= 5) return "Cobrança crescente";
  return "Monitoramento";
}

function resumirTexto(texto = "", titulo = "") {
  const base = String(texto || titulo || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!base) return "Sem resumo disponível.";
  if (base.length <= 150) return base;

  return `${base.slice(0, 147)}...`;
}

function formatarDataBR(data) {
  if (!data) return "Atual";

  return new Date(data).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

function calcularDiasEntre(inicio, fim = null) {
  return diasCalendario(inicio, fim || new Date());
}

function serializarTecnico(t) {
  return {
    nome: t.nome,
    periodo: `${formatarDataBR(t.dataInicio)} - ${t.emCargo ? "Atual" : formatarDataBR(t.dataFim)}`,
    motivo: t.chave === "sampaoli" ? "Encerramento do vínculo" : t.motivo,
    fonteUrl: t.chave === "eduardo_dominguez" ? COACH : t.chave === "sampaoli" ? "https://atletico.com.br/jorge-sampaoli-nao-e-mais-o-treinador-do-galo/" : null,
    dias: t.emCargo
      ? `${calcularDiasEntre(t.dataInicio)} dias`
      : `${calcularDiasEntre(t.dataInicio, t.dataFim)} dias`,
  };
}

function criarResumoColeta(origem) {
  return {
    origem,
    fontesProcessadas: 0,
    fontesComErro: 0,
    itensLidos: 0,
    ignoradosSemLink: 0,
    ignoradosPorScore: 0,
    duplicados: 0,
    salvos: 0,
    errosAoSalvar: 0,
    duracaoMs: 0,
  };
}

function mensagemErroSanitizada(err) {
  const mensagem = err && err.message ? err.message : "Erro externo sem detalhes";

  return mensagem.replace(
    /([a-z][a-z0-9+.-]*:\/\/)([^/@\s]+)@/gi,
    "$1[credenciais]@",
  );
}

async function carregarUrlsConhecidas() {
  const urlsConhecidas = new Set();
  const materiasExistentes = await Materia.find({}, { fonteUrl: 1, link: 1 })
    .lean();

  for (const materia of materiasExistentes) {
    const fonteUrlNormalizada = normalizarUrl(materia.fonteUrl);
    const linkNormalizado = normalizarUrl(materia.link);

    if (fonteUrlNormalizada) urlsConhecidas.add(fonteUrlNormalizada);
    if (linkNormalizado) urlsConhecidas.add(linkNormalizado);
  }

  return urlsConhecidas;
}

async function buscarNoticiasAutomaticas(origem = "manual") {
  const resumo = criarResumoColeta(origem);
  const inicio = Date.now();
  const urlsConhecidas = await carregarUrlsConhecidas();

  console.log(`[pulguinha] Coleta iniciada. origem=${origem}`);

  for (const fonte of fontesRSS) {
    try {
      const feed = await parser.parseURL(fonte.url);
      resumo.fontesProcessadas += 1;

      for (const item of (feed.items || []).slice(0, 10)) {
        resumo.itensLidos += 1;

        const linkNormalizado = normalizarUrl(item.link);
        if (!linkNormalizado) {
          resumo.ignoradosSemLink += 1;
          continue;
        }

        const textoParaVerificar = `${item.title || ""} ${item.contentSnippet || ""}`;
        const score = pontuarMateria(textoParaVerificar);

        if (score < 3) {
          resumo.ignoradosPorScore += 1;
          continue;
        }

        if (urlsConhecidas.has(linkNormalizado)) {
          const publicada = dataPublicada(item);
          if (publicada) {
            await Materia.updateOne({ fonteUrl: linkNormalizado, dataPublicacao: null }, { $set: { dataPublicacao: publicada } });
          }
          resumo.duplicados += 1;
          continue;
        }

        try {
          await Materia.create({
            titulo: item.title || "Sem título",
            conteudo: "Leia a reportagem completa na fonte.",
            dataPublicacao: dataPublicada(item),
            link: linkNormalizado,
            fonteNome: fonte.nome,
            fonteUrl: linkNormalizado,
          });

          urlsConhecidas.add(linkNormalizado);
          resumo.salvos += 1;
          console.log(`[pulguinha] Materia salva. fonte=${fonte.nome}`);
        } catch (err) {
          if (err && err.code === 11000) {
            urlsConhecidas.add(linkNormalizado);
            resumo.duplicados += 1;
          } else {
            resumo.errosAoSalvar += 1;
            console.error(
              `[pulguinha] Erro ao salvar materia. fonte=${fonte.nome}:`,
              mensagemErroSanitizada(err),
            );
          }
        }
      }
    } catch (err) {
      resumo.fontesComErro += 1;
      console.error(
        `[pulguinha] Erro na fonte. fonte=${fonte.nome}:`,
        mensagemErroSanitizada(err),
      );
    }
  }

  resumo.duracaoMs = Date.now() - inicio;
  console.log("[pulguinha] Resumo da coleta:", resumo);
  return resumo;
}

async function executarColetaProtegida(origem) {
  if (coletaEmAndamento) {
    console.log(`[pulguinha] Coleta ignorada por sobreposicao. origem=${origem}`);
    return null;
  }

  coletaEmAndamento = true;
  inicioColetaAtual = new Date();
  ultimaColetaInicio = inicioColetaAtual;

  try {
    const resumo = await buscarNoticiasAutomaticas(origem);
    ultimoResumoColeta = resumo;
    return resumo;
  } catch (err) {
    ultimoResumoColeta = {
      origem,
      erro: mensagemErroSanitizada(err),
    };
    console.error(
      "[pulguinha] Erro inesperado na coleta:",
      mensagemErroSanitizada(err),
    );
    return null;
  } finally {
    ultimaColetaFim = new Date();
    coletaEmAndamento = false;
    inicioColetaAtual = null;
  }
}

app.get("/api/health", (req, res) => {
  res.status(200).json({
    ok: true,
    service: "galo-do-povo-api",
    timestamp: new Date().toISOString(),
    mongo: {
      readyState: mongoose.connection.readyState,
      estado:
        mongoose.connection.readyState === 1 ? "conectado" : "nao_conectado",
    },
    pulguinha: {
      coletaEmAndamento,
      inicioColetaAtual: inicioColetaAtual
        ? inicioColetaAtual.toISOString()
        : null,
      ultimaColetaInicio: ultimaColetaInicio
        ? ultimaColetaInicio.toISOString()
        : null,
      ultimaColetaFim: ultimaColetaFim ? ultimaColetaFim.toISOString() : null,
      ultimoResumo: ultimoResumoColeta,
    },
  });
});

app.get("/api/contador", async (req, res) => {
  try {
    const hoje = new Date();

    const dataInicioSAF = new Date("2023-11-01T00:00:00-03:00");
    const diasSAF = diasCalendario(dataInicioSAF, hoje);

    const tecnicoAtual = await Tecnico.findOne({
      ativo: true,
      emCargo: true,
    }).lean();

    const diasTecnico = tecnicoAtual
      ? calcularDiasEntre(tecnicoAtual.dataInicio)
      : 0;

    const totalPromessasAcompanhadas = await Promessa.countDocuments({
      ativa: true,
    });

    res.json({
      dias: diasSAF,
      mentiras: totalPromessasAcompanhadas, // Compatibilidade com clientes antigos.
      promessasAcompanhadas: totalPromessasAcompanhadas,
      diasTecnico,
    });
  } catch (err) {
    console.error("❌ Erro ao montar contador:", err);
    res.status(500).json({
      dias: 0,
      mentiras: 0,
      diasTecnico: 0,
    });
  }
});
app.get("/api/materias", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit || "20", 10), 1),
      100,
    );
    const busca = String(req.query.q || "").trim().slice(0, 200);
    const buscaLiteral = busca.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const filtro = busca
      ? {
          $or: [
            { titulo: { $regex: buscaLiteral, $options: "i" } },
            { conteudo: { $regex: buscaLiteral, $options: "i" } },
            { fonteNome: { $regex: buscaLiteral, $options: "i" } },
          ],
        }
      : {};

    const total = await Materia.countDocuments(filtro);
    const registros = await Materia.find(filtro).sort({ dataPublicacao: -1, dataCriacao: -1 }).skip((page - 1) * limit).limit(limit).lean();
    const lista = noticiasPublicas(registros, new Date(), false);

    res.json({
      total,
      pagina: page,
      limite: limit,
      totalPaginas: Math.ceil(total / limit),
      itens: lista,
    });
  } catch (err) {
    console.error("❌ Erro ao listar matérias:", err);
    res.status(500).json({
      total: 0,
      pagina: 1,
      limite: 20,
      totalPaginas: 0,
      itens: [],
    });
  }
});

app.get("/api/resumo-semana", async (req, res) => {
  try {
    const materiasBase = await Materia.find({ dataPublicacao: { $gte: new Date(Date.now() - 7 * 86400000) } }).sort({ dataPublicacao: -1 }).limit(30).lean();
    res.json({ itens: resumoSemanal(materiasBase) });
  } catch (err) {
    console.error("❌ Erro ao montar resumo da semana:", err);
    res.status(500).json({
      itens: [],
    });
  }
});

app.get("/api/promessas-destaque", async (req, res) => {
  try {
    const lista = await Promessa.find({
      ativa: true,
      destaqueHome: true,
    })
      .sort({ ordem: 1 })
      .lean();

    res.json({
      itens: lista.map(promessaPublica),
    });
  } catch (err) {
    console.error("❌ Erro ao carregar promessas em destaque:", err);
    res.status(500).json({ itens: [] });
  }
});

app.get("/api/promessas", async (req, res) => {
  try {
    const lista = await Promessa.find({ ativa: true })
      .sort({ ordem: 1 })
      .lean();

    res.json({
      itens: lista.map(promessaPublica),
    });
  } catch (err) {
    console.error("❌ Erro ao carregar promessas:", err);
    res.status(500).json({ itens: [] });
  }
});
app.get("/api/admin/promessas", requireAdmin, async (req, res) => {
  try {
    const lista = await Promessa.find().sort({ ordem: 1 }).lean();

    res.json({
      itens: lista,
    });
  } catch (err) {
    console.error("❌ Erro ao listar promessas no admin:", err);
    res.status(500).json({
      success: false,
      itens: [],
    });
  }
});

app.post("/api/admin/promessas", requireAdmin, async (req, res) => {
  try {
    const {
      chave,
      titulo,
      status,
      resumo,
      situacao,
      destaqueHome,
      ordem,
      ativa,
    } = req.body;

    const chaveLimpa = String(chave || "").trim();
    const tituloLimpo = String(titulo || "").trim();

    if (!chaveLimpa || !tituloLimpo) {
      return res.status(400).json({
        success: false,
        message: "Os campos 'chave' e 'titulo' são obrigatórios.",
      });
    }

    const existente = await Promessa.findOne({ chave: chaveLimpa }).lean();
    if (existente) {
      return res.status(409).json({
        success: false,
        message: "Já existe uma promessa com essa chave.",
      });
    }

    const novaPromessa = await Promessa.create({
      chave: chaveLimpa,
      titulo: tituloLimpo,
      status: String(status || "Sob cobrança").trim(),
      resumo: String(resumo || "").trim(),
      situacao: String(situacao || "").trim(),
      destaqueHome: Boolean(destaqueHome),
      ordem: Number.isFinite(Number(ordem)) ? Number(ordem) : 0,
      ativa: ativa === undefined ? true : Boolean(ativa),
    });

    res.status(201).json({
      success: true,
      item: novaPromessa,
    });
  } catch (err) {
    console.error("❌ Erro ao criar promessa no admin:", err);
    res.status(500).json({
      success: false,
      message: "Erro ao criar promessa.",
    });
  }
});

app.put("/api/admin/promessas/:id", requireAdmin, async (req, res) => {
      try {
        const { id } = req.params;
        const {
          chave,
          titulo,
          status,
          resumo,
          situacao,
          destaqueHome,
          ordem,
          ativa,
        } = req.body;

        const promessaAtualizada = await Promessa.findByIdAndUpdate(
          id,
          {
            ...(chave !== undefined ? { chave: String(chave).trim() } : {}),
            ...(titulo !== undefined ? { titulo: String(titulo).trim() } : {}),
            ...(status !== undefined ? { status: String(status).trim() } : {}),
            ...(resumo !== undefined ? { resumo: String(resumo).trim() } : {}),
            ...(situacao !== undefined
              ? { situacao: String(situacao).trim() }
              : {}),
            ...(destaqueHome !== undefined
              ? { destaqueHome: Boolean(destaqueHome) }
              : {}),
            ...(ordem !== undefined
              ? { ordem: Number.isFinite(Number(ordem)) ? Number(ordem) : 0 }
              : {}),
            ...(ativa !== undefined ? { ativa: Boolean(ativa) } : {}),
          },
          { new: true, runValidators: true },
        ).lean();

        if (!promessaAtualizada) {
          return res.status(404).json({
            success: false,
            message: "Promessa não encontrada.",
          });
        }

        res.json({
          success: true,
          item: promessaAtualizada,
        });
      } catch (err) {
        console.error("❌ Erro ao atualizar promessa no admin:", err);
        res.status(500).json({
          success: false,
          message: "Erro ao atualizar promessa.",
        });
      }
});

app.delete("/api/admin/promessas/:id", requireAdmin, async (req, res) => {
      try {
        const { id } = req.params;

        const promessaDesativada = await Promessa.findByIdAndUpdate(
          id,
          { ativa: false },
          { new: true },
        ).lean();

        if (!promessaDesativada) {
          return res.status(404).json({
            success: false,
            message: "Promessa não encontrada.",
          });
        }

        res.json({
          success: true,
          item: promessaDesativada,
        });
      } catch (err) {
        console.error("❌ Erro ao desativar promessa no admin:", err);
        res.status(500).json({
          success: false,
          message: "Erro ao desativar promessa.",
        });
      }
});

app.get("/api/tecnicos", async (req, res) => {
  try {
    const lista = await Tecnico.find({ ativo: true }).sort({ ordem: 1 }).lean();

    res.json({
      itens: lista.map(serializarTecnico),
    });
  } catch (err) {
    console.error("❌ Erro ao carregar técnicos:", err);
    res.status(500).json({ itens: [] });
  }
});

app.get("/api/admin/tecnicos", requireAdmin, async (req, res) => {
  try {
    const lista = await Tecnico.find().sort({ ordem: 1 }).lean();

    res.json({
      itens: lista,
    });
  } catch (err) {
    console.error("❌ Erro ao listar técnicos no admin:", err);
    res.status(500).json({
      success: false,
      itens: [],
    });
  }
});

app.get("/api/linha-do-tempo", async (req, res) => {
  try {
    const lista = await LinhaDoTempo.find({ ativo: true }).sort({ ordem: 1 }).lean();
    res.json({
      itens: linhaPublica(lista),
    });
  } catch (err) {
    console.error("❌ Erro ao carregar linha do tempo:", err);
    res.status(500).json({ itens: [] });
  }
});

app.get("/api/admin/linha-do-tempo", requireAdmin, async (req, res) => {
  try {
    const lista = await LinhaDoTempo.find().sort({ ordem: 1 }).lean();

    res.json({
      itens: lista,
    });
  } catch (err) {
    console.error("❌ Erro ao listar linha do tempo no admin:", err);
    res.status(500).json({
      success: false,
      itens: [],
    });
  }
});

app.post("/api/admin/linha-do-tempo", requireAdmin, async (req, res) => {
  try {
    const { chave, data, titulo, desc, ordem, ativo } = req.body;

    const chaveLimpa = String(chave || "").trim();
    const dataLimpa = String(data || "").trim();
    const tituloLimpo = String(titulo || "").trim();
    const descLimpa = String(desc || "").trim();

    if (!chaveLimpa || !dataLimpa || !tituloLimpo || !descLimpa) {
      return res.status(400).json({
        success: false,
        message: "Os campos 'chave', 'data', 'titulo' e 'desc' são obrigatórios.",
      });
    }

    const existente = await LinhaDoTempo.findOne({ chave: chaveLimpa }).lean();
    if (existente) {
      return res.status(409).json({
        success: false,
        message: "Já existe um marco com essa chave.",
      });
    }

    const novoItem = await LinhaDoTempo.create({
      chave: chaveLimpa,
      data: dataLimpa,
      titulo: tituloLimpo,
      desc: descLimpa,
      ordem: Number.isFinite(Number(ordem)) ? Number(ordem) : 0,
      ativo: ativo === undefined ? true : Boolean(ativo),
    });

    res.status(201).json({
      success: true,
      item: novoItem,
    });
  } catch (err) {
    console.error("❌ Erro ao criar item da linha do tempo:", err);
    res.status(500).json({
      success: false,
      message: "Erro ao criar item da linha do tempo.",
    });
  }
});

app.put("/api/admin/linha-do-tempo/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { chave, data, titulo, desc, ordem, ativo } = req.body;

    const itemAtualizado = await LinhaDoTempo.findByIdAndUpdate(
      id,
      {
        ...(chave !== undefined ? { chave: String(chave).trim() } : {}),
        ...(data !== undefined ? { data: String(data).trim() } : {}),
        ...(titulo !== undefined ? { titulo: String(titulo).trim() } : {}),
        ...(desc !== undefined ? { desc: String(desc).trim() } : {}),
        ...(ordem !== undefined
          ? { ordem: Number.isFinite(Number(ordem)) ? Number(ordem) : 0 }
          : {}),
        ...(ativo !== undefined ? { ativo: Boolean(ativo) } : {}),
      },
      { new: true, runValidators: true },
    ).lean();

    if (!itemAtualizado) {
      return res.status(404).json({
        success: false,
        message: "Item da linha do tempo não encontrado.",
      });
    }

    res.json({
      success: true,
      item: itemAtualizado,
    });
  } catch (err) {
    console.error("❌ Erro ao atualizar item da linha do tempo:", err);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar item da linha do tempo.",
    });
  }
});

app.delete("/api/admin/linha-do-tempo/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const itemDesativado = await LinhaDoTempo.findByIdAndUpdate(
      id,
      { ativo: false },
      { new: true },
    ).lean();

    if (!itemDesativado) {
      return res.status(404).json({
        success: false,
        message: "Item da linha do tempo não encontrado.",
      });
    }

    res.json({
      success: true,
      item: itemDesativado,
    });
  } catch (err) {
    console.error("❌ Erro ao desativar item da linha do tempo:", err);
    res.status(500).json({
      success: false,
      message: "Erro ao desativar item da linha do tempo.",
    });
  }
});

app.post("/api/admin/tecnicos", requireAdmin, async (req, res) => {
  try {
    const {
      chave,
      nome,
      dataInicio,
      dataFim,
      motivo,
      emCargo,
      ordem,
      ativo,
    } = req.body;

    const chaveLimpa = String(chave || "").trim();
    const nomeLimpo = String(nome || "").trim();

    if (!chaveLimpa || !nomeLimpo || !dataInicio) {
      return res.status(400).json({
        success: false,
        message: "Os campos 'chave', 'nome' e 'dataInicio' são obrigatórios.",
      });
    }

    const existente = await Tecnico.findOne({ chave: chaveLimpa }).lean();
    if (existente) {
      return res.status(409).json({
        success: false,
        message: "Já existe um técnico com essa chave.",
      });
    }

    if (Boolean(emCargo)) {
      await Tecnico.updateMany(
        { emCargo: true },
        { $set: { emCargo: false, motivo: "Encerrado" } },
      );
    }

    const novoTecnico = await Tecnico.create({
      chave: chaveLimpa,
      nome: nomeLimpo,
      dataInicio: new Date(dataInicio),
      dataFim: dataFim ? new Date(dataFim) : null,
      motivo: String(motivo || (emCargo ? "Em cargo" : "Demissão")).trim(),
      emCargo: Boolean(emCargo),
      ordem: Number.isFinite(Number(ordem)) ? Number(ordem) : 0,
      ativo: ativo === undefined ? true : Boolean(ativo),
    });

    res.status(201).json({
      success: true,
      item: novoTecnico,
    });
  } catch (err) {
    console.error("❌ Erro ao criar técnico no admin:", err);
    res.status(500).json({
      success: false,
      message: "Erro ao criar técnico.",
    });
  }
});

app.put("/api/admin/tecnicos/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      chave,
      nome,
      dataInicio,
      dataFim,
      motivo,
      emCargo,
      ordem,
      ativo,
    } = req.body;

    if (emCargo === true) {
      await Tecnico.updateMany(
        { _id: { $ne: id }, emCargo: true },
        { $set: { emCargo: false, motivo: "Encerrado" } },
      );
    }

    const tecnicoAtualizado = await Tecnico.findByIdAndUpdate(
      id,
      {
        ...(chave !== undefined ? { chave: String(chave).trim() } : {}),
        ...(nome !== undefined ? { nome: String(nome).trim() } : {}),
        ...(dataInicio !== undefined ? { dataInicio: new Date(dataInicio) } : {}),
        ...(dataFim !== undefined
          ? { dataFim: dataFim ? new Date(dataFim) : null }
          : {}),
        ...(motivo !== undefined ? { motivo: String(motivo).trim() } : {}),
        ...(emCargo !== undefined ? { emCargo: Boolean(emCargo) } : {}),
        ...(ordem !== undefined
          ? { ordem: Number.isFinite(Number(ordem)) ? Number(ordem) : 0 }
          : {}),
        ...(ativo !== undefined ? { ativo: Boolean(ativo) } : {}),
      },
      { new: true, runValidators: true },
    ).lean();

    if (!tecnicoAtualizado) {
      return res.status(404).json({
        success: false,
        message: "Técnico não encontrado.",
      });
    }

    res.json({
      success: true,
      item: tecnicoAtualizado,
    });
  } catch (err) {
    console.error("❌ Erro ao atualizar técnico no admin:", err);
    res.status(500).json({
      success: false,
      message: "Erro ao atualizar técnico.",
    });
  }
});

app.delete("/api/admin/tecnicos/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const tecnicoDesativado = await Tecnico.findByIdAndUpdate(
      id,
      { ativo: false, emCargo: false },
      { new: true },
    ).lean();

    if (!tecnicoDesativado) {
      return res.status(404).json({
        success: false,
        message: "Técnico não encontrado.",
      });
    }

    res.json({
      success: true,
      item: tecnicoDesativado,
    });
  } catch (err) {
    console.error("❌ Erro ao desativar técnico no admin:", err);
    res.status(500).json({
      success: false,
      message: "Erro ao desativar técnico.",
    });
  }
});

app.get("/api/home", async (req, res) => {
  try {
    const hoje = new Date();

    const dataInicioSAF = new Date("2023-11-01T00:00:00-03:00");
    const diasSAF = diasCalendario(dataInicioSAF, hoje);

    const [
      promessas,
      promessasDestaque,
      tecnicos,
      linhaDoTempo,
      tecnicoAtual,
      materiasBase,
    ] = await Promise.all([
      Promessa.find({ ativa: true }).sort({ ordem: 1 }).lean(),
      Promessa.find({ ativa: true, destaqueHome: true })
        .sort({ ordem: 1 })
        .lean(),
      Tecnico.find({ ativo: true }).sort({ ordem: 1 }).lean(),
      LinhaDoTempo.find({ ativo: true }).sort({ ordem: 1 }).lean(),
      Tecnico.findOne({ ativo: true, emCargo: true }).lean(),
      Materia.find({ dataPublicacao: { $gte: new Date(Date.now() - 7 * 86400000) } }).sort({ dataPublicacao: -1 }).limit(30).lean(),
    ]);

    const diasTecnico = tecnicoAtual
      ? calcularDiasEntre(tecnicoAtual.dataInicio)
      : 0;

    const resumoSemanaFinal = resumoSemanal(materiasBase, hoje);

    res.json({
      contador: {
        dias: diasSAF,
        mentiras: promessas.length, // Compatibilidade; não é uma classificação de mentira.
        promessasAcompanhadas: promessas.length,
        diasTecnico,
      },
      financeiro: finanças,
      revisadoEm: "2026-11-28",
      promessas: promessas.map(promessaPublica),
      promessasDestaque: promessasDestaque.map(promessaPublica),
      tecnicos: tecnicos.map(serializarTecnico),
      linhaDoTempo: linhaPublica(linhaDoTempo),
      resumoSemana: resumoSemanaFinal,
    });
  } catch (err) {
    console.error("❌ Erro ao montar /api/home:", err);
    res.status(500).json({
      contador: { dias: 0, mentiras: 0, diasTecnico: 0 },
      promessas: [],
      promessasDestaque: [],
      tecnicos: [],
      linhaDoTempo: [],
      resumoSemana: [],
    });
  }
});

app.get("/api/termometro/:itemTipo", async (req, res) => {
  try {
    const itemTipo = String(req.params.itemTipo || "").trim();

    const agregados = await VotoTermometro.aggregate([
      { $match: { itemTipo } },
      {
        $group: {
          _id: { itemId: "$itemId", voto: "$voto" },
          total: { $sum: 1 },
        },
      },
    ]);

    const itens = {};

    for (const item of agregados) {
      const itemId = item._id.itemId;
      const voto = item._id.voto;

      if (!itens[itemId]) {
        itens[itemId] = {
          cobrar_agora: 0,
          importa_muito: 0,
          nao_prioridade: 0,
        };
      }

      itens[itemId][voto] = item.total;
    }

    res.json({ itens });
  } catch (err) {
    console.error("❌ Erro ao carregar termômetro:", err);
    res.status(500).json({ itens: {} });
  }
});

app.post("/api/termometro/votar", async (req, res) => {
  try {
    const { itemTipo, itemId, voto, sessionId } = req.body;

    const itemTipoLimpo = String(itemTipo || "").trim();
    const itemIdLimpo = String(itemId || "").trim();
    const votoLimpo = String(voto || "").trim();
    const sessionIdLimpo = String(sessionId || "").trim();

    const votosPermitidos = ["cobrar_agora", "importa_muito", "nao_prioridade"];

    if (!itemTipoLimpo || !itemIdLimpo || !sessionIdLimpo) {
      return res.status(400).json({
        success: false,
        message: "Dados incompletos para registrar o voto.",
      });
    }

    if (!votosPermitidos.includes(votoLimpo)) {
      return res.status(400).json({
        success: false,
        message: "Voto inválido.",
      });
    }

    await VotoTermometro.findOneAndUpdate(
      {
        itemTipo: itemTipoLimpo,
        itemId: itemIdLimpo,
        sessionId: sessionIdLimpo,
      },
      {
        itemTipo: itemTipoLimpo,
        itemId: itemIdLimpo,
        sessionId: sessionIdLimpo,
        voto: votoLimpo,
        dataAtualizacao: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    const agregados = await VotoTermometro.aggregate([
      {
        $match: {
          itemTipo: itemTipoLimpo,
          itemId: itemIdLimpo,
        },
      },
      {
        $group: {
          _id: "$voto",
          total: { $sum: 1 },
        },
      },
    ]);

    const totais = {
      cobrar_agora: 0,
      importa_muito: 0,
      nao_prioridade: 0,
    };

    for (const item of agregados) {
      totais[item._id] = item.total;
    }

    res.json({
      success: true,
      itemId: itemIdLimpo,
      totais,
    });
  } catch (err) {
    console.error("❌ Erro ao votar no termômetro:", err);
    res.status(500).json({
      success: false,
      message: "Erro ao registrar voto.",
    });
  }
});

const sugestoesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Muitas tentativas. Tente novamente em alguns minutos.",
  },
});

// Compatibilidade do endereço: o portal deixou de receber mensagens por formulário.
app.post("/api/sugestoes", sugestoesLimiter, (req, res) => {
  res.status(410).json({ success: false, message: "Formulário desativado. Use o contato por e-mail informado no portal." });
});

const PORT = process.env.PORT || 4000;

async function iniciarServidor() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("[startup] MongoDB conectado.");

    await garantirSeedPromessas();
    await garantirSeedTecnicos();
    await garantirSeedLinhaDoTempo();
    // Inclusão idempotente de links e resumos próprios; não altera registros anteriores.
    for (const { _id, ...noticia } of noticiasRevisadas) {
      await Materia.updateOne({ fonteUrl: noticia.fonteUrl }, { $setOnInsert: noticia }, { upsert: true });
    }

    app.listen(PORT, () => {
      console.log(`Backend ON na porta ${PORT}`);
    });

    cron.schedule("0 * * * *", () => {
      executarColetaProtegida("cron").catch((err) => {
        console.error(
          "[pulguinha] Falha inesperada no cron:",
          mensagemErroSanitizada(err),
        );
      });
    });

    executarColetaProtegida("startup").catch((err) => {
      console.error(
        "[pulguinha] Falha inesperada na coleta inicial:",
        mensagemErroSanitizada(err),
      );
    });
  } catch (err) {
    console.error("[startup] Erro ao iniciar backend. Verifique MongoDB.");
    process.exitCode = 1;
    process.exit(1);
  }
}

iniciarServidor();
