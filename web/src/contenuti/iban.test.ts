import { describe, expect, test } from 'vitest'
import { contenutiPagine } from './pagine'

/**
 * Il controllo ISO 13616: si spostano in coda i primi quattro caratteri, le
 * lettere diventano numeri (A = 10 … Z = 35) e il resto della divisione per
 * 97 deve fare 1. Basta una cifra ricopiata male perché non torni.
 */
function ibanValido(iban: string): boolean {
  const riordinato = iban.slice(4) + iban.slice(0, 4)
  let resto = 0
  for (const carattere of riordinato) {
    for (const cifra of String(parseInt(carattere, 36))) {
      resto = (resto * 10 + Number(cifra)) % 97
    }
  }
  return resto === 1
}

describe("l'IBAN dell'associazione", () => {
  const { iban } = contenutiPagine.associazione

  test('è italiano, lungo 27 caratteri e senza spazi', () => {
    expect(iban).toMatch(/^IT\d{2}[A-Z]\d{22}$/)
  })

  test('il carattere di controllo torna', () => {
    expect(ibanValido(iban!)).toBe(true)
  })

  test('il controllo scarta una cifra scambiata', () => {
    expect(ibanValido('IT32Y0538703410000004305495')).toBe(false)
  })
})
