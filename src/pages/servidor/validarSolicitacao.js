// Validação do formulário "Solicitar viagem" (função pura, testada em validarSolicitacao.test.js).
// Devolve { campo: mensagem } só com os campos inválidos; objeto vazio = tudo certo.
export default function validarSolicitacao({ destino, finalidade, saida, retornoPrevisto, qtdPassageiros }) {
  const erros = {}

  if (!destino?.trim()) erros.destino = 'Informe o destino.'
  if (!finalidade?.trim()) erros.finalidade = 'Informe a finalidade.'
  if (!saida) erros.saida = 'Informe a data e a hora de saída.'

  if (!retornoPrevisto) {
    erros.retornoPrevisto = 'Informe o retorno previsto.'
  } else if (saida && retornoPrevisto <= saida) {
    // O valor do datetime-local é "AAAA-MM-DDTHH:mm": nesse formato, comparar como texto equivale a comparar datas
    // (e evita converter para Date, que mexeria com fuso horário).
    erros.retornoPrevisto = 'O retorno precisa ser depois da saída.'
  }

  // Só dígitos: "2,5" ou "1.5" não são número inteiro de passageiros.
  const passageiros = String(qtdPassageiros ?? '').trim()
  if (!/^\d+$/.test(passageiros) || Number(passageiros) < 1) {
    erros.qtdPassageiros = 'Informe pelo menos 1 passageiro.'
  }

  return erros
}
