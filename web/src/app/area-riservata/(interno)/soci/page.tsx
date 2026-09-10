import type { Metadata } from 'next'
import Link from 'next/link'
import { PannelloSoci } from '@/componenti/PannelloSoci'
import { tuttiISoci } from '@/dati/soci'

export const metadata: Metadata = {
  title: 'I soci',
  robots: { index: false, follow: false },
}

/**
 * La pagina dei soci: una schermata, tre azioni.
 *
 * Esiste per una ragione sola, deliberata in riunione il 3 settembre 2026:
 * solo chi risulta in questo elenco potrà inviare una richiesta, così i
 * direttori non ricevono email di sconosciuti.
 *
 * Le righe si leggono qui, sul server, dove la sessione del redattore è già
 * verificata dal guscio dell'area riservata; il filtro invece vive nel
 * browser, perché deve rispondere mentre si scrive.
 */
export default async function PaginaSoci() {
  const soci = await tuttiISoci()

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-titolo-pagina text-chiaro">I soci</h1>
        <Link
          href="/area-riservata"
          className="fuoco-su-scuro rounded text-sm font-semibold text-luce underline underline-offset-4"
        >
          Torna alle offerte
        </Link>
      </div>

      <PannelloSoci soci={soci} />
    </section>
  )
}
