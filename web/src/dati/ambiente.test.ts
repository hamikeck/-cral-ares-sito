import { afterEach, describe, expect, test, vi } from 'vitest'
import { ambiente } from './ambiente'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('ambiente', () => {
  test('restituisce le due variabili quando ci sono', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://esempio.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'chiave-finta')

    expect(ambiente()).toEqual({
      url: 'https://esempio.supabase.co',
      chiaveAnonima: 'chiave-finta',
    })
  })

  test('spiega quale variabile manca, invece di rompersi più avanti', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'chiave-finta')

    expect(() => ambiente()).toThrowError(/NEXT_PUBLIC_SUPABASE_URL/)
  })
})
