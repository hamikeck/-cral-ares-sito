import type { Metadata } from 'next'
import { contenutiPagine } from '@/contenuti/pagine'

export const metadata: Metadata = {
  title: contenutiPagine.iscriviti.titolo,
}

export default function Iscriviti() {
  const { titolo, paragrafi, notaProvvisoria } = contenutiPagine.iscriviti
  const { email } = contenutiPagine.associazione

  return (
    <article className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold">{titolo}</h1>
      {paragrafi.map((paragrafo) => (
        <p key={paragrafo}>{paragrafo}</p>
      ))}
      <p>
        <a
          href={`mailto:${email}`}
          className="rounded font-semibold text-ambra-scura underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ambra-scura"
        >
          {email}
        </a>
      </p>
      <p className="text-sm">{notaProvvisoria}</p>
    </article>
  )
}
