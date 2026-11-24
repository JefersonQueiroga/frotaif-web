import './Vazio.css'

// Estado de lista sem itens: mensagem e, se houver, uma ação (ex.: botão "Solicitar viagem").
export default function Vazio({ mensagem, acao }) {
  return (
    <div className="vazio">
      <p className="vazio__mensagem">{mensagem}</p>
      {acao}
    </div>
  )
}
