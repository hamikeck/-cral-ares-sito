import { describe, expect, test } from 'vitest'
import { altre, categorieDi, inEvidenza, perCategoria } from './selezione'
import { offerteFinte } from '@/test/offerteFinte'

describe('selezione delle offerte', () => {
  test('elenca le categorie presenti, senza ripetizioni e in ordine italiano', () => {
    expect(categorieDi(offerteFinte)).toEqual([
      'Auto',
      'Cinema',
      'Salute',
      'Sport',
      'Teatro',
    ])
  })

  test('filtra per categoria', () => {
    const cinema = perCategoria(offerteFinte, 'Cinema')

    expect(cinema).toHaveLength(2)
    expect(cinema.every((offerta) => offerta.categoria === 'Cinema')).toBe(true)
  })

  test('senza categoria restituisce tutto', () => {
    expect(perCategoria(offerteFinte)).toHaveLength(offerteFinte.length)
  })

  test('trova l’offerta in evidenza', () => {
    expect(inEvidenza(offerteFinte)?.slug).toBe('uci-cinemas-ingresso-ridotto')
  })

  test('restituisce undefined quando nessuna è in evidenza', () => {
    const senza = offerteFinte.map((offerta) => ({ ...offerta, inEvidenza: false }))

    expect(inEvidenza(senza)).toBeUndefined()
  })

  test('«le altre» sono tutte tranne quella in evidenza', () => {
    expect(altre(offerteFinte)).toHaveLength(offerteFinte.length - 1)
  })
})
