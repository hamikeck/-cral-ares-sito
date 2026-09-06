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
    sottotitolo: "Circolo ricreativo dei dipendenti dell'Agenzia delle Entrate",
    email: 'info@cralares.it',
    emailProvvisoria:
      "Indirizzo non ancora attivo: sarà operativo con la registrazione del dominio.",
  },
  home: {
    titolo: "Il circolo dei dipendenti dell'Agenzia delle Entrate",
    occhiello:
      "Biglietti del cinema, convenzioni con i negozi della zona e offerte riservate ai soci.",
    avvisoDimostrativo:
      "Le offerte qui sotto sono esempi: servono a mostrare che aspetto avrà il sito. Quelle vere le pubblicheranno i direttori dall'area riservata.",
    titoloEvidenza: "In corso questa settimana",
    titoloAltre: "Altre offerte aperte",
    nessunaOfferta:
      "Questa settimana non ci sono offerte in corso. Le pubblichiamo qui appena arrivano.",
    titoloCosaTrovi: "Cosa trovi qui",
    cosaTrovi: [
      {
        titolo: "Biglietti del cinema",
        testo:
          "Il CRAL acquista biglietti dei circuiti convenzionati a prezzo ridotto. Li richiedi dal sito e i direttori ti dicono come ritirarli.",
      },
      {
        titolo: "Convenzioni",
        testo:
          "Sconti concordati con negozi e professionisti della zona. In molti casi basta mostrare la tessera del CRAL alla cassa.",
      },
      {
        titolo: "Offerte della settimana",
        testo:
          "Teatro, eventi e occasioni che durano poco. Restano qui finché sono valide, poi spariscono da sole.",
      },
    ],
    titoloIscrizione: "Non sei ancora socio?",
    testoIscrizione:
      "L'iscrizione è aperta a tutti i dipendenti dell'Agenzia delle Entrate.",
    invito: "Scopri come iscriverti",
  },
  errore: {
    titolo: "Qualcosa non ha funzionato",
    testo:
      "Non siamo riusciti a caricare questa pagina. Non è colpa tua: riprova fra qualche istante.",
    riprova: "Riprova",
    tornaHome: "Torna alla home",
    seContinua:
      "Se continua a succedere, scrivilo ai direttori indicando cosa stavi facendo.",
  },
  offerte: {
    titolo: "Offerte e convenzioni",
    occhiello:
      "Tutto quello che il CRAL ha aperto in questo momento. Le offerte scadute spariscono da sole.",
    filtroEtichetta: "Filtra per categoria",
    tutte: "Tutte",
    nessuna: "Non ci sono offerte in questa categoria.",
    vediTutte: "Vedi tutte le offerte",
  },
  offerta: {
    titoloCondizioni: "Condizioni",
    titoloComeFunziona: "Come si ottiene",
    titoloRichiesta: "Come si richiede",
    richiestaNonAncora:
      "Il modulo di richiesta arriverà con la prossima fase del sito. Per ora scrivi ai direttori all'indirizzo dell'associazione.",
    torna: "Torna a tutte le offerte",
    scaduta: "Questa offerta è terminata.",
  },
  chiSiamo: {
    titolo: 'Chi siamo',
    paragrafi: [
      "Il CRAL ARES è l'associazione ricreativa dei dipendenti dell'Agenzia delle Entrate. Nasce per mettere a disposizione dei colleghi convenzioni, biglietti a tariffa agevolata e occasioni di incontro.",
      "L'associazione è gestita da un direttivo composto da dipendenti che vi dedicano il proprio tempo, senza scopo di lucro.",
    ],
    titoloDirettivo: 'Il direttivo',
    notaProvvisoria:
      'La composizione del direttivo sarà pubblicata a breve.',
    titoloContatti: 'Contatti',
    testoContatti:
      "Per qualsiasi informazione scrivi all'indirizzo dell'associazione:",
  },
  iscriviti: {
    titolo: 'Iscriviti al CRAL',
    paragrafi: [
      "Possono iscriversi al CRAL ARES i dipendenti dell'Agenzia delle Entrate.",
      "Per aderire scrivi all'indirizzo dell'associazione: riceverai il modulo di iscrizione e le indicazioni per il versamento della quota annuale.",
    ],
    notaProvvisoria:
      'Requisiti, quota annuale e procedura completa saranno pubblicati a breve.',
  },
  privacy: {
    titolo: 'Informativa sulla privacy',
    notaProvvisoria:
      "L'informativa completa è in corso di redazione e sarà pubblicata prima dell'apertura del sito ai soci.",
  },
  cookie: {
    titolo: 'Cookie',
    paragrafi: [
      'Questo sito utilizza esclusivamente cookie tecnici, necessari al suo funzionamento.',
      'Non sono presenti cookie di profilazione, né strumenti di analisi che ne installino. Per questo motivo non viene mostrato alcun banner di consenso.',
    ],
  },
  nonTrovata: {
    titolo: 'Pagina non trovata',
    testo: 'La pagina che cerchi non esiste o è stata spostata.',
    invito: 'Torna alla home',
  },
} as const
