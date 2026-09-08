import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Accedi from './page'
import { violazioniAccessibilita } from '@/test/accessibilita'

vi.mock('@/app/azioni/accesso', () => ({
  richiediAccesso: vi.fn(async () => ({ messaggio: 'ok' })),
}))

describe('pagina di accesso', () => {
  test('chiede l’email e non parla mai di password', async () => {
    render(await Accedi({ searchParams: Promise.resolve({}) }))

    expect(screen.getByLabelText(/indirizzo email/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument()
  })

  test('spiega il rifiuto a chi non è autorizzato', async () => {
    render(await Accedi({ searchParams: Promise.resolve({ nonAutorizzato: '1' }) }))

    expect(screen.getByRole('alert')).toHaveTextContent(/non è fra quelli autorizzati/i)
  })

  test('non ha problemi di accessibilità', async () => {
    const { container } = render(await Accedi({ searchParams: Promise.resolve({}) }))

    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
