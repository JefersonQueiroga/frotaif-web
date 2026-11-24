import { api, montarQuery } from './cliente'

export const listarVeiculos = ({ status, tipo } = {}) => api(`/veiculos${montarQuery({ status, tipo })}`)
export const buscarVeiculo = (id) => api(`/veiculos/${id}`)
export const cadastrarVeiculo = (dados) => api('/veiculos', { method: 'POST', body: dados })
export const atualizarVeiculo = (id, dados) => api(`/veiculos/${id}`, { method: 'PUT', body: dados })
// "Inativar" é um DELETE lógico no backend (o veículo continua no banco como INATIVO). Responde 204.
export const inativarVeiculo = (id) => api(`/veiculos/${id}`, { method: 'DELETE' })
export const reativarVeiculo = (id) => api(`/veiculos/${id}/reativar`, { method: 'PATCH' })
