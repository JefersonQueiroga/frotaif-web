import Componentes from './pages/Componentes.jsx'

function App() {
  // Rota temporária (só em desenvolvimento) para ver o catálogo de componentes.
  // A Tarefa 6 troca isto por uma rota de verdade.
  if (import.meta.env.DEV && window.location.pathname === '/componentes') {
    return <Componentes />
  }
  return <h1>FrotaIF</h1>
}

export default App
