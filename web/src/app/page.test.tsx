import { describe, expect, test, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { offerteFinte } from '@/test/offerteFinte'

// Un'offerta senza `validaAl` è una convenzione permanente: non scade mai.
const offerte = vi.hoisted(() => ({ aperte: true }))

vi.mock('@/dati/offerte', () => ({
  offerteValide: async () =>
    offerte.aperte
      ? offerteFinte.filter((o) => o.validaAl === undefined || o.validaAl >= '2026-09-15')
      : [],
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

  test('il nastro raccoglie tutte le offerte aperte, la prima in evidenza', async () => {
    render(await Home())

    const nastro = screen.getByRole('region', { name: contenutiPagine.home.titoloNastro })
    const schede = within(nastro).getAllByRole('listitem')

    expect(schede.length).toBeGreaterThan(1)
    // L'oro sta su una carta per schermata: la prima. Le altre hanno
    // l'azione col solo contorno.
    expect(within(schede[0]).getByText(/Richiedi|Vedi/)).toBeInTheDocument()
  })

  test('le due porte del servizio ci sono anche nella settimana senza offerte', async () => {
    // È il motivo per cui stanno sulla home e non dentro l'elenco: biglietti
    // e convenzioni sono il servizio permanente del CRAL, e ci sono anche
    // quando i direttori non hanno pubblicato niente.
    offerte.aperte = false
    render(await Home())

    expect(
      screen.getByRole('heading', { name: contenutiPagine.home.porte.cinema.titolo }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: contenutiPagine.home.porte.convenzioni.titolo }),
    ).toBeInTheDocument()
    expect(screen.getByText(contenutiPagine.home.nessunaOfferta)).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: contenutiPagine.home.titoloNastro }),
    ).not.toBeInTheDocument()

    offerte.aperte = true
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(await Home())
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
