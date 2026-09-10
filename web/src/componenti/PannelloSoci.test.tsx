import { describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('@/app/azioni/soci', () => ({
  aggiungiSocio: vi.fn(),
  rimuoviSocio: vi.fn(),
}))

import { PannelloSoci } from './PannelloSoci'
import { violazioniAccessibilita } from '@/test/accessibilita'
import type { Socio } from '@/dominio/socio'

const soci: Socio[] = [
  {
    id: '1',
    nome: 'Mario',
    cognome: 'Rossi',
    email: 'mario.rossi@agenziaentrate.it',
    codiceDipendente: 'AE12345',
  },
  {
    id: '2',
    nome: 'Anna',
    cognome: 'Bianchi',
    email: 'anna.bianchi@agenziaentrate.it',
    codiceDipendente: 'AE67890',
  },
]

const cerca = () => screen.getByLabelText('Cerca per nome, email o matricola')

describe('PannelloSoci', () => {
  test('conta i soci in elenco', () => {
    render(<PannelloSoci soci={soci} />)
    expect(screen.getByRole('heading', { name: '2 soci' })).toBeInTheDocument()
  })

  test('con un socio solo il conteggio non dice «1 soci»', () => {
    render(<PannelloSoci soci={[soci[0]]} />)
    expect(screen.getByRole('heading', { name: 'Un socio' })).toBeInTheDocument()
  })

  test('la ricerca filtra mentre si scrive, sul cognome', () => {
    render(<PannelloSoci soci={soci} />)
    fireEvent.change(cerca(), { target: { value: 'bianchi' } })

    expect(screen.getByText(/Bianchi Anna/)).toBeInTheDocument()
    expect(screen.queryByText(/Rossi Mario/)).not.toBeInTheDocument()
  })

  test('la ricerca guarda anche email e matricola, e non distingue le maiuscole', () => {
    // Un direttore cerca con quello che ha sottomano: a volte è il numero
    // scritto su un cedolino, a volte l'indirizzo da cui ha ricevuto un'email.
    render(<PannelloSoci soci={soci} />)

    fireEvent.change(cerca(), { target: { value: 'AE678' } })
    expect(screen.getByText(/Bianchi Anna/)).toBeInTheDocument()

    fireEvent.change(cerca(), { target: { value: 'MARIO.ROSSI@' } })
    expect(screen.getByText(/Rossi Mario/)).toBeInTheDocument()
  })

  test('quando la ricerca non trova nulla lo dice, senza lasciare la pagina vuota', () => {
    render(<PannelloSoci soci={soci} />)
    fireEvent.change(cerca(), { target: { value: 'verdi' } })

    expect(screen.getByText('Nessun socio corrisponde a quello che hai scritto.')).toBeInTheDocument()
  })

  test('l’elenco vuoto spiega chi fa il primo caricamento', () => {
    // Distinguere «non c'è nessuno» da «la ricerca non trova» evita che un
    // direttore creda di aver rotto qualcosa il primo giorno.
    render(<PannelloSoci soci={[]} />)
    expect(screen.getByText(/Il primo caricamento lo fa chi si occupa del sito/)).toBeInTheDocument()
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<PannelloSoci soci={soci} />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
