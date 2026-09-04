import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { vociLegali } from '@/contenuti/navigazione'
import { PiedePagina } from './PiedePagina'

describe('PiedePagina', () => {
  test('mostra i rimandi legali', () => {
    render(<PiedePagina />)
    for (const voce of vociLegali) {
      expect(screen.getByRole('link', { name: voce.etichetta })).toHaveAttribute(
        'href',
        voce.percorso,
      )
    }
  })

  test('mostra l\'indirizzo email dell\'associazione', () => {
    render(<PiedePagina />)
    expect(screen.getByRole('link', { name: /info@cralares\.it/ })).toHaveAttribute(
      'href',
      'mailto:info@cralares.it',
    )
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<PiedePagina />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
