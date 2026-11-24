import { describe, test, expect } from 'vitest'
import { placaValida, cpfValido, somenteDigitos } from './validar'

describe('placaValida (padrão Mercosul)', () => {
  test('aceita e rejeita', () => {
    expect(placaValida('RNX1A23')).toBe(true)
    expect(placaValida('ABC1234')).toBe(false)
    expect(placaValida('rnx1a23')).toBe(false)
  })
})

describe('cpfValido', () => {
  test('confere dígitos verificadores', () => {
    expect(cpfValido('52998224725')).toBe(true)
    expect(cpfValido('529.982.247-25')).toBe(true)
    expect(cpfValido('39053344705')).toBe(true)
    expect(cpfValido('52998224724')).toBe(false)
    expect(cpfValido('11111111111')).toBe(false)
    expect(cpfValido('123')).toBe(false)
  })
})

test('somenteDigitos', () => {
  expect(somenteDigitos('529.982.247-25')).toBe('52998224725')
})
