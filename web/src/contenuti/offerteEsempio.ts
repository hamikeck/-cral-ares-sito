/**
 * Offerte dimostrative, usate finché non esiste il database.
 *
 * Servono a due cose: far vedere al direttivo che aspetto avrà il sito, e
 * dare alla scheda offerta un contenuto vero su cui essere progettata. In
 * fase 2 questo file sparisce e i dati arrivano dalla tabella `offerte`:
 * il tipo qui sotto è già modellato su quella, così i componenti non
 * cambiano.
 *
 * Non sono offerte reali. Il sito lo dichiara apertamente dove le mostra.
 */
export type Offerta = {
  slug: string
  partner: string
  categoria: string
  /** Il motivo per cui il socio si ferma a leggere. Va scritto corto. */
  vantaggio: string
  descrizione: string
  validaAl: string
  azione: string
}

export const offertaInEvidenza: Offerta = {
  slug: 'uci-cinemas-ingresso-ridotto',
  partner: 'UCI Cinemas',
  categoria: 'Cinema',
  vantaggio: '6,50 € invece di 9,50',
  descrizione:
    'Ingresso ridotto in tutte le sale del circuito, tutti i giorni della settimana, spettacoli 3D compresi.',
  validaAl: '30 settembre',
  azione: 'Richiedi i biglietti',
}

export const altreOfferte: Offerta[] = [
  {
    slug: 'the-space-carnet',
    partner: 'The Space Cinema',
    categoria: 'Cinema',
    vantaggio: 'Carnet da 5 ingressi, 30 €',
    descrizione:
      'Cinque ingressi da usare quando vuoi entro un anno, anche in più persone lo stesso giorno.',
    validaAl: '31 dicembre',
    azione: 'Richiedi il carnet',
  },
  {
    slug: 'teatro-diana-abbonamento',
    partner: 'Teatro Diana',
    categoria: 'Teatro',
    vantaggio: 'Poltronissima a 18 € invece di 32 €',
    descrizione:
      'Riduzione riservata ai soci sull’intera stagione di prosa, da ottobre a maggio.',
    validaAl: '15 ottobre',
    azione: 'Richiedi i posti',
  },
  {
    slug: 'gommista-cambio-stagionale',
    partner: 'Pneumatici Esposito',
    categoria: 'Auto',
    vantaggio: '20% sul cambio stagionale',
    descrizione:
      'Sconto su pneumatici, montaggio ed equilibratura mostrando la tessera del CRAL.',
    validaAl: '30 novembre',
    azione: 'Come funziona',
  },
]
