import { nonAncoraIniziata, oggi, scaduta } from '@/lib/date'

/**
 * Offerte dimostrative, usate finché non esiste il database.
 *
 * Servono a due cose: far vedere al direttivo che aspetto avrà il sito, e
 * dare alle pagine delle offerte un contenuto vero su cui essere progettate.
 *
 * In fase 2 questo file sparisce e i dati arrivano dalla tabella `offerte`.
 * Il tipo e le funzioni qui sotto sono modellati su quella query, così a
 * cambiare sarà soltanto da dove arrivano i dati, non le pagine che li usano.
 *
 * Non sono offerte reali. Il sito lo dichiara apertamente dove le mostra.
 */

/** Come il socio ottiene il vantaggio. Rispecchia l'enum `modalita_offerta`. */
export type ModalitaOfferta = 'biglietti' | 'convenzione' | 'solo_sconto'

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
  validaAl: string
  modalita: ModalitaOfferta
  /** Per `solo_sconto`: cosa deve fare il socio, senza passare da noi. */
  istruzioni?: string
  inEvidenza: boolean
}

export const offerte: Offerta[] = [
  {
    slug: 'uci-cinemas-ingresso-ridotto',
    partner: 'UCI Cinemas',
    categoria: 'Cinema',
    vantaggio: '6,50 € invece di 9,50',
    descrizione:
      'Ingresso ridotto in tutte le sale del circuito, tutti i giorni della settimana.',
    descrizioneCompleta:
      'Il CRAL acquista biglietti a tariffa convenzionata per tutte le sale del circuito UCI. Valgono tutti i giorni della settimana, festivi compresi, e non hanno vincoli di orario. Gli spettacoli in 3D richiedono il supplemento occhiali, che si paga in sala.',
    condizioni: [
      'Ogni socio può richiedere fino a 6 biglietti al mese.',
      'I biglietti si ritirano in sede negli orari di apertura.',
      'Non sono rimborsabili, ma non hanno scadenza entro l’anno solare.',
    ],
    validaDal: '2026-09-01',
    validaAl: '2026-09-30',
    modalita: 'biglietti',
    inEvidenza: true,
  },
  {
    slug: 'the-space-carnet',
    partner: 'The Space Cinema',
    categoria: 'Cinema',
    vantaggio: 'Carnet da 5 ingressi, 30 €',
    descrizione:
      'Cinque ingressi da usare quando vuoi entro un anno, anche in più persone.',
    descrizioneCompleta:
      'Un carnet da cinque ingressi a 30 €, cioè 6 € a biglietto invece di 9. Gli ingressi si possono usare tutti insieme lo stesso giorno — utile per andare al cinema in famiglia — oppure distribuirli nell’arco dell’anno.',
    condizioni: [
      'Il carnet è nominativo ma gli ingressi sono cedibili.',
      'Valido dodici mesi dalla data di emissione.',
      'Non utilizzabile per anteprime ed eventi speciali.',
    ],
    validaDal: '2026-09-01',
    validaAl: '2026-12-31',
    modalita: 'biglietti',
    inEvidenza: false,
  },
  {
    slug: 'teatro-diana-stagione-prosa',
    partner: 'Teatro Diana',
    categoria: 'Teatro',
    vantaggio: 'Poltronissima a 18 € invece di 32 €',
    descrizione:
      'Riduzione riservata ai soci sull’intera stagione di prosa, da ottobre a maggio.',
    descrizioneCompleta:
      'La riduzione vale su tutti gli spettacoli della stagione di prosa, nei posti di poltronissima. I posti sono limitati e assegnati in ordine di richiesta: per gli spettacoli più richiesti conviene farsi vivi con qualche settimana di anticipo.',
    condizioni: [
      'Massimo quattro posti a socio per spettacolo.',
      'La richiesta va inviata almeno dieci giorni prima della data.',
      'Il pagamento avviene al ritiro dei biglietti.',
    ],
    validaDal: '2026-09-01',
    validaAl: '2026-10-15',
    modalita: 'biglietti',
    inEvidenza: false,
  },
  {
    slug: 'pneumatici-esposito',
    partner: 'Pneumatici Esposito',
    categoria: 'Auto',
    vantaggio: '20% sul cambio stagionale',
    descrizione:
      'Sconto su pneumatici, montaggio ed equilibratura mostrando la tessera.',
    descrizioneCompleta:
      'Sconto del 20% su pneumatici di tutte le marche trattate, montaggio ed equilibratura compresi. La convenzione copre anche il deposito stagionale degli pneumatici smontati, che è gratuito per i soci.',
    condizioni: [
      'Sconto non cumulabile con altre promozioni in corso.',
      'Occorre esibire la tessera del CRAL prima del preventivo.',
    ],
    validaDal: '2026-09-01',
    validaAl: '2026-11-30',
    modalita: 'solo_sconto',
    istruzioni:
      'Presentati in officina con la tessera del CRAL e chiedi il preventivo convenzionato. Non serve prenotare dal sito.',
    inEvidenza: false,
  },
  {
    slug: 'assicurazione-auto-convenzione',
    partner: 'Agenzia Partenope Assicurazioni',
    categoria: 'Auto',
    vantaggio: 'Fino al 30% sulla RC auto',
    descrizione:
      'Preventivo riservato ai soci su polizze auto, moto e infortuni.',
    descrizioneCompleta:
      'L’agenzia riserva ai soci del CRAL una scontistica dedicata sulle polizze auto e moto, e sulle coperture infortuni per la famiglia. Lo sconto effettivo dipende dalla classe di merito e dal tipo di veicolo: il preventivo è gratuito e non impegna a nulla.',
    condizioni: [
      'La convenzione vale anche per i familiari conviventi.',
      'Il preventivo viene inviato entro due giorni lavorativi.',
    ],
    validaDal: '2026-09-01',
    validaAl: '2026-12-31',
    modalita: 'convenzione',
    inEvidenza: false,
  },
  {
    slug: 'farmacia-vesuvio-parafarmaco',
    partner: 'Farmacia Vesuvio',
    categoria: 'Salute',
    vantaggio: '15% su parafarmaco e cosmesi',
    descrizione:
      'Sconto immediato alla cassa su prodotti da banco, cosmesi e integratori.',
    descrizioneCompleta:
      'Lo sconto si applica a tutto il reparto parafarmaco: integratori, cosmesi, prodotti per l’infanzia e articoli sanitari. Restano esclusi i farmaci con obbligo di ricetta, il cui prezzo è fissato per legge.',
    condizioni: [
      'Sconto applicato direttamente alla cassa.',
      'Esclusi i farmaci con obbligo di ricetta.',
    ],
    validaDal: '2026-09-01',
    validaAl: '2026-12-31',
    modalita: 'solo_sconto',
    istruzioni:
      'Mostra la tessera del CRAL alla cassa prima del pagamento. Lo sconto viene applicato subito.',
    inEvidenza: false,
  },
  {
    slug: 'palestra-acquachiara-abbonamento',
    partner: 'Centro sportivo Acquachiara',
    categoria: 'Sport',
    vantaggio: 'Iscrizione gratuita e 25% sull’abbonamento',
    descrizione:
      'Sala pesi, corsi e piscina, con quota di iscrizione azzerata per i soci.',
    descrizioneCompleta:
      'La convenzione azzera la quota di iscrizione, che per i non soci è di 60 €, e applica il 25% di sconto sugli abbonamenti trimestrali e annuali. Comprende sala pesi, corsi in sala e accesso alla piscina negli orari di nuoto libero.',
    condizioni: [
      'Sconto valido su abbonamenti trimestrali e annuali.',
      'Il certificato medico sportivo resta a carico del socio.',
    ],
    validaDal: '2026-09-01',
    validaAl: '2026-10-31',
    modalita: 'convenzione',
    inEvidenza: false,
  },  {
    slug: 'mostra-caravaggio-terminata',
    partner: 'Palazzo Reale',
    categoria: 'Teatro',
    vantaggio: 'Ingresso 5 € invece di 13 €',
    descrizione:
      'Riduzione sulla mostra estiva, riservata ai soci e a un accompagnatore.',
    descrizioneCompleta:
      'La convenzione valeva per l’intera durata della mostra, con ingresso ridotto per il socio e per un accompagnatore. È terminata con la chiusura dell’esposizione.',
    condizioni: ['Ingresso ridotto valido anche per un accompagnatore.'],
    validaDal: '2026-06-01',
    validaAl: '2026-08-31',
    modalita: 'solo_sconto',
    istruzioni:
      'La mostra è chiusa. La scheda resta consultabile per chi arriva da un vecchio collegamento.',
    inEvidenza: false,
  },
]

/**
 * Le offerte che il socio deve vedere: iniziate e non ancora scadute.
 *
 * È la promessa dello spec — «le offerte scadute spariscono da sole» — e non
 * si mantiene con la buona volontà di chi pubblica: si mantiene qui, in una
 * funzione che nessuno può dimenticare di chiamare, perché è l'unica porta
 * da cui gli elenchi passano.
 */
export function offerteValide(adesso = oggi()): Offerta[] {
  return offerte.filter(
    (offerta) =>
      !scaduta(offerta.validaAl, adesso) &&
      !nonAncoraIniziata(offerta.validaDal, adesso),
  )
}

/**
 * L'offerta della settimana, quella che apre la home.
 *
 * Restituisce `undefined` quando non ce n'è nessuna: è una settimana come
 * un'altra e le pagine devono saperlo gestire, non rompersi.
 */
export function offertaInEvidenza(adesso = oggi()): Offerta | undefined {
  return offerteValide(adesso).find((offerta) => offerta.inEvidenza)
}

/** Tutte le altre valide, nell'ordine in cui sono state pubblicate. */
export function altreOfferte(adesso = oggi()): Offerta[] {
  return offerteValide(adesso).filter((offerta) => !offerta.inEvidenza)
}

/** Le categorie che hanno almeno un'offerta valida, in ordine alfabetico. */
export function categorie(adesso = oggi()): string[] {
  return [
    ...new Set(offerteValide(adesso).map((offerta) => offerta.categoria)),
  ].sort((prima, seconda) => prima.localeCompare(seconda, 'it'))
}

/** Le offerte valide di una categoria, o tutte se non se ne indica nessuna. */
export function offertePerCategoria(
  categoria?: string,
  adesso = oggi(),
): Offerta[] {
  const valide = offerteValide(adesso)
  if (!categoria) return valide
  return valide.filter((offerta) => offerta.categoria === categoria)
}

/**
 * Cerca fra TUTTE le offerte, comprese le scadute.
 *
 * Deliberato: la scheda di un'offerta finita resta raggiungibile, perché chi
 * apre un vecchio collegamento ricevuto per email deve trovare «questa offerta
 * è terminata» e non una pagina di errore. Un link morto fa sembrare rotto il
 * sito.
 */
export function offertaDaSlug(slug: string): Offerta | undefined {
  return offerte.find((offerta) => offerta.slug === slug)
}
