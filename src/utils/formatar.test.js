import { describe, test, expect } from 'vitest'
import {
  formatarData, formatarDataHora, formatarNumero, formatarMoeda, formatarKm,
  formatarLitros, formatarCpf, hojeISO, diasEntre, lerDecimal,
} from './formatar'

describe('datas', () => {
  test('formatarData não sofre com fuso horário', () => {
    expect(formatarData('2026-11-28')).toBe('28/11/2026')
    expect(formatarData(null)).toBe('—')
    expect(formatarData('')).toBe('—')
  })
  test('formatarDataHora aceita com ou sem segundos', () => {
    expect(formatarDataHora('2026-11-28T07:05:00')).toBe('28/11/2026 07:05')
    expect(formatarDataHora('2026-11-28T07:05')).toBe('28/11/2026 07:05')
    expect(formatarDataHora(null)).toBe('—')
  })
  test('hojeISO usa a data local, não UTC', () => {
    expect(hojeISO(new Date(2026, 10, 23, 22, 30))).toBe('2026-11-23')
  })
  test('diasEntre', () => {
    expect(diasEntre('2026-11-23', '2026-12-13')).toBe(20)
    expect(diasEntre('2026-11-23', '2026-10-24')).toBe(-30)
    expect(diasEntre('2026-11-23', '2026-11-23')).toBe(0)
  })
})

describe('números', () => {
  test('formatação pt-BR', () => {
    expect(formatarNumero(102350)).toBe('102.350')
    expect(formatarMoeda(248)).toBe('R$\u00a0248,00')
    expect(formatarKm(35210)).toBe('35.210 km')
    expect(formatarLitros(35.5)).toBe('35,50 L')
    expect(formatarCpf('52998224725')).toBe('529.982.247-25')
  })
  test('lerDecimal aceita vírgula e ponto', () => {
    expect(lerDecimal('35,5')).toBe(35.5)
    expect(lerDecimal('1.234,56')).toBe(1234.56)
    expect(lerDecimal('35.5')).toBe(35.5)
    expect(lerDecimal('')).toBeNull()
    expect(lerDecimal('abc')).toBeNull()
  })
})
