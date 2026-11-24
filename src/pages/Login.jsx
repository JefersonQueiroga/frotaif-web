import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { ApiError } from '../api/cliente.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { TELA_INICIAL, destinoSeguro } from '../auth/papeis.js'
import AlertaErro from '../components/AlertaErro.jsx'
import { Alert, Button, Input } from '../components/ds/index.js'
import './Login.css'

export default function Login() {
  const { usuario, entrar } = useAuth()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  // Quem já está logado (ou acabou de entrar) sai daqui: vai para onde estava ou para a tela do seu papel.
  // `voltar` vem da URL, então passa por destinoSeguro (só aceita caminhos internos).
  if (usuario) {
    return <Navigate to={destinoSeguro(params.get('voltar')) ?? TELA_INICIAL[usuario.papel]} replace />
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (enviando) return
    setEnviando(true)
    setErro(null)
    try {
      await entrar(email.trim(), senha)
      // Sem navigate aqui: ao definir `usuario`, o <Navigate> acima faz o redirecionamento.
    } catch (e) {
      setErro(e)
      setEnviando(false)
    }
  }

  // No login, 401 significa "e-mail ou senha errados" (não "sessão expirada"). Texto do protótipo.
  const credenciaisInvalidas = erro instanceof ApiError && erro.status === 401

  return (
    <div className="login">
      <section className="login__painel">
        <div className="login__apresentacao">
          <span className="login__campus">IFRN · Campus Pau dos Ferros</span>
          <h1 className="login__marca">FrotaIF</h1>
          <p className="login__texto">
            Solicitação, aprovação e acompanhamento das viagens com os veículos oficiais do campus.
          </p>
        </div>
      </section>

      <section className="login__lado-form">
        <div className="login__caixa">
          <img className="login__logo" src="/ifrn-logo.png" alt="IFRN" />
          <div className="login__titulos">
            <h2 className="login__titulo">Entrar</h2>
            <p className="login__subtitulo">Use seu e-mail institucional e a senha do FrotaIF.</p>
          </div>

          {params.get('expirou') === '1' && !erro && (
            <Alert tone="warning">Sua sessão expirou. Entre de novo.</Alert>
          )}
          {credenciaisInvalidas && (
            <Alert tone="danger" title="E-mail ou senha inválidos">
              Confira os dados e tente de novo. Contas inativas também não conseguem entrar.
            </Alert>
          )}
          {erro && !credenciaisInvalidas && <AlertaErro erro={erro} />}

          <form className="login__form" onSubmit={enviar}>
            <Input
              id="login-email"
              label="E-mail"
              type="email"
              placeholder="nome@ifrn.edu.br"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="login-senha"
              label="Senha"
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <Button type="submit" size="lg" fullWidth disabled={enviando}>
              {enviando ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  )
}
