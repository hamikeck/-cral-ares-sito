import type { Offerta } from '@/contenuti/offerteEsempio'

/**
 * La scheda di un'offerta.
 *
 * È il pezzo di interfaccia che il socio incontra più spesso, quindi ha una
 * gerarchia sola: il vantaggio è l'elemento grande, tutto il resto sta
 * intorno in silenzio. Il partner è il titolo, la categoria e la scadenza
 * sono servizio.
 *
 * Nella variante `inEvidenza` la scheda prende un filo arancione a sinistra —
 * il richiamo dell'avviso appeso in bacheca — e su schermo largo si apre su
 * due colonne: a sinistra il vantaggio, a destra il dettaglio. Serve a due
 * cose: distinguere l'offerta della settimana dalle altre senza etichette, e
 * non lasciare mezza scheda vuota quando c'è spazio.
 */
export function SchedaOfferta({
  offerta,
  inEvidenza = false,
  titolo: Titolo = 'h3',
}: {
  offerta: Offerta
  inEvidenza?: boolean
  titolo?: 'h2' | 'h3'
}) {
  if (inEvidenza) {
    return (
      <article className="border-l-4 border-arancione bg-superficie px-5 py-6 sm:px-8 sm:py-8">
        <div className="grid gap-x-10 gap-y-5 lg:grid-cols-[5fr_6fr]">
          <div>
            <p className="text-sm text-inchiostro-tenue">{offerta.categoria}</p>
            <Titolo className="mt-1 text-titolo-sezione text-inchiostro">
              {offerta.partner}
            </Titolo>
            <p className="mt-4 font-titolo text-vantaggio font-bold text-blu-profondo">
              {offerta.vantaggio}
            </p>
          </div>
          <div className="flex flex-col lg:border-l lg:border-linea lg:pl-10">
            <p className="max-w-prose text-corpo">{offerta.descrizione}</p>
            <p className="mt-4 border-t border-linea pt-3 text-sm text-inchiostro-tenue lg:mt-auto">
              Valida fino al {offerta.validaAl}
            </p>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="flex flex-col border border-linea bg-superficie px-5 py-6">
      <p className="text-sm text-inchiostro-tenue">{offerta.categoria}</p>
      <Titolo className="mt-1 text-xl text-inchiostro">{offerta.partner}</Titolo>
      <p className="mt-3 font-titolo text-2xl font-bold text-blu-profondo">
        {offerta.vantaggio}
      </p>
      <p className="mt-3 max-w-prose text-corpo">{offerta.descrizione}</p>
      <p className="mt-4 border-t border-linea pt-3 text-sm text-inchiostro-tenue sm:mt-auto">
        Valida fino al {offerta.validaAl}
      </p>
    </article>
  )
}
