import { ApiError } from '../api/cliente.js'

// Verdadeiro enquanto o detalhe ainda não pode mostrar o recurso (carregando, erro ou 404).
export const recursoIndisponivel = (recurso, erro) => !recurso || (erro instanceof ApiError && erro.status === 404)
