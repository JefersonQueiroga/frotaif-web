import { Link } from 'react-router-dom'
import StatusBadge from '../StatusBadge.jsx'
import { formatarDataHora } from '../../utils/formatar.js'
// As classes `lista-viagens__*` estão em ListaViagens.css, carregado pela própria lista.

// Colunas que as listas de todos os papéis têm em comum; cada tela monta a sua ordem com elas.
export const COLUNAS_VIAGEM = {
  id: { titulo: 'Nº', render: (v) => <span className="lista-viagens__id">#{v.id}</span> },
  destino: { titulo: 'Destino', render: (v) => <strong>{v.destino}</strong> },
  finalidade: { titulo: 'Finalidade', render: (v) => v.finalidade },
  solicitante: { titulo: 'Solicitante', render: (v) => v.solicitante.nome },
  saida: { titulo: 'Saída', className: 'lista-viagens__data', render: (v) => formatarDataHora(v.saida) },
  retorno: {
    titulo: 'Retorno previsto',
    className: 'lista-viagens__data',
    render: (v) => formatarDataHora(v.retornoPrevisto),
  },
  passageiros: { titulo: 'Pass.', className: 'tabela__numero', render: (v) => v.qtdPassageiros },
  veiculo: {
    titulo: 'Veículo',
    render: (v) => (v.veiculo ? <span className="lista-viagens__placa">{v.veiculo.placa}</span> : '—'),
  },
  status: { titulo: 'Status', render: (v) => <StatusBadge tipo="viagem" valor={v.status} /> },
}

// Coluna "Ações" com o link para o detalhe; `rotulo(viagem)` deixa cada papel escolher o texto.
export const colunaAcoes = (base, rotulo = () => 'Ver detalhes') => ({
  titulo: 'Ações',
  render: (v) => (
    <Link className="lista-viagens__ver" to={`${base}/${v.id}`}>
      {rotulo(v)}
    </Link>
  ),
})
