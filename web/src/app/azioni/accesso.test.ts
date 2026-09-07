import { describe, expect, test, vi } from 'vitest'

const { signInWithOtp } = vi.hoisted(() => ({ signInWithOtp: vi.fn() }))

vi.mock('@/dati/supabaseServer', () => ({
  clientServer: async () => ({ auth: { signInWithOtp } }),
}))

import { richiediAccesso } from './accesso'

function modulo(email: string): FormData {
  const dati = new FormData()
  dati.set('email', email)
  return dati
}

/**
 * Queste prove blindano una proprietà, non un comportamento: nessuna
 * modifica futura deve poter leggere l'`error` di `signInWithOtp` e
 * distinguere un indirizzo autorizzato da uno sconosciuto. Farlo
 * trasformerebbe il modulo in uno strumento per scoprire chi fa parte del
 * direttivo.
 */
describe('richiediAccesso', () => {
  test('risponde allo stesso modo per un indirizzo autorizzato e per uno sconosciuto', async () => {
    signInWithOtp.mockResolvedValueOnce({ data: {}, error: null })
    const perAutorizzato = await richiediAccesso(null, modulo('direttore@esempio.it'))

    signInWithOtp.mockResolvedValueOnce({
      data: {},
      error: { message: 'Signups not allowed for otp', status: 422 },
    })
    const perSconosciuto = await richiediAccesso(null, modulo('chiunque@esempio.it'))

    expect(perAutorizzato.messaggio).toBe(perSconosciuto.messaggio)
  })

  test('il solo messaggio diverso è quello per un testo senza «@», che non interroga il database e non rivela nulla sull’autorizzazione', async () => {
    signInWithOtp.mockResolvedValueOnce({ data: {}, error: null })
    const conEmailValida = await richiediAccesso(null, modulo('direttore@esempio.it'))

    const senzaChiocciola = await richiediAccesso(null, modulo('non-una-email'))

    expect(senzaChiocciola.messaggio).not.toBe(conEmailValida.messaggio)
    expect(signInWithOtp).toHaveBeenCalledTimes(1)
  })
})
