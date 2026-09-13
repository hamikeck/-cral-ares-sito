import type { Metadata } from 'next'
import Link from 'next/link'
import { ModuloCinema } from '@/componenti/ModuloCinema'
import { circuitiConSedi } from '@/dati/circuiti'

export const metadata: Metadata = {
  title: 'Richiedi biglietti del cinema',
  description:
    'Biglietti dei circuiti convenzionati a prezzo ridotto, riservati ai soci del CRAL ARES.',
}

/** I circuiti cambiano una volta l'anno: la pagina si rigenera ogni ora. */
export const revalidate = 3600

/**
 * Il modulo dei biglietti del cinema.
 *
 * È lo schermo su cui si gioca il progetto: il cinema è il servizio che gira
 * ogni mese, mentre le offerte a tempo vanno e vengono. Per questo è il più
 * corto del sito, e per questo la pagina non ha altro intorno.
 */
export default async function RichiestaCinema() {
  const circuiti = await circuitiConSedi()

  if (circuiti.length === 0) {
    // Succede finché il direttivo non consegna l'elenco dei circuiti. Meglio
    // dirlo che mostrare un menu vuoto in cui non si può scegliere niente.
    return (
      <section className="flex max-w-2xl flex-col gap-4">
        <h1 className="text-titolo-pagina text-chiaro">Richiedi biglietti del cinema</h1>
        <p className="text-corpo text-lettura">
          Il servizio sta per aprire: i circuiti convenzionati non sono ancora in elenco. Torna
          fra qualche giorno, oppure scrivi ai direttori.
        </p>
        <Link
          href="/"
          className="fuoco-su-scuro self-start rounded font-semibold text-luce underline underline-offset-4"
        >
          Torna alla home
        </Link>
      </section>
    )
  }

  return (
    <section className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-titolo-pagina text-chiaro">Richiedi biglietti del cinema</h1>
        <p className="mt-3 text-corpo text-lettura">
          Due minuti. Ti risponde un direttore, non un sistema automatico.
        </p>
      </div>

      <ModuloCinema circuiti={circuiti} />
    </section>
  )
}
