import { describe, expect, it } from 'vitest'
import validarKmFinal from './validarKmFinal.js'

describe('validarKmFinal', () => {
  it('aceita um km final maior que o inicial', () => {
    expect(validarKmFinal('35400', 35210)).toBeNull()
  })

  it('exige o preenchimento', () => {
    expect(validarKmFinal('', 35210)).toBe('Informe o km final.')
    expect(validarKmFinal('   ', 35210)).toBe('Informe o km final.')
  })

  it('recusa km igual ou menor que o inicial', () => {
    expect(validarKmFinal('35210', 35210)).toBe('O km final precisa ser maior que 35.210.')
    expect(validarKmFinal('35000', 35210)).toBe('O km final precisa ser maior que 35.210.')
  })

  it('recusa números que não são inteiros', () => {
    expect(validarKmFinal('35400,5', 35210)).toBe('Use um número inteiro de km.')
    expect(validarKmFinal('35400.5', 35210)).toBe('Use um número inteiro de km.')
    expect(validarKmFinal('abc', 35210)).toBe('Use um número inteiro de km.')
  })
})
