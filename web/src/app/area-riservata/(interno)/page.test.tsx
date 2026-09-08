import { beforeEach, describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { offerteFinte } from '@/test/offerteFinte'
import { violazioniAccessibilita } from '@/test/accessibilita'

// Il doppio restituisce quello che c'è in `offerteRestituite.valore` al
// momento della chiamata: `vi.mock` è issato in cima al modulo, quindi non
// può leggere una `let` di modulo, ma può leggere un oggetto mutabile
// issato insieme a lui. Ogni test decide cosa mettere dentro prima di
// renderizzare la pagina.
const { offerteRestituite } = vi.hoisted(() => ({
  offerteRestituite: { valore: [] as unknown[] },
}))

vi.mock('@/dati/offerteRiservate', () => ({
  tutteLeOfferte: async () => offerteRestituite.valore,
}))

const AreaRiservata = (await import('./page')).default

const offerteComplete = offerteFinte.map((offerta, indice) => ({
  ...offerta,
  id: `id-${indice}`,
  stato: indice === 0 ? ('bozza' as const) : ('pubblicata' as const),
}))

beforeEach(() => {
  offerteRestituite.valore = offerteComplete
})

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

describe('elenco vuoto', () => {
  // Un CRAL che parte non ha ancora offerte: è la prima schermata che un
  // direttore vede in assoluto, e va verificata tanto quanto quella piena.
  test('senza offerte, invita a crearne una e non mostra una tabella vuota', async () => {
    offerteRestituite.valore = []

    render(await AreaRiservata())

    expect(
      screen.getByText('Non c’è ancora nessuna offerta. Comincia da «Nuova offerta».'),
    ).toBeInTheDocument()
    // Non basta il testo: una tabella con zero righe mostrerebbe intestazioni
    // di colonna sospese nel vuoto, quindi la tabella non deve esistere.
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByRole('row')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /nuova offerta/i })).toBeInTheDocument()
  })

  test('senza offerte, non ha problemi di accessibilità', async () => {
    offerteRestituite.valore = []

    const { container } = render(await AreaRiservata())

    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
