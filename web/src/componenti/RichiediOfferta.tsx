'use client'

import { useActionState } from 'react'
import { inviaRichiestaOfferta, type EsitoRichiesta } from '@/app/azioni/richieste'
import type { Offerta } from '@/dominio/offerta'
import { Campo } from './Campo'
import { ConfermaRichiesta } from './ConfermaRichiesta'
import { DatiSocio } from './DatiSocio'
import { Turnstile } from './Turnstile'

/**
 * La richiesta che parte dalla scheda di un'offerta.
 *
 * È il percorso migliore, perché **l'offerta è già scelta**: il socio arriva
 * dal link ricevuto per email e non deve selezionare niente. Sopra ai dati
 * comuni cambia solo cosa si chiede, e lo decide la modalità dell'offerta —
 * qui per disegnare il modulo, e di nuovo sul server per validarlo, dove la
 * modalità viene riletta dal database e non da questo modulo.
 */
export function RichiediOfferta({ offerta }: { offerta: Offerta }) {
  const [stato, azione, inCorso] = useActionState<EsitoRichiesta | null, FormData>(
    inviaRichiestaOfferta,
    null,
  )
  const errori = stato?.errori ?? {}
  const perBiglietti = offerta.modalita === 'biglietti'

  if (stato?.inviata) return <ConfermaRichiesta esito={stato.inviata} />

  return (
    <form action={azione} noValidate className="flex flex-col gap-8">
      <input type="hidden" name="slug" value={offerta.slug} />

      {errori.modulo ? (
        <p role="alert" className="border-l-4 border-arancione bg-pannello px-4 py-3 text-corpo">
          {errori.modulo}
        </p>
      ) : null}

      {perBiglietti ? (
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 text-2xl text-chiaro">Cosa ti serve</legend>

          <div className="sm:max-w-3xs">
            <Campo
              nome="quantita"
              etichetta="Quanti posti"
              tipo="number"
              inputMode="numeric"
              valore="2"
              errore={errori.quantita}
              richiesto
            />
          </div>

          {/* Tre campi facoltativi, e restano facoltativi apposta: un'offerta
              in abbonamento non ha una serata, e chiederla obbligherebbe a
              inventarne una. Chi ha una data in mente la scrive. */}
          <Campo
            nome="titoloEvento"
            etichetta="Quale spettacolo o evento"
            errore={errori.titoloEvento}
            aiuto="Se l’offerta ne comprende più di uno."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo nome="dataPreferita" etichetta="Data preferita" tipo="date" />
            <Campo
              nome="orarioPreferito"
              etichetta="Orario preferito"
              aiuto="Per esempio «sera» o «21:00»."
            />
          </div>
        </fieldset>
      ) : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="messaggio" className="text-sm font-semibold text-chiaro">
          {perBiglietti ? (
            <>
              Vuoi aggiungere qualcosa?{' '}
              <span className="font-normal text-tenue">(facoltativo)</span>
            </>
          ) : (
            'Cosa vuoi sapere'
          )}
        </label>
        <textarea
          id="messaggio"
          name="messaggio"
          rows={3}
          required={!perBiglietti}
          aria-describedby={errori.messaggio ? 'messaggio-errore' : undefined}
          aria-invalid={errori.messaggio ? true : undefined}
          className="fuoco-su-scuro rounded-lg border border-parete bg-notte px-3 py-2 text-corpo"
        />
        {errori.messaggio ? (
          <span id="messaggio-errore" className="text-xs font-semibold text-arancione">
            {errori.messaggio}
          </span>
        ) : null}
      </div>

      <DatiSocio errori={errori} />

      {/* Come pagare si chiede solo dove c'è qualcosa da pagare. Per una
          convenzione non si sa nemmeno ancora se esiste. */}
      {perBiglietti ? (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-2xl text-chiaro">Come paghi</legend>
          <div className="flex flex-col gap-2">
            {(
              [
                ['bonifico', 'Cedolino', 'Ti arrivano IBAN, importo e causale già scritti.'],
                [
                  'busta_paga',
                  'Trattenuta in busta paga',
                  'L’importo ti viene trattenuto dallo stipendio.',
                ],
              ] as const
            ).map(([valore, etichetta, spiegazione], indice) => (
              <label
                key={valore}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-parete px-3 py-2.5 has-checked:border-luce/70 has-checked:bg-luce/10"
              >
                <input
                  type="radio"
                  name="pagamento"
                  value={valore}
                  defaultChecked={indice === 0}
                  className="fuoco-su-scuro mt-1 size-4"
                />
                <span>
                  <span className="block text-corpo text-chiaro">{etichetta}</span>
                  <span className="block text-sm text-tenue">{spiegazione}</span>
                </span>
              </label>
            ))}
          </div>
          {errori.pagamento ? (
            <span className="text-xs font-semibold text-arancione">{errori.pagamento}</span>
          ) : null}
        </fieldset>
      ) : null}

      <Turnstile />

      <p>
        <button
          type="submit"
          disabled={inCorso}
          className="azione-oro fuoco-su-scuro w-full rounded-lg py-3 font-bold disabled:opacity-60 sm:w-auto sm:px-8"
        >
          {inCorso ? 'Invio…' : perBiglietti ? 'Richiedi i posti' : 'Invia la richiesta'}
        </button>
      </p>
    </form>
  )
}
