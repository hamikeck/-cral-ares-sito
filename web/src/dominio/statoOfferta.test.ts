import { describe, expect, test } from 'vitest'
import { statoLeggibile } from './statoOfferta'

const base = { stato: 'pubblicata' as const, validaDal: '2026-09-01', validaAl: '2026-09-30' }

describe('statoLeggibile', () => {
  test('una bozza è una bozza, comunque siano le date', () => {
    expect(statoLeggibile({ ...base, stato: 'bozza' }, '2026-09-15')).toBe('Bozza')
    expect(statoLeggibile({ ...base, stato: 'bozza' }, '2026-12-31')).toBe('Bozza')
  })

  test('pubblicata e dentro le date è in corso', () => {
    expect(statoLeggibile(base, '2026-09-15')).toBe('In corso')
  })

  test('il primo e l’ultimo giorno sono ancora in corso', () => {
    expect(statoLeggibile(base, '2026-09-01')).toBe('In corso')
    expect(statoLeggibile(base, '2026-09-30')).toBe('In corso')
  })

  test('pubblicata ma non ancora iniziata è programmata', () => {
    expect(statoLeggibile(base, '2026-08-20')).toBe('Programmata')
  })

  test('pubblicata e con la validità passata è scaduta', () => {
    expect(statoLeggibile(base, '2026-10-01')).toBe('Scaduta')
  })

  test('pubblicata e senza data di fine non è mai scaduta: resta in corso', () => {
    expect(statoLeggibile({ ...base, validaAl: undefined }, '2030-01-01')).toBe('In corso')
  })
})
