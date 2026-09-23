/**
 * Una richiesta di un socio, come la vedono i direttori.
 *
 * È in sola lettura: non esistono stati, non c'è un flusso di approvazione.
 * L'esito lo gestiscono i direttori rispondendo all'email, ed è una scelta del
 * direttivo — con questi volumi, un flusso strutturato sarebbe burocrazia che
 * nessuno compila.
 */
export type TipoRichiesta = 'cinema' | 'convenzione' | 'offerta'

export type Richiesta = {
  id: string
  /** Il numero progressivo: quello che compare nell'oggetto dell'email. */
  numero: number
  tipo: TipoRichiesta
  creataIl: string
  nome: string
  cognome: string
  codiceDipendente: string
  email: string
  consegna?: string
  recapito?: string
  pagamento?: 'bonifico' | 'busta_paga'
  importo?: number
  quantita?: number
  circuito?: string
  sede?: string
  convenzione?: string
  offerta?: string
  titoloEvento?: string
  dataPreferita?: string
  orarioPreferito?: string
  messaggio?: string
  /**
   * Se l'avviso ai direttori è partito.
   *
   * Finché il servizio di invio non è configurato resta falso per tutte, ed è
   * esattamente il motivo per cui questa colonna si vede in elenco: senza,
   * una richiesta arrivata e non annunciata sarebbe invisibile a tutti.
   */
  avvisoInviato: boolean
}

/** Cosa ha chiesto, in una riga: è la colonna che il direttore legge per prima. */
export function cosaChiede(richiesta: Richiesta): string {
  if (richiesta.tipo === 'cinema') {
    const dove = richiesta.sede ? ` (${richiesta.sede})` : ''
    return `${richiesta.quantita ?? '?'} biglietti ${richiesta.circuito ?? 'cinema'}${dove}`
  }
  if (richiesta.tipo === 'convenzione') {
    return `Convenzione ${richiesta.convenzione ?? ''}`.trim()
  }
  const quanti = richiesta.quantita ? `${richiesta.quantita} posti ` : 'Informazioni '
  return `${quanti}${richiesta.offerta ?? ''}`.trim()
}

/**
 * Come ha scelto di pagare, in italiano. Vuoto dove non c'era niente da pagare.
 *
 * Le parole sono due sole — «Bonifico» e «Busta paga» — e sono le stesse che
 * il socio ha letto nel modulo. «Cedolino», che era il nome dato al bonifico
 * nelle parole del direttivo, è sparito il 23 settembre 2026 per richiesta del
 * committente: è la stessa cosa detta in un secondo modo, e due nomi per una
 * cosa sola fanno chiedere al socio quale delle due ha scelto.
 */
export function comePaga(richiesta: Richiesta): string {
  if (richiesta.pagamento === 'bonifico') return 'Bonifico'
  if (richiesta.pagamento === 'busta_paga') return 'Busta paga'
  return ''
}

export const CONSEGNE_LEGGIBILI: Record<string, string> = {
  email_aziendale: 'Email aziendale',
  email_personale: 'Altra email',
  whatsapp: 'WhatsApp',
}
