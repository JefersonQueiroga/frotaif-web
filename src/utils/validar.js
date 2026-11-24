// Validações de formulário (funções puras).

export const somenteDigitos = (texto) => String(texto ?? '').replace(/\D/g, '')

// Padrão Mercosul: 3 letras, 1 número, 1 letra, 2 números (ex.: RNX1A23). Só maiúsculas.
export const placaValida = (placa) => /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(placa ?? '')

// Calcula um dígito verificador: soma ponderada dos dígitos, resto da divisão por 11.
function digitoVerificador(digitos, pesoInicial) {
  const soma = digitos.reduce((acc, d, i) => acc + d * (pesoInicial - i), 0)
  const resto = (soma * 10) % 11
  return resto === 10 ? 0 : resto
}

export function cpfValido(cpf) {
  const texto = somenteDigitos(cpf)
  if (texto.length !== 11) return false
  // 111.111.111-11 passa na conta dos dígitos, mas não é um CPF real.
  if (/^(\d)\1{10}$/.test(texto)) return false
  const d = texto.split('').map(Number)
  return (
    digitoVerificador(d.slice(0, 9), 10) === d[9] &&
    digitoVerificador(d.slice(0, 10), 11) === d[10]
  )
}
