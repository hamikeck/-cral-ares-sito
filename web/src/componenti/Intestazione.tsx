'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { vociDiMenu } from '@/contenuti/navigazione'

/**
 * La testata del sito.
 *
 * Sulla home il marchio non c'è: lo porta l'insegna, grande, subito sotto.
 * Due loghi nello stesso schermo — uno da quaranta pixel nella barra e uno
 * da duecento sotto — si guardano male e non aggiungono niente, visto che
 * nella barra il logo serve solo come strada per tornare a casa e da casa
 * non serve tornare.
 *
 * È l'unica ragione per cui questo componente sta sul client: legge il
 * percorso corrente e non altro. Nessun dato, nessuno stato.
 */
export function Intestazione() {
  const percorso = usePathname()
  const sullaHome = percorso === '/'

  return (
    <header className="border-b border-filo">
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-blu-notte"
      >
        Salta al contenuto
      </a>
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        {sullaHome ? null : (
          <Link href="/" className="fuoco-su-scuro flex items-center gap-3 rounded">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-cral-ares.svg"
              alt="CRAL ARES"
              width={160}
              height={47}
              className="h-10 w-auto"
            />
          </Link>
        )}
        <nav aria-label="Menu principale">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {vociDiMenu.map((voce) => (
              <li key={voce.percorso}>
                <Link
                  href={voce.percorso}
                  className="fuoco-su-scuro rounded font-semibold text-luce underline-offset-4 hover:underline"
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
