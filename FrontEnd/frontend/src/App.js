import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://galodopovo-api.onrender.com";

const IS_ADMIN_ROUTE = window.location.pathname === "/admin";
const ITENS_POR_PAGINA = 10;

export default function App() {
  const [materias, setMaterias] = useState([]);
  const [contador, setContador] = useState({
    dias: 0,
    diasTecnico: 0,
    mentiras: 0,
  });
  const [mudancasSemana, setMudancasSemana] = useState([]);
  const [promessasDestaqueData, setPromessasDestaqueData] = useState([]);
  const [termometroPromessas, setTermometroPromessas] = useState({});
  const [votosPromessasLocais, setVotosPromessasLocais] = useState({});
  const [promessasData, setPromessasData] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [tecnicosData, setTecnicosData] = useState([]);
  const [linhaDoTempoData, setLinhaDoTempoData] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalPromessasAberto, setModalPromessasAberto] = useState(false);
  const [modalTecnicosAberto, setModalTecnicosAberto] = useState(false);
  const [modalCampanhaAberto, setModalCampanhaAberto] = useState(false);
  const [jurosRodando, setJurosRodando] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erroApi, setErroApi] = useState("");
  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    mensagem: "",
  });
  const [enviandoFormulario, setEnviandoFormulario] = useState(false);
  const [mensagemFormulario, setMensagemFormulario] = useState("");
  const [erroFormulario, setErroFormulario] = useState("");

  const [adminToken, setAdminToken] = useState(
    localStorage.getItem("galo_admin_token") || "",
  );
  const [adminPromessas, setAdminPromessas] = useState([]);
  const [adminCarregando, setAdminCarregando] = useState(false);
  const [adminErro, setAdminErro] = useState("");
  const [adminMensagem, setAdminMensagem] = useState("");
  const [promessaEditandoId, setPromessaEditandoId] = useState(null);
  const [formPromessaAdmin, setFormPromessaAdmin] = useState({
    chave: "",
    titulo: "",
    status: "Sob cobrança",
    resumo: "",
    situacao: "",
    destaqueHome: false,
    ordem: 0,
    ativa: true,
  });

  const tecnicosTrocados = tecnicosData.filter(
    (t) => t.motivo !== "Em cargo",
  ).length;

  useEffect(() => {
    const calcularJuros = () => {
      const agora = new Date();
      const anoAtual = agora.getFullYear();

      const inicioDoAno = new Date(anoAtual, 0, 1, 0, 0, 0, 0);
      const inicioProximoAno = new Date(anoAtual + 1, 0, 1, 0, 0, 0, 0);

      const milissegundosNoAno =
        inicioProximoAno.getTime() - inicioDoAno.getTime();

      const jurosAno = 250000000;
      const taxaPorMilissegundo = jurosAno / milissegundosNoAno;
      const diferencaTempo = agora.getTime() - inicioDoAno.getTime();

      setJurosRodando(Math.max(diferencaTempo * taxaPorMilissegundo, 0));
    };

    calcularJuros();
    const intervaloJuros = setInterval(calcularJuros, 1000);

    return () => clearInterval(intervaloJuros);
  }, []);

  const jurosFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(jurosRodando);

  useEffect(() => {
    window.scrollTo(0, 0);

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    async function carregarDados() {
      setCarregando(true);
      setErroApi("");

      try {
        const [materiasResultado, homeResultado] = await Promise.allSettled([
          fetch(`${API_BASE}/api/materias?page=1&limit=100`).then(
            async (resMaterias) => {
              if (!resMaterias.ok) {
                throw new Error("Não foi possível carregar as matérias.");
              }

              return resMaterias.json();
            },
          ),
          fetch(`${API_BASE}/api/home`).then(async (resHome) => {
            if (!resHome.ok) {
              throw new Error("Não foi possível carregar os dados da home.");
            }

            return resHome.json();
          }),
        ]);

        if (materiasResultado.status === "fulfilled") {
          const dataMaterias = materiasResultado.value;

          setMaterias(
            Array.isArray(dataMaterias)
              ? dataMaterias
              : dataMaterias.itens || [],
          );
        } else {
          console.error(
            "Erro ao carregar matérias:",
            materiasResultado.reason,
          );
        }

        if (homeResultado.status === "fulfilled") {
          const dataHome = homeResultado.value;

          setContador(
            dataHome.contador || { dias: 0, diasTecnico: 0, mentiras: 0 },
          );
          setMudancasSemana(dataHome.resumoSemana || []);
          setPromessasDestaqueData(dataHome.promessasDestaque || []);
          setPromessasData(dataHome.promessas || []);
          setTecnicosData(dataHome.tecnicos || []);
          setLinhaDoTempoData(dataHome.linhaDoTempo || []);
        } else {
          console.error(
            "Erro ao carregar dados da home:",
            homeResultado.reason,
          );
        }

        if (
          materiasResultado.status === "rejected" &&
          homeResultado.status === "rejected"
        ) {
          setErroApi(
            "Não foi possível carregar o dossiê agora. Tente novamente em instantes.",
          );
        }
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, []);

  useEffect(() => {
    try {
      const votosSalvos = localStorage.getItem("galo_termometro_promessas");
      if (votosSalvos) {
        setVotosPromessasLocais(JSON.parse(votosSalvos));
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    async function carregarTermometroPromessas() {
      try {
        const resposta = await fetch(
          `${API_BASE}/api/termometro/promessa-destaque`,
        );

        if (!resposta.ok) {
          throw new Error(
            "Não foi possível carregar o termômetro das promessas.",
          );
        }

        const data = await resposta.json();
        setTermometroPromessas(data.itens || {});
      } catch (error) {
        console.error(error);
        setTermometroPromessas({});
      }
    }

    carregarTermometroPromessas();
  }, []);

  const carregarAdminPromessas = useCallback(async () => {
    if (!adminToken.trim()) return;

    try {
      setAdminCarregando(true);
      setAdminErro("");
      setAdminMensagem("");

      const resposta = await fetch(`${API_BASE}/api/admin/promessas`, {
        headers: {
          "x-admin-key": adminToken,
        },
      });

      const data = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          data?.message || "Não foi possível carregar as promessas.",
        );
      }

      setAdminPromessas(data.itens || []);
    } catch (error) {
      console.error(error);
      setAdminErro(error.message || "Erro ao carregar promessas.");
      setAdminPromessas([]);
    } finally {
      setAdminCarregando(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (IS_ADMIN_ROUTE && adminToken.trim()) {
      carregarAdminPromessas();
    }
  }, [adminToken, carregarAdminPromessas]);

  const materiasFiltradas = useMemo(() => {
    const termo = termoBusca.toLowerCase().trim();

    if (!termo) return materias;

    return materias.filter((m) => {
      const titulo = m?.titulo ? m.titulo.toLowerCase() : "";
      const conteudo = m?.conteudo ? m.conteudo.toLowerCase() : "";
      const fonte = m?.fonteNome ? m.fonteNome.toLowerCase() : "";

      return (
        titulo.includes(termo) ||
        conteudo.includes(termo) ||
        fonte.includes(termo)
      );
    });
  }, [materias, termoBusca]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [termoBusca]);

  const totalPaginas = Math.max(
    Math.ceil(materiasFiltradas.length / ITENS_POR_PAGINA),
    1,
  );

  const indexUltimoItem = paginaAtual * ITENS_POR_PAGINA;
  const indexPrimeiroItem = indexUltimoItem - ITENS_POR_PAGINA;
  const materiasPaginadas = materiasFiltradas.slice(
    indexPrimeiroItem,
    indexUltimoItem,
  );

  const mudarPaginaESubir = (novaPagina) => {
    if (novaPagina < 1 || novaPagina > totalPaginas) return;

    setPaginaAtual(novaPagina);

    const secaoDossie = document.getElementById("inicio-dossie");
    if (secaoDossie) {
      secaoDossie.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleFormularioChange = (e) => {
    const { name, value } = e.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
  };

  const handleEnviarFormulario = async (e) => {
    e.preventDefault();
    setMensagemFormulario("");
    setErroFormulario("");
    setEnviandoFormulario(true);

    try {
      const resposta = await fetch(`${API_BASE}/api/sugestoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formulario),
      });

      const data = await resposta.json();

      if (!resposta.ok) {
        throw new Error(data?.message || "Não foi possível enviar a mensagem.");
      }

      setMensagemFormulario(
        "Mensagem enviada com sucesso. Obrigado por fortalecer o dossiê.",
      );
      setFormulario({ nome: "", email: "", mensagem: "" });
    } catch (error) {
      console.error(error);
      setErroFormulario(error.message || "Erro ao enviar a mensagem.");
    } finally {
      setEnviandoFormulario(false);
    }
  };

  const obterSessionId = () => {
    const chave = "galo_session_id";
    let sessionId = localStorage.getItem(chave);

    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(chave, sessionId);
    }

    return sessionId;
  };

  const obterTotaisPromessa = (itemId) => {
    return (
      termometroPromessas[itemId] || {
        cobrar_agora: 0,
        importa_muito: 0,
        nao_prioridade: 0,
      }
    );
  };

  const handleVotarPromessa = async (itemId, voto) => {
    try {
      const sessionId = obterSessionId();

      const resposta = await fetch(`${API_BASE}/api/termometro/votar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemTipo: "promessa-destaque",
          itemId,
          voto,
          sessionId,
        }),
      });

      const data = await resposta.json();

      if (!resposta.ok) {
        throw new Error(data?.message || "Não foi possível registrar o voto.");
      }

      setTermometroPromessas((atual) => ({
        ...atual,
        [itemId]: data.totais,
      }));

      const novosVotosLocais = {
        ...votosPromessasLocais,
        [itemId]: voto,
      };

      setVotosPromessasLocais(novosVotosLocais);
      localStorage.setItem(
        "galo_termometro_promessas",
        JSON.stringify(novosVotosLocais),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const salvarAdminToken = (valor) => {
    setAdminToken(valor);
    localStorage.setItem("galo_admin_token", valor);
  };

  const handleFormPromessaAdminChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormPromessaAdmin((atual) => ({
      ...atual,
      [name]:
        type === "checkbox"
          ? checked
          : name === "ordem"
            ? Number(value)
            : value,
    }));
  };

  const limparFormPromessaAdmin = () => {
    setPromessaEditandoId(null);
    setFormPromessaAdmin({
      chave: "",
      titulo: "",
      status: "Sob cobrança",
      resumo: "",
      situacao: "",
      destaqueHome: false,
      ordem: 0,
      ativa: true,
    });
  };


  const handleEditarPromessaAdmin = (item) => {
    setPromessaEditandoId(item._id);
    setFormPromessaAdmin({
      chave: item.chave || "",
      titulo: item.titulo || "",
      status: item.status || "Sob cobrança",
      resumo: item.resumo || "",
      situacao: item.situacao || "",
      destaqueHome: Boolean(item.destaqueHome),
      ordem: Number(item.ordem || 0),
      ativa: item.ativa !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSalvarPromessaAdmin = async (e) => {
    e.preventDefault();

    if (!adminToken.trim()) {
      setAdminErro("Informe a chave admin.");
      return;
    }

    try {
      setAdminErro("");
      setAdminMensagem("");

      const url = promessaEditandoId
        ? `${API_BASE}/api/admin/promessas/${promessaEditandoId}`
        : `${API_BASE}/api/admin/promessas`;

      const metodo = promessaEditandoId ? "PUT" : "POST";

      const resposta = await fetch(url, {
        method: metodo,
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminToken,
        },
        body: JSON.stringify(formPromessaAdmin),
      });

      const data = await resposta.json();

      if (!resposta.ok) {
        throw new Error(data?.message || "Não foi possível salvar a promessa.");
      }

      setAdminMensagem(
        promessaEditandoId
          ? "Promessa atualizada com sucesso."
          : "Promessa criada com sucesso.",
      );

      limparFormPromessaAdmin();
      await carregarAdminPromessas();
    } catch (error) {
      console.error(error);
      setAdminErro(error.message || "Erro ao salvar promessa.");
    }
  };

  const handleDesativarPromessaAdmin = async (id) => {
    if (!adminToken.trim()) {
      setAdminErro("Informe a chave admin.");
      return;
    }

    const confirmou = window.confirm("Deseja desativar esta promessa?");
    if (!confirmou) return;

    try {
      setAdminErro("");
      setAdminMensagem("");

      const resposta = await fetch(`${API_BASE}/api/admin/promessas/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-key": adminToken,
        },
      });

      const data = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          data?.message || "Não foi possível desativar a promessa.",
        );
      }

      setAdminMensagem("Promessa desativada com sucesso.");
      await carregarAdminPromessas();
    } catch (error) {
      console.error(error);
      setAdminErro(error.message || "Erro ao desativar promessa.");
    }
  };
  if (IS_ADMIN_ROUTE) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0b0b0b",
          color: "#fff",
          padding: "30px 20px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <h1 style={{ marginTop: 0, color: "#FFD700" }}>
            Admin · Promessas do Galo do Povo
          </h1>

          <p style={{ color: "#bbb", lineHeight: "1.6" }}>
            Painel mínimo para manter as promessas sem mexer no código.
          </p>

          <div
            style={{
              backgroundColor: "#111",
              border: "1px solid #333",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#FFD700",
                fontWeight: "bold",
              }}
            >
              Chave admin
            </label>

            <input
              type="password"
              value={adminToken}
              onChange={(e) => salvarAdminToken(e.target.value)}
              placeholder="Cole aqui sua ADMIN_TOKEN"
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "1rem",
                borderRadius: "8px",
                border: "1px solid #444",
                backgroundColor: "#181818",
                color: "#fff",
              }}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.2fr",
              gap: "24px",
            }}
          >
            <div
              style={{
                backgroundColor: "#111",
                border: "1px solid #333",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <h2 style={{ marginTop: 0, color: "#FFD700" }}>
                {promessaEditandoId ? "Editar promessa" : "Nova promessa"}
              </h2>

              <form
                onSubmit={handleSalvarPromessaAdmin}
                style={{ display: "grid", gap: "12px" }}
              >
                <input
                  type="text"
                  name="chave"
                  placeholder="chave"
                  value={formPromessaAdmin.chave}
                  onChange={handleFormPromessaAdminChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    backgroundColor: "#181818",
                    color: "#fff",
                  }}
                />

                <input
                  type="text"
                  name="titulo"
                  placeholder="Título"
                  value={formPromessaAdmin.titulo}
                  onChange={handleFormPromessaAdminChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    backgroundColor: "#181818",
                    color: "#fff",
                  }}
                />

                <input
                  type="text"
                  name="status"
                  placeholder="Status"
                  value={formPromessaAdmin.status}
                  onChange={handleFormPromessaAdminChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    backgroundColor: "#181818",
                    color: "#fff",
                  }}
                />

                <textarea
                  name="resumo"
                  placeholder="Resumo"
                  rows={4}
                  value={formPromessaAdmin.resumo}
                  onChange={handleFormPromessaAdminChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    backgroundColor: "#181818",
                    color: "#fff",
                    resize: "vertical",
                  }}
                />

                <textarea
                  name="situacao"
                  placeholder="Situação atual"
                  rows={6}
                  value={formPromessaAdmin.situacao}
                  onChange={handleFormPromessaAdminChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    backgroundColor: "#181818",
                    color: "#fff",
                    resize: "vertical",
                  }}
                />

                <input
                  type="number"
                  name="ordem"
                  placeholder="Ordem"
                  value={formPromessaAdmin.ordem}
                  onChange={handleFormPromessaAdminChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #444",
                    backgroundColor: "#181818",
                    color: "#fff",
                  }}
                />

                <label
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <input
                    type="checkbox"
                    name="destaqueHome"
                    checked={formPromessaAdmin.destaqueHome}
                    onChange={handleFormPromessaAdminChange}
                  />
                  Destaque na home
                </label>

                <label
                  style={{ display: "flex", gap: "10px", alignItems: "center" }}
                >
                  <input
                    type="checkbox"
                    name="ativa"
                    checked={formPromessaAdmin.ativa}
                    onChange={handleFormPromessaAdminChange}
                  />
                  Ativa
                </label>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="submit"
                    style={{
                      backgroundColor: "#FFD700",
                      color: "#111",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    {promessaEditandoId ? "Salvar edição" : "Criar promessa"}
                  </button>

                  <button
                    type="button"
                    onClick={limparFormPromessaAdmin}
                    style={{
                      backgroundColor: "transparent",
                      color: "#fff",
                      border: "1px solid #555",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Limpar
                  </button>
                </div>
              </form>

              {adminMensagem && (
                <p style={{ color: "#7CFC98", marginTop: "14px" }}>
                  {adminMensagem}
                </p>
              )}

              {adminErro && (
                <p style={{ color: "#FF8888", marginTop: "14px" }}>
                  {adminErro}
                </p>
              )}
            </div>

            <div
              style={{
                backgroundColor: "#111",
                border: "1px solid #333",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                <h2 style={{ margin: 0, color: "#FFD700" }}>
                  Promessas cadastradas
                </h2>

                <button
                  onClick={carregarAdminPromessas}
                  style={{
                    backgroundColor: "transparent",
                    color: "#fff",
                    border: "1px solid #555",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Atualizar
                </button>
              </div>

              {adminCarregando ? (
                <p style={{ color: "#aaa" }}>Carregando promessas...</p>
              ) : adminPromessas.length === 0 ? (
                <p style={{ color: "#aaa" }}>Nenhuma promessa encontrada.</p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {adminPromessas.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        backgroundColor: "#181818",
                        border: "1px solid #2f2f2f",
                        borderRadius: "10px",
                        padding: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        <div>
                          <strong style={{ color: "#fff" }}>
                            {item.titulo}
                          </strong>
                          <div style={{ color: "#888", fontSize: "0.85rem" }}>
                            chave: {item.chave} · ordem: {item.ordem}
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: item.ativa ? "#7CFC98" : "#FF8888",
                            fontWeight: "bold",
                          }}
                        >
                          {item.ativa ? "ATIVA" : "INATIVA"}
                        </span>
                      </div>

                      <div style={{ color: "#ccc", fontSize: "0.92rem" }}>
                        Status: {item.status}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          flexWrap: "wrap",
                          marginTop: "12px",
                        }}
                      >
                        <button
                          onClick={() => handleEditarPromessaAdmin(item)}
                          style={{
                            backgroundColor: "transparent",
                            color: "#FFD700",
                            border: "1px solid rgba(255,215,0,0.35)",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleDesativarPromessaAdmin(item._id)}
                          style={{
                            backgroundColor: "transparent",
                            color: "#FF8888",
                            border: "1px solid rgba(255,80,80,0.35)",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          Desativar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <img src="/galo.png" alt="Escudo do Galo" className="bg-galo" />

      {modalCampanhaAberto && (
        <div
          onClick={() => setModalCampanhaAberto(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.65)",
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
              backgroundColor: "rgba(17, 17, 17, 0.92)",
              border: "2px solid #FF4444",
              borderRadius: "10px",
              maxWidth: "800px",
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
                marginBottom: "10px",
                fontSize: "2rem",
                textTransform: "uppercase",
              }}
            >
              Central de Protestos
            </h2>

            <p
              style={{
                color: "#fff",
                fontSize: "1.05rem",
                marginBottom: "25px",
                lineHeight: "1.5",
              }}
            >
              A Massa não aguenta mais. Escolha sua frente de batalha e
              fortaleça a resistência contra a atual gestão.
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
                  #SAFNota0!
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
                    href="https://x.com/canaldofrossard/status/2048779423336353823?s=20"
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
                    Ver vídeo no X
                  </a>

                  <a
                    href="https://www.instagram.com/reel/DXo6CCOAWcz/?igsh=NWRsZ3hsbnhleTZ0"
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
                    Ver no Instagram
                  </a>
                </div>
              </div>

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
                    Apoiar campanha no X
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              Promessas consolidadas
            </h2>

            {promessasData.length === 0 ? (
              <p style={{ color: "#aaa" }}>
                Nenhuma promessa disponível no momento.
              </p>
            ) : (
              promessasData.map((p, i) => (
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
              ))
            )}
          </div>
        </div>
      )}

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
              Rotatividade de Técnicos (Era SAF)
            </h2>

            {tecnicosData.length === 0 ? (
              <p style={{ color: "#aaa" }}>
                Nenhum técnico disponível no momento.
              </p>
            ) : (
              tecnicosData.map((t, i) => (
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
                    Período: {t.periodo}
                  </p>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>
                    Duração: <strong>{t.dias}</strong>
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
              ))
            )}
          </div>
        </div>
      )}

      <header className="header-protesto">
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "20px 20px 10px 20px",
          }}
        >
          <p
            style={{
              color: "#FFD700",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontSize: "0.85rem",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Observatório da SAF do Atlético-MG
          </p>

          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.4rem)",
              lineHeight: "1.1",
              marginBottom: "14px",
              textTransform: "none",
            }}
          >
            A SAF prometeu. O Galo do Povo registra, organiza e cobra.
          </h1>

          <p
            style={{
              color: "#d0d0d0",
              maxWidth: "850px",
              margin: "0 auto 22px auto",
              lineHeight: "1.7",
              fontSize: "1.05rem",
            }}
          >
            Um monitor independente da gestão da SAF do Atlético-MG: promessas,
            notícias, documentos, linha do tempo e prioridades de cobrança da
            Massa.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "28px",
            }}
          >
            <button
              onClick={() => {
                const secao = document.getElementById("placar-saf");
                if (secao) secao.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                backgroundColor: "#FFD700",
                color: "#111",
                border: "none",
                borderRadius: "8px",
                padding: "12px 18px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Ver placar da SAF
            </button>

            <button
              onClick={() => setModalPromessasAberto(true)}
              style={{
                backgroundColor: "transparent",
                color: "#fff",
                border: "1px solid #555",
                borderRadius: "8px",
                padding: "12px 18px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Ver promessas mapeadas
            </button>

            <button
              onClick={() => {
                const secao = document.getElementById("form-massa");
                if (secao) secao.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                backgroundColor: "transparent",
                color: "#fff",
                border: "1px solid #555",
                borderRadius: "8px",
                padding: "12px 18px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Enviar informação
            </button>
          </div>

          <div
            id="placar-saf"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "14px",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                background: "rgba(20,20,20,0.95)",
                border: "1px solid #333",
                borderRadius: "10px",
                padding: "18px",
              }}
            >
              <p
                style={{
                  color: "#999",
                  fontSize: "0.85rem",
                  marginBottom: "8px",
                }}
              >
                Dias sob SAF
              </p>
              <h3 style={{ color: "#fff", fontSize: "1.8rem", margin: 0 }}>
                {contador.dias}
              </h3>
            </div>

            <div
              style={{
                background: "rgba(20,20,20,0.95)",
                border: "1px solid #333",
                borderRadius: "10px",
                padding: "18px",
              }}
            >
              <p
                style={{
                  color: "#999",
                  fontSize: "0.85rem",
                  marginBottom: "8px",
                }}
              >
                Promessas mapeadas
              </p>
              <h3 style={{ color: "#FFD700", fontSize: "1.8rem", margin: 0 }}>
                {contador.mentiras || promessasData.length}
              </h3>
            </div>

            <div
              onClick={() => setModalTecnicosAberto(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setModalTecnicosAberto(true);
                }
              }}
              style={{
                background: "rgba(20,20,20,0.95)",
                border: "1px solid #333",
                borderRadius: "10px",
                padding: "18px",
                cursor: "pointer",
              }}
            >
              <p
                style={{
                  color: "#999",
                  fontSize: "0.85rem",
                  marginBottom: "8px",
                }}
              >
                Técnicos trocados ↗
              </p>
              <h3 style={{ color: "#FF6B6B", fontSize: "1.8rem", margin: 0 }}>
                {tecnicosTrocados}
              </h3>
            </div>

            <div
              onClick={() => setModalTecnicosAberto(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setModalTecnicosAberto(true);
                }
              }}
              style={{
                background: "rgba(20,20,20,0.95)",
                border: "1px solid #333",
                borderRadius: "10px",
                padding: "18px",
                cursor: "pointer",
              }}
            >
              <p
                style={{
                  color: "#999",
                  fontSize: "0.85rem",
                  marginBottom: "8px",
                }}
              >
                Técnico atual há ↗
              </p>
              <h3 style={{ color: "#fff", fontSize: "1.8rem", margin: 0 }}>
                {contador.diasTecnico} dias
              </h3>
            </div>
          </div>
          <div
            style={{
              marginTop: "18px",
              background:
                "linear-gradient(135deg, rgba(120,0,0,0.95) 0%, rgba(40,0,0,0.98) 100%)",
              border: "1px solid rgba(255,80,80,0.45)",
              borderRadius: "14px",
              padding: "26px 20px",
              boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "#ff9b9b",
                textTransform: "uppercase",
                fontSize: "0.82rem",
                fontWeight: "bold",
                letterSpacing: "1.2px",
                marginBottom: "10px",
              }}
            >
              Impacto financeiro da gestão
            </p>

            <h2
              style={{
                color: "#fff",
                fontSize: "clamp(1.8rem, 5vw, 3.2rem)",
                margin: "0 0 8px 0",
                lineHeight: "1.1",
                fontWeight: "900",
              }}
            >
              {jurosFormatado}
            </h2>

            <p
              style={{
                color: "#ffd7d7",
                fontSize: "1rem",
                margin: "0 0 8px 0",
                lineHeight: "1.5",
              }}
            >
              já consumidos em juros estimados no ano atual
            </p>

            <p
              style={{
                color: "#c9a7a7",
                fontSize: "0.82rem",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              Base de cálculo: R$ 250 milhões por ano, proporcionais ao tempo
              decorrido no ano atual.
            </p>
          </div>
        </div>
      </header>
      <section
        style={{
          maxWidth: "1100px",
          margin: "34px auto 10px auto",
          padding: "0 20px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <div>
            <p
              style={{
                color: "#FFD700",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontSize: "0.82rem",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Núcleo de cobrança
            </p>

            <h2
              style={{
                color: "#fff",
                fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                margin: 0,
              }}
            >
              Promessas em destaque
            </h2>
          </div>

          <button
            onClick={() => setModalPromessasAberto(true)}
            style={{
              backgroundColor: "transparent",
              color: "#fff",
              border: "1px solid #555",
              borderRadius: "8px",
              padding: "10px 16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Ver lista completa
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          {promessasDestaqueData.length === 0 ? (
            <div
              style={{
                background: "rgba(18,18,18,0.95)",
                border: "1px solid #2f2f2f",
                borderRadius: "12px",
                padding: "18px",
                color: "#aaa",
              }}
            >
              Nenhuma promessa em destaque disponível no momento.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              {promessasDestaqueData.map((promessa, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(18,18,18,0.95)",
                    border: "1px solid #2f2f2f",
                    borderRadius: "12px",
                    padding: "18px",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "220px",
                  }}
                >
                  <div style={{ marginBottom: "14px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 10px",
                        borderRadius: "999px",
                        fontSize: "0.78rem",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        letterSpacing: "0.4px",
                        backgroundColor:
                          promessa.status === "Descumprida"
                            ? "rgba(255,68,68,0.18)"
                            : promessa.status === "Parcial"
                              ? "rgba(255,215,0,0.16)"
                              : "rgba(255,255,255,0.1)",
                        color:
                          promessa.status === "Descumprida"
                            ? "#FF6B6B"
                            : promessa.status === "Parcial"
                              ? "#FFD700"
                              : "#DDD",
                        border:
                          promessa.status === "Descumprida"
                            ? "1px solid rgba(255,68,68,0.35)"
                            : promessa.status === "Parcial"
                              ? "1px solid rgba(255,215,0,0.35)"
                              : "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      {promessa.status}
                    </span>
                  </div>

                  <h3
                    style={{
                      color: "#fff",
                      fontSize: "1.1rem",
                      lineHeight: "1.35",
                      margin: "0 0 12px 0",
                    }}
                  >
                    {promessa.titulo}
                  </h3>

                  <p
                    style={{
                      color: "#c8c8c8",
                      lineHeight: "1.6",
                      fontSize: "0.96rem",
                      margin: 0,
                      flex: 1,
                    }}
                  >
                    {promessa.resumo}
                  </p>
                  <div
                    style={{
                      marginTop: "16px",
                      paddingTop: "14px",
                      borderTop: "1px solid #2f2f2f",
                    }}
                  >
                    <p
                      style={{
                        color: "#FFD700",
                        fontSize: "0.82rem",
                        fontWeight: "bold",
                        margin: "0 0 10px 0",
                        textTransform: "uppercase",
                        letterSpacing: "0.6px",
                      }}
                    >
                      Termômetro da Massa
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: "8px",
                      }}
                    >
                      <button
                        onClick={() =>
                          handleVotarPromessa(promessa.id, "cobrar_agora")
                        }
                        style={{
                          backgroundColor:
                            votosPromessasLocais[promessa.id] === "cobrar_agora"
                              ? "#FF4444"
                              : "transparent",
                          color: "#fff",
                          border: "1px solid rgba(255,68,68,0.45)",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Cobrar agora
                      </button>

                      <button
                        onClick={() =>
                          handleVotarPromessa(promessa.id, "importa_muito")
                        }
                        style={{
                          backgroundColor:
                            votosPromessasLocais[promessa.id] ===
                            "importa_muito"
                              ? "#FFD700"
                              : "transparent",
                          color:
                            votosPromessasLocais[promessa.id] ===
                            "importa_muito"
                              ? "#111"
                              : "#fff",
                          border: "1px solid rgba(255,215,0,0.45)",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Importa muito
                      </button>

                      <button
                        onClick={() =>
                          handleVotarPromessa(promessa.id, "nao_prioridade")
                        }
                        style={{
                          backgroundColor:
                            votosPromessasLocais[promessa.id] ===
                            "nao_prioridade"
                              ? "#555"
                              : "transparent",
                          color: "#fff",
                          border: "1px solid rgba(255,255,255,0.25)",
                          borderRadius: "8px",
                          padding: "10px 12px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Não é prioridade
                      </button>
                    </div>

                    <div
                      style={{
                        marginTop: "10px",
                        display: "grid",
                        gap: "4px",
                        fontSize: "0.82rem",
                        color: "#aaa",
                      }}
                    >
                      <span>
                        Cobrar agora:{" "}
                        {obterTotaisPromessa(promessa.id).cobrar_agora}
                      </span>
                      <span>
                        Importa muito:{" "}
                        {obterTotaisPromessa(promessa.id).importa_muito}
                      </span>
                      <span>
                        Não é prioridade:{" "}
                        {obterTotaisPromessa(promessa.id).nao_prioridade}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setModalPromessasAberto(true)}
                    style={{
                      marginTop: "18px",
                      backgroundColor: "transparent",
                      color: "#FFD700",
                      border: "1px solid rgba(255,215,0,0.35)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      fontWeight: "bold",
                      cursor: "pointer",
                    }}
                  >
                    Ver detalhes
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <section
        style={{
          maxWidth: "1100px",
          margin: "30px auto 10px auto",
          padding: "0 20px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <div>
            <p
              style={{
                color: "#FFD700",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontSize: "0.82rem",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              Resumo editorial automático
            </p>

            <h2
              style={{
                color: "#fff",
                fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                margin: 0,
              }}
            >
              O que mudou esta semana
            </h2>
          </div>
        </div>

        {mudancasSemana.length === 0 ? (
          <div
            style={{
              background: "rgba(18,18,18,0.95)",
              border: "1px solid #2f2f2f",
              borderRadius: "12px",
              padding: "18px",
              color: "#aaa",
            }}
          >
            Nenhum destaque semanal disponível no momento.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {mudancasSemana.map((item, index) => (
              <div
                key={index}
                style={{
                  background: "rgba(18,18,18,0.95)",
                  border: "1px solid #2f2f2f",
                  borderRadius: "12px",
                  padding: "18px",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.2)",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "220px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "14px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "0.78rem",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: "0.4px",
                      backgroundColor: "rgba(255,215,0,0.12)",
                      color: "#FFD700",
                      border: "1px solid rgba(255,215,0,0.25)",
                    }}
                  >
                    {item.tag || "SAF"}
                  </span>

                  <span
                    style={{
                      color: "#FF8A8A",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                    }}
                  >
                    {item.impacto || "Monitoramento"}
                  </span>
                </div>

                <h3
                  style={{
                    color: "#fff",
                    fontSize: "1.08rem",
                    lineHeight: "1.4",
                    margin: "0 0 12px 0",
                  }}
                >
                  {item.titulo}
                </h3>

                <p
                  style={{
                    color: "#c8c8c8",
                    lineHeight: "1.6",
                    fontSize: "0.96rem",
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {item.resumo}
                </p>

                <button
                  onClick={() => {
                    if (item.fonteUrl) {
                      window.open(
                        item.fonteUrl,
                        "_blank",
                        "noopener,noreferrer",
                      );
                      return;
                    }

                    const secao = document.getElementById("inicio-dossie");
                    if (secao) secao.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{
                    marginTop: "18px",
                    backgroundColor: "transparent",
                    color: "#fff",
                    border: "1px solid #444",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {item.fonteUrl ? "Ver fonte" : "Ver matérias relacionadas"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

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

      <section
        style={{
          maxWidth: "820px",
          margin: "40px auto",
          padding: "0 20px",
        }}
      >
        <h2
          style={{
            color: "#fff",
            borderBottom: "2px solid #333",
            paddingBottom: "10px",
            marginBottom: "25px",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          Linha do tempo da SAF
        </h2>

        <div
          style={{
            position: "relative",
            marginLeft: "10px",
            paddingLeft: "24px",
            borderLeft: "3px solid #333",
          }}
        >
          {linhaDoTempoData.length === 0 ? (
            <p style={{ color: "#aaa" }}>
              Nenhum marco da linha do tempo disponível no momento.
            </p>
          ) : (
            linhaDoTempoData.map((item, index) => (
              <div
                key={index}
                style={{
                  position: "relative",
                  marginBottom: "18px",
                  backgroundColor: "rgba(17,17,17,0.9)",
                  border: "1px solid #2a2a2a",
                  borderRadius: "10px",
                  padding: "16px 18px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "-33px",
                    top: "18px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: "#FFD700",
                    border: "3px solid #111",
                    boxShadow: "0 0 0 2px #333",
                  }}
                />

                <div
                  style={{
                    color: "#FFD700",
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: "6px",
                  }}
                >
                  {item.data}
                </div>

                <h3
                  style={{
                    color: "#fff",
                    margin: "0 0 8px 0",
                    fontSize: "1.1rem",
                  }}
                >
                  {item.titulo}
                </h3>

                <p
                  style={{
                    color: "#cfcfcf",
                    margin: 0,
                    lineHeight: "1.5",
                    fontSize: "0.95rem",
                  }}
                >
                  {item.desc}
                </p>
              </div>
            ))
          )}
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
            placeholder="Pesquisar no dossiê (ex: dívida, arena, jogador...)"
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

        {carregando && (
          <p style={{ textAlign: "center", color: "#ccc" }}>
            Carregando dossiê...
          </p>
        )}

        {erroApi && (
          <p style={{ textAlign: "center", color: "#FF8888" }}>{erroApi}</p>
        )}

        {!carregando && !erroApi && materiasPaginadas.length > 0
          ? materiasPaginadas.map((m) => (
              <div
                key={m._id || m.fonteUrl || m.titulo}
                className="materia-item"
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
                  Capturado em:{" "}
                  {m.dataCriacao
                    ? new Date(m.dataCriacao).toLocaleString("pt-BR")
                    : "Data indisponível"}
                </p>
                <p>{m.conteudo}</p>
                <div
                  style={{
                    marginTop: "15px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ color: "#ccc", fontSize: "0.8rem" }}>
                    {m.fonteNome
                      ? `Fonte: ${m.fonteNome}`
                      : "Fonte não informada"}
                  </span>
                  {m.fonteUrl && (
                    <a
                      href={m.fonteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-fonte"
                    >
                      Ver matéria
                    </a>
                  )}
                </div>
              </div>
            ))
          : null}

        {!carregando && !erroApi && materiasPaginadas.length === 0 && (
          <p style={{ textAlign: "center", color: "#888" }}>
            Nenhuma matéria encontrada no radar.
          </p>
        )}

        {!carregando && !erroApi && totalPaginas > 1 && (
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
              Anterior
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
              Próxima
            </button>
          </div>
        )}
      </section>

      <section
        id="form-massa"
        style={{
          maxWidth: "800px",
          margin: "50px auto 0 auto",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#111",
            border: "1px solid #333",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <h2 style={{ color: "#fff", marginTop: 0 }}>
            Envie uma denúncia, sugestão ou correção
          </h2>

          <p style={{ color: "#bbb", lineHeight: "1.6" }}>
            Encontrou uma informação importante, uma notícia que passou batida
            ou quer corrigir algo do dossiê? Mande para a gente.
          </p>

          <form
            onSubmit={handleEnviarFormulario}
            style={{ display: "grid", gap: "14px", marginTop: "20px" }}
          >
            <input
              type="text"
              name="nome"
              placeholder="Seu nome"
              value={formulario.nome}
              onChange={handleFormularioChange}
              required
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "1rem",
                borderRadius: "8px",
                border: "1px solid #444",
                backgroundColor: "#181818",
                color: "#fff",
              }}
            />

            <input
              type="email"
              name="email"
              placeholder="Seu e-mail"
              value={formulario.email}
              onChange={handleFormularioChange}
              required
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "1rem",
                borderRadius: "8px",
                border: "1px solid #444",
                backgroundColor: "#181818",
                color: "#fff",
              }}
            />

            <textarea
              name="mensagem"
              placeholder="Digite aqui sua mensagem"
              value={formulario.mensagem}
              onChange={handleFormularioChange}
              required
              rows={6}
              style={{
                width: "100%",
                padding: "14px",
                fontSize: "1rem",
                borderRadius: "8px",
                border: "1px solid #444",
                backgroundColor: "#181818",
                color: "#fff",
                resize: "vertical",
              }}
            />

            <button
              type="submit"
              disabled={enviandoFormulario}
              style={{
                backgroundColor: enviandoFormulario ? "#666" : "#FFD700",
                color: "#111",
                border: "none",
                borderRadius: "8px",
                padding: "14px 18px",
                fontWeight: "bold",
                cursor: enviandoFormulario ? "not-allowed" : "pointer",
              }}
            >
              {enviandoFormulario ? "Enviando..." : "Enviar mensagem"}
            </button>
          </form>

          {mensagemFormulario && (
            <p style={{ color: "#7CFC98", marginTop: "14px" }}>
              {mensagemFormulario}
            </p>
          )}
          {erroFormulario && (
            <p style={{ color: "#FF8888", marginTop: "14px" }}>
              {erroFormulario}
            </p>
          )}
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
        <p>
          <strong>Galo do Povo</strong> © {new Date().getFullYear()} - O dossiê
          da Massa.
        </p>
        <p style={{ maxWidth: "800px", margin: "0 auto", lineHeight: "1.4" }}>
          Este site é uma iniciativa independente de torcedores. Não possui
          vínculo oficial com o Clube Atlético Mineiro, associação, SAF ou
          investidores. O conteúdo reúne notícias públicas, crítica, opinião e
          monitoramento da gestão.
        </p>
      </footer>
    </div>
  );
}
