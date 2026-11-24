import { useRef, useState } from 'react'

// Lógica comum dos modais que enviam algo à API: controla "enviando", guarda o erro e fecha no sucesso.
// `aberto` zera o erro cada vez que o modal abre de novo (padrão do React para ajustar estado durante a
// renderização, sem useEffect).
export default function useEnvio(aberto, onFechar) {
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [abertoAntes, setAbertoAntes] = useState(aberto)
  // O ref bloqueia o segundo clique mesmo antes de o React redesenhar o botão como desabilitado.
  const emAndamento = useRef(false)

  if (aberto !== abertoAntes) {
    setAbertoAntes(aberto)
    if (aberto) setErro(null)
  }

  async function enviar(acao) {
    if (emAndamento.current) return
    emAndamento.current = true
    setEnviando(true)
    setErro(null)
    try {
      await acao()
      onFechar()
    } catch (e) {
      setErro(e) // o modal continua aberto e mostra o erro
    } finally {
      emAndamento.current = false
      setEnviando(false)
    }
  }

  // Enquanto envia, Esc e "Voltar" não fecham: a resposta ainda vai chegar.
  const fechar = () => {
    if (!emAndamento.current) onFechar()
  }

  return { enviando, erro, enviar, fechar }
}
