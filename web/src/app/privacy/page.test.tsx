import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { contenutiPagine } from '@/contenuti/pagine'
import Privacy from './page'

describe('Privacy', () => {
  test('mostra il titolo della pagina come unico h1', () => {
    render(<Privacy />)
    const titoli = screen.getAllByRole('heading', { level: 1 })
    expect(titoli).toHaveLength(1)
    expect(titoli[0]).toHaveTextContent(contenutiPagine.privacy.titolo)
  })

  test('dichiara che l\'informativa è in corso di redazione', () => {
    render(<Privacy />)
    expect(
      screen.getByText(contenutiPagine.privacy.notaProvvisoria),
    ).toBeInTheDocument()
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<Privacy />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
