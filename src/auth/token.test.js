import { beforeEach, describe, expect, test } from 'vitest'
import { salvarToken, obterToken, limparToken, lerClaims, tokenValido } from './token'

// O token tem nome com acento: o payload é UTF-8 em Base64URL.
const b64url = (obj) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj))))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const criarToken = (p) => `cab.${b64url(p)}.ass`

beforeEach(() => localStorage.clear())

describe('armazenamento do token', () => {
  test('salva, lê e limpa', () => {
    expect(obterToken()).toBeNull()
    salvarToken('abc')
    expect(obterToken()).toBe('abc')
    expect(localStorage.getItem('frotaif.token')).toBe('abc')
    limparToken()
    expect(obterToken()).toBeNull()
  })
})

describe('lerClaims', () => {
  test('decodifica o payload com acento', () => {
    const token = criarToken({ sub: 'fabio@terceirizada.com', nome: 'Fábio Motorista', papel: 'MOTORISTA', exp: 2000000000 })
    expect(lerClaims(token)).toEqual({ email: 'fabio@terceirizada.com', nome: 'Fábio Motorista', papel: 'MOTORISTA', exp: 2000000000 })
  })
  test('lixo vira null', () => {
    expect(lerClaims('lixo')).toBeNull()
    expect(lerClaims(null)).toBeNull()
  })
})

describe('tokenValido', () => {
  test('compara exp com o instante atual', () => {
    expect(tokenValido({ exp: 1000 }, 999)).toBe(true)
    expect(tokenValido({ exp: 1000 }, 1000)).toBe(false)
    expect(tokenValido(null)).toBe(false)
  })
})
