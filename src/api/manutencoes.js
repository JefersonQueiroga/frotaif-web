// Listar e abrir manutenção são aninhados no veículo; encerrar usa o id da própria manutenção.
import { api } from './cliente'

export const listarManutencoes = (veiculoId) => api(`/veiculos/${veiculoId}/manutencoes`)
export const abrirManutencao = (veiculoId, dados) =>
  api(`/veiculos/${veiculoId}/manutencoes`, { method: 'POST', body: dados })
export const encerrarManutencao = (id, { dataFim, custo }) =>
  api(`/manutencoes/${id}/encerrar`, { method: 'PATCH', body: { dataFim, custo } })
