import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import './Input.css'
import './Select.css'

// Select nativo estilizado. `options` aceita [{ value, label, disabled? }] ou lista de textos.
// `placeholder` vira a primeira opção, com value=''.
export default function Select({
  id,
  label,
  options = [],
  value,
  onChange,
  error,
  hint,
  disabled = false,
  placeholder,
  className = '',
  ...resto
}) {
  const idGerado = useId()
  const campoId = id ?? idGerado
  const mensagemId = `${campoId}-mensagem`
  const mensagem = error || hint

  return (
    <div className={`campo ${className}`.trim()}>
      {label && (
        <label htmlFor={campoId} className="campo__rotulo">
          {label}
        </label>
      )}
      <div className="select__caixa">
        <select
          id={campoId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`campo__controle select__controle ${error ? 'campo__controle--erro' : ''}`.trim()}
          aria-invalid={error ? true : undefined}
          aria-describedby={mensagem ? mensagemId : undefined}
          {...resto}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opcao) => {
            const valor = typeof opcao === 'string' ? opcao : opcao.value
            const texto = typeof opcao === 'string' ? opcao : opcao.label
            // Uma opção pode vir com disabled: true — aparece na lista, mas não pode ser escolhida.
            const desabilitada = typeof opcao === 'string' ? false : Boolean(opcao.disabled)
            return (
              <option key={valor} value={valor} disabled={desabilitada}>
                {texto}
              </option>
            )
          })}
        </select>
        <ChevronDown className="select__seta" size={18} aria-hidden="true" />
      </div>
      {mensagem && (
        <span id={mensagemId} className={`campo__mensagem ${error ? 'campo__mensagem--erro' : ''}`.trim()}>
          {mensagem}
        </span>
      )}
    </div>
  )
}
