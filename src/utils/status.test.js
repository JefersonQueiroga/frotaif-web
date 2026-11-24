import { describe, test, expect } from 'vitest'
import {
  infoStatusViagem, infoStatusVeiculo, infoTipoManutencao,
  rotuloTipoVeiculo, situacaoMotorista, cnhVencida,
} from './status'

describe('rótulos e tons', () => {
  test('viagem', () => {
    expect(infoStatusViagem('EM_ANDAMENTO')).toEqual({ rotulo: 'Em andamento', tom: 'solid' })
    expect(infoStatusViagem('SOLICITADA')).toEqual({ rotulo: 'Solicitada', tom: 'amber' })
    expect(infoStatusViagem('XYZ')).toEqual({ rotulo: 'XYZ', tom: 'neutral' })
  })
  test('veículo, manutenção e tipo', () => {
    expect(infoStatusVeiculo('EM_MANUTENCAO')).toEqual({ rotulo: 'Em manutenção', tom: 'amber' })
    expect(infoTipoManutencao('PREVENTIVA')).toEqual({ rotulo: 'Preventiva', tom: 'blue' })
    expect(rotuloTipoVeiculo('ONIBUS')).toBe('Ônibus')
  })
})

describe('situação do motorista', () => {
  const m = (validadeCnh, ativo = true) => ({ validadeCnh, ativo })
  const hoje = '2026-11-23'
  test('casos', () => {
    expect(situacaoMotorista(m('2026-12-13', false), hoje)).toEqual({ rotulo: 'Inativo', tom: 'neutral' })
    expect(situacaoMotorista(m('2026-10-24'), hoje)).toEqual({ rotulo: 'CNH vencida', tom: 'red' })
    expect(situacaoMotorista(m('2026-11-23'), hoje)).toEqual({ rotulo: 'Vence hoje', tom: 'amber' })
    expect(situacaoMotorista(m('2026-11-24'), hoje)).toEqual({ rotulo: 'Vence em 1 dia', tom: 'amber' })
    expect(situacaoMotorista(m('2026-12-13'), hoje)).toEqual({ rotulo: 'Vence em 20 dias', tom: 'amber' })
    expect(situacaoMotorista(m('2027-07-16'), hoje)).toEqual({ rotulo: 'CNH em dia', tom: 'green' })
  })
  test('cnhVencida ignora inativos', () => {
    expect(cnhVencida(m('2026-10-24'), hoje)).toBe(true)
    expect(cnhVencida(m('2026-10-24', false), hoje)).toBe(false)
  })
})
