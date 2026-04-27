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
  const [modalPromessasAberto, setModalPromessasAberto] = useState(false);
  const [modalTecnicosAberto, setModalTecnicosAberto] = useState(false); // Novo Modal
  const ITENS_POR_PAGINA = 10;

  // 📜 LISTA DE PROMESSAS
  const listaPromessas = [
    "A Arena MRV será inaugurada 100% paga e sem gerar dívidas para o clube.",
    "O Galo terá um elenco protagonista e disputará todos os títulos de igual para igual.",
    "A gestão da SAF será pautada pela transparência total com o torcedor.",
    "A dívida global do clube será reduzida drasticamente já no primeiro ano.",
    "O patrimônio da Associação (Vila Olímpica, Labareda) não será usado para cobrir rombos da SAF.",
    "Os preços dos ingressos serão populares e acessíveis para a verdadeira Massa Atleticana.",
    "O departamento de futebol terá autonomia técnica sem interferência direta dos investidores.",
  ];

  // 📋 HISTÓRICO DE TÉCNICOS (Desde o início da SAF em 01/11/2023)
  // Você pode atualizar os dias conforme os dados reais do seu Dossiê
  const historicoTecnicos = [
    {
      nome: "Luiz Felipe Scolari",
      periodo: "Nov/2023 - Mar/2024",
      motivo: "Demissão",
      dias: "140 dias (na era SAF)",
    },
    {
      nome: "Gabriel Milito",
      periodo: "Mar/2024 - Nov/2024",
      motivo: "Demissão",
      dias: "252 dias",
    },
    {
      nome: "Técnico de 2025 (Exemplo)",
      periodo: "Jan/2025 - Jan/2026",
      motivo: "Rescisão",
      dias: "365 dias",
    },
    {
      nome: "Eduardo Domínguez",
      periodo: "Fev/2026 - Atual",
      motivo: "Em cargo",
      dias: "Contando...",
    },
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

      {/* MODAL 1: PROMESSAS */}
      {modalPromessasAberto && (
        <div
          className="modal-overlay"
          onClick={() => setModalPromessasAberto(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#111",
              border: "2px solid #FFD700",
              borderRadius: "10px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative",
              padding: "30px",
            }}
          >
            <button
              onClick={() => setModalPromessasAberto(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "20px",
                background: "none",
                border: "none",
                color: "#FFD700",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
            <h2
              style={{
                color: "#FFD700",
                borderBottom: "1px solid #333",
                paddingBottom: "15px",
              }}
            >
              📜 Lista de Promessas Quebradas
            </h2>
            {listaPromessas.map((p, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#222",
                  padding: "15px",
                  margin: "10px 0",
                  borderRadius: "5px",
                  borderLeft: "4px solid #FF4444",
                  color: "#fff",
                }}
              >
                {i + 1}. {p}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 2: TÉCNICOS (O NOVO) */}
      {modalTecnicosAberto && (
        <div
          className="modal-overlay"
          onClick={() => setModalTecnicosAberto(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#111",
              border: "2px solid #FFD700",
              borderRadius: "10px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative",
              padding: "30px",
            }}
          >
            <button
              onClick={() => setModalTecnicosAberto(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "20px",
                background: "none",
                border: "none",
                color: "#FFD700",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
            <h2
              style={{
                color: "#FFD700",
                borderBottom: "1px solid #333",
                paddingBottom: "15px",
              }}
            >
              📉 Rotatividade de Técnicos (Era SAF)
            </h2>
            <p style={{ color: "#888", marginBottom: "20px" }}>
              Abaixo os profissionais que passaram pelo comando sob a gestão
              atual:
            </p>
            {historicoTecnicos.map((t, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#222",
                  padding: "15px",
                  margin: "10px 0",
                  borderRadius: "5px",
                  borderLeft:
                    t.motivo === "Em cargo"
                      ? "4px solid #228B22"
                      : "4px solid #FF4444",
                  color: "#fff",
                }}
              >
                <h3 style={{ margin: "0 0 5px 0", color: "#FFD700" }}>
                  {t.nome}
                </h3>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  📅 Período: {t.periodo}
                </p>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>
                  ⏱️ Duração: <strong>{t.dias}</strong>
                </p>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    fontSize: "0.8rem",
                    color: t.motivo === "Em cargo" ? "#00FF00" : "#FF4444",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  {t.motivo}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <header className="header-protesto">
        <h1>Galo do Povo: A Verdade da SAF</h1>
        <p className="contador">
          Dias sob a SAF: <strong>{contador.dias}</strong> | Promessas
          Quebradas:{" "}
          <strong
            onClick={() => setModalPromessasAberto(true)}
            style={{
              color: "#FFD700",
              textDecoration: "underline",
              cursor: "pointer",
              padding: "0 5px",
            }}
          >
            {listaPromessas.length} 🔍
          </strong>{" "}
          | Técnico atual:{" "}
          <strong
            onClick={() => setModalTecnicosAberto(true)}
            style={{
              color: "#FFD700",
              textDecoration: "underline",
              cursor: "pointer",
              padding: "0 5px",
            }}
          >
            {contador.diasTecnico} dias 🔍
          </strong>
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
            placeholder="🔍 Pesquisar no Dossiê..."
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
            <div key={m._id || m.titulo} className="materia-item">
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
                {new Date(m.dataCriacao).toLocaleString("pt-BR")}
              </p>
              <p>{m.conteudo}</p>
              <div
                style={{
                  marginTop: "15px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#ccc", fontSize: "0.8rem" }}>
                  {m.fonteNome === "Pulguinha (Bot)"
                    ? "🐔 Vigiado por Pulguinha"
                    : "📄 Apuração da Massa"}
                </span>
                {m.fonteUrl && (
                  <a
                    href={m.fonteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-fonte"
                  >
                    🔗 Ver Fonte
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#888" }}>
            Nenhuma matéria encontrada.
          </p>
        )}

        {totalPaginas > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            <button
              onClick={() => mudarPaginaESubir(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              className="btn-paginacao"
            >
              Anterior
            </button>
            <span style={{ color: "#fff" }}>
              {paginaAtual} / {totalPaginas}
            </span>
            <button
              onClick={() => mudarPaginaESubir(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              className="btn-paginacao"
            >
              Próxima
            </button>
          </div>
        )}
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
        <p>
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
