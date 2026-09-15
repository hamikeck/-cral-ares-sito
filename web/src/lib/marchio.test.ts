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

  test('rifiuta un ingresso che non è un esadecimale a sei cifre', () => {
    expect(() => rapportoDiContrasto('#FFF', '#000000')).toThrow(
      /esadecimale a sei cifre/,
    )
    expect(() => rapportoDiContrasto('rgb(255, 255, 255)', '#000000')).toThrow(
      /esadecimale a sei cifre/,
    )
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

/**
 * La veste notturna non passa da `marchio.ts`: i suoi colori sono derivati e
 * vivono solo in `globals.css`. Si leggono da lì, così il test verifica i
 * valori che il sito usa davvero e non una copia che può divergere.
 */
function tokenDelCss(nome: string): string {
  const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8')
  const trovato = css.match(new RegExp(`--color-${nome}:\\s*(#[0-9a-fA-F]{6})`))
  if (!trovato) throw new Error(`In globals.css manca il token --color-${nome}.`)
  return trovato[1]
}

describe('veste notturna', () => {
  const fondi = ['notte', 'cielo', 'orizzonte', 'pannello', 'pannello-alto']

  test('i tre livelli di testo superano il minimo AA di 4,5:1 su ogni fondo', () => {
    for (const testo of ['chiaro', 'lettura', 'tenue']) {
      for (const fondo of fondi) {
        expect(
          rapportoDiContrasto(tokenDelCss(testo), tokenDelCss(fondo)),
          `${testo} su ${fondo}`,
        ).toBeGreaterThanOrEqual(4.5)
      }
    }
  })

  test('oro e luce reggono il testo sul pannello', () => {
    expect(rapportoDiContrasto(tokenDelCss('oro'), tokenDelCss('pannello'))).toBeGreaterThanOrEqual(4.5)
    expect(rapportoDiContrasto(tokenDelCss('luce'), tokenDelCss('pannello'))).toBeGreaterThanOrEqual(4.5)
  })

  test("l'arancione degli errori si legge su ogni fondo", () => {
    for (const fondo of fondi) {
      expect(
        rapportoDiContrasto(tokenDelCss('arancione'), tokenDelCss(fondo)),
        `arancione su ${fondo}`,
      ).toBeGreaterThanOrEqual(4.5)
    }
  })

  /**
   * WCAG 2.1, criterio 1.4.11: il contorno di un comando deve staccare di
   * almeno 3:1 da ciò che gli sta intorno. Su un campo di testo il bordo è
   * l'unica cosa che dice dove si scrive, perché l'interno e la pagina hanno
   * quasi lo stesso fondo — quindi lì il minimo si applica davvero.
   */
  test('la cornice dei campi stacca di almeno 3:1 da ogni fondo', () => {
    for (const fondo of fondi) {
      expect(
        rapportoDiContrasto(tokenDelCss('cornice'), tokenDelCss(fondo)),
        `cornice su ${fondo}`,
      ).toBeGreaterThanOrEqual(3)
    }
  })

  test('`parete` NON basta per i comandi, ed è il motivo per cui `cornice` esiste', () => {
    expect(rapportoDiContrasto(tokenDelCss('parete'), tokenDelCss('pannello'))).toBeLessThan(3)
  })
})
