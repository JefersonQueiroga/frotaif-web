// Abastecimentos pertencem a um veículo, por isso os caminhos são aninhados.
import { api } from './cliente'

export const listarAbastecimentos = (veiculoId) => api(`/veiculos/${veiculoId}/abastecimentos`)
export const registrarAbastecimento = (veiculoId, dados) =>
  api(`/veiculos/${veiculoId}/abastecimentos`, { method: 'POST', body: dados })
