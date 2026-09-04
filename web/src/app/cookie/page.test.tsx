import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { contenutiPagine } from '@/contenuti/pagine'
import Cookie from './page'

describe('Cookie', () => {
  test('mostra il titolo della pagina come unico h1', () => {
    render(<Cookie />)
    const titoli = screen.getAllByRole('heading', { level: 1 })
    expect(titoli).toHaveLength(1)
    expect(titoli[0]).toHaveTextContent(contenutiPagine.cookie.titolo)
  })

  test('spiega che sono usati solo cookie tecnici', () => {
    render(<Cookie />)
    for (const paragrafo of contenutiPagine.cookie.paragrafi) {
      expect(screen.getByText(paragrafo)).toBeInTheDocument()
    }
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<Cookie />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
