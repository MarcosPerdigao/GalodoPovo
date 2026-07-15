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

afterEach(() => {
  global.fetch = originalFetch;
  window.scrollTo = originalScrollTo;
  jest.restoreAllMocks();
});

test("renderiza a pagina publica do Galo do Povo", async () => {
  window.scrollTo = jest.fn();
  global.fetch = jest.fn((url) => {
    if (url.includes("/api/materias")) {
      return criarResposta({
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
      });
    }

    if (url.includes("/api/home")) {
      return criarResposta({
        contador: { dias: 900, diasTecnico: 30, mentiras: 3 },
        resumoSemana: [],
        promessasDestaque: [],
        promessas: [],
        tecnicos: [],
        linhaDoTempo: [],
      });
    }

    if (url.includes("/api/termometro/promessa-destaque")) {
      return criarResposta({ itens: {} });
    }

    return Promise.reject(new Error(`URL nao mockada: ${url}`));
  });

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
