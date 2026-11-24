import { useParams } from 'react-router-dom'
import { buscarVeiculo } from '../../../api/veiculos.js'
import useCarregar from '../../../hooks/useCarregar.js'
import CargaRecurso from '../../../components/CargaRecurso.jsx'
import { recursoIndisponivel } from '../../../components/recursoIndisponivel.js'
import FormVeiculo from './FormVeiculo.jsx'

// Carrega o veículo e só então monta o formulário: o estado inicial do form vem desses dados.
export default function EditarVeiculo() {
  const { id } = useParams()
  const { dados: veiculo, carregando, erro, recarregar } = useCarregar(() => buscarVeiculo(id), [id])

  if (recursoIndisponivel(veiculo, erro)) {
    return (
      <CargaRecurso
        erro={erro}
        carregando={carregando}
        recarregar={recarregar}
        titulo="Editar veículo"
        naoEncontrado="Veículo não encontrado"
        voltarPara="/gestor/veiculos"
        textoVoltar="Voltar para os veículos"
      />
    )
  }
  // `key` recomeça o formulário se a URL passar a outro veículo.
  return <FormVeiculo key={veiculo.id} veiculo={veiculo} />
}
