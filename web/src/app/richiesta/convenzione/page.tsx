import type { Metadata } from 'next'
import { ModuloConvenzione } from '@/componenti/ModuloConvenzione'

export const metadata: Metadata = {
  title: 'Richiedi una convenzione',
  description:
    'Sconti concordati con negozi e professionisti della zona, riservati ai soci del CRAL ARES.',
}

/**
 * Il modulo delle convenzioni.
 *
 * Non ha bisogno di leggere niente dal database: le convenzioni non sono un
 * elenco da cui scegliere ma una domanda aperta. È anche il modo in cui i
 * direttori scoprono cosa cercare — se in tre chiedono il dentista, sanno con
 * chi provare a convenzionarsi.
 */
export default function RichiestaConvenzione() {
  return (
    <section className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-titolo-pagina text-chiaro">Richiedi una convenzione</h1>
        <p className="mt-3 text-corpo text-lettura">
          Anche se non è ancora in elenco: chiedila lo stesso, i direttori vanno a cercarla.
        </p>
      </div>

      <ModuloConvenzione />
    </section>
  )
}
