import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { buscarViagem } from '../../api/viagens.js'
import AlertaErro from '../../components/AlertaErro.jsx'
import { Alert, Button } from '../../components/ds/index.js'
import Pagina from '../../components/layout/Pagina.jsx'
import DetalheViagem from '../../components/viagens/DetalheViagem.jsx'
import CargaViagem, { LinkVoltar } from '../../components/viagens/CargaViagem.jsx'
import { viagemIndisponivel } from '../../components/viagens/viagemIndisponivel.js'
import useCarregar from '../../hooks/useCarregar.js'
import ModaisMotorista from './ModaisMotorista.jsx'

const VOLTAR = <LinkVoltar para="/motorista/viagens" />

export default function DetalheViagemMotorista() {
  const { id } = useParams()
  const { dados: viagem, carregando, erro, recarregar } = useCarregar(() => buscarViagem(id), [id])
  // Modal aberto: 'iniciar' | 'concluir' | null
  const [acao, setAcao] = useState(null)
  const [sucesso, setSucesso] = useState(null)

  // Depois de cada ação, mostramos o sucesso e recarregamos a viagem para refletir o novo status.
  async function feito(mensagem) {
    setSucesso(mensagem)
    recarregar()
  }

  if (viagemIndisponivel(viagem, erro)) {
    return <CargaViagem erro={erro} carregando={carregando} recarregar={recarregar} voltarPara="/motorista/viagens" />
  }

  const acoes =
    viagem.status === 'APROVADA' ? (
      <Button onClick={() => setAcao('iniciar')}>Iniciar viagem</Button>
    ) : viagem.status === 'EM_ANDAMENTO' ? (
      <Button onClick={() => setAcao('concluir')}>Concluir viagem</Button>
    ) : null

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
      <ModaisMotorista viagem={viagem} acao={acao} onFeito={feito} onFechar={() => setAcao(null)} />
    </Pagina>
  )
}
