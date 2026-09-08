import { describe, expect, test, vi } from 'vitest'

const { getUser, redattoreAttivo, redirect } = vi.hoisted(() => ({
  getUser: vi.fn(),
  redattoreAttivo: vi.fn(),
  // Il vero redirect() di Next interrompe il rendering lanciando un errore
  // speciale: lo si imita così, per verificare sia la destinazione sia che
  // il codice dopo la chiamata non prosegua.
  redirect: vi.fn((destinazione: string) => {
    throw new Error(`redirect:${destinazione}`)
  }),
}))

vi.mock('next/navigation', () => ({ redirect }))
vi.mock('@/dati/redattori', () => ({ redattoreAttivo }))
vi.mock('@/dati/supabaseServer', () => ({
  clientServer: async () => ({ auth: { getUser } }),
}))

import GuscioRiservato from './layout'

describe('GuscioRiservato', () => {
  test('senza sessione rimanda alla pagina di accesso, senza interrogare l’autorizzazione', async () => {
    getUser.mockResolvedValueOnce({ data: { user: null } })

    await expect(GuscioRiservato({ children: null })).rejects.toThrow(
      'redirect:/area-riservata/accedi',
    )
    expect(redattoreAttivo).not.toHaveBeenCalled()
  })

  test('con sessione ma senza autorizzazione rimanda all’uscita, che chiude la sessione per davvero', async () => {
    getUser.mockResolvedValueOnce({ data: { user: { email: 'chi@esempio.it' } } })
    redattoreAttivo.mockResolvedValueOnce(false)

    await expect(GuscioRiservato({ children: null })).rejects.toThrow(
      'redirect:/area-riservata/uscita?nonAutorizzato=1',
    )
  })
})
