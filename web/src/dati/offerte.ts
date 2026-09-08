import type { SupabaseClient } from '@supabase/supabase-js'
import type { Offerta } from '@/dominio/offerta'
import { oggi } from '@/lib/date'
import { mappaOfferta } from './mappaOfferta'
import { COLONNE_OFFERTA, type RigaOfferta } from './righe'
import { clientPubblico } from './supabasePubblico'

/**
 * La sola porta verso la tabella `offerte` per le pagine pubbliche.
 *
 * Il client si può passare dall'esterno: serve ai test, che gliene danno uno
 * finto invece di parlare con la rete.
 */

function fallisci(messaggio: string, dettaglio: string): never {
  throw new Error(`${messaggio} (${dettaglio})`)
}

/**
 * Le offerte che il socio deve vedere: pubblicate, iniziate e non scadute.
 *
 * È la promessa dello spec — «le offerte scadute spariscono da sole» — e non
 * si mantiene con la buona volontà di chi pubblica: si mantiene qui, nella
 * sola funzione da cui gli elenchi passano.
 */
export async function offerteValide(
  adesso = oggi(),
  client: SupabaseClient = clientPubblico(),
): Promise<Offerta[]> {
  const { data, error } = await client
    .from('offerte')
    .select(COLONNE_OFFERTA)
    .eq('stato', 'pubblicata')
    .lte('valida_dal', adesso)
    // Una convenzione permanente ha `valida_al` nullo: `.gte` da solo la
    // escluderebbe, perché in SQL confrontare NULL con qualunque cosa non dà
    // mai vero. L'`.or` la lascia passare esplicitamente, invece di farla
    // sparire dal sito insieme a quelle davvero scadute.
    .or(`valida_al.is.null,valida_al.gte.${adesso}`)
    .order('valida_al', { ascending: true })

  if (error) fallisci('Non è stato possibile leggere le offerte', error.message)

  return (data as unknown as RigaOfferta[]).map(mappaOfferta)
}

/**
 * Cerca per slug **senza filtrare per data**.
 *
 * Deliberato: la scheda di un'offerta finita resta raggiungibile, perché chi
 * apre un vecchio collegamento ricevuto per email deve trovare «questa offerta
 * è terminata» e non una pagina di errore.
 */
export async function offertaDaSlug(
  slug: string,
  client: SupabaseClient = clientPubblico(),
): Promise<Offerta | undefined> {
  const { data, error } = await client
    .from('offerte')
    .select(COLONNE_OFFERTA)
    .eq('stato', 'pubblicata')
    .eq('slug', slug)
    .maybeSingle()

  if (error) fallisci('Non è stato possibile leggere l’offerta', error.message)
  if (!data) return undefined

  return mappaOfferta(data as unknown as RigaOfferta)
}

/** Gli slug da pre-generare alla build. Comprende le offerte già scadute. */
export async function slugPubblicati(
  client: SupabaseClient = clientPubblico(),
): Promise<string[]> {
  const { data, error } = await client
    .from('offerte')
    .select('slug')
    .eq('stato', 'pubblicata')
    .order('valida_al', { ascending: false })

  if (error) fallisci('Non è stato possibile elencare le offerte', error.message)

  return (data as { slug: string }[]).map((riga) => riga.slug)
}
