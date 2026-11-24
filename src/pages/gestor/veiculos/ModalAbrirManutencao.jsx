import { useEffect, useState } from 'react'
import { abrirManutencao } from '../../../api/manutencoes.js'
import { listarViagens } from '../../../api/viagens.js'
import AlertaErro from '../../../components/AlertaErro.jsx'
import useEnvio from '../../../components/useEnvio.js'
import useCamposFormulario, { focarPrimeiroErro } from '../../../hooks/useCamposFormulario.js'
import { Alert, Button, Input, Modal, Select } from '../../../components/ds/index.js'
import { formatarDataHora } from '../../../utils/formatar.js'
import { validarManutencao } from './validarManutencao.js'
import viagensAfetadasPelaManutencao from './viagensAfetadas.js'
import './AbasVeiculo.css'

const FORM_VAZIO = { tipo: 'PREVENTIVA', descricao: '', dataInicio: '', dataPrevistaFim: '' }
const TIPOS = [
  { value: 'PREVENTIVA', label: 'Preventiva' },
  { value: 'CORRETIVA', label: 'Corretiva' },
]
const ID_CAMPO = { tipo: 'manut-tipo', dataInicio: 'manut-inicio', dataPrevistaFim: 'manut-previsao' }

// Modal "Abrir manutenção". Ao escolher as datas, mostra uma PRÉVIA das viagens aprovadas deste veículo
// que serão canceladas. É só uma prévia para o gestor decidir: quem cancela de verdade é o backend.
export default function ModalAbrirManutencao({ aberto, veiculo, onAberta, onFechar }) {
  const { enviando, erro, enviar, fechar, limparErro } = useEnvio(aberto, onFechar)
  const { form, erros, setErros, alterar, reiniciar } = useCamposFormulario(FORM_VAZIO, limparErro)
  const [abertoAntes, setAbertoAntes] = useState(aberto)
  // Resultado da prévia, com a "chave" (datas + tentativa) da consulta que o gerou.
  const [previa, setPrevia] = useState({ chave: null, viagens: [], erro: null })
  const [tentativa, setTentativa] = useState(0)

  // Ao abrir de novo começa limpo (ajuste de estado durante a renderização, como no useEnvio).
  if (aberto !== abertoAntes) {
    setAbertoAntes(aberto)
    if (aberto) {
      reiniciar()
      setPrevia({ chave: null, viagens: [], erro: null })
    }
  }

  const { dataInicio, dataPrevistaFim } = form
  // Só consulta com as duas datas preenchidas e a previsão não antes do início.
  const datasValidas = Boolean(dataInicio) && Boolean(dataPrevistaFim) && dataPrevistaFim >= dataInicio
  const chave = aberto && datasValidas ? `${veiculo.id}|${dataInicio}|${dataPrevistaFim}|${tentativa}` : null

  useEffect(() => {
    if (!chave) return undefined
    // Se as datas mudarem antes da resposta chegar, a limpeza marca esta consulta como velha e a
    // resposta atrasada é ignorada (senão ela poderia sobrescrever a prévia das datas novas).
    let descartada = false
    // O filtro `fim` da API olha só a saída; o critério completo (volta depois do início) é aplicado aqui.
    listarViagens({ status: 'APROVADA', fim: dataPrevistaFim })
      .then((viagens) => {
        if (!descartada) {
          setPrevia({ chave, viagens: viagensAfetadasPelaManutencao(viagens, veiculo.id, dataInicio), erro: null })
        }
      })
      .catch((e) => {
        if (!descartada) setPrevia({ chave, viagens: [], erro: e })
      })
    return () => {
      descartada = true
    }
  }, [chave, veiculo.id, dataInicio, dataPrevistaFim])

  const consultando = chave !== null && previa.chave !== chave
  const previaPronta = chave !== null && previa.chave === chave
  const afetadas = previaPronta && !previa.erro ? previa.viagens : []
  const total = afetadas.length

  function confirmar() {
    const novosErros = validarManutencao(form)
    setErros(novosErros)
    if (focarPrimeiroErro(novosErros, ID_CAMPO)) return
    enviar(async () => {
      await abrirManutencao(veiculo.id, {
        tipo: form.tipo,
        descricao: form.descricao.trim() || undefined, // opcional
        dataInicio: form.dataInicio,
        dataPrevistaFim: form.dataPrevistaFim,
      })
      // Só afirmamos a contagem quando a prévia deu certo; senão `null` e a tela usa uma mensagem neutra.
      onAberta(previaPronta && !previa.erro ? total : null)
    })
  }

  let textoBotao = 'Abrir manutenção'
  if (total > 0) textoBotao = `Abrir e cancelar ${total} ${total === 1 ? 'viagem' : 'viagens'}`

  return (
    <Modal
      aberto={aberto}
      titulo={`Abrir manutenção · ${veiculo.placa}`}
      onFechar={fechar}
      rodape={
        <>
          <Button variant="ghost" onClick={fechar} disabled={enviando}>
            Voltar
          </Button>
          <Button variant={total > 0 ? 'danger' : 'primary'} onClick={confirmar} disabled={enviando || consultando}>
            {enviando ? 'Enviando…' : textoBotao}
          </Button>
        </>
      }
    >
      <AlertaErro erro={erro} />
      <Select
        id="manut-tipo"
        label="Tipo"
        options={TIPOS}
        value={form.tipo}
        onChange={alterar('tipo')}
        error={erros.tipo}
      />
      <Input
        id="manut-descricao"
        label="Descrição"
        hint="Opcional"
        value={form.descricao}
        onChange={alterar('descricao')}
      />
      <div className="aba-veiculo__par">
        <Input
          id="manut-inicio"
          label="Data de início"
          type="date"
          value={form.dataInicio}
          onChange={alterar('dataInicio')}
          error={erros.dataInicio}
        />
        <Input
          id="manut-previsao"
          label="Previsão de fim"
          type="date"
          value={form.dataPrevistaFim}
          onChange={alterar('dataPrevistaFim')}
          error={erros.dataPrevistaFim}
        />
      </div>

      {consultando && <p className="aba-veiculo__dica">Conferindo as viagens aprovadas neste período…</p>}
      {previaPronta && previa.erro && (
        <Alert tone="warning" title="Não foi possível conferir as viagens do período">
          Ao abrir, o sistema cancela automaticamente as viagens aprovadas deste veículo que coincidirem com a
          manutenção.
          <div>
            <Button variant="secondary" onClick={() => setTentativa((n) => n + 1)}>
              Tentar de novo
            </Button>
          </div>
        </Alert>
      )}
      {total > 0 && (
        <Alert
          tone="warning"
          title={`${total} ${total === 1 ? 'viagem aprovada será cancelada' : 'viagens aprovadas serão canceladas'}`}
        >
          O cancelamento é automático e os solicitantes veem o motivo.
          <ul className="aba-veiculo__lista-viagens">
            {afetadas.map((v) => (
              <li key={v.id}>
                #{v.id} {v.destino} · saída {formatarDataHora(v.saida)}
              </li>
            ))}
          </ul>
        </Alert>
      )}
      {previaPronta && !previa.erro && total === 0 && (
        <p className="aba-veiculo__dica">Nenhuma viagem aprovada deste veículo cai nesse período.</p>
      )}
    </Modal>
  )
}
