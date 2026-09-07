import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { offerteFinte } from '@/test/offerteFinte'

vi.mock('@/dati/offerte', () => ({
  offerteValide: async () => offerteFinte.filter((o) => o.validaAl >= '2026-09-15'),
  offertaDaSlug: async (slug: string) =>
    offerteFinte.find((offerta) => offerta.slug === slug),
  slugPubblicati: async () => offerteFinte.map((offerta) => offerta.slug),
}))

import { violazioniAccessibilita } from '@/test/accessibilita'
import { Intestazione } from '@/componenti/Intestazione'
import { PiedePagina } from '@/componenti/PiedePagina'
import Home from '@/app/page'
import ChiSiamo from '@/app/chi-siamo/page'
import NonTrovata from '@/app/not-found'
import PaginaOfferta from '@/app/offerte/[slug]/page'

/**
 * Le pagine messe insieme al loro contorno.
 *
 * Gli altri test rendono ogni pagina da sola, e va bene per ciò che
 * verificano. Ma alcune regole di accessibilità esistono solo sulla pagina
 * intera: che i punti di riferimento non si ripetano senza etichetta, che
 * tutto il contenuto stia dentro uno di essi, che non ci sia più di un
 * `banner` o di un `contentinfo`. Isolando i pezzi, quelle regole non
 * verrebbero mai messe alla prova — ed è esattamente il tipo di difetto che a
 * occhio non si vede e che un lettore di schermo sbatte in faccia.
 *
 * Qui non si può usare il layout vero, perché dichiara `html` e `body` e
 * jsdom ne ha già uno. Si ricompone la stessa struttura: è l'unico punto del
 * progetto in cui una duplicazione è giustificata, e se il layout cambierà
 * questo file va aggiornato con lui.
 */
function conContorno(pagina: React.ReactNode) {
  return (
    <>
      <Intestazione />
      <main id="contenuto">{pagina}</main>
      <PiedePagina />
    </>
  )
}

/** La stessa espressione usata dal mock qui sopra: è il dato atteso dai test. */
const offerteValideAttese = offerteFinte.filter((o) => o.validaAl >= '2026-09-15')
const primaOfferta = offerteValideAttese[0]

describe('pagine assemblate con intestazione e piè di pagina', () => {
  test.each([
    ['home', () => Home()],
    ['chi siamo', () => <ChiSiamo key="chi-siamo" />],
    ['pagina non trovata', () => <NonTrovata key="404" />],
  ])('%s non presenta violazioni di accessibilità', async (_nome, ottieniPagina) => {
    const { container } = render(conContorno(await ottieniPagina()))
    expect(await violazioniAccessibilita(container)).toEqual([])
  })

  test('la scheda di un’offerta non presenta violazioni', async () => {
    const pagina = await PaginaOfferta({
      params: Promise.resolve({ slug: primaOfferta.slug }),
    })
    const { container } = render(conContorno(pagina))
    expect(await violazioniAccessibilita(container)).toEqual([])
  })

  test('esiste un solo titolo di primo livello per pagina', async () => {
    render(conContorno(await Home()))
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  test('i punti di riferimento sono unici e nominati', async () => {
    render(conContorno(await Home()))
    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)

    // Due navigazioni sulla stessa pagina devono distinguersi per nome,
    // altrimenti chi le scorre per punti di riferimento sente «navigazione,
    // navigazione» e non sa quale sia quale.
    const navigazioni = screen.getAllByRole('navigation')
    expect(navigazioni).toHaveLength(2)
    const nomi = navigazioni.map((n) => n.getAttribute('aria-label'))
    expect(new Set(nomi).size).toBe(nomi.length)
    for (const nome of nomi) expect(nome?.trim()).toBeTruthy()
  })

  test('il salta-al-contenuto punta a un elemento che esiste', async () => {
    const { container } = render(conContorno(await Home()))
    const salta = screen.getByRole('link', { name: 'Salta al contenuto' })
    const bersaglio = salta.getAttribute('href')!.slice(1)
    expect(container.querySelector(`#${bersaglio}`)).not.toBeNull()
  })
})
