import React from "react";

export default function GamesSection() {
  return (
    <section className="section-block page-shell games-section" id="jogos" aria-labelledby="jogos-titulo">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Arquibancada / Jogos</p>
          <h2 id="jogos-titulo">Jogos da Massa</h2>
          <p className="section-lead">Uma aventura de futebol e burocracia em um universo inteiramente inventado.</p>
        </div>
      </div>
      <article className="mass-game">
        <a className="mass-game__cover" href="/jogos/demita-o-diretor/" aria-label="Jogar Demita o Diretor">
          <img src="/jogos/demita-o-diretor/capa.svg" alt="Torcedor alvinegro diante de uma mesa de diretoria em um cenário de jogo arcade" width="640" height="400" loading="lazy" />
        </a>
        <div className="mass-game__body">
          <p className="section-kicker">Arcade / 4 chefes / Grátis</p>
          <h3>Demita o Diretor</h3>
          <p>Crie seu torcedor, reúna as cobranças da Massa e atravesse as mesas de Nestor Carimbo, Célio Parecer, Bento Protocolo e Otávio Martelo. A decisão só sai depois da última assinatura.</p>
          <div className="mass-game__tags"><span>Computador e celular</span><span>Sem download</span><span>Perfil local</span></div>
          <a className="btn btn--primary" href="/jogos/demita-o-diretor/">Jogar agora</a>
          <p className="mass-game__note">Jogo de ficção. Personagens, clube, falas e acontecimentos inventados, sem representar pessoas ou fatos reais. O perfil fica no navegador. O ranking público por apelido é opcional.</p>
        </div>
      </article>
    </section>
  );
}
