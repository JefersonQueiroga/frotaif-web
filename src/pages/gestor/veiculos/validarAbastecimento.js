import { lerDecimal } from '../../../utils/formatar.js'

// Validação do formulário de abastecimento (função pura, testada em validarAbastecimento.test.js).
// Devolve { campo: mensagem } só com os campos inválidos; objeto vazio = tudo certo.
// `hoje` ('AAAA-MM-DD') vem da tela para a função continuar pura. Datas ISO podem ser comparadas como texto.
export default function validarAbastecimento({ data, litros, valorTotal, kmNoAbastecimento }, hoje) {
  const erros = {}

  if (!data) erros.data = 'Informe a data.'
  else if (data > hoje) erros.data = 'A data não pode ser futura.'

  const l = lerDecimal(litros)
  if (l === null || l <= 0) erros.litros = 'Informe os litros (maior que zero).'

  const v = lerDecimal(valorTotal)
  if (v === null || v <= 0) erros.valorTotal = 'Informe o valor (maior que zero).'

  // O km é inteiro: "35,5" ou "-1" não valem.
  if (!/^\d+$/.test(String(kmNoAbastecimento ?? '').trim())) erros.kmNoAbastecimento = 'Informe o km do veículo.'

  return erros
}
