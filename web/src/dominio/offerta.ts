/**
 * Un'offerta, come la vedono le pagine.
 *
 * Non è la riga del database: i nomi sono quelli del sito, non quelli di
 * PostgreSQL, e i campi nulli sono `undefined` invece che `null`. La
 * traduzione sta in `dati/mappaOfferta.ts`, ed è l'unico punto che conosce
 * entrambe le forme.
 */

/** Come il socio ottiene il vantaggio. Rispecchia l'enum `modalita_offerta`. */
export type ModalitaOfferta = 'biglietti' | 'convenzione' | 'solo_sconto'

/** I recapiti del partner: al socio servono per andarci di persona. */
export type Contatti = {
  indirizzo?: string
  telefono?: string
  sito?: string
  codiceSconto?: string
}

export type Offerta = {
  slug: string
  partner: string
  categoria: string
  /** Il motivo per cui il socio si ferma a leggere. Va scritto corto. */
  vantaggio: string
  /** Una riga, per le schede negli elenchi. */
  descrizione: string
  /** Il testo completo, mostrato solo nella pagina dell'offerta. */
  descrizioneCompleta: string
  /** Le regole che il socio deve conoscere prima di chiedere. */
  condizioni: string[]
  /** Date ISO `AAAA-MM-GG`: servono a calcolare la validità, non a essere lette. */
  validaDal: string
  /** Assente per le convenzioni permanenti: non hanno una data di fine. */
  validaAl?: string
  modalita: ModalitaOfferta
  /** Per `solo_sconto`: cosa deve fare il socio, senza passare da noi. */
  istruzioni?: string
  inEvidenza: boolean
  contatti: Contatti
}
