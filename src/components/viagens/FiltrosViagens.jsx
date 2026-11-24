import { Button, Input, Select } from '../ds/index.js'
import { infoStatusViagem } from '../../utils/status.js'
import './FiltrosViagens.css'

const STATUS = ['SOLICITADA', 'APROVADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'REJEITADA', 'CANCELADA']
const OPCOES_STATUS = STATUS.map((valor) => ({ value: valor, label: infoStatusViagem(valor).rotulo }))

// Barra de filtros da lista de viagens. Quem usa guarda os filtros no próprio estado:
// aqui só mostramos os valores e avisamos cada mudança com onChange(novosFiltros).
// `contador` (opcional) é o texto à direita, ex.: "4 viagens".
export default function FiltrosViagens({ filtros, onChange, onLimpar, contador }) {
  const alterar = (campo) => (evento) => onChange({ ...filtros, [campo]: evento.target.value })

  return (
    <div className="filtros-viagens">
      <Select
        id="filtro-status"
        label="Status"
        placeholder="Todos"
        options={OPCOES_STATUS}
        value={filtros.status}
        onChange={alterar('status')}
        className="filtros-viagens__campo"
      />
      <Input
        id="filtro-inicio"
        label="Saída a partir de"
        type="date"
        value={filtros.inicio}
        onChange={alterar('inicio')}
        className="filtros-viagens__campo"
      />
      <Input
        id="filtro-fim"
        label="Até"
        type="date"
        value={filtros.fim}
        onChange={alterar('fim')}
        className="filtros-viagens__campo"
      />
      <Button variant="ghost" onClick={onLimpar}>
        Limpar filtros
      </Button>
      {contador && <span className="filtros-viagens__contador">{contador}</span>}
    </div>
  )
}
