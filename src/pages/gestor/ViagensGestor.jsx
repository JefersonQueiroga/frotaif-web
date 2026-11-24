import { useEffect, useState } from 'react'
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
// Reaproveita as classes da lista do servidor (número, data, link "Ver detalhes"): mesmo visual.
import '../servidor/ViagensServidor.css'
import './ViagensGestor.css'

const SEM_FILTROS = { status: '', inicio: '', fim: '' }

const COLUNAS = [
  { titulo: 'Nº', render: (v) => <span className="viagens-servidor__id">#{v.id}</span> },
  { titulo: 'Destino', render: (v) => <strong>{v.destino}</strong> },
  { titulo: 'Solicitante', render: (v) => v.solicitante.nome },
  { titulo: 'Saída', className: 'viagens-servidor__data', render: (v) => formatarDataHora(v.saida) },
  { titulo: 'Retorno previsto', className: 'viagens-servidor__data', render: (v) => formatarDataHora(v.retornoPrevisto) },
  { titulo: 'Pass.', className: 'viagens-servidor__numero', render: (v) => v.qtdPassageiros },
  {
    titulo: 'Veículo',
    render: (v) => (v.veiculo ? <span className="viagens-gestor__placa">{v.veiculo.placa}</span> : '—'),
  },
  { titulo: 'Status', render: (v) => <StatusBadge tipo="viagem" valor={v.status} /> },
  {
    titulo: 'Ações',
    render: (v) => (
      <Link className="viagens-servidor__ver" to={`/gestor/viagens/${v.id}`}>
        {v.status === 'SOLICITADA' ? 'Analisar' : 'Ver detalhes'}
      </Link>
    ),
  },
]

export default function ViagensGestor() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sucesso, setSucesso] = useState(location.state?.sucesso ?? null)
  const [filtros, setFiltros] = useState(SEM_FILTROS)
  const { dados: viagens, carregando, erro, recarregar } = useCarregar(() => listarViagens(filtros), [filtros])

  // A mensagem já foi copiada para o estado acima; limpamos o `state` da navegação
  // para ela não reaparecer ao recarregar a página.
  useEffect(() => {
    if (location.state?.sucesso) navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate])

  const temFiltro = Object.values(filtros).some(Boolean)
  const limpar = () => setFiltros(SEM_FILTROS)
  const contador = viagens && !erro ? `${viagens.length} ${viagens.length === 1 ? 'viagem' : 'viagens'}` : null

  function conteudo() {
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
        <Vazio mensagem="Nenhuma viagem cadastrada." />
      )
    }
    return <Tabela colunas={COLUNAS} linhas={viagens} chave={(v) => v.id} />
  }

  return (
    <Pagina titulo="Viagens">
      {sucesso && (
        <Alert tone="success" onClose={() => setSucesso(null)}>
          {sucesso}
        </Alert>
      )}
      <FiltrosViagens filtros={filtros} onChange={setFiltros} onLimpar={limpar} contador={contador} />
      {conteudo()}
    </Pagina>
  )
}
