import Link from 'next/link'
import { contenutiPagine } from '@/contenuti/pagine'

export default function NonTrovata() {
  const { titolo, testo, invito } = contenutiPagine.nonTrovata

  return (
    <article className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold">{titolo}</h1>
      <p>{testo}</p>
      <p>
        <Link
          href="/"
          className="fuoco rounded font-semibold text-ambra-scura underline underline-offset-4"
        >
          {invito}
        </Link>
      </p>
    </article>
  )
}
