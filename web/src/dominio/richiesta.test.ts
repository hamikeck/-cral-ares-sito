import { describe, expect, test } from 'vitest'
import { comePaga, cosaChiede, type Richiesta } from './richiesta'

const base: Richiesta = {
  id: 'r1',
  numero: 42,
  tipo: 'cinema',
  creataIl: '2026-09-14T10:00:00Z',
  nome: 'Mario',
  cognome: 'Rossi',
  codiceDipendente: 'AE12345',
  email: 'mario.rossi@agenziaentrate.it',
  avvisoInviato: false,
}

describe('cosaChiede', () => {
  test('per il cinema dice quanti e dove', () => {
    expect(
      cosaChiede({ ...base, quantita: 4, circuito: 'UCI Cinemas', sede: 'UCI Casoria' }),
    ).toBe('4 biglietti UCI Cinemas (UCI Casoria)')
  })

  test('senza sala non lascia parentesi vuote', () => {
    expect(cosaChiede({ ...base, quantita: 4, circuito: 'UCI Cinemas' })).toBe(
      '4 biglietti UCI Cinemas',
    )
  })

  test('per una convenzione dice quale', () => {
    expect(cosaChiede({ ...base, tipo: 'convenzione', convenzione: 'Gommista' })).toBe(
      'Convenzione Gommista',
    )
  })

  test('per un’offerta distingue i posti dalle informazioni', () => {
    expect(cosaChiede({ ...base, tipo: 'offerta', offerta: 'Teatro Diana', quantita: 2 })).toBe(
      '2 posti Teatro Diana',
    )
    expect(cosaChiede({ ...base, tipo: 'offerta', offerta: 'Teatro Diana' })).toBe(
      'Informazioni Teatro Diana',
    )
  })
})

describe('comePaga', () => {
  test('usa le due parole del modulo, e non un terzo sinonimo', () => {
    // «Cedolino» era il bonifico detto in un altro modo: due nomi per una
    // cosa sola, e il socio che rileggeva la propria richiesta non sapeva
    // più quale delle due avesse scelto.
    expect(comePaga({ ...base, pagamento: 'bonifico' })).toBe('Bonifico')
    expect(comePaga({ ...base, pagamento: 'busta_paga' })).toBe('Busta paga')
  })

  test('resta vuoto dove non c’era niente da pagare', () => {
    // È il caso delle convenzioni: chiedere come pagare qualcosa che non si
    // sa ancora se esiste sarebbe un campo senza senso.
    expect(comePaga(base)).toBe('')
  })
})
