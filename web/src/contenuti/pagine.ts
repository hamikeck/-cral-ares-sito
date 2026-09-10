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

    /**
     * Il nastro non si chiama più «In corso questa settimana».
     *
     * Le offerte le pubblicano tre direttori a mano, nei ritagli di tempo:
     * fra due mesi «questa settimana» sarebbe una bugia ripetuta a ogni
     * visita, e chi torna ogni lunedì se ne accorgerebbe prima di noi.
     */
    titoloNastro: "Aperte adesso",
    scorriNastro: "Scorri per vedere le altre",
    vediTutteLeOfferte: "Vedile tutte in elenco",
    nessunaOfferta:
      "Questa settimana non ci sono offerte in corso. Le pubblichiamo qui appena arrivano.",

    /**
     * Le due porte: il servizio permanente, quello che vale anche nelle
     * settimane in cui non si pubblica niente. Il prezzo del biglietto è
     * l'unico numero della facciata, e finché il direttivo non lo fornisce
     * la porta mostra il servizio senza cifra — mai un numero inventato.
     */
    porte: {
      cinema: {
        occhiello: "Il servizio di sempre",
        titolo: "Biglietti del cinema",
        testo:
          "Validi tutti i giorni, in tutte le sale dei circuiti convenzionati.",
        invito: "Richiedili in due minuti",
        nota: "Te li mandano i direttori per email o su WhatsApp.",
      },
      convenzioni: {
        occhiello: "L'altra porta",
        titolo: "Convenzioni",
        testo:
          "Gomme, assicurazione auto, farmacia, palestra, teatro. Se quello che ti serve non è ancora in elenco, chiedilo lo stesso: i direttori vanno a cercarlo.",
        invito: "Dicci cosa ti serve",
      },
    },

    /** Risponde alla domanda che blocca il socio nuovo: «e poi che succede?» */
    titoloPassi: "Come funziona",
    passi: [
      {
        titolo: "Dici cosa ti serve",
        testo: "Dal sito, in due minuti. Servono la matricola e l'email aziendale.",
      },
      {
        titolo: "Ti risponde un direttore",
        testo:
          "Una persona, non un sistema automatico: ti dice quando e come ritirare.",
      },
      {
        titolo: "Paghi come preferisci",
        testo: "Con il cedolino, oppure con la trattenuta in busta paga.",
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
      'Le pagine pubbliche di questo sito non installano alcun cookie.',
      "L'area riservata ai direttori, a cui si accede con un link ricevuto per email, usa un cookie tecnico di sessione: serve soltanto a mantenere l'accesso di chi è già entrato. Non profila e non segue la navigazione, ed è necessario al funzionamento dell'area riservata.",
      'Non sono presenti cookie di profilazione, né strumenti di analisi che ne installino. Per questo motivo non viene mostrato alcun banner di consenso.',
    ],
  },
  nonTrovata: {
    titolo: 'Pagina non trovata',
    testo: 'La pagina che cerchi non esiste o è stata spostata.',
    invito: 'Torna alla home',
  },
} as const
