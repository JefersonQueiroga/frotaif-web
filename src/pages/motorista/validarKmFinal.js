import { formatarNumero } from '../../utils/formatar.js'

// Valida o km final digitado antes de chamar a API (que também recusa com 422, mas aqui o
// motorista corrige na hora). Devolve a mensagem de erro ou null quando está tudo certo.
// O campo é texto: só dígitos valem, então "35400,5" e "abc" caem na mesma mensagem.
export default function validarKmFinal(texto, kmInicial) {
  const limpo = String(texto ?? '').trim()
  if (limpo === '') return 'Informe o km final.'
  if (!/^\d+$/.test(limpo)) return 'Use um número inteiro de km.'
  if (Number(limpo) <= kmInicial) return `O km final precisa ser maior que ${formatarNumero(kmInicial)}.`
  return null
}
