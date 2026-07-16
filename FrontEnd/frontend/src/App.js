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
  const [cabecalhoCompacto, setCabecalhoCompacto] = useState(false);
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
    const intervaloJuros = setInterval(calcularJuros, 60000);

    return () => clearInterval(intervaloJuros);
  }, []);

  const jurosFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(jurosRodando);

  useEffect(() => {
    const atualizarCabecalho = () => {
      setCabecalhoCompacto(window.scrollY > 48);
    };

    atualizarCabecalho();
    window.addEventListener("scroll", atualizarCabecalho, { passive: true });

    return () => window.removeEventListener("scroll", atualizarCabecalho);
  }, []);

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
            "N\u00e3o foi poss\u00edvel carregar o dossi\u00ea agora. Tente novamente em instantes.",
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
      const reduzirMovimento = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      secaoDossie.scrollIntoView({
        behavior: reduzirMovimento ? "auto" : "smooth",
        block: "start",
      });
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

  const tecnicosOrdenados = useMemo(() => {
    const atual = tecnicosData.filter((tecnico) => tecnico.motivo === "Em cargo");
    const anteriores = tecnicosData
      .filter((tecnico) => tecnico.motivo !== "Em cargo")
      .slice()
      .reverse();

    return [...atual, ...anteriores];
  }, [tecnicosData]);

  const getStatusClassName = (status = "") => {
    const statusNormalizado = status.toLowerCase();

    if (statusNormalizado.includes("descumpr")) {
      return "status-marker status-marker--critical";
    }

    if (
      statusNormalizado.includes("parcial") ||
      statusNormalizado.includes("verifica") ||
      statusNormalizado.includes("cobran")
    ) {
      return "status-marker status-marker--attention";
    }

    return "status-marker";
  };

  const navegarParaSecao = (id) => {
    const secao = document.getElementById(id);
    if (secao) {
      const reduzirMovimento = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      secao.scrollIntoView({
        behavior: reduzirMovimento ? "auto" : "smooth",
        block: "start",
      });
    }
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
    <div className="public-page">
      {modalCampanhaAberto && (
        <div
          className="modal-backdrop"
          onClick={() => setModalCampanhaAberto(false)}
        >
          <section
            className="modal-panel modal-panel--campaign"
            role="dialog"
            aria-modal="true"
            aria-labelledby="campanhas-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Fechar central de protestos"
              onClick={() => setModalCampanhaAberto(false)}
            >
              x
            </button>

            <p className="section-kicker">Central de protestos</p>
            <h2 id="campanhas-titulo">{"Campanhas e mobiliza\u00e7\u00f5es"}</h2>
            <p className="section-lead">
              Acessos reunidos para quem quer acompanhar ou participar das
              {"campanhas j\u00e1 cadastradas."}
            </p>

            <div className="campaign-grid">
              <article className="campaign-item">
                <h3>#SAFNota0!</h3>
                <p>
                  Apoie a campanha do <strong>Frossard</strong> e mostre a
                  indignacao da arquibancada nas redes sociais.
                </p>
                <div className="campaign-links">
                  <a
                    href="https://x.com/canaldofrossard/status/2048779423336353823?s=20"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {"Ver v\u00eddeo no X"}
                  </a>
                  <a
                    href="https://www.instagram.com/reel/DXo6CCOAWcz/?igsh=NWRsZ3hsbnhleTZ0"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver no Instagram
                  </a>
                </div>
              </article>

              <article className="campaign-item">
                <h3>{"Adesiva\u00e7o BH"}</h3>
                <p>
                  {"A\u00e7\u00e3o da "}<strong>Culture_1908</strong>. Ajude a capitalizar e
                  espalhar os stickers do protesto em Belo Horizonte.
                </p>
                <div className="campaign-links">
                  <a
                    href="https://x.com/culture_1908/status/2048826752756019334?s=20"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apoiar campanha no X
                  </a>
                </div>
              </article>
            </div>
          </section>
        </div>
      )}

      {modalPromessasAberto && (
        <div
          className="modal-backdrop"
          onClick={() => setModalPromessasAberto(false)}
        >
          <section
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="promessas-modal-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Fechar lista de promessas"
              onClick={() => setModalPromessasAberto(false)}
            >
              x
            </button>

            <p className="section-kicker">Arquivo de compromissos</p>
            <h2 id="promessas-modal-titulo">Promessas consolidadas</h2>

            {promessasData.length === 0 ? (
              <p className="empty-state">{"Nenhuma promessa dispon\u00edvel no momento."}</p>
            ) : (
              <div className="document-list">
                {promessasData.map((p, i) => (
                  <article className="document-row" key={p._id || p.id || i}>
                    <div className="record-code">REG-{String(i + 1).padStart(2, "0")}</div>
                    <div>
                      <span className={getStatusClassName(p.status)}>
                        {p.status || "Sob verifica\u00e7\u00e3o"}
                      </span>
                      <h3>{p.titulo}</h3>
                      {p.resumo && <p>{p.resumo}</p>}
                      {p.situacao && (
                        <p className="document-note">
                          <strong>{"Situa\u00e7\u00e3o hoje:"}</strong> {p.situacao}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {modalTecnicosAberto && (
        <div
          className="modal-backdrop"
          onClick={() => setModalTecnicosAberto(false)}
        >
          <section
            className="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tecnicos-modal-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label={"Fechar lista de t\u00e9cnicos"}
              onClick={() => setModalTecnicosAberto(false)}
            >
              x
            </button>

            <p className="section-kicker">Rotatividade tecnica</p>
            <h2 id="tecnicos-modal-titulo">{"T\u00e9cnicos da era SAF"}</h2>

            {tecnicosOrdenados.length === 0 ? (
              <p className="empty-state">{"Nenhum t\u00e9cnico dispon\u00edvel no momento."}</p>
            ) : (
              <div className="document-list">
                {tecnicosOrdenados.map((t, i) => (
                  <article
                    className={
                      t.motivo === "Em cargo"
                        ? "coach-row coach-row--current"
                        : "coach-row"
                    }
                    key={`${t.nome}-${t.periodo}-${i}`}
                  >
                    <div className="coach-heading">
                      <h3>{t.nome}</h3>
                      {t.motivo === "Em cargo" && (
                        <span className="current-marker">ATUAL</span>
                      )}
                    </div>
                    <dl className="coach-meta">
                      <div>
                        <dt>{"Per\u00edodo"}</dt>
                        <dd>{t.periodo}</dd>
                      </div>
                      <div>
                        <dt>{"Dura\u00e7\u00e3o"}</dt>
                        <dd>{t.dias}</dd>
                      </div>
                      <div>
                        <dt>Motivo</dt>
                        <dd>{t.motivo}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <header className={cabecalhoCompacto ? "site-header is-compact" : "site-header"}>
        <div className="site-header__inner">
          <a className="brand" href="#topo" aria-label="GALO DO POVO - inicio">
            <span className="brand__mark">GdP</span>
            <span className="brand__text">
              <strong>GALO DO POVO</strong>
              <small>Arquivo independente</small>
            </span>
          </a>

          <nav className="site-nav" aria-label={"Navega\u00e7\u00e3o principal"}>
            <a href="#placar-saf">Placar</a>
            <a href="#promessas">Promessas</a>
            <a href="#linha-do-tempo">Linha do tempo</a>
            <a href="#inicio-dossie">{"Dossi\u00ea"}</a>
            <a href="#form-massa">{"Enviar informa\u00e7\u00e3o"}</a>
          </nav>
        </div>
      </header>

      <main id="topo">
        <section className="hero-section">
          <div className="page-shell hero-grid">
            <div className="hero-copy">
              <p className="section-kicker">Registro independente da era SAF</p>
              <h1>A SAF prometeu. O Galo do Povo registra, organiza e cobra.</h1>
              <p className="hero-lead">
                {"Um arquivo p\u00fablico de promessas, decis\u00f5es, not\u00edcias e acontecimentos que ajudam a acompanhar a gest\u00e3o da SAF."}
              </p>
              <div className="hero-actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => navegarParaSecao("placar-saf")}
                >
                  Ver o placar da SAF
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => navegarParaSecao("inicio-dossie")}
                >
                  {"Explorar o dossi\u00ea"}
                </button>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => navegarParaSecao("form-massa")}
                >
                  {"Enviar informa\u00e7\u00e3o"}
                </button>
              </div>
              <p className="independence-note">{"Iniciativa independente, sem v\u00ednculo ou representa\u00e7\u00e3o oficial do clube ou de sua SAF."}</p>
            </div>

            <aside className="hero-ledger" aria-label="Identidade editorial">
              <div className="ledger-line">
                <span>Arquivo</span>
                <strong>GdP-2026</strong>
              </div>
              <div className="ledger-line">
                <span>{"M\u00e9todo"}</span>
                <strong>{"registro p\u00fablico"}</strong>
              </div>
              <div className="ledger-line">
                <span>Escopo</span>
                <strong>promessas, fatos e fontes</strong>
              </div>
            </aside>
          </div>
        </section>

        <section className="stats-band page-shell" id="placar-saf" aria-label="Placar da SAF">
          <div className="stat-item">
            <span>Dias sob SAF</span>
            <strong>{contador.dias}</strong>
          </div>
          <div className="stat-item">
            <span>Promessas acompanhadas</span>
            <strong>{contador.mentiras || promessasData.length}</strong>
          </div>
          <button
            type="button"
            className="stat-item stat-item--button"
            onClick={() => setModalTecnicosAberto(true)}
          >
            <span>{"T\u00e9cnicos trocados"}</span>
            <strong>{tecnicosTrocados}</strong>
          </button>
          <div className="stat-item stat-item--static">
            <span>{"Tempo do t\u00e9cnico atual"}</span>
            <strong>{contador.diasTecnico} dias</strong>
          </div>
        </section>

        <section className="finance-section page-shell" aria-labelledby="financeiro-titulo">
          <div className="finance-panel">
            <p className="section-kicker">Estimativa financeira</p>
            <h2 id="financeiro-titulo">{"O custo da d\u00edvida"}</h2>
            <p className="section-lead">
              Acompanhamento estimado dos juros ao longo de 2026.
            </p>
            <p className="finance-value">{jurosFormatado}</p>
            <details>
              <summary>{"Entenda o c\u00e1lculo"}</summary>
              <p>
                {"Esta \u00e9 uma estimativa editorial baseada no custo anual informado de R$ 250 milh\u00f5es em juros. O valor \u00e9 calculado proporcionalmente ao tempo transcorrido no ano e n\u00e3o representa atualiza\u00e7\u00e3o cont\u00e1bil oficial em tempo real."}
              </p>
              <p>{"Base utilizada no c\u00e1lculo: R$ 250 milh\u00f5es por ano."}</p>
            </details>
          </div>
        </section>

        <section className="section-block page-shell" id="promessas" aria-labelledby="promessas-titulo">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Arquivo de compromissos</p>
              <h2 id="promessas-titulo">Promessas em destaque</h2>
              <p className="section-lead">
                {"Registros acompanhados com status, resumo e term\u00f4metro de"}
                prioridade publica.
              </p>
            </div>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setModalPromessasAberto(true)}
            >
              Ver lista completa
            </button>
          </div>

          {promessasDestaqueData.length === 0 ? (
            <p className="empty-state">{"Nenhuma promessa em destaque dispon\u00edvel no momento."}</p>
          ) : (
            <div className="promise-grid">
              {promessasDestaqueData.map((promessa, index) => {
                const itemId = promessa.id || promessa._id || promessa.chave || String(index);
                const totais = obterTotaisPromessa(itemId);

                return (
                  <article className="promise-card" key={itemId}>
                    <div className="promise-card__meta">
                      <span className="record-code">REG-{String(index + 1).padStart(2, "0")}</span>
                      <span className={getStatusClassName(promessa.status)}>
                        {promessa.status || "Sob verifica\u00e7\u00e3o"}
                      </span>
                    </div>
                    <h3>{promessa.titulo}</h3>
                    <p>{promessa.resumo}</p>

                    <div className="thermometer" aria-label={"Term\u00f4metro da promessa"}>
                      <p>{"Term\u00f4metro"}</p>
                      <div className="vote-buttons">
                        <button
                          type="button"
                          className={
                            votosPromessasLocais[itemId] === "cobrar_agora"
                              ? "vote-button is-critical"
                              : "vote-button"
                          }
                          onClick={() => handleVotarPromessa(itemId, "cobrar_agora")}
                        >
                          Cobrar agora
                        </button>
                        <button
                          type="button"
                          className={
                            votosPromessasLocais[itemId] === "importa_muito"
                              ? "vote-button is-attention"
                              : "vote-button"
                          }
                          onClick={() => handleVotarPromessa(itemId, "importa_muito")}
                        >
                          Importa muito
                        </button>
                        <button
                          type="button"
                          className={
                            votosPromessasLocais[itemId] === "nao_prioridade"
                              ? "vote-button is-muted"
                              : "vote-button"
                          }
                          onClick={() => handleVotarPromessa(itemId, "nao_prioridade")}
                        >
                          {"N\u00e3o \u00e9 prioridade"}
                        </button>
                      </div>
                      <dl className="vote-totals">
                        <div>
                          <dt>Cobrar agora</dt>
                          <dd>{totais.cobrar_agora}</dd>
                        </div>
                        <div>
                          <dt>Importa muito</dt>
                          <dd>{totais.importa_muito}</dd>
                        </div>
                        <div>
                          <dt>{"N\u00e3o \u00e9 prioridade"}</dt>
                          <dd>{totais.nao_prioridade}</dd>
                        </div>
                      </dl>
                    </div>

                    <button
                      type="button"
                      className="btn btn--text"
                      onClick={() => setModalPromessasAberto(true)}
                    >
                      Ver detalhes
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="section-block page-shell" aria-labelledby="semana-titulo">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{"\u00daltimos registros"}</p>
              <h2 id="semana-titulo">O que mudou esta semana</h2>
            </div>
          </div>

          {mudancasSemana.length === 0 ? (
            <p className="empty-state">{"Nenhum destaque semanal dispon\u00edvel no momento."}</p>
          ) : (
            <div className="bulletin-list">
              {mudancasSemana.map((item, index) => (
                <article className="bulletin-item" key={index}>
                  <div className="bulletin-meta">
                    <span>{item.tag || "SAF"}</span>
                    <span>{item.impacto || "Monitoramento"}</span>
                  </div>
                  <h3>{item.titulo}</h3>
                  <p>{item.resumo}</p>
                  <button
                    type="button"
                    className="btn btn--text"
                    onClick={() => {
                      if (item.fonteUrl) {
                        window.open(item.fonteUrl, "_blank", "noopener,noreferrer");
                        return;
                      }
                      navegarParaSecao("inicio-dossie");
                    }}
                  >
                    {item.fonteUrl ? "Ver fonte" : "Ver mat\u00e9rias relacionadas"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="section-block page-shell" id="linha-do-tempo" aria-labelledby="linha-titulo">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{"Mem\u00f3ria p\u00fablica"}</p>
              <h2 id="linha-titulo">Linha do tempo da era SAF</h2>
              <p className="section-lead">
                {"Marcos registrados em ordem editorial para preservar a mem\u00f3ria das decis\u00f5es e acontecimentos."}
              </p>
            </div>
          </div>

          {linhaDoTempoData.length === 0 ? (
            <p className="empty-state">{"Nenhum marco da linha do tempo dispon\u00edvel no momento."}</p>
          ) : (
            <div className="timeline-track" aria-label="Linha do tempo horizontal">
              {linhaDoTempoData.map((item, index) => (
                <article className="timeline-item" key={`${item.data}-${item.titulo}-${index}`}>
                  <time>{item.data}</time>
                  <h3>{item.titulo}</h3>
                  <p>{item.desc}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="section-block page-shell dossier-section" id="inicio-dossie" aria-labelledby="dossie-titulo">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{"Arquivo de mat\u00e9rias"}</p>
              <h2 id="dossie-titulo">{"Dossi\u00ea Pulguinha"}</h2>
              <p className="section-lead">
                Noticias e registros reunidos automaticamente para consulta e
                acompanhamento.
              </p>
            </div>
          </div>

          <label className="search-label" htmlFor="busca-dossie">
            {"Buscar no dossi\u00ea"}
          </label>
          <input
            id="busca-dossie"
            className="search-input"
            type="text"
            placeholder={"Pesquisar no dossi\u00ea (ex: d\u00edvida, arena, jogador...)"}
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />

          {carregando && <p className="loading-state">{"Carregando dossi\u00ea..."}</p>}
          {erroApi && <p className="error-state">{erroApi}</p>}

          {!carregando && !erroApi && materiasPaginadas.length > 0 ? (
            <div className="archive-list">
              {materiasPaginadas.map((m) => (
                <article className="archive-entry" key={m._id || m.fonteUrl || m.titulo}>
                  <div className="archive-meta">
                    <span>{m.fonteNome ? `Fonte: ${m.fonteNome}` : "Fonte nao informada"}</span>
                    <span>
                      {m.dataCriacao
                        ? new Date(m.dataCriacao).toLocaleString("pt-BR")
                        : "Data indispon\u00edvel"}
                    </span>
                  </div>
                  <h3>{m.titulo}</h3>
                  <p>{m.conteudo}</p>
                  {m.fonteUrl && (
                    <a
                      href={m.fonteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-link"
                    >
                      Abrir fonte
                    </a>
                  )}
                </article>
              ))}
            </div>
          ) : null}

          {!carregando && !erroApi && materiasPaginadas.length === 0 && (
            <p className="empty-state">{"Nenhuma mat\u00e9ria encontrada no radar."}</p>
          )}

          {!carregando && !erroApi && totalPaginas > 1 && (
            <nav className="pagination" aria-label={"Pagina\u00e7\u00e3o do dossi\u00ea"}>
              <button
                type="button"
                onClick={() => mudarPaginaESubir(paginaAtual - 1)}
                disabled={paginaAtual === 1}
              >
                Anterior
              </button>
              <span>{"P\u00e1gina"} {paginaAtual} de {totalPaginas}</span>
              <button
                type="button"
                onClick={() => mudarPaginaESubir(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas}
              >
                {"Pr\u00f3xima"}
              </button>
            </nav>
          )}
        </section>

        <section className="section-block page-shell contribute-section" id="form-massa" aria-labelledby="contribua-titulo">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{"Envio de informa\u00e7\u00f5es"}</p>
              <h2 id="contribua-titulo">Contribua com o arquivo</h2>
              <p className="section-lead">
                {"Envie documentos, links, informa\u00e7\u00f5es ou corre\u00e7\u00f5es que possam fortalecer o acompanhamento p\u00fablico."}
              </p>
            </div>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => setModalCampanhaAberto(true)}
            >
              Central de protestos
            </button>
          </div>

          <form className="contribute-form" onSubmit={handleEnviarFormulario}>
            <label htmlFor="nome">Nome</label>
            <input
              id="nome"
              type="text"
              name="nome"
              placeholder="Seu nome"
              value={formulario.nome}
              onChange={handleFormularioChange}
              required
            />

            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Seu e-mail"
              value={formulario.email}
              onChange={handleFormularioChange}
              required
            />

            <label htmlFor="mensagem">Mensagem</label>
            <textarea
              id="mensagem"
              name="mensagem"
              placeholder="Digite aqui sua mensagem"
              value={formulario.mensagem}
              onChange={handleFormularioChange}
              required
              rows={6}
            />

            <button type="submit" className="btn btn--primary" disabled={enviandoFormulario}>
              {enviandoFormulario ? "Enviando..." : "Enviar mensagem"}
            </button>
          </form>

          {mensagemFormulario && <p className="success-state">{mensagemFormulario}</p>}
          {erroFormulario && <p className="error-state">{erroFormulario}</p>}
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-shell">
          <strong>GALO DO POVO</strong>
          <p>
            {"O Galo do Povo \u00e9 uma iniciativa independente de registro e fiscaliza\u00e7\u00e3o. N\u00e3o possui v\u00ednculo, autoriza\u00e7\u00e3o ou representa\u00e7\u00e3o oficial do Clube Atl\u00e9tico Mineiro, de sua SAF ou de seus parceiros."}
          </p>
        </div>
      </footer>
    </div>
  );
}
