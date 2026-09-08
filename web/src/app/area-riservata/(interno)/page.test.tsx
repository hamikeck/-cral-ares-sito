import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { offerteFinte } from '@/test/offerteFinte'
import { violazioniAccessibilita } from '@/test/accessibilita'

vi.mock('@/dati/offerteRiservate', () => ({
  tutteLeOfferte: async () =>
    offerteFinte.map((offerta, indice) => ({
      ...offerta,
      id: `id-${indice}`,
      stato: indice === 0 ? ('bozza' as const) : ('pubblicata' as const),
    })),
}))

const AreaRiservata = (await import('./page')).default

describe('elenco in area riservata', () => {
  test('mostra ogni offerta con il suo stato', async () => {
    render(await AreaRiservata())

    expect(screen.getAllByRole('row')).toHaveLength(offerteFinte.length + 1)
    expect(screen.getByText('Bozza')).toBeInTheDocument()
  })

  test('offre di creare una nuova offerta', async () => {
    render(await AreaRiservata())

    expect(screen.getByRole('link', { name: /nuova offerta/i })).toHaveAttribute(
      'href',
      '/area-riservata/offerte/nuova',
    )
  })

  test('il pulsante «Esci» porta al Route Handler che chiude la sessione', async () => {
    render(await AreaRiservata())

    expect(screen.getByRole('link', { name: /esci/i })).toHaveAttribute(
      'href',
      '/area-riservata/uscita',
    )
  })

  test('non ha problemi di accessibilità', async () => {
    const { container } = render(await AreaRiservata())

    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
