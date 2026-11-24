import { useId } from 'react'
import './Input.css'
import './Textarea.css'

// Área de texto com o mesmo visual do Input.
export default function Textarea({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  rows = 4,
  disabled = false,
  placeholder,
  maxLength,
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
      <textarea
        id={campoId}
        rows={rows}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`campo__controle textarea__controle ${error ? 'campo__controle--erro' : ''}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={mensagem ? mensagemId : undefined}
        {...resto}
      />
      {mensagem && (
        <span id={mensagemId} className={`campo__mensagem ${error ? 'campo__mensagem--erro' : ''}`.trim()}>
          {mensagem}
        </span>
      )}
    </div>
  )
}
