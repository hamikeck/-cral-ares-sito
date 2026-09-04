import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { contenutiPagine } from '@/contenuti/pagine'
import NonTrovata from './not-found'

describe('NonTrovata', () => {
  test('mostra il titolo della pagina come unico h1', () => {
    render(<NonTrovata />)
    const titoli = screen.getAllByRole('heading', { level: 1 })
    expect(titoli).toHaveLength(1)
    expect(titoli[0]).toHaveTextContent(contenutiPagine.nonTrovata.titolo)
  })

  test('rimanda alla home', () => {
    render(<NonTrovata />)
    expect(
      screen.getByRole('link', { name: contenutiPagine.nonTrovata.invito }),
    ).toHaveAttribute('href', '/')
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<NonTrovata />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
