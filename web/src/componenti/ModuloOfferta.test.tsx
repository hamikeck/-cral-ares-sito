import { describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { ModuloOfferta } from './ModuloOfferta'
import { violazioniAccessibilita } from '@/test/accessibilita'

vi.mock('@/app/azioni/offerte', () => ({
  salvaOfferta: vi.fn(async () => ({})),
}))

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
})
