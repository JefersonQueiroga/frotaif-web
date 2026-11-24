import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext.jsx'
import RotaProtegida from './auth/RotaProtegida.jsx'
import { TELA_INICIAL } from './auth/papeis.js'
import Shell from './components/layout/Shell.jsx'
import Componentes from './pages/Componentes.jsx'
import Login from './pages/Login.jsx'
import NaoEncontrada from './pages/NaoEncontrada.jsx'
import DetalheViagemMotorista from './pages/motorista/DetalheViagemMotorista.jsx'
import ViagensMotorista from './pages/motorista/ViagensMotorista.jsx'
import DetalheViagemGestor from './pages/gestor/DetalheViagemGestor.jsx'
import ViagensGestor from './pages/gestor/ViagensGestor.jsx'
import Painel from './pages/gestor/Painel.jsx'
import DetalheVeiculo from './pages/gestor/veiculos/DetalheVeiculo.jsx'
import EditarVeiculo from './pages/gestor/veiculos/EditarVeiculo.jsx'
import FormVeiculo from './pages/gestor/veiculos/FormVeiculo.jsx'
import ListaMotoristas from './pages/gestor/motoristas/ListaMotoristas.jsx'
import ListaVeiculos from './pages/gestor/veiculos/ListaVeiculos.jsx'
import DetalheViagemServidor from './pages/servidor/DetalheViagemServidor.jsx'
import SolicitarViagem from './pages/servidor/SolicitarViagem.jsx'
import ViagensServidor from './pages/servidor/ViagensServidor.jsx'

// "/" manda cada papel para a sua tela inicial (RotaProtegida já garante que há usuário).
function Inicio() {
  const { usuario } = useAuth()
  return <Navigate to={TELA_INICIAL[usuario.papel]} replace />
}

// Tabela de rotas (spec §6). Cada tela marcada "Em construção" é trocada por outra tarefa.
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Catálogo de componentes: só existe no `npm run dev`, nunca no build de produção. */}
      {import.meta.env.DEV && <Route path="/componentes" element={<Componentes />} />}

      <Route element={<RotaProtegida />}>
        <Route path="/" element={<Inicio />} />

        <Route element={<Shell />}>
          <Route element={<RotaProtegida papel="SERVIDOR" />}>
            <Route path="/servidor/viagens" element={<ViagensServidor />} />
            <Route path="/servidor/viagens/nova" element={<SolicitarViagem />} />
            <Route path="/servidor/viagens/:id" element={<DetalheViagemServidor />} />
          </Route>

          <Route element={<RotaProtegida papel="MOTORISTA" />}>
            <Route path="/motorista/viagens" element={<ViagensMotorista />} />
            <Route path="/motorista/viagens/:id" element={<DetalheViagemMotorista />} />
          </Route>

          <Route element={<RotaProtegida papel="GESTOR" />}>
            <Route path="/gestor" element={<Painel />} />
            <Route path="/gestor/viagens" element={<ViagensGestor />} />
            <Route path="/gestor/viagens/:id" element={<DetalheViagemGestor />} />
            <Route path="/gestor/veiculos" element={<ListaVeiculos />} />
            <Route path="/gestor/veiculos/novo" element={<FormVeiculo />} />
            <Route path="/gestor/veiculos/:id" element={<DetalheVeiculo />} />
            <Route path="/gestor/veiculos/:id/editar" element={<EditarVeiculo />} />
            <Route path="/gestor/motoristas" element={<ListaMotoristas />} />
          </Route>

          {/* Dentro do Shell para o usuário logado não perder o menu ao errar o endereço. */}
          <Route path="*" element={<NaoEncontrada />} />
        </Route>
      </Route>

      {/* Sem login, qualquer endereço desconhecido cai no login (RotaProtegida acima cuida disso). */}
    </Routes>
  )
}

export default App
