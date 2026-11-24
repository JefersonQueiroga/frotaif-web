import { describe, expect, it } from 'vitest'
import veiculosCompativeis from './veiculosCompativeis'

const v = (id, status, capacidadePassageiros) => ({ id, status, capacidadePassageiros })
const frota = [v(1, 'DISPONIVEL', 4), v(3, 'DISPONIVEL', 15), v(4, 'DISPONIVEL', 44), v(2, 'EM_VIAGEM', 6)]

describe('veiculosCompativeis', () => {
  it('mantém só veículos disponíveis com lugar para todos', () => {
    expect(veiculosCompativeis(frota, 30).map((x) => x.id)).toEqual([4])
  })

  it('aceita capacidade exatamente igual ao número de passageiros', () => {
    expect(veiculosCompativeis(frota, 4).map((x) => x.id)).toEqual([1, 3, 4])
  })

  it('devolve lista vazia quando nenhum comporta', () => {
    expect(veiculosCompativeis(frota, 50)).toEqual([])
  })
})
