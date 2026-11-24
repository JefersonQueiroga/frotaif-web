// Único ponto da aplicação que chama fetch. Todas as telas passam por aqui, então token,
// JSON e tratamento de erro ficam em um lugar só.
import { obterToken } from '../auth/token'

// Erro com o status HTTP e uma mensagem já pronta para mostrar ao usuário.
export class ApiError extends Error {
  constructor(status, mensagem) {
    super(mensagem)
    this.name = 'ApiError'
    this.status = status
    this.mensagem = mensagem
  }
}

// Quando o backend não explica o erro (corpo vazio ou HTML do proxy), usamos estas mensagens.
function mensagemPadrao(status) {
  if (status === 0) return 'Sem conexão com o servidor.'
  if (status === 401) return 'Sua sessão expirou. Entre de novo.'
  if (status === 403) return 'Você não pode fazer esta ação.'
  if (status === 404) return 'Recurso não encontrado.'
  if (status >= 500) return 'Erro no servidor.'
  return `Erro inesperado (status ${status}).`
}

// Um único tratador de 401, registrado pelo contexto de autenticação (limpa a sessão e volta ao login).
// Uma nova chamada substitui a anterior.
let aoNaoAutorizado = null

export function definirAoNaoAutorizado(fn) {
  aoNaoAutorizado = fn
}

// Monta "?a=1&b=2" ignorando valores vazios, para os filtros opcionais das listas.
export function montarQuery(params = {}) {
  const busca = new URLSearchParams()
  for (const [chave, valor] of Object.entries(params)) {
    if (valor !== '' && valor !== null && valor !== undefined) busca.append(chave, valor)
  }
  const texto = busca.toString()
  return texto ? `?${texto}` : ''
}

// Lê o corpo como texto e só faz JSON.parse se o servidor disse que é JSON.
// Assim um 502 em HTML (backend fora do ar atrás do proxy) não estoura um SyntaxError.
async function lerCorpo(resposta) {
  const texto = await resposta.text()
  const tipo = resposta.headers.get('content-type') || ''
  if (!texto || !tipo.includes('json')) return null
  try {
    return JSON.parse(texto)
  } catch {
    return null
  }
}

export async function api(caminho, { method = 'GET', body, publico = false } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = obterToken()
  if (!publico && token) headers.Authorization = `Bearer ${token}`

  let resposta
  try {
    resposta = await fetch(`/api${caminho}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    // fetch só rejeita quando não chegou ao servidor (rede caída, backend parado).
    throw new ApiError(0, mensagemPadrao(0))
  }

  const dados = await lerCorpo(resposta)

  if (!resposta.ok) {
    // Spring devolve { message } e, em ProblemDetail, { detail }; detail vence por ser mais específico.
    const mensagem = dados?.detail || dados?.message || mensagemPadrao(resposta.status)
    const erro = new ApiError(resposta.status, mensagem)
    // 401 em rota pública (login com senha errada) é só erro de formulário, não sessão expirada.
    if (resposta.status === 401 && !publico && aoNaoAutorizado) aoNaoAutorizado()
    throw erro
  }

  // 204 (DELETE, por exemplo) não tem corpo.
  return resposta.status === 204 ? null : dados
}
