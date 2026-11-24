// Funções puras de formatação. Todas aceitam o que a API devolve (strings ISO, números).

const VAZIO = '—'

const formatadorNumero = new Intl.NumberFormat('pt-BR')
const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const formatadorLitros = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const doisDigitos = (n) => String(n).padStart(2, '0')

// Por que não usar `new Date('2026-11-28')`? Uma data pura (sem hora) é lida como
// meia-noite em UTC; no Brasil (UTC-3) isso vira 27/11 às 21h e a tela mostraria o dia errado.
// Por isso separamos a string na mão e nunca passamos por Date.
export function formatarData(iso) {
  if (!iso) return VAZIO
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

// Aceita '2026-11-28T07:05:00' e '2026-11-28T07:05' (o backend pode mandar sem segundos).
export function formatarDataHora(iso) {
  if (!iso) return VAZIO
  const [data, hora = ''] = iso.split('T')
  return `${formatarData(data)} ${hora.slice(0, 5)}`.trim()
}

export const formatarNumero = (n) => formatadorNumero.format(n)
export const formatarMoeda = (n) => formatadorMoeda.format(n)
export const formatarKm = (n) => `${formatarNumero(n)} km`
export const formatarLitros = (n) => `${formatadorLitros.format(n)} L`

export function formatarCpf(digitos) {
  const d = String(digitos ?? '')
  if (d.length !== 11) return d
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

// Por que não usar `toISOString()`? Ele converte para UTC: às 22h30 em Brasília já seria
// "amanhã". getFullYear/getMonth/getDate usam o relógio local, que é o que o usuário vê.
export function hojeISO(agora = new Date()) {
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`
}

// Diferença em dias entre duas datas 'YYYY-MM-DD' (negativa se `ate` for anterior).
// Date.UTC evita que o horário de verão/fuso some ou tire uma hora do cálculo.
export function diasEntre(deISO, ateISO) {
  const paraUtc = (iso) => {
    const [a, m, d] = iso.slice(0, 10).split('-').map(Number)
    return Date.UTC(a, m - 1, d)
  }
  return Math.round((paraUtc(ateISO) - paraUtc(deISO)) / 86400000)
}

// Quem digita "35,5" espera 35,5. `<input type="number">` não lida bem com vírgula, então
// os campos decimais são texto e esta função converte. Com vírgula, os pontos são milhar.
export function lerDecimal(texto) {
  const limpo = String(texto ?? '').trim()
  if (limpo === '') return null
  const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo
  const numero = Number(normalizado)
  return Number.isFinite(numero) ? numero : null
}
