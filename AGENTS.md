# Galo do Povo

## Contexto

O Galo do Povo é um projeto de fiscalização e protesto da torcida do Atlético-MG contra a gestão da SAF.

Todo conteúdo deve ser baseado em fontes identificáveis. O sistema deve distinguir fato, declaração, promessa, mudança de discurso e interpretação.

## Stack obrigatória

Frontend:

* React
* Create React App
* JavaScript
* Vercel

Backend:

* Node.js
* Express
* CommonJS
* MongoDB Atlas
* Mongoose
* Render

Integrações:

* Nodemailer
* node-cron
* rss-parser

Não migrar para:

* Next.js
* Vite
* TypeScript
* outro banco de dados
* outro framework de backend

## Regras de alteração

* Fazer alterações incrementais.
* Não reescrever arquivos inteiros sem necessidade.
* Não alterar comportamento público existente sem solicitação.
* Preservar todas as rotas atuais.
* Não renomear campos existentes sem compatibilidade retroativa.
* Não colocar segredos no código.
* Não editar arquivos `.env`.
* Não imprimir credenciais nos logs.
* Não adicionar dependência sem justificar.
* Não publicar comparações automaticamente.
* Comparações geradas por IA devem começar com status PENDENTE.
* Toda comparação deve preservar links, datas e trechos das fontes.
* Não classificar automaticamente algo como mentira.
* Usar classificações neutras, como mudança de discurso, contradição aparente, promessa cumprida ou promessa sob verificação.

## Frontend

Após qualquer alteração, executar:

CI=true npm run build

Corrigir imediatamente:

* no-unused-vars
* react-hooks/exhaustive-deps
* imports não utilizados
* problemas de JSX
* falhas de teste

Não silenciar warnings com comentários ESLint sem justificativa técnica.

## Backend

Após qualquer alteração, executar:

node --check index.js

Quando existirem testes:

npm test

O backend deve:

* continuar iniciando mesmo se uma fonte RSS falhar;
* impedir duplicidade de matérias;
* impedir duplicidade de comparações;
* não executar duas instâncias simultâneas do mesmo job;
* registrar erros externos sem derrubar a API;
* usar timeout em chamadas externas.

## Git

* Criar uma branch por etapa.
* Não trabalhar diretamente na main.
* Apresentar resumo dos arquivos alterados.
* Apresentar comandos executados.
* Informar testes aprovados e testes não executados.
* Não fazer merge automático.
