import React, {useState, useRef, useEffect} from 'react';
import './GameAdmin.css';

const API = window.location.hostname === 'localhost' ? 'http://localhost:4000/api/game' : 'https://galodopovo-api.onrender.com/api/game';
export default function GameAdmin(){
  const [token,setToken]=useState(''),[data,setData]=useState(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const epoch=useRef(0);
  useEffect(()=>{try{localStorage.removeItem('galo_admin_token');}catch{}},[]);
  async function request(path,options={}){
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
    try{const response=await fetch(API+path,{...options,headers:{'x-admin-key':token},cache:'no-store',signal:controller.signal});
      if(!response.ok)throw Error(response.status===401||response.status===403?'Chave não autorizada.':'Não foi possível consultar o serviço. Tente novamente.');
      return await response.json();
    }finally{clearTimeout(timer);}
  }
  async function load(event){event?.preventDefault();const version=++epoch.current;setBusy(true);setError('');setData(null);try{const next=await request('/admin/summary');if(version===epoch.current)setData(next);}catch(e){if(version===epoch.current)setError(e.message);}finally{if(version===epoch.current)setBusy(false);}}
  async function hide(id){if(!window.confirm('Ocultar este resultado do ranking público?'))return;const version=++epoch.current;setBusy(true);setError('');try{await request('/admin/results/'+encodeURIComponent(id),{method:'DELETE'});const next=await request('/admin/summary');if(version===epoch.current)setData(next);}catch(e){if(version===epoch.current)setError(e.message);}finally{if(version===epoch.current)setBusy(false);}}
  function logout(){epoch.current++;setToken('');setData(null);setError('');setBusy(false);}
  const metrics=[['participants','Perfis participantes'],['started','Partidas iniciadas'],['finished','Partidas concluídas'],['wins','Vitórias'],['losses','Derrotas em tentativas'],['xOpens','Aberturas do X'],['imageDownloads','Downloads de imagem'],['shareMenus','Ações de compartilhar'],['textCopies','Cópias de texto']];
  return <main className="game-admin"><nav><a href="/">Galo do Povo</a> · <a href="/admin">Administração editorial</a></nav><h1>Painel interno do jogo</h1><p>Somente partidas com adesão ao ranking. Os números não representam todos os visitantes do portal.</p>
    <form onSubmit={load}><label htmlFor="game-admin-key">Chave de administração</label><input id="game-admin-key" type="password" value={token} autoComplete="off" required onChange={e=>{epoch.current++;setToken(e.target.value);setData(null);setError('');setBusy(false);}}/><button disabled={busy} type="submit">{busy?'Consultando...':'Consultar estatísticas'}</button><button type="button" onClick={logout}>Sair e limpar chave</button></form><p>A chave fica apenas na memória desta página. Recarregar ou sair encerra este acesso.</p>
    {error&&<p role="alert">{error}</p>}{data&&<><h2>Atividade dos últimos 90 dias</h2><div className="game-admin__metrics">{metrics.map(([key,label])=><article key={key}><span>{label}</span><strong>{data.totals[key]||0}</strong></article>)}</div><p>{data.note}</p><p>Ranking atual: semana de {data.week}. Publicações confirmadas no X: não disponíveis.</p><h2>Melhores resultados dos últimos 90 dias</h2><ol>{(data.best||[]).map(row=><li key={row.runId}>{row.nickname} · {row.score} pontos · {row.seconds}s</li>)}</ol><h2>Resultados recentes</h2><div className="game-admin__table"><table><thead><tr><th>Apelido</th><th>Pontos</th><th>Tempo</th><th>Resultado</th><th>Moderação</th></tr></thead><tbody>{data.recent.map(row=><tr key={row.runId}><td>{row.nickname}</td><td>{row.score}</td><td>{row.seconds}s</td><td>{row.won?'Vitória':'Encerrada'}</td><td><button disabled={busy||row.hidden} onClick={()=>hide(row.runId)}>{row.hidden?'Oculto':'Ocultar do ranking'}</button></td></tr>)}</tbody></table></div></>}
  </main>;
}
