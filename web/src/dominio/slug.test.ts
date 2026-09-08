import { describe, expect, test } from 'vitest'
import { slugOfferta, sluggifica } from './slug'

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

describe('slugOfferta', () => {
  test('compone partner, vantaggio e anno di inizio validità', () => {
    expect(slugOfferta('UCI Cinemas', 'Ingresso ridotto', '2026-10-01')).toBe(
      'uci-cinemas-ingresso-ridotto-2026',
    )
  })

  test('un vantaggio lungo si tronca su un confine di parola, non a metà', () => {
    const slug = slugOfferta('Teatro Diana', 'Poltronissima a 18 € invece di 32 €', '2026-10-01')

    expect(slug).toBe('teatro-diana-poltronissima-a-18-invece-2026')
    // Né una parola spezzata a metà, né un trattino lasciato subito prima dell'anno.
    expect(slug).not.toMatch(/--/)
    expect(slug.endsWith('-2026')).toBe(true)
  })

  test('la stessa convenzione rinnovata l’anno dopo ottiene un indirizzo diverso', () => {
    const slugQuestAnno = slugOfferta('UCI Cinemas', 'Ingresso ridotto', '2026-01-01')
    const slugAnnoProssimo = slugOfferta('UCI Cinemas', 'Ingresso ridotto', '2027-01-01')

    expect(slugQuestAnno).not.toBe(slugAnnoProssimo)
    expect(slugAnnoProssimo).toBe('uci-cinemas-ingresso-ridotto-2027')
  })
})
