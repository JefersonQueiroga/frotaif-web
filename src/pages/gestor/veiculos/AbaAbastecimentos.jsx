import { useRef, useState } from 'react'
import { listarAbastecimentos, registrarAbastecimento } from '../../../api/abastecimentos.js'
import AlertaErro from '../../../components/AlertaErro.jsx'
import { Alert, Button, Input, Skeleton, Tabela } from '../../../components/ds/index.js'
import useCamposFormulario, { focarPrimeiroErro } from '../../../hooks/useCamposFormulario.js'
import useCarregar from '../../../hooks/useCarregar.js'
import { formatarData, formatarKm, formatarLitros, formatarMoeda, hojeISO, lerDecimal } from '../../../utils/formatar.js'
import validarAbastecimento from './validarAbastecimento.js'
import './AbasVeiculo.css'

const FORM_VAZIO = { data: '', litros: '', valorTotal: '', kmNoAbastecimento: '', posto: '' }

// Ids na ordem dos campos na tela: o foco vai para o primeiro com erro nessa ordem.
const ID_CAMPO = {
  data: 'abast-data',
  litros: 'abast-litros',
  valorTotal: 'abast-valor',
  kmNoAbastecimento: 'abast-km',
}

const COLUNAS = [
  { titulo: 'Data', className: 'aba-veiculo__data', render: (a) => formatarData(a.data) },
  { titulo: 'Posto', render: (a) => a.posto || '—' },
  { titulo: 'Litros', className: 'tabela__numero', render: (a) => formatarLitros(a.litros) },
  { titulo: 'Valor', className: 'tabela__numero', render: (a) => formatarMoeda(a.valorTotal) },
  { titulo: 'Km', className: 'tabela__numero', render: (a) => formatarKm(a.kmNoAbastecimento) },
]

// Os mais recentes primeiro (mesma data: o registrado por último).
const maisRecentesPrimeiro = (a, b) => b.data.localeCompare(a.data) || b.id - a.id

export default function AbaAbastecimentos({ veiculo, onVeiculoAlterado }) {
  const { dados, carregando, erro, recarregar } = useCarregar(() => listarAbastecimentos(veiculo.id), [veiculo.id])
  const [erroApi, setErroApi] = useState(null)
  const { form, erros, setErros, alterar, reiniciar } = useCamposFormulario(FORM_VAZIO, () => setErroApi(null))
  const [sucesso, setSucesso] = useState(null)
  const [enviando, setEnviando] = useState(false)
  // O ref bloqueia o segundo clique mesmo antes de o React redesenhar o botão como desabilitado.
  const emAndamento = useRef(false)

  async function enviar(evento) {
    evento?.preventDefault() // "Tentar de novo" chama sem evento
    if (emAndamento.current) return

    const novosErros = validarAbastecimento(form, hojeISO())
    setErros(novosErros)
    setErroApi(null)
    setSucesso(null)
    if (focarPrimeiroErro(novosErros, ID_CAMPO)) return

    emAndamento.current = true
    setEnviando(true)
    try {
      await registrarAbastecimento(veiculo.id, {
        data: form.data,
        litros: lerDecimal(form.litros), // "35,5" vira o número 35.5
        valorTotal: lerDecimal(form.valorTotal),
        kmNoAbastecimento: Number(form.kmNoAbastecimento),
        posto: form.posto.trim() || undefined, // opcional: vazio nem vai no corpo
      })
      reiniciar()
      setSucesso('Abastecimento registrado.')
      recarregar()
      onVeiculoAlterado() // a quilometragem do veículo pode ter mudado
    } catch (e) {
      setErroApi(e) // o formulário continua preenchido para corrigir e tentar de novo
    } finally {
      emAndamento.current = false
      setEnviando(false)
    }
  }

  const quantidadeErros = Object.keys(erros).length
  const linhas = dados ? [...dados].sort(maisRecentesPrimeiro) : []

  let tabela
  if (erro && !dados) tabela = <AlertaErro erro={erro} onTentarDeNovo={recarregar} />
  else if (carregando && !dados) tabela = <Skeleton linhas={4} />
  else if (linhas.length === 0) tabela = <p className="aba-veiculo__vazio">Nenhum abastecimento registrado.</p>
  else tabela = <Tabela colunas={COLUNAS} linhas={linhas} chave={(a) => a.id} />

  return (
    <div className="aba-veiculo">
      {sucesso && (
        <Alert tone="success" onClose={() => setSucesso(null)}>
          {sucesso}
        </Alert>
      )}
      {erro && dados && <AlertaErro erro={erro} onTentarDeNovo={recarregar} />}
      <div className="aba-veiculo__abastecimentos">
        <div className="aba-veiculo__tabela">{tabela}</div>
        <form className="aba-veiculo__form" onSubmit={enviar} noValidate>
          <h2 className="aba-veiculo__form-titulo">Novo abastecimento</h2>
          {quantidadeErros >= 2 && (
            <Alert tone="danger" title={`Faltam corrigir ${quantidadeErros} campos`}>
              Os campos com problema estão marcados abaixo.
            </Alert>
          )}
          <AlertaErro erro={erroApi} onTentarDeNovo={enviar} />
          <Input
            id="abast-data"
            label="Data"
            type="date"
            max={hojeISO()}
            value={form.data}
            onChange={alterar('data')}
            error={erros.data}
          />
          <div className="aba-veiculo__par">
            <Input
              id="abast-litros"
              label="Litros"
              type="text"
              inputMode="decimal"
              placeholder="35,5"
              value={form.litros}
              onChange={alterar('litros')}
              error={erros.litros}
            />
            <Input
              id="abast-valor"
              label="Valor total (R$)"
              type="text"
              inputMode="decimal"
              placeholder="223,65"
              value={form.valorTotal}
              onChange={alterar('valorTotal')}
              error={erros.valorTotal}
            />
          </div>
          <Input
            id="abast-km"
            label="Km no abastecimento"
            inputMode="numeric"
            hint={`Km atual do veículo: ${formatarKm(veiculo.quilometragemAtual)}`}
            value={form.kmNoAbastecimento}
            onChange={alterar('kmNoAbastecimento')}
            error={erros.kmNoAbastecimento}
          />
          <Input id="abast-posto" label="Posto" hint="Opcional" value={form.posto} onChange={alterar('posto')} />
          <Button type="submit" fullWidth disabled={enviando}>
            {enviando ? 'Enviando…' : 'Registrar abastecimento'}
          </Button>
        </form>
      </div>
    </div>
  )
}
