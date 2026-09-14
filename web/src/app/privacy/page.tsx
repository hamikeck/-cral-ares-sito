import type { Metadata } from 'next'
import { contenutiPagine } from '@/contenuti/pagine'

export const metadata: Metadata = {
  title: contenutiPagine.privacy.titolo,
}

/**
 * L'informativa privacy.
 *
 * Fino al 14 settembre 2026 questa pagina diceva soltanto «in corso di
 * redazione», e la casella del consenso dei moduli rimandava qui: un consenso
 * che rimanda al nulla non è un consenso. Ora dice tutto quello che sappiamo
 * per certo, e dichiara mancante l'unica cosa che manca davvero — l'identità
 * del titolare, che deve darci il direttivo.
 */
export default function Privacy() {
  const { titolo, introduzione, notaProvvisoria, sezioni } = contenutiPagine.privacy

  return (
    <article className="flex max-w-2xl flex-col gap-8 text-corpo">
      <div className="flex flex-col gap-4">
        <h1 className="text-titolo-pagina text-chiaro">{titolo}</h1>
        <p className="text-lettura">{introduzione}</p>
        <p className="border-l-4 border-luce/60 bg-pannello px-4 py-3 text-sm text-lettura">
          {notaProvvisoria}
        </p>
      </div>

      {sezioni.map((sezione) => (
        <section key={sezione.titolo} className="flex flex-col gap-3">
          <h2 className="text-2xl text-chiaro">{sezione.titolo}</h2>
          {sezione.paragrafi.map((paragrafo) => (
            <p key={paragrafo} className="text-lettura">
              {paragrafo}
            </p>
          ))}
        </section>
      ))}
    </article>
  )
}
