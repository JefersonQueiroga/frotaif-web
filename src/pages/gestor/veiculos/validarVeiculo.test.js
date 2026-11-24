import { describe, expect, it } from 'vitest'
import validarVeiculo from './validarVeiculo.js'

const ok = { placa: 'QWE1R23', marca: 'Toyota', modelo: 'Hilux', ano: '2024', tipo: 'CARRO', capacidadePassageiros: '5', quilometragemAtual: '0' }
const op = { novo: true, anoAtual: 2026 }

describe('validarVeiculo', () => {
  it('aceita dados corretos', () => {
    expect(validarVeiculo(ok, op)).toEqual({})
  })

  it('exige a placa no padrão Mercosul', () => {
    expect(validarVeiculo({ ...ok, placa: 'ABC1234' }, op)).toEqual({ placa: 'Use o formato Mercosul: AAA0A00.' })
  })

  it('exige marca e modelo', () => {
    expect(validarVeiculo({ ...ok, marca: '' }, op)).toEqual({ marca: 'Informe a marca.' })
    expect(validarVeiculo({ ...ok, modelo: '' }, op)).toEqual({ modelo: 'Informe o modelo.' })
  })

  it('limita o ano entre 1990 e o ano que vem; o ano é opcional', () => {
    expect(validarVeiculo({ ...ok, ano: '1989' }, op)).toEqual({ ano: 'Informe um ano entre 1990 e 2027.' })
    expect(validarVeiculo({ ...ok, ano: '2028' }, op)).toEqual({ ano: 'Informe um ano entre 1990 e 2027.' })
    expect(validarVeiculo({ ...ok, ano: '2027' }, op)).toEqual({})
    expect(validarVeiculo({ ...ok, ano: '' }, op)).toEqual({})
  })

  it('exige o tipo', () => {
    expect(validarVeiculo({ ...ok, tipo: '' }, op)).toEqual({ tipo: 'Escolha o tipo.' })
  })

  it('exige capacidade de 1 ou mais, só com dígitos', () => {
    const erro = { capacidadePassageiros: 'Informe a capacidade (1 ou mais).' }
    expect(validarVeiculo({ ...ok, capacidadePassageiros: '0' }, op)).toEqual(erro)
    expect(validarVeiculo({ ...ok, capacidadePassageiros: '' }, op)).toEqual(erro)
    expect(validarVeiculo({ ...ok, capacidadePassageiros: '2,5' }, op)).toEqual(erro)
  })

  it('exige quilometragem de 0 ou mais, só no cadastro', () => {
    expect(validarVeiculo({ ...ok, quilometragemAtual: '-1' }, op)).toEqual({ quilometragemAtual: 'Informe a quilometragem (0 ou mais).' })
    expect(validarVeiculo({ ...ok, quilometragemAtual: '' }, op)).toEqual({ quilometragemAtual: 'Informe a quilometragem (0 ou mais).' })
    expect(validarVeiculo({ ...ok, quilometragemAtual: '' }, { novo: false, anoAtual: 2026 })).toEqual({})
  })
})
