/**
 * Le intestazioni di sicurezza delle pagine.
 *
 * Stavano solo in `netlify.toml`, e lì arrivavano ai file statici ma non
 * all'HTML: le pagine le serve la funzione del runtime Next, che le regole
 * del `netlify.toml` non le applica. Misurato sul sito in produzione il 22
 * settembre 2026 — `/partner/teatro-bellini.png` aveva la politica dei
 * contenuti, `/`, `/privacy` e `/offerte` no. Cioè c'era sul PNG e mancava
 * dove serve.
 *
 * Da qui passano invece per `headers()` in `next.config.ts`, che le mette
 * sulle risposte di Next. Il `netlify.toml` resta com'è e continua a coprire
 * ciò che serve la CDN: caratteri, immagini e — non è un dettaglio — i due
 * SVG del marchio, che aperti per il loro indirizzo sono documenti a tutti
 * gli effetti.
 *
 * **Le due copie devono restare identiche**, e non è affidato alla buona
 * memoria: `intestazioniSicurezza.test.ts` legge il `netlify.toml` e fallisce
 * se una delle due cambia da sola.
 *
 * Due intestazioni del `netlify.toml` non sono qui, ed è deliberato:
 *
 * - `Strict-Transport-Security`: Netlify la mette da sé sulle pagine, e con
 *   `preload`, che è più della nostra. Ripeterla significherebbe mandarne due
 *   e lasciare al caso quale vince — la più debole, se arrivasse prima.
 * - `Cache-Control` dei caratteri: riguarda file che serve la CDN, non Next.
 */
export const INTESTAZIONI_SICUREZZA = [
  /**
   * Il sito non carica nulla da fuori: i caratteri sono installati in
   * public/font/, non c'è analisi del traffico. L'unico servizio esterno è il
   * progetto Supabase dell'area riservata, nominato per esteso — mai con un
   * carattere jolly, che vanificherebbe il senso della direttiva.
   *
   * `script-src` ammette 'unsafe-inline' perché Next inserisce nella pagina i
   * dati di idratazione come script in linea. Toglierlo richiede i nonce e un
   * middleware, che costringerebbe ogni pagina a essere generata su richiesta
   * invece che staticamente. `script-src-attr 'none'` chiude la parte che non
   * serve a Next: gli attributi evento. Rivalutato il 24 settembre 2026, vedi
   * `docs/decisioni.md`.
   *
   * Turnstile, quando si accende, richiede `https://challenges.cloudflare.com`
   * in `script-src` e `frame-src`: qui e nel `netlify.toml`.
   */
  {
    key: 'Content-Security-Policy',
    value:
      "default-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; " +
      "object-src 'none'; img-src 'self' data:; font-src 'self'; style-src 'self' 'unsafe-inline'; " +
      "script-src 'self' 'unsafe-inline'; script-src-attr 'none'; connect-src 'self' https://mfwtepgynxcypzetblwc.supabase.co; " +
      'upgrade-insecure-requests',
  },

  /**
   * Il sito non va incorniciato in pagine altrui: è la difesa contro il
   * clickjacking, e vale doppio su un sito legato alla pubblica
   * amministrazione, dove una copia incorniciata è un ottimo inganno.
   * `frame-ancestors` nella politica sopra dice la stessa cosa ai browser
   * recenti; questa resta per i vecchi.
   */
  { key: 'X-Frame-Options', value: 'DENY' },

  /** Il browser non deve indovinare il tipo di un file. */
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  /**
   * Uscendo verso il sito di un convenzionato non gli diciamo da quale
   * pagina arriva il socio, solo che arriva dal nostro dominio.
   */
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  /**
   * Nessuna di queste capacità serve al sito. Dichiararlo impedisce che una
   * pagina compromessa possa chiederle.
   */
  {
    key: 'Permissions-Policy',
    value:
      'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  },
] as const
