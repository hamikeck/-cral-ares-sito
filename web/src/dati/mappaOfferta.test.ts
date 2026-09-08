import { describe, expect, test } from 'vitest'
import { mappaOfferta } from './mappaOfferta'
import type { RigaOfferta } from './righe'

const riga: RigaOfferta = {
  slug: 'uci-cinemas-ingresso-ridotto',
  partner: 'UCI Cinemas',
  categoria: 'Cinema',
  vantaggio: '6,50 € invece di 9,50',
  descrizione_breve: 'Ingresso ridotto in tutte le sale del circuito.',
  descrizione: 'Il CRAL acquista biglietti a tariffa convenzionata.',
  condizioni: ['Fino a 6 biglietti al mese.'],
  valida_dal: '2026-09-01',
  valida_al: '2026-09-30',
  in_evidenza: true,
  modalita: 'biglietti',
  istruzioni: null,
  indirizzo: null,
  telefono: null,
  link_partner: null,
  codice_sconto: null,
  stato: 'pubblicata',
}

describe('mappaOfferta', () => {
  test('traduce i nomi delle colonne in quelli del sito', () => {
    const offerta = mappaOfferta(riga)

    expect(offerta.descrizione).toBe('Ingresso ridotto in tutte le sale del circuito.')
    expect(offerta.descrizioneCompleta).toBe('Il CRAL acquista biglietti a tariffa convenzionata.')
    expect(offerta.validaDal).toBe('2026-09-01')
    expect(offerta.validaAl).toBe('2026-09-30')
    expect(offerta.inEvidenza).toBe(true)
  })

  test('trasforma i campi nulli in assenti, non in null', () => {
    const offerta = mappaOfferta(riga)

    expect(offerta.istruzioni).toBeUndefined()
    expect(offerta.contatti).toEqual({})
  })

  test('raccoglie i recapiti del partner sotto contatti', () => {
    const offerta = mappaOfferta({
      ...riga,
      indirizzo: 'Via Toledo 1, Napoli',
      telefono: '081 1234567',
      link_partner: 'https://esempio.it',
      codice_sconto: 'CRAL26',
    })

    expect(offerta.contatti).toEqual({
      indirizzo: 'Via Toledo 1, Napoli',
      telefono: '081 1234567',
      sito: 'https://esempio.it',
      codiceSconto: 'CRAL26',
    })
  })

  test('non lascia mai condizioni indefinite', () => {
    const offerta = mappaOfferta({ ...riga, condizioni: [] })

    expect(offerta.condizioni).toEqual([])
  })

  test('valida_al nullo diventa validaAl assente, non una stringa vuota: è una convenzione permanente', () => {
    const offerta = mappaOfferta({ ...riga, valida_al: null })

    expect(offerta.validaAl).toBeUndefined()
  })
})
