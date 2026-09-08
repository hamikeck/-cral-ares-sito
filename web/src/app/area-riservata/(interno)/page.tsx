import type { Metadata } from 'next'
import Link from 'next/link'
import { tutteLeOfferte } from '@/dati/offerteRiservate'
import { statoLeggibile } from '@/dominio/statoOfferta'
import { formattaData } from '@/lib/date'

export const metadata: Metadata = {
  title: 'Le offerte',
  robots: { index: false, follow: false },
}

export default async function AreaRiservata() {
  const offerte = await tutteLeOfferte()

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-titolo-pagina text-inchiostro">Le offerte</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/area-riservata/offerte/nuova"
            className="fuoco-su-chiaro border border-blu-profondo bg-blu-profondo px-4 py-2 font-semibold text-white"
          >
            Nuova offerta
          </Link>
          {/* Un Route Handler, non una Server Action: solo lui può scrivere
              i cookie della risposta e chiudere la sessione per davvero.
              Ed è un <form method="post">, non un <Link>: un <Link> verso
              un indirizzo che chiude la sessione via GET verrebbe precaricato
              da Next appena entra nel viewport — cioè da solo, in produzione,
              dal primo istante di ogni visita a questa pagina. Vedi
              web/src/app/area-riservata/uscita/route.ts. */}
          <form action="/area-riservata/uscita" method="post">
            <button
              type="submit"
              className="fuoco-su-chiaro rounded text-sm underline underline-offset-4"
            >
              Esci
            </button>
          </form>
        </div>
      </div>

      {offerte.length === 0 ? (
        <p className="mt-8 text-corpo">
          Non c’è ancora nessuna offerta. Comincia da «Nuova offerta».
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <caption className="sr-only">
              Elenco delle offerte, dalla più recente modifica
            </caption>
            <thead>
              <tr className="border-b border-linea text-sm text-inchiostro-tenue">
                <th scope="col" className="py-2 pr-4 font-semibold">Partner</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Categoria</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Stato</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Valida fino al</th>
                <th scope="col" className="py-2 font-semibold">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {offerte.map((offerta) => (
                <tr key={offerta.id} className="border-b border-linea align-top">
                  <td className="py-3 pr-4 font-semibold">{offerta.partner}</td>
                  <td className="py-3 pr-4">{offerta.categoria}</td>
                  <td className="py-3 pr-4">{statoLeggibile(offerta)}</td>
                  <td className="py-3 pr-4">
                    {offerta.validaAl ? formattaData(offerta.validaAl) : '—'}
                  </td>
                  <td className="py-3">
                    <Link
                      href={`/area-riservata/offerte/${offerta.id}`}
                      className="fuoco-su-chiaro rounded font-semibold text-ambra-scura underline underline-offset-4"
                    >
                      Modifica
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
