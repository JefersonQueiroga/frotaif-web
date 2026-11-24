import { useState } from 'react'
import { listarManutencoes } from '../../../api/manutencoes.js'
import AlertaErro from '../../../components/AlertaErro.jsx'
import { Alert, Button, Skeleton, Tabela } from '../../../components/ds/index.js'
import StatusBadge from '../../../components/StatusBadge.jsx'
import useCarregar from '../../../hooks/useCarregar.js'
import { formatarData, formatarMoeda } from '../../../utils/formatar.js'
import ModalAbrirManutencao from './ModalAbrirManutencao.jsx'
import ModalEncerrarManutencao from './ModalEncerrarManutencao.jsx'
import './AbasVeiculo.css'

// As abertas primeiro; depois as mais recentes.
const ordenar = (a, b) => Number(b.aberta) - Number(a.aberta) || b.dataInicio.localeCompare(a.dataInicio) || b.id - a.id

export default function AbaManutencoes({ veiculo, onVeiculoAlterado }) {
  const { dados, carregando, erro, recarregar } = useCarregar(() => listarManutencoes(veiculo.id), [veiculo.id])
  const [modalAbrir, setModalAbrir] = useState(false)
  const [encerrando, setEncerrando] = useState(null) // a manutenção aberta que o gestor quer encerrar
  const [sucesso, setSucesso] = useState(null)

  // Abrir ou encerrar muda o status do veículo: recarrega a aba e avisa o detalhe.
  function depoisDeAlterar(mensagem) {
    setSucesso(mensagem)
    recarregar()
    onVeiculoAlterado()
  }

  const podeAbrir = veiculo.status === 'DISPONIVEL'

  const colunas = [
    { titulo: 'Tipo', render: (m) => <StatusBadge tipo="manutencao" valor={m.tipo} /> },
    { titulo: 'Descrição', render: (m) => m.descricao || '—' },
    { titulo: 'Início', className: 'aba-veiculo__data', render: (m) => formatarData(m.dataInicio) },
    { titulo: 'Previsão', className: 'aba-veiculo__data', render: (m) => formatarData(m.dataPrevistaFim) },
    { titulo: 'Fim', className: 'aba-veiculo__data', render: (m) => formatarData(m.dataFim) },
    { titulo: 'Custo', className: 'aba-veiculo__numero', render: (m) => (m.custo != null ? formatarMoeda(m.custo) : '—') },
    {
      titulo: 'Ações',
      className: 'aba-veiculo__numero',
      render: (m) =>
        m.aberta && (
          <Button size="sm" onClick={() => setEncerrando(m)} aria-label={`Encerrar manutenção iniciada em ${formatarData(m.dataInicio)}`}>
            Encerrar
          </Button>
        ),
    },
  ]

  const linhas = dados ? [...dados].sort(ordenar) : []
  let tabela
  if (erro && !dados) tabela = <AlertaErro erro={erro} onTentarDeNovo={recarregar} />
  else if (carregando && !dados) tabela = <Skeleton linhas={3} />
  else if (linhas.length === 0) tabela = <p className="aba-veiculo__vazio">Nenhuma manutenção registrada.</p>
  else tabela = <Tabela colunas={colunas} linhas={linhas} chave={(m) => m.id} />

  return (
    <div className="aba-veiculo">
      {sucesso && (
        <Alert tone="success" onClose={() => setSucesso(null)}>
          {sucesso}
        </Alert>
      )}
      {erro && dados && <AlertaErro erro={erro} onTentarDeNovo={recarregar} />}
      <div className="aba-veiculo__barra">
        {!podeAbrir && (
          <p id="dica-abrir-manutencao" className="aba-veiculo__dica">
            Só é possível abrir manutenção de um veículo Disponível.
          </p>
        )}
        <Button
          onClick={() => setModalAbrir(true)}
          disabled={!podeAbrir}
          aria-describedby={podeAbrir ? undefined : 'dica-abrir-manutencao'}
        >
          Abrir manutenção
        </Button>
      </div>
      {tabela}

      <ModalAbrirManutencao
        aberto={modalAbrir}
        veiculo={veiculo}
        onAberta={(canceladas) =>
          depoisDeAlterar(
            `Manutenção aberta. ${veiculo.placa} está Em manutenção` +
              (canceladas > 0
                ? ` e ${canceladas} ${canceladas === 1 ? 'viagem foi cancelada' : 'viagens foram canceladas'}.`
                : '.'),
          )
        }
        onFechar={() => setModalAbrir(false)}
      />
      <ModalEncerrarManutencao
        aberto={encerrando !== null}
        manutencao={encerrando}
        onEncerrada={() => depoisDeAlterar(`Manutenção encerrada. ${veiculo.placa} voltou para Disponível.`)}
        onFechar={() => setEncerrando(null)}
      />
    </div>
  )
}
