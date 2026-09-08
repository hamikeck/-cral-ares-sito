import { describe, expect, test } from 'vitest'
import { sluggifica } from './slug'

describe('sluggifica', () => {
  test('minuscole e trattini al posto degli spazi', () => {
    expect(sluggifica('UCI Cinemas')).toBe('uci-cinemas')
  })

  test('toglie gli accenti invece di lasciarli nell’indirizzo', () => {
    expect(sluggifica('Caffè Città')).toBe('caffe-citta')
  })

  test('toglie apostrofi e punteggiatura', () => {
    expect(sluggifica("L'Oasi dell'Auto s.r.l.")).toBe('l-oasi-dell-auto-s-r-l')
  })

  test('non lascia trattini in testa, in coda o doppi', () => {
    expect(sluggifica('  — Teatro   Diana — ')).toBe('teatro-diana')
  })
})
