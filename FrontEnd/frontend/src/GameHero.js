import React from 'react';
import './GameHero.css';

export default function GameHero() {
  return <section className="game-hero" aria-labelledby="game-hero-title">
    <div className="page-shell game-hero__grid">
      <div><p className="section-kicker">Galo do Povo apresenta · Jogo gratuito</p>
        <h2 id="game-hero-title">A cobrança agora<br />é com você.</h2>
        <p>Crie seu torcedor, desvie da burocracia e leve a decisão até a última mesa em <strong>Demita o Diretor</strong>.</p>
        <div className="hero-actions"><a className="btn btn--primary" href="/jogos/demita-o-diretor/">Entrar no jogo</a><a className="btn btn--secondary" href="#portal-editorial">Continuar no portal</a></div>
        <p className="game-hero__note">Obra de ficção: personagens, clube e acontecimentos inventados. Computador e celular · ranking opcional.</p>
      </div>
      <a href="/jogos/demita-o-diretor/" aria-label="Conhecer o jogo Demita o Diretor"><img src="/jogos/demita-o-diretor/capa.svg" alt="Torcedor alvinegro diante da mesa de decisão" width="640" height="400" /></a>
    </div>
  </section>;
}
