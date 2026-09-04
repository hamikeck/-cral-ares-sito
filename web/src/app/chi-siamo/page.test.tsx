import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { contenutiPagine } from '@/contenuti/pagine'
import ChiSiamo from './page'

describe('Chi siamo', () => {
  test('mostra il titolo della pagina come unico h1', () => {
    render(<ChiSiamo />)
    const titoli = screen.getAllByRole('heading', { level: 1 })
    expect(titoli).toHaveLength(1)
    expect(titoli[0]).toHaveTextContent(contenutiPagine.chiSiamo.titolo)
  })

  test('mostra tutti i paragrafi previsti', () => {
    render(<ChiSiamo />)
    for (const paragrafo of contenutiPagine.chiSiamo.paragrafi) {
      expect(screen.getByText(paragrafo)).toBeInTheDocument()
    }
  })

  test('dichiara che il direttivo sarà pubblicato', () => {
    render(<ChiSiamo />)
    expect(
      screen.getByText(contenutiPagine.chiSiamo.notaProvvisoria),
    ).toBeInTheDocument()
  })

  test('mostra i contatti dell\'associazione', () => {
    render(<ChiSiamo />)
    expect(
      screen.getByRole('heading', { level: 2, name: contenutiPagine.chiSiamo.titoloContatti }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /info@cralares\.it/ })).toHaveAttribute(
      'href',
      'mailto:info@cralares.it',
    )
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<ChiSiamo />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
