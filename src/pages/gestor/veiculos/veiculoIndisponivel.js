import { ApiError } from '../../../api/cliente.js'

// Verdadeiro enquanto a página ainda não pode mostrar o veículo (carregando, erro ou 404).
export const veiculoIndisponivel = (veiculo, erro) => !veiculo || (erro instanceof ApiError && erro.status === 404)
