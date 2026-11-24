import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { TELA_INICIAL } from '../auth/papeis.js'
import Pagina from '../components/layout/Pagina.jsx'

// Rota `*`: nenhum caminho da tabela casou.
export default function NaoEncontrada() {
  const { usuario } = useAuth()
  // A rota `*` fica dentro de RotaProtegida, então sempre há usuário logado aqui.
  return (
    <Pagina titulo="Página não encontrada" subtitulo="O endereço não existe ou foi removido.">
      <p>
        <Link to={TELA_INICIAL[usuario.papel]}>Voltar para a tela inicial</Link>
      </p>
    </Pagina>
  )
}
