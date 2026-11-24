import { useState } from 'react'
import { Link } from 'react-router-dom'
import { listarViagens } from '../../api/viagens.js'
import AlertaErro from '../../components/AlertaErro.jsx'
import { Alert, Button, Skeleton, Tabs } from '../../components/ds/index.js'
import Pagina from '../../components/layout/Pagina.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import Vazio from '../../components/Vazio.jsx'
import useCarregar from '../../hooks/useCarregar.js'
import { formatarDataHora } from '../../utils/formatar.js'
import ModaisMotorista from './ModaisMotorista.jsx'
import './ViagensMotorista.css'

const ABAS = [
  { value: 'fazer', label: 'A fazer e em andamento' },
  { value: 'historico', label: 'Histórico' },
]
const STATUS_DA_ABA = {
  fazer: ['APROVADA', 'EM_ANDAMENTO'],
  historico: ['CONCLUIDA', 'CANCELADA'],
}

function Bloco({ rotulo, children }) {
  return (
    <div className="viagem-card__bloco">
      <span className="viagem-card__rotulo">{rotulo}</span>
      {children}
    </div>
  )
}

function CartaoViagem({ viagem, onAcao }) {
  const { veiculo, motorista } = viagem
  return (
    <article className="viagem-card">
      <div className="viagem-card__status">
        <StatusBadge tipo="viagem" valor={viagem.status} />
        <span className="viagem-card__id">Viagem #{viagem.id}</span>
      </div>
      <div className="viagem-card__bloco">
        <h2 className="viagem-card__destino">{viagem.destino}</h2>
        <span className="viagem-card__finalidade">{viagem.finalidade}</span>
      </div>
      <Bloco rotulo="Período">
        <span className="viagem-card__periodo">
          {formatarDataHora(viagem.saida)} → {formatarDataHora(viagem.retornoPrevisto)}
        </span>
      </Bloco>
      <Bloco rotulo="Veículo">
        {veiculo ? (
          <span>
            {veiculo.modelo} · <span className="viagem-card__placa">{veiculo.placa}</span>
          </span>
        ) : (
          <span>—</span>
        )}
      </Bloco>
      <Bloco rotulo="Motorista">
        <span>{motorista ? motorista.nome : '—'}</span>
      </Bloco>
      <div className="viagem-card__acoes">
        <Link className="viagens-motorista__voltar" to={`/motorista/viagens/${viagem.id}`}>
          Detalhes
        </Link>
        {viagem.status === 'APROVADA' && <Button onClick={() => onAcao('iniciar', viagem)}>Iniciar viagem</Button>}
        {viagem.status === 'EM_ANDAMENTO' && <Button onClick={() => onAcao('concluir', viagem)}>Concluir viagem</Button>}
      </div>
    </article>
  )
}

export default function ViagensMotorista() {
  const { dados: viagens, carregando, erro, recarregar } = useCarregar(() => listarViagens({}), [])
  const [aba, setAba] = useState('fazer')
  const [sucesso, setSucesso] = useState(null)
  // Ação em andamento: qual modal e para qual viagem.
  const [alvo, setAlvo] = useState({ acao: null, viagem: null })

  const abrir = (acao, viagem) => setAlvo({ acao, viagem })
  // Mantém a viagem enquanto o modal fecha (evita o título piscar); só zera a ação.
  const fechar = () => setAlvo((atual) => ({ ...atual, acao: null }))

  // A API devolve tudo; a aba só filtra pelo status e mantém a ordem de saída que a API já entrega.
  const visiveis = (viagens ?? []).filter((v) => STATUS_DA_ABA[aba].includes(v.status))

  async function feito(mensagem) {
    setSucesso(mensagem)
    recarregar()
  }

  function conteudo() {
    if (erro && !viagens) return <AlertaErro erro={erro} onTentarDeNovo={recarregar} />
    if (!viagens) return carregando ? <Skeleton linhas={4} /> : null
    if (visiveis.length === 0) return <Vazio mensagem="Nenhuma viagem nesta aba." />
    return (
      <div className="viagens-motorista__lista">
        {visiveis.map((v) => (
          <CartaoViagem key={v.id} viagem={v} onAcao={abrir} />
        ))}
      </div>
    )
  }

  return (
    <Pagina titulo="Viagens">
      {sucesso && (
        <Alert tone="success" onClose={() => setSucesso(null)}>
          {sucesso}
        </Alert>
      )}
      <Alert tone="info" title="Viagens do campus">
        Esta lista mostra as viagens de todos os motoristas do campus. Só o motorista alocado consegue iniciar e
        concluir cada uma.
      </Alert>
      <Tabs items={ABAS} value={aba} onChange={setAba} label="Viagens por situação" />
      {/* Falha ao recarregar depois de uma ação: mantém a lista na tela e avisa. */}
      {erro && viagens && <AlertaErro erro={erro} onTentarDeNovo={recarregar} />}
      {conteudo()}
      <span className="viagens-motorista__nota">
        Ao iniciar, o km inicial vem da quilometragem atual do veículo e ele passa para Em viagem. Ao concluir, o
        veículo volta para Disponível com o km final.
      </span>
      <ModaisMotorista viagem={alvo.viagem} acao={alvo.acao} onFeito={feito} onFechar={fechar} />
    </Pagina>
  )
}
