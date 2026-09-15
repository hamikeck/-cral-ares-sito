'use client'

import { useActionState } from 'react'
import { inviaRichiestaConvenzione, type EsitoRichiesta } from '@/app/azioni/richieste'
import { Campo } from './Campo'
import { DatiSocio } from './DatiSocio'
import { Turnstile } from './Turnstile'

/**
 * Il modulo delle convenzioni.
 *
 * Due campi liberi, per scelta del direttivo: le convenzioni sono eterogenee e
 * un elenco chiuso ne lascerebbe fuori troppe. Il socio può chiedere anche
 * qualcosa che il CRAL non ha ancora — è così che i direttori scoprono cosa
 * cercare.
 */
export function ModuloConvenzione() {
  const [stato, azione, inCorso] = useActionState<EsitoRichiesta | null, FormData>(
    inviaRichiestaConvenzione,
    null,
  )
  const errori = stato?.errori ?? {}

  if (stato?.inviata) {
    return (
      <div className="pannello border-luce/70 px-5 py-6">
        <h2 className="text-2xl text-chiaro">La richiesta è partita.</h2>
        <p className="mt-3 text-corpo text-lettura">
          Ti risponde un direttore, non un sistema automatico. Se la convenzione che hai chiesto
          non c’è ancora, te lo dirà — e saprà che qualcuno la cerca.
        </p>
      </div>
    )
  }

  return (
    <form action={azione} noValidate className="flex flex-col gap-8">
      {errori.modulo ? (
        <p role="alert" className="border-l-4 border-arancione bg-pannello px-4 py-3 text-corpo">
          {errori.modulo}
        </p>
      ) : null}

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-2xl text-chiaro">Cosa ti serve</legend>

        <Campo
          nome="convenzione"
          etichetta="Di quale convenzione hai bisogno?"
          errore={errori.convenzione}
          richiesto
          aiuto="Anche con parole tue: «gommista», «palestra», «dentista»."
        />

        <div className="flex flex-col gap-1">
          <label htmlFor="messaggio" className="text-sm font-semibold text-chiaro">
            Cosa ti serve, in due righe
          </label>
          <textarea
            id="messaggio"
            name="messaggio"
            rows={4}
            required
            aria-describedby={errori.messaggio ? 'messaggio-errore' : 'messaggio-aiuto'}
            aria-invalid={errori.messaggio ? true : undefined}
            className="fuoco-su-scuro rounded-lg border border-cornice bg-notte px-3 py-2 text-corpo"
          />
          {errori.messaggio ? (
            <span id="messaggio-errore" className="text-xs font-semibold text-arancione">
              {errori.messaggio}
            </span>
          ) : (
            <span id="messaggio-aiuto" className="text-xs text-tenue">
              Più sei preciso, meno telefonate servono dopo.
            </span>
          )}
        </div>
      </fieldset>

      <DatiSocio errori={errori} />

      <Turnstile />

      <p>
        <button
          type="submit"
          disabled={inCorso}
          className="azione-oro fuoco-su-scuro w-full rounded-lg py-3 font-bold disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {inCorso ? 'Invio…' : 'Invia la richiesta'}
        </button>
      </p>
    </form>
  )
}
