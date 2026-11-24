import { useParams } from 'react-router-dom'
import { buscarVeiculo } from '../../../api/veiculos.js'
import useCarregar from '../../../hooks/useCarregar.js'
import CargaVeiculo from './CargaVeiculo.jsx'
import FormVeiculo from './FormVeiculo.jsx'
import { veiculoIndisponivel } from './veiculoIndisponivel.js'

// Carrega o veículo e só então monta o formulário: o estado inicial do form vem desses dados.
export default function EditarVeiculo() {
  const { id } = useParams()
  const { dados: veiculo, carregando, erro, recarregar } = useCarregar(() => buscarVeiculo(id), [id])

  if (veiculoIndisponivel(veiculo, erro)) {
    return <CargaVeiculo erro={erro} carregando={carregando} recarregar={recarregar} titulo="Editar veículo" />
  }
  // `key` recomeça o formulário se a URL passar a outro veículo.
  return <FormVeiculo key={veiculo.id} veiculo={veiculo} />
}
