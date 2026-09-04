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
  const { email } = contenutiPagine.associazione

  return (
    <article className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold">{titolo}</h1>
      {paragrafi.map((paragrafo) => (
        <p key={paragrafo}>{paragrafo}</p>
      ))}
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">{titoloDirettivo}</h2>
        <p className="text-sm">{notaProvvisoria}</p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">{titoloContatti}</h2>
        <p>
          {testoContatti}{' '}
          <a
            href={`mailto:${email}`}
            className="rounded font-semibold text-ambra-scura underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ambra-scura"
          >
            {email}
          </a>
        </p>
      </section>
    </article>
  )
}
