// Uma função por endpoint de /api/viagens; as telas nunca montam URL na mão.
import { api, montarQuery } from './cliente'

export const listarViagens = ({ status, inicio, fim } = {}) => api(`/viagens${montarQuery({ status, inicio, fim })}`)
export const buscarViagem = (id) => api(`/viagens/${id}`)
export const solicitarViagem = (dados) => api('/viagens', { method: 'POST', body: dados })
export const aprovarViagem = (id, { veiculoId, motoristaId }) =>
  api(`/viagens/${id}/aprovar`, { method: 'PATCH', body: { veiculoId, motoristaId } })
export const rejeitarViagem = (id, motivo) => api(`/viagens/${id}/rejeitar`, { method: 'PATCH', body: { motivo } })
export const iniciarViagem = (id) => api(`/viagens/${id}/iniciar`, { method: 'PATCH' })
export const concluirViagem = (id, kmFinal) => api(`/viagens/${id}/concluir`, { method: 'PATCH', body: { kmFinal } })
export const cancelarViagem = (id, motivo) => api(`/viagens/${id}/cancelar`, { method: 'PATCH', body: { motivo } })
