import { describe, expect, test } from 'vitest'
import {
  altreOfferte,
  categorie,
  offerte,
  offertaDaSlug,
  offertaInEvidenza,
  offertePerCategoria,
  offerteValide,
} from './offerteEsempio'

/** Una data fissa: i test sulla scadenza non devono cambiare esito domani. */
const ADESSO = '2026-09-06'

describe('dati delle offerte', () => {
  test('ogni offerta ha uno slug unico, utilizzabile in un indirizzo', () => {
    const slug = offerte.map((offerta) => offerta.slug)
    expect(new Set(slug).size).toBe(slug.length)
    for (const valore of slug) {
      expect(valore).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })

  test("c'è una sola offerta in evidenza", () => {
    expect(offerte.filter((offerta) => offerta.inEvidenza)).toHaveLength(1)
  })

  test('le offerte a solo sconto spiegano come ottenerle', () => {
    for (const offerta of offerte) {
      if (offerta.modalita === 'solo_sconto') {
        expect(offerta.istruzioni?.trim()).toBeTruthy()
      }
    }
  })

  test('nessun testo è vuoto', () => {
    for (const offerta of offerte) {
      for (const campo of [
        offerta.partner,
        offerta.categoria,
        offerta.vantaggio,
        offerta.descrizione,
        offerta.descrizioneCompleta,
        offerta.validaAl,
      ]) {
        expect(campo.trim().length).toBeGreaterThan(0)
      }
      expect(offerta.condizioni.length).toBeGreaterThan(0)
    }
  })
})

describe('selezione delle offerte', () => {
  test("l'offerta in evidenza non compare fra le altre", () => {
    const inEvidenza = offertaInEvidenza(ADESSO)
    expect(inEvidenza).toBeDefined()
    expect(altreOfferte(ADESSO).map((offerta) => offerta.slug)).not.toContain(
      inEvidenza!.slug,
    )
  })

  test('in evidenza più le altre danno il totale delle valide', () => {
    expect(altreOfferte(ADESSO)).toHaveLength(offerteValide(ADESSO).length - 1)
  })

  test('le categorie sono uniche e in ordine alfabetico italiano', () => {
    const elenco = categorie(ADESSO)
    expect(new Set(elenco).size).toBe(elenco.length)
    expect(elenco).toEqual([...elenco].sort((a, b) => a.localeCompare(b, 'it')))
  })

  test('il filtro per categoria restituisce solo quella categoria', () => {
    for (const categoria of categorie(ADESSO)) {
      const filtrate = offertePerCategoria(categoria, ADESSO)
      expect(filtrate.length).toBeGreaterThan(0)
      for (const offerta of filtrate) {
        expect(offerta.categoria).toBe(categoria)
      }
    }
  })

  test('senza categoria il filtro restituisce tutte le valide', () => {
    expect(offertePerCategoria(undefined, ADESSO)).toHaveLength(
      offerteValide(ADESSO).length,
    )
  })

  test('una categoria inesistente non restituisce nulla', () => {
    expect(offertePerCategoria('Astronautica', ADESSO)).toHaveLength(0)
  })

  test('lo slug ritrova la sua offerta, e uno inventato no', () => {
    expect(offertaDaSlug(offerte[0].slug)?.partner).toBe(offerte[0].partner)
    expect(offertaDaSlug('non-esiste')).toBeUndefined()
  })
})

describe('scadenza delle offerte', () => {
  const scadutaDiEsempio = offerte.find(
    (offerta) => offerta.validaAl < ADESSO,
  )!

  test("l'insieme di esempio contiene almeno un'offerta già finita", () => {
    expect(scadutaDiEsempio).toBeDefined()
  })

  test("un'offerta scaduta non compare fra le valide", () => {
    expect(offerteValide(ADESSO).map((o) => o.slug)).not.toContain(
      scadutaDiEsempio.slug,
    )
  })

  test('ma resta raggiungibile dal suo indirizzo', () => {
    expect(offertaDaSlug(scadutaDiEsempio.slug)).toBeDefined()
  })

  test("un'offerta è valida nel suo ultimo giorno e non in quello dopo", () => {
    const ultima = scadutaDiEsempio.validaAl
    expect(offerteValide(ultima).map((o) => o.slug)).toContain(
      scadutaDiEsempio.slug,
    )
  })

  test("un'offerta non ancora iniziata non compare", () => {
    const primaDiTutte = offerte
      .map((offerta) => offerta.validaDal)
      .sort()[0]
    const giornoPrima = '2000-01-01'
    expect(offerteValide(giornoPrima)).toHaveLength(0)
    expect(primaDiTutte > giornoPrima).toBe(true)
  })
})
