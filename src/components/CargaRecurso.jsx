import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ApiError } from '../api/cliente.js'
import AlertaErro from './AlertaErro.jsx'
import { Skeleton } from './ds/index.js'
import Pagina from './layout/Pagina.jsx'
import Vazio from './Vazio.jsx'
import './CargaRecurso.css'

export function LinkVoltar({ para, children }) {
  return (
    <Link className="carga-recurso__voltar" to={para}>
      <ArrowLeft size={18} aria-hidden="true" />
      {children}
    </Link>
  )
}

// Telas de "carregando", "falha ao carregar" e "não encontrado" de qualquer página de detalhe.
// `naoEncontrado` ex.: "Viagem não encontrada."; `titulo` é o da página enquanto carrega.
export default function CargaRecurso({ erro, carregando, recarregar, titulo, naoEncontrado, voltarPara, textoVoltar }) {
  const voltar = <LinkVoltar para={voltarPara}>{textoVoltar}</LinkVoltar>
  if (erro instanceof ApiError && erro.status === 404) {
    return (
      <Pagina titulo={naoEncontrado}>
        <Vazio mensagem={`${naoEncontrado}.`} acao={voltar} />
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
