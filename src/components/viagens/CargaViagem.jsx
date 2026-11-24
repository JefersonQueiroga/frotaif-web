import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ApiError } from '../../api/cliente.js'
import AlertaErro from '../AlertaErro.jsx'
import { Skeleton } from '../ds/index.js'
import Pagina from '../layout/Pagina.jsx'
import Vazio from '../Vazio.jsx'
import './CargaViagem.css'

export function LinkVoltar({ para }) {
  return (
    <Link className="carga-viagem__voltar" to={para}>
      <ArrowLeft size={18} aria-hidden="true" />
      Voltar para as viagens
    </Link>
  )
}

// Telas de "carregando", "falha ao carregar" e "viagem não encontrada" do detalhe, iguais para todos os papéis.
export default function CargaViagem({ erro, carregando, recarregar, voltarPara }) {
  const voltar = <LinkVoltar para={voltarPara} />
  if (erro instanceof ApiError && erro.status === 404) {
    return (
      <Pagina titulo="Viagem não encontrada">
        <Vazio mensagem="Viagem não encontrada." acao={voltar} />
      </Pagina>
    )
  }
  return (
    <Pagina titulo="Detalhe da viagem">
      {voltar}
      {erro ? <AlertaErro erro={erro} onTentarDeNovo={recarregar} /> : carregando && <Skeleton linhas={4} />}
    </Pagina>
  )
}
