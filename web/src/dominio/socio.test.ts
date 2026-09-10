import { describe, expect, test } from 'vitest'
import { normalizzaEmail, normalizzaMatricola } from './socio'

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
