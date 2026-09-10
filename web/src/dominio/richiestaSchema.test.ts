import { describe, expect, test } from 'vitest'
import { schemaDatiSocio } from './richiestaSchema'

const base = {
  nome: 'Mario',
  cognome: 'Rossi',
  codiceDipendente: 'AE12345',
  email: 'mario.rossi@agenziaentrate.it',
  consegna: 'email_aziendale',
  emailPersonale: '',
  telefono: '',
  messaggio: '',
  consensoPrivacy: true,
}

function erroreSu(campo: string, dati: Record<string, unknown>) {
  const esito = schemaDatiSocio.safeParse(dati)
  if (esito.success) return undefined
  return esito.error.issues.find((problema) => problema.path[0] === campo)?.message
}

describe('schemaDatiSocio', () => {
  test('accetta la compilazione più semplice: ricevo sull’email aziendale', () => {
    expect(schemaDatiSocio.safeParse(base).success).toBe(true)
  })

  test('i quattro campi dell’identità sono obbligatori', () => {
    expect(erroreSu('nome', { ...base, nome: ' ' })).toBeDefined()
    expect(erroreSu('cognome', { ...base, cognome: '' })).toBeDefined()
    expect(erroreSu('codiceDipendente', { ...base, codiceDipendente: '' })).toBeDefined()
    expect(erroreSu('email', { ...base, email: '' })).toBeDefined()
  })

  test('l’email aziendale è quella comunicata al CRAL, e il messaggio lo dice', () => {
    // Il riscontro respinge chi scrive da un altro indirizzo: se il messaggio
    // non spiega quale indirizzo serve, il socio riprova con lo stesso.
    expect(erroreSu('email', { ...base, email: '' })).toMatch(/comunicat/i)
  })

  test('senza consenso non si invia', () => {
    expect(erroreSu('consensoPrivacy', { ...base, consensoPrivacy: false })).toBeDefined()
  })

  test('chi sceglie l’email personale deve scriverla', () => {
    const dati = { ...base, consegna: 'email_personale' }
    expect(erroreSu('emailPersonale', dati)).toBeDefined()
    expect(schemaDatiSocio.safeParse({ ...dati, emailPersonale: 'mario@gmail.com' }).success).toBe(
      true,
    )
  })

  test('l’email personale deve essere un’email', () => {
    const dati = { ...base, consegna: 'email_personale', emailPersonale: 'mario' }
    expect(erroreSu('emailPersonale', dati)).toMatch(/chiocciola/i)
  })

  test('chi sceglie WhatsApp deve lasciare il numero', () => {
    const dati = { ...base, consegna: 'whatsapp' }
    expect(erroreSu('telefono', dati)).toBeDefined()
    expect(schemaDatiSocio.safeParse({ ...dati, telefono: '333 1234567' }).success).toBe(true)
  })

  test('un numero troppo corto per essere un telefono viene respinto', () => {
    const dati = { ...base, consegna: 'whatsapp', telefono: '333' }
    expect(erroreSu('telefono', dati)).toBeDefined()
  })

  test('i campi dell’altra consegna restano facoltativi, e non bloccano l’invio', () => {
    // Chi cambia idea a metà lascia scritto un numero e poi sceglie l'email:
    // quel numero non deve diventare un errore da correggere per andare avanti.
    const dati = { ...base, consegna: 'email_aziendale', telefono: '333', emailPersonale: 'x' }
    expect(schemaDatiSocio.safeParse(dati).success).toBe(true)
  })

  test('gli spazi ai lati spariscono prima del riscontro', () => {
    // La matricola con gli spazi la perdona il database, ma l'email con uno
    // spazio davanti no: meglio toglierli qui, una volta per tutte.
    const esito = schemaDatiSocio.safeParse({ ...base, email: '  mario.rossi@ae.it  ' })
    expect(esito.success && esito.data.email).toBe('mario.rossi@ae.it')
  })
})
