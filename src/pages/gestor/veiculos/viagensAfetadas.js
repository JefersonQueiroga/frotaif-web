// Prévia das viagens que a abertura de uma manutenção vai cancelar.
// É só uma prévia para o gestor decidir: quem cancela de verdade é o backend, com o mesmo critério.
// A lista já chega filtrada pela API (APROVADAS com saída antes do fim previsto + 1 dia); aqui falta
// conferir o veículo e se a viagem termina depois das 00:00 do dia de início.
// `new Date('AAAA-MM-DDT00:00:00')` (com hora) é lido no fuso local, sem o deslocamento de um dia.
export default function viagensAfetadasPelaManutencao(viagens, veiculoId, dataInicio) {
  const inicio = new Date(`${dataInicio}T00:00:00`)
  return viagens.filter((v) => v.veiculo?.id === veiculoId && new Date(v.retornoPrevisto) > inicio)
}
