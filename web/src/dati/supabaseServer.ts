import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { ambiente } from './ambiente'

/**
 * Il client dell'area riservata: legge la sessione dai cookie.
 *
 * Usarlo rende dinamica la pagina che lo chiama — cosa giusta lì, dove ogni
 * schermata dipende da chi è entrato, e sbagliata sulle pagine pubbliche.
 */
export async function clientServer() {
  const { url, chiaveAnonima } = ambiente()
  const contenitore = await cookies()

  return createServerClient(url, chiaveAnonima, {
    cookies: {
      getAll: () => contenitore.getAll(),
      setAll: (biscotti) => {
        try {
          biscotti.forEach(({ name, value, options }) =>
            contenitore.set(name, value, options),
          )
        } catch {
          // In un Server Component i cookie sono in sola lettura: il rinnovo
          // della sessione lo fa il proxy, che può scriverli.
        }
      },
    },
  })
}
