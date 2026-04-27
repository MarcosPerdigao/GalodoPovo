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
  const [modalTecnicosAberto, setModalTecnicosAberto] = useState(false);
  const [modalCampanhaAberto, setModalCampanhaAberto] = useState(true);
  const ITENS_POR_PAGINA = 10;

  // 📜 LISTA DE PROMESSAS (Revisada, sem repetições e focada em fatos)
  const listaPromessas = [
    {
      titulo: "Assumir e sanear 100% das dívidas do clube",
      situacao:
        "A promessa era que a SAF assumiria o passivo e o aporte inicial resolveria o sufoco. Porém, em abril de 2026, a dívida informada ainda gira em torno de R$ 1,7 bilhão, sendo R$ 1 bilhão apenas em dívidas bancárias onerosas.",
    },
    {
      titulo: "Acabar com os juros que 'comiam' o Atlético",
      situacao:
        "Os donos prometeram cessar o 'enxuga gelo'. Na realidade, a gestão financeira admite que o clube ainda paga cerca de R$ 250 milhões por ano somente em juros, fazendo a dívida crescer mesmo com recorde de arrecadação.",
    },
    {
      titulo: "Transformar o Galo em um clube autossustentável",
      situacao:
        "O discurso de 'sustentabilidade financeira' ruiu. Pedro Daniel admitiu em 2026 que o clube ainda não está sanado. O endividamento segue alto e as receitas são rapidamente engolidas pelos juros.",
    },
    {
      titulo: "Aporte rápido de R$ 500 milhões para tranquilidade financeira",
      situacao:
        "Foi prometido que o dinheiro entraria em 30 dias para dar 'tranquilidade ao futebol'. O aporte ocorreu, mas a tão falada tranquilidade nunca chegou, refletindo-se em contas estranguladas e instabilidade contínua.",
    },
    {
      titulo: "Time competitivo na 'Primeira Prateleira' do Brasil",
      situacao:
        "Promessa de rivalizar em estrutura e elenco com Flamengo e Palmeiras. Na prática: falhas na montagem do elenco, perda das Finais de 2024 e o time fora da Libertadores de 2025.",
    },
    {
      titulo: "Gestão profissional e planejamento a longo prazo",
      situacao:
        "O discurso de governança corporativa colidiu com a realidade esportiva: o Galo virou um 'moedor de técnicos' (4 treinadores em 2 anos de SAF), evidenciando amadorismo nas decisões do futebol.",
    },
    {
      titulo: "Obrigações financeiras rigorosamente em dia",
      situacao:
        "A desculpa de que 'a SAF acabaria com os atrasos' não se sustentou. O ano de 2025 foi marcado por atrasos salariais, luvas pendentes, direitos de imagem atrasados e notificações extrajudiciais de jogadores.",
    },
    {
      titulo: "Transparência e governança como valores inegociáveis",
      situacao:
        "Prometeram clareza total, mas a gestão é ofuscada por crises de comunicação, dúvidas sobre fundos de investimento (Galo Forte/Vorcaro) e falta de transparência sobre os beneficiários finais das operações.",
    },
    {
      titulo: "Buscar parceiro estrangeiro para fortalecer o projeto",
      situacao:
        "Rubens Menin declarou publicamente que o clube buscaria capital e expertise internacional. No fim, o controle ficou restrito e centralizado nos próprios mecenas/credores locais.",
    },
    {
      titulo: "Reaproximar a verdadeira Massa Atleticana",
      situacao:
        "A promessa mais quebrada de todas. O distanciamento aumentou com ingressos caros, elitização da Arena e um 'Conselho da Massa' que não tem voz ativa. O resultado é o atrito crônico entre os donos e a arquibancada.",
    },
  ];

  // 📋 HISTÓRICO DE TÉCNICOS EFETIVOS (ERA SAF)
  const historicoTecnicos = [
    {
      nome: "Luiz Felipe Scolari (Felipão)",
      periodo: "16/06/2023 - 20/03/2024",
      motivo: "Demissão",
      dias: "279 dias",
    },
    {
      nome: "Gabriel Milito",
      periodo: "24/03/2024 - 04/12/2024",
      motivo: "Demissão",
      dias: "256 dias",
    },
    {
      nome: "Cuca",
      periodo: "29/12/2024 - 29/08/2025",
      motivo: "Demissão",
      dias: "244 dias",
    },
    {
      nome: "Jorge Sampaoli",
      periodo: "02/09/2025 - 12/02/2026",
      motivo: "Demissão",
      dias: "164 dias",
    },
    {
      nome: "Eduardo Domínguez",
      periodo: "24/02/2026 - Atual",
      motivo: "Em cargo",
      dias: "Trabalhando...",
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

      {/* MODAL CAMPANHA INICIAL */}
      {modalCampanhaAberto && (
        <div
          onClick={() => setModalCampanhaAberto(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 10000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "rgba(17, 17, 17, 0.85)",
              border: "2px solid #FF4444",
              borderRadius: "10px",
              maxWidth: "500px",
              width: "100%",
              position: "relative",
              padding: "30px",
              textAlign: "center",
              boxShadow: "0 0 30px rgba(255, 68, 68, 0.5)",
            }}
          >
            <button
              onClick={() => setModalCampanhaAberto(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "20px",
                background: "none",
                border: "none",
                color: "#FF4444",
                fontSize: "1.5rem",
                cursor: "pointer",
              }}
            >
              ✖
            </button>
            <h2
              style={{
                color: "#FF4444",
                marginBottom: "15px",
                fontSize: "2.2rem",
                textTransform: "uppercase",
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              }}
            >
              🚨 #SafNota0 🚨
            </h2>
            <p
              style={{
                color: "#fff",
                fontSize: "1.1rem",
                marginBottom: "25px",
                lineHeight: "1.5",
              }}
            >
              A Massa não aguenta mais! Apoie a campanha do{" "}
              <strong>Frossard</strong> e mostre a indignação da arquibancada
              contra a atual gestão.
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <a
                href="COLOQUE_O_LINK_DO_TWITTER_AQUI"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: "#1DA1F2",
                  color: "#fff",
                  padding: "12px",
                  borderRadius: "5px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                }}
              >
                🐦 Ver o vídeo no X (Twitter)
              </a>
              <a
                href="COLOQUE_O_LINK_DO_INSTAGRAM_AQUI"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background:
                    "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                  color: "#fff",
                  padding: "12px",
                  borderRadius: "5px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                }}
              >
                📸 Ver o vídeo no Instagram
              </a>
            </div>
            <button
              onClick={() => setModalCampanhaAberto(false)}
              style={{
                marginTop: "25px",
                background: "none",
                border: "none",
                color: "#888",
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Fechar e continuar para o Dossiê
            </button>
          </div>
        </div>
      )}

      {/* MODAL PROMESSAS */}
      {modalPromessasAberto && (
        <div
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
                marginBottom: "20px",
              }}
            >
              📜 Promessas x Realidade
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
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    color: "#FFD700",
                    fontSize: "1.1rem",
                  }}
                >
                  {i + 1}. {p.titulo}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9rem",
                    color: "#ccc",
                    lineHeight: "1.5",
                  }}
                >
                  <strong>Situação hoje:</strong> {p.situacao}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL TÉCNICOS */}
      {modalTecnicosAberto && (
        <div
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
                marginBottom: "20px",
              }}
            >
              📉 Rotatividade de Técnicos (Era SAF)
            </h2>
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
                  }}
                >
                  {t.motivo.toUpperCase()}
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
              borderBottom: "1px dashed #FFD700",
              cursor: "pointer",
              paddingBottom: "1px",
            }}
            title="Clique para abrir a lista detalhada"
          >
            {listaPromessas.length}
          </strong>{" "}
          | Técnico atual:{" "}
          <strong
            onClick={() => setModalTecnicosAberto(true)}
            style={{
              color: "#FFD700",
              borderBottom: "1px dashed #FFD700",
              cursor: "pointer",
              paddingBottom: "1px",
            }}
            title="Clique para ver o histórico do moedor de técnicos"
          >
            {contador.diasTecnico} dias
          </strong>
        </p>
      </header>

      {/* Rosto dos Donos */}
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
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: "0 0 10px 0" }}>
              Rafael Menin
            </h2>
            <p
              style={{
                color: "#FF4444",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontSize: "1.3rem",
                margin: 0,
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
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "2.5rem", margin: "0 0 10px 0" }}>
              Rubens Menin
            </h2>
            <p
              style={{
                color: "#FF4444",
                fontWeight: "bold",
                textTransform: "uppercase",
                fontSize: "1.3rem",
                margin: 0,
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
                    🔗 Ver Matéria
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", color: "#888" }}>
            Nenhuma denúncia encontrada no radar.
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
            <button
              onClick={() => mudarPaginaESubir(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              className="btn-paginacao"
            >
              ◀ Anterior
            </button>
            <span style={{ color: "#fff", fontWeight: "bold" }}>
              Página {paginaAtual} de {totalPaginas}
            </span>
            <button
              onClick={() => mudarPaginaESubir(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              className="btn-paginacao"
            >
              Próxima ▶
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
