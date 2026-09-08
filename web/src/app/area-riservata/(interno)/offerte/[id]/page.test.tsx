import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { offerteFinte } from '@/test/offerteFinte'
import { violazioniAccessibilita } from '@/test/accessibilita'

// Stesso schema di offerteRestituite in area-riservata/(interno)/page.test.tsx:
// `vi.mock` è issato in cima al modulo, quindi legge un oggetto mutabile
// issato insieme a lui invece di una `let` di modulo.
const { offertaRestituita } = vi.hoisted(() => ({
  offertaRestituita: { valore: undefined as unknown },
}))

vi.mock('@/dati/offerteRiservate', () => ({
  offertaPerId: async () => offertaRestituita.valore,
}))

// ModuloOfferta importa da qui, quindi mockare questo modulo basta anche per
// il modulo di modifica: niente chiamata vera a Supabase durante il render.
vi.mock('@/app/azioni/offerte', () => ({
  salvaOfferta: vi.fn(async () => ({})),
  aggiornaOfferta: vi.fn(async () => ({})),
  eliminaOfferta: vi.fn(async () => {}),
}))

const ModificaOfferta = (await import('./page')).default

const offertaBozza = { ...offerteFinte[2], id: 'off-1', stato: 'bozza' as const }
const offertaPubblicata = { ...offerteFinte[2], id: 'off-2', stato: 'pubblicata' as const }

function rendiPagina(id: string, salvata?: string) {
  return ModificaOfferta({
    params: Promise.resolve({ id }),
    searchParams: Promise.resolve(salvata ? { salvata } : {}),
  })
}

describe('Pagina di modifica offerta', () => {
  test('un id inesistente non produce una pagina', async () => {
    offertaRestituita.valore = undefined

    await expect(rendiPagina('non-esiste')).rejects.toThrow()
  })

  test('precompila il modulo con i dati dell’offerta', async () => {
    offertaRestituita.valore = offertaBozza

    render(await rendiPagina('off-1'))

    expect(screen.getByLabelText('Partner')).toHaveValue(offertaBozza.partner)
    expect(screen.getByLabelText('Vantaggio')).toHaveValue(offertaBozza.vantaggio)
  })

  test('senza il parametro «salvata» non mostra alcun avviso', async () => {
    offertaRestituita.valore = offertaBozza

    render(await rendiPagina('off-1'))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  test('dopo il salvataggio in bozza dice che non è ancora visibile ai soci', async () => {
    offertaRestituita.valore = offertaBozza

    render(await rendiPagina('off-1', '1'))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Salvata in bozza. Non è ancora visibile ai soci.',
    )
  })

  test('dopo la pubblicazione dice che è già visibile sul sito', async () => {
    offertaRestituita.valore = offertaPubblicata

    // Da qui in poi la pagina di un'offerta pubblicata mostra anche il
    // blocco del Task 8, che ha un secondo `role="status"` (l'esito della
    // copia): getByText resta univoco dove getByRole('status') non lo è più.
    render(await rendiPagina('off-2', '1'))

    expect(screen.getByText('Salvata. È già visibile sul sito.')).toBeInTheDocument()
  })

  test('il pulsante «Pubblica» cambia parola perché l’offerta è già online', async () => {
    offertaRestituita.valore = offertaPubblicata

    render(await rendiPagina('off-2'))

    expect(screen.getByRole('button', { name: 'Salva e ripubblica' })).toBeInTheDocument()
  })

  test('il testo per l’email compare solo quando l’offerta è pubblicata', async () => {
    // Una bozza non è ancora online: un testo d'annuncio da mandare ai soci
    // non avrebbe senso finché non lo è.
    offertaRestituita.valore = offertaBozza

    render(await rendiPagina('off-1'))

    expect(screen.queryByRole('button', { name: 'Copia il testo' })).not.toBeInTheDocument()
  })

  test('il testo per l’email compare quando l’offerta è pubblicata, con il link alla scheda', async () => {
    offertaRestituita.valore = offertaPubblicata

    render(await rendiPagina('off-2'))

    expect(screen.getByRole('button', { name: 'Copia il testo' })).toBeInTheDocument()
    const area = screen.getByLabelText('Testo dell’avviso da copiare') as HTMLTextAreaElement
    expect(area.value).toContain(`/offerte/${offertaPubblicata.slug}`)
  })

  test('la conferma di eliminazione è dietro un pannello chiuso, non un confirm() del browser', async () => {
    offertaRestituita.valore = offertaBozza

    render(await rendiPagina('off-1'))

    const dettagli = screen.getByText('Elimina questa offerta').closest('details')
    expect(dettagli).not.toBeNull()
    expect(dettagli).not.toHaveAttribute('open')
  })

  test('il pannello di eliminazione nomina l’offerta prima di lasciar premere', async () => {
    offertaRestituita.valore = offertaBozza

    render(await rendiPagina('off-1'))

    const dettagli = screen.getByText('Elimina questa offerta').closest('details')!
    expect(dettagli).toHaveTextContent(offertaBozza.partner)
    expect(dettagli).toHaveTextContent(offertaBozza.vantaggio)
    expect(dettagli).toHaveTextContent('Salva bozza')
  })

  test('il pulsante di eliminazione invia l’id dell’offerta giusta', async () => {
    offertaRestituita.valore = offertaBozza

    render(await rendiPagina('off-1'))

    const pulsanteElimina = screen.getByRole('button', { name: 'Elimina definitivamente' })
    const modulo = pulsanteElimina.closest('form')
    expect(modulo?.querySelector('input[name="id"]')).toHaveValue(offertaBozza.id)
  })

  test('non presenta violazioni di accessibilità', async () => {
    offertaRestituita.valore = offertaBozza

    const { container } = render(await rendiPagina('off-1'))

    expect(await violazioniAccessibilita(container)).toEqual([])
  })

  test('non presenta violazioni di accessibilità con l’avviso di salvataggio visibile', async () => {
    offertaRestituita.valore = offertaPubblicata

    const { container } = render(await rendiPagina('off-2', '1'))

    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
