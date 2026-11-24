import { useId } from 'react'
import './Input.css'

// Campo de texto com rótulo, dica e erro.
// useId() é chamado sempre (regra dos hooks); o id recebido por prop tem prioridade.
// aria-describedby liga o campo ao texto de erro (ou de dica), para o leitor de tela ler.
export default function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  placeholder,
  disabled = false,
  inputMode,
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
      <input
        id={campoId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        inputMode={inputMode}
        maxLength={maxLength}
        className={`campo__controle ${error ? 'campo__controle--erro' : ''}`.trim()}
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
