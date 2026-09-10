'use client'

import { contenutiPagine } from '@/contenuti/pagine'
import './globals.css'

/**
 * L'ultima rete di sicurezza: un errore nel layout radice.
 *
 * Qui il layout del sito non esiste — è proprio ciò che è fallito — quindi
 * questo file deve dichiarare da sé `html` e `body`, e non può contare su
 * intestazione e piè di pagina. Resta in italiano e resta leggibile: è il
 * minimo che un utente merita nel caso peggiore.
 */
export default function ErroreGlobale({ reset }: { error: Error; reset: () => void }) {
  const { titolo, testo, riprova } = contenutiPagine.errore

  return (
    <html lang="it">
      <body className="bg-notte text-chiaro antialiased">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-16 text-corpo">
          <h1 className="text-titolo-pagina">{titolo}</h1>
          <p>{testo}</p>
          <p>
            <button
              type="button"
              onClick={reset}
              className="fuoco-su-scuro rounded-lg bg-luce px-5 py-3 font-bold text-notte hover:bg-azzurro"
            >
              {riprova}
            </button>
          </p>
        </div>
      </body>
    </html>
  )
}
