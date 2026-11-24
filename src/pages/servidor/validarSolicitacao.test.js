import { describe, expect, it } from 'vitest'
import validarSolicitacao from './validarSolicitacao'

const ok = {
  destino: 'Natal',
  finalidade: 'Reunião',
  saida: '2026-12-01T07:00',
  retornoPrevisto: '2026-12-01T19:00',
  qtdPassageiros: '3',
}

describe('validarSolicitacao', () => {
  it('aceita um pedido completo', () => {
    expect(validarSolicitacao(ok)).toEqual({})
  })

  it('exige destino (espaços não contam)', () => {
    expect(validarSolicitacao({ ...ok, destino: ' ' })).toEqual({ destino: 'Informe o destino.' })
  })

  it('exige finalidade', () => {
    expect(validarSolicitacao({ ...ok, finalidade: '' })).toEqual({ finalidade: 'Informe a finalidade.' })
  })

  it('exige saída e retorno', () => {
    expect(validarSolicitacao({ ...ok, saida: '' })).toEqual({ saida: 'Informe a data e a hora de saída.' })
    expect(validarSolicitacao({ ...ok, retornoPrevisto: '' })).toEqual({
      retornoPrevisto: 'Informe o retorno previsto.',
    })
  })

  it('exige retorno depois da saída', () => {
    expect(validarSolicitacao({ ...ok, retornoPrevisto: '2026-12-01T07:00' })).toEqual({
      retornoPrevisto: 'O retorno precisa ser depois da saída.',
    })
  })

  it('exige número inteiro de passageiros maior que zero', () => {
    const erro = { qtdPassageiros: 'Informe pelo menos 1 passageiro.' }
    expect(validarSolicitacao({ ...ok, qtdPassageiros: '0' })).toEqual(erro)
    expect(validarSolicitacao({ ...ok, qtdPassageiros: '2,5' })).toEqual(erro)
    expect(validarSolicitacao({ ...ok, qtdPassageiros: '' })).toEqual(erro)
  })

  it('reporta todos os erros de uma vez', () => {
    const vazio = { destino: '', finalidade: '', saida: '', retornoPrevisto: '', qtdPassageiros: '' }
    expect(Object.keys(validarSolicitacao(vazio))).toHaveLength(5)
  })
})
