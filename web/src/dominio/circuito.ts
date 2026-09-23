/**
 * I circuiti cinematografici convenzionati e le loro sale.
 *
 * Il socio sceglie il circuito e poi, se vuole, la sala: i biglietti valgono
 * su tutto il circuito, quindi la sede è un'indicazione per il direttore e non
 * un vincolo. Deciso dal direttivo l'8 settembre 2026.
 */
export type Sede = {
  id: string
  nome: string
  citta?: string
  /** Dove il socio guarda cosa danno, prima di decidere quanti biglietti chiedere. */
  linkProgrammazione?: string
}

export type Circuito = {
  id: string
  nome: string
  /**
   * Il prezzo di un biglietto per i soci.
   *
   * Assente finché il direttivo non lo comunica, e in quel caso il modulo
   * mostra il servizio **senza cifra**: un numero inventato è peggio di
   * nessun numero, e la richiesta parte lo stesso — l'importo lo dirà il
   * direttore rispondendo.
   */
  prezzoSocio?: number
  /**
   * Le limitazioni, come le scrive il direttivo: giorni esclusi, sale
   * escluse, e se il voucher è cartaceo invece che elettronico.
   *
   * È testo per il socio, non una regola che qualcuno applica. Il sistema non
   * sa cosa sia il «periodo natalizio» e non deve saperlo: deve solo dirlo
   * prima che il socio chieda, invece di lasciarglielo scoprire al
   * botteghino.
   */
  note?: string
  /** Dove il socio guarda cosa danno, quando le sale non sono elencate. */
  sito?: string
  sedi: Sede[]
}

/** L'importo di una richiesta, o niente se il prezzo non è ancora noto. */
export function importoBiglietti(circuito: Circuito, quantita: number): number | undefined {
  if (circuito.prezzoSocio === undefined) return undefined
  return Math.round(circuito.prezzoSocio * quantita * 100) / 100
}

/** «32,00 €», come lo scrive l'italiano. */
export function formattaEuro(importo: number): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(importo)
}
