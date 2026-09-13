import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { turnstileAttivo, verificaTurnstile } from './turnstile'

const segretoOriginale = process.env.TURNSTILE_SECRET_KEY

afterEach(() => {
  if (segretoOriginale === undefined) delete process.env.TURNSTILE_SECRET_KEY
  else process.env.TURNSTILE_SECRET_KEY = segretoOriginale
  vi.unstubAllGlobals()
})

describe('senza chiavi', () => {
  beforeEach(() => {
    delete process.env.TURNSTILE_SECRET_KEY
  })

  test('il controllo è spento', () => {
    expect(turnstileAttivo()).toBe(false)
  })

  test('e lascia passare anche senza gettone', async () => {
    // È lo stato di oggi: finché le chiavi non ci sono, il modulo funziona
    // esattamente come prima. Quello che manca si dichiara, non si finge.
    expect(await verificaTurnstile('')).toEqual({ passato: true })
  })
})

describe('con le chiavi', () => {
  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = 'segreto-di-prova'
  })

  test('senza gettone si blocca, senza nemmeno chiamare Cloudflare', async () => {
    const chiamata = vi.fn()
    vi.stubGlobal('fetch', chiamata)

    const esito = await verificaTurnstile('')

    expect(esito.passato).toBe(false)
    expect(chiamata).not.toHaveBeenCalled()
  })

  test('un gettone valido passa', async () => {
    vi.stubGlobal('fetch', async () => ({ json: async () => ({ success: true }) }))
    expect(await verificaTurnstile('gettone')).toEqual({ passato: true })
  })

  test('un gettone rifiutato blocca, con un messaggio che dice cosa fare', async () => {
    vi.stubGlobal('fetch', async () => ({
      json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
    }))

    const esito = await verificaTurnstile('gettone-finto')

    expect(esito.passato).toBe(false)
    expect(esito.passato === false && esito.motivo).toMatch(/Ricarica la pagina/)
  })

  test('se Cloudflare non risponde, il socio passa lo stesso', async () => {
    // Scelta consapevole: un guasto di un servizio terzo non deve impedire a
    // un socio di chiedere quattro biglietti. Il valore protetto è basso, il
    // danno di un modulo fermo è certo.
    vi.stubGlobal('fetch', async () => {
      throw new Error('rete giù')
    })

    expect(await verificaTurnstile('gettone')).toEqual({ passato: true })
  })

  test('l’indirizzo IP viaggia solo se lo conosciamo', async () => {
    const chiamate: string[] = []
    vi.stubGlobal('fetch', async (_url: string, opzioni: { body: URLSearchParams }) => {
      chiamate.push(opzioni.body.toString())
      return { json: async () => ({ success: true }) }
    })

    await verificaTurnstile('gettone')
    await verificaTurnstile('gettone', '1.2.3.4')

    expect(chiamate[0]).not.toContain('remoteip')
    expect(chiamate[1]).toContain('remoteip=1.2.3.4')
  })
})
