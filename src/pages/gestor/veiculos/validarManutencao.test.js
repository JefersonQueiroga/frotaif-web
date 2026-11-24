import { describe, expect, it } from 'vitest'
import { validarEncerramento, validarManutencao } from './validarManutencao.js'

const mt = { tipo: 'PREVENTIVA', dataInicio: '2026-11-25', dataPrevistaFim: '2026-11-27' }

describe('validarManutencao', () => {
  it('aceita dados completos e previsão no mesmo dia do início', () => {
    expect(validarManutencao(mt)).toEqual({})
    expect(validarManutencao({ ...mt, dataPrevistaFim: '2026-11-25' })).toEqual({})
  })
  it('exige o tipo', () => {
    expect(validarManutencao({ ...mt, tipo: '' })).toEqual({ tipo: 'Escolha o tipo.' })
  })
  it('exige as duas datas', () => {
    expect(validarManutencao({ ...mt, dataInicio: '' })).toEqual({ dataInicio: 'Informe a data de início.' })
    expect(validarManutencao({ ...mt, dataPrevistaFim: '' })).toEqual({ dataPrevistaFim: 'Informe a previsão de fim.' })
  })
  it('recusa previsão antes do início', () => {
    expect(validarManutencao({ ...mt, dataPrevistaFim: '2026-11-24' })).toEqual({
      dataPrevistaFim: 'A previsão não pode ser antes do início.',
    })
  })
})

describe('validarEncerramento', () => {
  it('aceita fim depois do início e custo com vírgula', () => {
    expect(validarEncerramento({ dataFim: '2026-11-26', custo: '850,00' }, '2026-11-25')).toEqual({})
  })
  it('aceita custo 0 e fim no mesmo dia do início', () => {
    expect(validarEncerramento({ dataFim: '2026-11-25', custo: '0' }, '2026-11-25')).toEqual({})
  })
  it('recusa fim antes do início, citando a data', () => {
    expect(validarEncerramento({ dataFim: '2026-11-24', custo: '0' }, '2026-11-25')).toEqual({
      dataFim: 'A data de fim não pode ser antes de 25/11/2026.',
    })
  })
  it('exige a data de fim', () => {
    expect(validarEncerramento({ dataFim: '', custo: '10' }, '2026-11-25')).toEqual({ dataFim: 'Informe a data de fim.' })
  })
  it('recusa custo vazio, negativo ou que não é número', () => {
    const msg = { custo: 'Informe o custo (0 ou mais).' }
    expect(validarEncerramento({ dataFim: '2026-11-26', custo: '' }, '2026-11-25')).toEqual(msg)
    expect(validarEncerramento({ dataFim: '2026-11-26', custo: '-5' }, '2026-11-25')).toEqual(msg)
    expect(validarEncerramento({ dataFim: '2026-11-26', custo: 'xyz' }, '2026-11-25')).toEqual(msg)
  })
})
