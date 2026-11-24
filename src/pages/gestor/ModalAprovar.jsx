import { useState } from 'react'
import { listarMotoristas } from '../../api/motoristas.js'
import { listarVeiculos } from '../../api/veiculos.js'
import AlertaErro from '../../components/AlertaErro.jsx'
import { Alert, Button, Modal, Select, Skeleton } from '../../components/ds/index.js'
import useCarregar from '../../hooks/useCarregar.js'
import useEnvio from '../../components/useEnvio.js'
import { aprovarViagem } from '../../api/viagens.js'
import { formatarData, formatarDataHora } from '../../utils/formatar.js'
import veiculosCompativeis from './veiculosCompativeis.js'
import './ModalAprovar.css'

// Carrega as listas só quando o modal está aberto e a viagem existe.
function carregarOpcoes() {
  return Promise.all([listarVeiculos({ status: 'DISPONIVEL' }), listarMotoristas()])
}

function ConteudoAprovar({ viagem, dados, erroCarga, carregando, recarregar, veiculoId, motoristaId, setVeiculoId, setMotoristaId, erroCampos, envioErro }) {
  if (erroCarga) return <AlertaErro erro={erroCarga} onTentarDeNovo={recarregar} />
  if (carregando && !dados) return <Skeleton linhas={3} />
  if (!dados) return null

  const [veiculos, motoristas] = dados
  const compativeis = veiculosCompativeis(veiculos, viagem.qtdPassageiros)
  const ativos = motoristas.filter((m) => m.ativo)

  const opcoesVeiculo = compativeis.map((v) => ({
    value: String(v.id),
    label: `${v.placa} · ${v.modelo} · ${v.capacidadePassageiros} lugares`,
  }))
  const opcoesMotorista = ativos.map((m) => ({
    value: String(m.id),
    label: `${m.nome} · CNH ${m.categoriaCnh} · validade ${formatarData(m.validadeCnh)}`,
  }))

  return (
    <>
      <AlertaErro erro={envioErro} />
      {compativeis.length === 0 && (
        <Alert tone="warning" title={`Nenhum veículo disponível comporta ${viagem.qtdPassageiros} passageiros`}>
          Rejeite o pedido com esse motivo ou aguarde a liberação de um veículo.
        </Alert>
      )}
      <Select
        id="aprovar-veiculo"
        label="Veículo"
        hint="Só aparecem veículos disponíveis com lugar para todos"
        placeholder="Selecione o veículo"
        options={opcoesVeiculo}
        value={veiculoId}
        onChange={(e) => setVeiculoId(e.target.value)}
        disabled={compativeis.length === 0}
        error={erroCampos.veiculo}
      />
      <Select
        id="aprovar-motorista"
        label="Motorista"
        placeholder="Selecione o motorista"
        options={opcoesMotorista}
        value={motoristaId}
        onChange={(e) => setMotoristaId(e.target.value)}
        error={erroCampos.motorista}
      />
      <p className="modal-aprovar__nota">
        Conflito de horário e validade ou categoria da CNH são conferidos pela API ao confirmar.
      </p>
    </>
  )
}

// Modal de aprovação: o gestor escolhe veículo e motorista. Não usa ModalConfirmar porque precisa de
// campos próprios; o envio (Enviando…, erro no modal, anti-duplo-clique) vem do useEnvio.
export default function ModalAprovar({ aberto, viagem, onAprovado, onFechar }) {
  const { enviando, erro, enviar, fechar, limparErro } = useEnvio(aberto, onFechar)
  const [veiculoId, setVeiculoId] = useState('')
  const [motoristaId, setMotoristaId] = useState('')
  const [erroCampos, setErroCampos] = useState({})
  const [abertoAntes, setAbertoAntes] = useState(aberto)

  // Ao abrir de novo começa sem seleção nem erros (ajuste de estado durante a renderização).
  if (aberto !== abertoAntes) {
    setAbertoAntes(aberto)
    if (aberto) {
      setVeiculoId('')
      setMotoristaId('')
      setErroCampos({})
    }
  }

  // `aberto` entra nas dependências para recarregar as listas a cada abertura (a frota pode ter mudado).
  const { dados, carregando, erro: erroCarga, recarregar } = useCarregar(
    () => (aberto ? carregarOpcoes() : Promise.resolve(null)),
    [aberto],
  )

  function trocarVeiculo(valor) {
    setVeiculoId(valor)
    limparErro()
    setErroCampos((atual) => ({ ...atual, veiculo: undefined }))
  }
  function trocarMotorista(valor) {
    setMotoristaId(valor)
    limparErro()
    setErroCampos((atual) => ({ ...atual, motorista: undefined }))
  }

  function confirmar() {
    const novos = {}
    if (!veiculoId) novos.veiculo = 'Escolha o veículo.'
    if (!motoristaId) novos.motorista = 'Escolha o motorista.'
    setErroCampos(novos)
    if (Object.keys(novos).length > 0) return
    enviar(async () => {
      await aprovarViagem(viagem.id, { veiculoId: Number(veiculoId), motoristaId: Number(motoristaId) })
      await onAprovado()
    })
  }

  const pronto = Boolean(dados) && !erroCarga

  return (
    <Modal
      aberto={aberto}
      titulo={viagem ? `Aprovar a viagem #${viagem.id}` : 'Aprovar viagem'}
      onFechar={fechar}
      rodape={
        <>
          <Button variant="ghost" onClick={fechar} disabled={enviando}>
            Voltar
          </Button>
          <Button onClick={confirmar} disabled={enviando || !pronto}>
            {enviando ? 'Enviando…' : 'Confirmar aprovação'}
          </Button>
        </>
      }
    >
      {viagem && (
        <>
          <p className="modal-aprovar__resumo">
            {viagem.destino} · {formatarDataHora(viagem.saida)} a {formatarDataHora(viagem.retornoPrevisto)} ·{' '}
            {viagem.qtdPassageiros} passageiros
          </p>
          <ConteudoAprovar
            viagem={viagem}
            dados={dados}
            erroCarga={erroCarga}
            carregando={carregando}
            recarregar={recarregar}
            veiculoId={veiculoId}
            motoristaId={motoristaId}
            setVeiculoId={trocarVeiculo}
            setMotoristaId={trocarMotorista}
            erroCampos={erroCampos}
            envioErro={erro}
          />
        </>
      )}
    </Modal>
  )
}
