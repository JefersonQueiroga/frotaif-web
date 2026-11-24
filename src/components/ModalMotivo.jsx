import { useState } from 'react'
import { Button, Modal, Textarea } from './ds/index.js'
import AlertaErro from './AlertaErro.jsx'
import useEnvio from './useEnvio.js'

// Como o ModalConfirmar, mas pede um motivo (obrigatório) e o entrega a onConfirmar(motivo).
export default function ModalMotivo({ aberto, titulo, textoConfirmar, onConfirmar, onFechar }) {
  const { enviando, erro, enviar, fechar } = useEnvio(aberto, onFechar)
  const [motivo, setMotivo] = useState('')
  const [erroMotivo, setErroMotivo] = useState('')
  const [abertoAntes, setAbertoAntes] = useState(aberto)

  // Ao abrir de novo, começa limpo (ajuste de estado durante a renderização, sem useEffect).
  if (aberto !== abertoAntes) {
    setAbertoAntes(aberto)
    if (aberto) {
      setMotivo('')
      setErroMotivo('')
    }
  }

  function confirmar() {
    const texto = motivo.trim()
    if (!texto) {
      setErroMotivo('Informe o motivo.')
      return
    }
    enviar(() => onConfirmar(texto))
  }

  function aoDigitar(evento) {
    setMotivo(evento.target.value)
    setErroMotivo('') // o erro some assim que a pessoa volta a editar o campo
  }

  return (
    <Modal
      aberto={aberto}
      titulo={titulo}
      onFechar={fechar}
      rodape={
        <>
          <Button variant="ghost" onClick={fechar} disabled={enviando}>
            Voltar
          </Button>
          <Button onClick={confirmar} disabled={enviando}>
            {enviando ? 'Enviando…' : textoConfirmar}
          </Button>
        </>
      }
    >
      <AlertaErro erro={erro} />
      <Textarea label="Motivo" value={motivo} onChange={aoDigitar} error={erroMotivo} rows={3} />
    </Modal>
  )
}
