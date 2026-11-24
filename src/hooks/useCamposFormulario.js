import { useState } from 'react'

// Leva o foco para o primeiro campo com erro, na ordem em que os campos aparecem na tela.
// `ids` é um objeto { campo: 'id-do-elemento' } já escrito nessa ordem.
export function focarPrimeiroErro(erros, ids) {
  const primeiro = Object.keys(ids).find((campo) => erros[campo])
  if (primeiro) document.getElementById(ids[primeiro])?.focus()
  return Boolean(primeiro)
}

// Estado comum dos formulários: valores, erros por campo e o "digitar apaga o erro daquele campo".
// `aoEditar` roda a cada edição (as telas usam para apagar o erro vindo da API, que deixa de valer
// assim que a pessoa corrige algo).
export default function useCamposFormulario(valoresIniciais, aoEditar) {
  const [form, setForm] = useState(valoresIniciais)
  const [erros, setErros] = useState({})

  function definir(campo, valor) {
    aoEditar?.()
    setForm((atual) => ({ ...atual, [campo]: valor }))
    setErros((atuais) => {
      if (!atuais[campo]) return atuais
      const resto = { ...atuais }
      delete resto[campo]
      return resto
    })
  }

  // Para <input onChange={alterar('campo')}>.
  const alterar = (campo) => (evento) => definir(campo, evento.target.value)

  // Volta aos valores dados (ou aos iniciais) e limpa os erros.
  function reiniciar(valores = valoresIniciais) {
    setForm(valores)
    setErros({})
  }

  return { form, erros, setErros, definir, alterar, reiniciar }
}
