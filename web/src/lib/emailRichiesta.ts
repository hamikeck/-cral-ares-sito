/**
 * L'email che arriva ai direttori quando un socio chiede qualcosa.
 *
 * È il punto in cui il progetto si gioca la sua utilità quotidiana: la
 * risposta la scrive una persona, e ogni secondo speso a decifrare l'email è
 * speso ogni volta, per ogni richiesta, per sempre. Da qui le quattro regole
 * dello spec 11.2, tutte verificabili nei test qui accanto.
 */

export type RichiestaPerEmail = {
  numero: number
  nome: string
  cognome: string
  codiceDipendente: string
  email: string
  /** Dove il socio vuole ricevere, già scritto in italiano. */
  consegna: string
  recapito?: string
  /** Come si chiama la richiesta nell'oggetto: corto, e riconoscibile a colpo d'occhio. */
  oggettoBreve: string
  /**
   * Come si racconta nella prima riga, dentro una frase.
   *
   * È separato dall'oggetto perché una frase non è un'etichetta: «Convenzione
   * Gommista» sta bene in un oggetto e male dentro «Mario Rossi chiede…», e
   * abbassare le maiuscole dell'oggetto per farcelo stare rovina i nomi propri
   * — «4 biglietti uci cinemas».
   */
  riepilogo: string
  righe: { etichetta: string; valore: string }[]
  messaggio?: string
}

/**
 * L'oggetto, che deve farsi riconoscere dalla lista della posta senza aprirlo.
 *
 * Il prefisso permette un filtro in Aruba, il numero permette di parlarne, e
 * il nome dice subito a chi si sta per rispondere.
 */
export function oggettoEmail(richiesta: RichiestaPerEmail): string {
  return `[CRAL ARES] #${richiesta.numero} · ${richiesta.oggettoBreve} — ${richiesta.nome} ${richiesta.cognome}`
}

/**
 * Il corpo in testo semplice.
 *
 * Prima la riga di riepilogo, che di solito basta; poi i dati in tabella e
 * non in prosa, perché un direttore li cerca con l'occhio invece di leggerli.
 * Il testo semplice non è un ripiego: è quello che si legge bene su un
 * telefono e che nessun client di posta può rovinare.
 */
export function corpoEmail(richiesta: RichiestaPerEmail): string {
  const parti: string[] = [
    `${richiesta.nome} ${richiesta.cognome} chiede ${richiesta.riepilogo}.`,
    '',
  ]

  for (const riga of righeComplete(richiesta)) {
    parti.push(`${riga.etichetta}: ${riga.valore}`)
  }

  if (richiesta.messaggio) {
    parti.push('', 'Ha scritto:', richiesta.messaggio)
  }

  parti.push(
    '',
    'Per rispondere basta premere Rispondi: la risposta va direttamente al socio.',
  )

  return parti.join('\n')
}

/** Le righe della tabella, uguali nel testo e nell'HTML. */
export function righeComplete(
  richiesta: RichiestaPerEmail,
): { etichetta: string; valore: string }[] {
  const righe = [...richiesta.righe]

  righe.push({ etichetta: 'Matricola', valore: richiesta.codiceDipendente })
  righe.push({ etichetta: 'Email aziendale', valore: richiesta.email })
  righe.push({ etichetta: 'Vuole ricevere', valore: richiesta.consegna })

  // Il recapito sta su una riga sua, e non fra parentesi accanto alla
  // consegna: da solo è un numero o un indirizzo, quindi diventa cliccabile —
  // un tocco per chiamare dal telefono, che è da dove i direttori leggono la
  // posta. Dentro una frase resterebbe testo da ricopiare a mano.
  if (richiesta.recapito) {
    righe.push({ etichetta: 'Recapito', valore: richiesta.recapito })
  }

  return righe
}

/** Le entità che romperebbero l'HTML, e che nei nomi italiani capitano. */
function scappa(testo: string): string {
  return testo
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Il corpo in HTML: la stessa cosa, con la tabella disegnata.
 *
 * Niente immagini, niente fogli di stile esterni, nessun carattere da
 * scaricare: le caselle aziendali bloccano quasi tutto, e un'email che arriva
 * scomposta è peggio di una scritta in testo semplice.
 *
 * Il telefono è un collegamento `tel:` perché il direttore legge la posta
 * anche dal cellulare, e da lì chiamare deve costare un tocco.
 */
export function corpoHtml(richiesta: RichiestaPerEmail): string {
  const righe = righeComplete(richiesta)
    .map(({ etichetta, valore }) => {
      const contenuto = /^\+?[\d\s().-]{8,}$/.test(valore)
        ? `<a href="tel:${scappa(valore.replace(/[^\d+]/g, ''))}">${scappa(valore)}</a>`
        : scappa(valore)

      return (
        '<tr>' +
        `<td style="padding:4px 12px 4px 0;color:#5C707C;white-space:nowrap">${scappa(etichetta)}</td>` +
        `<td style="padding:4px 0"><strong>${contenuto}</strong></td>` +
        '</tr>'
      )
    })
    .join('')

  const messaggio = richiesta.messaggio
    ? `<p style="margin:16px 0 0"><em>Ha scritto:</em><br>${scappa(richiesta.messaggio).replace(/\n/g, '<br>')}</p>`
    : ''

  return [
    '<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:16px;line-height:1.5;color:#14212A">',
    `<p style="margin:0 0 16px;font-size:18px"><strong>${scappa(richiesta.nome)} ${scappa(richiesta.cognome)}</strong> chiede ${scappa(richiesta.riepilogo)}.</p>`,
    `<table style="border-collapse:collapse">${righe}</table>`,
    messaggio,
    '<p style="margin:20px 0 0;color:#5C707C;font-size:14px">Per rispondere basta premere Rispondi: la risposta va direttamente al socio.</p>',
    '</div>',
  ].join('')
}

/**
 * L'email di presa in carico, quella che riceve il socio.
 *
 * Esiste per una ragione sola e misurabile: **evitare che compili due volte.**
 * Senza una conferma, chi non riceve risposta entro sera rimanda la richiesta,
 * e il direttore si ritrova due righe uguali da capire.
 *
 * Non promette tempi che non possiamo garantire — a rispondere è una persona
 * nei ritagli di tempo — e non dice «la tua richiesta è stata approvata»:
 * dice che è arrivata, che è diversa cosa.
 */
export function oggettoConferma(richiesta: RichiestaPerEmail): string {
  return `Abbiamo ricevuto la tua richiesta · #${richiesta.numero}`
}

export function corpoConferma(richiesta: RichiestaPerEmail, riepilogo: string): string {
  return [
    `Ciao ${richiesta.nome},`,
    '',
    `abbiamo ricevuto la tua richiesta (#${richiesta.numero}): ${riepilogo}.`,
    '',
    'Ti risponde un direttore del CRAL, non un sistema automatico: può volerci',
    'qualche giorno. Non serve rimandare la richiesta — è già in coda.',
    '',
    'Se paghi con il cedolino, aspetta la sua email prima di fare qualsiasi',
    'versamento: l’IBAN e l’importo te li scrive lui.',
    '',
    'CRAL ARES',
  ].join('\n')
}
