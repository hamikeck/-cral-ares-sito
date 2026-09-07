import type { SupabaseClient } from '@supabase/supabase-js'
import { clientServer } from './supabaseServer'

/**
 * Chi può stare nell'area riservata.
 *
 * Due condizioni, entrambe necessarie: una sessione valida, e un'email che
 * risulti fra i redattori attivi. La seconda la decide il database con
 * `e_redattore()`, non il codice: così la stessa regola vale anche per le
 * politiche RLS, e non c'è modo di aggirarla scrivendo una query diversa.
 */
export async function redattoreAttivoCon(client: SupabaseClient): Promise<boolean> {
  const { data } = await client.auth.getUser()
  if (!data.user) return false

  const { data: autorizzato } = await client.rpc('e_redattore')
  return autorizzato === true
}

export async function redattoreAttivo(): Promise<boolean> {
  return redattoreAttivoCon(await clientServer())
}
