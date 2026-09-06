import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { contenutiPagine } from '@/contenuti/pagine'
import { offerte, offerteValide } from '@/contenuti/offerteEsempio'
import { formattaData } from '@/lib/date'
import PaginaOfferta, { generateStaticParams } from './page'

const valide = offerteValide()
const conRichiesta = valide.find((o) => o.modalita !== 'solo_sconto')!
const soloSconto = valide.find((o) => o.modalita === 'solo_sconto')!
const terminata = offerte.find(
  (o) => !valide.some((v) => v.slug === o.slug),
)!

describe('Pagina di una singola offerta', () => {
  test('genera una pagina statica per ogni offerta', async () => {
    const generati = await generateStaticParams()
    expect(generati.map((p) => p.slug).sort()).toEqual(
      offerte.map((o) => o.slug).sort(),
    )
  })

  test('il partner è il titolo di primo livello, ed è uno solo', async () => {
    render(
      await PaginaOfferta({ params: Promise.resolve({ slug: conRichiesta.slug }) }),
    )
    const titoli = screen.getAllByRole('heading', { level: 1 })
    expect(titoli).toHaveLength(1)
    expect(titoli[0]).toHaveTextContent(conRichiesta.partner)
  })

  test('mostra vantaggio, scadenza e tutte le condizioni', async () => {
    render(
      await PaginaOfferta({ params: Promise.resolve({ slug: conRichiesta.slug }) }),
    )
    expect(screen.getByText(conRichiesta.vantaggio)).toBeInTheDocument()
    expect(
      screen.getByText(`Valida fino al ${formattaData(conRichiesta.validaAl)}`),
    ).toBeInTheDocument()
    for (const condizione of conRichiesta.condizioni) {
      expect(screen.getByText(condizione)).toBeInTheDocument()
    }
  })

  test("un'offerta da richiedere dice che il modulo non c'è ancora", async () => {
    render(
      await PaginaOfferta({ params: Promise.resolve({ slug: conRichiesta.slug }) }),
    )
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: contenutiPagine.offerta.titoloRichiesta,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /info@cralares\.it/ }),
    ).toHaveAttribute('href', 'mailto:info@cralares.it')
  })

  test("un'offerta a solo sconto spiega cosa fare, senza modulo", async () => {
    render(
      await PaginaOfferta({ params: Promise.resolve({ slug: soloSconto.slug }) }),
    )
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: contenutiPagine.offerta.titoloComeFunziona,
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(soloSconto.istruzioni!)).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        level: 2,
        name: contenutiPagine.offerta.titoloRichiesta,
      }),
    ).not.toBeInTheDocument()
  })

  test('riporta indietro a tutte le offerte', async () => {
    render(
      await PaginaOfferta({ params: Promise.resolve({ slug: conRichiesta.slug }) }),
    )
    expect(
      screen.getByRole('link', { name: contenutiPagine.offerta.torna }),
    ).toHaveAttribute('href', '/offerte')
  })

  test('uno slug inesistente non produce una pagina', async () => {
    await expect(
      PaginaOfferta({ params: Promise.resolve({ slug: 'non-esiste' }) }),
    ).rejects.toThrow()
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(
      await PaginaOfferta({ params: Promise.resolve({ slug: conRichiesta.slug }) }),
    )
    expect(await violazioniAccessibilita(container)).toEqual([])
  })

  test("un'offerta terminata resta raggiungibile e lo dichiara", async () => {
    render(
      await PaginaOfferta({ params: Promise.resolve({ slug: terminata.slug }) }),
    )
    expect(
      screen.getAllByText(new RegExp(contenutiPagine.offerta.scaduta)).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByText(new RegExp(formattaData(terminata.validaAl))),
    ).toBeInTheDocument()
  })

  test("un'offerta terminata non propone più di richiederla", async () => {
    render(
      await PaginaOfferta({ params: Promise.resolve({ slug: terminata.slug }) }),
    )
    for (const titolo of [
      contenutiPagine.offerta.titoloRichiesta,
      contenutiPagine.offerta.titoloComeFunziona,
    ]) {
      expect(
        screen.queryByRole('heading', { level: 2, name: titolo }),
      ).not.toBeInTheDocument()
    }
  })

  test("un'offerta terminata rimanda a quelle in corso", async () => {
    render(
      await PaginaOfferta({ params: Promise.resolve({ slug: terminata.slug }) }),
    )
    expect(
      screen.getByRole('link', { name: 'le offerte in corso' }),
    ).toHaveAttribute('href', '/offerte')
  })
})
