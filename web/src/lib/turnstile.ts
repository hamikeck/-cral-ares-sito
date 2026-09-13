/**
 * Turnstile, il controllo anti-automazione di Cloudflare.
 *
 * Serve a chiudere un buco che lo spec riconosce (9.3): un modulo che risponde
 * «non risulti fra i soci» è, tecnicamente, un modo per scoprire se un
 * indirizzo appartiene a un dipendente dell'Agenzia — provandone uno alla
 * volta. Da solo vale poco, ma su un ufficio pubblico non è il genere di cosa
 * che si lascia aperta.
 *
 * **Resta spento finché non ci sono le chiavi.** Senza `TURNSTILE_SECRET_KEY`
 * il modulo funziona esattamente come prima: è la stessa scelta fatta per il
 * prezzo dei biglietti e per l'IBAN — quello che manca si dichiara, non si
 * finge.
 */

/** L'esito del controllo, con il motivo quando serve dirlo. */
export type EsitoTurnstile = { passato: true } | { passato: false; motivo: string }

const MESSAGGIO_RIPROVA =
  'Il controllo antispam non è andato a buon fine. Ricarica la pagina e riprova.'

export function turnstileAttivo(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY)
}

/**
 * Verifica il gettone che il widget ha messo nel modulo.
 *
 * Due esiti negativi diversi, e la differenza è una scelta:
 *
 * - **Gettone mancante o rifiutato** — si blocca. È il caso per cui il
 *   controllo esiste.
 * - **Cloudflare non risponde** — si lascia passare, e si scrive nei log. Un
 *   guasto di un servizio terzo non deve impedire a un socio di chiedere
 *   quattro biglietti: il valore che protegge è basso, il danno di un modulo
 *   fermo è certo. È una scelta consapevole, non una dimenticanza.
 */
export async function verificaTurnstile(gettone: string, ip?: string): Promise<EsitoTurnstile> {
  const segreto = process.env.TURNSTILE_SECRET_KEY
  if (!segreto) return { passato: true }

  if (!gettone) return { passato: false, motivo: MESSAGGIO_RIPROVA }

  const corpo = new URLSearchParams({ secret: segreto, response: gettone })
  if (ip) corpo.set('remoteip', ip)

  try {
    const risposta = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: corpo,
    })
    const esito = (await risposta.json()) as { success?: boolean; 'error-codes'?: string[] }

    if (esito.success) return { passato: true }

    console.warn('Turnstile ha rifiutato un invio:', esito['error-codes'])
    return { passato: false, motivo: MESSAGGIO_RIPROVA }
  } catch (errore) {
    console.error('Turnstile non raggiungibile, invio lasciato passare:', errore)
    return { passato: true }
  }
}
