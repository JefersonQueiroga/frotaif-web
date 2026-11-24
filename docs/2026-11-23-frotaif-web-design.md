# FrotaIF Web — design do front-end

Data: 23/11/2026 · Backend: `frotaif` (Spring Boot 4.1, JWT) · Protótipo: canvas "Protótipo FrotaIF"
(https://claude.ai/artifact/LfvapzC5QmKgjX771gnxj5), com o IFRN Design System.

## 1. Intenção

Construir em React + Vite o front-end do FrotaIF a partir do protótipo, consumindo **só os endpoints que o
backend já tem**. O backend não muda. O código é material que os alunos vão ler: claro, comentado em
português e sem abstrações desnecessárias.

## 2. Objetivos, não objetivos e anti-objetivos

**Objetivos**
- Login com JWT e navegação por papel (SERVIDOR, MOTORISTA, GESTOR).
- Cobrir todos os endpoints existentes (seção 7) com as telas do protótipo.
- Visual fiel ao protótipo e ao IFRN Design System (cores, fontes, componentes).
- Seguir o "Guia · Mensagens, formulários e estados" do protótipo em todas as telas: carregando, erro,
  vazio, filtro sem resultado, "Enviando…", confirmação antes de ação sem volta.

**Não objetivos** (telas do protótipo que ficam de fora por não ter endpoint)
- Meu perfil (Servidor, Motorista, Gestor), troca de senha e foto.
- Relatório de consumo e PDF (frota-documentos/S3).
- Página geral de Manutenções (as manutenções ficam na aba do veículo).
- Filtrar "minhas viagens" pelo usuário logado.

**Anti-objetivos** (seria falha mesmo funcionando)
- Contornar o backend no front: filtrar viagens pelo nome do usuário, montar relatório com várias chamadas,
  dados fictícios no lugar de dados da API.
- Biblioteca de UI (MUI, Bootstrap, Tailwind) que se afaste do visual do IFRN.
- Código "esperto" que um aluno não consiga acompanhar.

## 3. Restrições

- Stack definida: React + Vite, **JavaScript** (mesma stack de Programação para Internet).
- Backend intocado: sem CORS no Spring. O Vite faz proxy de `/api` para `http://localhost:8080`.
- JWT HS256 com claims `sub` (e-mail), `nome`, `papel`, `exp`. Não existe `/me` nem id do usuário no token.
- Erros da API vêm no formato padrão do Spring Boot: `{timestamp, status, error, message, path}`
  (`include-message: always`). 401 de token vencido/ausente e 403 de papel errado vêm **sem corpo**.
  400 de `@Valid` traz mensagem genérica, sem dizer o campo: o front valida os campos antes de enviar.
- Datas: `LocalDate` = `"2026-11-28"`, `LocalDateTime` = `"2026-11-28T07:00:00"` (sem fuso). O valor de
  `<input type="datetime-local">` (`"2026-11-28T07:00"`) é aceito como está.
- Ambiente: Node 24, npm 11, Java 25, Maven 3.9.

## 4. Abordagens consideradas

| Abordagem | Troca | Decisão |
|---|---|---|
| **Recriar os 6 componentes do IFRN como módulos JSX + copiar `tokens.css`** | ~500 linhas de componentes simples; código legível e importável | **Escolhida** |
| Carregar o `bundle.js` do DS como script global (`window.React`) | Zero trabalho inicial, mas global, sem módulos, 90 KB de slides/portal junto | Descartada |
| Biblioteca de UI pronta (MUI/Bootstrap) | Mais componentes prontos, mas foge do protótipo | Descartada |
| CORS no `SecurityConfig` em vez do proxy | Funciona sem Vite, mas muda o backend | Descartada |
| TypeScript, axios, React Query, lib de formulário | Mais robusto, mais coisa para ensinar | Descartadas |

## 5. Arquitetura

**Pasta e repositório:** `C:\Users\Jeferson\Documents\workspaces\ifrn\2026\dsc\frotaif-web`, ao lado de
`frotaif`, com git próprio. Commits por funcionalidade, mensagens no padrão `feat: ...` em português.

**Dependências:** `react`, `react-dom`, `react-router-dom`, `lucide-react` (ícones, os mesmos que o DS usa).
Dev: `vite`, `@vitejs/plugin-react`, `vitest`. Fontes Open Sans e JetBrains Mono via Google Fonts no `index.html`.

**Estrutura de pastas**
```
frotaif-web/
  index.html            fontes do Google, <title>FrotaIF</title>
  vite.config.js        proxy /api → http://localhost:8080
  public/ifrn-logo.*    logo do IFRN (copiado do protótipo; nunca redesenhar a marca)
  src/
    main.jsx            BrowserRouter + AuthProvider
    App.jsx             tabela de rotas
    styles/tokens.css   copiado do DS (project/ds/ifrn/tokens.css)
    styles/global.css   reset, body, utilitários de layout
    api/cliente.js      fetch com token e tratamento de erro (ApiError)
    api/auth.js, viagens.js, veiculos.js, motoristas.js, abastecimentos.js, manutencoes.js
    auth/token.js       ler claims do JWT (atob), checar exp
    auth/AuthContext.jsx  usuário logado, entrar(), sair()
    auth/RotaProtegida.jsx  exige login e papel
    components/ds/      Button, Input, Select, Textarea, Alert, Badge, Tabs, Modal, Tabela, Skeleton
    components/layout/  Shell (cabeçalho + barra de navegação por papel), Pagina (título + barra verde)
    components/         StatusBadge, EstadoLista, ModalConfirmar, ModalMotivo, DetalheViagem, ...
    hooks/useCarregar.js  { dados, carregando, erro, recarregar } para GETs
    utils/formatar.js   datas, números, moeda, km em pt-BR
    utils/validar.js    placa Mercosul, CPF (dígito verificador), datas
    pages/              Login, servidor/, motorista/, gestor/
```

**Estilo:** um `.css` por componente, com classes e variáveis do `tokens.css` (nada de estilo inline como no
DS). Na recriação, corrigir o que o inventário apontou: `useId` chamado sem condição, `aria-invalid` e
`aria-describedby` no Input/Select/Textarea, borda de erro de 2px, Tabs com navegação por setas, Alert com
`role="alert"` só para danger/warning (`role="status"` nos demais).

**Modal:** componente próprio com `<dialog>` nativo (Esc fecha, foco preso pelo navegador), botões no padrão
do guia: ação repetida no botão principal ("Cancelar viagem", nunca "OK") e "Voltar" (ghost).

### 5.1 Autenticação

- `POST /api/auth/login` → guarda `accessToken` no `localStorage` (`frotaif.token`).
- `token.js` decodifica o payload (Base64URL) e lê `nome`, `papel`, `exp`. Comentar no código que ler o token
  no front é só para montar a tela: quem garante a segurança é o backend.
- Ao abrir o app: token ausente ou vencido → limpa e manda para `/login`.
- `sair()` limpa o token e vai para `/login`.
- 401 em qualquer chamada (exceto o próprio login) → limpa o token e vai para `/login?expirou=1`; o login
  mostra o Alert "Sua sessão expirou. Entre de novo."
- Login com 401 → Alert danger "E-mail ou senha inválidos" (mensagem da API).

### 5.2 Cliente da API (`api/cliente.js`)

Uma função `api(caminho, { method, body })`:
- monta `fetch('/api' + caminho)` com `Content-Type: application/json` e `Authorization: Bearer <token>`;
- 204 → `null`; corpo JSON → objeto;
- resposta não-ok → lança `ApiError { status, mensagem }`, com `mensagem` = `corpo.detail ?? corpo.message`
  ou um texto padrão por status quando não há corpo;
- falha de rede → `ApiError { status: 0 }`.

Os módulos por recurso (`viagens.js` etc.) só nomeiam as chamadas: `listarViagens(filtros)`,
`aprovarViagem(id, { veiculoId, motoristaId })`, etc.

### 5.3 Como mostrar erros (do guia de estados)

| Status | Onde e como |
|---|---|
| 400 | Alert danger "Dados inválidos" + mensagem (os campos já foram validados no front) |
| 401 | Volta ao login com "Sua sessão expirou" |
| 403 | Alert danger "Sem permissão" + mensagem ou "Você não pode fazer esta ação." |
| 404 | Estado "não encontrado" na página, com link de volta à lista |
| 409 | Alert danger "Conflito (409)" + mensagem, acima do formulário ou dentro do modal |
| 422 | Alert danger "Regra de negócio (422)" + mensagem, idem |
| 5xx / rede | Alert warning "Não foi possível falar com o servidor" + botão "Tentar de novo"; os dados digitados ficam |

Um componente `AlertaErro` faz esse mapeamento a partir do `ApiError`.

### 5.4 Estados de tela

- **Carregando:** Skeleton com pulso (respeita `prefers-reduced-motion`).
- **Falha ao carregar:** Alert warning com "Tentar de novo" (`recarregar()` do `useCarregar`).
- **Lista vazia** ("Nenhuma viagem cadastrada.") é diferente de **filtro sem resultado** ("Nenhuma viagem com
  esses filtros." + "Limpar filtros").
- **Formulário:** erro aparece ao enviar e some ao editar o campo; com 2+ erros, resumo "Faltam corrigir N
  campos" e foco no primeiro campo com erro; botão desabilitado com "Enviando…"; nunca apagar o digitado.
- **Sucesso:** Alert success fechável no topo do conteúdo (sem toast que some sozinho).

## 6. Layout e rotas

**Shell** (todas as telas logadas): cabeçalho branco com logo IFRN, divisor, "FrotaIF / Frota do Campus Pau
dos Ferros"; à direita, avatar com iniciais (green-600), nome e papel, e botão "Sair". Abaixo, barra verde
(green-500) com o menu do papel; item ativo em green-700, negrito, `aria-current="page"`. Conteúdo com
largura máxima de 1200px. Título h1 32px com barra verde 56×4 e subtítulo. Tabelas dentro de card com
rolagem horizontal. Placas, CPF e IDs em fonte mono. Funciona em largura de celular (menu quebra linha).

**Menus por papel** (sem Perfil, Relatório e Manutenções):
- SERVIDOR: Viagens · Solicitar viagem
- MOTORISTA: Viagens
- GESTOR: Painel · Viagens · Veículos · Motoristas

**Rotas**
| Rota | Papel | Tela |
|---|---|---|
| `/login` | público | Login |
| `/` | logado | redireciona para a tela inicial do papel |
| `/servidor/viagens` | SERVIDOR | Lista de viagens |
| `/servidor/viagens/nova` | SERVIDOR | Solicitar viagem |
| `/servidor/viagens/:id` | SERVIDOR | Detalhe da viagem |
| `/motorista/viagens` | MOTORISTA | Viagens (abas) |
| `/motorista/viagens/:id` | MOTORISTA | Detalhe da viagem |
| `/gestor` | GESTOR | Painel |
| `/gestor/viagens` | GESTOR | Lista de viagens |
| `/gestor/viagens/:id` | GESTOR | Detalhe com aprovar/rejeitar/cancelar |
| `/gestor/veiculos` | GESTOR | Lista de veículos |
| `/gestor/veiculos/novo` | GESTOR | Novo veículo |
| `/gestor/veiculos/:id` | GESTOR | Detalhe com abas Abastecimentos e Manutenções |
| `/gestor/veiculos/:id/editar` | GESTOR | Editar veículo (mesmo formulário do novo) |
| `/gestor/motoristas` | GESTOR | Lista + modal de cadastro/edição |
| `*` | — | Página não encontrada |

Rota de outro papel → redireciona para a tela inicial do próprio papel.

**Cores do StatusBadge**
- Viagem: SOLICITADA amber · APROVADA blue · EM_ANDAMENTO solid · CONCLUIDA green · REJEITADA red · CANCELADA neutral
- Veículo: DISPONIVEL green · EM_VIAGEM blue · EM_MANUTENCAO amber · INATIVO neutral
- Manutenção: PREVENTIVA blue · CORRETIVA amber
- Rótulos em português legível ("Em andamento", "Em manutenção").

## 7. Telas e endpoints

### Login — `POST /api/auth/login`
Como no protótipo: painel verde à esquerda (sem os números fixos de "4 veículos / 3 motoristas", que viriam de
dado fictício), formulário à direita com e-mail, senha, "Entrar". Sem o bloco "Acesso rápido do protótipo".
Após entrar, vai para a tela inicial do papel.

### Servidor
- **Viagens** — `GET /api/viagens?status&inicio&fim`. Título "Viagens" e um Alert info explicando que a
  lista mostra todas as viagens do campus. Filtros Status, "Saída a partir de", "Até", "Limpar filtros";
  contador. Tabela: Nº, Destino, Finalidade, Solicitante, Saída, Retorno previsto, Pass., Status, "Ver detalhes".
- **Solicitar viagem** — `POST /api/viagens`. Campos Destino, Nº de passageiros, Finalidade (Textarea),
  Saída e Retorno previsto (`datetime-local`). Validação local: obrigatórios, passageiros > 0, retorno depois
  da saída. Alert info sobre antecedência **sem fixar horas** (o backend usa 24h hoje e o protótipo fala em
  48h): "Peça com antecedência; pedidos em cima da hora são recusados." A mensagem do 422 diz as horas.
  Sucesso: volta à lista com "Viagem #N enviada para aprovação."
- **Detalhe** — `GET /api/viagens/{id}`. Badge, dados, veículo e motorista ("Definido na aprovação" se nulo),
  km inicial/final, motivo em Alert danger se REJEITADA/CANCELADA, linha do tempo simples pelo status.
  "Cancelar viagem" em SOLICITADA/APROVADA → ModalMotivo → `PATCH /api/viagens/{id}/cancelar {motivo}`.
  Se a viagem não for do usuário, o backend devolve 403 e a tela mostra.

### Motorista
- **Viagens** — `GET /api/viagens`, com Tabs "A fazer e em andamento" (APROVADA, EM_ANDAMENTO, filtradas na
  resposta por status) e "Histórico" (CONCLUIDA, CANCELADA). Alert info: a lista mostra as viagens de todos os
  motoristas; cada card mostra o motorista alocado. Cards com destino, período, veículo e placa, motorista,
  botões "Detalhes", "Iniciar viagem" (APROVADA) e "Concluir viagem" (EM_ANDAMENTO).
- **Iniciar** — ModalConfirmar ("Iniciar viagem" / "Voltar") → `PATCH /api/viagens/{id}/iniciar`. 403 se não
  for o motorista alocado; 409 se o veículo não estiver disponível.
- **Concluir** — modal com km final (> km inicial, validado no front) → `PATCH /api/viagens/{id}/concluir {kmFinal}`.
- **Detalhe** — como o do servidor, com bloco Veículo e km (inicial, final, rodados).

### Gestor
- **Painel** — KPIs: Aguardando aprovação (`GET /api/viagens?status=SOLICITADA`), Viagens hoje
  (`GET /api/viagens?inicio=hoje&fim=hoje`), Veículos disponíveis (`GET /api/veiculos`, "N de M ativos"),
  CNH vencida ou vencendo. Tabela de pedidos pendentes com "Analisar" → **detalhe da viagem**. Lista de CNH
  vencendo com Select 15/30/60/90 dias (`GET /api/motoristas/cnh-vencendo?dias=N`). Esse endpoint **não traz
  CNH já vencida**; as vencidas vêm de `GET /api/motoristas` (`validadeCnh < hoje`, ativos) em bloco à parte.
  4 cards de veículos por status.
- **Viagens** — `GET /api/viagens?status&inicio&fim`. Filtros Status e datas (sem filtro de solicitante: não
  há endpoint que liste solicitantes). Tabela com Veículo (placa) e "Analisar"/"Ver detalhes".
- **Detalhe da viagem (gestor)** — mesmo componente `DetalheViagem`, com ações por papel:
  - Aprovar (SOLICITADA) → modal com Select de veículo (`GET /api/veiculos?status=DISPONIVEL`, só os que
    comportam `qtdPassageiros`; se nenhum, Select desabilitado + Alert warning) e Select de motorista
    (`GET /api/motoristas`, ativos, mostrando categoria e validade) → `PATCH .../aprovar {veiculoId, motoristaId}`.
    Erros 409/422 (CNH, conflito de período) dentro do modal.
  - Rejeitar (SOLICITADA) → ModalMotivo → `PATCH .../rejeitar {motivo}`.
  - Cancelar (SOLICITADA/APROVADA) → ModalMotivo → `PATCH .../cancelar {motivo}`.
- **Veículos** — `GET /api/veiculos?status&tipo` (sem status = ativos; opção "Inativos" no filtro usa
  `status=INATIVO`). Tabela Placa, Veículo, Tipo, Lugares, Km atual, Status, "Abrir". Botão "Novo veículo".
- **Novo veículo / Editar** — `POST /api/veiculos` / `PUT /api/veiculos/{id}`. Um só formulário (página do
  protótipo GestorVeiculoNovo): seções Identificação (Placa Mercosul `AAA0A00`, maiúsculas, Ano, Marca, Modelo)
  e Tipo e capacidade (tipo em botões `aria-pressed`, capacidade, km atual só no cadastro). Alert info "Exige
  CNH D ou E" para Van/Ônibus. Prévia do cartão. 409 de placa duplicada. Sucesso do novo: Alert com "Ir para
  Veículos" e "Cadastrar outro"; da edição: volta ao detalhe com Alert success.
- **Detalhe do veículo** — `GET /api/veiculos/{id}`. Cards Tipo, Ano, Lugares, Km. Ações: Editar; Inativar
  (ModalConfirmar → `DELETE /api/veiculos/{id}`); Reativar quando INATIVO (`PATCH .../reativar`).
  - Aba **Abastecimentos**: `GET/POST /api/veiculos/{id}/abastecimentos`. Tabela Data, Posto, Litros, Valor,
    Km + formulário Data, Litros, Valor total, Km, Posto. 422 de km menor que o último.
  - Aba **Manutenções**: `GET /api/veiculos/{id}/manutencoes`. Tabela Tipo, Descrição, Início, Previsão, Fim,
    Custo, "Encerrar" (abertas). "Abrir manutenção" só com veículo DISPONIVEL → modal Tipo, Descrição, Início,
    Previsão; Alert warning listando as viagens APROVADAS deste veículo que o backend vai cancelar
    automaticamente; nesse caso o botão vira danger "Abrir e cancelar N viagens" →
    `POST /api/veiculos/{id}/manutencoes`. *(Decisão minha)* A prévia usa o **mesmo critério de sobreposição
    do backend** (`cancelarAprovadasNoPeriodo`: `saida < fimPrevisto + 1 dia` e `retornoPrevisto > início`):
    chama `GET /api/viagens?status=APROVADA&fim=<dataPrevistaFim>` (sem `inicio`, porque esse filtro olha só a
    saída e perderia a viagem que sai antes e volta durante a manutenção) e filtra no front por `veiculo.id` e
    `retornoPrevisto > dataInicio 00:00`. Comentar no código que é só uma prévia e quem decide é o backend. Encerrar → modal Data de fim e Custo →
    `PATCH /api/manutencoes/{id}/encerrar`.
- **Motoristas** — `GET /api/motoristas`. Tabela Nome, CPF (máscara), Registro CNH, Cat., Validade, Situação
  (CNH vencida / Vence em N dias (≤30) / CNH em dia / Inativo). Estado vazio. Ações Editar e Inativar
  (ModalConfirmar → `DELETE /api/motoristas/{id}`). Modal de cadastro/edição: Nome, CPF (máscara, dígito
  verificador; envia só dígitos), Registro CNH (11 dígitos), Categoria B–E, Validade → `POST` / `PUT`. 409 de CPF
  ou CNH duplicados. *(Decisão minha)* Alert info no modal de cadastro: "Motoristas cadastrados aqui não ganham
  login no FrotaIF. Eles podem ser alocados em viagens, mas não conseguem iniciar nem concluir." Motivo: o
  `MotoristaRequest` não tem `usuarioId` e não existe endpoint de usuários; só Diego, Elias e Fábio
  (`data.sql`) têm login vinculado, e `iniciar`/`concluir` exigem esse vínculo (senão 403).

## 8. Verificação

- **Vitest** só para funções puras: `utils/validar.js` (placa, CPF), `utils/formatar.js`, `auth/token.js`,
  e o mapeamento de erro do `cliente.js`.
- Cada tela verificada rodando contra o backend real (`mvn spring-boot:run` + `npm run dev`), com os usuários
  do `data.sql` (senha `123456`): fluxo completo solicitar → aprovar → iniciar → concluir, e os erros
  esperados (403 de outro motorista, 409 de conflito, 422 de antecedência). Sem suíte e2e no repositório.
- O fluxo completo usa motoristas com login: **Diego** (CNH D válida, `diego@terceirizada.com`). Elias (CNH B,
  vence em 20 dias) serve para o 422 de categoria em Van/Ônibus; Fábio (CNH D vencida) para o 422 de CNH
  vencida. Um motorista cadastrado pela tela não consegue iniciar viagem (ver Motoristas).

## 10. Decisões tomadas por mim (para conferir)

1. Pasta `frotaif-web` ao lado de `frotaif`, com git próprio; JavaScript em vez de TypeScript.
2. Código comentado em português pensando em leitura pelos alunos (não confirmado se é material de aula).
3. Títulos "Viagens" (não "Minhas viagens") para Servidor e Motorista, com Alert explicando que a lista é do
   campus inteiro.
4. Antecedência mínima sem número fixo na tela (backend 24h × protótipo 48h).
5. Prévia das viagens canceladas pela manutenção com o mesmo critério de sobreposição do backend.
6. Aviso no cadastro de motorista de que ele não terá login.
7. CNH vencida no Painel calculada a partir de `GET /api/motoristas`, porque `cnh-vencendo` não traz as vencidas.
8. Login sem os números fixos do painel verde e sem o bloco "Acesso rápido do protótipo".
9. Testes automatizados só para funções puras (Vitest); telas verificadas contra o backend rodando.

## 9. Deixado para quem constrói

- Nomes internos de funções e classes CSS, desde que em português e consistentes.
- Ordem de colunas e pequenos ajustes de layout, desde que fiéis ao protótipo.
- Texto exato de mensagens não definidas aqui, no tom do guia (o título diz o que houve, o texto diz o que fazer).
- Como obter o arquivo do logo IFRN (asset `393dc0686955f34cdab25e38a643ba6b` do protótipo ou arquivos do DS).
