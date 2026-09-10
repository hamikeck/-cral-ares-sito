import type { Metadata } from 'next'
import { contenutiPagine } from '@/contenuti/pagine'

export const metadata: Metadata = {
  title: contenutiPagine.privacy.titolo,
}

export default function Privacy() {
  const { titolo, notaProvvisoria } = contenutiPagine.privacy

  return (
    <article className="flex max-w-2xl flex-col gap-6 text-corpo">
      <h1 className="text-titolo-pagina text-chiaro">{titolo}</h1>
      <p>{notaProvvisoria}</p>
    </article>
  )
}
