import { describe, test, expect } from 'vitest'
import {
  infoStatusViagem, infoStatusVeiculo, infoTipoManutencao,
  rotuloTipoVeiculo, situacaoMotorista, cnhVencida, rotuloVencimentoCnh, cnhValeParaViagem,
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

describe('rotuloVencimentoCnh', () => {
  const hoje = '2026-11-23'
  test('sempre mostra os dias, mesmo além de 30', () => {
    expect(rotuloVencimentoCnh('2026-11-23', hoje)).toEqual({ rotulo: 'Vence hoje', tom: 'amber' })
    expect(rotuloVencimentoCnh('2026-11-24', hoje)).toEqual({ rotulo: 'Vence em 1 dia', tom: 'amber' })
    expect(rotuloVencimentoCnh('2026-12-13', hoje)).toEqual({ rotulo: 'Vence em 20 dias', tom: 'amber' })
    expect(rotuloVencimentoCnh('2027-01-22', hoje)).toEqual({ rotulo: 'Vence em 60 dias', tom: 'amber' })
  })
})

describe('cnhValeParaViagem', () => {
  const viagem = { saida: '2026-12-10T07:00:00', retornoPrevisto: '2026-12-11T18:00:00' }
  test('a CNH precisa valer até o dia do retorno (mesma regra do backend)', () => {
    expect(cnhValeParaViagem({ validadeCnh: '2027-01-01' }, viagem)).toBe(true)
    expect(cnhValeParaViagem({ validadeCnh: '2026-12-11' }, viagem)).toBe(true)
    expect(cnhValeParaViagem({ validadeCnh: '2026-12-10' }, viagem)).toBe(false)
    expect(cnhValeParaViagem({ validadeCnh: '2026-10-24' }, viagem)).toBe(false)
  })
})
