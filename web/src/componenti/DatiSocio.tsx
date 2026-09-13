'use client'

import { useState } from 'react'
import { Campo } from './Campo'
import { type Consegna } from '@/dominio/richiestaSchema'

/**
 * Il blocco dei dati del socio, uguale in tutti e tre i moduli di richiesta.
 *
 * Sta sotto la parte che cambia — il circuito e la quantità per il cinema, il
 * testo libero per una convenzione — ed è sempre lo stesso: chi ha già chiesto
 * una volta ritrova le stesse domande nello stesso ordine.
 *
 * **L'identità e la consegna sono due cose diverse**, ed è la decisione che
 * regge la sicurezza di tutto il modulo. L'email aziendale dice *chi sei* e
 * viene confrontata con l'anagrafica; dove ricevere è una domanda a parte.
 * Finché le due coincidevano bastava indovinare una matricola per farsi
 * mandare i biglietti di un collega a casa propria.
 */
export function DatiSocio({ errori }: { errori: Record<string, string> }) {
  const [consegna, setConsegna] = useState<Consegna>('email_aziendale')

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 text-2xl text-chiaro">Chi sei</legend>

        <Campo nome="nome" etichetta="Nome" errore={errori.nome} richiesto autoComplete="given-name" />
        <Campo
          nome="cognome"
          etichetta="Cognome"
          errore={errori.cognome}
          richiesto
          autoComplete="family-name"
        />
        <Campo
          nome="codiceDipendente"
          etichetta="Matricola"
          errore={errori.codiceDipendente}
          richiesto
        />
        <Campo
          nome="email"
          etichetta="Email aziendale"
          tipo="email"
          inputMode="email"
          autoComplete="email"
          errore={errori.email}
          richiesto
          aiuto="Quella che hai comunicato al CRAL: serve a riconoscerti."
        />
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-2xl text-chiaro">Dove vuoi ricevere</legend>
        <p className="mb-3 text-sm text-tenue">
          Puoi farti mandare quello che chiedi anche fuori dall’ufficio.
        </p>

        <div className="flex flex-col gap-2">
          <Scelta
            valore="email_aziendale"
            scelta={consegna}
            cambia={setConsegna}
            etichetta="Sull’email aziendale"
          />
          <Scelta
            valore="email_personale"
            scelta={consegna}
            cambia={setConsegna}
            etichetta="Su un’altra email"
          />
          <Scelta
            valore="whatsapp"
            scelta={consegna}
            cambia={setConsegna}
            etichetta="Su WhatsApp"
          />
        </div>

        {/* Il campo compare solo per la strada scelta: chiederli tutti e tre
            insieme allungherebbe il modulo con due domande che non servono. */}
        {consegna === 'email_personale' ? (
          <div className="mt-3 sm:max-w-sm">
            <Campo
              nome="emailPersonale"
              etichetta="L’altra email"
              tipo="email"
              inputMode="email"
              errore={errori.emailPersonale}
            />
          </div>
        ) : null}

        {consegna === 'whatsapp' ? (
          <div className="mt-3 sm:max-w-sm">
            <Campo
              nome="telefono"
              etichetta="Numero WhatsApp"
              tipo="tel"
              inputMode="tel"
              autoComplete="tel"
              errore={errori.telefono}
              aiuto="Te lo scrive un direttore, non un sistema automatico."
            />
          </div>
        ) : null}
      </fieldset>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="consensoPrivacy"
          className="fuoco-su-scuro mt-1 size-4 shrink-0 rounded border border-parete"
          aria-describedby={errori.consensoPrivacy ? 'consenso-errore' : undefined}
          aria-invalid={errori.consensoPrivacy ? true : undefined}
        />
        <span className="text-sm text-lettura">
          Acconsento al trattamento dei miei dati per gestire questa richiesta.{' '}
          <a
            href="/privacy"
            className="fuoco-su-scuro rounded font-semibold text-luce underline underline-offset-4"
          >
            Come li trattiamo
          </a>
          {errori.consensoPrivacy ? (
            <span id="consenso-errore" className="mt-1 block font-semibold text-arancione">
              {errori.consensoPrivacy}
            </span>
          ) : null}
        </span>
      </label>
    </div>
  )
}

function Scelta({
  valore,
  scelta,
  cambia,
  etichetta,
}: {
  valore: Consegna
  scelta: Consegna
  cambia: (valore: Consegna) => void
  etichetta: string
}) {
  const attiva = scelta === valore

  return (
    <label
      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-corpo ${
        attiva ? 'border-luce/70 bg-luce/10' : 'border-parete'
      }`}
    >
      <input
        type="radio"
        name="consegna"
        value={valore}
        checked={attiva}
        onChange={() => cambia(valore)}
        className="fuoco-su-scuro size-4"
      />
      {etichetta}
    </label>
  )
}
