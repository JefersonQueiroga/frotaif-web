// Guarda e lê o token JWT. Fica no localStorage para sobreviver ao F5 (decisão da spec §5).
const CHAVE = 'frotaif.token'

export function salvarToken(token) {
  localStorage.setItem(CHAVE, token)
}

export function obterToken() {
  return localStorage.getItem(CHAVE)
}

export function limparToken() {
  localStorage.removeItem(CHAVE)
}

// Lê os dados do usuário de dentro do token.
// Atenção: ler o token no front serve só para montar a tela (menu, nome, papel).
// A segurança de verdade é do backend, que valida a assinatura em toda requisição.
export function lerClaims(token) {
  try {
    const payload = token.split('.')[1]
    // JWT usa Base64URL ('-' e '_', sem '='); o atob() espera Base64 comum.
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const binario = atob(base64)
    // atob() devolve um caractere por byte; sem decodificar como UTF-8, "Fábio" vira "FÃ¡bio".
    const bytes = Uint8Array.from(binario, (c) => c.charCodeAt(0))
    const dados = JSON.parse(new TextDecoder('utf-8').decode(bytes))
    return { email: dados.sub, nome: dados.nome, papel: dados.papel, exp: dados.exp }
  } catch {
    return null
  }
}

// `exp` do JWT é em segundos (não milissegundos), por isso Date.now() / 1000.
export function tokenValido(claims, agoraSeg = Date.now() / 1000) {
  return Boolean(claims) && claims.exp > agoraSeg
}
