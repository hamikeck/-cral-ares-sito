/**
 * Colori del marchio CRAL ARES, estratti da assets/logo-cral-ares.svg.
 *
 * Azzurro e arancione sono i due colori originali del logo: hanno contrasto
 * insufficiente per il testo su bianco (1,74:1 e 2,14:1 contro il 4,5:1
 * richiesto da WCAG AA), quindi si usano solo come accenti, sfondi e dettagli
 * grafici. Per testi e pulsanti esistono le varianti profonde.
 */
export const colori = {
  azzurro: '#73D1EA',
  arancione: '#EAA256',
  bluProfondo: '#0E5C74',
  bluNotte: '#0A3D4D',
  ambraScura: '#96591B',
  bianco: '#FFFFFF',
} as const

const FORMATO_ESADECIMALE = /^#[0-9a-fA-F]{6}$/

function luminanzaRelativa(colore: string): number {
  if (!FORMATO_ESADECIMALE.test(colore)) {
    throw new Error(
      `Formato colore non valido: "${colore}". È richiesto un esadecimale a sei cifre con il cancelletto, ad esempio "#73D1EA".`,
    )
  }
  const esadecimale = colore.replace('#', '')
  const canali = [0, 2, 4].map((posizione) => {
    const valore = parseInt(esadecimale.slice(posizione, posizione + 2), 16) / 255
    return valore <= 0.04045 ? valore / 12.92 : ((valore + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * canali[0] + 0.7152 * canali[1] + 0.0722 * canali[2]
}

/** Rapporto di contrasto fra due colori, secondo la formula WCAG 2.1. */
export function rapportoDiContrasto(primo: string, secondo: string): number {
  const luminanze = [luminanzaRelativa(primo), luminanzaRelativa(secondo)]
  const chiaro = Math.max(...luminanze)
  const scuro = Math.min(...luminanze)
  return (chiaro + 0.05) / (scuro + 0.05)
}
