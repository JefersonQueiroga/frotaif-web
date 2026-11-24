import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { buscarViagem, cancelarViagem, rejeitarViagem } from '../../api/viagens.js'
import AlertaErro from '../../components/AlertaErro.jsx'
import { Alert, Button } from '../../components/ds/index.js'
import Pagina from '../../components/layout/Pagina.jsx'
import ModalMotivo from '../../components/ModalMotivo.jsx'
import DetalheViagem from '../../components/viagens/DetalheViagem.jsx'
import CargaViagem, { LinkVoltar } from '../../components/viagens/CargaViagem.jsx'
import { viagemIndisponivel } from '../../components/viagens/viagemIndisponivel.js'
import useCarregar from '../../hooks/useCarregar.js'
import ModalAprovar from './ModalAprovar.jsx'

const VOLTAR = <LinkVoltar para="/gestor/viagens" />

export default function DetalheViagemGestor() {
  const { id } = useParams()
  const { dados: viagem, carregando, erro, recarregar } = useCarregar(() => buscarViagem(id), [id])
  // Qual modal está aberto: 'aprovar' | 'rejeitar' | 'cancelar' | null
  const [modal, setModal] = useState(null)
  const [sucesso, setSucesso] = useState(null)

  const fecharModal = () => setModal(null)

  // Depois de cada ação, mostramos o sucesso e recarregamos a viagem para refletir o novo status.
  function concluir(mensagem) {
    setSucesso(mensagem)
    recarregar()
  }

  async function rejeitar(motivo) {
    await rejeitarViagem(id, motivo)
    concluir('Viagem rejeitada.')
  }

  async function cancelar(motivo) {
    await cancelarViagem(id, motivo)
    concluir('Viagem cancelada.')
  }

  if (viagemIndisponivel(viagem, erro)) {
    return <CargaViagem erro={erro} carregando={carregando} recarregar={recarregar} voltarPara="/gestor/viagens" />
  }

  const solicitada = viagem.status === 'SOLICITADA'
  const podeCancelar = solicitada || viagem.status === 'APROVADA'
  const emCampo = viagem.status === 'APROVADA' || viagem.status === 'EM_ANDAMENTO'

  const acoes = (podeCancelar || emCampo) && (
    <>
      {solicitada && <Button onClick={() => setModal('aprovar')}>Aprovar</Button>}
      {solicitada && (
        <Button variant="secondary" onClick={() => setModal('rejeitar')}>
          Rejeitar
        </Button>
      )}
      {podeCancelar && (
        <Button variant="danger" onClick={() => setModal('cancelar')}>
          Cancelar viagem
        </Button>
      )}
      {emCampo && <span>Só o motorista alocado pode concluir.</span>}
    </>
  )

  return (
    <Pagina titulo={`Viagem #${viagem.id} · ${viagem.destino}`}>
      {VOLTAR}
      {sucesso && (
        <Alert tone="success" onClose={() => setSucesso(null)}>
          {sucesso}
        </Alert>
      )}
      {/* Falha ao recarregar depois de uma ação: mantém os dados na tela e avisa. */}
      {erro && <AlertaErro erro={erro} onTentarDeNovo={recarregar} />}
      <DetalheViagem viagem={viagem} acoes={acoes} />
      <ModalAprovar
        aberto={modal === 'aprovar'}
        viagem={viagem}
        onAprovado={() => concluir('Viagem aprovada.')}
        onFechar={fecharModal}
      />
      <ModalMotivo
        aberto={modal === 'rejeitar'}
        titulo="Rejeitar viagem"
        textoConfirmar="Rejeitar viagem"
        onConfirmar={rejeitar}
        onFechar={fecharModal}
      />
      <ModalMotivo
        aberto={modal === 'cancelar'}
        titulo="Cancelar viagem"
        textoConfirmar="Cancelar viagem"
        onConfirmar={cancelar}
        onFechar={fecharModal}
      />
    </Pagina>
  )
}
