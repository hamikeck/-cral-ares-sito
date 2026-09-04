import type { Metadata } from 'next'
import { contenutiPagine } from '@/contenuti/pagine'

export const metadata: Metadata = {
  title: contenutiPagine.iscriviti.titolo,
}

export default function Iscriviti() {
  const { titolo, paragrafi, notaProvvisoria } = contenutiPagine.iscriviti
  const { email, emailProvvisoria } = contenutiPagine.associazione

  return (
    <article className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold">{titolo}</h1>
      {paragrafi.map((paragrafo) => (
        <p key={paragrafo}>{paragrafo}</p>
      ))}
      <p>
        <a
          href={`mailto:${email}`}
          className="fuoco rounded font-semibold text-ambra-scura underline underline-offset-4"
        >
          {email}
        </a>
      </p>
      <p className="text-xs">{emailProvvisoria}</p>
      <p className="text-sm">{notaProvvisoria}</p>
    </article>
  )
}
