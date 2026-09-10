'use client'

import Link from 'next/link'
import { contenutiPagine } from '@/contenuti/pagine'

/**
 * La pagina mostrata quando qualcosa fallisce durante il rendering.
 *
 * Oggi non si vede mai, perché le pagine sono statiche e non leggono nulla.
 * Dalla fase 2 una lettura del database che va storta finisce qui: senza
 * questo file l'utente vedrebbe la schermata predefinita di Next, in inglese,
 * come succedeva per il 404.
 *
 * Il testo non si scusa e non è vago: dice cosa è successo, che non è colpa
 * di chi legge, e cosa può fare adesso.
 */
export default function Errore({ reset }: { error: Error; reset: () => void }) {
  const { titolo, testo, riprova, tornaHome, seContinua } =
    contenutiPagine.errore

  return (
    <div className="flex max-w-2xl flex-col gap-6 text-corpo">
      <h1 className="text-titolo-pagina text-chiaro">{titolo}</h1>
      <p>{testo}</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="azione-oro fuoco-su-scuro rounded-lg px-5 py-3 font-bold"
        >
          {riprova}
        </button>
        <Link
          href="/"
          className="fuoco-su-scuro border border-parete px-5 py-3 font-semibold hover:border-luce"
        >
          {tornaHome}
        </Link>
      </div>
      <p className="text-sm text-tenue">{seContinua}</p>
    </div>
  )
}
