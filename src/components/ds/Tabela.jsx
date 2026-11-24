import './Tabela.css'

// Tabela dentro de um card. Em tela estreita o card rola na horizontal
// (a tabela mantém uma largura mínima em vez de espremer as colunas).
// colunas: [{ titulo, render(linha), className? }]; chave(linha) devolve um valor único por linha.
export default function Tabela({ colunas, linhas, chave }) {
  return (
    <div className="tabela">
      <table className="tabela__tabela">
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna.titulo} scope="col" className={coluna.className}>
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha) => (
            <tr key={chave(linha)}>
              {colunas.map((coluna) => (
                <td key={coluna.titulo} className={coluna.className}>
                  {coluna.render(linha)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
