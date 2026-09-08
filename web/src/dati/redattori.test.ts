import { describe, expect, test, vi } from 'vitest'
import { redattoreAttivoCon } from './redattori'

function client(utente: object | null, autorizzato: boolean | null) {
  return {
    auth: { getUser: vi.fn(async () => ({ data: { user: utente } })) },
    rpc: vi.fn(async () => ({ data: autorizzato, error: null })),
  }
}

describe('redattoreAttivoCon', () => {
  test('è falso senza sessione, e non interroga nemmeno il database', async () => {
    const finto = client(null, true)

    expect(await redattoreAttivoCon(finto as never)).toBe(false)
    expect(finto.rpc).not.toHaveBeenCalled()
  })

  test('è falso se la sessione esiste ma l’email non è fra i redattori attivi', async () => {
    expect(await redattoreAttivoCon(client({ id: '1' }, false) as never)).toBe(false)
  })

  test('è vero solo con sessione e autorizzazione', async () => {
    const finto = client({ id: '1' }, true)

    expect(await redattoreAttivoCon(finto as never)).toBe(true)
    expect(finto.rpc).toHaveBeenCalledWith('e_redattore')
  })
})
