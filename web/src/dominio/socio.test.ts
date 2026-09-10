import { describe, expect, test } from 'vitest'
import { combacia, normalizzaEmail, normalizzaMatricola } from './socio'
import type { Socio } from './socio'

const rossi: Socio = {
  id: 'ab6e0d5e-4f2f-4a1e-9b5f-2f1c6d8a3b71',
  nome: 'Mario',
  cognome: 'Rossi',
  email: 'mario.rossi@agenziaentrate.it',
  codiceDipendente: 'AE 12345',
}

describe('normalizzaEmail', () => {
  test('non distingue maiuscole e minuscole', () => {
    expect(normalizzaEmail('Mario.Rossi@AgenziaEntrate.it')).toBe(
      'mario.rossi@agenziaentrate.it',
    )
  })

  test('perdona gli spazi ai lati, che arrivano da ogni copia-incolla', () => {
    expect(normalizzaEmail('  mario.rossi@agenziaentrate.it ')).toBe(
      'mario.rossi@agenziaentrate.it',
    )
  })
})

describe('normalizzaMatricola', () => {
  test('toglie gli spazi, anche in mezzo', () => {
    // Una matricola copiata da un cedolino arriva volentieri spezzata.
    expect(normalizzaMatricola('AE 12 345')).toBe('AE12345')
  })

  test('porta tutto in maiuscolo', () => {
    expect(normalizzaMatricola('ae12345')).toBe('AE12345')
  })
})

describe('combacia', () => {
  test('basta l’email: chi sbaglia una cifra della matricola entra lo stesso', () => {
    expect(
      combacia(rossi, {
        email: 'MARIO.ROSSI@agenziaentrate.it',
        codiceDipendente: 'AE99999',
      }),
    ).toBe(true)
  })

  test('basta la matricola: chi scrive dall’indirizzo personale entra lo stesso', () => {
    expect(
      combacia(rossi, {
        email: 'mario.rossi@gmail.com',
        codiceDipendente: 'ae 12345',
      }),
    ).toBe(true)
  })

  test('se non combacia né l’una né l’altra, non risulta', () => {
    expect(
      combacia(rossi, {
        email: 'luigi.bianchi@gmail.com',
        codiceDipendente: 'AE99999',
      }),
    ).toBe(false)
  })

  test('un campo vuoto non combacia con niente', () => {
    // Il caso che rompe le implementazioni ingenue: due stringhe vuote sono
    // uguali fra loro, e un socio con il telefono non compilato non deve
    // diventare la chiave che apre a chiunque lasci un campo in bianco.
    expect(combacia(rossi, { email: '', codiceDipendente: '' })).toBe(false)
    expect(
      combacia(
        { ...rossi, email: '' },
        { email: '', codiceDipendente: 'AE99999' },
      ),
    ).toBe(false)
  })

  test('gli spazi ai lati non fanno mancare un riscontro giusto', () => {
    expect(
      combacia(rossi, {
        email: ' mario.rossi@agenziaentrate.it',
        codiceDipendente: '',
      }),
    ).toBe(true)
  })
})
