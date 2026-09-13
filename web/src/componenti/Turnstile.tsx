'use client'

import Script from 'next/script'

/**
 * Il widget di Turnstile dentro un modulo.
 *
 * **Non compare se non c'è la chiave pubblica**, e in quel caso il modulo non
 * carica nemmeno lo script di Cloudflare: finché il controllo è spento, il
 * socio non manda una richiesta a un terzo per aprire una pagina del CRAL. È
 * la stessa attenzione per cui i caratteri non passano da Google.
 *
 * Il widget mette da sé un campo nascosto `cf-turnstile-response` nel modulo
 * che lo contiene: la Server Action lo rilegge da lì, e non serve altro
 * codice per collegarli.
 */
export function Turnstile() {
  const chiave = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  if (!chiave) return null

  return (
    <div>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
      />
      {/* `theme=dark` perché il sito sta sul buio: il widget chiaro sarebbe
          l'unico rettangolo bianco della pagina. */}
      <div className="cf-turnstile" data-sitekey={chiave} data-theme="dark" data-language="it" />
    </div>
  )
}
