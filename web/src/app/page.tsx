import Link from 'next/link'
import { SchedaOfferta } from '@/componenti/SchedaOfferta'
import { contenutiPagine } from '@/contenuti/pagine'
import { offerteValide } from '@/dati/offerte'
import { altre, inEvidenza } from '@/dominio/selezione'

/**
 * Le pagine si rigenerano ogni ora.
 *
 * Senza questo, una pagina statica congela il giorno della build: un'offerta
 * scaduta ieri resterebbe in elenco finché qualcuno non ripubblica il sito.
 * È la riga che rende vera la promessa «le offerte scadute spariscono da
 * sole» senza chiedere niente a nessuno.
 */
export const revalidate = 3600

/**
 * La home.
 *
 * Riscritta a settembre 2026, e la struttura è la decisione: prima era
 * marchio, frase, due pulsanti, e il prezzo arrivava terzo dentro una scheda.
 * Adesso il primo schermo tiene insieme **l'insegna e le offerte** — un socio
 * che apre il sito e non scorre nemmeno una volta ha già visto chi siamo e
 * cosa c'è adesso.
 *
 * L'ordine dei blocchi non è quello consueto — prima chi siamo, poi cosa
 * offriamo — ma quello di chi arriva. La home è la pagina principale del
 * sito: i soci ci tornano per vedere le novità, non ci passano una volta
 * sola. Da qui il nastro in cima e le due porte subito sotto, che valgono
 * anche nelle settimane in cui i direttori non pubblicano niente.
 *
 * Il titolo di primo livello resta uno solo ed è testuale: sta accanto al
 * marchio, che è un'immagine, e a uno screen reader il nome dell'associazione
 * va detto una volta e bene.
 */
export default async function Home() {
  const {
    titolo,
    occhiello,
    titoloNastro,
    scorriNastro,
    vediTutteLeOfferte,
    nessunaOfferta,
    porte,
    titoloPassi,
    passi,
    titoloIscrizione,
    testoIscrizione,
    invito,
  } = contenutiPagine.home

  const valide = await offerteValide()
  const principale = inEvidenza(valide)
  const nastro = principale ? [principale, ...altre(valide)] : altre(valide)

  return (
    <>
      {/* L'insegna sborda dal contenitore della pagina per arrivare a filo
          della testata e dei bordi dello schermo: la facciata è una cosa
          sola, e un margine bianco intorno la spezzerebbe in due. */}
      <section className="relative -mx-4 -mt-10 overflow-hidden px-4 pt-8 pb-6">
        <div className="alone" aria-hidden="true" />

        <div className="relative text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-cral-ares.svg"
            alt=""
            width={553}
            height={163}
            className="mx-auto w-full max-w-72 drop-shadow-[0_1px_4px_rgba(255,224,180,0.45)]"
          />
          <h1 className="mt-4 text-base font-normal text-tenue">{titolo}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-lettura">{occhiello}</p>
        </div>

        <div className="relative mt-8">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl text-chiaro">{titoloNastro}</h2>
            <Link
              href="/offerte"
              className="fuoco-su-scuro shrink-0 rounded text-sm font-semibold text-luce underline underline-offset-4"
            >
              {vediTutteLeOfferte}
            </Link>
          </div>

          {nastro.length > 0 ? (
            <>
              {/* Un nastro, non una giostra: niente si muove da solo, la carta
                  successiva sbircia dal bordo e tutte restano raggiungibili —
                  col dito, con le frecce, con la tastiera. Una rotazione
                  automatica nasconderebbe sette offerte su otto e andrebbe
                  resa fermabile per il livello AA. */}
              <div
                role="region"
                aria-label={titoloNastro}
                tabIndex={0}
                className="fuoco-su-scuro mt-4 overflow-x-auto rounded pb-3"
              >
                <ul className="flex snap-x snap-mandatory gap-3">
                  {nastro.map((offerta, indice) => (
                    <li key={offerta.slug} className="w-64 shrink-0 snap-start">
                      <SchedaOfferta offerta={offerta} inEvidenza={indice === 0} />
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-1 text-xs text-tenue">{scorriNastro}</p>
            </>
          ) : (
            <p className="mt-4 max-w-prose text-corpo text-lettura">{nessunaOfferta}</p>
          )}
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-[3fr_2fr]">
        <div className="pannello flex flex-col border-oro/50 px-5 py-6">
          <p className="text-sm font-semibold text-luce">{porte.cinema.occhiello}</p>
          <h2 className="mt-1 text-2xl text-chiaro">{porte.cinema.titolo}</h2>
          <p className="mt-2 text-corpo text-lettura">{porte.cinema.testo}</p>
          <p className="mt-auto pt-5">
            <span className="fuoco-su-scuro block rounded-lg bg-oro py-3 text-center font-bold text-notte">
              {porte.cinema.invito}
            </span>
          </p>
          <p className="mt-2 text-xs text-tenue">{porte.cinema.nota}</p>
        </div>

        <div className="pannello flex flex-col px-5 py-6">
          <p className="text-sm font-semibold text-luce">{porte.convenzioni.occhiello}</p>
          <h2 className="mt-1 text-2xl text-chiaro">{porte.convenzioni.titolo}</h2>
          <p className="mt-2 text-corpo text-lettura">{porte.convenzioni.testo}</p>
          <p className="mt-auto pt-5">
            <span className="block rounded-lg border border-luce/45 py-3 text-center font-bold text-luce">
              {porte.convenzioni.invito}
            </span>
          </p>
        </div>
      </section>

      {/* L'unica cosa numerata del sito, perché è davvero una sequenza. */}
      <section className="mt-12">
        <h2 className="text-2xl text-chiaro">{titoloPassi}</h2>
        <ol className="mt-5 grid gap-5 sm:grid-cols-3">
          {passi.map((passo, indice) => (
            <li key={passo.titolo} className="flex gap-3 sm:flex-col">
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-full border border-luce/50 text-sm font-bold text-luce"
              >
                {indice + 1}
              </span>
              <div>
                <h3 className="text-base text-chiaro">{passo.titolo}</h3>
                <p className="mt-1 text-sm text-lettura">{passo.testo}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="pannello mt-12 flex flex-col items-start gap-3 px-6 py-8 sm:px-10">
        <h2 className="text-2xl text-chiaro">{titoloIscrizione}</h2>
        <p className="max-w-prose text-corpo text-lettura">{testoIscrizione}</p>
        <Link
          href="/iscriviti"
          className="fuoco-su-scuro mt-2 rounded-lg border border-luce/45 px-5 py-3 font-bold text-luce"
        >
          {invito}
        </Link>
      </section>
    </>
  )
}
