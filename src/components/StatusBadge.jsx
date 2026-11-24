import { Badge } from './ds/index.js'
import { infoStatusViagem, infoStatusVeiculo, infoTipoManutencao } from '../utils/status.js'

const BUSCAR_INFO = {
  viagem: infoStatusViagem,
  veiculo: infoStatusVeiculo,
  manutencao: infoTipoManutencao,
}

// Traduz o código vindo da API (ex.: "EM_ANDAMENTO") em rótulo legível e cor.
// Fica num só lugar para todas as telas mostrarem o mesmo status do mesmo jeito.
export default function StatusBadge({ tipo, valor }) {
  const { rotulo, tom } = BUSCAR_INFO[tipo](valor)
  return <Badge tone={tom}>{rotulo}</Badge>
}
