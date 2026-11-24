import { describe, expect, it } from 'vitest'
import validarAbastecimento from './validarAbastecimento.js'

const a = { data: '2026-11-20', litros: '35,5', valorTotal: '223,65', kmNoAbastecimento: '35300' }
const hoje = '2026-11-23'

describe('validarAbastecimento', () => {
  it('aceita um abastecimento completo, com vírgula decimal', () => {
    expect(validarAbastecimento(a, hoje)).toEqual({})
  })
  it('aceita a data de hoje', () => {
    expect(validarAbastecimento({ ...a, data: hoje }, hoje)).toEqual({})
  })
  it('recusa data futura ou vazia', () => {
    expect(validarAbastecimento({ ...a, data: '2026-11-24' }, hoje)).toEqual({ data: 'A data não pode ser futura.' })
    expect(validarAbastecimento({ ...a, data: '' }, hoje)).toEqual({ data: 'Informe a data.' })
  })
  it('recusa litros zero, negativos ou vazios', () => {
    const msg = { litros: 'Informe os litros (maior que zero).' }
    expect(validarAbastecimento({ ...a, litros: '0' }, hoje)).toEqual(msg)
    expect(validarAbastecimento({ ...a, litros: '-3' }, hoje)).toEqual(msg)
    expect(validarAbastecimento({ ...a, litros: '' }, hoje)).toEqual(msg)
  })
  it('recusa valor que não é número', () => {
    expect(validarAbastecimento({ ...a, valorTotal: 'abc' }, hoje)).toEqual({
      valorTotal: 'Informe o valor (maior que zero).',
    })
  })
  it('recusa km vazio, com vírgula ou negativo', () => {
    const msg = { kmNoAbastecimento: 'Informe o km do veículo.' }
    expect(validarAbastecimento({ ...a, kmNoAbastecimento: '' }, hoje)).toEqual(msg)
    expect(validarAbastecimento({ ...a, kmNoAbastecimento: '35,5' }, hoje)).toEqual(msg)
    expect(validarAbastecimento({ ...a, kmNoAbastecimento: '-1' }, hoje)).toEqual(msg)
  })
  it('aceita km 0', () => {
    expect(validarAbastecimento({ ...a, kmNoAbastecimento: '0' }, hoje)).toEqual({})
  })
})
