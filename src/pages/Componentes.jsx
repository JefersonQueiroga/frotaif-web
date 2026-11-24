import { useState } from 'react'
import { Plus, ArrowRight } from 'lucide-react'
import {
  Alert,
  Badge,
  Button,
  Input,
  Modal,
  Select,
  Skeleton,
  Tabela,
  Tabs,
  Textarea,
} from '../components/ds/index.js'
import StatusBadge from '../components/StatusBadge.jsx'
import AlertaErro from '../components/AlertaErro.jsx'
import Vazio from '../components/Vazio.jsx'
import ModalConfirmar from '../components/ModalConfirmar.jsx'
import ModalMotivo from '../components/ModalMotivo.jsx'
import Pagina from '../components/layout/Pagina.jsx'
import { ApiError } from '../api/cliente.js'
import './Componentes.css'

// Catálogo dos componentes do Design System. Só aparece em desenvolvimento.
export default function Componentes() {
  const [nome, setNome] = useState('')
  const [veiculo, setVeiculo] = useState('')
  const [tipo, setTipo] = useState('')
  const [obs, setObs] = useState('')
  const [aba, setAba] = useState('todas')
  const [alertaAberto, setAlertaAberto] = useState(true)
  // Qual modal está aberto: null | 'simples' | 'conflito' | 'demora' | 'motivo'
  const [modal, setModal] = useState(null)
  const fecharModal = () => setModal(null)
  const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const linhas = [
    { id: 1, destino: 'Natal', saida: '28/11/2026 07:00', status: 'SOLICITADA', placa: 'RNX1A23' },
    { id: 2, destino: 'Mossoró', saida: '03/12/2026 06:00', status: 'APROVADA', placa: 'QGA3C45' },
    { id: 3, destino: 'Caicó', saida: '08/12/2026 08:00', status: 'EM_ANDAMENTO', placa: 'RNY2B34' },
  ]
  const colunas = [
    { titulo: 'Nº', render: (l) => `#${l.id}` },
    { titulo: 'Destino', render: (l) => l.destino },
    { titulo: 'Saída', render: (l) => l.saida },
    { titulo: 'Veículo', render: (l) => l.placa },
    { titulo: 'Status', render: (l) => <StatusBadge tipo="viagem" valor={l.status} /> },
  ]

  const opcoes = [
    { value: 'CARRO', label: 'Carro' },
    { value: 'VAN', label: 'Van' },
    { value: 'ONIBUS', label: 'Ônibus' },
  ]

  return (
    <main className="catalogo">
      <h1>Componentes do IFRN Design System</h1>

      <section className="catalogo__secao">
        <h2>Button</h2>
        <div className="catalogo__linha">
          <Button>Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Perigo</Button>
          <Button disabled>Desabilitado</Button>
        </div>
        <div className="catalogo__linha">
          <Button size="sm">Pequeno</Button>
          <Button size="md">Médio</Button>
          <Button size="lg">Grande</Button>
          <Button iconLeft={<Plus size={18} aria-hidden="true" />}>Com ícone</Button>
          <Button variant="secondary" iconRight={<ArrowRight size={18} aria-hidden="true" />}>
            Ícone à direita
          </Button>
        </div>
        <Button fullWidth>Largura total</Button>
      </section>

      <section className="catalogo__secao">
        <h2>Input, Select e Textarea</h2>
        <div className="catalogo__grade">
          <Input
            label="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite o nome"
            hint="Como aparece no cadastro."
          />
          <Input
            label="Destino (com erro)"
            value=""
            onChange={() => {}}
            error="Informe o destino."
          />
          <Input label="Desabilitado" value="Não editável" onChange={() => {}} disabled />
          <Select
            label="Veículo"
            options={opcoes}
            value={veiculo}
            onChange={(e) => setVeiculo(e.target.value)}
            placeholder="Selecione"
          />
          <Select
            label="Tipo (com erro)"
            options={['Carro', 'Van']}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            placeholder="Selecione"
            error="Escolha um tipo."
          />
          <Select label="Desabilitado" options={opcoes} value="VAN" onChange={() => {}} disabled />
          <Textarea
            label="Observações"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            hint="Opcional."
          />
          <Textarea
            label="Justificativa (com erro)"
            value=""
            onChange={() => {}}
            rows={3}
            error="A justificativa é obrigatória."
          />
        </div>
      </section>

      <section className="catalogo__secao">
        <h2>Alert</h2>
        <div className="catalogo__pilha">
          <Alert tone="info" title="Informação">Sua solicitação está em análise.</Alert>
          <Alert tone="success" title="Sucesso">Viagem aprovada.</Alert>
          <Alert tone="warning" title="Atenção">A CNH vence em 20 dias.</Alert>
          {alertaAberto && (
            <Alert tone="danger" title="Erro" onClose={() => setAlertaAberto(false)}>
              Não foi possível salvar. Tente de novo.
            </Alert>
          )}
        </div>
      </section>

      <section className="catalogo__secao">
        <h2>Badge</h2>
        <div className="catalogo__linha">
          <Badge>Neutro</Badge>
          <Badge tone="green">Aprovada</Badge>
          <Badge tone="red">Recusada</Badge>
          <Badge tone="amber">Solicitada</Badge>
          <Badge tone="blue">Em andamento</Badge>
          <Badge tone="solid">Concluída</Badge>
        </div>
      </section>

      <section className="catalogo__secao">
        <h2>Tabs</h2>
        <Tabs
          label="Filtro de viagens"
          value={aba}
          onChange={setAba}
          items={[
            { value: 'todas', label: 'Todas' },
            { value: 'solicitadas', label: 'Solicitadas' },
            { value: 'aprovadas', label: 'Aprovadas' },
          ]}
        />
        <p>Aba ativa: {aba}</p>
      </section>

      <section className="catalogo__secao">
        <h2>StatusBadge</h2>
        <div className="catalogo__linha">
          <StatusBadge tipo="viagem" valor="EM_ANDAMENTO" />
          <StatusBadge tipo="viagem" valor="CONCLUIDA" />
          <StatusBadge tipo="veiculo" valor="EM_MANUTENCAO" />
          <StatusBadge tipo="veiculo" valor="DISPONIVEL" />
          <StatusBadge tipo="manutencao" valor="PREVENTIVA" />
          <StatusBadge tipo="manutencao" valor="CORRETIVA" />
        </div>
      </section>

      <section className="catalogo__secao">
        <h2>Tabela</h2>
        <Tabela colunas={colunas} linhas={linhas} chave={(l) => l.id} />
      </section>

      <section className="catalogo__secao">
        <h2>Skeleton, Vazio e AlertaErro</h2>
        <Skeleton linhas={3} />
        <Vazio
          mensagem="Nenhuma viagem cadastrada."
          acao={<Button size="sm">Solicitar viagem</Button>}
        />
        <AlertaErro erro={new ApiError(409, 'Exemplo de conflito')} />
        <AlertaErro
          erro={new ApiError(0, 'Sem conexão com o servidor.')}
          onTentarDeNovo={() => {}}
        />
        <AlertaErro erro={null} />
      </section>

      <section className="catalogo__secao">
        <h2>Modais</h2>
        <div className="catalogo__linha">
          <Button onClick={() => setModal('simples')}>Confirmação simples</Button>
          <Button variant="danger" onClick={() => setModal('conflito')}>
            Confirmar com erro 409
          </Button>
          <Button variant="secondary" onClick={() => setModal('demora')}>
            Confirmar com demora de 1 s
          </Button>
          <Button variant="secondary" onClick={() => setModal('motivo')}>
            Pedir motivo
          </Button>
        </div>
        <Modal
          aberto={modal === 'simples'}
          titulo="Modal básico"
          onFechar={fecharModal}
          rodape={<Button onClick={fecharModal}>Entendi</Button>}
        >
          <p>Esc fecha, o foco fica preso aqui dentro e volta ao botão que abriu.</p>
          <Input label="Campo de exemplo" value="" onChange={() => {}} />
        </Modal>
        <ModalConfirmar
          aberto={modal === 'conflito'}
          titulo="Inativar veículo?"
          textoConfirmar="Inativar"
          tom="danger"
          onConfirmar={async () => {
            await esperar(300)
            throw new ApiError(409, 'Exemplo de conflito')
          }}
          onFechar={fecharModal}
        >
          <p>A chamada falha com 409: o modal continua aberto e mostra o erro.</p>
        </ModalConfirmar>
        <ModalConfirmar
          aberto={modal === 'demora'}
          titulo="Iniciar viagem?"
          textoConfirmar="Iniciar viagem"
          onConfirmar={() => esperar(1000)}
          onFechar={fecharModal}
        >
          <p>O botão fica em "Enviando…" por 1 segundo e o modal fecha.</p>
        </ModalConfirmar>
        <ModalMotivo
          aberto={modal === 'motivo'}
          titulo="Cancelar viagem?"
          textoConfirmar="Cancelar viagem"
          onConfirmar={() => esperar(500)}
          onFechar={fecharModal}
        />
      </section>

      <section className="catalogo__secao">
        <h2>Pagina</h2>
        <Pagina
          titulo="Viagens"
          subtitulo="Acompanhe os pedidos da frota."
          acoes={<Button iconLeft={<Plus size={18} aria-hidden="true" />}>Nova viagem</Button>}
        />
      </section>
    </main>
  )
}
