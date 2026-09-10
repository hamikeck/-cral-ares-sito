import { describe, expect, test } from 'vitest'
import { corpoEmail, corpoHtml, oggettoEmail, type RichiestaPerEmail } from './emailRichiesta'

const richiesta: RichiestaPerEmail = {
  numero: 42,
  nome: 'Mario',
  cognome: 'Rossi',
  codiceDipendente: 'AE12345',
  email: 'mario.rossi@agenziaentrate.it',
  consegna: 'Su WhatsApp',
  recapito: '333 1234567',
  oggettoBreve: '4 biglietti UCI Cinemas',
  righe: [
    { etichetta: 'Circuito', valore: 'UCI Cinemas' },
    { etichetta: 'Quantità', valore: '4' },
    { etichetta: 'Importo', valore: '26,00 €' },
    { etichetta: 'Pagamento', valore: 'Cedolino (bonifico)' },
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
  test('apre con la riga che di solito basta', () => {
    // Un direttore che legge dal telefono deve capire tutto dall'anteprima.
    expect(corpoEmail(richiesta).split('\n')[0]).toBe(
      'Mario Rossi chiede 4 biglietti uci cinemas.',
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
