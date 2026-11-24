import { useState } from 'react'
import { concluirViagem } from '../../api/viagens.js'
import AlertaErro from '../../components/AlertaErro.jsx'
import { Button, Input, Modal } from '../../components/ds/index.js'
import useEnvio from '../../components/useEnvio.js'
import { formatarKm } from '../../utils/formatar.js'
import validarKmFinal from './validarKmFinal.js'

// Modal de conclusão: pede o km final. Não usa ModalConfirmar porque precisa de um campo próprio;
// o envio (Enviando…, erro dentro do modal, anti-duplo-clique) vem do useEnvio.
export default function ModalConcluir({ aberto, viagem, onConcluido, onFechar }) {
  const { enviando, erro, enviar, fechar } = useEnvio(aberto, onFechar)
  const [kmFinal, setKmFinal] = useState('')
  const [erroCampo, setErroCampo] = useState(null)
  const [abertoAntes, setAbertoAntes] = useState(aberto)

  // Ao abrir de novo o campo começa vazio e sem erro (ajuste de estado durante a renderização).
  if (aberto !== abertoAntes) {
    setAbertoAntes(aberto)
    if (aberto) {
      setKmFinal('')
      setErroCampo(null)
    }
  }

  function confirmar() {
    const mensagem = validarKmFinal(kmFinal, viagem.kmInicial)
    setErroCampo(mensagem)
    if (mensagem) return
    enviar(async () => {
      await concluirViagem(viagem.id, Number(kmFinal.trim()))
      await onConcluido()
    })
  }

  return (
    <Modal
      aberto={aberto}
      titulo={viagem ? `Concluir a viagem #${viagem.id}` : 'Concluir viagem'}
      onFechar={fechar}
      rodape={
        <>
          <Button variant="ghost" onClick={fechar} disabled={enviando}>
            Voltar
          </Button>
          <Button onClick={confirmar} disabled={enviando}>
            {enviando ? 'Enviando…' : 'Concluir viagem'}
          </Button>
        </>
      }
    >
      {viagem && (
        <>
          <AlertaErro erro={erro} />
          <Input
            id="concluir-km-final"
            label="Km final"
            type="text"
            inputMode="numeric"
            value={kmFinal}
            onChange={(e) => {
              setKmFinal(e.target.value)
              setErroCampo(null)
            }}
            error={erroCampo}
            hint={`Informe o que o hodômetro marca agora. Km inicial: ${formatarKm(viagem.kmInicial)}`}
          />
        </>
      )}
    </Modal>
  )
}
