import { describe, expect, it } from 'vitest'
import viagensAfetadasPelaManutencao from './viagensAfetadas.js'

// Mesmo critério do backend: retornoPrevisto > dataInicio 00:00 (o fim já vem filtrado pela API).
const vg = (id, veiculoId, retornoPrevisto) => ({ id, veiculo: veiculoId ? { id: veiculoId } : null, retornoPrevisto })

describe('viagensAfetadasPelaManutencao', () => {
  const lista = [
    vg(1, 1, '2026-11-28T14:00:00'), // do veículo, volta depois do início: afetada
    vg(2, 2, '2026-11-28T14:00:00'), // outro veículo
    vg(3, 1, '2026-11-24T18:00:00'), // volta antes do início
    vg(4, 1, '2026-11-25T00:00:00'), // volta exatamente no início: não afetada (comparação estrita)
    vg(5, 1, '2026-11-25T10:00'), // sem segundos: afetada
    vg(6, null, '2026-11-28T14:00:00'), // sem veículo
  ]

  it('filtra por veículo e por retorno depois do início da manutenção', () => {
    expect(viagensAfetadasPelaManutencao(lista, 1, '2026-11-25').map((v) => v.id)).toEqual([1, 5])
  })
  it('devolve lista vazia quando nada se aplica', () => {
    expect(viagensAfetadasPelaManutencao([], 1, '2026-11-25')).toEqual([])
    expect(viagensAfetadasPelaManutencao(lista, 9, '2026-11-25')).toEqual([])
  })
})
