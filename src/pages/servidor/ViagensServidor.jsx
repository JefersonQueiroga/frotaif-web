import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { listarViagens } from '../../api/viagens.js'
import AlertaErro from '../../components/AlertaErro.jsx'
import { Alert, Button, Skeleton, Tabela } from '../../components/ds/index.js'
import Pagina from '../../components/layout/Pagina.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import Vazio from '../../components/Vazio.jsx'
import FiltrosViagens from '../../components/viagens/FiltrosViagens.jsx'
import useCarregar from '../../hooks/useCarregar.js'
import { formatarDataHora } from '../../utils/formatar.js'
import './ViagensServidor.css'

const SEM_FILTROS = { status: '', inicio: '', fim: '' }

const COLUNAS = [
  { titulo: 'Nº', render: (v) => <span className="viagens-servidor__id">#{v.id}</span> },
  { titulo: 'Destino', render: (v) => <strong>{v.destino}</strong> },
  { titulo: 'Finalidade', render: (v) => v.finalidade },
  { titulo: 'Solicitante', render: (v) => v.solicitante.nome },
  { titulo: 'Saída', className: 'viagens-servidor__data', render: (v) => formatarDataHora(v.saida) },
  { titulo: 'Retorno previsto', className: 'viagens-servidor__data', render: (v) => formatarDataHora(v.retornoPrevisto) },
  { titulo: 'Pass.', className: 'viagens-servidor__numero', render: (v) => v.qtdPassageiros },
  { titulo: 'Status', render: (v) => <StatusBadge tipo="viagem" valor={v.status} /> },
  {
    titulo: 'Ações',
    render: (v) => (
      <Link className="viagens-servidor__ver" to={`/servidor/viagens/${v.id}`}>
        Ver detalhes
      </Link>
    ),
  },
]

export default function ViagensServidor() {
  const location = useLocation()
  const navigate = useNavigate()
  // O formulário de solicitação manda a mensagem de sucesso pelo `state` da navegação.
  const [sucesso, setSucesso] = useState(location.state?.sucesso ?? null)
  const [filtros, setFiltros] = useState(SEM_FILTROS)
  // `filtros` só vira outro objeto quando o usuário muda algo: por isso serve como dependência.
  const { dados: viagens, carregando, erro, recarregar } = useCarregar(() => listarViagens(filtros), [filtros])

  const temFiltro = Object.values(filtros).some(Boolean)
  const irParaNova = () => navigate('/servidor/viagens/nova')
  const limpar = () => setFiltros(SEM_FILTROS)
  const contador = viagens && !erro ? `${viagens.length} ${viagens.length === 1 ? 'viagem' : 'viagens'}` : null

  function conteudo() {
    // Com erro (ex.: 422 de "Até" antes de "Saída a partir de") não mostramos a lista antiga:
    // ela não corresponde aos filtros que estão na tela.
    if (erro) return <AlertaErro erro={erro} onTentarDeNovo={recarregar} />
    if (carregando && !viagens) return <Skeleton linhas={4} />
    if (!viagens) return null
    if (viagens.length === 0) {
      return temFiltro ? (
        <Vazio
          mensagem="Nenhuma viagem com esses filtros."
          acao={
            <Button variant="secondary" onClick={limpar}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <Vazio
          mensagem="Nenhuma viagem cadastrada."
          acao={<Button onClick={irParaNova}>Solicitar viagem</Button>}
        />
      )
    }
    return <Tabela colunas={COLUNAS} linhas={viagens} chave={(v) => v.id} />
  }

  return (
    <Pagina
      titulo="Viagens"
      acoes={<Button onClick={irParaNova}>Solicitar viagem</Button>}
    >
      {sucesso && (
        <Alert tone="success" onClose={() => setSucesso(null)}>
          {sucesso}
        </Alert>
      )}
      <Alert tone="info" title="Viagens do campus">
        Esta lista mostra as viagens de todos os servidores do campus, não apenas as suas.
      </Alert>
      <FiltrosViagens filtros={filtros} onChange={setFiltros} onLimpar={limpar} contador={contador} />
      {conteudo()}
    </Pagina>
  )
}
