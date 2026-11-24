import { useEffect, useRef, useState } from 'react'

// Carrega dados da API ao abrir a tela (e de novo quando `deps` mudam ou `recarregar()` é chamado).
// Se os filtros mudam enquanto a chamada anterior ainda não voltou, a resposta antiga é descartada:
// senão ela poderia chegar depois e sobrescrever a lista mais nova.
export default function useCarregar(funcao, deps = []) {
  const [estado, setEstado] = useState({ dados: null, carregando: true, erro: null })
  const [tentativa, setTentativa] = useState(0)
  // Sempre a versão mais recente de `funcao`, sem precisar colocá-la nas dependências
  // (ela é recriada a cada renderização e causaria um laço de requisições).
  const funcaoAtual = useRef(funcao)
  useEffect(() => {
    funcaoAtual.current = funcao
  })

  useEffect(() => {
    let descartada = false
    // Marcar "carregando" ao começar uma nova busca é exatamente sincronizar com a chamada externa.
    // oxlint-disable-next-line react/set-state-in-effect
    setEstado((e) => ({ ...e, carregando: true, erro: null }))
    funcaoAtual
      .current()
      .then((dados) => {
        if (!descartada) setEstado({ dados, carregando: false, erro: null })
      })
      .catch((erro) => {
        if (!descartada) setEstado((e) => ({ ...e, carregando: false, erro }))
      })
    // A limpeza roda quando `deps` mudam (ou a tela fecha): marca a chamada em andamento como velha.
    return () => {
      descartada = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tentativa])

  return { ...estado, recarregar: () => setTentativa((n) => n + 1) }
}
