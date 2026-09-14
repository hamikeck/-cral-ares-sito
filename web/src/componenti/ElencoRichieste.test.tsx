import { describe, expect, test } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ElencoRichieste } from './ElencoRichieste'
import { violazioniAccessibilita } from '@/test/accessibilita'
import type { Richiesta } from '@/dominio/richiesta'

const base: Richiesta = {
  id: 'r1',
  numero: 42,
  tipo: 'cinema',
  creataIl: '2026-09-14T10:00:00Z',
  nome: 'Mario',
  cognome: 'Rossi',
  codiceDipendente: 'AE12345',
  email: 'mario.rossi@agenziaentrate.it',
  quantita: 4,
  circuito: 'UCI Cinemas',
  avvisoInviato: true,
}

const anna: Richiesta = {
  ...base,
  id: 'r2',
  numero: 43,
  tipo: 'convenzione',
  nome: 'Anna',
  cognome: 'Bianchi',
  codiceDipendente: 'AE67890',
  email: 'anna.bianchi@agenziaentrate.it',
  quantita: undefined,
  circuito: undefined,
  convenzione: 'Gommista',
  avvisoInviato: false,
}

describe('ElencoRichieste', () => {
  test('senza richieste spiega cosa succederà, invece di lasciare il vuoto', () => {
    render(<ElencoRichieste richieste={[]} />)
    expect(screen.getByText(/Non è ancora arrivata nessuna richiesta/)).toBeInTheDocument()
  })

  test('mostra numero, persona e cosa chiede', () => {
    render(<ElencoRichieste richieste={[base]} />)

    expect(screen.getByText('#42')).toBeInTheDocument()
    expect(screen.getByText('Rossi Mario')).toBeInTheDocument()
    expect(screen.getByText('4 biglietti UCI Cinemas')).toBeInTheDocument()
  })

  test('avverte quando ci sono richieste che nessuno ha ricevuto per email', () => {
    // È la riga più importante della pagina finché l'invio non è configurato:
    // una richiesta arrivata e non annunciata sarebbe invisibile a tutti.
    render(<ElencoRichieste richieste={[base, anna]} />)

    expect(screen.getByRole('status')).toHaveTextContent(
      /Una richiesta non è stata annunciata per email/,
    )
    expect(screen.getByText('Avviso non inviato')).toBeInTheDocument()
  })

  test('senza avvisi mancati non allarma nessuno', () => {
    render(<ElencoRichieste richieste={[base]} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  test('si possono isolare quelle non annunciate', () => {
    render(<ElencoRichieste richieste={[base, anna]} />)
    fireEvent.click(screen.getByLabelText('Solo quelle non annunciate'))

    expect(screen.getByText('Bianchi Anna')).toBeInTheDocument()
    expect(screen.queryByText('Rossi Mario')).not.toBeInTheDocument()
  })

  test('la ricerca filtra su nome, matricola e numero', () => {
    render(<ElencoRichieste richieste={[base, anna]} />)
    const cerca = screen.getByLabelText('Cerca per nome, matricola o numero')

    fireEvent.change(cerca, { target: { value: 'AE678' } })
    expect(screen.getByText('Bianchi Anna')).toBeInTheDocument()
    expect(screen.queryByText('Rossi Mario')).not.toBeInTheDocument()

    fireEvent.change(cerca, { target: { value: '42' } })
    expect(screen.getByText('Rossi Mario')).toBeInTheDocument()
  })

  test('il collegamento per rispondere apre già l’email al socio', () => {
    // È il primo lavoro del direttore, e l'unico modo in cui una richiesta si
    // chiude: la risposta è a mano.
    render(<ElencoRichieste richieste={[base]} />)

    const rispondi = screen.getByRole('link', { name: 'Rispondi a Mario' })
    expect(rispondi.getAttribute('href')).toContain('mailto:mario.rossi@agenziaentrate.it')
    expect(rispondi.getAttribute('href')).toContain('%2342')
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<ElencoRichieste richieste={[base, anna]} />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
