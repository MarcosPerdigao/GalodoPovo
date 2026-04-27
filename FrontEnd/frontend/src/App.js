import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [materias, setMaterias] = useState([]);
  const [contador, setContador] = useState({
    dias: 0,
    diasTecnico: 0,
  });

  const [termoBusca, setTermoBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const ITENS_POR_PAGINA = 10;

  const listaPromessas = [
    "A Arena MRV será inaugurada 100% paga e sem gerar dívidas para o clube.",
    "O Galo terá um elenco protagonista e disputará todos os títulos de igual para igual.",
    "A gestão da SAF será pautada pela transparência total com o torcedor.",
    "A dívida global do clube será reduzida drasticamente já no primeiro ano.",
    "O patrimônio da Associação (Vila Olímpica, Labareda) não será usado para cobrir rombos da SAF.",
    "Os preços dos ingressos serão populares e acessíveis para a verdadeira Massa Atleticana.",
    "O departamento de futebol terá autonomia técnica sem interferência direta dos investidores.",
  ];

  useEffect(() => {
    window.scrollTo(0, 0);

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    fetch("https://galodopovo-api.onrender.com/api/materias")
      .then((res) => res.json())
      .then((data) => setMaterias(data))
      .catch((err) => console.error(err));

    fetch("https://galodopovo-api.onrender.com/api/contador")
      .then((res) => res.json())
      .then((data) => setContador(data))
      .catch((err) => console.error(err));
  }, []);

  const materiasFiltradas = materias.filter((m) => {
    const termo = termoBusca.toLowerCase();
    const titulo = m.titulo ? m.titulo.toLowerCase() : "";
    const conteudo = m.conteudo ? m.conteudo.toLowerCase() : "";
    return titulo.includes(termo) || conteudo.includes(termo);
  });

  useEffect(() => {
    setPaginaAtual(1);
  }, [termoBusca]);

  const totalPaginas = Math.ceil(materiasFiltradas.length / ITENS_POR_PAGINA);
  const indexUltimoItem = paginaAtual * ITENS_POR_PAGINA;
  const indexPrimeiroItem = indexUltimoItem - ITENS_POR_PAGINA;
  const materiasPaginadas = materiasFiltradas.slice(
    indexPrimeiroItem,
    indexUltimoItem,
  );

  // 👇 NOVA FUNÇÃO: Muda a página e sobe a tela suavemente 👇
  const mudarPaginaESubir = (novaPagina) => {
    setPaginaAtual(novaPagina);
    const secaoDossie = document.getElementById("inicio-dossie");
    if (secaoDossie) {
      secaoDossie.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div>
      <img src="/galo.png" alt="Escudo do Galo" className="bg-galo" />

      {modalAberto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#111",
              border: "2px solid #FFD700",
              borderRadius: "10px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative",
              boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
            }}
          >
            <button
              onClick={() => setModalAberto(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "20px",
                background: "none",
                border: "none",
                color: "#FFD700",
                fontSize: "1.5rem",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ✖
            </button>

            <div style={{ padding: "30px" }}>
              <h2
                style={{
                  color: "#FFD700",
                  borderBottom: "1px solid #333",
                  paddingBottom: "15px",
                  marginBottom: "20px",
                  marginTop: 0,
                }}
              >
                📜 As Promessas Esquecidas
              </h2>
              <ul
                style={{
                  color: "#fff",
                  listStyleType: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                {listaPromessas.map((promessa, index) => (
                  <li
                    key={index}
                    style={{
                      marginBottom: "15px",
                      backgroundColor: "#222",
                      padding: "15px",
                      borderRadius: "6px",
                      borderLeft: "4px solid #FF4444",
                    }}
                  >
                    <strong>{index + 1}.</strong> {promessa}
                  </li>
                ))}
              </ul>
              <p
                style={{
                  color: "#888",
                  fontSize: "0.85rem",
                  textAlign: "center",
                  marginTop: "20px",
                  fontStyle: "italic",
                }}
              >
                A Massa não esquece. O Dossiê registra.
              </p>
            </div>
          </div>
        </div>
      )}

      <header className="header-protesto">
        <h1>Galo do Povo: A Verdade da SAF</h1>
        <p className="contador">
          Dias sob a SAF: <strong>{contador.dias}</strong> | Promessas
          Quebradas:{" "}
          <strong
            onClick={() => setModalAberto(true)}
            style={{
              color: "#FFD700",
              textDecoration: "underline",
              cursor: "pointer",
              padding: "2px 5px",
              backgroundColor: "rgba(255, 215, 0, 0.1)",
              borderRadius: "4px",
            }}
            title="Clique para ver a lista!"
          >
            {listaPromessas.length} 🔍
          </strong>{" "}
          | Técnico atual no cargo: <strong>{contador.diasTecnico} dias</strong>
        </p>
      </header>

      <div className="split-container" style={{ marginTop: "40px" }}>
        <div className="split-side side-left">
          <div
            className="card-estatico"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.9)), url(/rosto-rafael.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "10px",
              padding: "40px 20px",
              color: "#fff",
              boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "2.5rem",
                margin: "0 0 10px 0",
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              }}
            >
              Rafael Menin
            </h2>
            <p
              style={{
                color: "#FF4444",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontSize: "1.3rem",
                margin: 0,
                textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
              }}
            >
              Dono
            </p>
          </div>
        </div>

        <div className="split-side side-right">
          <div
            className="card-estatico"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.9)), url(/rosto-rubens.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "10px",
              padding: "40px 20px",
              color: "#fff",
              boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "2.5rem",
                margin: "0 0 10px 0",
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              }}
            >
              Rubens Menin
            </h2>
            <p
              style={{
                color: "#FF4444",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontSize: "1.3rem",
                margin: 0,
                textShadow: "1px 1px 3px rgba(0,0,0,0.8)",
              }}
            >
              Dono
            </p>
          </div>
        </div>
      </div>

      {/* 👇 Adicionamos o ID 'inicio-dossie' aqui para servir de âncora 👇 */}
      <section className="materias-section" id="inicio-dossie">
        <h2 className="titulo-secao">O Dossiê Completo</h2>

        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto 30px auto",
            textAlign: "center",
          }}
        >
          <input
            type="text"
            placeholder="🔍 Pesquisar no Dossiê (ex: dívida, arena, jogador...)"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            style={{
              width: "100%",
              padding: "15px",
              fontSize: "1rem",
              borderRadius: "8px",
              border: "1px solid #444",
              backgroundColor: "#111",
              color: "#fff",
              outline: "none",
            }}
          />
        </div>

        {materiasPaginadas.length > 0 ? (
          materiasPaginadas.map((m) => (
            <div
              id={m.link ? m.link.substring(1) : ""}
              key={m._id || m.titulo}
              className="materia-item"
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                paddingBottom: "20px",
              }}
            >
              <h2>{m.titulo}</h2>

              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#888",
                  marginBottom: "15px",
                  fontStyle: "italic",
                }}
              >
                🕒 Capturado em:{" "}
                {new Date(m.dataCriacao).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>

              <p style={{ flex: 1, marginBottom: "20px" }}>{m.conteudo}</p>

              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "15px",
                  borderTop: "1px solid #333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                  width: "100%",
                }}
              >
                {m.fonteNome === "Pulguinha (Bot)" ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>🐔</span>
                    <span style={{ color: "#ccc", fontSize: "0.8rem" }}>
                      Vigiado por Pulguinha
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>📄</span>
                    <span style={{ color: "#ccc", fontSize: "0.8rem" }}>
                      Apuração Exclusiva (Massa)
                    </span>
                  </div>
                )}

                {m.fonteUrl && (
                  <a
                    href={m.fonteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-fonte"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "0.85rem",
                      padding: "5px 10px",
                      border: "1px solid #444",
                      borderRadius: "4px",
                      backgroundColor: "#111",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    {m.fonteNome === "Pulguinha (Bot)"
                      ? "🔗 Ver Matéria Completa"
                      : `Fonte: ${m.fonteNome}`}
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#888", fontSize: "1.1rem" }}>
            Nenhuma matéria encontrada no momento.
          </p>
        )}

        {totalPaginas > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "15px",
              marginTop: "30px",
            }}
          >
            {/* 👇 Atualizamos os botões para chamar a nova função 👇 */}
            <button
              onClick={() => mudarPaginaESubir(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              style={{
                padding: "10px 15px",
                backgroundColor: paginaAtual === 1 ? "#222" : "#FFD700",
                color: paginaAtual === 1 ? "#666" : "#000",
                border: "none",
                borderRadius: "5px",
                fontWeight: "bold",
                cursor: paginaAtual === 1 ? "not-allowed" : "pointer",
              }}
            >
              ◀ Anterior
            </button>
            <span style={{ color: "#fff", fontWeight: "bold" }}>
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              onClick={() => mudarPaginaESubir(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              style={{
                padding: "10px 15px",
                backgroundColor:
                  paginaAtual === totalPaginas ? "#222" : "#FFD700",
                color: paginaAtual === totalPaginas ? "#666" : "#000",
                border: "none",
                borderRadius: "5px",
                fontWeight: "bold",
                cursor:
                  paginaAtual === totalPaginas ? "not-allowed" : "pointer",
              }}
            >
              Próxima ▶
            </button>
          </div>
        )}
      </section>

      <section className="form-section">
        <div className="form-container" style={{ textAlign: "center" }}>
          <h2>Envie sua denúncia!</h2>
          <p style={{ marginBottom: "25px" }}>
            A diretoria tenta esconder, mas a arquibancada vê tudo. Nos envie
            links de matérias exclusivas. Sigilo absoluto.
          </p>
          <div
            style={{
              backgroundColor: "#222",
              padding: "20px",
              borderRadius: "8px",
              display: "inline-block",
              border: "1px solid #444",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            }}
          >
            <p
              style={{
                fontSize: "1.1rem",
                margin: "0 0 10px 0",
                color: "#ccc",
              }}
            >
              📧 Fale direto com a moderação:
            </p>
            <a
              href="mailto:galodopovo13@gmail.com"
              style={{
                fontSize: "1.4rem",
                color: "#FFD700",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              galodopovo13@gmail.com
            </a>
          </div>
        </div>
      </section>

      <footer
        style={{
          marginTop: "50px",
          padding: "20px",
          backgroundColor: "#000",
          borderTop: "1px solid #333",
          textAlign: "center",
          color: "#888",
          fontSize: "0.8rem",
        }}
      >
        <p style={{ marginBottom: "10px" }}>
          <strong>Galo do Povo</strong> © {new Date().getFullYear()} - O Dossiê
          da Massa.
        </p>
        <p style={{ maxWidth: "800px", margin: "0 auto", lineHeight: "1.4" }}>
          Este site é uma iniciativa independente e pacífica de torcedores. Não
          possui nenhum vínculo oficial com o Clube Atlético Mineiro,
          Associação, SAF ou seus investidores. Todo o conteúdo é baseado em
          declarações públicas e links de veículos de imprensa, exercendo o
          direito constitucional à liberdade de expressão, opinião e crítica
          (Art. 5º, incisos IV e IX da Constituição Federal).
        </p>
      </footer>
    </div>
  );
}
