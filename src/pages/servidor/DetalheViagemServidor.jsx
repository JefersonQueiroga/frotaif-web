import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { buscarViagem, cancelarViagem } from '../../api/viagens.js'
import AlertaErro from '../../components/AlertaErro.jsx'
import { Alert, Button } from '../../components/ds/index.js'
import Pagina from '../../components/layout/Pagina.jsx'
import ModalMotivo from '../../components/ModalMotivo.jsx'
import DetalheViagem from '../../components/viagens/DetalheViagem.jsx'
import CargaViagem, { LinkVoltar } from '../../components/viagens/CargaViagem.jsx'
import { viagemIndisponivel } from '../../components/viagens/viagemIndisponivel.js'
import useCarregar from '../../hooks/useCarregar.js'

const VOLTAR = <LinkVoltar para="/servidor/viagens" />

export default function DetalheViagemServidor() {
  const { id } = useParams()
  const { dados: viagem, carregando, erro, recarregar } = useCarregar(() => buscarViagem(id), [id])
  const [modalAberto, setModalAberto] = useState(false)
  const [sucesso, setSucesso] = useState(null)

  // Quem não pode cancelar (ex.: viagem de outra pessoa) recebe 403 da API, que o modal mostra.
  async function cancelar(motivo) {
    await cancelarViagem(id, motivo)
    setSucesso('Viagem cancelada.')
    recarregar()
  }

  if (viagemIndisponivel(viagem, erro)) {
    return <CargaViagem erro={erro} carregando={carregando} recarregar={recarregar} voltarPara="/servidor/viagens" />
  }

  const podeCancelar = viagem.status === 'SOLICITADA' || viagem.status === 'APROVADA'

  return (
    <Pagina titulo={`Viagem #${viagem.id} · ${viagem.destino}`}>
      {VOLTAR}
      {sucesso && (
        <Alert tone="success" onClose={() => setSucesso(null)}>
          {sucesso}
        </Alert>
      )}
      {/* Falha ao recarregar depois de cancelar: mantém os dados na tela e avisa. */}
      {erro && <AlertaErro erro={erro} onTentarDeNovo={recarregar} />}
      <DetalheViagem
        viagem={viagem}
        acoes={
          podeCancelar && (
            <Button variant="danger" onClick={() => setModalAberto(true)}>
              Cancelar viagem
            </Button>
          )
        }
      />
      <ModalMotivo
        aberto={modalAberto}
        titulo="Cancelar viagem"
        textoConfirmar="Cancelar viagem"
        onConfirmar={cancelar}
        onFechar={() => setModalAberto(false)}
      />
    </Pagina>
  )
}
