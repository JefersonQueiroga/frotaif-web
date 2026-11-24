import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { TELA_INICIAL } from '../auth/papeis.js'
import Pagina from '../components/layout/Pagina.jsx'

// Rota `*`: nenhum caminho da tabela casou.
export default function NaoEncontrada() {
  const { usuario } = useAuth()
  const inicio = usuario ? TELA_INICIAL[usuario.papel] : '/login'
  return (
    <Pagina titulo="Página não encontrada" subtitulo="O endereço não existe ou foi removido.">
      <p>
        <Link to={inicio}>{usuario ? 'Voltar para a tela inicial' : 'Ir para o login'}</Link>
      </p>
    </Pagina>
  )
}
