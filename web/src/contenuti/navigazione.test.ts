import { describe, expect, test } from 'vitest'
import { vociDiMenu, vociLegali } from './navigazione'

describe('voci di navigazione', () => {
  test('ogni percorso comincia con una barra ed è unico', () => {
    const percorsi = [...vociDiMenu, ...vociLegali].map((voce) => voce.percorso)
    for (const percorso of percorsi) {
      expect(percorso.startsWith('/')).toBe(true)
    }
    expect(new Set(percorsi).size).toBe(percorsi.length)
  })

  test('ogni voce ha un\'etichetta non vuota', () => {
    for (const voce of [...vociDiMenu, ...vociLegali]) {
      expect(voce.etichetta.trim().length).toBeGreaterThan(0)
    }
  })

  test('il menu principale contiene le pagine della fase 1', () => {
    const percorsi = vociDiMenu.map((voce) => voce.percorso)
    expect(percorsi).toContain('/chi-siamo')
    expect(percorsi).toContain('/iscriviti')
  })

  test('le voci legali sono privacy e cookie', () => {
    expect(vociLegali.map((voce) => voce.percorso)).toEqual(['/privacy', '/cookie'])
  })
})
