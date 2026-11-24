import { useRef } from 'react'
import './Tabs.css'

// Abas com navegação por teclado (padrão WAI-ARIA): só a aba ativa entra na ordem do Tab;
// as setas ← e → trocam de aba (e movem o foco); Home/End vão para a primeira/última.
// onChange recebe o VALOR da aba, não o evento.
export default function Tabs({ items, value, onChange, label }) {
  const botoes = useRef([])

  function aoTeclar(evento, indice) {
    let novo = null
    if (evento.key === 'ArrowRight') novo = (indice + 1) % items.length
    else if (evento.key === 'ArrowLeft') novo = (indice - 1 + items.length) % items.length
    else if (evento.key === 'Home') novo = 0
    else if (evento.key === 'End') novo = items.length - 1
    if (novo === null) return

    evento.preventDefault()
    onChange(items[novo].value)
    botoes.current[novo]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} className="abas">
      {items.map((item, indice) => {
        const ativa = item.value === value
        return (
          <button
            key={item.value}
            ref={(el) => {
              botoes.current[indice] = el
            }}
            type="button"
            role="tab"
            aria-selected={ativa}
            tabIndex={ativa ? 0 : -1}
            className={`abas__aba ${ativa ? 'abas__aba--ativa' : ''}`.trim()}
            onClick={() => onChange(item.value)}
            onKeyDown={(evento) => aoTeclar(evento, indice)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
