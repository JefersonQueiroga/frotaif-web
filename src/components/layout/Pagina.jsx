import './Pagina.css'

// Cabeçalho padrão de cada tela: título, barra verde, subtítulo opcional e ações à direita.
export default function Pagina({ titulo, subtitulo, acoes, children }) {
  return (
    <div className="pagina">
      <header className="pagina__cabecalho">
        <div className="pagina__titulos">
          <h1 className="pagina__titulo">{titulo}</h1>
          <span className="pagina__barra" aria-hidden="true" />
          {subtitulo && <p className="pagina__subtitulo">{subtitulo}</p>}
        </div>
        {acoes && <div className="pagina__acoes">{acoes}</div>}
      </header>
      {children}
    </div>
  )
}
