import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import './Alert.css'

const ICONES = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
}

// Mensagem em destaque. danger/warning usam role="alert" (o leitor de tela interrompe e lê);
// info/success usam role="status" (lê quando estiver livre).
export default function Alert({ tone = 'info', title, onClose, children }) {
  const Icone = ICONES[tone] || Info
  const papel = tone === 'danger' || tone === 'warning' ? 'alert' : 'status'

  return (
    <div role={papel} className={`alerta alerta--${tone}`}>
      <Icone className="alerta__icone" size={20} aria-hidden="true" />
      <div className="alerta__corpo">
        {title && <div className="alerta__titulo">{title}</div>}
        <div className="alerta__texto">{children}</div>
      </div>
      {onClose && (
        <button type="button" className="alerta__fechar" onClick={onClose} aria-label="Fechar">
          <X size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
