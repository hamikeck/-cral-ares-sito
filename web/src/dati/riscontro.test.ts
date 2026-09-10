import { beforeEach, describe, expect, test, vi } from 'vitest'

const rpc = vi.hoisted(() => vi.fn())
vi.mock('./supabasePubblico', () => ({ clientPubblico: () => ({ rpc }) }))
vi.mock('./supabaseServer', () => ({ clientServer: vi.fn() }))

import { risultaSocio } from './soci'

describe('risultaSocio', () => {
  beforeEach(() => {
    rpc.mockReset()
  })

  test('chiede al database, e passa i due campi così come sono stati scritti', async () => {
    // La normalizzazione la fa la funzione SQL, con le stesse regole degli
    // indici: rifarla qui creerebbe una seconda verità destinata a divergere.
    rpc.mockResolvedValue({ data: true, error: null })

    await risultaSocio('  Mario.Rossi@AE.it ', 'ae 12345')

    expect(rpc).toHaveBeenCalledWith('risulta_socio', {
      email_richiedente: '  Mario.Rossi@AE.it ',
      matricola_richiedente: 'ae 12345',
    })
  })

  test('risponde vero quando il database dice vero', async () => {
    rpc.mockResolvedValue({ data: true, error: null })
    expect(await risultaSocio('m@ae.it', 'AE1')).toBe(true)
  })

  test('risponde falso quando il database dice falso', async () => {
    // Per esempio chi ha indovinato una matricola ma scrive dalla propria
    // email: da sola, la matricola non basta più.
    rpc.mockResolvedValue({ data: false, error: null })
    expect(await risultaSocio('ladro@gmail.com', 'AE12345')).toBe(false)
  })

  test('un errore non diventa mai un sì', async () => {
    // È il caso che conta: se il database non risponde, la richiesta non deve
    // partire. Un `catch` che restituisse `true` per non bloccare nessuno
    // aprirebbe il modulo a chiunque nel momento peggiore.
    rpc.mockResolvedValue({ data: null, error: { message: 'timeout' } })

    await expect(risultaSocio('m@ae.it', 'AE1')).rejects.toThrow(/verificare/)
  })

  test('una risposta inattesa non diventa un sì', async () => {
    rpc.mockResolvedValue({ data: 'forse', error: null })
    expect(await risultaSocio('m@ae.it', 'AE1')).toBe(false)
  })
})
