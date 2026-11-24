// publico: true = não envia token e um 401 aqui significa "senha errada", não "sessão expirada".
import { api } from './cliente'

export const login = (email, senha) =>
  api('/auth/login', { method: 'POST', body: { email, senha }, publico: true })
