/**
 * Le date del sito.
 *
 * Sono scritte e confrontate come stringhe ISO `AAAA-MM-GG`, e mostrate in
 * italiano. Due scelte, entrambe con un motivo.
 *
 * **Confronto come stringhe.** Due date ISO si confrontano con `<` e `>` e
 * danno l'ordine giusto, senza costruire oggetti `Date`. Questo evita il
 * problema più insidioso del mestiere: un `new Date('2026-09-30')` vale
 * mezzanotte UTC, che in Italia è già il 30 alle 2 del mattino ma in altri
 * fusi è ancora il 29. Un'offerta che scade «il 30 settembre» scade a fine
 * giornata italiana, non a un istante preciso, quindi il giorno è l'unità
 * giusta e l'ora è rumore.
 *
 * **Formattazione con Intl.** Produce «30 settembre 2026» senza tabelle di
 * mesi scritte a mano, ed è l'unico modo per non sbagliare le forme che
 * l'italiano ha e l'inglese no.
 */

/** Oggi, come stringa ISO nel fuso italiano. */
export function oggi(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })
}

/** «2026-09-30» diventa «30 settembre 2026». */
export function formattaData(iso: string): string {
  const [anno, mese, giorno] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(anno, mese - 1, giorno))
}

/**
 * Vero se la data è già passata.
 *
 * Una data assente non è mai scaduta: è la convenzione permanente, che non ha
 * una fine da confrontare e resta valida finché non la ritira a mano un
 * direttore.
 */
export function scaduta(iso: string | undefined, adesso = oggi()): boolean {
  return iso !== undefined && iso < adesso
}

/** Vero se la data non è ancora arrivata. */
export function nonAncoraIniziata(iso: string, adesso = oggi()): boolean {
  return iso > adesso
}

/** Come si racconta la scadenza di un'offerta al socio. */
export type Scadenza = {
  tipo: 'sempre' | 'da-indicare' | 'scaduta' | 'vicina' | 'lontana'
  testo: string
}

/**
 * Sotto questa soglia la scadenza si conta in giorni e si accende in ambra.
 *
 * Un mese: sopra, l'urgenza sarebbe finta — un avviso che suona per sei mesi
 * smette di essere un avviso — e la data per esteso dice di più.
 */
const GIORNI_VICINI = 30

/** Quanti giorni interi separano due date ISO. */
function giorniFra(da: string, a: string): number {
  const [annoDa, meseDa, giornoDa] = da.split('-').map(Number)
  const [annoA, meseA, giornoA] = a.split('-').map(Number)

  // Il conto passa da `Date.UTC` e non dal fuso locale: il 25 ottobre 2026,
  // giorno in cui finisce l'ora legale, dura 25 ore, e una differenza in
  // millisecondi calcolata in locale darebbe 2,04 giorni dove sono 3.
  return (
    (Date.UTC(annoA, meseA - 1, giornoA) - Date.UTC(annoDa, meseDa - 1, giornoDa)) / 86_400_000
  )
}

/**
 * La scadenza in parole, con il tipo che dice come renderla.
 *
 * Cinque casi, e ciascuno esiste per una ragione vera:
 *
 * - **assente** è la convenzione permanente (`valida_al` nullo sul database):
 *   dice «Senza scadenza» e non si inventa una data;
 * - **stringa vuota** capita solo nell'anteprima del modulo, prima che il
 *   direttore scriva: lì la scelta non è stata fatta, ed è diverso dal non
 *   averne una;
 * - **passata** non dovrebbe mai arrivare al pubblico, perché le offerte
 *   scadute sono già filtrate, ma l'area riservata mostra anche quelle: il
 *   conto non deve produrre «Mancano -3 giorni»;
 * - **vicina** conta i giorni, ed è l'unico caso che si accende;
 * - **lontana** scrive la data per esteso.
 */
export function descriviScadenza(validaAl: string | undefined, adesso = oggi()): Scadenza {
  if (validaAl === undefined) return { tipo: 'sempre', testo: 'Senza scadenza' }
  if (validaAl === '') return { tipo: 'da-indicare', testo: 'Scadenza da indicare' }

  const giorni = giorniFra(adesso, validaAl)

  if (giorni < 0) return { tipo: 'scaduta', testo: 'Scaduta' }
  if (giorni === 0) return { tipo: 'vicina', testo: 'Scade oggi' }
  if (giorni === 1) return { tipo: 'vicina', testo: 'Scade domani' }
  if (giorni <= GIORNI_VICINI) return { tipo: 'vicina', testo: `Mancano ${giorni} giorni` }

  return { tipo: 'lontana', testo: `Fino al ${formattaData(validaAl)}` }
}
