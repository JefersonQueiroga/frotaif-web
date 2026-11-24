import { Alert } from '../ds/index.js'
import StatusBadge from '../StatusBadge.jsx'
import { formatarDataHora, formatarKm, formatarNumero } from '../../utils/formatar.js'
import './DetalheViagem.css'

const ETAPAS = [
  { status: 'SOLICITADA', rotulo: 'Solicitada', nota: 'Pedido enviado à gestão' },
  { status: 'APROVADA', rotulo: 'Aprovada', nota: 'Veículo e motorista definidos' },
  { status: 'EM_ANDAMENTO', rotulo: 'Em andamento', nota: 'Motorista iniciou a viagem' },
  { status: 'CONCLUIDA', rotulo: 'Concluída', nota: 'Km final registrado' },
]

// Linha do tempo pelo status atual: o que já passou fica "feito", o atual é destacado e o resto "pendente".
// Rejeitada e Cancelada encerram o caminho antes do fim, então mostram só duas etapas.
function montarEtapas(status) {
  if (status === 'REJEITADA' || status === 'CANCELADA') {
    return [
      { ...ETAPAS[0], estado: 'feito' },
      {
        rotulo: status === 'REJEITADA' ? 'Rejeitada' : 'Cancelada',
        nota: 'Motivo registrado',
        estado: 'erro',
      },
    ]
  }
  const atual = ETAPAS.findIndex((etapa) => etapa.status === status)
  return ETAPAS.map((etapa, i) => ({
    ...etapa,
    estado: i < atual ? 'feito' : i === atual ? 'atual' : 'pendente',
  }))
}

function Dado({ rotulo, children, largo = false }) {
  return (
    <div className={`detalhe-viagem__dado ${largo ? 'detalhe-viagem__dado--largo' : ''}`.trim()}>
      <dt className="detalhe-viagem__rotulo">{rotulo}</dt>
      <dd className="detalhe-viagem__valor">{children}</dd>
    </div>
  )
}

const DEFINIDO_NA_APROVACAO = 'Definido na aprovação'

// Só mostra dados: os botões de cada papel (cancelar, aprovar...) chegam prontos pela prop `acoes`.
// Assim a mesma tela serve ao Servidor, ao Motorista e ao Gestor.
export default function DetalheViagem({ viagem, acoes }) {
  const { veiculo, motorista, kmInicial, kmFinal, status, motivo } = viagem
  const temKm = kmInicial != null && kmFinal != null
  const etapas = montarEtapas(status)

  return (
    <div className="detalhe-viagem">
      <div className="detalhe-viagem__topo">
        <StatusBadge tipo="viagem" valor={status} />
        {acoes && <div className="detalhe-viagem__acoes">{acoes}</div>}
      </div>

      {motivo && (status === 'REJEITADA' || status === 'CANCELADA') && (
        <Alert tone="danger" title={status === 'REJEITADA' ? 'Motivo da rejeição' : 'Motivo do cancelamento'}>
          {motivo}
        </Alert>
      )}

      <div className="detalhe-viagem__colunas">
        <dl className="detalhe-viagem__dados">
          <Dado rotulo="Finalidade" largo>
            {viagem.finalidade}
          </Dado>
          <Dado rotulo="Saída">{formatarDataHora(viagem.saida)}</Dado>
          <Dado rotulo="Retorno previsto">{formatarDataHora(viagem.retornoPrevisto)}</Dado>
          <Dado rotulo="Passageiros">{formatarNumero(viagem.qtdPassageiros)}</Dado>
          <Dado rotulo="Solicitante">{viagem.solicitante.nome}</Dado>
          <Dado rotulo="Veículo">
            {veiculo ? (
              <>
                {veiculo.modelo} · <span className="detalhe-viagem__mono">{veiculo.placa}</span>
              </>
            ) : (
              DEFINIDO_NA_APROVACAO
            )}
          </Dado>
          <Dado rotulo="Motorista">{motorista ? motorista.nome : DEFINIDO_NA_APROVACAO}</Dado>
          <Dado rotulo="Km inicial">{kmInicial != null ? formatarKm(kmInicial) : '—'}</Dado>
          <Dado rotulo="Km final">{kmFinal != null ? formatarKm(kmFinal) : '—'}</Dado>
          <Dado rotulo="Km rodados">{temKm ? formatarKm(kmFinal - kmInicial) : '—'}</Dado>
        </dl>

        <section className="detalhe-viagem__tempo" aria-label="Linha do tempo">
          <h2 className="detalhe-viagem__subtitulo">Linha do tempo</h2>
          <ol className="detalhe-viagem__etapas">
            {etapas.map((etapa) => (
              <li
                key={etapa.rotulo}
                className={`detalhe-viagem__etapa detalhe-viagem__etapa--${etapa.estado}`}
                aria-current={etapa.estado === 'atual' ? 'step' : undefined}
              >
                <span className="detalhe-viagem__ponto" aria-hidden="true" />
                <span className="detalhe-viagem__etapa-texto">
                  <span className="detalhe-viagem__etapa-rotulo">{etapa.rotulo}</span>
                  <span className="detalhe-viagem__etapa-nota">{etapa.nota}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
