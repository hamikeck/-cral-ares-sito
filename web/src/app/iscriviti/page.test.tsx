import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { contenutiPagine } from '@/contenuti/pagine'
import Iscriviti from './page'

describe('Iscriviti', () => {
  test('mostra il titolo della pagina come unico h1', () => {
    render(<Iscriviti />)
    const titoli = screen.getAllByRole('heading', { level: 1 })
    expect(titoli).toHaveLength(1)
    expect(titoli[0]).toHaveTextContent(contenutiPagine.iscriviti.titolo)
  })

  test('mostra il contatto per aderire', () => {
    render(<Iscriviti />)
    expect(
      screen.getByRole('link', { name: /segreteriacral@cralares\.com/ }),
    ).toHaveAttribute('href', 'mailto:segreteriacral@cralares.com')
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<Iscriviti />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
