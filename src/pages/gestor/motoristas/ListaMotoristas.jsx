import { useState } from 'react'
import { inativarMotorista, listarMotoristas } from '../../../api/motoristas.js'
import AlertaErro from '../../../components/AlertaErro.jsx'
import ModalConfirmar from '../../../components/ModalConfirmar.jsx'
import Vazio from '../../../components/Vazio.jsx'
import { Alert, Badge, Button, Skeleton, Tabela } from '../../../components/ds/index.js'
import Pagina from '../../../components/layout/Pagina.jsx'
import useCarregar from '../../../hooks/useCarregar.js'
import { formatarCpf, formatarData, hojeISO } from '../../../utils/formatar.js'
import { situacaoMotorista } from '../../../utils/status.js'
import ModalMotorista from './ModalMotorista.jsx'
import './ListaMotoristas.css'

export default function ListaMotoristas() {
  const { dados: motoristas, carregando, erro, recarregar } = useCarregar(listarMotoristas, [])
  // modal: { tipo: 'form' | 'inativar', motorista?, aberto }. Ao fechar só `aberto` vira false: o motorista
  // continua guardado e o conteúdo do modal não muda (nem some) enquanto ele se fecha.
  const [modal, setModal] = useState(null)
  const [sucesso, setSucesso] = useState(null)

  const fecharModal = () => setModal((atual) => atual && { ...atual, aberto: false })
  const concluir = (mensagem) => {
    setSucesso(mensagem)
    recarregar()
  }

  const hoje = hojeISO()
  const novo = () => setModal({ tipo: 'form', aberto: true })

  const colunas = [
    { titulo: 'Nome', render: (m) => <span className="lista-motoristas__nome">{m.nome}</span> },
    { titulo: 'CPF', render: (m) => <span className="lista-motoristas__mono">{formatarCpf(m.cpf)}</span> },
    { titulo: 'Registro CNH', render: (m) => <span className="lista-motoristas__mono">{m.registroCnh}</span> },
    { titulo: 'Cat.', render: (m) => <span className="lista-motoristas__categoria">{m.categoriaCnh}</span> },
    { titulo: 'Validade', render: (m) => formatarData(m.validadeCnh) },
    {
      titulo: 'Situação',
      render: (m) => {
        const { rotulo, tom } = situacaoMotorista(m, hoje)
        return <Badge tone={tom}>{rotulo}</Badge>
      },
    },
    {
      titulo: 'Ações',
      // O backend só devolve motoristas ativos (inativar o tira da lista), mas `ativo` continua no contrato.
      render: (m) =>
        m.ativo ? (
          <div className="lista-motoristas__acoes">
            <Button variant="secondary" onClick={() => setModal({ tipo: 'form', motorista: m, aberto: true })}>
              Editar
            </Button>
            <Button variant="danger" onClick={() => setModal({ tipo: 'inativar', motorista: m, aberto: true })}>
              Inativar
            </Button>
          </div>
        ) : null,
    },
  ]

  function conteudo() {
    if (erro && !motoristas) return <AlertaErro erro={erro} onTentarDeNovo={recarregar} />
    if (carregando && !motoristas) return <Skeleton linhas={4} />
    if (!motoristas) return null
    if (motoristas.length === 0) {
      return <Vazio mensagem="Nenhum motorista cadastrado." acao={<Button onClick={novo}>Cadastrar motorista</Button>} />
    }
    return <Tabela colunas={colunas} linhas={motoristas} chave={(m) => m.id} />
  }

  const alvo = modal?.motorista

  return (
    <Pagina titulo="Motoristas" acoes={<Button onClick={novo}>Novo motorista</Button>}>
      {sucesso && (
        <Alert tone="success" onClose={() => setSucesso(null)}>
          {sucesso}
        </Alert>
      )}
      {/* Falha ao recarregar depois de uma ação: mantém a lista na tela e avisa. */}
      {erro && motoristas && <AlertaErro erro={erro} onTentarDeNovo={recarregar} />}
      {conteudo()}
      <ModalMotorista
        aberto={Boolean(modal?.aberto) && modal.tipo === 'form'}
        motorista={alvo}
        onSalvo={(edicao) => concluir(edicao ? 'Motorista atualizado.' : 'Motorista cadastrado.')}
        onFechar={fecharModal}
      />
      <ModalConfirmar
        aberto={Boolean(modal?.aberto) && modal.tipo === 'inativar'}
        titulo={`Inativar ${alvo?.nome ?? ''}?`}
        textoConfirmar="Inativar"
        tom="danger"
        onConfirmar={async () => {
          await inativarMotorista(alvo.id)
          concluir('Motorista inativado.')
        }}
        onFechar={fecharModal}
      >
        Ele deixa de aparecer na aprovação de viagens. As viagens já feitas continuam no histórico.
      </ModalConfirmar>
    </Pagina>
  )
}
