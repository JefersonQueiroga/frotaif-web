import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { atualizarVeiculo, cadastrarVeiculo } from '../../../api/veiculos.js'
import AlertaErro from '../../../components/AlertaErro.jsx'
import { Alert, Badge, Button, Input } from '../../../components/ds/index.js'
import Pagina from '../../../components/layout/Pagina.jsx'
import useCamposFormulario, { focarPrimeiroErro } from '../../../hooks/useCamposFormulario.js'
import { formatarNumero } from '../../../utils/formatar.js'
import { rotuloTipoVeiculo } from '../../../utils/status.js'
import validarVeiculo from './validarVeiculo.js'
import './FormVeiculo.css'

const FORM_VAZIO = {
  placa: '',
  marca: '',
  modelo: '',
  ano: '',
  tipo: 'CARRO',
  capacidadePassageiros: '',
  quilometragemAtual: '',
}

const TIPOS = [
  { valor: 'CARRO', nota: 'até 7 lugares' },
  { valor: 'VAN', nota: '8 a 20 lugares' },
  { valor: 'ONIBUS', nota: 'mais de 20 lugares' },
]

// Ids na ordem em que os campos aparecem na tela: o foco vai para o primeiro com erro nessa ordem.
const ID_CAMPO = {
  placa: 'veiculo-placa',
  ano: 'veiculo-ano',
  marca: 'veiculo-marca',
  modelo: 'veiculo-modelo',
  tipo: 'veiculo-tipo-CARRO', // o primeiro botão do grupo recebe o foco
  capacidadePassageiros: 'veiculo-capacidade',
  quilometragemAtual: 'veiculo-km',
}

// Da API para o formulário: tudo vira texto, que é o que os campos guardam.
const formDoVeiculo = (v) => ({
  placa: v.placa,
  marca: v.marca,
  modelo: v.modelo,
  ano: v.ano != null ? String(v.ano) : '',
  tipo: v.tipo,
  capacidadePassageiros: String(v.capacidadePassageiros),
  quilometragemAtual: String(v.quilometragemAtual),
})

// Um só formulário para cadastrar (sem `veiculo`) e editar (com o veículo já carregado).
export default function FormVeiculo({ veiculo }) {
  const navigate = useNavigate()
  const novo = !veiculo
  const [erroApi, setErroApi] = useState(null)
  const { form, erros, setErros, definir, alterar, reiniciar } = useCamposFormulario(
    veiculo ? formDoVeiculo(veiculo) : FORM_VAZIO,
    () => setErroApi(null), // o erro da API também some assim que a pessoa corrige algo
  )
  const [enviando, setEnviando] = useState(false)
  // Texto do veículo recém-cadastrado: quando existe, a tela mostra o sucesso no lugar do formulário.
  const [cadastrado, setCadastrado] = useState(null)
  // O ref bloqueia o segundo clique mesmo antes de o React redesenhar o botão como desabilitado.
  const emAndamento = useRef(false)

  // A placa é sempre maiúscula e sem símbolos: quem digita "abc-1d23" fica com "ABC1D23".
  const alterarPlaca = (evento) => definir('placa', evento.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7))

  async function enviar(evento) {
    evento?.preventDefault() // "Tentar de novo" chama sem evento
    if (emAndamento.current) return

    const novosErros = validarVeiculo(form, { novo, anoAtual: new Date().getFullYear() })
    setErros(novosErros)
    setErroApi(null)
    if (focarPrimeiroErro(novosErros, ID_CAMPO)) return

    emAndamento.current = true
    setEnviando(true)
    try {
      const dados = {
        placa: form.placa,
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        ano: form.ano.trim() === '' ? null : Number(form.ano), // ano é opcional: vazio vai como null
        tipo: form.tipo,
        capacidadePassageiros: Number(form.capacidadePassageiros), // a API espera número, não texto
        // O backend só usa a quilometragem no cadastro, mas valida o campo também no PUT: mandamos a atual.
        quilometragemAtual: novo ? Number(form.quilometragemAtual) : veiculo.quilometragemAtual,
      }
      if (novo) {
        await cadastrarVeiculo(dados)
        setCadastrado(`${dados.marca} ${dados.modelo} (${dados.placa})`)
      } else {
        await atualizarVeiculo(veiculo.id, dados)
        navigate(`/gestor/veiculos/${veiculo.id}`, { state: { sucesso: `Veículo ${dados.placa} atualizado.` } })
      }
    } catch (e) {
      // O formulário continua preenchido para a pessoa corrigir e tentar de novo.
      setErroApi(e)
    } finally {
      emAndamento.current = false
      setEnviando(false)
    }
  }

  function cadastrarOutro() {
    reiniciar(FORM_VAZIO)
    setErroApi(null)
    setCadastrado(null)
  }

  const titulo = novo ? 'Novo veículo' : 'Editar veículo'
  const migalhas = (
    <nav className="form-veiculo__migalhas" aria-label="Você está em">
      <Link to="/gestor/veiculos">Veículos</Link>
      <span aria-hidden="true">›</span>
      <span>{titulo}</span>
    </nav>
  )

  if (cadastrado) {
    return (
      <Pagina titulo={titulo}>
        {migalhas}
        <div className="form-veiculo__sucesso">
          <Alert tone="success" title="Veículo cadastrado">
            {cadastrado} entrou na frota como Disponível.
          </Alert>
          <div className="form-veiculo__botoes">
            <Link className="form-veiculo__ir" to="/gestor/veiculos">
              Ir para Veículos
            </Link>
            <Button size="lg" variant="secondary" onClick={cadastrarOutro}>
              Cadastrar outro
            </Button>
          </div>
        </div>
      </Pagina>
    )
  }

  const quantidadeErros = Object.keys(erros).length
  const exigeCnhPesada = form.tipo === 'VAN' || form.tipo === 'ONIBUS'

  // Prévia do cartão com o que já foi digitado.
  const nome = `${form.marca.trim()} ${form.modelo.trim()}`.trim()
  const detalhes = [
    form.ano.trim(),
    form.capacidadePassageiros.trim() && `${form.capacidadePassageiros.trim()} lugares`,
    form.quilometragemAtual.trim() !== '' && /^\d+$/.test(form.quilometragemAtual.trim()) &&
      `${formatarNumero(Number(form.quilometragemAtual))} km`,
  ].filter(Boolean)

  return (
    <Pagina
      titulo={titulo}
      subtitulo={
        novo
          ? 'O veículo entra na frota como Disponível e já pode ser escolhido na aprovação de viagens.'
          : `Alterando ${veiculo.marca} ${veiculo.modelo} (${veiculo.placa}).`
      }
    >
      {migalhas}
      <form className="form-veiculo" onSubmit={enviar} noValidate>
        <div className="form-veiculo__principal">
          {quantidadeErros >= 2 && (
            <Alert tone="danger" title={`Faltam corrigir ${quantidadeErros} campos`}>
              Os campos com problema estão marcados abaixo.
            </Alert>
          )}
          <AlertaErro erro={erroApi} onTentarDeNovo={enviar} />

          <section className="form-veiculo__secao" aria-labelledby="secao-identificacao">
            <h2 id="secao-identificacao" className="form-veiculo__titulo">
              Identificação
            </h2>
            <div className="form-veiculo__campos">
              <Input
                id="veiculo-placa"
                label="Placa"
                hint="Padrão Mercosul: 3 letras, 1 número, 1 letra, 2 números"
                placeholder="AAA0A00"
                className="form-veiculo__placa"
                value={form.placa}
                onChange={alterarPlaca}
                error={erros.placa}
                autoComplete="off"
              />
              <Input
                id="veiculo-ano"
                label="Ano"
                inputMode="numeric"
                placeholder="2024"
                hint="Opcional"
                value={form.ano}
                onChange={alterar('ano')}
                error={erros.ano}
              />
              <Input
                id="veiculo-marca"
                label="Marca"
                placeholder="Ex.: Fiat"
                value={form.marca}
                onChange={alterar('marca')}
                error={erros.marca}
              />
              <Input
                id="veiculo-modelo"
                label="Modelo"
                placeholder="Ex.: Cronos"
                value={form.modelo}
                onChange={alterar('modelo')}
                error={erros.modelo}
              />
            </div>
          </section>

          <section className="form-veiculo__secao" aria-labelledby="secao-tipo">
            <h2 id="secao-tipo" className="form-veiculo__titulo">
              Tipo e capacidade
            </h2>
            <div role="group" aria-labelledby="veiculo-tipo-rotulo" className="form-veiculo__grupo">
              <span id="veiculo-tipo-rotulo" className="form-veiculo__rotulo">
                Tipo
              </span>
              <div className="form-veiculo__tipos">
                {TIPOS.map(({ valor, nota }) => (
                  <button
                    key={valor}
                    id={`veiculo-tipo-${valor}`}
                    type="button"
                    className="form-veiculo__tipo"
                    aria-pressed={form.tipo === valor}
                    onClick={() => definir('tipo', valor)}
                  >
                    <span className="form-veiculo__tipo-nome">{rotuloTipoVeiculo(valor)}</span>
                    <span className="form-veiculo__tipo-nota">{nota}</span>
                  </button>
                ))}
              </div>
              {erros.tipo && <span className="form-veiculo__erro">{erros.tipo}</span>}
            </div>
            {exigeCnhPesada && (
              <Alert tone="info" title="Exige CNH D ou E">
                Na aprovação, só motoristas com categoria D ou E poderão conduzir este veículo.
              </Alert>
            )}
            <div className="form-veiculo__campos">
              <Input
                id="veiculo-capacidade"
                label="Capacidade de passageiros"
                inputMode="numeric"
                hint="Sem contar o motorista"
                value={form.capacidadePassageiros}
                onChange={alterar('capacidadePassageiros')}
                error={erros.capacidadePassageiros}
              />
              {novo && (
                <Input
                  id="veiculo-km"
                  label="Quilometragem atual"
                  inputMode="numeric"
                  hint="O que o hodômetro marca hoje"
                  value={form.quilometragemAtual}
                  onChange={alterar('quilometragemAtual')}
                  error={erros.quilometragemAtual}
                />
              )}
            </div>
          </section>

          <div className="form-veiculo__botoes">
            <Button type="submit" size="lg" disabled={enviando}>
              {enviando ? 'Enviando…' : novo ? 'Cadastrar veículo' : 'Salvar alterações'}
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate(novo ? '/gestor/veiculos' : `/gestor/veiculos/${veiculo.id}`)}
            >
              Cancelar
            </Button>
          </div>
        </div>

        <aside className="form-veiculo__previa" aria-label="Prévia">
          <span className="form-veiculo__previa-titulo">Como vai aparecer na frota</span>
          <div className="form-veiculo__cartao">
            <div className="form-veiculo__placa-visual">
              <span className="form-veiculo__placa-faixa">BRASIL</span>
              <span className="form-veiculo__placa-texto">{form.placa || 'AAA0A00'}</span>
            </div>
            <div className="form-veiculo__cartao-texto">
              <span className="form-veiculo__cartao-nome">{nome || 'Marca e modelo'}</span>
              <span className="form-veiculo__cartao-linha">
                {detalhes.length ? detalhes.join(' · ') : 'Ano, lugares e km'}
              </span>
            </div>
            <div className="form-veiculo__cartao-selos">
              {novo && <Badge tone="green">Disponível</Badge>}
              <Badge tone="neutral">{rotuloTipoVeiculo(form.tipo)}</Badge>
            </div>
          </div>
        </aside>
      </form>
    </Pagina>
  )
}
