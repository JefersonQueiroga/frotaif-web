import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext.jsx'
import { MENU, ROTULO_PAPEL } from '../../auth/papeis.js'
import Button from '../ds/Button.jsx'
import './Shell.css'

// "Fábio Motorista" -> "FM": primeira letra do primeiro e do último nome.
function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  const primeira = partes[0][0]
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (primeira + ultima).toUpperCase()
}

// Layout de todas as telas logadas: cabeçalho branco, barra verde com o menu do papel e o conteúdo.
export default function Shell() {
  const { usuario, sair } = useAuth()
  const { pathname } = useLocation()
  const itens = MENU[usuario.papel] ?? []

  // Um item está ativo na própria rota e nas rotas filhas (ex.: /gestor/veiculos/3 mantém "Veículos"
  // ativo), exceto quando outro item do menu casa melhor (ex.: "Solicitar viagem" vs "Viagens").
  const casa = (para) => pathname === para || pathname.startsWith(`${para}/`)
  const ativo = itens.filter((i) => casa(i.para)).sort((a, b) => b.para.length - a.para.length)[0]

  return (
    <div className="shell">
      <header className="shell__cabecalho">
        <div className="shell__topo">
          <img className="shell__logo" src="/ifrn-logo.png" alt="IFRN" />
          <span className="shell__divisor" aria-hidden="true" />
          <div className="shell__marca">
            <strong className="shell__nome-app">FrotaIF</strong>
            <span className="shell__campus">Frota do Campus Pau dos Ferros</span>
          </div>
          <div className="shell__espaco" />
          <div className="shell__usuario">
            <span className="shell__avatar" aria-hidden="true">
              {iniciais(usuario.nome)}
            </span>
            <span className="shell__identidade">
              <span className="shell__nome-usuario">{usuario.nome}</span>
              <span className="shell__papel">{ROTULO_PAPEL[usuario.papel] ?? usuario.papel}</span>
            </span>
            <Button variant="secondary" size="md" onClick={sair}>
              Sair
            </Button>
          </div>
        </div>
        <nav className="shell__menu" aria-label="Menu principal">
          <div className="shell__menu-itens">
            {itens.map((item) => (
              <Link
                key={item.para}
                to={item.para}
                className={`shell__item ${item === ativo ? 'shell__item--ativo' : ''}`.trim()}
                aria-current={item === ativo ? 'page' : undefined}
              >
                {item.rotulo}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="shell__conteudo">
        <Outlet />
      </main>
    </div>
  )
}
