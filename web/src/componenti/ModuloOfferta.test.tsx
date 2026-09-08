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

  test('un campo obbligatorio lasciato vuoto: il nostro messaggio compare, e sparisce scrivendo', async () => {
    // Lo scenario originale della revisione, ora davvero raggiungibile: il
    // form ha `noValidate`, quindi il click su «Pubblica» non viene più
    // intercettato dalla validazione nativa del browser (con `required` e
    // basta, come nel giro precedente, questo invio non arrivava nemmeno
    // alla Server Action — verificato allora con una prova a parte). Un solo
    // sistema di errore, sempre nelle nostre parole.
    vi.mocked(salvaOfferta).mockResolvedValueOnce({
      errori: { partner: 'Scrivi il nome del partner.' },
    })

    render(<ModuloOfferta />)

    const campoPartner = screen.getByLabelText('Partner')
    fireEvent.click(screen.getByRole('button', { name: 'Pubblica' }))

    expect(await screen.findByText('Scrivi il nome del partner.')).toBeInTheDocument()
    expect(campoPartner).toHaveAttribute('aria-invalid', 'true')

    fireEvent.change(campoPartner, { target: { value: 'Teatro Diana' } })

    expect(screen.queryByText('Scrivi il nome del partner.')).not.toBeInTheDocument()
    expect(campoPartner).not.toHaveAttribute('aria-invalid')
  })

  test('una regola fra due campi (date incrociate): stesso comportamento, dove nessun `required` potrebbe arrivare', async () => {
    // Anche con `noValidate` resta utile un caso che nessun attributo HTML,
    // da solo, potrebbe mai esprimere: «la fine dopo l'inizio» è una regola
    // fra due campi, verificata solo da `schemaOfferta.refine()`. Copre la
    // stessa proprietà del test sopra su una via diversa.
    vi.mocked(salvaOfferta).mockResolvedValueOnce({
      errori: { validaAl: 'La data di fine deve venire dopo la data di inizio.' },
    })

    render(<ModuloOfferta />)

    fireEvent.change(screen.getByLabelText('Valida dal'), { target: { value: '2026-10-01' } })
    fireEvent.change(screen.getByLabelText('Valida fino al'), { target: { value: '2026-09-30' } })

    const campoValidaAl = screen.getByLabelText('Valida fino al')
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
