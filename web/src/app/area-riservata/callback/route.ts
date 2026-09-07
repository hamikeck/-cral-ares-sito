import { NextResponse } from 'next/server'
import { clientServer } from '@/dati/supabaseServer'

/** Il link ricevuto per email finisce qui: si scambia il codice con la sessione. */
export async function GET(richiesta: Request) {
  const indirizzo = new URL(richiesta.url)
  const codice = indirizzo.searchParams.get('code')

  if (!codice) {
    return NextResponse.redirect(new URL('/area-riservata/accedi', indirizzo))
  }

  const client = await clientServer()
  const { error } = await client.auth.exchangeCodeForSession(codice)

  if (error) {
    return NextResponse.redirect(new URL('/area-riservata/accedi', indirizzo))
  }

  return NextResponse.redirect(new URL('/area-riservata', indirizzo))
}
