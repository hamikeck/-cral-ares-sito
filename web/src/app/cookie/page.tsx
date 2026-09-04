import type { Metadata } from 'next'
import { contenutiPagine } from '@/contenuti/pagine'

export const metadata: Metadata = {
  title: contenutiPagine.cookie.titolo,
}

export default function Cookie() {
  const { titolo, paragrafi } = contenutiPagine.cookie

  return (
    <article className="flex max-w-2xl flex-col gap-6 text-corpo">
      <h1 className="text-titolo-pagina text-inchiostro">{titolo}</h1>
      {paragrafi.map((paragrafo) => (
        <p key={paragrafo}>{paragrafo}</p>
      ))}
    </article>
  )
}
