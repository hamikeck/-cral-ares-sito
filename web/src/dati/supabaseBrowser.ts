import { createBrowserClient } from '@supabase/ssr'
import { ambiente } from './ambiente'

/** Il client dei Client Component. Serve alla richiesta del link di accesso. */
export function clientBrowser() {
  const { url, chiaveAnonima } = ambiente()
  return createBrowserClient(url, chiaveAnonima)
}
