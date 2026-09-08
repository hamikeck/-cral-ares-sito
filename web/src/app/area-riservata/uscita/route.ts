import { NextResponse } from 'next/server'
import { clientServer } from '@/dati/supabaseServer'

/**
 * Chiude la sessione di chi non è (più) un redattore autorizzato.
 *
 * Non sta nel guscio protetto, e non potrebbe: il guscio è un layout, cioè
 * un Server Component, e un Server Component legge i cookie ma non può
 * scriverli — `supabaseServer.ts` intercetta in silenzio proprio quell'
 * errore di scrittura. Un `signOut()` chiamato da lì revocherebbe la sessione
 * su Supabase ma lascerebbe il cookie intatto nel browser. Un Route Handler,
 * come questo, può scrivere i cookie della risposta: è per questo che
 * l'uscita vera sta qui, e non nel layout.
 *
 * Sta fuori dal gruppo di rotte `(interno)`, accanto ad `accedi/` e
 * `callback/`: se fosse dentro il guscio, chi non è autorizzato — cioè
 * proprio chi deve raggiungere questa pagina — non potrebbe mai arrivarci.
 *
 * Ci arrivano due tipi di richiesta: il guscio che espelle chi ha una
 * sessione ma non è un redattore, e un direttore che preme «Esci» di sua
 * volontà. Solo il primo caso è un «non autorizzato» — per questo il
 * parametro viene inoltrato quando c'è, non aggiunto sempre: altrimenti chi
 * esce volontariamente leggerebbe un avviso falso alla pagina di accesso.
 */
export async function GET(richiesta: Request) {
  const client = await clientServer()
  await client.auth.signOut()

  const nonAutorizzato = new URL(richiesta.url).searchParams.get('nonAutorizzato')
  const destinazione = new URL('/area-riservata/accedi', richiesta.url)
  if (nonAutorizzato) destinazione.searchParams.set('nonAutorizzato', nonAutorizzato)

  return NextResponse.redirect(destinazione)
}
