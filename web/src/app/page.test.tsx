import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { offerteFinte } from '@/test/offerteFinte'

// Un'offerta senza `validaAl` è una convenzione permanente: non scade mai.
vi.mock('@/dati/offerte', () => ({
  offerteValide: async () => offerteFinte.filter((o) => o.validaAl === undefined || o.validaAl >= '2026-09-15'),
  offertaDaSlug: async (slug: string) =>
    offerteFinte.find((offerta) => offerta.slug === slug),
  slugPubblicati: async () => offerteFinte.map((offerta) => offerta.slug),
}))

import { violazioniAccessibilita } from '@/test/accessibilita'
import { contenutiPagine } from '@/contenuti/pagine'
import Home from './page'

describe('Home', () => {
  test('ha un solo titolo di primo livello, quello previsto', async () => {
    render(await Home())
    const titoli = screen.getAllByRole('heading', { level: 1 })
    expect(titoli).toHaveLength(1)
    expect(titoli[0]).toHaveTextContent(contenutiPagine.home.titolo)
  })

  test('invita a iscriversi con un collegamento alla pagina dedicata', async () => {
    render(await Home())
    expect(
      screen.getByRole('link', { name: contenutiPagine.home.invito }),
    ).toHaveAttribute('href', '/iscriviti')
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(await Home())
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
