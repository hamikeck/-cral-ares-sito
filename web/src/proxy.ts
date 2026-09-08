import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { ambiente } from '@/dati/ambiente'

/**
 * Rinnova la sessione a ogni visita dell'area riservata.
 *
 * Serve perché un Server Component può leggere i cookie ma non scriverli: se
 * il token scade mentre il direttore compila un'offerta, è qui che viene
 * rinnovato. Il `matcher` limita il proxy all'area riservata, così le pagine
 * pubbliche restano statiche.
 *
 * Si chiama `proxy` e non `middleware`: in Next 16 il file `middleware.ts` è
 * deprecato e rinominato `proxy.ts`, con la funzione esportata che segue il
 * nome del file. Il comportamento è identico.
 */
export async function proxy(richiesta: NextRequest) {
  let risposta = NextResponse.next({ request: richiesta })

  const { url, chiaveAnonima } = ambiente()
  const client = createServerClient(url, chiaveAnonima, {
    cookies: {
      getAll: () => richiesta.cookies.getAll(),
      setAll: (biscotti) => {
        biscotti.forEach(({ name, value }) => richiesta.cookies.set(name, value))
        risposta = NextResponse.next({ request: richiesta })
        biscotti.forEach(({ name, value, options }) =>
          risposta.cookies.set(name, value, options),
        )
      },
    },
  })

  await client.auth.getUser()

  return risposta
}

export const config = {
  matcher: ['/area-riservata/:path*'],
}
