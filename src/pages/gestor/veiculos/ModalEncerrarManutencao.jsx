import { useState } from 'react'
import { encerrarManutencao } from '../../../api/manutencoes.js'
import AlertaErro from '../../../components/AlertaErro.jsx'
import useEnvio from '../../../components/useEnvio.js'
import { Button, Input, Modal } from '../../../components/ds/index.js'
import { formatarData, hojeISO, lerDecimal } from '../../../utils/formatar.js'
import { validarEncerramento } from './validarManutencao.js'
import './AbasVeiculo.css'

const ORDEM_CAMPOS = ['dataFim', 'custo']
const ID_CAMPO = { dataFim: 'encerrar-fim', custo: 'encerrar-custo' }

// Modal "Encerrar manutenção": data de fim e custo. O veículo volta para Disponível (quem muda é o backend).
export default function ModalEncerrarManutencao({ aberto, manutencao, onEncerrada, onFechar }) {
  const { enviando, erro, enviar, fechar } = useEnvio(aberto, onFechar)
  const [form, setForm] = useState({ dataFim: '', custo: '' })
  const [erros, setErros] = useState({})
  const [abertoAntes, setAbertoAntes] = useState(aberto)

  // Ao abrir, a data de fim começa em hoje e o resto limpo.
  if (aberto !== abertoAntes) {
    setAbertoAntes(aberto)
    if (aberto) {
      setForm({ dataFim: hojeISO(), custo: '' })
      setErros({})
    }
  }

  const alterar = (campo) => (evento) => {
    const valor = evento.target.value
    setForm((atual) => ({ ...atual, [campo]: valor }))
    setErros((atuais) => {
      if (!atuais[campo]) return atuais
      const { [campo]: _removido, ...resto } = atuais
      return resto
    })
  }

  function confirmar() {
    const novosErros = validarEncerramento(form, manutencao.dataInicio)
    setErros(novosErros)
    const primeiroComErro = ORDEM_CAMPOS.find((campo) => novosErros[campo])
    if (primeiroComErro) {
      document.getElementById(ID_CAMPO[primeiroComErro])?.focus()
      return
    }
    enviar(async () => {
      await encerrarManutencao(manutencao.id, { dataFim: form.dataFim, custo: lerDecimal(form.custo) })
      onEncerrada()
    })
  }

  return (
    <Modal
      aberto={aberto}
      titulo="Encerrar manutenção"
      onFechar={fechar}
      rodape={
        <>
          <Button variant="ghost" onClick={fechar} disabled={enviando}>
            Voltar
          </Button>
          <Button onClick={confirmar} disabled={enviando || !manutencao}>
            {enviando ? 'Enviando…' : 'Encerrar manutenção'}
          </Button>
        </>
      }
    >
      {manutencao && (
        <>
          <p className="aba-veiculo__dica">
            {manutencao.descricao ? `${manutencao.descricao} · ` : ''}iniciada em {formatarData(manutencao.dataInicio)}.
            O veículo volta para Disponível.
          </p>
          <AlertaErro erro={erro} />
          <div className="aba-veiculo__par">
            <Input
              id="encerrar-fim"
              label="Data de fim"
              type="date"
              value={form.dataFim}
              onChange={alterar('dataFim')}
              error={erros.dataFim}
            />
            <Input
              id="encerrar-custo"
              label="Custo (R$)"
              type="text"
              inputMode="decimal"
              placeholder="850,00"
              value={form.custo}
              onChange={alterar('custo')}
              error={erros.custo}
            />
          </div>
        </>
      )}
    </Modal>
  )
}
