import { describe, expect, test } from 'vitest'
import { testoPerEmail } from './testoEmail'
import { offerteFinte } from '@/test/offerteFinte'

const offerta = offerteFinte[0]

describe('testoPerEmail', () => {
  test('apre con partner e vantaggio, che sono il motivo per leggere', () => {
    const testo = testoPerEmail(offerta, 'https://cralares.it')

    expect(testo.split('\n')[0]).toBe('UCI Cinemas — 6,50 € invece di 9,50')
  })

  test('scrive la scadenza in italiano, non in ISO', () => {
    expect(testoPerEmail(offerta, 'https://cralares.it')).toContain(
      'Valida fino al 30 settembre 2026',
    )
  })

  test('contiene il link completo alla scheda', () => {
    expect(testoPerEmail(offerta, 'https://cralares.it')).toContain(
      'https://cralares.it/offerte/uci-cinemas-ingresso-ridotto',
    )
  })

  test('non lascia doppie barre se l’indirizzo finisce con una', () => {
    expect(testoPerEmail(offerta, 'https://cralares.it/')).toContain(
      'https://cralares.it/offerte/uci-cinemas-ingresso-ridotto',
    )
  })

  test('senza data di fine dice che non c’è scadenza, invece di tentare di formattare una data assente', () => {
    const permanente = { ...offerta, validaAl: undefined }

    expect(testoPerEmail(permanente, 'https://cralares.it')).toContain(
      'Offerta senza scadenza.',
    )
  })
})
