import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { api, ApiError, definirAoNaoAutorizado, montarQuery } from './cliente'
import { salvarToken } from '../auth/token'

// Resposta simulada do fetch: corpo em texto + Content-Type, como o navegador entrega.
function resposta(status, corpo = '', tipo = 'application/json') {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (nome) => (nome.toLowerCase() === 'content-type' ? tipo : null) },
    text: () => Promise.resolve(typeof corpo === 'string' ? corpo : JSON.stringify(corpo)),
  }
}

const simular = (r) => vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(r)))

beforeEach(() => {
  localStorage.clear()
  definirAoNaoAutorizado(null)
})
afterEach(() => vi.unstubAllGlobals())

describe('api', () => {
  test('envia o token e o corpo JSON', async () => {
    simular(resposta(200, { ok: true }))
    salvarToken('abc')
    await api('/viagens', { method: 'POST', body: { a: 1 } })
    const [url, opcoes] = fetch.mock.calls[0]
    expect(url).toBe('/api/viagens')
    expect(opcoes.method).toBe('POST')
    expect(opcoes.headers.Authorization).toBe('Bearer abc')
    expect(opcoes.headers['Content-Type']).toBe('application/json')
    expect(opcoes.body).toBe('{"a":1}')
  })

  test('sem corpo não manda Content-Type nem body', async () => {
    simular(resposta(200, []))
    await api('/viagens')
    const [, opcoes] = fetch.mock.calls[0]
    expect(opcoes.method).toBe('GET')
    expect(opcoes.body).toBeUndefined()
    expect(opcoes.headers['Content-Type']).toBeUndefined()
    expect(opcoes.headers.Authorization).toBeUndefined()
  })

  test('204 devolve null', async () => {
    simular(resposta(204, '', ''))
    expect(await api('/veiculos/1', { method: 'DELETE' })).toBeNull()
  })

  test('200 devolve o JSON', async () => {
    simular(resposta(200, [{ id: 1 }]))
    expect(await api('/viagens')).toEqual([{ id: 1 }])
  })

  test('erro com message vira ApiError', async () => {
    simular(resposta(409, { message: 'Já existe veículo com a placa RNX1A23' }))
    const erro = await api('/veiculos', { method: 'POST', body: {} }).catch((e) => e)
    expect(erro).toBeInstanceOf(ApiError)
    expect(erro.status).toBe(409)
    expect(erro.mensagem).toBe('Já existe veículo com a placa RNX1A23')
  })

  test('detail tem prioridade sobre message', async () => {
    simular(resposta(422, { detail: 'x', message: 'y' }))
    const erro = await api('/x').catch((e) => e)
    expect(erro.mensagem).toBe('x')
  })

  test('403 sem corpo usa a mensagem padrão', async () => {
    simular(resposta(403, '', ''))
    const erro = await api('/x').catch((e) => e)
    expect(erro.status).toBe(403)
    expect(erro.mensagem).toBe('Você não pode fazer esta ação.')
  })

  test('502 com HTML não quebra', async () => {
    simular(resposta(502, '<html><body>Bad Gateway</body></html>', 'text/html'))
    const erro = await api('/x').catch((e) => e)
    expect(erro).toBeInstanceOf(ApiError)
    expect(erro.status).toBe(502)
    expect(erro.mensagem).toBe('Erro no servidor.')
  })

  test('JSON malformado com Content-Type JSON não quebra', async () => {
    simular(resposta(500, '{quebrado', 'application/json'))
    const erro = await api('/x').catch((e) => e)
    expect(erro.status).toBe(500)
    expect(erro.mensagem).toBe('Erro no servidor.')
  })

  test('falha de rede vira status 0', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))))
    const erro = await api('/x').catch((e) => e)
    expect(erro).toBeInstanceOf(ApiError)
    expect(erro.status).toBe(0)
    expect(erro.mensagem).toBe('Sem conexão com o servidor.')
  })

  test('401 chama o tratador uma vez', async () => {
    simular(resposta(401, '', ''))
    const tratador = vi.fn()
    definirAoNaoAutorizado(tratador)
    const erro = await api('/viagens').catch((e) => e)
    expect(tratador).toHaveBeenCalledTimes(1)
    expect(erro.status).toBe(401)
    expect(erro.mensagem).toBe('Sua sessão expirou. Entre de novo.')
  })

  test('401 do login não chama o tratador', async () => {
    simular(resposta(401, { message: 'E-mail ou senha inválidos' }))
    const tratador = vi.fn()
    definirAoNaoAutorizado(tratador)
    const erro = await api('/auth/login', { method: 'POST', body: {}, publico: true }).catch((e) => e)
    expect(tratador).not.toHaveBeenCalled()
    expect(erro.mensagem).toBe('E-mail ou senha inválidos')
  })

  test('chamada pública não envia o token', async () => {
    simular(resposta(200, {}))
    salvarToken('abc')
    await api('/auth/login', { method: 'POST', body: {}, publico: true })
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })
})

describe('montarQuery', () => {
  test('ignora vazios, nulos e indefinidos', () => {
    expect(montarQuery({ status: 'SOLICITADA', inicio: '', fim: null, tipo: undefined })).toBe('?status=SOLICITADA')
  })
  test('sem parâmetros devolve string vazia', () => {
    expect(montarQuery({})).toBe('')
    expect(montarQuery()).toBe('')
  })
  test('codifica valores', () => {
    expect(montarQuery({ q: 'a b' })).toBe('?q=a+b')
  })
})
