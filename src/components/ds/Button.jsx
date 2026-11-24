import './Button.css'

// Botão do IFRN Design System. As cores vêm das classes `.botao--*` (ver Button.css).
// `...resto` repassa para o <button> nativo qualquer outra prop (aria-*, title, form...).
export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  iconLeft = null,
  iconRight = null,
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  children,
  ...resto
}) {
  const classes = [
    'botao',
    `botao--${variant}`,
    `botao--${size}`,
    fullWidth ? 'botao--cheio' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} {...resto}>
      {iconLeft}
      {children}
      {iconRight}
    </button>
  )
}
