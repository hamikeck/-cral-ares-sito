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
 */
export async function GET(richiesta: Request) {
  const client = await clientServer()
  await client.auth.signOut()

  return NextResponse.redirect(
    new URL('/area-riservata/accedi?nonAutorizzato=1', richiesta.url),
  )
}
