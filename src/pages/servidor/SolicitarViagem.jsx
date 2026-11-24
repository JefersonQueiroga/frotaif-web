import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { solicitarViagem } from '../../api/viagens.js'
import AlertaErro from '../../components/AlertaErro.jsx'
import { Alert, Button, Input, Textarea } from '../../components/ds/index.js'
import Pagina from '../../components/layout/Pagina.jsx'
import validarSolicitacao from './validarSolicitacao.js'
import './SolicitarViagem.css'

const FORM_VAZIO = { destino: '', qtdPassageiros: '', finalidade: '', saida: '', retornoPrevisto: '' }

// Ordem em que os campos aparecem na tela: o foco vai para o primeiro com erro nessa ordem.
const ORDEM_CAMPOS = ['destino', 'qtdPassageiros', 'finalidade', 'saida', 'retornoPrevisto']
const ID_CAMPO = {
  destino: 'nova-destino',
  qtdPassageiros: 'nova-passageiros',
  finalidade: 'nova-finalidade',
  saida: 'nova-saida',
  retornoPrevisto: 'nova-retorno',
}

export default function SolicitarViagem() {
  const navigate = useNavigate()
  const [form, setForm] = useState(FORM_VAZIO)
  const [erros, setErros] = useState({})
  const [erroApi, setErroApi] = useState(null)
  const [enviando, setEnviando] = useState(false)
  // O ref bloqueia o segundo clique mesmo antes de o React redesenhar o botão como desabilitado.
  const emAndamento = useRef(false)

  // Digitar num campo atualiza o valor e apaga só o erro desse campo.
  const alterar = (campo) => (evento) => {
    const valor = evento.target.value
    setForm((atual) => ({ ...atual, [campo]: valor }))
    setErros((atuais) => {
      if (!atuais[campo]) return atuais
      const { [campo]: _removido, ...resto } = atuais
      return resto
    })
  }

  async function enviar(evento) {
    evento?.preventDefault() // "Tentar de novo" chama sem evento
    if (emAndamento.current) return

    const novosErros = validarSolicitacao(form)
    setErros(novosErros)
    setErroApi(null)
    const primeiroComErro = ORDEM_CAMPOS.find((campo) => novosErros[campo])
    if (primeiroComErro) {
      document.getElementById(ID_CAMPO[primeiroComErro])?.focus()
      return
    }

    emAndamento.current = true
    setEnviando(true)
    try {
      const viagem = await solicitarViagem({
        destino: form.destino.trim(),
        finalidade: form.finalidade.trim(),
        saida: form.saida,
        retornoPrevisto: form.retornoPrevisto,
        qtdPassageiros: Number(form.qtdPassageiros), // a API espera número, não texto
      })
      navigate('/servidor/viagens', { state: { sucesso: `Viagem #${viagem.id} enviada para aprovação.` } })
    } catch (e) {
      // O formulário continua preenchido para a pessoa corrigir e tentar de novo.
      setErroApi(e)
      emAndamento.current = false
      setEnviando(false)
    }
  }

  const quantidadeErros = Object.keys(erros).length

  return (
    <Pagina titulo="Solicitar viagem">
      <form className="solicitar-viagem" onSubmit={enviar} noValidate>
        <Alert tone="info" title="Antecedência">
          Peça com antecedência; pedidos em cima da hora são recusados.
        </Alert>

        {quantidadeErros >= 2 && (
          <Alert tone="danger" title={`Faltam corrigir ${quantidadeErros} campos`}>
            Os campos com problema estão marcados abaixo.
          </Alert>
        )}
        <AlertaErro erro={erroApi} onTentarDeNovo={enviar} />

        <section className="solicitar-viagem__campos">
          <Input
            id="nova-destino"
            label="Destino"
            placeholder="Ex.: Natal"
            value={form.destino}
            onChange={alterar('destino')}
            error={erros.destino}
          />
          <Input
            id="nova-passageiros"
            label="Nº de passageiros"
            inputMode="numeric"
            hint="Contando com você"
            value={form.qtdPassageiros}
            onChange={alterar('qtdPassageiros')}
            error={erros.qtdPassageiros}
          />
          <Textarea
            id="nova-finalidade"
            label="Finalidade"
            placeholder="Ex.: Reunião na Reitoria sobre o PDI"
            rows={3}
            className="solicitar-viagem__largo"
            value={form.finalidade}
            onChange={alterar('finalidade')}
            error={erros.finalidade}
          />
          <Input
            id="nova-saida"
            label="Saída"
            type="datetime-local"
            value={form.saida}
            onChange={alterar('saida')}
            error={erros.saida}
          />
          <Input
            id="nova-retorno"
            label="Retorno previsto"
            type="datetime-local"
            value={form.retornoPrevisto}
            onChange={alterar('retornoPrevisto')}
            error={erros.retornoPrevisto}
          />
        </section>

        <div className="solicitar-viagem__botoes">
          <Button type="submit" size="lg" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar solicitação'}
          </Button>
          <Button size="lg" variant="ghost" onClick={() => navigate('/servidor/viagens')}>
            Cancelar
          </Button>
        </div>
      </form>
    </Pagina>
  )
}
