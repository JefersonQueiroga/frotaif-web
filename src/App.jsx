import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext.jsx'
import RotaProtegida from './auth/RotaProtegida.jsx'
import { TELA_INICIAL } from './auth/papeis.js'
import Shell from './components/layout/Shell.jsx'
import Componentes from './pages/Componentes.jsx'
import EmConstrucao from './pages/EmConstrucao.jsx'
import Login from './pages/Login.jsx'
import NaoEncontrada from './pages/NaoEncontrada.jsx'

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
            <Route path="/servidor/viagens" element={<EmConstrucao titulo="Viagens" />} />
            <Route path="/servidor/viagens/nova" element={<EmConstrucao titulo="Solicitar viagem" />} />
            <Route path="/servidor/viagens/:id" element={<EmConstrucao titulo="Detalhe da viagem" />} />
          </Route>

          <Route element={<RotaProtegida papel="MOTORISTA" />}>
            <Route path="/motorista/viagens" element={<EmConstrucao titulo="Viagens" />} />
            <Route path="/motorista/viagens/:id" element={<EmConstrucao titulo="Detalhe da viagem" />} />
          </Route>

          <Route element={<RotaProtegida papel="GESTOR" />}>
            <Route path="/gestor" element={<EmConstrucao titulo="Painel" />} />
            <Route path="/gestor/viagens" element={<EmConstrucao titulo="Viagens" />} />
            <Route path="/gestor/viagens/:id" element={<EmConstrucao titulo="Detalhe da viagem" />} />
            <Route path="/gestor/veiculos" element={<EmConstrucao titulo="Veículos" />} />
            <Route path="/gestor/veiculos/novo" element={<EmConstrucao titulo="Novo veículo" />} />
            <Route path="/gestor/veiculos/:id" element={<EmConstrucao titulo="Detalhe do veículo" />} />
            <Route path="/gestor/veiculos/:id/editar" element={<EmConstrucao titulo="Editar veículo" />} />
            <Route path="/gestor/motoristas" element={<EmConstrucao titulo="Motoristas" />} />
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
