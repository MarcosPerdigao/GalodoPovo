import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [materias, setMaterias] = useState([]);
  const [contador, setContador] = useState({ dias: 0, diasTecnico: 0 });
  const [termoBusca, setTermoBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalPromessasAberto, setModalPromessasAberto] = useState(false);
  const [modalTecnicosAberto, setModalTecnicosAberto] = useState(false);

  // Modais e Estados Especiais
  const [modalCampanhaAberto, setModalCampanhaAberto] = useState(true);
  const [jurosRodando, setJurosRodando] = useState(0);
  const [denuncia, setDenuncia] = useState({
    nome: "",
    email: "",
    mensagem: "",
    midia: "",
  });
  const [statusDenuncia, setStatusDenuncia] = useState("");

  const ITENS_POR_PAGINA = 10;

  // 📜 LISTA DE 10 PROMESSAS CRÍTICAS (REVISADA)
  const listaPromessas = [
    {
      titulo: "Assumir e sanear 100% das dívidas do clube",
      situacao:
        "A promessa era que a SAF assumiria o passivo. Porém, em abril de 2026, a dívida ainda gira em torno de R$ 1,7 bilhão.",
    },
    {
      titulo: "Acabar com os juros que 'comiam' o Atlético",
      situacao:
        "Na realidade, a gestão admite pagar cerca de R$ 250 milhões por ano em juros, fazendo a dívida crescer continuamente.",
    },
    {
      titulo: "Transformar o Galo em um clube autossustentável",
      situacao:
        "O discurso ruiu. Pedro Daniel admitiu em 2026 que o clube não está sanado e receitas são engolidas pelos juros.",
    },
    {
      titulo: "Aporte rápido de R$ 500 milhões para tranquilidade",
      situacao:
        "O dinheiro entrou, mas a tranquilidade nunca chegou, refletindo-se em contas estranguladas e instabilidade.",
    },
    {
      titulo: "Time competitivo na 'Primeira Prateleira' do Brasil",
      situacao:
        "Falhas na montagem do elenco, perda de finais em 2024 e o time fora da Libertadores de 2025.",
    },
    {
      titulo: "Gestão profissional e planejamento a longo prazo",
      situacao:
        "O Galo virou um 'moedor de técnicos' (4 treinadores na Era SAF), evidenciando amadorismo nas decisões.",
    },
    {
      titulo: "Obrigações financeiras rigorosamente em dia",
      situacao:
        "2025 foi marcado por atrasos salariais, luvas pendentes e notificações extrajudiciais de jogadores.",
    },
    {
      titulo: "Transparência e governança como valores inegociáveis",
      situacao:
        "Gestão ofuscada por crises de comunicação e dúvidas sobre beneficiários de fundos (Galo Forte/Vorcaro).",
    },
    {
      titulo: "Buscar parceiro estrangeiro para o projeto",
      situacao:
        "Prometeram capital internacional, mas o controle ficou restrito aos próprios mecenas e credores locais.",
    },
    {
      titulo: "Reaproximar a verdadeira Massa Atleticana",
      situacao:
        "Distanciamento gerado por ingressos caros e elitização da Arena. Conselho da Massa sem voz ativa.",
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
      desc: "Venda de 75% aprovada com promessa de quitação de dívidas onerosas.",
    },
    {
      data: "Novembro / 2023",
      titulo: "Assunção Oficial",
      desc: "A SAF assume o comando. Começa o relógio da nova gestão.",
    },
    {
      data: "Dezembro / 2024",
      titulo: "Fracasso Esportivo",
      desc: "Perda das finais da Copa do Brasil e Libertadores.",
    },
    {
      data: "Ano de 2025",
      titulo: "Atrasos e Protestos",
      desc: "Atrasos salariais e de imagem. Trocas sucessivas de técnicos.",
    },
    {
      data: "Abril / 2026",
      titulo: "O Estopim da Massa",
      desc: "Goleada para o Flamengo. Lançamento da campanha #SafNota0.",
    },
  ];

  // 💸 LÓGICA DO TAXÍMETRO (R$ 250mi/ano)
  useEffect(() => {
    const taxaPorMilissegundo = 250000000 / (365 * 24 * 60 * 60 * 1000);
    const dataInicial = new Date("2026-01-01T00:00:00").getTime();
    const intervaloJuros = setInterval(() => {
      const agora = new Date().getTime();
      setJurosRodando((agora - dataInicial) * taxaPorMilissegundo);
    }, 50);
    return () => clearInterval(intervaloJuros);
  }, []);

  const jurosFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(jurosRodando);

  // FETCH DE DADOS
  useEffect(() => {
    window.scrollTo(0, 0);
    fetch("https://galodopovo-api.onrender.com/api/materias")
      .then((res) => res.json())
      .then(setMaterias)
      .catch(console.error);
    fetch("https://galodopovo-api.onrender.com/api/contador")
      .then((res) => res.json())
      .then(setContador)
      .catch(console.error);
  }, []);

  // FILTRO E PAGINAÇÃO
  const materiasFiltradas = materias.filter((m) => {
    const termo = termoBusca.toLowerCase();
    return (
      m.titulo?.toLowerCase().includes(termo) ||
      m.conteudo?.toLowerCase().includes(termo)
    );
  });

  const totalPaginas = Math.ceil(materiasFiltradas.length / ITENS_POR_PAGINA);
  const materiasPaginadas = materiasFiltradas.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA,
  );

  const mudarPaginaESubir = (n) => {
    setPaginaAtual(n);
    document
      .getElementById("inicio-dossie")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // ENVIO DE DENÚNCIA
  const enviarDenuncia = async (e) => {
    e.preventDefault();
    setStatusDenuncia("enviando");
    try {
      const res = await fetch(
        "https://galodopovo-api.onrender.com/api/sugestoes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(denuncia),
        },
      );
      if (res.ok) {
        setStatusDenuncia("sucesso");
        setDenuncia({ nome: "", email: "", mensagem: "", midia: "" });
        setTimeout(() => setStatusDenuncia(""), 5000);
      } else {
        setStatusDenuncia("erro");
      }
    } catch {
      setStatusDenuncia("erro");
    }
  };

  return (
    <div>
      <img src="/galo.png" alt="Escudo do Galo" className="bg-galo" />

      {/* MODAL CENTRAL DE PROTESTOS */}
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
              backgroundColor: "rgba(17, 17, 17, 0.9)",
              border: "2px solid #FF4444",
              borderRadius: "10px",
              maxWidth: "800px",
              width: "100%",
              position: "relative",
              padding: "30px",
              textAlign: "center",
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
                fontSize: "2rem",
                textTransform: "uppercase",
              }}
            >
              🚨 CENTRAL DE PROTESTOS 🚨
            </h2>
            <p style={{ color: "#fff", marginBottom: "25px" }}>
              A Massa não aguenta mais! Escolha sua frente de batalha:
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  flex: "1 1 300px",
                  backgroundColor: "#222",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid #444",
                }}
              >
                <h3 style={{ color: "#FFD700" }}>#SafNota0</h3>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#ccc",
                    marginBottom: "15px",
                  }}
                >
                  Apoie a campanha do Frossard nas redes sociais.
                </p>
                <a
                  href="https://x.com/frossard"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    backgroundColor: "#1DA1F2",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: "5px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    marginBottom: "5px",
                  }}
                >
                  X (Twitter)
                </a>
                <a
                  href="https://instagram.com/frossard"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    background: "linear-gradient(45deg, #f09433, #bc1888)",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: "5px",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Instagram
                </a>
              </div>
              <div
                style={{
                  flex: "1 1 300px",
                  backgroundColor: "#222",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid #444",
                }}
              >
                <h3 style={{ color: "#FFD700" }}>Adesivaço BH</h3>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#ccc",
                    marginBottom: "15px",
                  }}
                >
                  Ação da Culture_1908. Stickers por toda Belo Horizonte.
                </p>
                <a
                  href="https://x.com/culture_1908/status/2048826752756019334"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    border: "1px solid #1DA1F2",
                    color: "#1DA1F2",
                    padding: "10px",
                    borderRadius: "5px",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Apoiar no X
                </a>
              </div>
            </div>
            <button
              onClick={() => setModalCampanhaAberto(false)}
              style={{
                marginTop: "20px",
                background: "none",
                border: "none",
                color: "#888",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Fechar e ir para o Dossiê
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
              padding: "30px",
            }}
          >
            <h2
              style={{
                color: "#FFD700",
                borderBottom: "1px solid #333",
                paddingBottom: "15px",
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
                }}
              >
                <h3 style={{ color: "#FFD700", fontSize: "1.1rem" }}>
                  {i + 1}. {p.titulo}
                </h3>
                <p style={{ fontSize: "0.9rem", color: "#ccc" }}>
                  <strong>Situação:</strong> {p.situacao}
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
              cursor: "pointer",
              borderBottom: "1px dashed",
            }}
          >
            {listaPromessas.length}
          </strong>
        </p>
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
              fontSize: "0.8rem",
              color: "#FF4444",
              fontWeight: "bold",
            }}
          >
            💸 TAXÍMETRO DE JUROS (2026)
          </p>
          <p
            style={{
              margin: "5px 0",
              fontSize: "1.8rem",
              fontWeight: "bold",
              fontFamily: "monospace",
            }}
          >
            {jurosFormatado}
          </p>
        </div>
      </header>

      {/* Rostos dos Donos (Sem Borda) */}
      <div
        className="split-container"
        style={{ marginTop: "40px", border: "none" }}
      >
        {["rafael", "rubens"].map((dono) => (
          <div key={dono} className="split-side" style={{ border: "none" }}>
            <div
              className="card-estatico"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(/rosto-${dono}.jpg)`,
                border: "none",
                outline: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                height: "300px",
                borderRadius: "10px",
                textAlign: "center",
                paddingBottom: "20px",
              }}
            >
              <h2 style={{ color: "#fff", textTransform: "capitalize" }}>
                {dono} Menin
              </h2>
              <p style={{ color: "#FF4444", fontWeight: "bold" }}>DONO</p>
            </div>
          </div>
        ))}
      </div>

      {/* LINHA DO TEMPO */}
      <section
        style={{ maxWidth: "800px", margin: "50px auto", padding: "0 20px" }}
      >
        <h2
          style={{
            color: "#fff",
            textAlign: "center",
            borderBottom: "2px solid #333",
            paddingBottom: "10px",
          }}
        >
          ⏳ Linha do Tempo: O Colapso
        </h2>
        <div
          style={{
            borderLeft: "2px solid #444",
            paddingLeft: "20px",
            marginLeft: "10px",
          }}
        >
          {linhaDoTempo.map((item, i) => (
            <div key={i} style={{ marginBottom: "20px", position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "-27px",
                  top: "5px",
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#FFD700",
                  borderRadius: "50%",
                }}
              ></div>
              <span
                style={{
                  color: "#FFD700",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                }}
              >
                {item.data}
              </span>
              <h3 style={{ color: "#fff", margin: "5px 0" }}>{item.titulo}</h3>
              <p style={{ color: "#ccc", fontSize: "0.9rem" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CENTRAL DE VAZAMENTOS */}
      <section
        style={{
          maxWidth: "800px",
          margin: "50px auto",
          padding: "30px",
          backgroundColor: "#111",
          borderRadius: "10px",
          border: "1px solid #333",
        }}
      >
        <h2 style={{ color: "#FFD700", textAlign: "center" }}>
          🕵️‍♂️ Central de Vazamentos
        </h2>
        <form
          onSubmit={enviarDenuncia}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          <input
            type="text"
            placeholder="Seu Nome (Opcional)"
            value={denuncia.nome}
            onChange={(e) => setDenuncia({ ...denuncia, nome: e.target.value })}
            style={{
              padding: "12px",
              backgroundColor: "#222",
              color: "#fff",
              border: "1px solid #444",
            }}
          />
          <textarea
            required
            placeholder="Relate a denúncia aqui... *"
            value={denuncia.mensagem}
            onChange={(e) =>
              setDenuncia({ ...denuncia, mensagem: e.target.value })
            }
            rows="4"
            style={{
              padding: "12px",
              backgroundColor: "#222",
              color: "#fff",
              border: "1px solid #444",
            }}
          />
          <input
            type="text"
            placeholder="Link de Mídia/Documento"
            value={denuncia.midia}
            onChange={(e) =>
              setDenuncia({ ...denuncia, midia: e.target.value })
            }
            style={{
              padding: "12px",
              backgroundColor: "#222",
              color: "#fff",
              border: "1px solid #444",
            }}
          />
          <button
            type="submit"
            disabled={statusDenuncia === "enviando"}
            style={{
              padding: "15px",
              backgroundColor: "#FF4444",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            {statusDenuncia === "enviando"
              ? "Enviando..."
              : "🚨 ENVIAR DENÚNCIA"}
          </button>
          {statusDenuncia === "sucesso" && (
            <p style={{ color: "#00FF00", textAlign: "center" }}>
              ✅ Denúncia enviada!
            </p>
          )}
        </form>
      </section>

      {/* DOSSIÊ DE MATÉRIAS */}
      <section className="materias-section" id="inicio-dossie">
        <h2 className="titulo-secao">O Dossiê Completo</h2>
        <input
          type="text"
          placeholder="🔍 Pesquisar no Dossiê..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          style={{
            width: "100%",
            padding: "15px",
            marginBottom: "30px",
            backgroundColor: "#111",
            color: "#fff",
            border: "1px solid #444",
          }}
        />
        {materiasPaginadas.map((m, i) => (
          <div key={i} className="materia-item">
            <h2>{m.titulo}</h2>
            <p style={{ fontSize: "0.8rem", color: "#888" }}>
              🕒 {new Date(m.dataCriacao).toLocaleDateString("pt-BR")}
            </p>
            <p>{m.conteudo}</p>
            {m.fonteUrl && (
              <a
                href={m.fonteUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-fonte"
              >
                🔗 Ver Fonte
              </a>
            )}
          </div>
        ))}
        {totalPaginas > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              marginTop: "30px",
            }}
          >
            <button
              onClick={() => mudarPaginaESubir(paginaAtual - 1)}
              disabled={paginaAtual === 1}
              style={{
                padding: "10px 20px",
                backgroundColor: paginaAtual === 1 ? "#333" : "#FFD700",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Anterior
            </button>
            <button
              onClick={() => mudarPaginaESubir(paginaAtual + 1)}
              disabled={paginaAtual === totalPaginas}
              style={{
                padding: "10px 20px",
                backgroundColor:
                  paginaAtual === totalPaginas ? "#333" : "#FFD700",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Próxima
            </button>
          </div>
        )}
      </section>

      <footer
        style={{
          textAlign: "center",
          padding: "50px",
          color: "#555",
          fontSize: "0.8rem",
        }}
      >
        <p>
          Galo do Povo © {new Date().getFullYear()} - O Dossiê da Massa.
          Iniciativa Independente.
        </p>
      </footer>
    </div>
  );
}
