/**
 * I tipi delle righe, copia fedele delle migrazioni in `supabase/migrations/`.
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

/** Copia fedele di `supabase/migrations/0004_soci.sql`. */
export type RigaSocio = {
  id: string
  nome: string
  cognome: string
  email: string
  codice_dipendente: string
  telefono: string | null
  note: string | null
}

/** Le colonne da chiedere a Supabase per costruire un `Socio`. */
export const COLONNE_SOCIO = 'id, nome, cognome, email, codice_dipendente, telefono, note'

/** Copia fedele di `supabase/migrations/0006_richieste.sql`. */
export type RigaSede = {
  id: string
  nome: string
  citta: string | null
  link_programmazione: string | null
  ordine: number
}

export type RigaCircuito = {
  id: string
  nome: string
  prezzo_socio: number | null
  ordine: number
  sedi: RigaSede[]
}

/** Copia fedele di `supabase/migrations/0006_richieste.sql` e `0008`. */
export type RigaRichiesta = {
  id: string
  numero: number
  tipo: 'cinema' | 'convenzione' | 'offerta'
  creata_il: string
  nome: string
  cognome: string
  codice_dipendente: string
  email: string
  telefono: string | null
  consegna: string | null
  email_personale: string | null
  pagamento: 'bonifico' | 'busta_paga' | null
  importo: string | number | null
  quantita: number | null
  circuito: string | null
  sede: string | null
  convenzione: string | null
  titolo_evento: string | null
  data_preferita: string | null
  orario_preferito: string | null
  messaggio: string | null
  email_inviata: boolean
  offerte: { partner: string; vantaggio: string } | null
}

/**
 * Le colonne di una richiesta, con il partner dell'offerta collegata.
 *
 * L'offerta arriva annidata in una sola interrogazione: senza, l'elenco
 * mostrerebbe «Informazioni» senza dire di cosa, e il direttore dovrebbe
 * aprire la richiesta per scoprirlo.
 */
export const COLONNE_RICHIESTA =
  'id, numero, tipo, creata_il, nome, cognome, codice_dipendente, email, telefono, ' +
  'consegna, email_personale, pagamento, importo, quantita, circuito, sede, convenzione, ' +
  'titolo_evento, data_preferita, orario_preferito, messaggio, email_inviata, ' +
  'offerte(partner, vantaggio)'
