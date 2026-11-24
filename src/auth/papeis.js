// Tudo que depende do papel (perfil) do usuário fica aqui: tela inicial, menu e rótulos.
export const TELA_INICIAL = {
  SERVIDOR: '/servidor/viagens',
  MOTORISTA: '/motorista/viagens',
  GESTOR: '/gestor',
}

export const ROTULO_PAPEL = {
  SERVIDOR: 'Servidor',
  MOTORISTA: 'Motorista',
  GESTOR: 'Gestor',
}

// Itens do menu verde (spec §6). `para` é o caminho da rota.
export const MENU = {
  SERVIDOR: [
    { rotulo: 'Viagens', para: '/servidor/viagens' },
    { rotulo: 'Solicitar viagem', para: '/servidor/viagens/nova' },
  ],
  MOTORISTA: [{ rotulo: 'Viagens', para: '/motorista/viagens' }],
  GESTOR: [
    { rotulo: 'Painel', para: '/gestor' },
    { rotulo: 'Viagens', para: '/gestor/viagens' },
    { rotulo: 'Veículos', para: '/gestor/veiculos' },
    { rotulo: 'Motoristas', para: '/gestor/motoristas' },
  ],
}

// O login recebe `?voltar=<caminho>` na URL, e qualquer pessoa pode montar um link com esse valor.
// Se aceitássemos "//site-malicioso.com" ou "https://...", o usuário seria levado a outro site
// logo depois de digitar a senha (open redirect). Por isso só aceitamos caminhos internos.
export function destinoSeguro(caminho) {
  if (typeof caminho !== 'string') return null
  // Tem que começar com uma única "/" (nem "//" nem "/\", que alguns navegadores tratam como "//").
  if (!caminho.startsWith('/') || caminho.startsWith('//') || caminho.startsWith('/\\')) return null
  // Voltar para o login depois de entrar formaria um laço.
  if (caminho === '/login' || caminho.startsWith('/login?') || caminho.startsWith('/login/')) return null
  return caminho
}
