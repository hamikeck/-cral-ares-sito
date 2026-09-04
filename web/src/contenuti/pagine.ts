/**
 * Testi delle pagine statiche.
 *
 * Provvisori: il direttivo deve fornire i contenuti definitivi di "Chi siamo",
 * la composizione del direttivo, la procedura di iscrizione e l'informativa
 * privacy con i dati reali del titolare (spec, sezione 16). Sostituirli
 * significa modificare questo file e nient'altro.
 */
export const contenutiPagine = {
  associazione: {
    nome: 'CRAL ARES',
    sottotitolo: 'Circolo ricreativo dei dipendenti dell\'Agenzia delle Entrate',
    email: 'info@cralares.it',
  },
  home: {
    titolo: 'Il circolo dei dipendenti dell\'Agenzia delle Entrate',
    occhiello:
      'Biglietti del cinema, convenzioni e offerte riservate ai soci del CRAL ARES.',
    invito: 'Scopri come iscriverti',
  },
  chiSiamo: {
    titolo: 'Chi siamo',
    paragrafi: [
      'Il CRAL ARES è l\'associazione ricreativa dei dipendenti dell\'Agenzia delle Entrate. Nasce per mettere a disposizione dei colleghi convenzioni, biglietti a tariffa agevolata e occasioni di incontro.',
      'L\'associazione è gestita da un direttivo composto da dipendenti che vi dedicano il proprio tempo, senza scopo di lucro.',
    ],
    titoloDirettivo: 'Il direttivo',
    notaProvvisoria:
      'La composizione del direttivo sarà pubblicata a breve.',
    titoloContatti: 'Contatti',
    testoContatti:
      'Per qualsiasi informazione scrivi all\'indirizzo dell\'associazione:',
  },
  iscriviti: {
    titolo: 'Iscriviti al CRAL',
    paragrafi: [
      'Possono iscriversi al CRAL ARES i dipendenti dell\'Agenzia delle Entrate.',
      'Per aderire scrivi all\'indirizzo dell\'associazione: riceverai il modulo di iscrizione e le indicazioni per il versamento della quota annuale.',
    ],
    notaProvvisoria:
      'Requisiti, quota annuale e procedura completa saranno pubblicati a breve.',
  },
  privacy: {
    titolo: 'Informativa sulla privacy',
    notaProvvisoria:
      'L\'informativa completa è in corso di redazione e sarà pubblicata prima dell\'apertura del sito ai soci.',
  },
  cookie: {
    titolo: 'Cookie',
    paragrafi: [
      'Questo sito utilizza esclusivamente cookie tecnici, necessari al suo funzionamento.',
      'Non sono presenti cookie di profilazione, né strumenti di analisi che ne installino. Per questo motivo non viene mostrato alcun banner di consenso.',
    ],
  },
} as const
