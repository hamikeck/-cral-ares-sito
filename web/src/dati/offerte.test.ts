import { describe, expect, test, vi } from 'vitest'
import { offertaDaSlug, offerteValide } from './offerte'
import type { RigaOfferta } from './righe'

/**
 * Un finto client Supabase: accetta qualunque catena di filtri e restituisce
 * le righe che gli sono state date. Volutamente stupido — qui non stiamo
 * verificando Supabase, ma che le nostre funzioni chiedano le colonne giuste
 * e traducano il risultato.
 */
function clientFinto(righe: RigaOfferta[], errore: { message: string } | null = null) {
  const catena = {
    select: vi.fn(() => catena),
    eq: vi.fn(() => catena),
    lte: vi.fn(() => catena),
    gte: vi.fn(() => catena),
    order: vi.fn(() => Promise.resolve({ data: righe, error: errore })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: righe[0] ?? null, error: errore })),
  }
  return { from: vi.fn(() => catena), catena }
}

const riga: RigaOfferta = {
  slug: 'teatro-diana-stagione-prosa',
  partner: 'Teatro Diana',
  categoria: 'Teatro',
  vantaggio: 'Poltronissima a 18 € invece di 32 €',
  descrizione_breve: 'Riduzione riservata ai soci.',
  descrizione: 'La riduzione vale su tutti gli spettacoli della stagione.',
  condizioni: ['Massimo quattro posti a socio.'],
  valida_dal: '2026-09-01',
  valida_al: '2026-10-15',
  in_evidenza: false,
  modalita: 'biglietti',
  istruzioni: null,
  indirizzo: null,
  telefono: null,
  link_partner: null,
  codice_sconto: null,
  stato: 'pubblicata',
}

describe('offerteValide', () => {
  test('chiede solo le offerte pubblicate e in corso alla data indicata', async () => {
    const finto = clientFinto([riga])

    await offerteValide('2026-09-15', finto as never)

    expect(finto.from).toHaveBeenCalledWith('offerte')
    expect(finto.catena.eq).toHaveBeenCalledWith('stato', 'pubblicata')
    expect(finto.catena.lte).toHaveBeenCalledWith('valida_dal', '2026-09-15')
    expect(finto.catena.gte).toHaveBeenCalledWith('valida_al', '2026-09-15')
  })

  test('restituisce offerte di dominio, non righe', async () => {
    const finto = clientFinto([riga])

    const [offerta] = await offerteValide('2026-09-15', finto as never)

    expect(offerta.descrizioneCompleta).toBe(
      'La riduzione vale su tutti gli spettacoli della stagione.',
    )
    expect(offerta.validaAl).toBe('2026-10-15')
  })

  test('solleva un errore leggibile se il database risponde male', async () => {
    const finto = clientFinto([], { message: 'connection refused' })

    await expect(offerteValide('2026-09-15', finto as never)).rejects.toThrow(
      /Non è stato possibile leggere le offerte/,
    )
  })
})

describe('offertaDaSlug', () => {
  test('cerca per slug senza filtrare per data: una scheda scaduta resta raggiungibile', async () => {
    const finto = clientFinto([riga])

    const offerta = await offertaDaSlug('teatro-diana-stagione-prosa', finto as never)

    expect(finto.catena.eq).toHaveBeenCalledWith('slug', 'teatro-diana-stagione-prosa')
    expect(finto.catena.lte).not.toHaveBeenCalled()
    expect(offerta?.partner).toBe('Teatro Diana')
  })

  test('restituisce undefined se lo slug non esiste', async () => {
    const finto = clientFinto([])

    expect(await offertaDaSlug('inventato', finto as never)).toBeUndefined()
  })
})
