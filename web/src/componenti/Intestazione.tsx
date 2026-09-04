import Link from 'next/link'
import { vociDiMenu } from '@/contenuti/navigazione'

export function Intestazione() {
  return (
    <header className="bg-blu-notte text-white">
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-blu-notte"
      >
        Salta al contenuto
      </a>
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-cral-ares.svg"
            alt="CRAL ARES"
            width={160}
            height={47}
            className="h-10 w-auto"
          />
        </Link>
        <nav aria-label="Menu principale">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {vociDiMenu.map((voce) => (
              <li key={voce.percorso}>
                <Link
                  href={voce.percorso}
                  className="rounded text-azzurro underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azzurro"
                >
                  {voce.etichetta}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
