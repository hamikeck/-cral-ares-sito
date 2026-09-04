import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { contenutiPagine } from '@/contenuti/pagine'
import Home from './page'

describe('Home', () => {
  test('ha un solo titolo di primo livello, quello previsto', () => {
    render(<Home />)
    const titoli = screen.getAllByRole('heading', { level: 1 })
    expect(titoli).toHaveLength(1)
    expect(titoli[0]).toHaveTextContent(contenutiPagine.home.titolo)
  })

  test('invita a iscriversi con un collegamento alla pagina dedicata', () => {
    render(<Home />)
    expect(
      screen.getByRole('link', { name: contenutiPagine.home.invito }),
    ).toHaveAttribute('href', '/iscriviti')
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<Home />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
