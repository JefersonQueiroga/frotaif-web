import { useEffect, useId, useRef } from 'react'
import './Modal.css'

// Janela de diálogo sobre a página, feita com o <dialog> nativo.
// Ao usar showModal() o próprio navegador cuida do que seria trabalhoso à mão:
// prende o foco dentro do diálogo, deixa o resto da página inerte e devolve o foco
// ao botão que abriu quando fecha.
// O estado `aberto` continua sendo do componente pai (fonte da verdade): o efeito só
// sincroniza o <dialog> com ele.
export default function Modal({ aberto, titulo, onFechar, rodape, children }) {
  const dialogo = useRef(null)
  const tituloId = useId()

  useEffect(() => {
    const el = dialogo.current
    if (!el) return
    if (aberto && !el.open) el.showModal()
    if (!aberto && el.open) el.close()
  }, [aberto])

  // Esc dispara o evento "cancel". Cancelamos o fechamento nativo e pedimos ao pai
  // que mude `aberto`; assim o React nunca fica fora de sincronia com o <dialog>.
  function aoCancelar(evento) {
    evento.preventDefault()
    onFechar?.()
  }

  return (
    <dialog ref={dialogo} className="modal" aria-labelledby={tituloId} onCancel={aoCancelar}>
      <div className="modal__conteudo">
        <h2 id={tituloId} className="modal__titulo">
          {titulo}
        </h2>
        <div className="modal__corpo">{children}</div>
        {rodape && <div className="modal__rodape">{rodape}</div>}
      </div>
    </dialog>
  )
}
