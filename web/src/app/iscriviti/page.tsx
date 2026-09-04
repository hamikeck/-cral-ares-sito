import type { Metadata } from 'next'
import { contenutiPagine } from '@/contenuti/pagine'

export const metadata: Metadata = {
  title: contenutiPagine.iscriviti.titolo,
}

export default function Iscriviti() {
  const { titolo, paragrafi, notaProvvisoria } = contenutiPagine.iscriviti
  const { email, emailProvvisoria } = contenutiPagine.associazione

  return (
    <article className="flex max-w-2xl flex-col gap-6 text-corpo">
      <h1 className="text-titolo-pagina text-inchiostro">{titolo}</h1>
      {paragrafi.map((paragrafo) => (
        <p key={paragrafo}>{paragrafo}</p>
      ))}
      <p>
        <a
          href={`mailto:${email}`}
          className="fuoco-su-chiaro rounded font-semibold text-ambra-scura underline underline-offset-4"
        >
          {email}
        </a>
      </p>
      <p className="text-xs text-inchiostro-tenue">{emailProvvisoria}</p>
      <p className="text-sm text-inchiostro-tenue">{notaProvvisoria}</p>
    </article>
  )
}
