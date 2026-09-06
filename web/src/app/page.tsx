import Link from 'next/link'
import { SchedaOfferta } from '@/componenti/SchedaOfferta'
import { contenutiPagine } from '@/contenuti/pagine'
import { altreOfferte, offertaInEvidenza } from '@/contenuti/offerteEsempio'

/**
 * La home.
 *
 * L'ordine non è quello consueto — prima chi siamo, poi cosa offriamo — ma
 * quello di chi arriva: un socio apre il sito per vedere cosa c'è adesso.
 * Quindi l'offerta in corso viene prima della spiegazione, e il titolo della
 * pagina resta volutamente piccolo mentre il vantaggio dell'offerta è
 * l'elemento grande. La gerarchia del codice resta corretta (un solo h1),
 * quella visiva segue ciò che il lettore cerca davvero.
 *
 * In fase 2 `offertaInEvidenza` e `altreOfferte` arriveranno dal database.
 * Il caso in cui non ci sia alcuna offerta è già gestito qui, perché è una
 * settimana come un'altra e non deve produrre una pagina rotta.
 */
export default function Home() {
  const {
    titolo,
    occhiello,
    avvisoDimostrativo,
    titoloEvidenza,
    titoloAltre,
    nessunaOfferta,
    titoloCosaTrovi,
    cosaTrovi,
    titoloIscrizione,
    testoIscrizione,
    invito,
  } = contenutiPagine.home

  const inEvidenza = offertaInEvidenza()
  const altre = altreOfferte()

  return (
    <>
      <section className="flex flex-col gap-6">
        <div className="flex max-w-2xl flex-col gap-3">
          <h1 className="text-titolo-sezione text-inchiostro">{titolo}</h1>
          <p className="text-corpo text-inchiostro-tenue">{occhiello}</p>
        </div>

        <p className="max-w-2xl border-l-2 border-azzurro bg-fascia px-4 py-3 text-sm text-inchiostro-tenue">
          {avvisoDimostrativo}
        </p>

        {inEvidenza ? (
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl text-inchiostro">{titoloEvidenza}</h2>
            <SchedaOfferta offerta={inEvidenza} inEvidenza />
          </div>
        ) : (
          <p className="max-w-prose text-corpo">{nessunaOfferta}</p>
        )}
      </section>

      {altre.length > 0 && (
        <section className="mt-14 flex flex-col gap-5">
          <h2 className="text-2xl text-inchiostro">{titoloAltre}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {altre.map((offerta) => (
              <SchedaOfferta key={offerta.slug} offerta={offerta} />
            ))}
          </div>
          <p>
            <Link
              href="/offerte"
              className="fuoco-su-chiaro rounded font-semibold text-ambra-scura underline underline-offset-4"
            >
              {contenutiPagine.offerte.vediTutte}
            </Link>
          </p>
        </section>
      )}

      <section className="mt-14 flex flex-col gap-5">
        <h2 className="text-2xl text-inchiostro">{titoloCosaTrovi}</h2>
        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-3">
          {cosaTrovi.map((voce) => (
            <div key={voce.titolo} className="border-t-2 border-linea pt-4">
              <h3 className="text-lg text-inchiostro">{voce.titolo}</h3>
              <p className="mt-2 text-corpo">{voce.testo}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 flex flex-col items-start gap-4 bg-fascia px-6 py-8 sm:px-10 sm:py-10">
<h2 className="text-2xl text-inchiostro">{titoloIscrizione}</h2>
        <p className="max-w-prose text-corpo">{testoIscrizione}</p>
        <Link
          href="/iscriviti"
          className="fuoco-su-chiaro bg-blu-profondo px-5 py-3 font-semibold text-white hover:bg-blu-notte"
        >
          {invito}
        </Link>
      </section>
    </>
  )
}
