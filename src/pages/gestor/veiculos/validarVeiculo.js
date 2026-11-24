import { placaValida } from '../../../utils/validar.js'

const ANO_MINIMO = 1990

// Inteiro sem sinal nem vírgula: "2,5" ou "-1" não valem como quantidade ou ano.
const soDigitos = (texto) => /^\d+$/.test(String(texto ?? '').trim())

// Validação do formulário de veículo (função pura, testada em validarVeiculo.test.js).
// Devolve { campo: mensagem } só com os campos inválidos; objeto vazio = tudo certo.
// `novo`: a quilometragem só é pedida no cadastro (o backend ignora o campo na edição).
// `anoAtual` vem da tela (new Date().getFullYear()) para a função continuar pura e testável.
export default function validarVeiculo(dados, { novo, anoAtual }) {
  const erros = {}

  if (!placaValida(dados.placa)) erros.placa = 'Use o formato Mercosul: AAA0A00.'
  if (!dados.marca?.trim()) erros.marca = 'Informe a marca.'
  if (!dados.modelo?.trim()) erros.modelo = 'Informe o modelo.'

  // O ano é opcional, mas se vier precisa ser plausível (o modelo do ano seguinte já pode estar à venda).
  const ano = String(dados.ano ?? '').trim()
  const anoMaximo = anoAtual + 1
  if (ano !== '' && (!soDigitos(ano) || Number(ano) < ANO_MINIMO || Number(ano) > anoMaximo)) {
    erros.ano = `Informe um ano entre ${ANO_MINIMO} e ${anoMaximo}.`
  }

  if (!dados.tipo) erros.tipo = 'Escolha o tipo.'

  if (!soDigitos(dados.capacidadePassageiros) || Number(dados.capacidadePassageiros) < 1) {
    erros.capacidadePassageiros = 'Informe a capacidade (1 ou mais).'
  }

  if (novo && !soDigitos(dados.quilometragemAtual)) {
    erros.quilometragemAtual = 'Informe a quilometragem (0 ou mais).'
  }

  return erros
}
