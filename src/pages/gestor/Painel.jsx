import { useState } from 'react'
import { Link } from 'react-router-dom'
import { listarCnhVencendo, listarMotoristas } from '../../api/motoristas.js'
import { listarVeiculos } from '../../api/veiculos.js'
import { listarViagens } from '../../api/viagens.js'
import AlertaErro from '../../components/AlertaErro.jsx'
import { Badge, Select, Skeleton, Tabela } from '../../components/ds/index.js'
import Pagina from '../../components/layout/Pagina.jsx'
import StatusBadge from '../../components/StatusBadge.jsx'
import Vazio from '../../components/Vazio.jsx'
import useCarregar from '../../hooks/useCarregar.js'
import { diasEntre, formatarData, formatarDataHora, hojeISO } from '../../utils/formatar.js'
import { cnhVencida, situacaoMotorista } from '../../utils/status.js'
import './Painel.css'

const OPCOES_DIAS = [15, 30, 60, 90].map((n) => ({ value: String(n), label: `${n} dias` }))
const STATUS_VEICULO = ['DISPONIVEL', 'EM_VIAGEM', 'EM_MANUTENCAO', 'INATIVO']
const DIAS_PRAZO_CURTO = 7
const MAX_VEICULOS_NO_CARTAO = 3

// Mostra o carregamento ou o erro de um bloco; `children` só aparece quando todos os dados chegaram.
// Cada bloco tem o seu próprio useCarregar, então uma falha aqui não derruba o resto do painel.
function Bloco({ estados, linhas = 2, children }) {
  const comErro = estados.find((e) => e.erro)
  if (comErro) return <AlertaErro erro={comErro.erro} onTentarDeNovo={comErro.recarregar} />
  if (estados.some((e) => !e.dados)) return <Skeleton linhas={linhas} />
  return children
}

function CartaoKpi({ titulo, tom, estados, nota, children }) {
  return (
    <div className={`painel__kpi painel__kpi--${tom}`}>
      <span className="painel__kpi-titulo">{titulo}</span>
      <Bloco estados={estados} linhas={1}>
        <span className="painel__kpi-valor">{children}</span>
        {nota && <span className="painel__kpi-nota">{nota}</span>}
      </Bloco>
    </div>
  )
}

// Quantos dias faltam para a saída: vira o "Prazo" da tabela (âmbar quando está perto).
function PrazoSaida({ saida, hoje }) {
  const dias = diasEntre(hoje, saida.slice(0, 10))
  if (dias < 0) return <Badge tone="red">Atrasada</Badge>
  const texto = dias === 0 ? 'hoje' : dias === 1 ? 'amanhã' : `em ${dias} dias`
  return <Badge tone={dias <= DIAS_PRAZO_CURTO ? 'amber' : 'neutral'}>{texto}</Badge>
}

function ItemMotorista({ motorista, hoje }) {
  const { rotulo, tom } = situacaoMotorista(motorista, hoje)
  return (
    <li className="painel__motorista">
      <div className="painel__motorista-dados">
        <span className="painel__motorista-nome">{motorista.nome}</span>
        <span className="painel__motorista-info">
          Categoria {motorista.categoriaCnh} · validade {formatarData(motorista.validadeCnh)}
        </span>
      </div>
      <Badge tone={tom}>{rotulo}</Badge>
    </li>
  )
}

function ListaMotoristas({ estado, motoristas, hoje, vazio }) {
  return (
    <div className="painel__card">
      <Bloco estados={[estado]}>
        {motoristas.length === 0 ? (
          <p className="painel__vazio">{vazio}</p>
        ) : (
          <ul className="painel__lista">
            {motoristas.map((m) => (
              <ItemMotorista key={m.id} motorista={m} hoje={hoje} />
            ))}
          </ul>
        )}
      </Bloco>
    </div>
  )
}

export default function Painel() {
  // Muda só à meia-noite; `hoje` entra nas dependências de "Viagens hoje" para refazer a busca nesse caso.
  const hoje = hojeISO()
  const [dias, setDias] = useState('30')

  const pendentes = useCarregar(() => listarViagens({ status: 'SOLICITADA' }))
  const viagensHoje = useCarregar(() => listarViagens({ inicio: hoje, fim: hoje }), [hoje])
  const veiculos = useCarregar(() => listarVeiculos({}))
  // A lista sem status não traz inativos; o cartão "Inativo" precisa de uma chamada à parte.
  const inativos = useCarregar(() => listarVeiculos({ status: 'INATIVO' }))
  const motoristas = useCarregar(() => listarMotoristas())
  // Janela fixa de 30 dias para o cartão de cima; não muda com o Select do bloco CNH.
  const vencendo30 = useCarregar(() => listarCnhVencendo(30))
  const vencendo = useCarregar(() => listarCnhVencendo(Number(dias)), [dias])

  const vencidas = (motoristas.dados ?? []).filter((m) => cnhVencida(m, hoje))
  const ativos = veiculos.dados ?? []
  const disponiveis = ativos.filter((v) => v.status === 'DISPONIVEL').length

  const colunas = [
    { titulo: 'Nº', render: (v) => <span className="painel__id">#{v.id}</span> },
    { titulo: 'Destino', render: (v) => <strong>{v.destino}</strong> },
    { titulo: 'Solicitante', render: (v) => v.solicitante.nome },
    { titulo: 'Saída', className: 'painel__data', render: (v) => formatarDataHora(v.saida) },
    { titulo: 'Pass.', className: 'painel__numero', render: (v) => v.qtdPassageiros },
    { titulo: 'Prazo', render: (v) => <PrazoSaida saida={v.saida} hoje={hoje} /> },
    {
      titulo: 'Ações',
      render: (v) => (
        <Link className="painel__analisar" to={`/gestor/viagens/${v.id}`}>
          Analisar
        </Link>
      ),
    },
  ]

  return (
    <Pagina titulo="Painel" subtitulo={`Hoje, ${formatarData(hoje)}`}>
      <div className="painel__kpis">
        <CartaoKpi titulo="Aguardando aprovação" tom="amber" estados={[pendentes]} nota="Analise os pedidos abaixo">
          {pendentes.dados?.length}
        </CartaoKpi>
        <CartaoKpi titulo="Viagens hoje" tom="blue" estados={[viagensHoje]}>
          {viagensHoje.dados?.length}
        </CartaoKpi>
        <CartaoKpi titulo="Veículos disponíveis" tom="green" estados={[veiculos]}>
          {disponiveis} <span className="painel__kpi-de">de {ativos.length} ativos</span>
        </CartaoKpi>
        <CartaoKpi
          titulo="CNH vencida ou vencendo"
          tom="red"
          estados={[motoristas, vencendo30]}
          nota="vencidas ou nos próximos 30 dias"
        >
          {vencidas.length + (vencendo30.dados?.length ?? 0)}
        </CartaoKpi>
      </div>

      <section className="painel__secao">
        <div className="painel__titulo-secao">
          <h2>Pedidos aguardando aprovação</h2>
          <Link to="/gestor/viagens">Ver todas as viagens</Link>
        </div>
        <Bloco estados={[pendentes]} linhas={3}>
          {pendentes.dados?.length === 0 ? (
            <Vazio mensagem="Nenhum pedido aguardando aprovação." />
          ) : (
            <Tabela colunas={colunas} linhas={pendentes.dados ?? []} chave={(v) => v.id} />
          )}
        </Bloco>
      </section>

      <div className="painel__duas-colunas">
        <section className="painel__secao">
          <div className="painel__titulo-secao">
            <h2>Motoristas com CNH vencendo</h2>
            <Select
              id="painel-dias"
              label="Janela"
              options={OPCOES_DIAS}
              value={dias}
              onChange={(e) => setDias(e.target.value)}
              className="painel__janela"
            />
          </div>
          <ListaMotoristas
            estado={vencendo}
            motoristas={vencendo.dados ?? []}
            hoje={hoje}
            vazio="Nenhuma CNH vence nessa janela."
          />

          <h3 className="painel__subtitulo">Já vencidas</h3>
          <ListaMotoristas
            estado={motoristas}
            motoristas={vencidas}
            hoje={hoje}
            vazio="Nenhum motorista com CNH vencida."
          />
          <Link to="/gestor/motoristas">Abrir motoristas</Link>
        </section>

        <section className="painel__secao">
          <h2>Veículos por status</h2>
          {/* Carregando/erro fica fora dos links: um botão "Tentar de novo" dentro de <a> é HTML inválido. */}
          <Bloco estados={[veiculos, inativos]} linhas={3}>
            <div className="painel__veiculos">
              {STATUS_VEICULO.map((status) => {
                const lista = status === 'INATIVO' ? (inativos.dados ?? []) : ativos.filter((v) => v.status === status)
                const outros = lista.length - MAX_VEICULOS_NO_CARTAO
                return (
                  <Link key={status} className="painel__veiculo" to={`/gestor/veiculos?status=${status}`}>
                    <div className="painel__veiculo-topo">
                      <StatusBadge tipo="veiculo" valor={status} />
                      <strong className="painel__veiculo-qtd">{lista.length}</strong>
                    </div>
                    {lista.slice(0, MAX_VEICULOS_NO_CARTAO).map((v) => (
                      <span key={v.id} className="painel__veiculo-item">
                        {v.marca} {v.modelo} <span className="painel__placa">{v.placa}</span>
                      </span>
                    ))}
                    {outros > 0 && (
                      <span className="painel__veiculo-mais">
                        + {outros} {outros === 1 ? 'outro' : 'outros'}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </Bloco>
        </section>
      </div>
    </Pagina>
  )
}
