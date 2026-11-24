# FrotaIF Web

Front-end do **FrotaIF**, sistema de gestão da frota do Campus Pau dos Ferros (IFRN). Feito em React + Vite (JavaScript), consome a API Spring Boot do projeto `frotaif` e segue o IFRN Design System.

Três papéis usam o sistema: **Servidor** (solicita viagens), **Motorista** (inicia e conclui viagens) e **Gestor** (aprova viagens e cuida de veículos e motoristas).

## Pré-requisitos

- Node 24
- O backend FrotaIF rodando em `http://localhost:8080`. Ele fica na pasta irmã deste projeto, `frotaif` (`../frotaif`): entre nela e rode `mvn spring-boot:run`. Precisa de **JDK 21 ou mais novo** (o `JAVA_HOME` precisa apontar para ele). O banco H2 é recriado a cada início, com os dados de `data.sql`.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
```

No desenvolvimento, o `StrictMode` do React executa cada efeito duas vezes: por isso cada GET aparece duas vezes na aba Network do navegador. No build de produção isso não acontece.

Outros comandos:

```bash
npm test         # testes (Vitest) das funções puras
npm run build    # gera a pasta dist
npm run lint     # oxlint
```

## Usuários de teste

Todos com a senha `123456` (vêm do `data.sql` do backend):

| E-mail | Papel |
|---|---|
| `gestor@ifrn.edu.br` | Gestor |
| `servidor@ifrn.edu.br` (Bruno) | Servidor |
| `carla@ifrn.edu.br` (Carla) | Servidor |
| `diego@terceirizada.com` | Motorista (CNH D válida) |
| `elias@terceirizada.com` | Motorista (CNH B, vence em 20 dias) |
| `fabio@terceirizada.com` | Motorista (CNH D vencida) |

Para ver o fluxo completo: o servidor solicita uma viagem, o gestor aprova escolhendo veículo e motorista (use Diego), o motorista inicia e conclui informando o km final.

## Telas por papel

- **Servidor:** Viagens (lista e detalhe, com cancelamento) e Solicitar viagem.
- **Motorista:** Viagens em duas abas (A fazer e em andamento, Histórico), com iniciar e concluir viagem.
- **Gestor:** Painel (indicadores e alertas), Viagens (aprovar, rejeitar, cancelar), Veículos (lista, cadastro, edição e detalhe com abas de Abastecimentos e Manutenções) e Motoristas (lista e cadastro/edição em modal).

## Por que existe o proxy do Vite

O navegador bloqueia chamadas entre origens diferentes (CORS) e o backend não libera o front. Em vez de alterar o backend, o `vite.config.js` repassa tudo que começa com `/api` para `http://localhost:8080`. Para o navegador, front e API são a mesma origem.

## Estrutura de pastas

```
src/
  api/         chamadas à API (cliente com token JWT e tratamento de erros, um arquivo por recurso)
  auth/        login, token, papéis e rotas protegidas
  components/  componentes do Design System (ds/), layout (Shell, Pagina) e peças reutilizadas
  hooks/       hooks compartilhados (carregar dados, campos de formulário)
  pages/       uma pasta por papel: servidor, motorista, gestor
  utils/       funções puras: formatar datas e números, validar placa e CPF, rótulos de status
```

## O que ficou de fora (e por quê)

Não há endpoint no backend para estas telas do protótipo, então elas não foram feitas:

- Meu perfil, troca de senha e foto (todos os papéis).
- Relatório de consumo e PDF.
- Página geral de Manutenções (as manutenções ficam na aba do veículo).
- "Minhas viagens" filtradas pelo usuário logado.

## Limitações do backend que aparecem na interface

- Motorista cadastrado pela tela **não tem login**: ele não consegue iniciar nem concluir viagens. Só os motoristas do `data.sql` (Diego, Elias, Fábio) entram no sistema.
- `GET /api/motoristas` devolve só motoristas ativos: ao inativar um motorista, ele some da lista.
- `GET /api/viagens` devolve todas as viagens, sem filtro por usuário. Por isso Servidor e Motorista veem as viagens do campus inteiro, e a tela avisa isso.
