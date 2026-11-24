// Veículos que a gestão pode oferecer ao aprovar: precisam estar disponíveis e ter lugar para todos.
// A API já filtra por status, mas conferir aqui deixa a regra clara e testável.
export default function veiculosCompativeis(veiculos, qtdPassageiros) {
  return veiculos.filter((v) => v.status === 'DISPONIVEL' && v.capacidadePassageiros >= qtdPassageiros)
}
