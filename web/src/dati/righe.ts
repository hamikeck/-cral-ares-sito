/**
 * I tipi delle righe, copia fedele di `supabase/migrations/0001_impianto.sql`.
 *
 * Sono scritti a mano invece che generati: il progetto ha tre tabelle, e un
 * passaggio di generazione da eseguire a ogni migrazione costa più di quanto
 * risparmi. Se un domani le tabelle diventassero dieci, si passa a
 * `supabase gen types typescript`.
 *
 * Regola: quando cambia una colonna, la migrazione e questo file cambiano
 * nello stesso commit.
 */

export type ModalitaRiga = 'solo_sconto' | 'biglietti' | 'convenzione'
export type StatoRiga = 'bozza' | 'pubblicata'

export type RigaOfferta = {
  slug: string
  partner: string
  categoria: string
  vantaggio: string
  descrizione_breve: string
  descrizione: string
  condizioni: string[]
  valida_dal: string
  /** Assente per le convenzioni permanenti, dalla migrazione 0003. */
  valida_al: string | null
  in_evidenza: boolean
  modalita: ModalitaRiga
  istruzioni: string | null
  indirizzo: string | null
  telefono: string | null
  link_partner: string | null
  codice_sconto: string | null
  stato: StatoRiga
}

/** Le colonne da chiedere a Supabase per costruire un'`Offerta`. */
export const COLONNE_OFFERTA =
  'slug, partner, categoria, vantaggio, descrizione_breve, descrizione, ' +
  'condizioni, valida_dal, valida_al, in_evidenza, modalita, istruzioni, ' +
  'indirizzo, telefono, link_partner, codice_sconto, stato'
