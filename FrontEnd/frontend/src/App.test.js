import { render, screen, waitFor } from "@testing-library/react";
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
  contador: { dias: 900, diasTecnico: 30, mentiras: 3 },
  resumoSemana: [],
  promessasDestaque: [],
  promessas: [],
  tecnicos: [],
  linhaDoTempo: [],
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

  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/materias"),
    );
  });
});

test("exibe materias quando materias carregam e home falha", async () => {
  window.scrollTo = jest.fn();
  jest.spyOn(console, "error").mockImplementation(() => {});
  configurarFetch({ home: criarFalha() });

  render(<App />);

  expect(
    await screen.findByText("Materia de teste sobre a SAF"),
  ).toBeInTheDocument();
  expect(
    screen.queryByText(/carregar o dossi/i),
  ).not.toBeInTheDocument();
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
  expect(
    screen.queryByText(/carregar o dossi/i),
  ).not.toBeInTheDocument();
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
