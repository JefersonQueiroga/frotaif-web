import { useState } from 'react'
import { atualizarMotorista, cadastrarMotorista } from '../../../api/motoristas.js'
import AlertaErro from '../../../components/AlertaErro.jsx'
import useEnvio from '../../../components/useEnvio.js'
import useCamposFormulario, { focarPrimeiroErro } from '../../../hooks/useCamposFormulario.js'
import { Alert, Button, Input, Modal, Select } from '../../../components/ds/index.js'
import { formatarCpf } from '../../../utils/formatar.js'
import { somenteDigitos } from '../../../utils/validar.js'
import { validarMotorista } from './validarMotorista.js'
import './ModalMotorista.css'

const FORM_VAZIO = { nome: '', cpf: '', registroCnh: '', categoriaCnh: '', validadeCnh: '' }
const CATEGORIAS = ['B', 'C', 'D', 'E'].map((c) => ({ value: c, label: c }))
const ID_CAMPO = {
  nome: 'motorista-nome',
  cpf: 'motorista-cpf',
  registroCnh: 'motorista-registro',
  categoriaCnh: 'motorista-categoria',
  validadeCnh: 'motorista-validade',
}

// Aplica a máscara 000.000.000-00 enquanto a pessoa digita (a API recebe só os dígitos).
function mascararCpf(texto) {
  const d = somenteDigitos(texto).slice(0, 11)
  if (d.length > 9) return formatarCpf(d)
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`
  return d
}

function formDe(motorista) {
  if (!motorista) return FORM_VAZIO
  return {
    nome: motorista.nome,
    cpf: mascararCpf(motorista.cpf),
    registroCnh: motorista.registroCnh,
    categoriaCnh: motorista.categoriaCnh,
    validadeCnh: motorista.validadeCnh,
  }
}

// Modal de cadastro (sem `motorista`) e de edição (com `motorista`).
export default function ModalMotorista({ aberto, motorista, onSalvo, onFechar }) {
  const { enviando, erro, enviar, fechar, limparErro } = useEnvio(aberto, onFechar)
  const { form, erros, setErros, definir, alterar, reiniciar } = useCamposFormulario(formDe(motorista), limparErro)
  const [abertoAntes, setAbertoAntes] = useState(aberto)
  const edicao = Boolean(motorista)

  // Ao abrir (de novo) começa com os dados do motorista escolhido, ou vazio no cadastro.
  if (aberto !== abertoAntes) {
    setAbertoAntes(aberto)
    if (aberto) reiniciar(formDe(motorista))
  }

  const dirigeVanOnibus = form.categoriaCnh === 'D' || form.categoriaCnh === 'E'

  function salvar() {
    const novosErros = validarMotorista(form)
    setErros(novosErros)
    if (focarPrimeiroErro(novosErros, ID_CAMPO)) return
    const dados = {
      nome: form.nome.trim(),
      cpf: somenteDigitos(form.cpf),
      registroCnh: somenteDigitos(form.registroCnh),
      categoriaCnh: form.categoriaCnh,
      validadeCnh: form.validadeCnh,
    }
    enviar(async () => {
      if (edicao) await atualizarMotorista(motorista.id, dados)
      else await cadastrarMotorista(dados)
      onSalvo(edicao)
    })
  }

  return (
    <Modal
      aberto={aberto}
      titulo={edicao ? `Editar ${motorista.nome}` : 'Novo motorista'}
      onFechar={fechar}
      rodape={
        <>
          <Button variant="ghost" onClick={fechar} disabled={enviando}>
            Voltar
          </Button>
          <Button onClick={salvar} disabled={enviando}>
            {enviando ? 'Enviando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <AlertaErro erro={erro} />
      {!edicao && (
        <Alert tone="info">
          Motoristas cadastrados aqui não ganham login no FrotaIF. Eles podem ser alocados em viagens, mas não
          conseguem iniciar nem concluir.
        </Alert>
      )}
      <Input
        id="motorista-nome"
        label="Nome completo"
        value={form.nome}
        onChange={alterar('nome')}
        error={erros.nome}
      />
      <div className="modal-motorista__par">
        <Input
          id="motorista-cpf"
          label="CPF"
          placeholder="000.000.000-00"
          inputMode="numeric"
          maxLength={14}
          className="modal-motorista__mono"
          value={form.cpf}
          onChange={(e) => definir('cpf', mascararCpf(e.target.value))}
          error={erros.cpf}
        />
        <Input
          id="motorista-registro"
          label="Registro da CNH"
          inputMode="numeric"
          maxLength={11}
          className="modal-motorista__mono"
          value={form.registroCnh}
          onChange={(e) => definir('registroCnh', somenteDigitos(e.target.value))}
          error={erros.registroCnh}
        />
        <Select
          id="motorista-categoria"
          label="Categoria da CNH"
          placeholder="Escolha"
          options={CATEGORIAS}
          value={form.categoriaCnh}
          onChange={alterar('categoriaCnh')}
          error={erros.categoriaCnh}
        />
        <Input
          id="motorista-validade"
          label="Validade da CNH"
          type="date"
          value={form.validadeCnh}
          onChange={alterar('validadeCnh')}
          error={erros.validadeCnh}
        />
      </div>
      {form.categoriaCnh && (
        <Alert tone="info">
          {dirigeVanOnibus
            ? `Categoria ${form.categoriaCnh}: pode dirigir carros, vans e ônibus.`
            : `Categoria ${form.categoriaCnh}: dirige carros. Van e ônibus exigem D ou E.`}
        </Alert>
      )}
    </Modal>
  )
}
