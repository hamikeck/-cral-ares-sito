import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { contenutiPagine } from '@/contenuti/pagine'
import { categorie, offerte, offerteValide } from '@/contenuti/offerteEsempio'
import Offerte from './page'

/** Le pagine di Next ricevono i parametri come promessa. */
function parametri(valori: Record<string, string> = {}) {
  return Promise.resolve(valori)
}

describe('Elenco delle offerte', () => {
  test('mostra il titolo della pagina come unico h1', async () => {
    render(await Offerte({ searchParams: parametri() }))
    const titoli = screen.getAllByRole('heading', { level: 1 })
    expect(titoli).toHaveLength(1)
    expect(titoli[0]).toHaveTextContent(contenutiPagine.offerte.titolo)
  })

  test('elenca le offerte valide, ciascuna cliccabile', async () => {
    render(await Offerte({ searchParams: parametri() }))
    for (const offerta of offerteValide()) {
      expect(
        screen.getByRole('link', { name: offerta.partner }),
      ).toHaveAttribute('href', `/offerte/${offerta.slug}`)
    }
  })

  test('le offerte scadute non compaiono', async () => {
    render(await Offerte({ searchParams: parametri() }))
    const valide = new Set(offerteValide().map((o) => o.slug))
    const scadute = offerte.filter((o) => !valide.has(o.slug))
    expect(scadute.length).toBeGreaterThan(0)
    for (const offerta of scadute) {
      expect(
        screen.queryByRole('link', { name: offerta.partner }),
      ).not.toBeInTheDocument()
    }
  })

  test('con una categoria mostra solo le offerte di quella categoria', async () => {
    const categoria = categorie()[0]
    render(await Offerte({ searchParams: parametri({ categoria }) }))
    for (const offerta of offerteValide()) {
      const collegamento = screen.queryByRole('link', {
        name: offerta.partner,
      })
      if (offerta.categoria === categoria) {
        expect(collegamento).toBeInTheDocument()
      } else {
        expect(collegamento).not.toBeInTheDocument()
      }
    }
  })

  test('la categoria attiva è dichiarata come tale', async () => {
    const categoria = categorie()[0]
    render(await Offerte({ searchParams: parametri({ categoria }) }))
    expect(screen.getByRole('link', { name: categoria })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  test('una categoria inventata non filtra nulla e non rompe la pagina', async () => {
    render(await Offerte({ searchParams: parametri({ categoria: 'Astronautica' }) }))
    expect(
      screen.getAllByRole('link', { name: offerteValide()[0].partner }),
    ).toHaveLength(1)
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(await Offerte({ searchParams: parametri() }))
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
