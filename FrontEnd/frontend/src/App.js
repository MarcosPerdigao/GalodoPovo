// frontend/src/App.jsx
import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [materias, setMaterias] = useState([]);
  const [contador, setContador] = useState({
    dias: 0,
    mentiras: 0,
    diasTecnico: 0,
  });

  const [flipRafael, setFlipRafael] = useState(false);
  const [flipRubens, setFlipRubens] = useState(false);

  // Estados do Formulário de Denúncia
  const [form, setForm] = useState({ nome: "", email: "", mensagem: "" });
  const [statusEnvio, setStatusEnvio] = useState("");

  useEffect(() => {
    fetch("https://galodopovo-api.onrender.com/api/materias")
      .then((res) => res.json())
      .then((data) => setMaterias(data))
      .catch((err) => console.error(err));

    fetch("https://galodopovo-api.onrender.com/api/contador")
      .then((res) => res.json())
      .then((data) => setContador(data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatusEnvio("Enviando...");

    fetch("https://galodopovo-api.onrender.com/api/sugestoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        setStatusEnvio(data.message);
        setForm({ nome: "", email: "", mensagem: "" }); // Limpa o formulário
        setTimeout(() => setStatusEnvio(""), 5000); // Apaga a mensagem após 5s
      })
      .catch((err) => {
        console.error(err);
        setStatusEnvio("Erro ao enviar. Tente novamente.");
      });
  };

  return (
    <div>
      <img src="/galo.png" alt="Escudo do Galo" className="bg-galo" />

      <header className="header-protesto">
        <h1>Galo do Povo: A Verdade da SAF</h1>
        <p className="contador">
          Dias sob a SAF: <strong>{contador.dias}</strong> | Promessas
          Quebradas: <strong>{contador.mentiras}</strong> | Técnico atual no
          cargo: <strong>{contador.diasTecnico} dias</strong>
        </p>
      </header>

      <div className="split-container">
        {/* LADO ESQUERDO */}
        <div className="split-side side-left">
          <div
            className={`card ${flipRafael ? "is-flipped" : ""}`}
            onClick={() => setFlipRafael(!flipRafael)}
          >
            <div className="card-inner">
              <div
                className="card-face card-front"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(/rosto-rafael.jpg)",
                }}
              >
                <div className="sobreposicao-texto">
                  <h2>Rafael Menin</h2>
                  <p>Investidor / Operação</p>
                  <button className="btn-expor">CLIQUE PARA EXPOR</button>
                </div>
              </div>
              <div className="card-face card-back">
                <h3>A Realidade</h3>
                <ul className="mentiras-lista">
                  <li>
                    <strong>Time Protagonista:</strong> <span>Fato:</span>{" "}
                    Desmanches recorrentes do elenco.
                  </li>
                  <li>
                    <strong>Gestão Profissional:</strong> <span>Fato:</span>{" "}
                    Decisões questionáveis e falta de transparência.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* LADO DIREITO */}
        <div className="split-side side-right">
          <div
            className={`card ${flipRubens ? "is-flipped" : ""}`}
            onClick={() => setFlipRubens(!flipRubens)}
          >
            <div className="card-inner">
              <div
                className="card-face card-front"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(/rosto-rubens.jpg)",
                }}
              >
                <div className="sobreposicao-texto">
                  <h2>Rubens Menin</h2>
                  <p>Investidor / Galo Holding</p>
                  <button className="btn-expor">CLIQUE PARA EXPOR</button>
                </div>
              </div>
              <div className="card-face card-back">
                <h3>A Realidade</h3>
                <ul className="mentiras-lista">
                  <li>
                    <strong>Dívida Equacionada:</strong> <span>Fato:</span>{" "}
                    Patrimônio entregue e dívida sangrando o clube.
                  </li>
                  <li>
                    <strong>Arena MRV:</strong> <span>Fato:</span> Ingressos
                    caros que expulsaram o povão.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dossiê */}
      {materias.length > 0 && (
        <section className="materias-section">
          <h2 className="titulo-secao">O Dossiê Completo</h2>
          {materias.map((m) => (
            <div id={m.link.substring(1)} key={m.id} className="materia-item">
              <h2>{m.titulo}</h2>
              <p>{m.conteudo}</p>
              {m.fonteUrl && (
                <a
                  href={m.fonteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-fonte"
                >
                  Fonte: {m.fonteNome}
                </a>
              )}
            </div>
          ))}
        </section>
      )}

      {/* NOVO: Formulário de Denúncias */}
      <section className="form-section">
        <div className="form-container">
          <h2>Tem mais matérias ou mentiras para expor?</h2>
          <p>
            A diretoria tenta esconder, mas a arquibancada vê tudo. Nos envie
            links, balanços ou denúncias para adicionarmos ao site.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Seu Nome (Opcional) ou 'Anônimo'"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="form-input"
            />
            <input
              type="email"
              placeholder="Seu E-mail (Opcional)"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="form-input"
            />
            <textarea
              placeholder="Qual a denúncia ou link da matéria? Descreva aqui..."
              required
              rows="5"
              value={form.mensagem}
              onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
              className="form-input"
            ></textarea>

            <button type="submit" className="btn-enviar">
              Enviar Denúncia
            </button>

            {statusEnvio && (
              <div className="status-mensagem">{statusEnvio}</div>
            )}
          </form>
        </div>
      </section>
    </div>
  );
}
