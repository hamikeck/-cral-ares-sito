import { describe, expect, test, vi } from 'vitest'
import { svegliaIlDatabase } from './sveglia'

const ambiente = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://esempio.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'chiave-pubblica',
}

describe('svegliaIlDatabase', () => {
  test('fa una lettura vera sul database, non una visita al sito', async () => {
    // Supabase conta come attività solo le richieste al database: aprire il
    // sito non basta, perché le pagine pubbliche sono statiche.
    const chiamata = vi.fn(async () => new Response('[]', { status: 200 }))

    await svegliaIlDatabase(ambiente, chiamata)

    const [indirizzo, opzioni] = chiamata.mock.calls[0] as unknown as [string, RequestInit]
    expect(indirizzo).toBe('https://esempio.supabase.co/rest/v1/circuiti?select=id&limit=1')
    expect(new Headers(opzioni.headers).get('apikey')).toBe('chiave-pubblica')
  })

  test('se il database non risponde bene, fallisce ad alta voce', async () => {
    // Un errore qui deve finire nei log di Netlify come esecuzione fallita:
    // è l'unico segnale che il progetto si è fermato lo stesso.
    const chiamata = vi.fn(async () => new Response('paused', { status: 540 }))

    await expect(svegliaIlDatabase(ambiente, chiamata)).rejects.toThrow(/540/)
  })

  test('senza le variabili lo dice, invece di non fare niente in silenzio', async () => {
    await expect(svegliaIlDatabase({}, vi.fn())).rejects.toThrow(/NEXT_PUBLIC_SUPABASE_URL/)
  })
})
