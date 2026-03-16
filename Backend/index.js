// backend/index.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Dados estáticos (exemplo)
const materias = [
  { id: 1, titulo: 'Mentira 1 - Exemplo', link: '#mentira1' },
  { id: 2, titulo: 'Mentira 2 - Exemplo', link: '#mentira2' },
  // adicionar mais
];

// Data de início para o contador de dias
const dataInicio = new Date('2023-01-01T00:00:00Z');

app.get('/api/materias', (req, res) => {
  res.json(materias);
});

app.get('/api/contador', (req, res) => {
  const hoje = new Date();
  const diffTime = hoje - dataInicio;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalMentiras = materias.length;

  res.json({ dias: diffDays, mentiras: totalMentiras });
});

const port = 4000;
app.listen(port, () => console.log(`Backend rodando na porta ${port}`));
