import { ApiError } from '../../api/cliente.js'

// Verdadeiro enquanto a página de detalhe ainda não pode mostrar a viagem (carregando, erro ou 404).
export const viagemIndisponivel = (viagem, erro) => !viagem || (erro instanceof ApiError && erro.status === 404)
