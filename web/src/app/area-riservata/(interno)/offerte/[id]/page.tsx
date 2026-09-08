import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { eliminaOfferta } from '@/app/azioni/offerte'
import { CopiaTestoEmail } from '@/componenti/CopiaTestoEmail'
import { ModuloOfferta } from '@/componenti/ModuloOfferta'
import { ambiente } from '@/dati/ambiente'
import { offertaPerId } from '@/dati/offerteRiservate'
import { testoPerEmail } from '@/dominio/testoEmail'

export const metadata: Metadata = {
  title: 'Modifica offerta',
  robots: { index: false, follow: false },
}

export default async function ModificaOfferta({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [chiave: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const { salvata } = await searchParams
  const offerta = await offertaPerId(id)

  if (!offerta) notFound()

  return (
    <section>
      <h1 className="text-titolo-pagina text-inchiostro">Modifica offerta</h1>

      {salvata ? (
        <p role="status" className="mt-4 border-l-4 border-azzurro bg-fascia px-4 py-3 text-corpo">
          {offerta.stato === 'pubblicata'
            ? 'Salvata. È già visibile sul sito.'
            : 'Salvata in bozza. Non è ancora visibile ai soci.'}
        </p>
      ) : null}

      {offerta.stato === 'pubblicata' ? (
        <CopiaTestoEmail testo={testoPerEmail(offerta, ambiente().sitoUrl)} />
      ) : null}

      <div className="mt-8">
        <ModuloOfferta offerta={offerta} />
      </div>

      <details className="mt-12 border border-linea p-4">
        <summary className="cursor-pointer font-semibold">Elimina questa offerta</summary>
        <p className="mt-3 max-w-prose text-corpo">
          Stai per eliminare definitivamente «{offerta.partner} — {offerta.vantaggio}».
          Se vuoi solo toglierla dal sito, usa «Salva bozza»: resta scritta e la puoi
          ripubblicare quando vuoi. Elimina solo se questa bozza non ti serve più.
        </p>
        <form action={eliminaOfferta} className="mt-4">
          <input type="hidden" name="id" value={offerta.id} />
          <button
            type="submit"
            className="fuoco-su-chiaro border border-ambra-scura px-4 py-2 font-semibold text-ambra-scura"
          >
            Elimina definitivamente
          </button>
        </form>
      </details>
    </section>
  )
}
