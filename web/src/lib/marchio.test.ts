import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { colori, rapportoDiContrasto } from './marchio'

describe('rapportoDiContrasto', () => {
  test('vale 21:1 fra nero e bianco', () => {
    expect(rapportoDiContrasto('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
  })

  test('vale 1:1 fra un colore e se stesso', () => {
    expect(rapportoDiContrasto('#73D1EA', '#73D1EA')).toBeCloseTo(1, 2)
  })
})

describe('palette del marchio', () => {
  test('i colori per il testo su bianco superano il minimo AA di 4,5:1', () => {
    expect(rapportoDiContrasto(colori.bluProfondo, colori.bianco)).toBeGreaterThanOrEqual(4.5)
    expect(rapportoDiContrasto(colori.bluNotte, colori.bianco)).toBeGreaterThanOrEqual(4.5)
    expect(rapportoDiContrasto(colori.ambraScura, colori.bianco)).toBeGreaterThanOrEqual(4.5)
  })

  test('azzurro su fondo blu-notte è utilizzabile per il testo', () => {
    expect(rapportoDiContrasto(colori.azzurro, colori.bluNotte)).toBeGreaterThanOrEqual(4.5)
  })

  test('azzurro e arancione su bianco NON sono utilizzabili per il testo', () => {
    expect(rapportoDiContrasto(colori.azzurro, colori.bianco)).toBeLessThan(4.5)
    expect(rapportoDiContrasto(colori.arancione, colori.bianco)).toBeLessThan(4.5)
  })
})

describe('allineamento fra TypeScript e CSS', () => {
  test('globals.css definisce esattamente gli stessi valori', () => {
    const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8')
    for (const valore of Object.values(colori)) {
      if (valore === '#FFFFFF') continue
      expect(css.toUpperCase()).toContain(valore.toUpperCase())
    }
  })
})
