'use client'

import { useActionState } from 'react'
import { richiediAccesso } from '@/app/azioni/accesso'

export function ModuloAccesso() {
  const [stato, azione, inCorso] = useActionState(richiediAccesso, null)

  return (
    <form action={azione} className="mt-8 flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="font-semibold text-inchiostro">
          Il tuo indirizzo email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="fuoco-su-chiaro border border-linea bg-superficie px-3 py-2 text-corpo"
        />
      </div>

      <button
        type="submit"
        disabled={inCorso}
        className="fuoco-su-chiaro border border-blu-profondo bg-blu-profondo px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        {inCorso ? 'Invio in corso…' : 'Mandami il link'}
      </button>

      {stato ? (
        <p role="status" className="border-l-2 border-azzurro bg-fascia px-4 py-3 text-corpo">
          {stato.messaggio}
        </p>
      ) : null}
    </form>
  )
}
