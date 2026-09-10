import type { Metadata } from 'next'
import Link from 'next/link'
import { SchedaOfferta } from '@/componenti/SchedaOfferta'
import { contenutiPagine } from '@/contenuti/pagine'
import { offerteValide } from '@/dati/offerte'
import { categorieDi, perCategoria } from '@/dominio/selezione'

export const metadata: Metadata = {
  title: contenutiPagine.offerte.titolo,
}

/**
 * L'elenco completo delle offerte.
 *
 * Il filtro per categoria passa dall'indirizzo (`?categoria=Cinema`) invece
 * che da uno stato nel browser. Costa una ricarica, ma in cambio ogni filtro
 * è un indirizzo che si può salvare o mandare per messaggio — «guarda le
 * convenzioni auto» diventa un link — funziona senza JavaScript, e la
 * navigazione col tasto indietro si comporta come chiunque si aspetta.
 */
export default async function Offerte({
  searchParams,
}: {
  searchParams: Promise<{ [chiave: string]: string | string[] | undefined }>
}) {
  const { titolo, occhiello, filtroEtichetta, tutte, nessuna } =
    contenutiPagine.offerte
  const { avvisoDimostrativo } = contenutiPagine.home

  const valide = await offerteValide()
  const elencoCategorie = categorieDi(valide)

  const parametri = await searchParams
  const richiesta = parametri.categoria
  const categoriaScelta =
    typeof richiesta === 'string' && elencoCategorie.includes(richiesta)
      ? richiesta
      : undefined

  const elenco = perCategoria(valide, categoriaScelta)

  return (
    <>
      <div className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-titolo-pagina text-chiaro">{titolo}</h1>
        <p className="text-corpo text-tenue">{occhiello}</p>
      </div>

      <p className="mt-6 max-w-2xl border-l-2 border-azzurro bg-pannello px-4 py-3 text-sm text-tenue">
        {avvisoDimostrativo}
      </p>

      <nav className="mt-8" aria-label={filtroEtichetta}>
        <ul className="flex flex-wrap gap-2">
          <li>
            <Link
              href="/offerte"
              aria-current={categoriaScelta ? undefined : 'true'}
              className={
                categoriaScelta
                  ? 'fuoco-su-scuro inline-block rounded-full border border-parete px-3 py-1.5 text-sm text-lettura hover:border-luce'
                  : 'fuoco-su-scuro inline-block rounded-full border border-luce bg-luce px-3 py-1.5 text-sm font-bold text-notte'
              }
            >
              {tutte}
            </Link>
          </li>
          {elencoCategorie.map((categoria) => {
            const attiva = categoria === categoriaScelta
            return (
              <li key={categoria}>
                <Link
                  href={`/offerte?categoria=${encodeURIComponent(categoria)}`}
                  aria-current={attiva ? 'true' : undefined}
                  className={
                    attiva
                      ? 'fuoco-su-scuro inline-block rounded-full border border-luce bg-luce px-3 py-1.5 text-sm font-bold text-notte'
                      : 'fuoco-su-scuro inline-block rounded-full border border-parete px-3 py-1.5 text-sm text-lettura hover:border-luce'
                  }
                >
                  {categoria}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {elenco.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {elenco.map((offerta) => (
            <SchedaOfferta key={offerta.slug} offerta={offerta} titolo="h2" />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-corpo">{nessuna}</p>
      )}
    </>
  )
}
