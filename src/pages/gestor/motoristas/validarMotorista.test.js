import { describe, expect, it } from 'vitest'
import { validarMotorista } from './validarMotorista.js'

const ok = { nome: 'Gabriel Lima', cpf: '390.533.447-05', registroCnh: '12345678901', categoriaCnh: 'D', validadeCnh: '2028-01-10' }

describe('validarMotorista', () => {
  it('aceita dados corretos', () => {
    expect(validarMotorista(ok)).toEqual({})
  })
  it('exige o nome', () => {
    expect(validarMotorista({ ...ok, nome: '' })).toEqual({ nome: 'Informe o nome.' })
    expect(validarMotorista({ ...ok, nome: '   ' })).toEqual({ nome: 'Informe o nome.' })
  })
  it('recusa CPF inválido', () => {
    expect(validarMotorista({ ...ok, cpf: '111.111.111-11' })).toEqual({ cpf: 'CPF inválido.' })
  })
  it('exige 11 dígitos no registro da CNH', () => {
    expect(validarMotorista({ ...ok, registroCnh: '123' })).toEqual({ registroCnh: 'O registro da CNH tem 11 dígitos.' })
  })
  it('exige categoria e validade', () => {
    expect(validarMotorista({ ...ok, categoriaCnh: '' })).toEqual({ categoriaCnh: 'Escolha a categoria.' })
    expect(validarMotorista({ ...ok, validadeCnh: '' })).toEqual({ validadeCnh: 'Informe a validade.' })
  })
})
