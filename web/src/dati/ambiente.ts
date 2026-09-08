/**
 * Le tre variabili che collegano il sito al database e a se stesso.
 *
 * Si leggono qui e in nessun altro punto. Il motivo è il messaggio d'errore:
 * una variabile mancante deve dire il proprio nome subito, all'avvio, e non
 * presentarsi tre schermate dopo come «Invalid URL» — o, per `sitoUrl`,
 * presentarsi come un `http://localhost:3000` copiato in buona fede dal
 * direttore in un'email a 400 soci.
 *
 * Per questo `sitoUrl` ammette il valore di comodo `http://localhost:3000`
 * solo fuori produzione (`NODE_ENV !== 'production'`): in sviluppo la
 * variabile non serve, in produzione la sua assenza deve rompere subito,
 * mai in silenzio.
 */
export function ambiente(): { url: string; chiaveAnonima: string; sitoUrl: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chiaveAnonima = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const sitoUrl =
    process.env.NEXT_PUBLIC_SITO_URL ||
    (process.env.NODE_ENV !== 'production' ? 'http://localhost:3000' : undefined)

  if (!url) throw new Error('Manca la variabile NEXT_PUBLIC_SUPABASE_URL')
  if (!chiaveAnonima) throw new Error('Manca la variabile NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!sitoUrl) throw new Error('Manca la variabile NEXT_PUBLIC_SITO_URL')

  return { url, chiaveAnonima, sitoUrl }
}
