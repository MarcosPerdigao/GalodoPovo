import { render, screen } from "@testing-library/react";
import App from "./App";

const originalFetch = global.fetch;
const originalScrollTo = window.scrollTo;

function criarResposta(data) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  });
}

function criarFalha(data = { message: "Erro de teste" }) {
  return Promise.resolve({
    ok: false,
    json: () => Promise.resolve(data),
  });
}

const materiasData = {
  total: 1,
  pagina: 1,
  limite: 100,
  totalPaginas: 1,
  itens: [
    {
      _id: "materia-1",
      titulo: "Materia de teste sobre a SAF",
      conteudo: "Conteudo monitorado pelo dossie.",
      fonteNome: "Fonte Teste",
      fonteUrl: "https://example.com/materia",
      dataCriacao: "2026-07-15T12:00:00.000Z",
    },
  ],
};

const homeData = {
  contador: { dias: 900, diasTecnico: 30, mentiras: 1 },
  resumoSemana: [
    {
      tag: "Gestao",
      impacto: "Monitoramento",
      titulo: "Registro semanal de teste",
      resumo: "Resumo preservado da API.",
      fonteUrl: "https://example.com/fonte",
    },
  ],
  promessasDestaque: [
    {
      id: "promessa-1",
      titulo: "Promessa de teste",
      status: "Sob verificação",
      resumo: "Resumo da promessa em destaque.",
    },
  ],
  promessas: [
    {
      id: "promessa-1",
      titulo: "Promessa de teste",
      status: "Sob verificação",
      resumo: "Resumo da promessa completa.",
      situacao: "Em acompanhamento.",
    },
  ],
  tecnicos: [
    {
      nome: "Tecnico anterior",
      periodo: "2025",
      dias: "40 dias",
      motivo: "Demitido",
    },
    {
      nome: "Tecnico atual",
      periodo: "2026 - atual",
      dias: "30 dias",
      motivo: "Em cargo",
    },
  ],
  linhaDoTempo: [
    {
      data: "2026",
      titulo: "Marco de teste",
      desc: "Descricao do marco de teste.",
    },
  ],
};

function configurarFetch({
  materias = criarResposta(materiasData),
  home = criarResposta(homeData),
} = {}) {
  global.fetch = jest.fn((url) => {
    if (url.includes("/api/materias")) {
      return materias;
    }

    if (url.includes("/api/home")) {
      return home;
    }

    if (url.includes("/api/termometro/promessa-destaque")) {
      return criarResposta({ itens: {} });
    }

    return Promise.reject(new Error(`URL nao mockada: ${url}`));
  });
}

afterEach(() => {
  global.fetch = originalFetch;
  window.scrollTo = originalScrollTo;
  jest.restoreAllMocks();
});

test("renderiza a pagina publica do Galo do Povo", async () => {
  window.scrollTo = jest.fn();
  configurarFetch();

  render(<App />);

  expect(
    screen.getByRole("heading", {
      name: /a saf prometeu\. o galo do povo registra, organiza e cobra\./i,
    }),
  ).toBeInTheDocument();

  expect(
    await screen.findByText("Materia de teste sobre a SAF"),
  ).toBeInTheDocument();
});

test("exibe materias quando materias carregam e home falha", async () => {
  window.scrollTo = jest.fn();
  jest.spyOn(console, "error").mockImplementation(() => {});
  configurarFetch({ home: criarFalha() });

  render(<App />);

  expect(
    await screen.findByText("Materia de teste sobre a SAF"),
  ).toBeInTheDocument();
  expect(screen.queryByText(/carregar o dossi/i)).not.toBeInTheDocument();
});

test("continua renderizando quando home carrega e materias falham", async () => {
  window.scrollTo = jest.fn();
  jest.spyOn(console, "error").mockImplementation(() => {});
  configurarFetch({ materias: criarFalha() });

  render(<App />);

  expect(
    screen.getByRole("heading", {
      name: /a saf prometeu\. o galo do povo registra, organiza e cobra\./i,
    }),
  ).toBeInTheDocument();
  expect(await screen.findByText("900")).toBeInTheDocument();
  expect(screen.queryByText(/carregar o dossi/i)).not.toBeInTheDocument();
});

test("mostra erro geral quando materias e home falham", async () => {
  window.scrollTo = jest.fn();
  jest.spyOn(console, "error").mockImplementation(() => {});
  configurarFetch({ materias: criarFalha(), home: criarFalha() });

  render(<App />);

  expect(
    await screen.findByText(
      "Não foi possível carregar o dossiê agora. Tente novamente em instantes.",
    ),
  ).toBeInTheDocument();
});

test("exibe identidade editorial e aviso de independencia", async () => {
  window.scrollTo = jest.fn();
  configurarFetch();

  render(<App />);

  expect(screen.getAllByText("GALO DO POVO").length).toBeGreaterThan(0);
  expect(screen.getByText("GdP")).toBeInTheDocument();
  expect(
    screen.getByText(/iniciativa independente, sem vínculo ou representação oficial/i),
  ).toBeInTheDocument();
  expect(await screen.findByText("Promessa de teste")).toBeInTheDocument();
});

test("exibe a secao financeira com metodologia", async () => {
  window.scrollTo = jest.fn();
  configurarFetch();

  render(<App />);

  expect(
    screen.getByRole("heading", { name: "O custo da dívida" }),
  ).toBeInTheDocument();
  expect(screen.getByText("Entenda o cálculo")).toBeInTheDocument();
  expect(await screen.findByText("Promessa de teste")).toBeInTheDocument();
});

test("exibe dossie, indicadores e linha do tempo editorial", async () => {
  window.scrollTo = jest.fn();
  configurarFetch();

  render(<App />);

  expect(
    screen.getByRole("heading", { name: "Dossiê Pulguinha" }),
  ).toBeInTheDocument();

  const tempoTecnicoAtual = screen.getByText("Tempo do técnico atual");
  expect(tempoTecnicoAtual).toBeInTheDocument();
  expect(tempoTecnicoAtual.closest("button")).toBeNull();
  expect(tempoTecnicoAtual.closest('[role="button"]')).toBeNull();

  expect(
    screen.getByRole("button", { name: /técnicos trocados/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Linha do tempo da era SAF" }),
  ).toBeInTheDocument();
  expect(await screen.findByText("Marco de teste")).toBeInTheDocument();
});

test("nao renderiza padroes de mojibake na pagina publica", async () => {
  window.scrollTo = jest.fn();
  configurarFetch();

  render(<App />);

  expect(await screen.findByText("Materia de teste sobre a SAF")).toBeInTheDocument();
  expect(screen.getAllByText("Enviar informação").length).toBeGreaterThan(0);
  expect(
    screen.getByText(
      "Um arquivo público de promessas, decisões, notícias e acontecimentos que ajudam a acompanhar a gestão da SAF.",
    ),
  ).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "O custo da dívida" })).toBeInTheDocument();
  expect(screen.getByText("Entenda o cálculo")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Dossiê Pulguinha" })).toBeInTheDocument();
  expect(screen.getByText("Memória pública")).toBeInTheDocument();
  expect(document.body.textContent).not.toMatch(
    /\u00c3\u0192|\u00c3\u201a|\u00c6\u2019|\u00c2\u00bf|\u00ef\u00bf\u00bd|\ufffd/,
  );
});
