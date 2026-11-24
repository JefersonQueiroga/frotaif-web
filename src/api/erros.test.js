import { describe, expect, test } from 'vitest'
import { ApiError } from './cliente'
import { descreverErro } from './erros'

describe('descreverErro', () => {
  test('409 é conflito', () => {
    expect(descreverErro(new ApiError(409, 'X'))).toEqual({ tom: 'danger', titulo: 'Conflito (409)', mensagem: 'X', podeTentarDeNovo: false })
  })
  test('títulos por status', () => {
    expect(descreverErro(new ApiError(422, 'Y')).titulo).toBe('Regra de negócio (422)')
    expect(descreverErro(new ApiError(400, 'Z')).titulo).toBe('Dados inválidos')
    expect(descreverErro(new ApiError(403, 'W')).titulo).toBe('Sem permissão')
    expect(descreverErro(new ApiError(404, 'V')).titulo).toBe('Não encontrado')
  })
  test('sem conexão é warning e pode tentar de novo', () => {
    expect(descreverErro(new ApiError(0, 'Sem conexão com o servidor.')))
      .toEqual({ tom: 'warning', titulo: 'Não foi possível falar com o servidor', mensagem: 'Sem conexão com o servidor.', podeTentarDeNovo: true })
  })
  test('500 e 502 são warning, com o mesmo título da rede, e podem tentar de novo', () => {
    for (const status of [500, 502]) {
      expect(descreverErro(new ApiError(status, 'Erro no servidor.')))
        .toEqual({ tom: 'warning', titulo: 'Não foi possível falar com o servidor', mensagem: 'Erro no servidor.', podeTentarDeNovo: true })
    }
  })
  test('erro comum vira inesperado', () => {
    expect(descreverErro(new Error('boom'))).toEqual({ tom: 'danger', titulo: 'Erro inesperado', mensagem: 'boom', podeTentarDeNovo: false })
  })
})
