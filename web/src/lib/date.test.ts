import { describe, expect, test } from 'vitest'
import { formattaData, nonAncoraIniziata, oggi, scaduta } from './date'

describe('oggi', () => {
  test('ha la forma ISO di una data senza ora', () => {
    expect(oggi()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('formattaData', () => {
  test('scrive la data per esteso in italiano', () => {
    expect(formattaData('2026-09-30')).toBe('30 settembre 2026')
    expect(formattaData('2026-01-01')).toBe('1 gennaio 2026')
    expect(formattaData('2026-12-31')).toBe('31 dicembre 2026')
  })

  test('non anticipa né posticipa il giorno', () => {
    // Il caso che rompe le implementazioni ingenue: `new Date('2026-03-01')`
    // vale mezzanotte UTC, e in un fuso a ovest verrebbe reso come 28 febbraio.
    expect(formattaData('2026-03-01')).toBe('1 marzo 2026')
  })
})

describe('scaduta', () => {
  test('il giorno indicato è ancora valido', () => {
    expect(scaduta('2026-09-30', '2026-09-30')).toBe(false)
  })

  test('il giorno dopo è scaduta', () => {
    expect(scaduta('2026-09-30', '2026-10-01')).toBe(true)
  })

  test('una data futura non è scaduta', () => {
    expect(scaduta('2027-01-01', '2026-09-30')).toBe(false)
  })

  test('il confronto regge il cambio di anno', () => {
    expect(scaduta('2026-12-31', '2027-01-01')).toBe(true)
    expect(scaduta('2027-01-01', '2026-12-31')).toBe(false)
  })

  test('una data assente non è mai scaduta: le convenzioni permanenti restano sempre in corso', () => {
    expect(scaduta(undefined, '2026-12-31')).toBe(false)
  })
})

describe('nonAncoraIniziata', () => {
  test("un'offerta che parte domani non è ancora iniziata", () => {
    expect(nonAncoraIniziata('2026-10-01', '2026-09-30')).toBe(true)
  })

  test('il giorno di partenza è già buono', () => {
    expect(nonAncoraIniziata('2026-09-30', '2026-09-30')).toBe(false)
  })
})
