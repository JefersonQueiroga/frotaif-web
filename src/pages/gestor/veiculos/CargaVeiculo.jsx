import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ApiError } from '../../../api/cliente.js'
import AlertaErro from '../../../components/AlertaErro.jsx'
import { Skeleton } from '../../../components/ds/index.js'
import Pagina from '../../../components/layout/Pagina.jsx'
import Vazio from '../../../components/Vazio.jsx'
import './CargaVeiculo.css'

export function LinkVoltarVeiculos() {
  return (
    <Link className="carga-veiculo__voltar" to="/gestor/veiculos">
      <ArrowLeft size={18} aria-hidden="true" />
      Voltar para os veículos
    </Link>
  )
}

// Telas de "carregando", "falha ao carregar" e "veículo não encontrado", iguais no detalhe e na edição.
export default function CargaVeiculo({ erro, carregando, recarregar, titulo }) {
  const voltar = <LinkVoltarVeiculos />
  if (erro instanceof ApiError && erro.status === 404) {
    return (
      <Pagina titulo="Veículo não encontrado">
        <Vazio mensagem="Veículo não encontrado." acao={voltar} />
      </Pagina>
    )
  }
  return (
    <Pagina titulo={titulo}>
      {voltar}
      {erro ? <AlertaErro erro={erro} onTentarDeNovo={recarregar} /> : carregando && <Skeleton linhas={4} />}
    </Pagina>
  )
}
