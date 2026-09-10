import { describe, expect, test } from 'vitest'
import { descriviScadenza, formattaData, nonAncoraIniziata, oggi, scaduta } from './date'

describe('oggi', () => {
  test('ha la forma ISO di una data senza ora', () => {
    expect(oggi()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('formattaData', () => {
  test('scrive la data per esteso in italiano', () => {
    expect(formattaData('2026-09-30')).toBe('30 settembre 2026')
    expect(formattaData('2026-01-01')).toBe('1 gennaio 2026')
    expect(formattaData('2026-12-31')).toBe('31 dicembre 2026')
  })

  test('non anticipa né posticipa il giorno', () => {
    // Il caso che rompe le implementazioni ingenue: `new Date('2026-03-01')`
    // vale mezzanotte UTC, e in un fuso a ovest verrebbe reso come 28 febbraio.
    expect(formattaData('2026-03-01')).toBe('1 marzo 2026')
  })
})

describe('scaduta', () => {
  test('il giorno indicato è ancora valido', () => {
    expect(scaduta('2026-09-30', '2026-09-30')).toBe(false)
  })

  test('il giorno dopo è scaduta', () => {
    expect(scaduta('2026-09-30', '2026-10-01')).toBe(true)
  })

  test('una data futura non è scaduta', () => {
    expect(scaduta('2027-01-01', '2026-09-30')).toBe(false)
  })

  test('il confronto regge il cambio di anno', () => {
    expect(scaduta('2026-12-31', '2027-01-01')).toBe(true)
    expect(scaduta('2027-01-01', '2026-12-31')).toBe(false)
  })

  test('una data assente non è mai scaduta: le convenzioni permanenti restano sempre in corso', () => {
    expect(scaduta(undefined, '2026-12-31')).toBe(false)
  })
})

describe('nonAncoraIniziata', () => {
  test("un'offerta che parte domani non è ancora iniziata", () => {
    expect(nonAncoraIniziata('2026-10-01', '2026-09-30')).toBe(true)
  })

  test('il giorno di partenza è già buono', () => {
    expect(nonAncoraIniziata('2026-09-30', '2026-09-30')).toBe(false)
  })
})

describe('descriviScadenza', () => {
  test('senza data di fine è una convenzione permanente', () => {
    expect(descriviScadenza(undefined, '2026-09-09')).toEqual({
      tipo: 'sempre',
      testo: 'Senza scadenza',
    })
  })

  test('con la data ancora vuota lo dice, invece di fingere una scadenza', () => {
    // Succede solo nell'anteprima del modulo, prima che il direttore scriva.
    expect(descriviScadenza('', '2026-09-09')).toEqual({
      tipo: 'da-indicare',
      testo: 'Scadenza da indicare',
    })
  })

  test('sotto il mese conta i giorni che mancano', () => {
    expect(descriviScadenza('2026-09-30', '2026-09-09')).toEqual({
      tipo: 'vicina',
      testo: 'Mancano 21 giorni',
    })
  })

  test('l’ultimo giorno e il penultimo si dicono a parole', () => {
    expect(descriviScadenza('2026-09-09', '2026-09-09').testo).toBe('Scade oggi')
    expect(descriviScadenza('2026-09-10', '2026-09-09').testo).toBe('Scade domani')
  })

  test('due giorni sono plurale, uno è singolare', () => {
    expect(descriviScadenza('2026-09-11', '2026-09-09').testo).toBe('Mancano 2 giorni')
  })

  test('trenta giorni sono ancora vicini, trentuno no', () => {
    // La soglia decide se la riga si accende in ambra: sotto il mese l'urgenza
    // è vera, sopra è un allarme che suonerebbe per mesi.
    expect(descriviScadenza('2026-10-09', '2026-09-09').tipo).toBe('vicina')
    expect(descriviScadenza('2026-10-10', '2026-09-09')).toEqual({
      tipo: 'lontana',
      testo: 'Fino al 10 ottobre 2026',
    })
  })

  test('il conteggio regge il cambio di mese e di anno', () => {
    expect(descriviScadenza('2027-01-01', '2026-12-31').testo).toBe('Scade domani')
    expect(descriviScadenza('2026-03-01', '2026-02-27').testo).toBe('Mancano 2 giorni')
  })

  test('il conteggio non salta il giorno del cambio d’ora legale', () => {
    // L'ora legale in Italia finisce il 25 ottobre 2026: quel giorno dura 25
    // ore. Contando in millisecondi sul fuso locale, il 24 e il 26 disterebbero
    // 2,04 giorni e un arrotondamento verso il basso ne direbbe 2 invece di 3.
    expect(descriviScadenza('2026-10-27', '2026-10-24').testo).toBe('Mancano 3 giorni')
  })

  test('una data già passata non conta giorni negativi', () => {
    expect(descriviScadenza('2026-09-08', '2026-09-09')).toEqual({
      tipo: 'scaduta',
      testo: 'Scaduta',
    })
  })
})
