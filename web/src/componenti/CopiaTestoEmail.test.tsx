import { afterEach, describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CopiaTestoEmail } from './CopiaTestoEmail'
import { violazioniAccessibilita } from '@/test/accessibilita'

const testo = 'UCI Cinemas — 6,50 € invece di 9,50\n\nTutti i dettagli: https://cralares.it/offerte/uci'

// `navigator.clipboard` non esiste in jsdom: ogni test la definisce da sé,
// così può simulare sia il successo sia il fallimento senza lasciare uno
// stato residuo al test successivo.
afterEach(() => {
  // @ts-expect-error -- ripristina jsdom al suo stato senza clipboard
  delete navigator.clipboard
})

describe('CopiaTestoEmail', () => {
  test('mostra il testo in un’area di sola lettura, con un’etichetta collegata', () => {
    render(<CopiaTestoEmail testo={testo} />)

    const area = screen.getByLabelText('Testo dell’avviso da copiare')
    expect(area).toHaveValue(testo)
    expect(area).toHaveAttribute('readonly')
  })

  test('al clic copia il testo negli appunti e lo annuncia', async () => {
    const scriviAppunti = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: scriviAppunti } })

    render(<CopiaTestoEmail testo={testo} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copia il testo' }))

    await waitFor(() => expect(scriviAppunti).toHaveBeenCalledWith(testo))
    expect(await screen.findByRole('status')).toHaveTextContent('Copiato.')
  })

  test('se gli appunti non sono disponibili, seleziona il testo e spiega come copiarlo a mano, senza alert', async () => {
    // Il caso di chi apre l'area riservata senza HTTPS, dove
    // `navigator.clipboard` non esiste: qui manca del tutto, non solo
    // fallisce, ed è il caso più probabile in pratica.
    const avviso = vi.spyOn(window, 'alert')

    render(<CopiaTestoEmail testo={testo} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copia il testo' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Testo selezionato: premi Cmd+C per copiarlo.',
    )
    expect(avviso).not.toHaveBeenCalled()

    const area = screen.getByLabelText('Testo dell’avviso da copiare') as HTMLTextAreaElement
    expect(area.selectionStart).toBe(0)
    expect(area.selectionEnd).toBe(testo.length)
  })

  test('anche quando la copia fallisce esplicitamente, niente alert', async () => {
    const scriviAppunti = vi.fn().mockRejectedValue(new Error('permesso negato'))
    Object.assign(navigator, { clipboard: { writeText: scriviAppunti } })
    const avviso = vi.spyOn(window, 'alert')

    render(<CopiaTestoEmail testo={testo} />)
    fireEvent.click(screen.getByRole('button', { name: 'Copia il testo' }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Testo selezionato: premi Cmd+C per copiarlo.',
    )
    expect(avviso).not.toHaveBeenCalled()
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<CopiaTestoEmail testo={testo} />)

    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
