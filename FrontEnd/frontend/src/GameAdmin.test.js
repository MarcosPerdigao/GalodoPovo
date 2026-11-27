import {act,fireEvent,render,screen} from '@testing-library/react';
import GameAdmin from './GameAdmin';
const originalFetch=global.fetch;
beforeEach(()=>{global.fetch=jest.fn();});
afterEach(()=>{global.fetch=originalFetch;});
test('não consulta o painel sem ação e trata acesso negado',async()=>{
  global.fetch.mockResolvedValue({ok:false,status:401});render(<GameAdmin/>);
  expect(global.fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Chave de administração'),{target:{value:'teste'}});
  fireEvent.click(screen.getByRole('button',{name:'Consultar estatísticas'}));
  expect(await screen.findByRole('alert')).toHaveTextContent('Chave não autorizada');
  fireEvent.click(screen.getByRole('button',{name:'Sair e limpar chave'}));
  expect(screen.getByLabelText('Chave de administração')).toHaveValue('');
});
test('sair durante uma consulta impede que uma resposta atrasada reabra os dados',async()=>{
  let resolve;global.fetch.mockImplementation(()=>new Promise(done=>{resolve=done;}));render(<GameAdmin/>);
  fireEvent.change(screen.getByLabelText('Chave de administração'),{target:{value:'teste'}});fireEvent.click(screen.getByRole('button',{name:'Consultar estatísticas'}));fireEvent.click(screen.getByRole('button',{name:'Sair e limpar chave'}));
  await act(async()=>{resolve({ok:true,json:async()=>({totals:{},recent:[],week:'2026-11-23',note:'Dados privados atrasados'})});});
  expect(screen.queryByText('Dados privados atrasados')).not.toBeInTheDocument();expect(screen.getByLabelText('Chave de administração')).toHaveValue('');
});
test('exibe apelidos como texto e distingue ações de publicação confirmada',async()=>{
  global.fetch.mockResolvedValue({ok:true,json:async()=>({totals:{started:2},week:'2026-11-23',note:'Dados opcionais',recent:[{runId:'run',nickname:'<script>teste</script>',score:12,seconds:44,won:true}]})});render(<GameAdmin/>);
  fireEvent.change(screen.getByLabelText('Chave de administração'),{target:{value:'teste'}});fireEvent.click(screen.getByRole('button',{name:'Consultar estatísticas'}));
  expect(await screen.findByText('<script>teste</script>')).toBeInTheDocument();expect(document.querySelector('script')).toBeNull();
  expect(screen.getByText(/Publicações confirmadas no X: não disponíveis/)).toBeInTheDocument();
});
