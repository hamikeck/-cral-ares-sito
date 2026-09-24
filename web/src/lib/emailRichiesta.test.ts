import { describe, expect, test } from 'vitest'
import {  corpoConferma,  corpoEmail,  corpoHtml,  oggettoEmail,  type RichiestaPerEmail,} from './emailRichiesta'

const richiesta: RichiestaPerEmail = {
  numero: 42,
  nome: 'Mario',
  cognome: 'Rossi',
  codiceDipendente: 'AE12345',
  email: 'mario.rossi@agenziaentrate.it',
  consegna: 'Su WhatsApp',
  recapito: '333 1234567',
  oggettoBreve: '4 biglietti UCI Cinemas',
  riepilogo: '4 biglietti UCI Cinemas (UCI Casoria)',
  righe: [
    { etichetta: 'Circuito', valore: 'UCI Cinemas' },
    { etichetta: 'Quantità', valore: '4' },
    { etichetta: 'Importo', valore: '26,00 €' },
    { etichetta: 'Pagamento', valore: 'Bonifico' },
  ],
}

describe('oggettoEmail', () => {
  test('si riconosce dalla lista della posta senza aprirlo', () => {
    expect(oggettoEmail(richiesta)).toBe(
      '[CRAL ARES] #42 · 4 biglietti UCI Cinemas — Mario Rossi',
    )
  })

  test('il prefisso è fisso, così in Aruba ci si può fare un filtro', () => {
    expect(oggettoEmail({ ...richiesta, oggettoBreve: 'Convenzione gommista' })).toMatch(
      /^\[CRAL ARES\] #\d+ · /,
    )
  })
})

describe('corpoEmail', () => {
  test('la prima riga è una frase, non l’etichetta dell’oggetto', () => {
    // Abbassare le maiuscole dell'oggetto per infilarlo in una frase rovina i
    // nomi propri: «chiede 4 biglietti uci cinemas».
    const convenzione = {
      ...richiesta,
      oggettoBreve: 'Convenzione Gommista',
      riepilogo: 'una convenzione con Gommista',
    }
    expect(corpoEmail(convenzione).split('\n')[0]).toBe(
      'Mario Rossi chiede una convenzione con Gommista.',
    )
  })

  test('apre con la riga che di solito basta', () => {
    // Un direttore che legge dal telefono deve capire tutto dall'anteprima.
    expect(corpoEmail(richiesta).split('\n')[0]).toBe(
      'Mario Rossi chiede 4 biglietti UCI Cinemas (UCI Casoria).',
    )
  })

  test('i dati stanno in tabella, non in prosa', () => {
    const corpo = corpoEmail(richiesta)
    expect(corpo).toContain('Circuito: UCI Cinemas')
    expect(corpo).toContain('Importo: 26,00 €')
  })

  test('dice sempre matricola, email e dove vuole ricevere', () => {
    const corpo = corpoEmail(richiesta)
    expect(corpo).toContain('Matricola: AE12345')
    expect(corpo).toContain('Email aziendale: mario.rossi@agenziaentrate.it')
    expect(corpo).toContain('Vuole ricevere: Su WhatsApp')
    // Su una riga sua, così nell'HTML diventa cliccabile.
    expect(corpo).toContain('Recapito: 333 1234567')
  })

  test('senza recapito alternativo non aggiunge una riga vuota', () => {
    const corpo = corpoEmail({ ...richiesta, consegna: 'Sull’email aziendale', recapito: undefined })
    expect(corpo).toContain('Vuole ricevere: Sull’email aziendale')
    expect(corpo).not.toContain('Recapito:')
  })

  test('il messaggio del socio si distingue dai dati', () => {
    const corpo = corpoEmail({ ...richiesta, messaggio: 'Se possibile per sabato.' })
    expect(corpo).toContain('Ha scritto:\nSe possibile per sabato.')
  })

  test('ricorda che si risponde premendo Rispondi', () => {
    // È il dettaglio che vale più di tutti gli altri: la risposta è a mano.
    expect(corpoEmail(richiesta)).toMatch(/premere Rispondi/)
  })
})

describe('corpoHtml', () => {
  test('il telefono si può chiamare con un tocco', () => {
    expect(corpoHtml(richiesta)).toContain('href="tel:3331234567"')
  })

  test('non trasforma in telefono quello che telefono non è', () => {
    const html = corpoHtml({ ...richiesta, righe: [{ etichetta: 'Quantità', valore: '4' }] })
    expect(html).not.toContain('href="tel:4"')
  })

  test('i caratteri che romperebbero l’HTML vengono neutralizzati', () => {
    // Un cognome con la e commerciale, o un messaggio incollato da chissà
    // dove, non devono poter iniettare tag dentro l'email di un direttore.
    const html = corpoHtml({
      ...richiesta,
      cognome: 'Rossi & <script>alert(1)</script>',
    })
    expect(html).not.toContain('<script>')
    expect(html).toContain('&amp;')
  })

  test('non chiede al client di posta di scaricare niente', () => {
    const html = corpoHtml(richiesta)
    expect(html).not.toMatch(/<img|<link|@import/)
  })
})

describe('corpoConferma', () => {
  const iban = 'IT32Y0538703410000004305459'

  test('a chi paga con bonifico scrive IBAN, importo e causale', () => {
    const corpo = corpoConferma(richiesta, richiesta.riepilogo, {
      iban,
      importo: '26,00 €',
      causale: 'CRAL ARES biglietti UCI Cinemas Rossi AE12345',
    })

    expect(corpo).toContain(`IBAN: ${iban}`)
    expect(corpo).toContain('Importo: 26,00 €')
    expect(corpo).toContain('Causale: CRAL ARES biglietti UCI Cinemas Rossi AE12345')
    expect(corpo).not.toContain('aspetta')
  })

  test('senza importo, dice di aspettare la cifra dal direttore', () => {
    const corpo = corpoConferma(richiesta, richiesta.riepilogo, {
      iban,
      causale: 'CRAL ARES Teatro Diana Rossi AE12345',
    })

    expect(corpo).toContain(`IBAN: ${iban}`)
    expect(corpo).not.toContain('Importo:')
    expect(corpo).toMatch(/aspetta quella\s+prima di fare il bonifico/)
  })

  test('a chi non paga con bonifico non parla di versamenti', () => {
    const corpo = corpoConferma(richiesta, richiesta.riepilogo)

    expect(corpo).not.toMatch(/IBAN|bonifico/i)
  })
})
