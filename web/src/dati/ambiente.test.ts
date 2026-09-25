import { afterEach, describe, expect, test, vi } from 'vitest'
import { ambiente, indirizzoDelSito } from './ambiente'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('ambiente', () => {
  test('restituisce le tre variabili quando ci sono', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://esempio.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'chiave-finta')
    vi.stubEnv('NEXT_PUBLIC_SITO_URL', 'https://cralares.it')

    expect(ambiente()).toEqual({
      url: 'https://esempio.supabase.co',
      chiaveAnonima: 'chiave-finta',
      sitoUrl: 'https://cralares.it',
    })
  })

  test('spiega quale variabile manca, invece di rompersi più avanti', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'chiave-finta')
    vi.stubEnv('NEXT_PUBLIC_SITO_URL', 'https://cralares.it')

    expect(() => ambiente()).toThrowError(/NEXT_PUBLIC_SUPABASE_URL/)
  })

  test('fuori produzione, senza NEXT_PUBLIC_SITO_URL usa localhost come comodo', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://esempio.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'chiave-finta')
    vi.stubEnv('NEXT_PUBLIC_SITO_URL', '')
    vi.stubEnv('NODE_ENV', 'development')

    expect(ambiente().sitoUrl).toBe('http://localhost:3000')
  })

  test('in produzione, senza NEXT_PUBLIC_SITO_URL fallisce invece di produrre un indirizzo falso', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://esempio.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'chiave-finta')
    vi.stubEnv('NEXT_PUBLIC_SITO_URL', '')
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('URL', '')

    expect(() => ambiente()).toThrowError(/NEXT_PUBLIC_SITO_URL/)
  })

  describe('su Netlify', () => {
    // Netlify scrive da sé in `URL` l'indirizzo principale del sito, nella
    // build e nelle funzioni. Il 25 settembre 2026 NEXT_PUBLIC_SITO_URL su
    // Netlify valeva `http://localhost:3000`, copiato da `.env.local`: le
    // anteprime su WhatsApp puntavano al computer di chi le apriva, e così il
    // testo che i direttori copiano per le email ai soci.
    test('un localhost dichiarato in produzione cede all’indirizzo di Netlify', () => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.stubEnv('NEXT_PUBLIC_SITO_URL', 'http://localhost:3000')
      vi.stubEnv('URL', 'https://cral-ares.netlify.app')

      expect(indirizzoDelSito()).toBe('https://cral-ares.netlify.app')
    })

    test('senza variabile dichiarata usa l’indirizzo di Netlify', () => {
      vi.stubEnv('NODE_ENV', 'production')
      vi.stubEnv('NEXT_PUBLIC_SITO_URL', '')
      vi.stubEnv('URL', 'https://cral-ares.netlify.app')

      expect(indirizzoDelSito()).toBe('https://cral-ares.netlify.app')
    })

    test('un indirizzo vero dichiarato vince su quello di Netlify', () => {
      // È il caso del dominio: finché su Netlify non diventa il dominio
      // principale, `URL` resta il netlify.app.
      vi.stubEnv('NODE_ENV', 'production')
      vi.stubEnv('NEXT_PUBLIC_SITO_URL', 'https://cralares.com/')
      vi.stubEnv('URL', 'https://cral-ares.netlify.app')

      expect(indirizzoDelSito()).toBe('https://cralares.com')
    })
  })

  test('fuori da Netlify un localhost dichiarato resta, per le prove in locale', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SITO_URL', 'http://localhost:3000')
    vi.stubEnv('URL', '')

    expect(indirizzoDelSito()).toBe('http://localhost:3000')
  })
})
