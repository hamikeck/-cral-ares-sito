/**
 * Le due variabili che collegano il sito al database.
 *
 * Si leggono qui e in nessun altro punto. Il motivo è il messaggio d'errore:
 * una variabile mancante deve dire il proprio nome subito, all'avvio, e non
 * presentarsi tre schermate dopo come «Invalid URL».
 */
export function ambiente(): { url: string; chiaveAnonima: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chiaveAnonima = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) throw new Error('Manca la variabile NEXT_PUBLIC_SUPABASE_URL')
  if (!chiaveAnonima) throw new Error('Manca la variabile NEXT_PUBLIC_SUPABASE_ANON_KEY')

  return { url, chiaveAnonima }
}
