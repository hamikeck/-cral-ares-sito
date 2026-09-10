import { describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { ModuloOfferta } from './ModuloOfferta'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { offerteFinte } from '@/test/offerteFinte'

vi.mock('@/app/azioni/offerte', () => ({
  salvaOfferta: vi.fn(async () => ({})),
  aggiornaOfferta: vi.fn(async () => ({})),
}))

import { aggiornaOfferta, salvaOfferta } from '@/app/azioni/offerte'

/** Un'offerta esistente, come la restituirebbe `offertaPerId`. */
const offertaEsistente = {
  ...offerteFinte[0],
  id: 'off-1',
  stato: 'bozza' as const,
}

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

  test('«Senza scadenza» svuota e disabilita il campo data, e lo riflette nell’anteprima', () => {
    render(<ModuloOfferta />)

    const campoValidaAl = screen.getByLabelText('Valida fino al')
    fireEvent.change(campoValidaAl, { target: { value: '2027-05-31' } })

    fireEvent.click(screen.getByLabelText('Senza scadenza'))

    expect(campoValidaAl).toBeDisabled()
    expect(campoValidaAl).toHaveValue('')

    // Dentro l'anteprima, non nella pagina: «Senza scadenza» è anche
    // l'etichetta della casella che si è appena spuntata, quindi cercarlo
    // ovunque troverebbe due elementi e non direbbe nulla sull'anteprima.
    const anteprima = within(screen.getByLabelText('Anteprima'))
    expect(anteprima.getByText('Senza scadenza')).toBeInTheDocument()
  })

  test('togliendo la spunta a «Senza scadenza» il campo data torna compilabile', () => {
    render(<ModuloOfferta />)

    const casella = screen.getByLabelText('Senza scadenza')
    fireEvent.click(casella)
    fireEvent.click(casella)

    expect(screen.getByLabelText('Valida fino al')).not.toBeDisabled()
  })

  test('con «Senza scadenza» selezionato non ha problemi di accessibilità', async () => {
    const { container } = render(<ModuloOfferta />)

    fireEvent.click(screen.getByLabelText('Senza scadenza'))

    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})

describe('ModuloOfferta con un’offerta esistente', () => {
  test('precompila i campi con i dati dell’offerta', () => {
    render(<ModuloOfferta offerta={offertaEsistente} />)

    expect(screen.getByLabelText('Partner')).toHaveValue(offertaEsistente.partner)
    expect(screen.getByLabelText('Vantaggio')).toHaveValue(offertaEsistente.vantaggio)
    expect(screen.getByLabelText('Categoria')).toHaveValue(offertaEsistente.categoria)
  })

  test('porta l’id dell’offerta in un campo nascosto', () => {
    const { container } = render(<ModuloOfferta offerta={offertaEsistente} />)

    expect(container.querySelector('input[name="id"][type="hidden"]')).toHaveValue(
      offertaEsistente.id,
    )
  })

  test('senza offerta non c’è alcun campo id nascosto', () => {
    const { container } = render(<ModuloOfferta />)

    expect(container.querySelector('input[name="id"]')).not.toBeInTheDocument()
  })

  test('invia le modifiche con aggiornaOfferta, non con salvaOfferta', async () => {
    render(<ModuloOfferta offerta={offertaEsistente} />)

    fireEvent.click(screen.getByRole('button', { name: 'Pubblica' }))

    await waitFor(() => expect(aggiornaOfferta).toHaveBeenCalled())
    expect(salvaOfferta).not.toHaveBeenCalled()
  })

  test('un’offerta già pubblicata non lascia credere che si stia pubblicando di nuovo da zero', () => {
    render(<ModuloOfferta offerta={{ ...offertaEsistente, stato: 'pubblicata' }} />)

    expect(screen.getByRole('button', { name: 'Salva e ripubblica' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Pubblica' })).not.toBeInTheDocument()
  })

  test('una bozza mostra ancora «Pubblica»', () => {
    render(<ModuloOfferta offerta={offertaEsistente} />)

    expect(screen.getByRole('button', { name: 'Pubblica' })).toBeInTheDocument()
  })

  test('non ha problemi di accessibilità con un’offerta esistente', async () => {
    const { container } = render(<ModuloOfferta offerta={offertaEsistente} />)

    expect(await violazioniAccessibilita(container)).toEqual([])
  })

  test('un’offerta senza data di fine riapre il modulo con «Senza scadenza» già spuntata', () => {
    render(<ModuloOfferta offerta={{ ...offertaEsistente, validaAl: undefined }} />)

    expect(screen.getByLabelText('Senza scadenza')).toBeChecked()
    expect(screen.getByLabelText(/^Valida fino al/)).toBeDisabled()
  })
})
