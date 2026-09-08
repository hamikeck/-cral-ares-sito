import { describe, expect, test, vi } from 'vitest'

const {
  redattoreAttivoCon,
  redirect,
  revalidatePath,
  fromMock,
  insertMock,
  singleMock,
  updateMock,
  updateEqMock,
  updateSingleMock,
  deleteMock,
  deleteEqMock,
} = vi.hoisted(() => {
  const singleMock = vi.fn()
  const selectMock = vi.fn(() => ({ single: singleMock }))
  const insertMock = vi.fn(() => ({ select: selectMock }))

  const updateSingleMock = vi.fn()
  const updateSelectMock = vi.fn(() => ({ single: updateSingleMock }))
  const updateEqMock = vi.fn(() => ({ select: updateSelectMock }))
  const updateMock = vi.fn(() => ({ eq: updateEqMock }))

  const deleteEqMock = vi.fn(async (): Promise<{ error: { code: string; message: string } | null }> => ({
    error: null,
  }))
  const deleteMock = vi.fn(() => ({ eq: deleteEqMock }))

  const fromMock = vi.fn(() => ({
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
  }))
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
    updateMock,
    updateEqMock,
    updateSingleMock,
    deleteMock,
    deleteEqMock,
  }
})

vi.mock('@/dati/redattori', () => ({ redattoreAttivoCon }))
vi.mock('next/navigation', () => ({ redirect }))
vi.mock('next/cache', () => ({ revalidatePath }))
vi.mock('@/dati/supabaseServer', () => ({
  clientServer: async () => ({ from: fromMock }),
}))

import { aggiornaOfferta, eliminaOfferta, salvaOfferta } from './offerte'

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

describe('aggiornaOfferta', () => {
  test('senza id non tocca il database', async () => {
    const esito = await aggiornaOfferta(null, modulo())

    expect(esito.errori?.modulo).toMatch(/Non è stato possibile salvare/)
    expect(fromMock).not.toHaveBeenCalled()
  })

  test('senza sessione autorizzata non tocca il database e spiega di riaccedere', async () => {
    redattoreAttivoCon.mockResolvedValueOnce(false)

    const esito = await aggiornaOfferta(null, modulo({ id: 'off-1' }))

    expect(esito.errori?.modulo).toMatch(/accedi di nuovo/)
    expect(fromMock).not.toHaveBeenCalled()
  })

  test('un errore di validazione torna mappato sul campo giusto, e non tocca il database', async () => {
    const esito = await aggiornaOfferta(null, modulo({ id: 'off-1', partner: '' }))

    expect(esito.errori?.partner).toBe('Scrivi il nome del partner.')
    expect(fromMock).not.toHaveBeenCalled()
  })

  test('salva le modifiche sulla riga giusta, senza toccare lo slug', async () => {
    updateSingleMock.mockResolvedValueOnce({
      data: { slug: 'teatro-diana-poltronissima-2026' },
      error: null,
    })

    await expect(
      aggiornaOfferta(null, modulo({ id: 'off-1' }, 'bozza')),
    ).rejects.toThrow('redirect:/area-riservata/offerte/off-1?salvata=1')

    expect(updateEqMock).toHaveBeenCalledWith('id', 'off-1')
    expect(updateMock).toHaveBeenCalledWith(
      expect.not.objectContaining({ slug: expect.anything() }),
    )
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ stato: 'bozza' }))
  })

  test('«Pubblica» aggiorna lo stato a «pubblicata»', async () => {
    updateSingleMock.mockResolvedValueOnce({
      data: { slug: 'teatro-diana-poltronissima-2026' },
      error: null,
    })

    await expect(
      aggiornaOfferta(null, modulo({ id: 'off-1' }, 'pubblica')),
    ).rejects.toThrow('redirect:')

    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ stato: 'pubblicata' }))
  })

  test('rigenera home, elenco e la scheda con lo slug vero letto dal database', async () => {
    updateSingleMock.mockResolvedValueOnce({ data: { slug: 'slug-vero' }, error: null })

    await expect(aggiornaOfferta(null, modulo({ id: 'off-1' }))).rejects.toThrow('redirect:')

    expect(revalidatePath).toHaveBeenCalledWith('/offerte')
    expect(revalidatePath).toHaveBeenCalledWith('/')
    expect(revalidatePath).toHaveBeenCalledWith('/offerte/slug-vero')
  })

  test('un errore del database resta un messaggio fisso in italiano, senza il dettaglio grezzo', async () => {
    updateSingleMock.mockResolvedValueOnce({
      data: null,
      error: { code: '42501', message: 'new row violates row-level security policy for table "offerte"' },
    })

    const esito = await aggiornaOfferta(null, modulo({ id: 'off-1' }))

    expect(esito.errori?.modulo).toMatch(/Non è stato possibile salvare/)
    expect(esito.errori?.modulo).not.toMatch(/row-level security/)
  })
})

describe('eliminaOfferta', () => {
  function moduloElimina(id = 'off-1'): FormData {
    const dati = new FormData()
    dati.set('id', id)
    return dati
  }

  test('senza sessione autorizzata non tocca il database e rimanda a uscire', async () => {
    redattoreAttivoCon.mockResolvedValueOnce(false)

    await expect(eliminaOfferta(moduloElimina())).rejects.toThrow(
      'redirect:/area-riservata/uscita?nonAutorizzato=1',
    )
    expect(deleteMock).not.toHaveBeenCalled()
  })

  test('elimina la riga giusta e rimanda all’elenco', async () => {
    await expect(eliminaOfferta(moduloElimina('off-2'))).rejects.toThrow(
      'redirect:/area-riservata',
    )

    expect(deleteMock).toHaveBeenCalled()
    expect(deleteEqMock).toHaveBeenCalledWith('id', 'off-2')
    expect(revalidatePath).toHaveBeenCalledWith('/offerte')
    expect(revalidatePath).toHaveBeenCalledWith('/')
  })

  test('un errore del database resta nei log ma non impedisce comunque il redirect', async () => {
    deleteEqMock.mockResolvedValueOnce({
      error: { code: '42501', message: 'new row violates row-level security policy for table "offerte"' },
    })

    await expect(eliminaOfferta(moduloElimina('off-3'))).rejects.toThrow(
      'redirect:/area-riservata',
    )
  })
})
