import { Button, Modal } from './ds/index.js'
import AlertaErro from './AlertaErro.jsx'
import useEnvio from './useEnvio.js'

// Confirmação de ação sem volta. O botão principal repete a ação ("Cancelar viagem", nunca "OK")
// e o secundário é sempre "Voltar". onConfirmar deve devolver uma Promise (a chamada à API).
export default function ModalConfirmar({
  aberto,
  titulo,
  textoConfirmar,
  tom = 'primary',
  onConfirmar,
  onFechar,
  children,
}) {
  const { enviando, erro, enviar, fechar } = useEnvio(aberto, onFechar)

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
          <Button variant={tom} onClick={() => enviar(onConfirmar)} disabled={enviando}>
            {enviando ? 'Enviando…' : textoConfirmar}
          </Button>
        </>
      }
    >
      <AlertaErro erro={erro} />
      {children}
    </Modal>
  )
}
