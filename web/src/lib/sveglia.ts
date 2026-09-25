/**
 * Tiene sveglio il progetto Supabase.
 *
 * Sul piano gratuito Supabase sospende il progetto dopo sette giorni senza
 * richieste al database, e da quel momento il sito non salva più richieste
 * né apre l'area riservata finché qualcuno non lo riattiva a mano dal
 * pannello. Visitare il sito non basta, perché le pagine pubbliche sono
 * statiche e non interrogano il database. In un agosto tranquillo, o in una
 * settimana senza offerte nuove, succederebbe senza che nessuno se ne
 * accorga.
 *
 * La lettura è la più piccola possibile: un solo id da `circuiti`, tabella
 * leggibile da chiunque (migrazione 0006). Nessun dato personale passa di qui.
 *
 * La chiama ogni giorno `netlify/functions/sveglia-database.mts`. Una volta al
 * giorno lascia sei tentativi di margine prima della soglia dei sette giorni.
 */
type Ambiente = Record<string, string | undefined>

export async function svegliaIlDatabase(
  ambiente: Ambiente,
  chiama: typeof fetch = fetch,
): Promise<void> {
  const url = ambiente.NEXT_PUBLIC_SUPABASE_URL
  const chiave = ambiente.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url) throw new Error('Manca la variabile NEXT_PUBLIC_SUPABASE_URL')
  if (!chiave) throw new Error('Manca la variabile NEXT_PUBLIC_SUPABASE_ANON_KEY')

  const risposta = await chiama(`${url}/rest/v1/circuiti?select=id&limit=1`, {
    headers: { apikey: chiave, Authorization: `Bearer ${chiave}` },
  })

  // Un errore deve risultare come esecuzione fallita nei log di Netlify: è
  // l'unico segnale che il progetto si è fermato lo stesso.
  if (!risposta.ok) {
    throw new Error(`Il database ha risposto ${risposta.status}: il progetto potrebbe essere sospeso.`)
  }
}
