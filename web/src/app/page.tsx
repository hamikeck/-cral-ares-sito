import Link from 'next/link'
import { contenutiPagine } from '@/contenuti/pagine'

export default function Home() {
  const { titolo, occhiello, invito } = contenutiPagine.home

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold sm:text-4xl">{titolo}</h1>
        <p className="max-w-2xl text-lg">{occhiello}</p>
        <div>
          <Link
            href="/iscriviti"
            className="fuoco inline-block rounded-lg bg-blu-profondo px-5 py-3 font-semibold text-white hover:bg-blu-notte"
          >
            {invito}
          </Link>
        </div>
      </section>
    </div>
  )
}
