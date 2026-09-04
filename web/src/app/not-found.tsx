import Link from 'next/link'
import { contenutiPagine } from '@/contenuti/pagine'

export default function NonTrovata() {
  const { titolo, testo, invito } = contenutiPagine.nonTrovata

  return (
    <article className="flex max-w-2xl flex-col gap-6 text-corpo">
      <h1 className="text-titolo-pagina text-inchiostro">{titolo}</h1>
      <p>{testo}</p>
      <p>
        <Link
          href="/"
          className="fuoco-su-chiaro rounded font-semibold text-ambra-scura underline underline-offset-4"
        >
          {invito}
        </Link>
      </p>
    </article>
  )
}
