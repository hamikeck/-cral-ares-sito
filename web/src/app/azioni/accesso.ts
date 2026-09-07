'use server'

import { clientServer } from '@/dati/supabaseServer'

const RISPOSTA_NEUTRA =
  'Se l’indirizzo è fra quelli autorizzati, fra poco arriva un’email con il link per entrare. Il link vale una volta sola e scade dopo un’ora.'

/**
 * Chiede il link di accesso.
 *
 * Risponde **sempre la stessa cosa**, che l'indirizzo sia autorizzato o no.
 * Un modulo che distingue i due casi è, di fatto, uno strumento per scoprire
 * chi fa parte del direttivo: costa niente non offrirlo.
 */
export async function richiediAccesso(
  _statoPrecedente: { messaggio: string } | null,
  datiModulo: FormData,
): Promise<{ messaggio: string }> {
  const email = String(datiModulo.get('email') ?? '').trim()

  if (!email.includes('@')) {
    return { messaggio: 'Scrivi un indirizzo email per ricevere il link.' }
  }

  const client = await clientServer()
  await client.auth.signInWithOtp({
    email,
    options: {
      // Nessun account nuovo: i direttori si invitano dal pannello Supabase.
      // Un indirizzo sconosciuto riceve un errore, che qui viene ignorato.
      shouldCreateUser: false,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITO_URL ?? 'http://localhost:3000'}/area-riservata/callback`,
    },
  })

  return { messaggio: RISPOSTA_NEUTRA }
}
