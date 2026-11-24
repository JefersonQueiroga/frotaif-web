// Rótulo legível e cor (tom do StatusBadge) de cada status. Cores definidas na spec §6.
// tom ∈ neutral | green | red | amber | blue | solid

import { diasEntre } from './formatar'

const STATUS_VIAGEM = {
  SOLICITADA: { rotulo: 'Solicitada', tom: 'amber' },
  APROVADA: { rotulo: 'Aprovada', tom: 'blue' },
  EM_ANDAMENTO: { rotulo: 'Em andamento', tom: 'solid' },
  CONCLUIDA: { rotulo: 'Concluída', tom: 'green' },
  REJEITADA: { rotulo: 'Rejeitada', tom: 'red' },
  CANCELADA: { rotulo: 'Cancelada', tom: 'neutral' },
}

const STATUS_VEICULO = {
  DISPONIVEL: { rotulo: 'Disponível', tom: 'green' },
  EM_VIAGEM: { rotulo: 'Em viagem', tom: 'blue' },
  EM_MANUTENCAO: { rotulo: 'Em manutenção', tom: 'amber' },
  INATIVO: { rotulo: 'Inativo', tom: 'neutral' },
}

const TIPO_MANUTENCAO = {
  PREVENTIVA: { rotulo: 'Preventiva', tom: 'blue' },
  CORRETIVA: { rotulo: 'Corretiva', tom: 'amber' },
}

const TIPO_VEICULO = {
  CARRO: 'Carro',
  VAN: 'Van',
  ONIBUS: 'Ônibus',
}

// Valor desconhecido (ex.: status novo no backend) não quebra a tela: mostra o código cru.
const buscar = (tabela, chave) => tabela[chave] ?? { rotulo: chave, tom: 'neutral' }

export const infoStatusViagem = (status) => buscar(STATUS_VIAGEM, status)
export const infoStatusVeiculo = (status) => buscar(STATUS_VEICULO, status)
export const infoTipoManutencao = (tipo) => buscar(TIPO_MANUTENCAO, tipo)
export const rotuloTipoVeiculo = (tipo) => TIPO_VEICULO[tipo] ?? tipo

// Motorista inativo não é bloqueado pela CNH: o que importa é que já está fora de uso.
export const cnhVencida = (motorista, hoje) =>
  motorista.ativo && diasEntre(hoje, motorista.validadeCnh) < 0

// "Vence em N dias" só aparece nos próximos 30 dias; antes disso a CNH está "em dia".
const DIAS_AVISO_CNH = 30

export function situacaoMotorista(motorista, hoje) {
  if (!motorista.ativo) return { rotulo: 'Inativo', tom: 'neutral' }
  const dias = diasEntre(hoje, motorista.validadeCnh)
  if (dias < 0) return { rotulo: 'CNH vencida', tom: 'red' }
  if (dias === 0) return { rotulo: 'Vence hoje', tom: 'amber' }
  if (dias <= DIAS_AVISO_CNH) {
    return { rotulo: `Vence em ${dias} ${dias === 1 ? 'dia' : 'dias'}`, tom: 'amber' }
  }
  return { rotulo: 'CNH em dia', tom: 'green' }
}
