import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/app/azioni/richieste', () => ({ inviaRichiestaConvenzione: vi.fn() }))

import { ModuloConvenzione } from './ModuloConvenzione'
import { violazioniAccessibilita } from '@/test/accessibilita'

describe('ModuloConvenzione', () => {
  test('chiede una convenzione con parole libere, e suggerisce come scriverla', () => {
    render(<ModuloConvenzione />)

    expect(screen.getByLabelText('Di quale convenzione hai bisogno?')).toBeInTheDocument()
    expect(screen.getByText(/gommista/)).toBeInTheDocument()
  })

  test('il «cosa ti serve» è obbligatorio, perché è la richiesta', () => {
    // Senza, al direttore arriverebbe una parola sola — «palestra» — e
    // dovrebbe richiamare per sapere cosa serve davvero.
    render(<ModuloConvenzione />)
    expect(screen.getByLabelText('Cosa ti serve, in due righe')).toBeRequired()
  })

  test('non chiede come pagare: qui non c’è ancora niente da pagare', () => {
    render(<ModuloConvenzione />)
    expect(screen.queryByText(/Bonifico/)).not.toBeInTheDocument()
    expect(screen.queryByText(/busta paga/)).not.toBeInTheDocument()
  })

  test('porta con sé il blocco dei dati del socio, uguale agli altri moduli', () => {
    render(<ModuloConvenzione />)
    expect(screen.getByLabelText('Matricola')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Su WhatsApp' })).toBeInTheDocument()
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<ModuloConvenzione />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
