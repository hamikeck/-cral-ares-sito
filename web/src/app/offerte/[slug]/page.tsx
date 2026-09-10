import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { contenutiPagine } from '@/contenuti/pagine'
import { offertaDaSlug, slugPubblicati } from '@/dati/offerte'
import { formattaData, scaduta } from '@/lib/date'

/**
 * Le pagine si rigenerano ogni ora.
 *
 * Senza questo, una pagina statica congela il giorno della build: un'offerta
 * scaduta ieri resterebbe in elenco finché qualcuno non ripubblica il sito.
 * È la riga che rende vera la promessa «le offerte scadute spariscono da
 * sole» senza chiedere niente a nessuno.
 */
export const revalidate = 3600

/** Una pagina statica per ogni offerta, generata alla build. */
export async function generateStaticParams() {
  return (await slugPubblicati()).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const offerta = await offertaDaSlug(slug)
  if (!offerta) return {}
  return {
    title: `${offerta.partner} — ${offerta.vantaggio}`,
    description: offerta.descrizione,
  }
}

/**
 * La scheda completa di un'offerta.
 *
 * È la pagina che il socio apre dal link ricevuto per email, quindi deve
 * reggere da sola: dice di cosa si tratta, a quali condizioni, e cosa fare
 * per ottenerlo. Quest'ultima parte dipende dalla modalità dell'offerta —
 * uno sconto da esibire alla cassa non si richiede a nessuno.
 */
export default async function PaginaOfferta({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const offerta = await offertaDaSlug(slug)

  if (!offerta) notFound()

  const terminata = scaduta(offerta.validaAl)

  const {
    scaduta: testoScaduta,
    titoloCondizioni,
    titoloComeFunziona,
    titoloRichiesta,
    richiestaNonAncora,
    torna,
  } = contenutiPagine.offerta
  const { email } = contenutiPagine.associazione

  return (
    <article className="flex max-w-3xl flex-col gap-8">
      <div>
        <p className="text-sm text-tenue">{offerta.categoria}</p>
        <h1 className="mt-1 text-titolo-pagina text-chiaro">
          {offerta.partner}
        </h1>
        <p
          className={
            terminata
              ? 'mt-4 font-titolo text-vantaggio font-bold text-tenue'
              : 'mt-4 font-titolo text-vantaggio font-bold text-oro'
          }
        >
          {offerta.vantaggio}
        </p>
        <p className="mt-4 text-corpo">{offerta.descrizioneCompleta}</p>
        <p className="mt-5 border-t border-parete pt-3 text-sm text-tenue">
          {/* `terminata` è vero solo quando `validaAl` è una data passata:
              `scaduta()` risponde sempre falso a una data assente, quindi il
              ramo «Era valida» non chiama mai `formattaData` su un'offerta
              permanente. */}
          {terminata
            ? `Era valida fino al ${formattaData(offerta.validaAl!)}`
            : offerta.validaAl
              ? `Valida fino al ${formattaData(offerta.validaAl)}`
              : 'Sempre valida'}
        </p>
      </div>

      <section>
        <h2 className="text-2xl text-chiaro">{titoloCondizioni}</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {offerta.condizioni.map((condizione) => (
            <li
              key={condizione}
              className="border-l-2 border-parete pl-4 text-corpo"
            >
              {condizione}
            </li>
          ))}
        </ul>
      </section>

      {terminata ? (
        <p className="border-l-4 border-oro/50 bg-pannello px-5 py-6 text-corpo sm:px-8">
          {testoScaduta} Guarda{' '}
          <Link
            href="/offerte"
            className="fuoco-su-scuro rounded font-semibold text-luce underline underline-offset-4"
          >
            le offerte in corso
          </Link>
          .
        </p>
      ) : (
      <section className="bg-pannello px-5 py-6 sm:px-8">
        {offerta.modalita === 'solo_sconto' ? (
          <>
            <h2 className="text-2xl text-chiaro">{titoloComeFunziona}</h2>
            <p className="mt-3 max-w-prose text-corpo">{offerta.istruzioni}</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl text-chiaro">{titoloRichiesta}</h2>
            <p className="mt-3 max-w-prose text-corpo">
              {richiestaNonAncora}{' '}
              <a
                href={`mailto:${email}`}
                className="fuoco-su-scuro rounded font-semibold text-luce underline underline-offset-4"
              >
                {email}
              </a>
            </p>
          </>
        )}
      </section>
      )}

      <p>
        <Link
          href="/offerte"
          className="fuoco-su-scuro rounded font-semibold text-luce underline underline-offset-4"
        >
          {torna}
        </Link>
      </p>
    </article>
  )
}
