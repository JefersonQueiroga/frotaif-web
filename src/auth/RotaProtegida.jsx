import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import { TELA_INICIAL } from './papeis.js'

// Guarda de rota. Sem `papel`, basta estar logado; com `papel`, só esse perfil entra.
// Isto é conveniência de tela: o backend também recusa (403) quem chamar a API sem permissão.
export default function RotaProtegida({ papel }) {
  const { usuario, fim } = useAuth()
  const local = useLocation()

  if (!usuario) {
    // Quem clicou em "Sair" vai para o login limpo (não faz sentido "voltar" para a tela de antes).
    if (fim === 'saiu') return <Navigate to="/login" replace />
    // Guardamos onde a pessoa estava para voltar depois do login.
    const voltar = encodeURIComponent(local.pathname + local.search)
    const aviso = fim === 'expirou' ? 'expirou=1&' : ''
    return <Navigate to={`/login?${aviso}voltar=${voltar}`} replace />
  }
  if (papel && usuario.papel !== papel) {
    return <Navigate to={TELA_INICIAL[usuario.papel] ?? '/login'} replace />
  }
  return <Outlet />
}
