import type { Offerta } from '@/dominio/offerta'
import { mappaOfferta } from './mappaOfferta'
import { COLONNE_OFFERTA, type RigaOfferta } from './righe'
import { clientServer } from './supabaseServer'

export type OffertaRiservata = Offerta & { id: string; stato: 'bozza' | 'pubblicata' }

const COLONNE = `id, ${COLONNE_OFFERTA}`

/**
 * Tutte le offerte, bozze comprese.
 *
 * Le bozze arrivano solo perché la sessione è di un redattore: la politica RLS
 * «i redattori leggono tutto» le lascia passare, l'anonimo vedrebbe le stesse
 * righe della pagina pubblica anche chiamando questa funzione.
 */
export async function tutteLeOfferte(): Promise<OffertaRiservata[]> {
  const client = await clientServer()
  const { data, error } = await client
    .from('offerte')
    .select(COLONNE)
    .order('aggiornata_il', { ascending: false })

  if (error) {
    throw new Error(`Non è stato possibile leggere le offerte (${error.message})`)
  }

  return (data as unknown as (RigaOfferta & { id: string })[]).map((riga) => ({
    ...mappaOfferta(riga),
    id: riga.id,
    stato: riga.stato,
  }))
}

/** Una sola offerta, per la pagina di modifica. */
export async function offertaPerId(id: string): Promise<OffertaRiservata | undefined> {
  const client = await clientServer()
  const { data, error } = await client
    .from('offerte')
    .select(COLONNE)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`Non è stato possibile leggere l’offerta (${error.message})`)
  }
  if (!data) return undefined

  const riga = data as unknown as RigaOfferta & { id: string }
  return { ...mappaOfferta(riga), id: riga.id, stato: riga.stato }
}
