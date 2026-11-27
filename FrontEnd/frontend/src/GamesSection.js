import React from "react";

export default function GamesSection() {
  return (
    <section className="section-block page-shell games-section" id="jogos" aria-labelledby="jogos-titulo">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Arquibancada / Jogos</p>
          <h2 id="jogos-titulo">Jogos da Massa</h2>
          <p className="section-lead">A resenha da arquibancada também vira jogo. Sátira, futebol e uma boa dose de burocracia.</p>
        </div>
      </div>
      <article className="mass-game">
        <a className="mass-game__cover" href="/jogos/demita-o-paulo-bracks/" aria-label="Jogar Demita o Paulo Bracks">
          <img src="/jogos/demita-o-paulo-bracks/capa.svg" alt="Torcedor alvinegro diante de uma mesa de diretoria em um cenário de jogo arcade" width="640" height="400" loading="lazy" />
        </a>
        <div className="mass-game__body">
          <p className="section-kicker">Arcade / 4 chefes / Grátis</p>
          <h3>Demita o Paulo Bracks</h3>
          <p>Crie seu torcedor, reúna as cobranças da Massa e atravesse as mesas de Bracks, Pedro Daniel, Rafael Menin e Rubens Menin. A decisão só sai depois da última assinatura.</p>
          <div className="mass-game__tags"><span>Computador e celular</span><span>Sem download</span><span>Perfil local</span></div>
          <a className="btn btn--primary" href="/jogos/demita-o-paulo-bracks/">Jogar agora</a>
          <p className="mass-game__note">Jogo de paródia. Falas, habilidades e situações fictícias, sem vínculo oficial com o clube. O cadastro do torcedor fica somente no navegador.</p>
        </div>
      </article>
    </section>
  );
}
