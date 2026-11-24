import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { buscarVeiculo, inativarVeiculo, reativarVeiculo } from '../../../api/veiculos.js'
import AlertaErro from '../../../components/AlertaErro.jsx'
import { Alert, Button, Tabs } from '../../../components/ds/index.js'
import Pagina from '../../../components/layout/Pagina.jsx'
import ModalConfirmar from '../../../components/ModalConfirmar.jsx'
import StatusBadge from '../../../components/StatusBadge.jsx'
import useCarregar from '../../../hooks/useCarregar.js'
import { formatarKm, formatarNumero } from '../../../utils/formatar.js'
import { rotuloTipoVeiculo } from '../../../utils/status.js'
import AbaAbastecimentos from './AbaAbastecimentos.jsx'
import AbaManutencoes from './AbaManutencoes.jsx'
import CargaVeiculo, { LinkVoltarVeiculos } from './CargaVeiculo.jsx'
import { veiculoIndisponivel } from './veiculoIndisponivel.js'
import './DetalheVeiculo.css'

const ABAS = [
  { value: 'abastecimentos', label: 'Abastecimentos' },
  { value: 'manutencoes', label: 'Manutenções' },
]

function Cartao({ rotulo, children }) {
  return (
    <div className="detalhe-veiculo__cartao">
      <dt className="detalhe-veiculo__rotulo">{rotulo}</dt>
      <dd className="detalhe-veiculo__valor">{children}</dd>
    </div>
  )
}

export default function DetalheVeiculo() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { dados: veiculo, carregando, erro, recarregar } = useCarregar(() => buscarVeiculo(id), [id])
  const [aba, setAba] = useState('abastecimentos')
  const [modalInativar, setModalInativar] = useState(false)
  // A tela de edição manda a mensagem de sucesso pelo `state` da navegação.
  const [sucesso, setSucesso] = useState(location.state?.sucesso ?? null)
  const [erroAcao, setErroAcao] = useState(null)
  const [reativando, setReativando] = useState(false)
  const reativandoAgora = useRef(false)

  // Depois de ler a mensagem, apagamos o `state`: senão ela voltaria a aparecer ao recarregar a página (F5).
  useEffect(() => {
    if (location.state?.sucesso) navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate])

  // Depois de cada ação, mostramos o sucesso e recarregamos o veículo para refletir o novo status.
  function concluir(mensagem) {
    setSucesso(mensagem)
    recarregar()
  }

  async function inativar() {
    await inativarVeiculo(id)
    concluir('Veículo inativado.')
  }

  async function reativar() {
    if (reativandoAgora.current) return
    reativandoAgora.current = true
    setReativando(true)
    setErroAcao(null)
    try {
      await reativarVeiculo(id)
      concluir('Veículo reativado.')
    } catch (e) {
      setErroAcao(e)
    } finally {
      reativandoAgora.current = false
      setReativando(false)
    }
  }

  if (veiculoIndisponivel(veiculo, erro)) {
    return <CargaVeiculo erro={erro} carregando={carregando} recarregar={recarregar} titulo="Detalhe do veículo" />
  }

  const inativo = veiculo.status === 'INATIVO'

  return (
    <Pagina titulo={`${veiculo.marca} ${veiculo.modelo}`}>
      <LinkVoltarVeiculos />
      {sucesso && (
        <Alert tone="success" onClose={() => setSucesso(null)}>
          {sucesso}
        </Alert>
      )}
      {/* Falha ao recarregar depois de uma ação: mantém os dados na tela e avisa. */}
      {erro && <AlertaErro erro={erro} onTentarDeNovo={recarregar} />}
      <AlertaErro erro={erroAcao} />

      <div className="detalhe-veiculo__topo">
        <div className="detalhe-veiculo__identidade">
          <span className="detalhe-veiculo__placa">{veiculo.placa}</span>
          <StatusBadge tipo="veiculo" valor={veiculo.status} />
        </div>
        <div className="detalhe-veiculo__acoes">
          <Button variant="secondary" onClick={() => navigate(`/gestor/veiculos/${veiculo.id}/editar`)}>
            Editar
          </Button>
          {inativo ? (
            <Button onClick={reativar} disabled={reativando}>
              {reativando ? 'Enviando…' : 'Reativar'}
            </Button>
          ) : (
            <Button variant="danger" onClick={() => setModalInativar(true)}>
              Inativar
            </Button>
          )}
        </div>
      </div>

      <dl className="detalhe-veiculo__cartoes">
        <Cartao rotulo="Tipo">{rotuloTipoVeiculo(veiculo.tipo)}</Cartao>
        <Cartao rotulo="Ano">{veiculo.ano ?? '—'}</Cartao>
        <Cartao rotulo="Lugares">{formatarNumero(veiculo.capacidadePassageiros)}</Cartao>
        <Cartao rotulo="Km atual">{formatarKm(veiculo.quilometragemAtual)}</Cartao>
      </dl>

      <Tabs items={ABAS} value={aba} onChange={setAba} label="Registros do veículo" />
      <div role="tabpanel">
        {aba === 'abastecimentos' ? (
          <AbaAbastecimentos veiculo={veiculo} onVeiculoAlterado={recarregar} />
        ) : (
          <AbaManutencoes veiculo={veiculo} onVeiculoAlterado={recarregar} />
        )}
      </div>

      <ModalConfirmar
        aberto={modalInativar}
        titulo="Inativar veículo"
        textoConfirmar="Inativar veículo"
        tom="danger"
        onConfirmar={inativar}
        onFechar={() => setModalInativar(false)}
      >
        <p className="detalhe-veiculo__texto-modal">
          Inativar {veiculo.marca} {veiculo.modelo} ({veiculo.placa})? Ele sai da lista de veículos e deixa de ser
          oferecido na aprovação de viagens. Você pode reativá-lo depois.
        </p>
      </ModalConfirmar>
    </Pagina>
  )
}
