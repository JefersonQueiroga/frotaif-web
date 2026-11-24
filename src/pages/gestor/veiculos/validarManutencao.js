import { formatarData, lerDecimal } from '../../../utils/formatar.js'

// Validação do modal "Abrir manutenção". Datas 'AAAA-MM-DD' comparam-se como texto sem erro de fuso.
export function validarManutencao({ tipo, dataInicio, dataPrevistaFim }) {
  const erros = {}
  if (!tipo) erros.tipo = 'Escolha o tipo.'
  if (!dataInicio) erros.dataInicio = 'Informe a data de início.'
  if (!dataPrevistaFim) erros.dataPrevistaFim = 'Informe a previsão de fim.'
  else if (dataInicio && dataPrevistaFim < dataInicio) erros.dataPrevistaFim = 'A previsão não pode ser antes do início.'
  return erros
}

// Validação do modal "Encerrar manutenção": o fim não pode ser antes do início e o custo é obrigatório (0 vale).
export function validarEncerramento({ dataFim, custo }, dataInicio) {
  const erros = {}
  if (!dataFim) erros.dataFim = 'Informe a data de fim.'
  else if (dataFim < dataInicio) erros.dataFim = `A data de fim não pode ser antes de ${formatarData(dataInicio)}.`
  const c = lerDecimal(custo)
  if (c === null || c < 0) erros.custo = 'Informe o custo (0 ou mais).'
  return erros
}
