import { describe, expect, test } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { DatiSocio } from './DatiSocio'
import { violazioniAccessibilita } from '@/test/accessibilita'

const senzaErrori = {}

describe('DatiSocio', () => {
  test('chiede identità e consenso, e parte dalla consegna più semplice', () => {
    render(<DatiSocio errori={senzaErrori} />)

    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByLabelText('Cognome')).toBeInTheDocument()
    expect(screen.getByLabelText('Matricola')).toBeInTheDocument()
    expect(screen.getByLabelText('Email aziendale')).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Sull’email aziendale' })).toBeChecked()
  })

  test('il campo dell’altra email compare solo se la scegli', () => {
    // Chiedere tutti e tre i recapiti insieme allungherebbe il modulo con due
    // domande che non servono a chi ha già deciso.
    render(<DatiSocio errori={senzaErrori} />)
    expect(screen.queryByLabelText('L’altra email')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('radio', { name: 'Su un’altra email' }))
    expect(screen.getByLabelText('L’altra email')).toBeInTheDocument()
  })

  test('il numero compare solo scegliendo WhatsApp, e dice chi scriverà', () => {
    render(<DatiSocio errori={senzaErrori} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Su WhatsApp' }))

    expect(screen.getByLabelText('Numero WhatsApp')).toBeInTheDocument()
    expect(screen.getByText(/non un sistema automatico/)).toBeInTheDocument()
  })

  test('cambiando idea, il campo di prima sparisce', () => {
    render(<DatiSocio errori={senzaErrori} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Su WhatsApp' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Sull’email aziendale' }))

    expect(screen.queryByLabelText('Numero WhatsApp')).not.toBeInTheDocument()
  })

  test('l’email aziendale spiega a cosa serve, perché il riscontro dipende da lei', () => {
    render(<DatiSocio errori={senzaErrori} />)
    expect(screen.getByText(/comunicato al CRAL/)).toBeInTheDocument()
  })

  test('l’errore sta sotto il campo che lo riguarda, e il campo lo dichiara', () => {
    render(<DatiSocio errori={{ email: 'Scrivi la tua email aziendale.' }} />)

    const campo = screen.getByLabelText('Email aziendale')
    expect(campo).toHaveAttribute('aria-invalid', 'true')
    expect(campo).toHaveAccessibleDescription(/Scrivi la tua email aziendale/)
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<DatiSocio errori={{ consensoPrivacy: 'Serve la tua conferma.' }} />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
