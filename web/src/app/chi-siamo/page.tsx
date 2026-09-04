import type { Metadata } from 'next'
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
    titoloContatti,
    testoContatti,
  } = contenutiPagine.chiSiamo
  const { email, emailProvvisoria } = contenutiPagine.associazione

  return (
    <article className="flex max-w-2xl flex-col gap-6 text-corpo">
      <h1 className="text-titolo-pagina text-inchiostro">{titolo}</h1>
      {paragrafi.map((paragrafo) => (
        <p key={paragrafo}>{paragrafo}</p>
      ))}
      <section className="flex flex-col gap-2">
        <h2 className="text-titolo-sezione text-inchiostro">{titoloDirettivo}</h2>
        <p className="text-sm text-inchiostro-tenue">{notaProvvisoria}</p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-titolo-sezione text-inchiostro">{titoloContatti}</h2>
        <p>
          {testoContatti}{' '}
          <a
            href={`mailto:${email}`}
            className="fuoco-su-chiaro rounded font-semibold text-ambra-scura underline underline-offset-4"
          >
            {email}
          </a>
        </p>
        <p className="text-xs text-inchiostro-tenue">{emailProvvisoria}</p>
      </section>
    </article>
  )
}
