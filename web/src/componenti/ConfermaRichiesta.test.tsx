import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { ConfermaRichiesta } from './ConfermaRichiesta'

describe('ConfermaRichiesta', () => {
  test('a chi paga con bonifico mostra IBAN, importo e causale', () => {
    render(
      <ConfermaRichiesta
        esito={{ pagamentoBonifico: true, importo: 26, causale: 'CRAL ARES biglietti UCI Rossi AE1' }}
      />,
    )

    expect(screen.getByText('IT32Y0538703410000004305459')).toBeInTheDocument()
    expect(screen.getByText('CRAL ARES biglietti UCI Rossi AE1')).toBeInTheDocument()
    expect(screen.queryByText(/aspetta quella/)).not.toBeInTheDocument()
  })

  test('senza importo, dice di aspettarlo prima di versare', () => {
    render(
      <ConfermaRichiesta
        esito={{ pagamentoBonifico: true, causale: 'CRAL ARES Teatro Diana Rossi AE1' }}
      />,
    )

    expect(screen.getByText('IT32Y0538703410000004305459')).toBeInTheDocument()
    expect(screen.getByText(/aspetta quella prima di fare il bonifico/)).toBeInTheDocument()
  })

  test('a chi paga in busta paga non mostra l’IBAN', () => {
    render(<ConfermaRichiesta esito={{ pagamentoBonifico: false, causale: '' }} />)

    expect(screen.queryByText(/IT32Y/)).not.toBeInTheDocument()
    expect(screen.getByText(/trattenuto in busta paga/)).toBeInTheDocument()
  })
})
