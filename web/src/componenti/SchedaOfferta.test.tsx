import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SchedaOfferta } from './SchedaOfferta'
import { violazioniAccessibilita } from '@/test/accessibilita'
import type { Offerta } from '@/dominio/offerta'

const offerta: Offerta = {
  slug: 'teatro-diana-poltronissima',
  partner: 'Teatro Diana',
  categoria: 'Teatro',
  vantaggio: 'Poltronissima a 18 € invece di 32 €',
  descrizione: 'Riduzione riservata ai soci sull’intera stagione di prosa.',
  descrizioneCompleta: 'La riduzione vale su tutti gli spettacoli della stagione di prosa.',
  condizioni: ['Massimo quattro posti a socio.'],
  validaDal: '2026-10-01',
  validaAl: '2027-05-31',
  modalita: 'biglietti',
  inEvidenza: false,
  contatti: {},
}

/** Una data ISO a N giorni da oggi: i test non invecchiano con il calendario. */
function fraGiorni(quanti: number): string {
  const d = new Date()
  d.setDate(d.getDate() + quanti)
  return d.toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' })
}

describe('SchedaOfferta', () => {
  test('oltre il mese mostra la data per esteso', () => {
    render(<SchedaOfferta offerta={{ ...offerta, validaAl: fraGiorni(90) }} />)

    expect(screen.getByText(/^Fino al /)).toBeInTheDocument()
  })

  test('sotto il mese conta i giorni che mancano', () => {
    // È la riga che si accende in ambra: l'urgenza si mostra solo quando è
    // vera, altrimenti sarebbe un allarme che suona per sei mesi.
    render(<SchedaOfferta offerta={{ ...offerta, validaAl: fraGiorni(5) }} />)

    expect(screen.getByText('Mancano 5 giorni')).toBeInTheDocument()
  })

  test('l’azione dice cosa si va a fare, secondo la modalità', () => {
    // Il collegamento porta sempre alla pagina dell'offerta, ma «Vedi
    // l'offerta» su dei biglietti butta via l'unica riga che convince.
    const { rerender } = render(<SchedaOfferta offerta={offerta} />)
    expect(screen.getByText('Richiedi i biglietti')).toBeInTheDocument()

    rerender(<SchedaOfferta offerta={{ ...offerta, modalita: 'convenzione' }} />)
    expect(screen.getByText('Richiedi informazioni')).toBeInTheDocument()

    rerender(<SchedaOfferta offerta={{ ...offerta, modalita: 'solo_sconto' }} />)
    expect(screen.getByText('Vedi l’offerta')).toBeInTheDocument()
  })

  test('l’azione non è un secondo collegamento verso lo stesso posto', () => {
    // Il pulsante è la parte visibile dell'unico collegamento della scheda,
    // quello sul nome del partner: due link identici costringerebbero chi usa
    // uno screen reader ad ascoltare la stessa destinazione due volte.
    render(<SchedaOfferta offerta={offerta} />)

    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  test('con la scadenza vuota non tenta di formattarla, e mostra un segnaposto riconoscibile', () => {
    // È il caso dell'anteprima del modulo, prima che il direttore scriva la
    // data: sul database la colonna è obbligatoria, ma qui deve restare
    // possibile passare una stringa vuota senza che il componente crolli.
    render(<SchedaOfferta offerta={{ ...offerta, validaAl: '' }} />)

    expect(screen.getByText('Scadenza da indicare')).toBeInTheDocument()
  })

  test('con la scadenza vuota, anche in evidenza', () => {
    render(<SchedaOfferta offerta={{ ...offerta, validaAl: '' }} inEvidenza />)

    expect(screen.getByText('Scadenza da indicare')).toBeInTheDocument()
  })

  test('senza data di fine lo dice, senza tentare di formattare una data assente', () => {
    // È il caso di una convenzione permanente: sul database `valida_al` è
    // nullo, e diventa `validaAl` assente nel dominio. `Intl.DateTimeFormat`
    // solleverebbe un errore se lo chiamassimo comunque.
    render(<SchedaOfferta offerta={{ ...offerta, validaAl: undefined }} />)

    expect(screen.getByText('Senza scadenza')).toBeInTheDocument()
  })

  test('senza data di fine, anche in evidenza', () => {
    render(<SchedaOfferta offerta={{ ...offerta, validaAl: undefined }} inEvidenza />)

    expect(screen.getByText('Senza scadenza')).toBeInTheDocument()
  })

  test('con il collegamento disabilitato il partner non è più un link', () => {
    render(<SchedaOfferta offerta={offerta} collegamentoDisabilitato />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText(offerta.partner)).toBeInTheDocument()
  })

  test('senza disabilitarlo il partner resta un collegamento verso la scheda', () => {
    render(<SchedaOfferta offerta={offerta} />)

    expect(screen.getByRole('link', { name: offerta.partner })).toHaveAttribute(
      'href',
      `/offerte/${offerta.slug}`,
    )
  })

  test('non ha problemi di accessibilità, né normale né in evidenza', async () => {
    const { container, rerender } = render(<SchedaOfferta offerta={offerta} />)
    expect(await violazioniAccessibilita(container)).toEqual([])

    rerender(<SchedaOfferta offerta={offerta} inEvidenza />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
