import { describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ModuloOfferta } from './ModuloOfferta'
import { violazioniAccessibilita } from '@/test/accessibilita'

vi.mock('@/app/azioni/offerte', () => ({
  salvaOfferta: vi.fn(async () => ({})),
}))

import { salvaOfferta } from '@/app/azioni/offerte'

describe('ModuloOfferta', () => {
  test('si renderizza a campi vuoti senza rompersi', () => {
    render(<ModuloOfferta />)

    expect(screen.getByLabelText('Partner')).toHaveValue('')
    expect(screen.getByLabelText('Categoria')).toHaveValue('Cinema')
  })

  test('l’anteprima mostra i segnaposto, non dati inventati', () => {
    render(<ModuloOfferta />)

    expect(screen.getByText('Nome del partner')).toBeInTheDocument()
    expect(screen.getByText('Il vantaggio')).toBeInTheDocument()
    expect(screen.getByText('La riga di presentazione.')).toBeInTheDocument()
    // Prima che il direttore scriva una data, l'anteprima non ne inventa
    // una: mostra il segnaposto, non una scadenza formattata come se fosse
    // già stata decisa.
    expect(screen.getByText('Scadenza da indicare')).toBeInTheDocument()
  })

  test('l’anteprima non è cliccabile: lo slug è un segnaposto, non punta a una scheda vera', () => {
    render(<ModuloOfferta />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  test('i campi obbligatori hanno l’attributo required, quelli facoltativi lo dicono nell’etichetta', () => {
    render(<ModuloOfferta />)

    expect(screen.getByLabelText('Partner')).toBeRequired()
    expect(screen.getByLabelText(/^Indirizzo/)).not.toBeRequired()
    expect(screen.getByText(/Indirizzo/).closest('label')).toHaveTextContent('(facoltativo)')
  })

  test('non ha problemi di accessibilità a modulo vuoto', async () => {
    const { container } = render(<ModuloOfferta />)

    expect(await violazioniAccessibilita(container)).toEqual([])
  })

  test('con «in evidenza» selezionato l’anteprima passa a piena larghezza, senza problemi di accessibilità', async () => {
    const { container } = render(<ModuloOfferta />)

    fireEvent.click(screen.getByLabelText(/in evidenza/i))

    expect(screen.getByText('Come apparirà in evidenza sulla home')).toBeInTheDocument()
    expect(await violazioniAccessibilita(container)).toEqual([])
  })

  test('un errore restituito dal server sparisce non appena il campo viene corretto, e non resta annunciato come invalido', async () => {
    // Non è il campo «partner» dell'esempio della revisione: con `required`
    // (aggiunto per l'I8) il click su «Pubblica» a partner vuoto non arriva
    // nemmeno al modulo, perché il browser blocca l'invio da solo — verificato
    // con una prova a parte (`form.checkValidity()` è `false`, la Server
    // Action mockata non viene mai chiamata). Il gesto vero che *raggiunge*
    // il server è un altro: un modulo compilato per intero ma con la
    // scadenza prima dell'inizio, una regola fra due campi che nessun
    // attributo HTML nativo può controllare da solo — è la stessa regola di
    // `schemaOfferta` (`validaAl >= validaDal`).
    vi.mocked(salvaOfferta).mockResolvedValueOnce({
      errori: { validaAl: 'La data di fine deve venire dopo la data di inizio.' },
    })

    render(<ModuloOfferta />)

    fireEvent.change(screen.getByLabelText('Partner'), { target: { value: 'Teatro Diana' } })
    fireEvent.change(screen.getByLabelText('Vantaggio'), {
      target: { value: 'Poltronissima a 18 € invece di 32 €' },
    })
    fireEvent.change(screen.getByLabelText('Presentazione breve'), {
      target: { value: 'Riduzione riservata ai soci.' },
    })
    fireEvent.change(screen.getByLabelText('Descrizione completa'), {
      target: { value: 'La riduzione vale su tutta la stagione.' },
    })
    fireEvent.change(screen.getByLabelText('Valida dal'), { target: { value: '2026-10-01' } })
    fireEvent.change(screen.getByLabelText('Valida fino al'), { target: { value: '2026-09-30' } })

    const campoValidaAl = screen.getByLabelText('Valida fino al')
    const form = campoValidaAl.closest('form')!
    // A conferma che questo, e non il partner vuoto, è il caso che arriva
    // davvero al server: con tutti gli obbligatori compilati il browser non
    // ha nulla da obiettare.
    expect(form.checkValidity()).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: 'Pubblica' }))

    expect(
      await screen.findByText('La data di fine deve venire dopo la data di inizio.'),
    ).toBeInTheDocument()
    expect(campoValidaAl).toHaveAttribute('aria-invalid', 'true')

    fireEvent.change(campoValidaAl, { target: { value: '2027-05-31' } })

    expect(
      screen.queryByText('La data di fine deve venire dopo la data di inizio.'),
    ).not.toBeInTheDocument()
    expect(campoValidaAl).not.toHaveAttribute('aria-invalid')
  })
})
