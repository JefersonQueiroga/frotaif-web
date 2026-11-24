import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ApiError } from '../../api/cliente.js'
import { buscarViagem, cancelarViagem } from '../../api/viagens.js'
import AlertaErro from '../../components/AlertaErro.jsx'
import { Alert, Button, Skeleton } from '../../components/ds/index.js'
import Pagina from '../../components/layout/Pagina.jsx'
import ModalMotivo from '../../components/ModalMotivo.jsx'
import Vazio from '../../components/Vazio.jsx'
import DetalheViagem from '../../components/viagens/DetalheViagem.jsx'
import useCarregar from '../../hooks/useCarregar.js'
import './DetalheViagemServidor.css'

const VOLTAR = (
  <Link className="detalhe-servidor__voltar" to="/servidor/viagens">
    <ArrowLeft size={18} aria-hidden="true" />
    Voltar para as viagens
  </Link>
)

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

  if (erro instanceof ApiError && erro.status === 404) {
    return (
      <Pagina titulo="Viagem não encontrada">
        <Vazio mensagem="Viagem não encontrada." acao={VOLTAR} />
      </Pagina>
    )
  }
  if (erro && !viagem) {
    return (
      <Pagina titulo="Detalhe da viagem">
        {VOLTAR}
        <AlertaErro erro={erro} onTentarDeNovo={recarregar} />
      </Pagina>
    )
  }
  if (!viagem) {
    return (
      <Pagina titulo="Detalhe da viagem">
        {VOLTAR}
        {carregando && <Skeleton linhas={4} />}
      </Pagina>
    )
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
