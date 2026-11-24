import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { listarVeiculos } from '../../../api/veiculos.js'
import AlertaErro from '../../../components/AlertaErro.jsx'
import { Button, Select, Skeleton, Tabela } from '../../../components/ds/index.js'
import Pagina from '../../../components/layout/Pagina.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import Vazio from '../../../components/Vazio.jsx'
import useCarregar from '../../../hooks/useCarregar.js'
import { formatarKm, formatarNumero } from '../../../utils/formatar.js'
import { infoStatusVeiculo, rotuloTipoVeiculo } from '../../../utils/status.js'
import './ListaVeiculos.css'

const STATUS = ['DISPONIVEL', 'EM_VIAGEM', 'EM_MANUTENCAO', 'INATIVO']
// "Inativos" no plural porque a opção lista os inativos (a API só os devolve com status=INATIVO).
const OPCOES_STATUS = STATUS.map((valor) => ({
  value: valor,
  label: valor === 'INATIVO' ? 'Inativos' : infoStatusVeiculo(valor).rotulo,
}))
const OPCOES_TIPO = ['CARRO', 'VAN', 'ONIBUS'].map((valor) => ({ value: valor, label: rotuloTipoVeiculo(valor) }))

const COLUNAS = [
  {
    titulo: 'Placa',
    render: (v) => <span className="lista-veiculos__placa">{v.placa}</span>,
  },
  {
    titulo: 'Veículo',
    render: (v) => (
      <>
        {v.marca} {v.modelo}
        {v.ano != null && <span className="lista-veiculos__ano"> · {v.ano}</span>}
      </>
    ),
  },
  { titulo: 'Tipo', render: (v) => rotuloTipoVeiculo(v.tipo) },
  { titulo: 'Lugares', className: 'tabela__numero', render: (v) => formatarNumero(v.capacidadePassageiros) },
  { titulo: 'Km atual', className: 'tabela__numero', render: (v) => formatarKm(v.quilometragemAtual) },
  { titulo: 'Status', render: (v) => <StatusBadge tipo="veiculo" valor={v.status} /> },
  {
    titulo: 'Ações',
    render: (v) => (
      <Link className="lista-veiculos__abrir" to={`/gestor/veiculos/${v.id}`}>
        Abrir
      </Link>
    ),
  },
]

export default function ListaVeiculos() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  // O status vive na URL (?status=EM_MANUTENCAO) para o painel poder linkar direto para a lista filtrada.
  // Um valor desconhecido na URL vira "sem filtro" em vez de pedir à API algo que ela recusaria.
  const statusDaUrl = params.get('status')
  const status = STATUS.includes(statusDaUrl) ? statusDaUrl : ''
  const [tipo, setTipo] = useState('')

  const {
    dados: veiculos,
    carregando,
    erro,
    recarregar,
  } = useCarregar(() => listarVeiculos({ status, tipo }), [status, tipo])

  const mudarStatus = (evento) => {
    // `replace` evita encher o histórico a cada troca de filtro.
    setParams(evento.target.value ? { status: evento.target.value } : {}, { replace: true })
  }
  const limpar = () => {
    setParams({}, { replace: true })
    setTipo('')
  }
  const novo = () => navigate('/gestor/veiculos/novo')

  const temFiltro = Boolean(status || tipo)
  const contador = veiculos && !erro ? `${veiculos.length} ${veiculos.length === 1 ? 'veículo' : 'veículos'}` : null

  function conteudo() {
    // Com erro não mostramos a lista antiga: ela não corresponde aos filtros que estão na tela.
    if (erro) return <AlertaErro erro={erro} onTentarDeNovo={recarregar} />
    if (carregando && !veiculos) return <Skeleton linhas={4} />
    if (!veiculos) return null
    if (veiculos.length === 0) {
      return temFiltro ? (
        <Vazio
          mensagem="Nenhum veículo com esses filtros."
          acao={
            <Button variant="secondary" onClick={limpar}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <Vazio mensagem="Nenhum veículo cadastrado." acao={<Button onClick={novo}>Novo veículo</Button>} />
      )
    }
    return <Tabela colunas={COLUNAS} linhas={veiculos} chave={(v) => v.id} />
  }

  return (
    <Pagina titulo="Veículos" acoes={<Button onClick={novo}>Novo veículo</Button>}>
      <div className="lista-veiculos__filtros">
        <Select
          id="filtro-status-veiculo"
          label="Status"
          placeholder="Todos (exceto inativos)"
          options={OPCOES_STATUS}
          value={status}
          onChange={mudarStatus}
          className="lista-veiculos__campo"
        />
        <Select
          id="filtro-tipo-veiculo"
          label="Tipo"
          placeholder="Todos"
          options={OPCOES_TIPO}
          value={tipo}
          onChange={(evento) => setTipo(evento.target.value)}
          className="lista-veiculos__campo"
        />
        <Button variant="ghost" onClick={limpar}>
          Limpar filtros
        </Button>
        {contador && <span className="lista-veiculos__contador">{contador}</span>}
      </div>
      {conteudo()}
    </Pagina>
  )
}
