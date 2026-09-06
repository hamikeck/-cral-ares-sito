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

/** Vero se la data è già passata: il giorno indicato è ancora valido. */
export function scaduta(iso: string, adesso = oggi()): boolean {
  return iso < adesso
}

/** Vero se la data non è ancora arrivata. */
export function nonAncoraIniziata(iso: string, adesso = oggi()): boolean {
  return iso > adesso
}
