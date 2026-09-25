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
  const sitoUrl = indirizzoDelSito()

  if (!url) throw new Error('Manca la variabile NEXT_PUBLIC_SUPABASE_URL')
  if (!chiaveAnonima) throw new Error('Manca la variabile NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!sitoUrl) throw new Error('Manca la variabile NEXT_PUBLIC_SITO_URL')

  return { url, chiaveAnonima, sitoUrl }
}

/**
 * L'indirizzo del sito, senza barra finale.
 *
 * In ordine: quello dichiarato in NEXT_PUBLIC_SITO_URL, se è un indirizzo
 * vero; altrimenti quello che Netlify scrive da sé in `URL`, nella build e
 * nelle funzioni; altrimenti, solo fuori produzione, localhost.
 *
 * Il secondo passo esiste per un caso vissuto: il 25 settembre 2026 su
 * Netlify la variabile valeva `http://localhost:3000`, copiata da
 * `.env.local`. Le anteprime su WhatsApp e il testo che i direttori copiano
 * per le email ai soci puntavano al computer di chi li apriva. Un localhost
 * in un posto dove Netlify sa l'indirizzo vero è sempre un errore di
 * copia, quindi si corregge da solo, e lo si dice nei log.
 *
 * Fuori da Netlify `URL` non c'è, e un localhost dichiarato resta: serve alle
 * prove in locale.
 */
export function indirizzoDelSito(): string | undefined {
  const dichiarato = process.env.NEXT_PUBLIC_SITO_URL?.trim()
  const diNetlify = process.env.URL?.trim()
  const locale = (indirizzo: string) => /\/\/(localhost|127\.0\.0\.1)(:|\/|$)/.test(indirizzo)

  let scelto: string | undefined
  if (dichiarato && !(locale(dichiarato) && diNetlify)) {
    scelto = dichiarato
  } else if (diNetlify) {
    if (dichiarato) {
      console.warn(
        `NEXT_PUBLIC_SITO_URL vale ${dichiarato}: uso l'indirizzo di Netlify, ${diNetlify}.`,
      )
    }
    scelto = diNetlify
  } else if (process.env.NODE_ENV !== 'production') {
    scelto = 'http://localhost:3000'
  }

  return scelto?.replace(/\/+$/, '')
}
