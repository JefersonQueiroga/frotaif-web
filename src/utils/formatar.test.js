import { describe, test, expect } from 'vitest'
import {
  formatarData, formatarDataHora, formatarNumero, formatarMoeda, formatarKm,
  formatarLitros, formatarCpf, mascararCpf, hojeISO, diasEntre, lerDecimal, formatarDatasNoTexto,
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

describe('mascararCpf', () => {
  test('aplica a máscara a cada dígito digitado', () => {
    expect(mascararCpf('')).toBe('')
    expect(mascararCpf('390')).toBe('390')
    expect(mascararCpf('3905')).toBe('390.5')
    expect(mascararCpf('3905334')).toBe('390.533.4')
    expect(mascararCpf('3905334470')).toBe('390.533.447-0')
    expect(mascararCpf('39053344705')).toBe('390.533.447-05')
  })
  test('CPF já mascarado continua igual', () => {
    expect(mascararCpf('390.533.447-05')).toBe('390.533.447-05')
  })
  test('ignora dígitos além de 11', () => {
    expect(mascararCpf('3905334470599')).toBe('390.533.447-05')
  })
  test('apagar pontuação no fim não deixa sobras', () => {
    expect(mascararCpf('390.')).toBe('390')
    expect(mascararCpf('390.533.447-')).toBe('390.533.447')
  })
})

describe('formatarDatasNoTexto', () => {
  test('troca datas da API (AAAA-MM-DD) por DD/MM/AAAA dentro de uma frase', () => {
    expect(formatarDatasNoTexto('A CNH de Fábio vence em 2026-12-14, antes do fim da viagem'))
      .toBe('A CNH de Fábio vence em 14/12/2026, antes do fim da viagem')
    expect(formatarDatasNoTexto('de 2026-11-25 até 2026-11-27')).toBe('de 25/11/2026 até 27/11/2026')
  })
  test('deixa o resto do texto como está', () => {
    expect(formatarDatasNoTexto('Já existe veículo com a placa RNX1A23')).toBe('Já existe veículo com a placa RNX1A23')
    expect(formatarDatasNoTexto('')).toBe('')
    expect(formatarDatasNoTexto(undefined)).toBe(undefined)
  })
})
