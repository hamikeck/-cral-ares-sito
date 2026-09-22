import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { INTESTAZIONI_SICUREZZA } from './intestazioniSicurezza'

/**
 * Le stesse intestazioni sono scritte in due posti — qui per le pagine, nel
 * `netlify.toml` per i file che serve la CDN — e due copie di una stringa
 * lunga come la politica dei contenuti divergono alla prima modifica fatta di
 * fretta. Questa prova legge il file di Netlify e le confronta: se qualcuno
 * aggiunge un dominio da una parte sola, fallisce qui invece che in
 * produzione, dove si sarebbe visto solo come una risorsa che non carica.
 */
const netlify = readFileSync(join(process.cwd(), '..', 'netlify.toml'), 'utf8')

/** Il valore di un'intestazione nel `netlify.toml`, virgolette escluse. */
function valoreNelToml(chiave: string): string | undefined {
  const riga = netlify.match(new RegExp(`^\\s*${chiave} = "(.*)"$`, 'm'))
  return riga?.[1]
}

describe('intestazioni di sicurezza', () => {
  test.each(INTESTAZIONI_SICUREZZA.map((i) => [i.key, i.value] as const))(
    '%s dice la stessa cosa nel netlify.toml',
    (chiave, valore) => {
      expect(valoreNelToml(chiave)).toBe(valore)
    },
  )

  test('la politica dei contenuti nomina il progetto Supabase per esteso', () => {
    // Un carattere jolly in `connect-src` vanificherebbe la direttiva, ed è
    // la scorciatoia che si prende quando qualcosa non carica.
    const politica = INTESTAZIONI_SICUREZZA.find(
      (i) => i.key === 'Content-Security-Policy',
    )?.value

    expect(politica).toContain('connect-src')
    expect(politica).toMatch(/connect-src 'self' https:\/\/[a-z0-9]+\.supabase\.co/)
    expect(politica).not.toContain('*')
  })

  test('non ripete lo Strict-Transport-Security, che lo manda già Netlify', () => {
    // Netlify la mette da sé sulle pagine, e con `preload`. Mandarne due
    // lascerebbe al caso quale vince, e la nostra è la più debole.
    expect(INTESTAZIONI_SICUREZZA.map((i) => i.key)).not.toContain(
      'Strict-Transport-Security',
    )
    // Nel netlify.toml però ci sta, e copre i file statici.
    expect(valoreNelToml('Strict-Transport-Security')).toBe(
      'max-age=31536000; includeSubDomains',
    )
  })
})
