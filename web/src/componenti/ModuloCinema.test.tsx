import { describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { inviaRichiestaCinema } from '@/app/azioni/richieste'

vi.mock('@/app/azioni/richieste', () => ({ inviaRichiestaCinema: vi.fn() }))

import { ModuloCinema } from './ModuloCinema'
import { violazioniAccessibilita } from '@/test/accessibilita'
import type { Circuito } from '@/dominio/circuito'

const circuiti: Circuito[] = [
  {
    id: '0f9d2b1e-5c3a-4a7b-9e21-8c4d6f2a1b03',
    nome: 'UCI Cinemas',
    prezzoSocio: 6.5,
    note: 'Voucher elettronico. Escluse offerte e promozioni.',
    sito: 'https://www.ucicinemas.it',
    sedi: [
      { id: 's1', nome: 'UCI Casoria', citta: 'Casoria', linkProgrammazione: 'https://esempio.test/casoria' },
      { id: 's2', nome: 'UCI Marcianise' },
    ],
  },
  { id: 'b2c4d6e8-1a3b-4c5d-8e9f-0a1b2c3d4e5f', nome: 'The Space Cinema', sedi: [] },
]

describe('ModuloCinema', () => {
  test('mostra l’importo e lo aggiorna mentre cambi la quantità', () => {
    // Il confronto è sulle cifre, non sulla stringa intera: fra il numero e
    // l'euro Intl mette uno spazio unificatore, che testing-library normalizza
    // in uno normale prima del confronto. Cercare la stringa esatta fallisce
    // con un messaggio d'errore in cui le due versioni sembrano identiche.
    render(<ModuloCinema circuiti={circuiti} />)
    expect(screen.getByText(/^13,00/)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Quanti biglietti'), { target: { value: '4' } })
    expect(screen.getByText(/^26,00/)).toBeInTheDocument()
  })

  test('senza listino non inventa una cifra, e lo dice', () => {
    // È il caso di oggi per i circuiti che il direttivo non ha ancora
    // quotato: il servizio resta richiedibile lo stesso.
    render(<ModuloCinema circuiti={circuiti} />)
    fireEvent.change(screen.getByLabelText('Circuito'), { target: { value: circuiti[1].id } })

    expect(screen.queryByText(/€/)).not.toBeInTheDocument()
    expect(screen.getByText(/lo comunicano i direttori/)).toBeInTheDocument()
  })

  test('la sala è facoltativa e parte da «non l’ho ancora deciso»', () => {
    render(<ModuloCinema circuiti={circuiti} />)
    expect(screen.getByLabelText(/Sala/)).toHaveValue('')
  })

  test('scegliendo una sala compare il link alla sua programmazione', () => {
    render(<ModuloCinema circuiti={circuiti} />)
    fireEvent.change(screen.getByLabelText(/Sala/), { target: { value: 's1' } })

    expect(screen.getByRole('link', { name: /programmazione di UCI Casoria/ })).toHaveAttribute(
      'href',
      'https://esempio.test/casoria',
    )
  })

  test('cambiando circuito la sala scelta prima si azzera', () => {
    // Lasciarla selezionata manderebbe al direttore la sala di un altro
    // circuito, ed è il genere di errore che nessuno rilegge.
    render(<ModuloCinema circuiti={circuiti} />)
    fireEvent.change(screen.getByLabelText(/Sala/), { target: { value: 's2' } })
    fireEvent.change(screen.getByLabelText('Circuito'), { target: { value: circuiti[1].id } })
    fireEvent.change(screen.getByLabelText('Circuito'), { target: { value: circuiti[0].id } })

    expect(screen.getByLabelText(/Sala/)).toHaveValue('')
  })

  test('un circuito senza sale non mostra il menu delle sale', () => {
    render(<ModuloCinema circuiti={circuiti} />)
    fireEvent.change(screen.getByLabelText('Circuito'), { target: { value: circuiti[1].id } })

    expect(screen.queryByLabelText(/Sala/)).not.toBeInTheDocument()
  })

  test('chiede come pagare, e le scelte sono due parole sole', () => {
    render(<ModuloCinema circuiti={circuiti} />)
    expect(screen.getByRole('radio', { name: /Bonifico/ })).toBeChecked()
    expect(screen.getByRole('radio', { name: /Busta paga/ })).toBeInTheDocument()
    // «Cedolino» era il terzo nome della stessa cosa.
    expect(screen.queryByText(/[Cc]edolino/)).not.toBeInTheDocument()
  })

  test('mostra le limitazioni del circuito scelto', () => {
    // È l'unica cosa del modulo che può far cambiare idea: un voucher che
    // non vale a Natale, o che va ritirato invece di arrivare per email.
    render(<ModuloCinema circuiti={circuiti} />)

    expect(
      screen.getByText('Voucher elettronico. Escluse offerte e promozioni.'),
    ).toBeInTheDocument()
  })

  test('le limitazioni sono legate alla scelta, per chi ascolta', () => {
    render(<ModuloCinema circuiti={circuiti} />)

    const menu = screen.getByLabelText('Circuito')
    const note = screen.getByText('Voucher elettronico. Escluse offerte e promozioni.')
    expect(menu).toHaveAttribute('aria-describedby', note.id)
  })

  test('cambiando circuito spariscono le limitazioni di quello di prima', () => {
    // The Space, nella finzione di questa prova, non ne ha: lasciare in
    // pagina quelle di UCI direbbe al socio una cosa falsa sul voucher che
    // sta per chiedere.
    render(<ModuloCinema circuiti={circuiti} />)
    fireEvent.change(screen.getByLabelText('Circuito'), { target: { value: circuiti[1].id } })

    expect(
      screen.queryByText('Voucher elettronico. Escluse offerte e promozioni.'),
    ).not.toBeInTheDocument()
    expect(screen.getByLabelText('Circuito')).not.toHaveAttribute('aria-describedby')
  })

  test('il sito del circuito è raggiungibile quando le sale non bastano', () => {
    render(<ModuloCinema circuiti={circuiti} />)

    expect(
      screen.getByRole('link', { name: 'Guarda le sale e la programmazione' }),
    ).toHaveAttribute('href', 'https://www.ucicinemas.it')
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<ModuloCinema circuiti={circuiti} />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })

  test('dopo un errore del server il modulo resta compilato', async () => {
    // React 19 svuota da sé un <form action={…}> alla fine di ogni azione,
    // anche quando l'azione risponde con un errore. Per un socio vuol dire
    // riscrivere nome, matricola ed email per un solo campo sbagliato —
    // oppure rinunciare, che è più probabile.
    vi.mocked(inviaRichiestaCinema).mockResolvedValue({
      errori: { modulo: 'Non risulti fra i soci del CRAL ARES.' },
    })
    render(<ModuloCinema circuiti={circuiti} />)

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Mario' } })
    fireEvent.change(screen.getByLabelText('Email aziendale'), {
      target: { value: 'mario.rossi@esempio.test' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Invia la richiesta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Non risulti fra i soci')
    expect(screen.getByLabelText('Nome')).toHaveValue('Mario')
    expect(screen.getByLabelText('Email aziendale')).toHaveValue('mario.rossi@esempio.test')
  })
})
