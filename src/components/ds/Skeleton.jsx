import './Skeleton.css'

// Esqueleto de carregamento: linhas cinzas que pulsam enquanto os dados não chegam.
// role="status" + aria-label fazem o leitor de tela anunciar "Carregando".
export default function Skeleton({ linhas = 3 }) {
  return (
    <div role="status" aria-label="Carregando" className="esqueleto">
      {Array.from({ length: linhas }, (_, i) => (
        <div key={i} className="esqueleto__linha">
          <span className="esqueleto__selo" />
          <span className="esqueleto__texto" />
        </div>
      ))}
    </div>
  )
}
