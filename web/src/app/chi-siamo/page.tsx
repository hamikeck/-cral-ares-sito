import type { Metadata } from 'next'
import { Organigramma } from '@/componenti/Organigramma'
import { contenutiPagine } from '@/contenuti/pagine'

export const metadata: Metadata = {
  title: contenutiPagine.chiSiamo.titolo,
}

export default function ChiSiamo() {
  const {
    titolo,
    paragrafi,
    titoloDirettivo,
    notaProvvisoria,
    direttivo,
    titoloContatti,
    testoContatti,
  } = contenutiPagine.chiSiamo
  const { email } = contenutiPagine.associazione

  return (
    <article className="flex max-w-2xl flex-col gap-6 text-corpo">
      <h1 className="text-titolo-pagina text-chiaro">{titolo}</h1>
      {paragrafi.map((paragrafo) => (
        <p key={paragrafo}>{paragrafo}</p>
      ))}
      <section className="flex flex-col gap-6">
        <h2 className="text-titolo-sezione text-chiaro">{titoloDirettivo}</h2>
        {direttivo ? (
          <Organigramma direttivo={direttivo} email={email} />
        ) : (
          <p className="text-sm text-tenue">{notaProvvisoria}</p>
        )}
      </section>
      {/* Con l'organigramma la segreteria ha il suo riquadro, con la stessa
          casella: ripeterla subito sotto come «Contatti» sarebbe un doppione. */}
      {direttivo ? null : (
        <section className="flex flex-col gap-2">
          <h2 className="text-titolo-sezione text-chiaro">{titoloContatti}</h2>
          <p>
            {testoContatti}{' '}
            <a
              href={`mailto:${email}`}
              className="fuoco-su-scuro rounded font-semibold text-luce underline underline-offset-4"
            >
              {email}
            </a>
          </p>
        </section>
      )}
    </article>
  )
}
