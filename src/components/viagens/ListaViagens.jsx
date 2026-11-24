import { useState } from 'react'
import { listarViagens } from '../../api/viagens.js'
import AlertaErro from '../AlertaErro.jsx'
import { Button, Skeleton, Tabela } from '../ds/index.js'
import Vazio from '../Vazio.jsx'
import useCarregar from '../../hooks/useCarregar.js'
import FiltrosViagens from './FiltrosViagens.jsx'
import './ListaViagens.css'

const SEM_FILTROS = { status: '', inicio: '', fim: '' }

// Filtros + tabela de viagens, com os estados de carregando, erro, vazio e filtro sem resultado.
// `acaoVazia` é o botão opcional mostrado quando não há nenhuma viagem cadastrada.
export default function ListaViagens({ colunas, acaoVazia }) {
  const [filtros, setFiltros] = useState(SEM_FILTROS)
  // `filtros` só vira outro objeto quando o usuário muda algo: por isso serve como dependência.
  const { dados: viagens, carregando, erro, recarregar } = useCarregar(() => listarViagens(filtros), [filtros])

  const temFiltro = Object.values(filtros).some(Boolean)
  const limpar = () => setFiltros(SEM_FILTROS)
  const contador = viagens && !erro ? `${viagens.length} ${viagens.length === 1 ? 'viagem' : 'viagens'}` : null

  function conteudo() {
    // Com erro (ex.: 422 de "Até" antes de "Saída a partir de") não mostramos a lista antiga:
    // ela não corresponde aos filtros que estão na tela.
    if (erro) return <AlertaErro erro={erro} onTentarDeNovo={recarregar} />
    if (carregando && !viagens) return <Skeleton linhas={4} />
    if (!viagens) return null
    if (viagens.length === 0) {
      return temFiltro ? (
        <Vazio
          mensagem="Nenhuma viagem com esses filtros."
          acao={
            <Button variant="secondary" onClick={limpar}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <Vazio mensagem="Nenhuma viagem cadastrada." acao={acaoVazia} />
      )
    }
    return <Tabela colunas={colunas} linhas={viagens} chave={(v) => v.id} />
  }

  return (
    <>
      <FiltrosViagens filtros={filtros} onChange={setFiltros} onLimpar={limpar} contador={contador} />
      {conteudo()}
    </>
  )
}
