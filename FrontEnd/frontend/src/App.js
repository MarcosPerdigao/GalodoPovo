// frontend/src/App.jsx
import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [materias, setMaterias] = useState([]);
  const [contador, setContador] = useState({
    dias: 0,
    mentiras: 0,
    diasTecnico: 0,
    valorArrecadado: 0,
  });

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

  // --- MATEMÁTICA DA BARRA DE PROGRESSO ---
  const META_CAMPANHA = 13000;
  // Calcula a porcentagem (se passar de 100%, trava em 100 para não quebrar o layout)
  const progresso = Math.min(
    (contador.valorArrecadado / META_CAMPANHA) * 100,
    100,
  );

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor || 0);
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

      {/* BANNER DA CAMPANHA DE 13 MIL */}
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
          Se o problema é dinheiro, a torcida resolve. Nossa meta inicial é{" "}
          <strong>R$ 13.000,00</strong> para mostrar a força do povo e iniciar a
          retomada!
        </p>

        {/* BARRA DE PROGRESSO DINÂMICA */}
        <div
          style={{
            width: "100%",
            backgroundColor: "#333",
            height: "30px",
            borderRadius: "15px",
            margin: "20px 0",
            overflow: "hidden",
            border: "1px solid #444",
            position: "relative",
          }}
        >
          <div
            style={{
              width: `${progresso}%`,
              backgroundColor: "#FFD700",
              height: "100%",
              transition: "width 1s ease-in-out",
            }}
          ></div>
          {/* Texto em cima da barra */}
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: progresso > 50 ? "#000" : "#fff",
              fontWeight: "bold",
              fontSize: "1rem",
              textShadow: progresso > 50 ? "none" : "1px 1px 2px #000",
            }}
          >
            {formatarMoeda(contador.valorArrecadado)} /{" "}
            {formatarMoeda(META_CAMPANHA)}
          </span>
        </div>

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
            neste protesto vai direto para quem precisa de verdade.
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
          <p
            style={{
              fontSize: "0.85rem",
              color: "#FFD700",
              marginTop: "15px",
              fontWeight: "bold",
            }}
          >
            📸 Fez sua doação? Mande o comprovante para o nosso e-mail lá
            embaixo para subirmos o nosso contador!
          </p>
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

      {/* Dossiê */}
      {materias.length > 0 && (
        <section className="materias-section">
          <h2 className="titulo-secao">O Dossiê Completo</h2>
          {materias.map((m) => (
            <div
              id={m.link ? m.link.substring(1) : ""}
              key={m.id}
              className="materia-item"
            >
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

      {/* Seção de Contato Direto */}
      <section className="form-section">
        <div className="form-container" style={{ textAlign: "center" }}>
          <h2>Envie sua denúncia ou o Comprovante do PIX!</h2>
          <p style={{ marginBottom: "25px" }}>
            A diretoria tenta esconder, mas a arquibancada vê tudo. Nos envie
            links de matérias exclusivas ou o comprovante da sua doação para
            atualizarmos o contador. Sigilo absoluto.
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
