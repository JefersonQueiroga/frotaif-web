import Pagina from '../../components/layout/Pagina.jsx'
import { COLUNAS_VIAGEM as C, colunaAcoes } from '../../components/viagens/colunasViagem.jsx'
import ListaViagens from '../../components/viagens/ListaViagens.jsx'

const COLUNAS = [
  C.id,
  C.destino,
  C.solicitante,
  C.saida,
  C.retorno,
  C.passageiros,
  C.veiculo,
  C.status,
  colunaAcoes('/gestor/viagens', (v) => (v.status === 'SOLICITADA' ? 'Analisar' : 'Ver detalhes')),
]

export default function ViagensGestor() {
  return (
    <Pagina titulo="Viagens">
      <ListaViagens colunas={COLUNAS} />
    </Pagina>
  )
}
