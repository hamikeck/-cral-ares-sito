import { run } from 'axe-core'

/**
 * Elenca le violazioni di accessibilità trovate da axe in un frammento.
 * Restituisce un array vuoto quando non ce ne sono.
 *
 * La regola del contrasto è disattivata di proposito: jsdom non calcola i
 * colori effettivi, quindi darebbe risultati inattendibili. Il contrasto è
 * verificato a parte, sui valori della palette, in src/lib/marchio.test.ts.
 */
export async function violazioniAccessibilita(
  contenitore: HTMLElement,
): Promise<string[]> {
  const risultati = await run(contenitore, {
    rules: { 'color-contrast': { enabled: false } },
  })
  return risultati.violations.map(
    (violazione) => `${violazione.id}: ${violazione.help}`,
  )
}
