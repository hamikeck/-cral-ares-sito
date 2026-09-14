import type { Metadata } from 'next'
import Link from 'next/link'
import { ElencoRichieste } from '@/componenti/ElencoRichieste'
import { tutteLeRichieste } from '@/dati/richiesteRiservate'

export const metadata: Metadata = {
  title: 'Le richieste',
  robots: { index: false, follow: false },
}

/**
 * Le richieste arrivate dai soci, in sola lettura.
 *
 * Serve a due cose che i direttori fanno davvero: **contare** — quanti
 * biglietti ordinare, per quale circuito — e **rispondere**, che è l'unico
 * modo in cui una richiesta si chiude. Non c'è un flusso di approvazione
 * perché il direttivo non ne ha voluto uno: con questi volumi sarebbe
 * burocrazia che nessuno compila.
 */
export default async function PaginaRichieste() {
  const richieste = await tutteLeRichieste()

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-titolo-pagina text-chiaro">Le richieste</h1>
        <div className="flex items-center gap-4">
          {richieste.length > 0 ? (
            <a
              href="/area-riservata/richieste/esporta"
              className="fuoco-su-scuro rounded-lg border border-luce bg-luce px-4 py-2 font-bold text-notte"
            >
              Scarica per Excel
            </a>
          ) : null}
          <Link
            href="/area-riservata"
            className="fuoco-su-scuro rounded text-sm font-semibold text-luce underline underline-offset-4"
          >
            Torna alle offerte
          </Link>
        </div>
      </div>

      <ElencoRichieste richieste={richieste} />
    </section>
  )
}
