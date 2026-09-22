import { describe, expect, test } from 'vitest'
import { inizialiDa } from './iniziali'

describe('inizialiDa', () => {
  test('prende la prima lettera delle prime due parole', () => {
    expect(inizialiDa('Teatro Bellini')).toBe('TB')
    expect(inizialiDa('The Space Cinema')).toBe('TS')
  })

  test('l’apostrofo non divide una parola', () => {
    // «Farmacia D'Atri» sono due partner in uno se si spezza sull'apostrofo:
    // verrebbe FA, che non è il nome di nessuno.
    expect(inizialiDa('Farmacia D’Atri')).toBe('FD')
    expect(inizialiDa("Farmacia D'Atri")).toBe('FD')
  })

  test('un nome di una parola sola dà le sue prime due lettere', () => {
    // Una lettera sola dentro un quadrato da 52 px sembra un errore.
    expect(inizialiDa('Acquachiara')).toBe('AC')
  })

  test('le sigle restano sigle', () => {
    expect(inizialiDa('UCI Cinemas')).toBe('UC')
  })

  test('il trattino divide, come uno spazio', () => {
    expect(inizialiDa('Bar-Gelateria Napoli')).toBe('BG')
  })

  test('un nome vuoto non produce lettere inventate', () => {
    expect(inizialiDa('')).toBe('')
    expect(inizialiDa('   ')).toBe('')
  })
})
