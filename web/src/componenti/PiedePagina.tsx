import Link from 'next/link'
import { vociLegali } from '@/contenuti/navigazione'
import { contenutiPagine } from '@/contenuti/pagine'

export function PiedePagina() {
  const { nome, sottotitolo, email } = contenutiPagine.associazione

  return (
    <footer className="mt-16 border-t border-filo">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:justify-between">
        <div>
          <p className="font-semibold">{nome}</p>
          <p className="text-sm text-tenue">{sottotitolo}</p>
          <p className="mt-2 text-sm">
            <a
              href={`mailto:${email}`}
              className="fuoco-su-scuro rounded text-luce underline underline-offset-4"
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
                  className="fuoco-su-scuro rounded text-luce underline underline-offset-4"
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
