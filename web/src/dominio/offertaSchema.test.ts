import { describe, expect, test } from 'vitest'
import { schemaOfferta } from './offertaSchema'

const valida = {
  partner: 'Teatro Diana',
  categoria: 'Teatro',
  vantaggio: 'Poltronissima a 18 € invece di 32 €',
  descrizione: 'Riduzione riservata ai soci sull’intera stagione di prosa.',
  descrizioneCompleta: 'La riduzione vale su tutti gli spettacoli della stagione di prosa.',
  condizioni: 'Massimo quattro posti a socio.\nRichiesta dieci giorni prima.',
  validaDal: '2026-10-01',
  validaAl: '2027-05-31',
  modalita: 'biglietti',
  istruzioni: '',
  indirizzo: '',
  telefono: '',
  sito: '',
  codiceSconto: '',
  inEvidenza: false,
}

describe('schemaOfferta', () => {
  test('accetta un’offerta completa', () => {
    expect(schemaOfferta.safeParse(valida).success).toBe(true)
  })

  test('spiega in italiano cosa manca', () => {
    const esito = schemaOfferta.safeParse({ ...valida, partner: '' })

    expect(esito.success).toBe(false)
    expect(esito.error?.issues[0].message).toBe('Scrivi il nome del partner.')
  })

  test('rifiuta una validità che finisce prima di cominciare', () => {
    const esito = schemaOfferta.safeParse({ ...valida, validaAl: '2026-09-30' })

    expect(esito.success).toBe(false)
    expect(esito.error?.issues[0].message).toMatch(/dopo la data di inizio/)
  })

  test('per «solo sconto» le istruzioni sono obbligatorie: senza, il socio non sa cosa fare', () => {
    const esito = schemaOfferta.safeParse({ ...valida, modalita: 'solo_sconto', istruzioni: '' })

    expect(esito.success).toBe(false)
    expect(esito.error?.issues[0].message).toMatch(/cosa deve fare il socio/)
  })

  test('per «biglietti» le istruzioni non servono', () => {
    expect(schemaOfferta.safeParse({ ...valida, modalita: 'biglietti', istruzioni: '' }).success).toBe(true)
  })

  test('la descrizione breve resta breve: è quella delle schede in elenco', () => {
    const esito = schemaOfferta.safeParse({ ...valida, descrizione: 'a'.repeat(161) })

    expect(esito.success).toBe(false)
    expect(esito.error?.issues[0].message).toMatch(/160 caratteri/)
  })

  test('trasforma le condizioni scritte a righe in un elenco', () => {
    const esito = schemaOfferta.parse(valida)

    expect(esito.condizioni).toEqual([
      'Massimo quattro posti a socio.',
      'Richiesta dieci giorni prima.',
    ])
  })
})
