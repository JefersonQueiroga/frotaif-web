import { useState } from 'react'
import useCamposFormulario, { focarPrimeiroErro } from '../../../hooks/useCamposFormulario.js'
import { encerrarManutencao } from '../../../api/manutencoes.js'
import AlertaErro from '../../../components/AlertaErro.jsx'
import useEnvio from '../../../components/useEnvio.js'
import { Button, Input, Modal } from '../../../components/ds/index.js'
import { formatarData, hojeISO, lerDecimal } from '../../../utils/formatar.js'
import { validarEncerramento } from './validarManutencao.js'
import './AbasVeiculo.css'

const ID_CAMPO = { dataFim: 'encerrar-fim', custo: 'encerrar-custo' }

// Modal "Encerrar manutenção": data de fim e custo. O veículo volta para Disponível (quem muda é o backend).
export default function ModalEncerrarManutencao({ aberto, manutencao, onEncerrada, onFechar }) {
  const { enviando, erro, enviar, fechar, limparErro } = useEnvio(aberto, onFechar)
  const { form, erros, setErros, alterar, reiniciar } = useCamposFormulario({ dataFim: '', custo: '' }, limparErro)
  const [abertoAntes, setAbertoAntes] = useState(aberto)

  // Ao abrir, a data de fim começa em hoje e o resto limpo.
  if (aberto !== abertoAntes) {
    setAbertoAntes(aberto)
    if (aberto) {
      reiniciar({ dataFim: hojeISO(), custo: '' })
    }
  }

  function confirmar() {
    const novosErros = validarEncerramento(form, manutencao.dataInicio)
    setErros(novosErros)
    if (focarPrimeiroErro(novosErros, ID_CAMPO)) return
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
