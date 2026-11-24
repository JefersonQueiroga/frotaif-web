import { iniciarViagem } from '../../api/viagens.js'
import ModalConfirmar from '../../components/ModalConfirmar.jsx'
import ModalConcluir from './ModalConcluir.jsx'

// Os dois modais de ação do motorista, usados pela lista e pelo detalhe.
// `acao` é 'iniciar' | 'concluir' | null; `onFeito(mensagem)` recarrega a tela e mostra o sucesso.
export default function ModaisMotorista({ viagem, acao, onFeito, onFechar }) {
  async function iniciar() {
    await iniciarViagem(viagem.id)
    await onFeito('Viagem iniciada.')
  }

  return (
    <>
      <ModalConfirmar
        aberto={acao === 'iniciar'}
        titulo={viagem ? `Iniciar a viagem #${viagem.id}` : 'Iniciar viagem'}
        textoConfirmar="Iniciar viagem"
        onConfirmar={iniciar}
        onFechar={onFechar}
      >
        <p>
          Ao iniciar, o km inicial é a quilometragem atual do veículo e ele passa para Em viagem. Só o motorista
          alocado pode iniciar.
        </p>
      </ModalConfirmar>
      <ModalConcluir
        aberto={acao === 'concluir'}
        viagem={viagem}
        onConcluido={() => onFeito('Viagem concluída.')}
        onFechar={onFechar}
      />
    </>
  )
}
