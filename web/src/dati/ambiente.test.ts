import { afterEach, describe, expect, test, vi } from 'vitest'
import { ambiente } from './ambiente'

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

    expect(() => ambiente()).toThrowError(/NEXT_PUBLIC_SITO_URL/)
  })
})
