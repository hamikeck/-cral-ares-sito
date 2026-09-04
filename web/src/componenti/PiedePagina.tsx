import Link from 'next/link'
import { vociLegali } from '@/contenuti/navigazione'
import { contenutiPagine } from '@/contenuti/pagine'

export function PiedePagina() {
  const { nome, sottotitolo, email } = contenutiPagine.associazione

  return (
    <footer className="mt-16 bg-blu-notte text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:justify-between">
        <div>
          <p className="font-semibold">{nome}</p>
          <p className="text-sm text-azzurro">{sottotitolo}</p>
          <p className="mt-2 text-sm">
            <a
              href={`mailto:${email}`}
              className="rounded underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azzurro"
            >
              {email}
            </a>
          </p>
        </div>
        <nav aria-label="Informazioni legali">
          <ul className="flex gap-6 text-sm">
            {vociLegali.map((voce) => (
              <li key={voce.percorso}>
                <Link
                  href={voce.percorso}
                  className="rounded underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azzurro"
                >
                  {voce.etichetta}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
