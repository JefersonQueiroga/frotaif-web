import { useState } from 'react'
import { Plus, ArrowRight } from 'lucide-react'
import { Alert, Badge, Button, Input, Select, Tabs, Textarea } from '../components/ds/index.js'
import './Componentes.css'

// Catálogo dos componentes do Design System. Só aparece em desenvolvimento.
export default function Componentes() {
  const [nome, setNome] = useState('')
  const [veiculo, setVeiculo] = useState('')
  const [tipo, setTipo] = useState('')
  const [obs, setObs] = useState('')
  const [aba, setAba] = useState('todas')
  const [alertaAberto, setAlertaAberto] = useState(true)

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
    </main>
  )
}
