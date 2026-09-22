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
    /**
     * L'IBAN su cui i soci fanno il bonifico del cedolino.
     *
     * Assente finché il direttivo non lo comunica, ed è deliberato: la pagina
     * di conferma dice al socio che l'IBAN glielo scriverà un direttore,
     * invece di mostrare un numero inventato. Un IBAN sbagliato manda dei
     * soldi a uno sconosciuto.
     */
    iban: undefined as string | undefined,
    nome: 'CRAL ARES',
    sottotitolo: "Circolo ricreativo dei dipendenti dell'Agenzia delle Entrate",
    /**
     * La segreteria, comunicata dal direttore il 15 settembre 2026 insieme
     * agli indirizzi degli altri direttori: tutti su `cralares.com`.
     *
     * Prima qui c'era `info@cralares.it`, che era un segnaposto su un dominio
     * che non risulta registrato — un indirizzo pubblicato in tre pagine a cui
     * nessuno avrebbe mai risposto. Con l'avviso è sparita anche
     * `emailProvvisoria`: la casella esiste e riceve, non c'è più niente da
     * avvertire.
     *
     * Resta da decidere se il sito starà su `cralares.com` o su un `.it` da
     * registrare a parte; questo indirizzo vale in entrambi i casi.
     */
    email: 'segreteriacral@cralares.com',
  },
  home: {
    titolo: "Il circolo dei dipendenti dell'Agenzia delle Entrate",
    occhiello:
      "Biglietti del cinema, convenzioni con i negozi della zona e offerte riservate ai soci.",

    /**
     * Il nastro non si chiama più «In corso questa settimana».
     *
     * Le offerte le pubblicano tre direttori a mano, nei ritagli di tempo:
     * fra due mesi «questa settimana» sarebbe una bugia ripetuta a ogni
     * visita, e chi torna ogni lunedì se ne accorgerebbe prima di noi.
     */
    titoloNastro: "Aperte adesso",
    /**
     * La riga sotto il nastro conta, invece di invitare.
     *
     * «Scorri per vedere le altre» diceva come si usa il nastro a chi lo
     * aveva già davanti; quello che manca a un socio è **quante ce ne sono**,
     * perché il nastro sul telefono ne mostra una sola e non c'è modo di
     * indovinare se dietro ce ne siano due o tredici.
     *
     * Con una sola offerta l'invito a scorrere sarebbe una bugia, e sparisce.
     */
    scorriNastro: (quante: number) =>
      quante === 1 ? "Un'offerta aperta" : `${quante} offerte · scorri`,
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
  /**
   * L'informativa privacy.
   *
   * Scritta il 14 settembre 2026, quando i moduli hanno cominciato a
   * raccogliere dati davvero: fino a quel giorno la pagina diceva soltanto
   * «in corso di redazione», e la casella del consenso rimandava a una
   * pagina che non spiegava niente. Un consenso che rimanda al nulla non è
   * un consenso.
   *
   * Dice tutto quello che sappiamo per certo, perché lo abbiamo costruito
   * noi: cosa si raccoglie, perché, per quanto, e chi lo tocca. Resta da
   * completare **l'identità del titolare** — denominazione, sede, codice
   * fiscale, email del titolare del trattamento — che deve darci il
   * direttivo, ed è dichiarata mancante invece che inventata.
   *
   * Il testo va comunque riletto da chi se ne intende prima dell'apertura
   * ai soci: è scritto con onestà, non con competenza legale.
   */
  privacy: {
    titolo: 'Informativa sulla privacy',
    introduzione:
      'Questa pagina spiega quali dati raccoglie il sito del CRAL ARES, perché, per quanto tempo restano e chi può vederli. È scritta per essere letta, non per essere archiviata.',
    notaProvvisoria:
      'I dati identificativi del titolare del trattamento — denominazione completa, sede e recapito — verranno pubblicati qui prima dell\'apertura del sito ai soci. Nel frattempo, per qualunque domanda sui tuoi dati puoi scrivere ai direttori.',
    sezioni: [
      {
        titolo: 'I dati dei soci',
        paragrafi: [
          'L\'associazione conserva un elenco dei soci con nome, cognome, email aziendale e matricola. Servono a una cosa sola: riconoscere chi invia una richiesta dal sito, così i direttori non ricevono messaggi da persone estranee all\'associazione.',
          'La base giuridica è l\'esecuzione del rapporto associativo, non il consenso: i dati restano finché dura l\'iscrizione. A tenerli aggiornati sono i direttori, che possono aggiungere e togliere persone dall\'elenco.',
          'L\'elenco non è consultabile dal sito pubblico in nessun modo. Quando compili un modulo, il sito chiede al database soltanto se quella coppia di email e matricola risulta fra i soci, e riceve un sì o un no: mai un nome, mai un elenco.',
        ],
      },
      {
        titolo: 'Le richieste che invii',
        paragrafi: [
          'Quando chiedi dei biglietti o una convenzione, restano registrati i dati che hai scritto nel modulo: nome, cognome, matricola, email aziendale, cosa hai chiesto, come preferisci pagare e il messaggio che hai eventualmente aggiunto.',
          'La base giuridica qui è il tuo consenso, che dai con la casella da spuntare prima di inviare — mai preselezionata — e di cui restano registrati il giorno e l\'ora.',
          'Le richieste vengono cancellate dopo 24 mesi. I dati che hai scritto restano dentro la richiesta anche se in futuro uscissi dall\'associazione: serve a non svuotare lo storico di chi resta.',
        ],
      },
      {
        titolo: 'I recapiti personali, se li dai',
        paragrafi: [
          'Se scegli di ricevere quello che chiedi su un\'altra email o su WhatsApp, quel recapito viene conservato insieme alla richiesta e sparisce con lei.',
          'È un dato che dai per comodità e non per obbligo: puoi sempre farti rispondere sull\'email aziendale, e in quel caso nessun recapito privato entra nel sito. Il recapito alternativo non entra mai nell\'elenco dei soci, che continua a conoscere solo l\'indirizzo che hai comunicato all\'associazione.',
        ],
      },
      {
        titolo: 'Chi vede i tuoi dati',
        paragrafi: [
          'Le richieste le leggono i direttori del CRAL, che rispondono a mano. Nessun altro socio può vedere le richieste altrui.',
          'Il sito si appoggia a fornitori che trattano i dati per nostro conto: il database e l\'invio delle email di accesso, l\'hosting del sito, il servizio che recapita le email ai direttori e, quando sarà attivo, il controllo antispam dei moduli. I dati restano su infrastrutture con server nell\'Unione Europea.',
          'Nessun dato viene ceduto a terzi per finalità commerciali, e il sito non fa profilazione.',
        ],
      },
      {
        titolo: 'I tuoi diritti',
        paragrafi: [
          'Puoi chiedere in qualsiasi momento di sapere quali dati abbiamo, di correggerli, di cancellarli o di limitarne l\'uso, e puoi revocare il consenso dato per una richiesta.',
          'Basta scrivere ai direttori. Se ritieni che i tuoi dati siano trattati in modo scorretto, puoi rivolgerti al Garante per la protezione dei dati personali.',
        ],
      },
      {
        titolo: 'Cookie',
        paragrafi: [
          'Le pagine pubbliche non installano alcun cookie. Nell\'area riservata ai direttori viene usato un cookie tecnico di sessione, che serve a tenere l\'accesso attivo e sparisce con l\'uscita.',
        ],
      },
    ],
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
