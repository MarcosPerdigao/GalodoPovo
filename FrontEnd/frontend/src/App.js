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

      {/* BANNER DA CAMPANHA */}
      <div
        className="campanha-pix"
        style={{
          backgroundColor: "#111",
          border: "2px solid #FFD700",
          padding: "20px",
          borderRadius: "8px",
          textAlign: "center",
          margin: "20px auto",
          maxWidth: "800px",
          color: "#fff",
          boxShadow: "0 4px 15px rgba(255, 215, 0, 0.2)",
        }}
      >
        <h2
          style={{
            color: "#FFD700",
            marginBottom: "10px",
            textTransform: "uppercase",
          }}
        >
          🏟️ Campanha: A Massa Compra a SAF
        </h2>
        <p style={{ fontSize: "1.1rem", marginBottom: "15px" }}>
          Se o problema é dinheiro, a torcida resolve. Nossa meta é R$ 1 Bilhão
          para devolver o Galo ao povo!
        </p>

        <div
          style={{
            backgroundColor: "#222",
            padding: "15px",
            borderRadius: "8px",
            border: "1px dashed #666",
          }}
        >
          <p
            style={{
              fontWeight: "bold",
              color: "#FF4444",
              marginBottom: "10px",
            }}
          >
            ⚠️ ATENÇÃO: PROTESTO SOLIDÁRIO
          </p>
          <p style={{ fontSize: "0.95rem", marginBottom: "15px" }}>
            Como não podemos (ainda) comprar o clube, todo o valor arrecadado
            neste protesto vai direto para quem precisa de verdade, enquanto
            aguardamos promessas virarem realidade.
          </p>
          <div
            style={{
              background: "#fff",
              color: "#000",
              padding: "10px",
              borderRadius: "5px",
              display: "inline-block",
            }}
          >
            <p style={{ margin: 0, fontWeight: "bold" }}>
              PIX DIRETO - HOSPITAL DA BALEIA (BH):
            </p>
            <code
              style={{ fontSize: "1.2rem", color: "#000", fontWeight: "bold" }}
            >
              pix@hospitaldabaleia.org.br
            </code>
          </div>
        </div>
      </div>

      <div className="split-container">
        {/* LADO ESQUERDO: RAFAEL MENIN */}
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
              justifyContent: "flex-end", // <--- ALTERADO: Desce o nome para o rodapé da foto
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

        {/* LADO DIREITO: RUBENS MENIN */}
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
              justifyContent: "flex-end", // <--- ALTERADO: Desce o nome para o rodapé da foto
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

      {/* RODAPÉ / AVISO LEGAL */}
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
