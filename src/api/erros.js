// Transforma um erro qualquer no que a tela precisa para montar um Alert:
// tom (cor), título, mensagem e se vale oferecer "Tentar de novo".
import { ApiError } from './cliente'
import { formatarDatasNoTexto } from '../utils/formatar'

const TITULOS = {
  400: 'Dados inválidos',
  403: 'Sem permissão',
  404: 'Não encontrado',
  409: 'Conflito (409)',
  422: 'Regra de negócio (422)',
}

export function descreverErro(erro) {
  if (!(erro instanceof ApiError)) {
    return { tom: 'danger', titulo: 'Erro inesperado', mensagem: erro?.message || 'Algo deu errado.', podeTentarDeNovo: false }
  }
  // Problema de conexão ou do servidor: repetir pode funcionar. Erro de regra (4xx): repetir dá no mesmo.
  // Rede (status 0) e 5xx têm o mesmo tratamento (spec §5.3): para o usuário, o servidor não respondeu direito.
  if (erro.status === 0 || erro.status >= 500) {
    return { tom: 'warning', titulo: 'Não foi possível falar com o servidor', mensagem: erro.mensagem, podeTentarDeNovo: true }
  }
  return {
    tom: 'danger',
    titulo: TITULOS[erro.status] || `Erro (${erro.status})`,
    // As regras de negócio citam datas no formato da API; mostramos no formato brasileiro.
    mensagem: formatarDatasNoTexto(erro.mensagem),
    podeTentarDeNovo: false,
  }
}
