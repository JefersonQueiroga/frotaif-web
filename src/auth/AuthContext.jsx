import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api/auth.js'
import { definirAoNaoAutorizado } from '../api/cliente.js'
import { limparToken, lerClaims, obterToken, salvarToken, tokenValido } from './token.js'

const AuthContext = createContext(null)

// Lê o token guardado e devolve o usuário, ou null se não houver token ou ele estiver vencido.
// (Só para montar a tela: quem confere a assinatura de verdade é o backend.)
function usuarioDoToken() {
  const token = obterToken()
  if (!token) return null
  const claims = lerClaims(token)
  if (!tokenValido(claims)) {
    limparToken()
    return null
  }
  return { email: claims.email, nome: claims.nome, papel: claims.papel }
}

// Precisa ficar DENTRO do BrowserRouter, porque usa useNavigate (ao sair).
export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(usuarioDoToken)

  // Por que a sessão acabou: 'expirou' (401) ou 'saiu' (botão "Sair"); null enquanto há sessão.
  // O RotaProtegida usa isto para escolher o endereço do login (com `?expirou=1`, ou limpo).
  const [fim, setFim] = useState(null)

  // O tratador de 401 é registrado uma vez só. Ele NÃO chama navigate: ao limpar o usuário, o
  // RotaProtegida da página atual já redireciona para o login guardando `voltar`. Se o tratador
  // também navegasse, os dois redirecionamentos disputariam e o `expirou=1` podia se perder.
  useEffect(() => {
    definirAoNaoAutorizado(() => {
      limparToken()
      setFim('expirou')
      setUsuario(null)
    })
    return () => definirAoNaoAutorizado(null)
  }, [])

  const entrar = useCallback(async (email, senha) => {
    const { accessToken } = await login(email, senha)
    const claims = lerClaims(accessToken)
    if (!tokenValido(claims)) throw new Error('Token inválido recebido do servidor.')
    salvarToken(accessToken)
    setFim(null)
    setUsuario({ email: claims.email, nome: claims.nome, papel: claims.papel })
  }, [])

  const sair = useCallback(() => {
    limparToken()
    setFim('saiu')
    setUsuario(null)
    // replace: o botão "voltar" do navegador não leva de volta a uma tela protegida.
    navigate('/login', { replace: true })
  }, [navigate])

  const valor = useMemo(() => ({ usuario, fim, entrar, sair }), [usuario, fim, entrar, sair])
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// O hook mora junto do provider de propósito: assim há um arquivo só para entender a autenticação.
// oxlint-disable-next-line react/only-export-components
export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth precisa estar dentro de <AuthProvider>.')
  return contexto
}
