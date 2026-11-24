import { describe, expect, it } from 'vitest'
import { destinoSeguro } from './papeis.js'

describe('destinoSeguro', () => {
  it('aceita caminhos internos (com query)', () => {
    expect(destinoSeguro('/gestor/veiculos/3')).toBe('/gestor/veiculos/3')
    expect(destinoSeguro('/servidor/viagens?status=APROVADA')).toBe('/servidor/viagens?status=APROVADA')
  })

  it('recusa endereços de outro site', () => {
    expect(destinoSeguro('//site-malicioso.com')).toBeNull()
    expect(destinoSeguro('https://site-malicioso.com')).toBeNull()
    expect(destinoSeguro('/\\site-malicioso.com')).toBeNull()
    expect(destinoSeguro('javascript:alert(1)')).toBeNull()
  })

  it('recusa a própria tela de login (evita laço) e valores vazios', () => {
    expect(destinoSeguro('/login')).toBeNull()
    expect(destinoSeguro('/login?expirou=1')).toBeNull()
    expect(destinoSeguro(null)).toBeNull()
    expect(destinoSeguro(undefined)).toBeNull()
    expect(destinoSeguro('')).toBeNull()
  })
})
