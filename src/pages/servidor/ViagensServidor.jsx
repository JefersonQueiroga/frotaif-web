import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button } from '../../components/ds/index.js'
import Pagina from '../../components/layout/Pagina.jsx'
import { COLUNAS_VIAGEM as C, colunaAcoes } from '../../components/viagens/colunasViagem.jsx'
import ListaViagens from '../../components/viagens/ListaViagens.jsx'

const COLUNAS = [
  C.id,
  C.destino,
  C.finalidade,
  C.solicitante,
  C.saida,
  C.retorno,
  C.passageiros,
  C.status,
  colunaAcoes('/servidor/viagens'),
]

export default function ViagensServidor() {
  const location = useLocation()
  const navigate = useNavigate()
  // O formulário de solicitação manda a mensagem de sucesso pelo `state` da navegação.
  const [sucesso, setSucesso] = useState(location.state?.sucesso ?? null)

  const irParaNova = () => navigate('/servidor/viagens/nova')

  return (
    <Pagina titulo="Viagens" acoes={<Button onClick={irParaNova}>Solicitar viagem</Button>}>
      {sucesso && (
        <Alert tone="success" onClose={() => setSucesso(null)}>
          {sucesso}
        </Alert>
      )}
      <Alert tone="info" title="Viagens do campus">
        Esta lista mostra as viagens de todos os servidores do campus, não apenas as suas.
      </Alert>
      <ListaViagens colunas={COLUNAS} acaoVazia={<Button onClick={irParaNova}>Solicitar viagem</Button>} />
    </Pagina>
  )
}
