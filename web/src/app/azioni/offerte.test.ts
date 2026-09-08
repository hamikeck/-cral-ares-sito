import { describe, expect, test, vi } from 'vitest'

const { redattoreAttivoCon, redirect, revalidatePath, fromMock, insertMock, singleMock } =
  vi.hoisted(() => {
    const singleMock = vi.fn()
    const selectMock = vi.fn(() => ({ single: singleMock }))
    const insertMock = vi.fn(() => ({ select: selectMock }))
    const fromMock = vi.fn(() => ({ insert: insertMock }))
    return {
      redattoreAttivoCon: vi.fn(async () => true),
      // Il vero redirect() di Next interrompe il rendering lanciando un errore
      // speciale: lo si imita così, come in layout.test.tsx, per verificare sia
      // la destinazione sia che il codice dopo la chiamata non prosegua.
      redirect: vi.fn((destinazione: string) => {
        throw new Error(`redirect:${destinazione}`)
      }),
      revalidatePath: vi.fn(),
      fromMock,
      insertMock,
      singleMock,
    }
  })

vi.mock('@/dati/redattori', () => ({ redattoreAttivoCon }))
vi.mock('next/navigation', () => ({ redirect }))
vi.mock('next/cache', () => ({ revalidatePath }))
vi.mock('@/dati/supabaseServer', () => ({
  clientServer: async () => ({ from: fromMock }),
}))

import { salvaOfferta } from './offerte'

/** Un modulo compilato correttamente, con la possibilità di sovrascrivere un campo. */
function modulo(sovrascrizioni: Record<string, string> = {}, azione = 'bozza'): FormData {
  const campi: Record<string, string> = {
    partner: 'Teatro Diana',
    categoria: 'Teatro',
    vantaggio: 'Poltronissima a 18 € invece di 32 €',
    descrizione: 'Riduzione riservata ai soci sull’intera stagione di prosa.',
    descrizioneCompleta: 'La riduzione vale su tutti gli spettacoli della stagione di prosa.',
    condizioni: 'Massimo quattro posti a socio.',
    validaDal: '2026-10-01',
    validaAl: '2027-05-31',
    modalita: 'biglietti',
    istruzioni: '',
    indirizzo: '',
    telefono: '',
    sito: '',
    codiceSconto: '',
    ...sovrascrizioni,
  }
  const dati = new FormData()
  Object.entries(campi).forEach(([chiave, valore]) => dati.set(chiave, valore))
  dati.set('azione', azione)
  return dati
}

describe('salvaOfferta', () => {
  test('senza sessione autorizzata non tocca il database e spiega di riaccedere', async () => {
    redattoreAttivoCon.mockResolvedValueOnce(false)

    const esito = await salvaOfferta(null, modulo())

    expect(esito.errori?.modulo).toMatch(/accedi di nuovo/)
    expect(fromMock).not.toHaveBeenCalled()
  })

  test('«Salva bozza» inserisce con stato «bozza»', async () => {
    singleMock.mockResolvedValueOnce({ data: { id: 'off-1' }, error: null })

    await expect(salvaOfferta(null, modulo({}, 'bozza'))).rejects.toThrow('redirect:')

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ stato: 'bozza' }))
  })

  test('«Pubblica» inserisce con stato «pubblicata» e rimanda alla scheda salvata', async () => {
    singleMock.mockResolvedValueOnce({ data: { id: 'off-2' }, error: null })

    await expect(salvaOfferta(null, modulo({}, 'pubblica'))).rejects.toThrow(
      'redirect:/area-riservata/offerte/off-2?salvata=1',
    )

    expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({ stato: 'pubblicata' }))
  })

  test('un errore di validazione torna mappato sul campo giusto, e non tocca il database', async () => {
    const esito = await salvaOfferta(null, modulo({ partner: '' }))

    expect(esito.errori?.partner).toBe('Scrivi il nome del partner.')
    expect(fromMock).not.toHaveBeenCalled()
  })

  test('il codice postgres 23505 diventa un messaggio comprensibile, non il testo grezzo del database', async () => {
    singleMock.mockResolvedValueOnce({
      data: null,
      error: { code: '23505', message: 'duplicate key value violates unique constraint "offerte_slug_key"' },
    })

    const esito = await salvaOfferta(null, modulo())

    expect(esito.errori?.modulo).toMatch(/Esiste già/)
    expect(esito.errori?.modulo).not.toMatch(/constraint/)
  })

  test('un altro errore del database resta un messaggio fisso in italiano, senza il dettaglio grezzo', async () => {
    singleMock.mockResolvedValueOnce({
      data: null,
      error: { code: '42501', message: 'new row violates row-level security policy for table "offerte"' },
    })

    const esito = await salvaOfferta(null, modulo())

    expect(esito.errori?.modulo).toMatch(/Non è stato possibile salvare/)
    expect(esito.errori?.modulo).not.toMatch(/row-level security/)
  })
})
