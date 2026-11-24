import { api, montarQuery } from './cliente'

export const listarMotoristas = () => api('/motoristas')
// Só traz CNH que ainda vai vencer dentro de `dias`; as já vencidas vêm de listarMotoristas().
export const listarCnhVencendo = (dias) => api(`/motoristas/cnh-vencendo${montarQuery({ dias })}`)
export const cadastrarMotorista = (dados) => api('/motoristas', { method: 'POST', body: dados })
export const atualizarMotorista = (id, dados) => api(`/motoristas/${id}`, { method: 'PUT', body: dados })
// DELETE lógico, responde 204.
export const inativarMotorista = (id) => api(`/motoristas/${id}`, { method: 'DELETE' })
