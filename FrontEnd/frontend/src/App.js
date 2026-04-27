import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [materias, setMaterias] = useState([]);
  const [contador, setContador] = useState({ dias: 0, diasTecnico: 0 });
  const [termoBusca, setTermoBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalPromessasAberto, setModalPromessasAberto] = useState(false);
  const [modalTecnicosAberto, setModalTecnicosAberto] = useState(false);
  const [modalCampanhaAberto, setModalCampanhaAberto] = useState(true);

  // 👇 NOVO ESTADO: O Taxímetro de Juros 👇
  const [jurosRodando, setJurosRodando] = useState(0);

  const ITENS_POR_PAGINA = 10;

  // 📜 LISTA DE 10 PROMESSAS CRÍTICAS
  const listaPromessas = [
    {
      titulo: "Assumir e sanear 100% das dívidas do clube",
      situacao:
        "A promessa era que a SAF assumiria o passivo. Porém, em abril de 2026, a dívida ainda gira em torno de R$ 1,7 bilhão, sendo R$ 1 bilhão apenas em dívidas bancárias onerosas.",
    },
    {
      titulo: "Acabar com os juros que 'comiam' o Atlético",
      situacao:
        "Na realidade, a gestão financeira admite que o clube ainda paga cerca de R$ 250 milhões por ano somente em juros, fazendo a dívida crescer mesmo com recorde de arrecadação.",
    },
    {
      titulo: "Transformar o Galo em um clube autossustentável",
      situacao:
        "Pedro Daniel admitiu em 2026 que o clube ainda não está sanado. O endividamento segue alto e as receitas são engolidas pelos juros.",
    },
    {
      titulo: "Aporte rápido de R$ 500 milhões para tranquilidade",
      situacao:
        "Foi prometido que o dinheiro daria 'tranquilidade ao futebol'. O aporte ocorreu, mas a tranquilidade nunca chegou, refletindo-se em instabilidade contínua.",
    },
    {
      titulo: "Time competitivo na 'Primeira Prateleira' do Brasil",
      situacao:
        "Promessa de rivalizar com Flamengo e Palmeiras. Na prática: falhas no elenco, perda das Finais de 2024 e o time fora da Libertadores de 2025.",
    },
    {
      titulo: "Gestão profissional e planejamento a longo prazo",
      situacao:
        "O discurso corporativo colidiu com a realidade: o Galo virou um 'moedor de técnicos' (4 treinadores na Era SAF), evidenciando amadorismo.",
    },
    {
      titulo: "Obrigações financeiras rigorosamente em dia",
      situacao:
        "O ano de 2025 foi marcado por atrasos salariais, luvas pendentes, direitos de imagem atrasados e notificações extrajudiciais.",
    },
    {
      titulo: "Transparência e governança como valores inegociáveis",
      situacao:
        "A gestão é ofuscada por crises de comunicação, dúvidas sobre o Fundo Galo Forte e falta de transparência sobre beneficiários.",
    },
    {
      titulo: "Buscar parceiro estrangeiro para fortalecer o projeto",
      situacao:
        "Prometeram buscar capital internacional. No fim, o controle ficou restrito e centralizado nos próprios mecenas/credores locais.",
    },
    {
      titulo: "Reaproximar a verdadeira Massa Atleticana",
      situacao:
        "O distanciamento aumentou com ingressos caros, elitização da Arena e um 'Conselho da Massa' sem voz ativa.",
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

  // ⏳ LINHA DO TEMPO DAS CRISES
  const linhaDoTempo = [
    {
      data: "Julho / 2023",
      titulo: "Aprovação da SAF",
      desc: "Venda de 75% do clube aprovada. Promessa de quitação das dívidas onerosas.",
    },
    {
      data: "Novembro / 2023",
      titulo: "Assunção Oficial",
      desc: "A SAF passa a comandar oficialmente o clube. Começa o 'relógio' da gestão.",
    },
    {
      data: "Dezembro / 2024",
      titulo: "Fracasso Esportivo",
      desc: "Após um ano de altos e baixos, perda das finais da Copa do Brasil e Libertadores.",
    },
    {
      data: "Ano de 2025",
      titulo: "Atrasos e Protestos",
      desc: "Elenco sofre com atrasos salariais e de imagem. Trocas sucessivas de técnicos.",
    },
    {
      data: "Fevereiro / 2026",
      titulo: "Queda de Sampaoli",
      desc: "Segunda passagem do técnico termina de forma abrupta, mostrando falta de planejamento.",
    },
    {
      data: "Abril / 2026",
      titulo: "O Estopim da Massa",
      desc: "Goleada para o Flamengo. Protestos pesados contra os donos da SAF e jogadores. Campanha #SafNota0.",
    },
  ];

  // 👇 LÓGICA DO TAXÍMETRO DE JUROS 👇
  useEffect(() => {
    // Cálculo: R$ 250.000.000 / ano
    const taxaPorMilissegundo = 250000000 / (365 * 24 * 60 * 60 * 1000);
    const dataInicial = new Date("2026-01-01T00:00:00").getTime(); // Conta a partir do início de 2026

    const intervaloJuros = setInterval(() => {
      const agora = new Date().getTime();
      const diferencaTempo = agora - dataInicial;
      setJurosRodando(diferencaTempo * taxaPorMilissegundo);
    }, 50); // Atualiza a cada 50 milissegundos para o número girar rápido

    return () => clearInterval(intervaloJuros);
  }, []);

  // Formata o dinheiro para ficar bonito (R$ 1.000.000,00)
  const jurosFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(jurosRodando);

  useEffect(() => {
    window.scrollTo(0, 0);
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    fetch("https://galodopovo-api.onrender.com/api/materias")
      .then((res) => res.json())
      .then((data) => setMaterias(data))
      .catch(console.error);
    fetch("https://galodopovo-api.onrender.com/api/contador")
      .then((res) => res.json())
      .then((data) => setContador(data))
      .catch(console.error);
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
    if (secaoDossie)
      secaoDossie.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <img src="/galo.png" alt="Escudo do Galo" className="bg-galo" />

      {/* 👇 MODAL: CENTRAL DE PROTESTOS INICIAL 👇 */}
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
              maxWidth: "800px",
              width:
                "100%" /* 👈 Aumentei a largura pra caber as duas campanhas */,
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
                marginBottom: "10px",
                fontSize: "2.2rem",
                textTransform: "uppercase",
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              }}
            >
              🚨 CENTRAL DE PROTESTOS 🚨
            </h2>
            <p
              style={{
                color: "#fff",
                fontSize: "1.1rem",
                marginBottom: "25px",
                lineHeight: "1.5",
              }}
            >
              A Massa não aguenta mais! Escolha sua frente de batalha e
              fortaleça a resistência contra a atual gestão:
            </p>

            {/* 👇 GRID COM AS DUAS CAMPANHAS LADO A LADO 👇 */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                justifyContent: "center",
              }}
            >
              {/* CAMPANHA 1: Frossard */}
              <div
                style={{
                  flex: "1 1 300px",
                  backgroundColor: "#222",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid #444",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <h3
                  style={{
                    color: "#FFD700",
                    margin: "0 0 10px 0",
                    fontSize: "1.3rem",
                  }}
                >
                  #SafNota0
                </h3>
                <p
                  style={{
                    color: "#ccc",
                    fontSize: "0.95rem",
                    marginBottom: "20px",
                    flex: 1,
                  }}
                >
                  Apoie a campanha do <strong>Frossard</strong> e mostre a
                  indignação da arquibancada nas redes sociais.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <a
                    href="COLOQUE_O_LINK_DO_TWITTER_AQUI"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: "#1DA1F2",
                      color: "#fff",
                      padding: "10px",
                      borderRadius: "5px",
                      textDecoration: "none",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    🐦 Ver vídeo no X
                  </a>
                  <a
                    href="COLOQUE_O_LINK_DO_INSTAGRAM_AQUI"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background:
                        "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
                      color: "#fff",
                      padding: "10px",
                      borderRadius: "5px",
                      textDecoration: "none",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    📸 Ver no Instagram
                  </a>
                </div>
              </div>

              {/* CAMPANHA 2: Culture_1908 */}
              <div
                style={{
                  flex: "1 1 300px",
                  backgroundColor: "#222",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid #444",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <h3
                  style={{
                    color: "#FFD700",
                    margin: "0 0 10px 0",
                    fontSize: "1.3rem",
                  }}
                >
                  Adesivaço BH
                </h3>
                <p
                  style={{
                    color: "#ccc",
                    fontSize: "0.95rem",
                    marginBottom: "20px",
                    flex: 1,
                  }}
                >
                  Ação da <strong>Culture_1908</strong>. Ajude a capitalizar e
                  lotar Belo Horizonte com os stickers do protesto.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <a
                    href="https://x.com/culture_1908/status/2048826752756019334?s=20"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: "#000",
                      border: "1px solid #1DA1F2",
                      color: "#1DA1F2",
                      padding: "10px",
                      borderRadius: "5px",
                      textDecoration: "none",
                      fontWeight: "bold",
                      fontSize: "1rem",
                    }}
                  >
                    🖤 Apoiar Campanha no X
                  </a>
                </div>
              </div>
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
          >
            {contador.diasTecnico} dias
          </strong>
        </p>

        {/* 👇 O TAXÍMETRO NA TELA 👇 */}
        <div
          style={{
            marginTop: "20px",
            backgroundColor: "rgba(255,0,0,0.15)",
            border: "1px solid #FF4444",
            padding: "15px",
            borderRadius: "8px",
            display: "inline-block",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.9rem",
              color: "#FF4444",
              textTransform: "uppercase",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
          >
            💸 Taxímetro de Juros (Somente neste ano)
          </p>
          <p
            style={{
              margin: "5px 0 0 0",
              fontSize: "2rem",
              color: "#fff",
              fontWeight: "bold",
              fontFamily: "monospace",
              textShadow: "0 0 10px rgba(255,0,0,0.5)",
            }}
          >
            {jurosFormatado}
          </p>
          <p style={{ margin: "5px 0 0 0", fontSize: "0.7rem", color: "#888" }}>
            Baseado na estimativa de R$ 250 mi/ano (R$ 7,92 por segundo).
          </p>
        </div>
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

      {/* 👇 NOVA SEÇÃO: LINHA DO TEMPO 👇 */}
      <section
        style={{ maxWidth: "800px", margin: "50px auto", padding: "0 20px" }}
      >
        <h2
          style={{
            color: "#fff",
            borderBottom: "2px solid #333",
            paddingBottom: "10px",
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          ⏳ Linha do Tempo: O Colapso
        </h2>
        <div
          style={{
            position: "relative",
            borderLeft: "2px solid #444",
            paddingLeft: "20px",
            marginLeft: "10px",
          }}
        >
          {linhaDoTempo.map((item, index) => (
            <div
              key={index}
              style={{ marginBottom: "25px", position: "relative" }}
            >
              {/* Bolinha da timeline */}
              <div
                style={{
                  position: "absolute",
                  left: "-27px",
                  top: "5px",
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#FFD700",
                  borderRadius: "50%",
                  border: "2px solid #111",
                }}
              ></div>
              <span
                style={{
                  color: "#FFD700",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  letterSpacing: "1px",
                }}
              >
                {item.data}
              </span>
              <h3
                style={{ color: "#fff", margin: "5px 0", fontSize: "1.2rem" }}
              >
                {item.titulo}
              </h3>
              <p
                style={{
                  color: "#ccc",
                  fontSize: "0.95rem",
                  margin: 0,
                  lineHeight: "1.4",
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

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
              style={{
                padding: "10px 15px",
                backgroundColor: paginaAtual === 1 ? "#333" : "#FFD700",
                color: paginaAtual === 1 ? "#777" : "#000",
                border: "none",
                borderRadius: "5px",
                fontWeight: "bold",
                cursor: paginaAtual === 1 ? "not-allowed" : "pointer",
                transition: "all 0.3s",
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
                  paginaAtual === totalPaginas ? "#333" : "#FFD700",
                color: paginaAtual === totalPaginas ? "#777" : "#000",
                border: "none",
                borderRadius: "5px",
                fontWeight: "bold",
                cursor:
                  paginaAtual === totalPaginas ? "not-allowed" : "pointer",
                transition: "all 0.3s",
              }}
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
