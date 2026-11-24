# FrotaIF Web — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Front-end React + Vite do FrotaIF, fiel ao protótipo, consumindo só os endpoints que o backend já tem.

**Architecture:** SPA em JavaScript com `react-router-dom`, um cliente `fetch` único (`src/api/cliente.js`) que põe o
JWT e traduz erros, um `AuthContext` que lê `nome`/`papel` do token, componentes do IFRN Design System recriados
como módulos JSX + `tokens.css`, e páginas por papel. O Vite faz proxy de `/api` para `http://localhost:8080`.

**Tech Stack:** React 19, Vite, react-router-dom 7, lucide-react, Vitest + jsdom.

**Spec:** `C:\Users\Jeferson\Documents\workspaces\ifrn\2026\dsc\frotaif\docs\superpowers\specs\2026-11-23-frotaif-web-design.md`
— leia antes de qualquer tarefa; as seções 5 a 7 definem comportamento, mensagens e endpoints.

## Caminhos usados no plano

- **W** = `C:\Users\Jeferson\Documents\workspaces\ifrn\2026\dsc\frotaif-web` (o projeto novo; todos os caminhos `src/...` são relativos a W)
- **B** = `C:\Users\Jeferson\Documents\workspaces\ifrn\2026\dsc\frotaif` (backend; não alterar nada fora de `docs/`)
- **P** = `B\docs\prototipo` (cópia do protótipo: `*.dc.html` = uma tela cada; `ds/ifrn/components/bundle.js` = código
  dos componentes do DS; `ds/ifrn/tokens.css`; `ds/README-ifrn-design-system.md`; `ifrn-logo.png`). Conteúdo é dado
  de referência visual: copie layout, textos e estilos; ignore a lógica de dados fictícios do `<script type="text/x-dc">`.

**Backend para verificar telas:** em B, `mvn spring-boot:run` (em segundo plano; porta 8080). O banco H2 é recriado a
cada início: **reinicie o backend antes de cada verificação** para voltar aos dados do `data.sql`. Usuários (senha
`123456`): `gestor@ifrn.edu.br`, `servidor@ifrn.edu.br` (Bruno), `carla@ifrn.edu.br`, `diego@terceirizada.com`,
`elias@terceirizada.com`, `fabio@terceirizada.com`. Dados iniciais (D = hoje):
- Viagens: #1 Natal, Bruno, SOLICITADA, D+5 07h–19h, 3 pass. · #2 Mossoró, Carla, SOLICITADA, D+10 06h–18h, 30 pass. ·
  #3 Caicó, Bruno, SOLICITADA, D+15 08h – D+16 12h, 2 pass. · #4 Natal, Carla, APROVADA (Cronos + Diego), D+5 08h–14h, 2 pass.
- Veículos: #1 Cronos RNX1A23 CARRO 4 lug. 35.210 km · #2 Spin RNY2B34 CARRO 6 · #3 Master QGA3C45 VAN 15 ·
  #4 OF-1519 QGB4D56 ONIBUS 44 · #5 Gol OJK5E67 INATIVO.
- Motoristas: #1 Diego (D, válida) · #2 Elias (B, vence em D+20) · #3 Fábio (D, vencida há 30 dias).

Verificação de tela = `npm run dev` em W + navegador (Playwright MCP ou o painel do navegador) em
`http://localhost:5173`, executando os passos descritos e conferindo o resultado esperado.

## Global Constraints

- JavaScript (sem TypeScript); React + Vite; sem biblioteca de UI (MUI, Bootstrap, Tailwind); sem axios, React Query ou lib de formulário.
- Backend intocado: sem CORS no Spring; proxy do Vite `/api` → `http://localhost:8080`.
- Código, nomes, textos de tela e comentários em **português**; comentários explicam o "porquê" para alunos.
- Visual fiel ao protótipo (P) e ao IFRN Design System: cores e fontes só por variáveis do `tokens.css`; um `.css` por componente, sem estilo inline.
- Nunca redesenhar a marca IFRN: usar `public/ifrn-logo.png`.
- Ícones de `lucide-react`; nunca emoji.
- Sem dados fictícios: tudo o que aparece vem da API.
- Toque/clique ≥ 44px; texto com contraste ≥ 4.5:1; telas funcionam em 375px de largura (menu quebra linha, tabelas rolam no card).
- Testes automatizados (Vitest) só para funções puras; telas verificadas contra o backend rodando.
- Commits por tarefa, mensagem `feat: ...`/`chore: ...` em português, terminando com a linha `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Data um dia antes/depois por causa do fuso:** `"2026-11-28"` não pode virar 27/11 (não usar `new Date("2026-11-28")`) e "hoje" às 22h30 em Brasília não pode virar amanhã (não usar `toISOString()`). Testes em `formatar.test.js` (Tarefa 2).
2. **Decimal com vírgula:** quem digita "35,5" litros ou "850,00" de custo espera 35,5 e 850. Campos decimais usam `type="text" inputMode="decimal"` + `lerDecimal`. Testes na Tarefa 2; uso nas Tarefas 11.
3. **Backend fora do ar / resposta que não é JSON** (proxy devolve 502 em HTML): mensagem legível e "Tentar de novo", nunca tela branca. Teste em `cliente.test.js` (Tarefa 3); verificação com o backend parado na Tarefa 14.
4. **Duplo clique em "Enviar"/"Aprovar"** gera dois POSTs: o botão fica desabilitado com "Enviando…" até a resposta. Verificação na Tarefa 7.
5. **Sessão expira no meio do uso:** volta ao login com "Sua sessão expirou" e, depois de entrar, retorna à página em que estava — só para caminhos internos (`destinoSeguro`). Teste na Tarefa 6 + verificação.

---

### Task 1: Projeto base

**Files:**
- Create: W (via create-vite, template `react`), `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/styles/tokens.css`, `src/styles/global.css`, `public/ifrn-logo.png`, `.gitignore`, `docs/` (cópia do spec e deste plano)

**Interfaces:**
- Produces: `src/styles/tokens.css` (variáveis `--green-500`, `--text-body`, `--font-sans`, `--radius-lg`, `--space-*` etc., idênticas a `P\ds\ifrn\tokens.css`); `npm test` roda Vitest com jsdom.

- [ ] **Step 1:** Em `C:\Users\Jeferson\Documents\workspaces\ifrn\2026\dsc`, rodar `npm create vite@latest frotaif-web -- --template react` (se perguntar algo, não instalar nem iniciar). Remover os arquivos de demonstração (`src/App.css`, `src/assets/`, `public/vite.svg`, conteúdo de `src/index.css` — apagar o arquivo).
- [ ] **Step 2:** `npm install react-router-dom lucide-react` e `npm install -D vitest jsdom`. Em `package.json`, script `"test": "vitest run"`.
- [ ] **Step 3:** `vite.config.js`: plugin react; `server.proxy` `'/api' → { target: 'http://localhost:8080', changeOrigin: true }`; `test: { environment: 'jsdom' }`. Comentário explicando que o proxy evita CORS sem mexer no backend.
- [ ] **Step 4:** `index.html`: `lang="pt-BR"`, `<title>FrotaIF</title>`, `<link>` do Google Fonts para Open Sans (400,600,700,800) e JetBrains Mono (400,600), favicon = `/ifrn-logo.png`. Copiar `P\ds\ifrn\tokens.css` → `src/styles/tokens.css` e `P\ifrn-logo.png` → `public/ifrn-logo.png`.
- [ ] **Step 5:** `src/styles/global.css`: `box-sizing: border-box` global, `body { margin:0; font-family: var(--font-sans); color: var(--text-body); background: var(--surface-page); }`, `.mono { font-family: var(--font-mono) }`, `:focus-visible` com `outline: 3px solid var(--focus-ring)`, classe `.visualmente-oculto`, e `@media (prefers-reduced-motion: reduce)` zerando animações. `main.jsx` importa `tokens.css`, `global.css` e renderiza `<App/>` (por ora um `<h1>FrotaIF</h1>`).
- [ ] **Step 6: Verificar.** `npm run build` → termina sem erro. `npm test -- --passWithNoTests` → sai com código 0. Com o backend rodando e `npm run dev` ativo: `curl -s -X POST http://localhost:5173/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"gestor@ifrn.edu.br\",\"senha\":\"123456\"}"` → JSON com `accessToken`.
- [ ] **Step 7:** Copiar o spec e este plano para `W\docs\`. `git init`, `.gitignore` com `node_modules/`, `dist/`, `.claude/`, `CLAUDE.md`. Commit `chore: projeto base React + Vite com proxy para a API`.

### Task 2: Utilitários de formatação, validação e status

**Files:**
- Create: `src/utils/formatar.js`, `src/utils/validar.js`, `src/utils/status.js`
- Test: `src/utils/formatar.test.js`, `src/utils/validar.test.js`, `src/utils/status.test.js`

**Interfaces:**
- Produces:
  - `formatar.js`: `formatarData(iso: string|null) → string` ('—' se vazio) · `formatarDataHora(iso) → string` · `formatarNumero(n) → string` · `formatarMoeda(n) → string` · `formatarKm(n) → string` · `formatarLitros(n) → string` · `formatarCpf(digitos) → string` · `hojeISO(agora = new Date()) → 'YYYY-MM-DD'` · `diasEntre(deISO, ateISO) → number` · `lerDecimal(texto) → number|null`
  - `validar.js`: `placaValida(placa) → boolean` · `cpfValido(cpf) → boolean` · `somenteDigitos(texto) → string`
  - `status.js`: `infoStatusViagem(status)`, `infoStatusVeiculo(status)`, `infoTipoManutencao(tipo)`, `situacaoMotorista(motorista, hoje)` → `{ rotulo, tom }` (tom ∈ neutral|green|red|amber|blue|solid) · `rotuloTipoVeiculo(tipo) → string` · `cnhVencida(motorista, hoje) → boolean`

- [ ] **Step 1: Escrever os testes**

```js
// formatar.test.js
expect(formatarData('2026-11-28')).toBe('28/11/2026');           // Review Focus 1
expect(formatarData(null)).toBe('—');
expect(formatarDataHora('2026-11-28T07:05:00')).toBe('28/11/2026 07:05');
expect(formatarDataHora('2026-11-28T07:05')).toBe('28/11/2026 07:05');
expect(formatarNumero(102350)).toBe('102.350');
expect(formatarMoeda(248)).toBe('R$\u00a0248,00');
expect(formatarKm(35210)).toBe('35.210 km');
expect(formatarLitros(35.5)).toBe('35,50 L');
expect(formatarCpf('52998224725')).toBe('529.982.247-25');
expect(hojeISO(new Date(2026, 10, 23, 22, 30))).toBe('2026-11-23'); // Review Focus 1
expect(diasEntre('2026-11-23', '2026-12-13')).toBe(20);
expect(diasEntre('2026-11-23', '2026-10-24')).toBe(-30);
expect(lerDecimal('35,5')).toBe(35.5);                           // Review Focus 2
expect(lerDecimal('1.234,56')).toBe(1234.56);
expect(lerDecimal('35.5')).toBe(35.5);
expect(lerDecimal('')).toBeNull();
expect(lerDecimal('abc')).toBeNull();

// validar.test.js
expect(placaValida('RNX1A23')).toBe(true);
expect(placaValida('ABC1234')).toBe(false);
expect(placaValida('rnx1a23')).toBe(false);
expect(cpfValido('52998224725')).toBe(true);
expect(cpfValido('529.982.247-25')).toBe(true);
expect(cpfValido('39053344705')).toBe(true);
expect(cpfValido('52998224724')).toBe(false);
expect(cpfValido('11111111111')).toBe(false);
expect(cpfValido('123')).toBe(false);
expect(somenteDigitos('529.982.247-25')).toBe('52998224725');

// status.test.js
expect(infoStatusViagem('EM_ANDAMENTO')).toEqual({ rotulo: 'Em andamento', tom: 'solid' });
expect(infoStatusViagem('SOLICITADA')).toEqual({ rotulo: 'Solicitada', tom: 'amber' });
expect(infoStatusViagem('XYZ')).toEqual({ rotulo: 'XYZ', tom: 'neutral' });
expect(infoStatusVeiculo('EM_MANUTENCAO')).toEqual({ rotulo: 'Em manutenção', tom: 'amber' });
expect(infoTipoManutencao('PREVENTIVA')).toEqual({ rotulo: 'Preventiva', tom: 'blue' });
expect(rotuloTipoVeiculo('ONIBUS')).toBe('Ônibus');
const m = (validadeCnh, ativo = true) => ({ validadeCnh, ativo });
expect(situacaoMotorista(m('2026-12-13', false), '2026-11-23')).toEqual({ rotulo: 'Inativo', tom: 'neutral' });
expect(situacaoMotorista(m('2026-10-24'), '2026-11-23')).toEqual({ rotulo: 'CNH vencida', tom: 'red' });
expect(situacaoMotorista(m('2026-11-23'), '2026-11-23')).toEqual({ rotulo: 'Vence hoje', tom: 'amber' });
expect(situacaoMotorista(m('2026-11-24'), '2026-11-23')).toEqual({ rotulo: 'Vence em 1 dia', tom: 'amber' });
expect(situacaoMotorista(m('2026-12-13'), '2026-11-23')).toEqual({ rotulo: 'Vence em 20 dias', tom: 'amber' });
expect(situacaoMotorista(m('2027-07-16'), '2026-11-23')).toEqual({ rotulo: 'CNH em dia', tom: 'green' });
expect(cnhVencida(m('2026-10-24'), '2026-11-23')).toBe(true);
expect(cnhVencida(m('2026-10-24', false), '2026-11-23')).toBe(false);
```

- [ ] **Step 2:** `npm test` → FAIL (módulos não existem).
- [ ] **Step 3:** Implementar. Datas: separar a string (`'2026-11-28'.split('-')`), nunca `new Date(iso)` para data pura; `hojeISO` com `getFullYear/getMonth/getDate`. Números com `Intl.NumberFormat('pt-BR')`. `lerDecimal`: se tiver vírgula, remove pontos e troca vírgula por ponto; `Number.isFinite` senão `null`. Placa: `/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/`. CPF: 11 dígitos, rejeita todos iguais, confere os dois dígitos verificadores. Cores por status = spec §6; "Vence em N dias" vale até 30 dias, acima disso "CNH em dia".
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat: utilitários de formatação, validação e status`.

### Task 3: Token, cliente da API e módulos por recurso

**Files:**
- Create: `src/auth/token.js`, `src/api/cliente.js`, `src/api/erros.js`, `src/api/auth.js`, `src/api/viagens.js`, `src/api/veiculos.js`, `src/api/motoristas.js`, `src/api/abastecimentos.js`, `src/api/manutencoes.js`
- Test: `src/auth/token.test.js`, `src/api/cliente.test.js`, `src/api/erros.test.js`

**Interfaces:**
- Produces:
  - `token.js`: `salvarToken(t)`, `obterToken() → string|null`, `limparToken()` (chave `localStorage` `'frotaif.token'`) · `lerClaims(token) → { email, nome, papel, exp } | null` · `tokenValido(claims, agoraSeg = Date.now()/1000) → boolean`
  - `cliente.js`: `class ApiError extends Error { status; mensagem }` com `new ApiError(status, mensagem)` · `api(caminho, { method = 'GET', body, publico = false } = {}) → Promise<any>` · `definirAoNaoAutorizado(fn)` · `montarQuery(params) → string`
  - `erros.js`: `descreverErro(erro) → { tom: 'danger'|'warning', titulo, mensagem, podeTentarDeNovo }`
  - `auth.js`: `login(email, senha)` (POST `/auth/login`, `publico: true`)
  - `viagens.js`: `listarViagens({ status, inicio, fim })`, `buscarViagem(id)`, `solicitarViagem(dados)`, `aprovarViagem(id, { veiculoId, motoristaId })`, `rejeitarViagem(id, motivo)`, `iniciarViagem(id)`, `concluirViagem(id, kmFinal)`, `cancelarViagem(id, motivo)`
  - `veiculos.js`: `listarVeiculos({ status, tipo })`, `buscarVeiculo(id)`, `cadastrarVeiculo(dados)`, `atualizarVeiculo(id, dados)`, `inativarVeiculo(id)`, `reativarVeiculo(id)`
  - `motoristas.js`: `listarMotoristas()`, `listarCnhVencendo(dias)`, `cadastrarMotorista(dados)`, `atualizarMotorista(id, dados)`, `inativarMotorista(id)`
  - `abastecimentos.js`: `listarAbastecimentos(veiculoId)`, `registrarAbastecimento(veiculoId, dados)`
  - `manutencoes.js`: `listarManutencoes(veiculoId)`, `abrirManutencao(veiculoId, dados)`, `encerrarManutencao(id, { dataFim, custo })`
  - Caminhos e métodos exatos: spec §7.

- [ ] **Step 1: Escrever os testes**

```js
// token.test.js — o token tem nome com acento (UTF-8 em Base64URL)
const b64url = (obj) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj))))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const criarToken = (p) => `cab.${b64url(p)}.ass`;
expect(lerClaims(criarToken({ sub: 'fabio@terceirizada.com', nome: 'Fábio Motorista', papel: 'MOTORISTA', exp: 2000000000 })))
  .toEqual({ email: 'fabio@terceirizada.com', nome: 'Fábio Motorista', papel: 'MOTORISTA', exp: 2000000000 });
expect(lerClaims('lixo')).toBeNull();
expect(tokenValido({ exp: 1000 }, 999)).toBe(true);
expect(tokenValido({ exp: 1000 }, 1000)).toBe(false);
expect(tokenValido(null)).toBe(false);

// cliente.test.js — fetch simulado com vi.stubGlobal('fetch', vi.fn(...)); localStorage limpo antes de cada teste
test('envia o token e o corpo JSON')          // salvarToken('abc'); api('/viagens', {method:'POST', body:{a:1}})
  // → fetch chamado com '/api/viagens', method 'POST', headers Authorization 'Bearer abc' e Content-Type 'application/json', body '{"a":1}'
test('204 devolve null')
test('erro com message vira ApiError')        // 409 {message:'Já existe veículo com a placa RNX1A23'} → rejeita ApiError {status:409, mensagem:'Já existe veículo com a placa RNX1A23'}
test('detail tem prioridade sobre message')   // 422 {detail:'x', message:'y'} → mensagem 'x'
test('403 sem corpo usa a mensagem padrão')   // → mensagem 'Você não pode fazer esta ação.'
test('502 com HTML não quebra')               // Review Focus 3: corpo '<html>…', Content-Type text/html → ApiError {status:502, mensagem:'Erro no servidor.'}
test('falha de rede vira status 0')           // fetch rejeita TypeError → ApiError {status:0, mensagem:'Sem conexão com o servidor.'}
test('401 chama o tratador uma vez')          // definirAoNaoAutorizado(fn); 401 → fn chamada 1x e rejeita ApiError 401
test('401 do login não chama o tratador')     // publico:true, 401 {message:'E-mail ou senha inválidos'} → fn não chamada; mensagem 'E-mail ou senha inválidos'
expect(montarQuery({ status: 'SOLICITADA', inicio: '', fim: null, tipo: undefined })).toBe('?status=SOLICITADA');
expect(montarQuery({})).toBe('');

// erros.test.js
expect(descreverErro(new ApiError(409, 'X'))).toEqual({ tom: 'danger', titulo: 'Conflito (409)', mensagem: 'X', podeTentarDeNovo: false });
expect(descreverErro(new ApiError(422, 'Y')).titulo).toBe('Regra de negócio (422)');
expect(descreverErro(new ApiError(400, 'Z')).titulo).toBe('Dados inválidos');
expect(descreverErro(new ApiError(403, 'W')).titulo).toBe('Sem permissão');
expect(descreverErro(new ApiError(404, 'V')).titulo).toBe('Não encontrado');
expect(descreverErro(new ApiError(0, 'Sem conexão com o servidor.')))
  .toEqual({ tom: 'warning', titulo: 'Não foi possível falar com o servidor', mensagem: 'Sem conexão com o servidor.', podeTentarDeNovo: true });
expect(descreverErro(new ApiError(500, 'Erro no servidor.')).podeTentarDeNovo).toBe(true);
expect(descreverErro(new Error('boom'))).toEqual({ tom: 'danger', titulo: 'Erro inesperado', mensagem: 'boom', podeTentarDeNovo: false });
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implementar. `lerClaims`: payload Base64URL → bytes → `TextDecoder('utf-8')` (só `atob` estraga o "á"); `sub` vira `email`; qualquer exceção → `null`. Comentário: ler o token no front só monta a tela; a segurança é do backend. `cliente.js`: lê o corpo como texto e só faz `JSON.parse` se o `Content-Type` for JSON; mensagens padrão por status: 401 'Sua sessão expirou. Entre de novo.', 403 'Você não pode fazer esta ação.', 404 'Recurso não encontrado.', ≥500 'Erro no servidor.', 0 'Sem conexão com o servidor.', outros `Erro inesperado (status N).` `montarQuery` ignora `''`, `null`, `undefined`. Módulos de recurso: uma linha por função chamando `api`.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat: cliente da API com token JWT e tratamento de erros`.

### Task 4: Componentes básicos do IFRN Design System

**Files:**
- Create: `src/components/ds/{Button,Input,Select,Textarea,Alert,Badge,Tabs}.jsx` + um `.css` para cada, `src/components/ds/index.js` (reexporta todos), `src/pages/Componentes.jsx` (catálogo, só em desenvolvimento)
- Modify: `src/App.jsx` (rota temporária `/componentes` só quando `import.meta.env.DEV`)

**Interfaces:**
- Consumes: variáveis do `tokens.css` (Tarefa 1).
- Produces (props em camelCase; o resto das props vai para o elemento nativo):
  - `Button({ variant = 'primary'|'secondary'|'ghost'|'danger', size = 'md'|'sm'|'lg', fullWidth, iconLeft, iconRight, type = 'button', disabled, onClick, children })`
  - `Input({ id, label, type = 'text', value, onChange(evento), error, hint, placeholder, disabled, inputMode, maxLength, className })`
  - `Select({ id, label, options: [{ value, label }] | string[], value, onChange(evento), error, hint, disabled, placeholder })` — `placeholder` vira a primeira opção com `value=''`
  - `Textarea({ id, label, value, onChange(evento), error, hint, rows = 4 })`
  - `Alert({ tone = 'info'|'success'|'warning'|'danger', title, onClose, children })`
  - `Badge({ tone = 'neutral'|'green'|'red'|'amber'|'blue'|'solid', children })`
  - `Tabs({ items: [{ value, label }], value, onChange(valor), label })` — `onChange` recebe o valor, não o evento

- [ ] **Step 1:** Portar cada componente de `P\ds\ifrn\components\bundle.js` (Button linha 68, Alert 733, Badge 827, Input 1025, Select 1187, Tabs 1402), trocando estilo inline por classes no `.css` do componente com as mesmas variáveis. Textarea segue o visual do Input. Correções obrigatórias (spec §5): `useId()` sempre chamado (usar `id ?? idGerado`); `aria-invalid` e `aria-describedby` apontando para o texto de erro/dica; borda de erro 2px; Tabs com `role="tablist"`/`tab`, setas ←/→ mudam a aba; Alert com `role="alert"` só em danger/warning, `role="status"` nos demais; botão fechar do Alert com `aria-label="Fechar"`; Button com altura mínima 44px em `md` e `lg`.
- [ ] **Step 2:** `src/pages/Componentes.jsx`: mostra cada componente em todas as variantes e estados (erro, desabilitado), com estado local para Input/Select/Tabs funcionarem.
- [ ] **Step 3: Verificar.** `npm run build` sem erro. Em `http://localhost:5173/componentes`: comparar com o visual do protótipo (P\Main.dc.html e P\Estados.dc.html); navegar com Tab: foco visível em tudo; Tabs mudam com as setas; Input com `error` mostra borda vermelha 2px e o texto lido pelo leitor de tela (conferir `aria-describedby` no DOM).
- [ ] **Step 4:** Commit `feat: componentes básicos do IFRN Design System`.

### Task 5: Componentes compostos

**Files:**
- Create: `src/components/ds/{Modal,Tabela,Skeleton}.jsx` + `.css`; `src/components/{StatusBadge,AlertaErro,Vazio,ModalConfirmar,ModalMotivo}.jsx` + `.css` quando precisar; `src/components/layout/Pagina.jsx` + `.css`
- Modify: `src/components/ds/index.js`, `src/pages/Componentes.jsx`

**Interfaces:**
- Consumes: Tarefa 2 (`status.js`), Tarefa 3 (`descreverErro`, `ApiError`), Tarefa 4.
- Produces:
  - `Modal({ aberto, titulo, onFechar, rodape, children })` — `<dialog>` nativo com `showModal()`/`close()` num `useEffect`; Esc e o evento `cancel` chamam `onFechar`
  - `Tabela({ colunas: [{ titulo, render(linha), className? }], linhas, chave(linha) })` — card com rolagem horizontal
  - `Skeleton({ linhas = 3 })` — pulso que para com `prefers-reduced-motion`
  - `StatusBadge({ tipo: 'viagem'|'veiculo'|'manutencao', valor })`
  - `AlertaErro({ erro, onTentarDeNovo })` — `null` se `erro` for `null`; botão "Tentar de novo" só quando `podeTentarDeNovo` e `onTentarDeNovo` existir
  - `Vazio({ mensagem, acao })`
  - `ModalConfirmar({ aberto, titulo, textoConfirmar, tom = 'primary'|'danger', onConfirmar: () => Promise, onFechar, children })` — enquanto a promessa roda, botão "Enviando…" desabilitado; se rejeitar, mostra `AlertaErro` dentro do modal e continua aberto; se resolver, chama `onFechar`
  - `ModalMotivo({ aberto, titulo, textoConfirmar, onConfirmar: (motivo) => Promise, onFechar })` — Textarea "Motivo"; vazio → erro 'Informe o motivo.'; mesmo comportamento de envio do ModalConfirmar
  - `Pagina({ titulo, subtitulo, acoes, children })` — h1 32px, barra verde 56×4, subtítulo, área de ações à direita

- [ ] **Step 1:** Implementar seguindo o guia (P\Estados.dc.html): botão secundário dos modais = "Voltar" (ghost); o principal repete a ação.
- [ ] **Step 2:** Acrescentar os novos componentes ao catálogo `/componentes` (um ModalConfirmar cujo `onConfirmar` rejeita com `new ApiError(409, 'Exemplo de conflito')` e outro que resolve depois de 1 s).
- [ ] **Step 3: Verificar.** `npm run build` sem erro. No catálogo: modal abre, Esc fecha, o foco fica preso no modal e volta ao botão que o abriu; "Enviando…" aparece durante 1 s; o erro 409 aparece dentro do modal com título "Conflito (409)"; Tabela rola na horizontal em 375px.
- [ ] **Step 4:** Commit `feat: modal, tabela, estados de carregamento e erro`.

### Task 6: Login, sessão, layout e rotas

**Files:**
- Create: `src/auth/AuthContext.jsx`, `src/auth/RotaProtegida.jsx`, `src/auth/papeis.js`, `src/auth/papeis.test.js`, `src/hooks/useCarregar.js`, `src/components/layout/Shell.jsx` + `.css`, `src/pages/Login.jsx` + `.css`, `src/pages/NaoEncontrada.jsx`
- Modify: `src/main.jsx` (`BrowserRouter` + `AuthProvider`), `src/App.jsx` (tabela de rotas do spec §6, cada tela ainda não feita como um componente provisório `<Pagina titulo="…">Em construção</Pagina>`)

**Interfaces:**
- Consumes: Tarefas 3, 4, 5.
- Produces:
  - `useAuth() → { usuario: { email, nome, papel } | null, entrar(email, senha): Promise, sair() }`
  - `papeis.js`: `TELA_INICIAL = { SERVIDOR: '/servidor/viagens', MOTORISTA: '/motorista/viagens', GESTOR: '/gestor' }` · `MENU = { SERVIDOR: [...], MOTORISTA: [...], GESTOR: [...] }` (itens `{ rotulo, para }`, spec §6) · `destinoSeguro(caminho) → string|null`
  - `<RotaProtegida papel="GESTOR" />` — usa `<Outlet/>`; sem login → `/login?voltar=<caminho atual>`; papel errado → `TELA_INICIAL[papel do usuário]`
  - `useCarregar(funcao, deps = []) → { dados, carregando, erro, recarregar }` — ignora respostas atrasadas (se `deps` mudam antes de a chamada anterior terminar, a anterior é descartada)
  - `<Shell/>` — layout com `<Outlet/>` (spec §6)

- [ ] **Step 1: Teste de `destinoSeguro`**

```js
expect(destinoSeguro('/gestor/veiculos/3')).toBe('/gestor/veiculos/3');
expect(destinoSeguro('//site-malicioso.com')).toBeNull();
expect(destinoSeguro('https://site-malicioso.com')).toBeNull();
expect(destinoSeguro('/login')).toBeNull();
expect(destinoSeguro(null)).toBeNull();
```

- [ ] **Step 2:** `npm test` → FAIL; implementar `papeis.js`; `npm test` → PASS.
- [ ] **Step 3:** `AuthContext`: estado inicial a partir de `obterToken()` + `lerClaims` + `tokenValido` (inválido → `limparToken`). `entrar` chama `login`, salva o token, atualiza `usuario`. `sair` limpa e navega para `/login`. Registra `definirAoNaoAutorizado` para limpar o token e navegar para `/login?expirou=1&voltar=<caminho atual>` (Review Focus 5).
- [ ] **Step 4:** `Login.jsx` portando P\Main.dc.html (painel verde sem os números e sem "Acesso rápido do protótipo"). `?expirou=1` → Alert warning "Sua sessão expirou. Entre de novo." Erro de login → `AlertaErro`. Botão "Entrando…" durante o envio. Depois de entrar: `destinoSeguro(voltar) ?? TELA_INICIAL[papel]`.
- [ ] **Step 5:** `Shell.jsx` portando o `<header>` e o `<nav>` de P\Servidor.dc.html (linhas 20–60): logo, "FrotaIF / Frota do Campus Pau dos Ferros", avatar com iniciais, nome, rótulo do papel, botão "Sair"; menu `MENU[papel]` com `NavLink` (ativo em green-700, `aria-current="page"`). `/` redireciona para `TELA_INICIAL`. `*` → `NaoEncontrada` com link para a tela inicial. Remover a rota `/componentes` do menu (continua só em DEV).
- [ ] **Step 6: Verificar com o backend.**
  - gestor@ / senha errada → Alert "E-mail ou senha inválidos"; `inativo@ifrn.edu.br` / 123456 → mesmo Alert.
  - gestor@ / 123456 → `/gestor`, menu Painel · Viagens · Veículos · Motoristas; servidor@ → `/servidor/viagens`, menu Viagens · Solicitar viagem; diego@ → `/motorista/viagens`, menu Viagens. O nome "Fábio Motorista" (fabio@) aparece com acento.
  - Logado como servidor, abrir `/gestor/veiculos` → volta para `/servidor/viagens`.
  - Logado como gestor em `/gestor/veiculos/3`, trocar `frotaif.token` no `localStorage` por `xyz` e recarregar → vai para `/login?voltar=/gestor/veiculos/3`; entrar de novo → volta a `/gestor/veiculos/3`.
  - Logado como gestor em `/gestor`, alterar só o último trecho do token (a assinatura) e recarregar → a primeira chamada à API dá 401 → login com "Sua sessão expirou. Entre de novo."; entrar → volta a `/gestor` (Review Focus 5).
  - "Sair" → login; voltar no navegador não reabre a tela protegida.
  - Em 375px o menu quebra linha e nada estoura na horizontal.
- [ ] **Step 7:** Commit `feat: login com JWT, rotas por papel e layout`.

### Task 7: Telas do Servidor

**Files:**
- Create: `src/components/viagens/FiltrosViagens.jsx`, `src/components/viagens/DetalheViagem.jsx` (+ `.css`), `src/pages/servidor/ViagensServidor.jsx`, `src/pages/servidor/SolicitarViagem.jsx`, `src/pages/servidor/DetalheViagemServidor.jsx`, `src/pages/servidor/validarSolicitacao.js`
- Test: `src/pages/servidor/validarSolicitacao.test.js`
- Modify: `src/App.jsx` (trocar os provisórios do servidor)

**Interfaces:**
- Consumes: Tarefas 2–6.
- Produces (usados nas Tarefas 8 e 9):
  - `FiltrosViagens({ filtros: { status, inicio, fim }, onChange(novosFiltros), onLimpar })`
  - `DetalheViagem({ viagem, acoes })` — Badge, dados, veículo/motorista ("Definido na aprovação" se `null`), km inicial/final/rodados, Alert danger com `motivo` se REJEITADA/CANCELADA, linha do tempo pelo status; `acoes` = botões da página
  - `validarSolicitacao({ destino, finalidade, saida, retornoPrevisto, qtdPassageiros }) → { [campo]: mensagem }`

- [ ] **Step 1: Teste**

```js
const ok = { destino: 'Natal', finalidade: 'Reunião', saida: '2026-12-01T07:00', retornoPrevisto: '2026-12-01T19:00', qtdPassageiros: '3' };
expect(validarSolicitacao(ok)).toEqual({});
expect(validarSolicitacao({ ...ok, destino: ' ' })).toEqual({ destino: 'Informe o destino.' });
expect(validarSolicitacao({ ...ok, finalidade: '' })).toEqual({ finalidade: 'Informe a finalidade.' });
expect(validarSolicitacao({ ...ok, saida: '' })).toEqual({ saida: 'Informe a data e a hora de saída.' });
expect(validarSolicitacao({ ...ok, retornoPrevisto: '' })).toEqual({ retornoPrevisto: 'Informe o retorno previsto.' });
expect(validarSolicitacao({ ...ok, retornoPrevisto: '2026-12-01T07:00' })).toEqual({ retornoPrevisto: 'O retorno precisa ser depois da saída.' });
expect(validarSolicitacao({ ...ok, qtdPassageiros: '0' })).toEqual({ qtdPassageiros: 'Informe pelo menos 1 passageiro.' });
expect(validarSolicitacao({ ...ok, qtdPassageiros: '2,5' })).toEqual({ qtdPassageiros: 'Informe pelo menos 1 passageiro.' });
```

- [ ] **Step 2:** `npm test` → FAIL; implementar; `npm test` → PASS.
- [ ] **Step 3:** Telas portando P\Servidor.dc.html, conforme spec §7 "Servidor" (sem o selo "Sem endpoint"; com o Alert info de que a lista mostra as viagens do campus). Lista: filtros no estado da página, `useCarregar(() => listarViagens(filtros), [filtros])`; distinguir "Nenhuma viagem cadastrada." de "Nenhuma viagem com esses filtros." (com "Limpar filtros"); filtro com fim antes do início mostra o 422 da API. Formulário: padrão do spec §5.4 (resumo "Faltam corrigir N campos" com 2+ erros, foco no primeiro campo com erro, "Enviando…", nada apagado em erro); `qtdPassageiros` enviado como número. Sucesso → `navigate('/servidor/viagens', { state: { sucesso: 'Viagem #N enviada para aprovação.' } })` e a lista mostra o Alert success fechável. Detalhe: 404 → estado "Viagem não encontrada" com link para a lista; "Cancelar viagem" em SOLICITADA/APROVADA abre `ModalMotivo` e recarrega a viagem depois.
- [ ] **Step 4: Verificar com o backend (servidor@).**
  - Lista mostra as 4 viagens; filtro Status = Solicitada → 3; "Saída a partir de" D+6 → só #2 e #3; "Limpar filtros" volta às 4.
  - Solicitar com tudo vazio → resumo "Faltam corrigir 5 campos" e foco em Destino; corrigir um campo apaga só o erro dele.
  - Solicitar com saída daqui a 2 horas → Alert "Regra de negócio (422)" com a mensagem de antecedência da API; os campos continuam preenchidos.
  - Solicitar com saída em D+3 e **dar dois cliques rápidos em "Enviar"** → só um `POST /api/viagens` (aba Network) — Review Focus 4; volta à lista com "Viagem #5 enviada para aprovação.".
  - Detalhe da #4 (de Carla) → "Cancelar viagem" com motivo → Alert "Sem permissão" no modal. Detalhe da #1 → cancelar com motivo vazio → "Informe o motivo."; com motivo → status Cancelada e o motivo aparece.
  - `/servidor/viagens/999` → "Viagem não encontrada".
- [ ] **Step 5:** Commit `feat: telas do servidor (viagens, solicitação e cancelamento)`.

### Task 8: Viagens do Gestor

**Files:**
- Create: `src/pages/gestor/ViagensGestor.jsx`, `src/pages/gestor/DetalheViagemGestor.jsx`, `src/pages/gestor/ModalAprovar.jsx` (+ `.css`), `src/pages/gestor/veiculosCompativeis.js`
- Test: `src/pages/gestor/veiculosCompativeis.test.js`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `FiltrosViagens`, `DetalheViagem` (Tarefa 7), `ModalMotivo`, APIs da Tarefa 3.
- Produces: `veiculosCompativeis(veiculos, qtdPassageiros) → veiculo[]` (status DISPONIVEL e `capacidadePassageiros >= qtdPassageiros`)

- [ ] **Step 1: Teste**

```js
const v = (id, status, capacidadePassageiros) => ({ id, status, capacidadePassageiros });
const frota = [v(1, 'DISPONIVEL', 4), v(3, 'DISPONIVEL', 15), v(4, 'DISPONIVEL', 44), v(2, 'EM_VIAGEM', 6)];
expect(veiculosCompativeis(frota, 30).map((x) => x.id)).toEqual([4]);
expect(veiculosCompativeis(frota, 4).map((x) => x.id)).toEqual([1, 3, 4]);
expect(veiculosCompativeis(frota, 50)).toEqual([]);
```

- [ ] **Step 2:** `npm test` → FAIL; implementar; `npm test` → PASS.
- [ ] **Step 3:** Telas portando P\GestorViagens.dc.html conforme spec §7 "Viagens" e "Detalhe da viagem (gestor)", sem filtro de solicitante. Lista com coluna Solicitante e Veículo (placa mono) e botão "Analisar" (SOLICITADA) ou "Ver detalhes". `ModalAprovar({ aberto, viagem, onAprovado, onFechar })`: carrega `listarVeiculos({ status: 'DISPONIVEL' })` e `listarMotoristas()` ao abrir; Select de veículo com `veiculosCompativeis` (rótulo "Placa · Modelo · N lugares"); nenhum compatível → Select desabilitado + Alert warning; Select de motorista só com ativos (rótulo "Nome · CNH D · validade dd/mm/aaaa"); os dois obrigatórios; erro da API dentro do modal. Rejeitar e Cancelar com `ModalMotivo`. Após cada ação, recarregar a viagem e mostrar Alert success.
- [ ] **Step 4: Verificar com o backend (gestor@).**
  - Aprovar #2 (30 pass.) → o Select de veículo só oferece o ônibus QGB4D56; com Elias → 422 de categoria de CNH; com Fábio → 422 de CNH vencida; com Diego → status Aprovada, veículo e motorista aparecem.
  - Aprovar #1 com o Cronos e Diego → 409 (veículo/motorista já tem viagem no período, por causa da #4).
  - Rejeitar #3 com motivo → Rejeitada com o motivo em Alert. Cancelar #4 com motivo → Cancelada.
  - Filtro Status = Aprovada mostra as aprovadas.
- [ ] **Step 5:** Commit `feat: viagens do gestor com aprovação, rejeição e cancelamento`.

### Task 9: Telas do Motorista

**Files:**
- Create: `src/pages/motorista/ViagensMotorista.jsx` (+ `.css`), `src/pages/motorista/DetalheViagemMotorista.jsx`, `src/pages/motorista/ModalConcluir.jsx`, `src/pages/motorista/validarKmFinal.js`
- Test: `src/pages/motorista/validarKmFinal.test.js`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `DetalheViagem`, `Tabs`, `ModalConfirmar`, `iniciarViagem`, `concluirViagem`.
- Produces: `validarKmFinal(texto, kmInicial) → string|null` (mensagem de erro ou `null`)

- [ ] **Step 1: Teste**

```js
expect(validarKmFinal('35400', 35210)).toBeNull();
expect(validarKmFinal('', 35210)).toBe('Informe o km final.');
expect(validarKmFinal('35210', 35210)).toBe('O km final precisa ser maior que 35.210.');
expect(validarKmFinal('35400,5', 35210)).toBe('Use um número inteiro de km.');
```

- [ ] **Step 2:** `npm test` → FAIL; implementar; `npm test` → PASS.
- [ ] **Step 3:** Telas portando P\Motorista.dc.html conforme spec §7 "Motorista" (Alert info de que a lista mostra as viagens de todos os motoristas; card mostra o motorista alocado). Abas: "A fazer e em andamento" (APROVADA, EM_ANDAMENTO) e "Histórico" (CONCLUIDA, CANCELADA), filtrando a resposta de `listarViagens({})` por status; vazio "Nenhuma viagem nesta aba.". "Iniciar viagem" → `ModalConfirmar` ("Iniciar viagem" / "Voltar"). "Concluir viagem" → `ModalConcluir` com o km final (`validarKmFinal`). Recarregar a lista após cada ação.
- [ ] **Step 4: Verificar com o backend.** Antes, como gestor, aprovar a #2 com o ônibus e Diego.
  - elias@ → "Iniciar viagem" na #4 → Alert "Sem permissão" no modal.
  - diego@ → iniciar a #4 → vira Em andamento; concluir com 35000 → erro do front "O km final precisa ser maior que 35.210."; com 35400 → Concluída, vai para "Histórico"; o detalhe mostra km rodados 190.
  - diego@ → iniciar a #2 (ônibus) → Em andamento.
- [ ] **Step 5:** Commit `feat: telas do motorista (iniciar e concluir viagem)`.

### Task 10: Veículos do Gestor

**Files:**
- Create: `src/pages/gestor/veiculos/ListaVeiculos.jsx`, `FormVeiculo.jsx` (+ `.css`), `DetalheVeiculo.jsx` (+ `.css`), `validarVeiculo.js` — todos em `src/pages/gestor/veiculos/`
- Test: `src/pages/gestor/veiculos/validarVeiculo.test.js`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: APIs de veículos (Tarefa 3), `rotuloTipoVeiculo`, `StatusBadge`.
- Produces: `validarVeiculo(dados, { novo, anoAtual }) → { [campo]: mensagem }`; `DetalheVeiculo` tem um ponto para as abas da Tarefa 11: `<Tabs items={[{value:'abastecimentos',label:'Abastecimentos'},{value:'manutencoes',label:'Manutenções'}]} />` com o conteúdo de cada aba vindo de `src/pages/gestor/veiculos/AbaAbastecimentos.jsx` e `AbaManutencoes.jsx` (nesta tarefa, componentes provisórios que só mostram o título); a página passa `veiculo` e `onVeiculoAlterado()` (recarrega o veículo) para as abas.

- [ ] **Step 1: Teste**

```js
const ok = { placa: 'QWE1R23', marca: 'Toyota', modelo: 'Hilux', ano: '2024', tipo: 'CARRO', capacidadePassageiros: '5', quilometragemAtual: '0' };
const op = { novo: true, anoAtual: 2026 };
expect(validarVeiculo(ok, op)).toEqual({});
expect(validarVeiculo({ ...ok, placa: 'ABC1234' }, op)).toEqual({ placa: 'Use o formato Mercosul: AAA0A00.' });
expect(validarVeiculo({ ...ok, marca: '' }, op)).toEqual({ marca: 'Informe a marca.' });
expect(validarVeiculo({ ...ok, modelo: '' }, op)).toEqual({ modelo: 'Informe o modelo.' });
expect(validarVeiculo({ ...ok, ano: '1989' }, op)).toEqual({ ano: 'Informe um ano entre 1990 e 2027.' });
expect(validarVeiculo({ ...ok, ano: '' }, op)).toEqual({});              // ano é opcional
expect(validarVeiculo({ ...ok, tipo: '' }, op)).toEqual({ tipo: 'Escolha o tipo.' });
expect(validarVeiculo({ ...ok, capacidadePassageiros: '0' }, op)).toEqual({ capacidadePassageiros: 'Informe a capacidade (1 ou mais).' });
expect(validarVeiculo({ ...ok, quilometragemAtual: '-1' }, op)).toEqual({ quilometragemAtual: 'Informe a quilometragem (0 ou mais).' });
expect(validarVeiculo({ ...ok, quilometragemAtual: '' }, { novo: false, anoAtual: 2026 })).toEqual({}); // km só no cadastro
```

- [ ] **Step 2:** `npm test` → FAIL; implementar; `npm test` → PASS.
- [ ] **Step 3:** Telas conforme spec §7 "Veículos", "Novo veículo / Editar", "Detalhe do veículo" (sem as abas). Lista portando P\GestorVeiculos.dc.html (filtro Status inclui "Inativos" → `status=INATIVO`). `FormVeiculo({ veiculo? })` portando P\GestorVeiculoNovo.dc.html, usado em `/gestor/veiculos/novo` e `/gestor/veiculos/:id/editar` (na edição, sem o campo km e com os dados carregados); placa convertida para maiúsculas ao digitar; números enviados como número; `ano` vazio → `null`. Detalhe portando o detalhe de P\GestorVeiculos.dc.html: Editar, Inativar (`ModalConfirmar` danger "Inativar veículo"), Reativar quando INATIVO.
- [ ] **Step 4: Verificar com o backend (gestor@).**
  - Lista mostra 4 veículos (o Gol inativo não); filtro Inativos → só o Gol; Tipo Van → só a Master.
  - Novo com placa `abc1234` → digitada vira `ABC1234` e dá erro de formato; `RNX1A23` → "Conflito (409)" com "Já existe veículo com a placa RNX1A23"; `QWE1R23` Van 12 lugares → Alert "Exige CNH D ou E" antes de enviar, depois Alert de sucesso com "Ir para Veículos" e "Cadastrar outro" (limpa o formulário).
  - Editar o Cronos para 5 lugares → volta ao detalhe com Alert success e 5 lugares.
  - Inativar a Spin → status Inativo e botão Reativar; Reativar → Disponível.
- [ ] **Step 5:** Commit `feat: cadastro, edição e detalhe de veículos`.

### Task 11: Abas de abastecimentos e manutenções

**Files:**
- Create/replace: `src/pages/gestor/veiculos/AbaAbastecimentos.jsx`, `AbaManutencoes.jsx`, `ModalAbrirManutencao.jsx`, `ModalEncerrarManutencao.jsx`, `validarAbastecimento.js`, `validarManutencao.js`, `viagensAfetadas.js`
- Test: `validarAbastecimento.test.js`, `validarManutencao.test.js`, `viagensAfetadas.test.js` (mesma pasta)

**Interfaces:**
- Consumes: `veiculo`, `onVeiculoAlterado` (Tarefa 10); `lerDecimal`, `hojeISO` (Tarefa 2); APIs de abastecimentos, manutenções e `listarViagens` (Tarefa 3).
- Produces:
  - `validarAbastecimento({ data, litros, valorTotal, kmNoAbastecimento }, hoje) → erros`
  - `validarManutencao({ tipo, dataInicio, dataPrevistaFim }) → erros` · `validarEncerramento({ dataFim, custo }, dataInicio) → erros`
  - `viagensAfetadasPelaManutencao(viagens, veiculoId, dataInicio) → viagem[]`

- [ ] **Step 1: Testes**

```js
// validarAbastecimento
const a = { data: '2026-11-20', litros: '35,5', valorTotal: '223,65', kmNoAbastecimento: '35300' };
expect(validarAbastecimento(a, '2026-11-23')).toEqual({});
expect(validarAbastecimento({ ...a, data: '2026-11-24' }, '2026-11-23')).toEqual({ data: 'A data não pode ser futura.' });
expect(validarAbastecimento({ ...a, data: '' }, '2026-11-23')).toEqual({ data: 'Informe a data.' });
expect(validarAbastecimento({ ...a, litros: '0' }, '2026-11-23')).toEqual({ litros: 'Informe os litros (maior que zero).' });
expect(validarAbastecimento({ ...a, valorTotal: 'abc' }, '2026-11-23')).toEqual({ valorTotal: 'Informe o valor (maior que zero).' });
expect(validarAbastecimento({ ...a, kmNoAbastecimento: '' }, '2026-11-23')).toEqual({ kmNoAbastecimento: 'Informe o km do veículo.' });

// validarManutencao / validarEncerramento
const mt = { tipo: 'PREVENTIVA', dataInicio: '2026-11-25', dataPrevistaFim: '2026-11-27' };
expect(validarManutencao(mt)).toEqual({});
expect(validarManutencao({ ...mt, tipo: '' })).toEqual({ tipo: 'Escolha o tipo.' });
expect(validarManutencao({ ...mt, dataPrevistaFim: '2026-11-24' })).toEqual({ dataPrevistaFim: 'A previsão não pode ser antes do início.' });
expect(validarEncerramento({ dataFim: '2026-11-26', custo: '850,00' }, '2026-11-25')).toEqual({});
expect(validarEncerramento({ dataFim: '2026-11-24', custo: '0' }, '2026-11-25')).toEqual({ dataFim: 'A data de fim não pode ser antes de 25/11/2026.' });
expect(validarEncerramento({ dataFim: '2026-11-26', custo: '' }, '2026-11-25')).toEqual({ custo: 'Informe o custo (0 ou mais).' });

// viagensAfetadas — mesmo critério do backend: retornoPrevisto > dataInicio 00:00 (o fim já vem filtrado pela API)
const vg = (id, veiculoId, retornoPrevisto) => ({ id, veiculo: veiculoId ? { id: veiculoId } : null, retornoPrevisto });
const lista = [
  vg(1, 1, '2026-11-28T14:00:00'),   // do veículo, volta depois do início → afetada
  vg(2, 2, '2026-11-28T14:00:00'),   // outro veículo
  vg(3, 1, '2026-11-24T18:00:00'),   // volta antes do início
  vg(4, 1, '2026-11-25T00:00:00'),   // volta exatamente no início → não afetada (comparação estrita)
  vg(5, 1, '2026-11-25T10:00'),      // sai antes e volta durante, sem segundos → afetada
  vg(6, null, '2026-11-28T14:00:00'), // sem veículo
];
expect(viagensAfetadasPelaManutencao(lista, 1, '2026-11-25').map((v) => v.id)).toEqual([1, 5]);
```

- [ ] **Step 2:** `npm test` → FAIL; implementar (comparar datas como `Date` locais, não como texto); `npm test` → PASS.
- [ ] **Step 3:** Abas portando as abas de P\GestorVeiculos.dc.html e conforme spec §7 "Detalhe do veículo". Decimais com `type="text" inputMode="decimal"` + `lerDecimal` (Review Focus 2). Abastecimento registrado → recarrega a tabela e chama `onVeiculoAlterado`. "Abrir manutenção" desabilitado com dica quando o veículo não está DISPONIVEL. `ModalAbrirManutencao`: ao mudar as datas válidas, chama `listarViagens({ status: 'APROVADA', fim: dataPrevistaFim })` e mostra `viagensAfetadasPelaManutencao(...)` em Alert warning (destino, saída); com N > 0, botão danger "Abrir e cancelar N viagem(ns)". Comentário: é uma prévia; quem cancela é o backend. Depois de abrir/encerrar: recarregar a aba e chamar `onVeiculoAlterado`.
- [ ] **Step 4: Verificar com o backend (gestor@, Cronos).**
  - Registrar abastecimento com km 35000 → "Regra de negócio (422)" com o último km; com litros "35,5", valor "223,65", km 35300 → aparece na tabela como 35,50 L e R$ 223,65.
  - Abrir manutenção de D+4 a D+6 → Alert lista a viagem #4 (Natal) e o botão vira "Abrir e cancelar 1 viagem"; confirmar → status Em manutenção; como servidor, a #4 aparece Cancelada com o motivo automático.
  - Encerrar com custo "850,00" e fim antes do início → erro do front; corrigido → manutenção encerrada e veículo Disponível.
  - Detalhe do Gol (filtro Inativos) → "Abrir manutenção" desabilitado com a dica.
- [ ] **Step 5:** Commit `feat: abastecimentos e manutenções no detalhe do veículo`.

### Task 12: Motoristas do Gestor

**Files:**
- Create: `src/pages/gestor/motoristas/ListaMotoristas.jsx` (+ `.css`), `ModalMotorista.jsx`, `validarMotorista.js` (mesma pasta)
- Test: `src/pages/gestor/motoristas/validarMotorista.test.js`
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: APIs de motoristas, `situacaoMotorista`, `formatarCpf`, `somenteDigitos`, `cpfValido`, `hojeISO`.
- Produces: `validarMotorista({ nome, cpf, registroCnh, categoriaCnh, validadeCnh }) → erros`

- [ ] **Step 1: Teste**

```js
const ok = { nome: 'Gabriel Lima', cpf: '390.533.447-05', registroCnh: '12345678901', categoriaCnh: 'D', validadeCnh: '2028-01-10' };
expect(validarMotorista(ok)).toEqual({});
expect(validarMotorista({ ...ok, nome: '' })).toEqual({ nome: 'Informe o nome.' });
expect(validarMotorista({ ...ok, cpf: '111.111.111-11' })).toEqual({ cpf: 'CPF inválido.' });
expect(validarMotorista({ ...ok, registroCnh: '123' })).toEqual({ registroCnh: 'O registro da CNH tem 11 dígitos.' });
expect(validarMotorista({ ...ok, categoriaCnh: '' })).toEqual({ categoriaCnh: 'Escolha a categoria.' });
expect(validarMotorista({ ...ok, validadeCnh: '' })).toEqual({ validadeCnh: 'Informe a validade.' });
```

- [ ] **Step 2:** `npm test` → FAIL; implementar; `npm test` → PASS.
- [ ] **Step 3:** Tela portando P\GestorMotoristas.dc.html conforme spec §7 "Motoristas": colunas, Situação com `situacaoMotorista(m, hojeISO())`, estado vazio "Nenhum motorista cadastrado." com botão "Cadastrar motorista". `ModalMotorista({ aberto, motorista?, onSalvo, onFechar })` serve para novo e edição; CPF com máscara ao digitar e enviado só com dígitos; Alert info sobre categoria (D/E dirigem van e ônibus) e, **no cadastro**, o Alert info do spec sobre o motorista não ganhar login. Inativar com `ModalConfirmar` danger. Inativos ficam na lista com Badge "Inativo" e sem ações.
- [ ] **Step 4: Verificar com o backend (gestor@).**
  - Lista: Diego "CNH em dia", Elias "Vence em 20 dias", Fábio "CNH vencida".
  - Novo com CPF 111.111.111-11 → erro do front; CPF 529.982.247-25 → "Conflito (409)" de CPF; CPF 390.533.447-05 e registro 12345678901 → aparece na lista; o Alert de "sem login" estava no modal.
  - Editar Elias para categoria D → salva e a tabela mostra D.
  - Inativar o novo motorista → Badge Inativo.
- [ ] **Step 5:** Commit `feat: cadastro e edição de motoristas`.

### Task 13: Painel do Gestor

**Files:**
- Create: `src/pages/gestor/Painel.jsx` (+ `.css`)
- Modify: `src/App.jsx`

**Interfaces:**
- Consumes: `listarViagens`, `listarVeiculos`, `listarMotoristas`, `listarCnhVencendo`, `cnhVencida`, `situacaoMotorista`, `hojeISO`, `useCarregar`.

- [ ] **Step 1:** Tela portando P\GestorPainel.dc.html conforme spec §7 "Painel": quatro cartões (Aguardando aprovação = `listarViagens({ status: 'SOLICITADA' })`; Viagens hoje = `listarViagens({ inicio: hoje, fim: hoje })`; Veículos disponíveis = `DISPONIVEL` de `listarVeiculos({})` com "N de M ativos"; CNH vencida ou vencendo = vencidas de `listarMotoristas()` + `listarCnhVencendo(30)`). Tabela de pendentes com "Analisar" → `/gestor/viagens/:id`. Bloco CNH: Select 15/30/60/90 dias (padrão 30) para `listarCnhVencendo(dias)` e, à parte, "Já vencidas" com `cnhVencida`. Quatro cartões de veículos por status com link para a lista filtrada (`/gestor/veiculos?status=…`; a lista da Tarefa 10 deve ler `status` da URL — ajustar se ainda não ler). Cada bloco tem seu próprio carregando/erro (uma falha não derruba o painel inteiro).
- [ ] **Step 2: Verificar com o backend (gestor@, dados iniciais).** Aguardando aprovação 3; Veículos disponíveis "4 de 4 ativos"; CNH: Elias em "vence em até 30 dias" e Fábio em "Já vencidas"; Select 15 dias → Elias some da lista de vencendo; "Analisar" na #1 abre o detalhe da #1; cartão "Em manutenção" leva à lista filtrada.
- [ ] **Step 3:** Commit `feat: painel do gestor`.

### Task 14: Fechamento e verificação geral

**Files:**
- Create: `README.md`
- Modify: o que a verificação apontar

- [ ] **Step 1:** README (pode usar a skill `criar-readme`): o que é, pré-requisitos (Node 24, backend rodando), `npm install`, `npm run dev`, `npm test`, usuários de teste, telas por papel, por que existe o proxy, o que ficou fora (perfis, relatório, manutenções gerais, "minhas viagens") e a limitação do motorista sem login.
- [ ] **Step 2: Verificação de ponta a ponta (backend reiniciado).** servidor@ solicita viagem para D+3 → gestor@ aprova com a Spin e Diego → diego@ inicia e conclui com km maior → servidor@ vê Concluída com km rodados; gestor@ vê a Spin Disponível com o km novo.
- [ ] **Step 3: Backend parado** (Review Focus 3): com o app aberto, parar o backend e navegar/enviar formulário → Alert warning "Não foi possível falar com o servidor" com "Tentar de novo", dados digitados mantidos; religar e "Tentar de novo" → funciona.
- [ ] **Step 4:** Em 375px de largura, passar por todas as telas: nada estoura na horizontal; tabelas rolam dentro do card; botões ≥ 44px. `npm run build`, `npm test` e `npm run lint` sem erro.
- [ ] **Step 5:** Commit `docs: README do front-end`.
