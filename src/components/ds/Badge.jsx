import './Badge.css'

// Etiqueta pequena de status. O tom muda só as cores.
export default function Badge({ tone = 'neutral', children }) {
  return <span className={`selo selo--${tone}`}>{children}</span>
}
