import { Alert, Button } from './ds/index.js'
import { descreverErro } from '../api/erros.js'
import './AlertaErro.css'

// Mostra um erro da API como Alert (tom, título e mensagem vêm de descreverErro).
// "Tentar de novo" só aparece quando repetir pode funcionar (rede/5xx) e a tela soube refazer a chamada.
export default function AlertaErro({ erro, onTentarDeNovo }) {
  if (!erro) return null
  const { tom, titulo, mensagem, podeTentarDeNovo } = descreverErro(erro)

  return (
    <Alert tone={tom} title={titulo}>
      {mensagem}
      {podeTentarDeNovo && onTentarDeNovo && (
        <div className="alerta-erro__acao">
          <Button variant="secondary" onClick={onTentarDeNovo}>
            Tentar de novo
          </Button>
        </div>
      )}
    </Alert>
  )
}
