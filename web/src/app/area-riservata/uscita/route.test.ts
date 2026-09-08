import { describe, expect, test, vi } from 'vitest'

const { signOut } = vi.hoisted(() => ({
  signOut: vi.fn(async () => ({ error: null })),
}))

vi.mock('@/dati/supabaseServer', () => ({
  clientServer: async () => ({ auth: { signOut } }),
}))

import { GET, POST } from './route'

describe('GET /area-riservata/uscita (espulsione, arriva da un redirect() server-side)', () => {
  test('chiude la sessione e rimanda alla pagina di accesso con un redirect che mantiene il GET', async () => {
    const risposta = await GET(new Request('http://localhost:3000/area-riservata/uscita'))

    expect(signOut).toHaveBeenCalled()
    expect(risposta.status).toBe(307)
    const destinazione = new URL(risposta.headers.get('location') ?? '')
    expect(destinazione.pathname).toBe('/area-riservata/accedi')
  })

  test('inoltra nonAutorizzato quando presente, così la pagina di accesso spiega perché', async () => {
    const risposta = await GET(
      new Request('http://localhost:3000/area-riservata/uscita?nonAutorizzato=1'),
    )

    const destinazione = new URL(risposta.headers.get('location') ?? '')
    expect(destinazione.searchParams.get('nonAutorizzato')).toBe('1')
  })

  test('senza il parametro non lo aggiunge, per non mostrare un avviso falso', async () => {
    const risposta = await GET(new Request('http://localhost:3000/area-riservata/uscita'))

    const destinazione = new URL(risposta.headers.get('location') ?? '')
    expect(destinazione.searchParams.has('nonAutorizzato')).toBe(false)
  })
})

describe('POST /area-riservata/uscita (uscita volontaria, dal form del pulsante «Esci»)', () => {
  test('chiude la sessione e rimanda alla pagina di accesso con un 303, non un 307', async () => {
    const risposta = await POST(
      new Request('http://localhost:3000/area-riservata/uscita', { method: 'POST' }),
    )

    expect(signOut).toHaveBeenCalled()
    // 303 e non 307: dopo un POST il browser deve rifare la richiesta di
    // destinazione in GET, non ripetere il POST sulla pagina di accesso.
    expect(risposta.status).toBe(303)
    const destinazione = new URL(risposta.headers.get('location') ?? '')
    expect(destinazione.pathname).toBe('/area-riservata/accedi')
  })

  test('non porta nonAutorizzato: solo l’espulsione via GET lo scrive nell’indirizzo', async () => {
    const risposta = await POST(
      new Request('http://localhost:3000/area-riservata/uscita', { method: 'POST' }),
    )

    const destinazione = new URL(risposta.headers.get('location') ?? '')
    expect(destinazione.searchParams.has('nonAutorizzato')).toBe(false)
  })
})
