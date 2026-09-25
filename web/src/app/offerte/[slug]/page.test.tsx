import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { offerteFinte } from '@/test/offerteFinte'

// Un'offerta senza `validaAl` è una convenzione permanente: non scade mai,
// quindi il filtro deve farla passare esplicitamente e non solo confrontarla
// con la data di oggi (`undefined >= ...` sarebbe sempre falso).
vi.mock('@/dati/offerte', () => ({
  offerteValide: async () =>
    offerteFinte.filter((o) => o.validaAl === undefined || o.validaAl >= '2026-09-15'),
  offertaDaSlug: vi.fn(async (slug: string) =>
    offerteFinte.find((offerta) => offerta.slug === slug),
  ),
  slugPubblicati: async () => offerteFinte.map((offerta) => offerta.slug),
}))

import { violazioniAccessibilita } from '@/test/accessibilita'
import { contenutiPagine } from '@/contenuti/pagine'
import { descriviScadenza, formattaData } from '@/lib/date'
import PaginaOfferta, { generateStaticParams } from './page'

/** La stessa espressione usata dal mock qui sopra: è il dato atteso dai test. */
const valide = offerteFinte.filter((o) => o.validaAl === undefined || o.validaAl >= '2026-09-15')
const permanente = valide.find((o) => o.validaAl === undefined)!
const conRichiesta = valide.find((o) => o.modalita !== 'solo_sconto')!
const soloSconto = valide.find((o) => o.modalita === 'solo_sconto')!
const terminata = offerteFinte.find(
  (o) => !valide.some((v) => v.slug === o.slug),
)!

describe('Pagina di una singola offerta', () => {
  test('genera una pagina statica per ogni offerta', async () => {
    const generati = await generateStaticParams()
    expect(generati.map((p) => p.slug).sort()).toEqual(
      offerteFinte.map((o) => o.slug).sort(),
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
      // La stessa frase della scheda da cui il socio è arrivato: la pagina
      // non ha un modo suo di dire quanto manca.
      screen.getByText(descriviScadenza(conRichiesta.validaAl).testo),
    ).toBeInTheDocument()
    for (const condizione of conRichiesta.condizioni) {
      expect(screen.getByText(condizione)).toBeInTheDocument()
    }
  })

  test("un'offerta da richiedere mostra il modulo, già collegato a lei", async () => {
    // Il percorso migliore: il socio arriva dal link ricevuto per email e non
    // deve scegliere niente, perché l'offerta è già scelta.
    render(await PaginaOfferta({ params: Promise.resolve({ slug: conRichiesta.slug }) }))

    expect(screen.getByRole('button', { name: /Richiedi i posti|Invia la richiesta/ })).toBeInTheDocument()
    expect(screen.getByLabelText('Matricola')).toBeInTheDocument()
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
      screen.getByText(new RegExp(formattaData(terminata.validaAl!))),
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

  test("un'offerta senza data di fine lo dice, senza formattare una data assente", async () => {
    render(
      await PaginaOfferta({ params: Promise.resolve({ slug: permanente.slug }) }),
    )
    expect(screen.getByText('Senza scadenza')).toBeInTheDocument()
    expect(screen.queryByText(/Era valida fino al/)).not.toBeInTheDocument()
  })

  describe('i recapiti del partner, per le offerte che si ottengono da soli', () => {
    // Lo spec li prevede per `solo_sconto` (sezione 7): il socio va dal
    // partner senza passare dai direttori, quindi deve sapere dove, a che
    // numero e con quale codice. Fino al 25 settembre 2026 il modulo li
    // salvava e nessuna pagina li mostrava.
    const conRecapiti = valide.find((o) => o.slug === 'farmacia-vesuvio-parafarmaco')!

    test('mostra codice sconto, indirizzo, telefono e sito', async () => {
      render(await PaginaOfferta({ params: Promise.resolve({ slug: conRecapiti.slug }) }))

      expect(screen.getByText('CRAL15')).toBeInTheDocument()
      expect(screen.getByText('Via Toledo 12, Napoli')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: '081 555 1234' })).toHaveAttribute(
        'href',
        'tel:0815551234',
      )
      const sito = screen.getByRole('link', { name: /farmaciavesuvio\.test/ })
      expect(sito).toHaveAttribute('href', 'https://www.farmaciavesuvio.test')
      expect(sito).toHaveAttribute('rel', expect.stringContaining('noopener'))
    })

    test('senza recapiti non disegna un riquadro vuoto', async () => {
      const senza = valide.find(
        (o) => o.modalita === 'solo_sconto' && Object.keys(o.contatti).length === 0,
      )!
      render(await PaginaOfferta({ params: Promise.resolve({ slug: senza.slug }) }))

      expect(screen.queryByText('Telefono')).not.toBeInTheDocument()
      expect(screen.queryByText('Codice sconto')).not.toBeInTheDocument()
    })

    test('un sito che non comincia per http non diventa un link', async () => {
      // Lo scrive un direttore a mano: «www.partner.it» senza protocollo
      // porterebbe a una pagina del nostro sito, e tutto il resto non è un
      // indirizzo web.
      const { offertaDaSlug } = await import('@/dati/offerte')
      vi.mocked(offertaDaSlug).mockResolvedValueOnce({
        ...conRecapiti,
        contatti: { sito: 'www.farmaciavesuvio.test' },
      })
      render(await PaginaOfferta({ params: Promise.resolve({ slug: conRecapiti.slug }) }))

      expect(screen.getByText('www.farmaciavesuvio.test')).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /farmaciavesuvio/ })).not.toBeInTheDocument()
    })
  })
})
