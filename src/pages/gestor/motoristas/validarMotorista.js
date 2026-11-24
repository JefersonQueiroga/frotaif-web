import { cpfValido, somenteDigitos } from '../../../utils/validar.js'

// Validação do modal de motorista. O CPF pode vir com máscara: só os dígitos contam.
// O backend confere de novo (e ainda checa CPF e CNH repetidos, que o front não tem como saber).
export function validarMotorista({ nome, cpf, registroCnh, categoriaCnh, validadeCnh }) {
  const erros = {}
  if (!nome.trim()) erros.nome = 'Informe o nome.'
  if (!cpfValido(cpf)) erros.cpf = 'CPF inválido.'
  if (somenteDigitos(registroCnh).length !== 11) erros.registroCnh = 'O registro da CNH tem 11 dígitos.'
  if (!categoriaCnh) erros.categoriaCnh = 'Escolha a categoria.'
  if (!validadeCnh) erros.validadeCnh = 'Informe a validade.'
  return erros
}
