import type { Offerta } from './offerta'

/**
 * Cosa mostrare, dato un elenco di offerte già valide.
 *
 * Sono funzioni pure e senza database di proposito: la regola «l'offerta in
 * evidenza è una sola, e può non esserci» è una regola del CRAL, non una
 * query, e va verificata senza chiedere niente alla rete.
 */

/** Le categorie presenti, in ordine alfabetico italiano. */
export function categorieDi(offerte: Offerta[]): string[] {
  return [...new Set(offerte.map((offerta) => offerta.categoria))].sort(
    (prima, seconda) => prima.localeCompare(seconda, 'it'),
  )
}

/** Le offerte di una categoria, o tutte se non se ne indica nessuna. */
export function perCategoria(offerte: Offerta[], categoria?: string): Offerta[] {
  if (!categoria) return offerte
  return offerte.filter((offerta) => offerta.categoria === categoria)
}

/**
 * L'offerta della settimana, quella che apre la home.
 *
 * Restituisce `undefined` quando non ce n'è nessuna: è una settimana come
 * un'altra e le pagine devono saperlo gestire, non rompersi.
 */
export function inEvidenza(offerte: Offerta[]): Offerta | undefined {
  return offerte.find((offerta) => offerta.inEvidenza)
}

/** Tutte le altre, nell'ordine in cui arrivano. */
export function altre(offerte: Offerta[]): Offerta[] {
  return offerte.filter((offerta) => !offerta.inEvidenza)
}
