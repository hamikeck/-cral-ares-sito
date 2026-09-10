'use client'

import { useActionState, useMemo, useState } from 'react'
import { aggiungiSocio, rimuoviSocio, type EsitoSocio } from '@/app/azioni/soci'
import type { Socio } from '@/dominio/socio'

/**
 * L'elenco dei soci, con ricerca e aggiunta.
 *
 * Sta sul client per una ragione sola: **la ricerca deve filtrare mentre si
 * scrive.** Con quattrocento righe è la ricerca a essere usata davvero, non lo
 * scorrimento, e un filtro che aspetta il server a ogni lettera si sente. Le
 * righe arrivano già tutte dal Server Component che avvolge questo componente:
 * qui non si interroga niente, si nasconde e si mostra.
 */
export function PannelloSoci({ soci }: { soci: Socio[] }) {
  const [cerca, setCerca] = useState('')

  const trovati = useMemo(() => {
    const chiave = cerca.trim().toLowerCase()
    if (chiave === '') return soci

    // La ricerca guarda i quattro campi che un direttore ha in testa quando
    // cerca qualcuno: come si chiama, dove scrive, che numero ha in Agenzia.
    return soci.filter((socio) =>
      [socio.nome, socio.cognome, socio.email, socio.codiceDipendente]
        .join(' ')
        .toLowerCase()
        .includes(chiave),
    )
  }, [soci, cerca])

  return (
    <div className="flex flex-col gap-8">
      <ModuloNuovoSocio />

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-2xl text-chiaro">
            {soci.length === 1 ? 'Un socio' : `${soci.length} soci`}
          </h2>
          <p className="text-sm text-tenue" aria-live="polite">
            {cerca.trim() === ''
              ? null
              : trovati.length === 0
                ? 'Nessuno corrisponde'
                : `${trovati.length} in elenco`}
          </p>
        </div>

        <label className="mt-4 flex flex-col gap-1">
          <span className="text-sm font-semibold text-chiaro">
            Cerca per nome, email o matricola
          </span>
          <input
            type="search"
            value={cerca}
            onChange={(evento) => setCerca(evento.target.value)}
            className="fuoco-su-scuro rounded-lg border border-parete bg-notte px-3 py-2 text-corpo"
          />
        </label>

        {trovati.length === 0 ? (
          <p className="mt-6 text-corpo">
            {soci.length === 0
              ? 'L’elenco è ancora vuoto. Il primo caricamento lo fa chi si occupa del sito, a partire dal file dell’associazione; da lì in poi si aggiunge e si toglie da qui.'
              : 'Nessun socio corrisponde a quello che hai scritto.'}
          </p>
        ) : (
          <ul className="mt-5 flex flex-col gap-2">
            {trovati.map((socio) => (
              <li key={socio.id} className="pannello flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3">
                <span className="insegna text-lg text-chiaro">
                  {socio.cognome} {socio.nome}
                </span>
                <span className="text-sm text-lettura">{socio.email}</span>
                <span className="text-sm text-tenue">{socio.codiceDipendente}</span>

                <form action={rimuoviSocio} className="ml-auto">
                  <input type="hidden" name="id" value={socio.id} />
                  <button
                    type="submit"
                    className="fuoco-su-scuro rounded text-sm font-semibold text-luce underline underline-offset-4"
                  >
                    Togli
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function ModuloNuovoSocio() {
  const [stato, azione, inCorso] = useActionState<EsitoSocio | null, FormData>(
    aggiungiSocio,
    null,
  )
  const errori = stato?.errori ?? {}

  return (
    <section className="pannello px-5 py-5">
      <h2 className="text-2xl text-chiaro">Aggiungi un socio</h2>

      {stato?.aggiunto ? (
        <p role="status" className="mt-3 text-corpo text-luce">
          {stato.aggiunto} è stato aggiunto all’elenco.
        </p>
      ) : null}

      {errori.modulo ? (
        <p role="alert" className="mt-3 border-l-4 border-arancione bg-notte px-4 py-3 text-corpo">
          {errori.modulo}
        </p>
      ) : null}

      {/* `noValidate` per la stessa ragione del modulo delle offerte: con la
          validazione nativa del browser i messaggi italiani scritti qui sotto
          resterebbero irraggiungibili, perché l'invio verrebbe bloccato prima
          che la Server Action venga chiamata. Un solo canale d'errore. */}
      <form action={azione} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
        <Campo nome="nome" etichetta="Nome" errore={errori.nome} richiesto />
        <Campo nome="cognome" etichetta="Cognome" errore={errori.cognome} richiesto />
        <Campo
          nome="email"
          etichetta="Email"
          tipo="email"
          errore={errori.email}
          richiesto
          aiuto="Quella che il socio ha comunicato al CRAL."
        />
        <Campo
          nome="codiceDipendente"
          etichetta="Matricola"
          errore={errori.codiceDipendente}
          richiesto
        />
        <Campo nome="telefono" etichetta="Telefono (facoltativo)" tipo="tel" />
        <Campo nome="note" etichetta="Note (facoltative)" aiuto="Uso interno: non le vede nessun altro." />

        <p className="sm:col-span-2">
          <button
            type="submit"
            disabled={inCorso}
            className="fuoco-su-scuro rounded-lg border border-luce bg-luce px-4 py-2 font-bold text-notte disabled:opacity-60"
          >
            {inCorso ? 'Aggiungo…' : 'Aggiungi all’elenco'}
          </button>
        </p>
      </form>
    </section>
  )
}

function Campo({
  nome,
  etichetta,
  tipo = 'text',
  errore,
  aiuto,
  richiesto = false,
}: {
  nome: string
  etichetta: string
  tipo?: string
  errore?: string
  aiuto?: string
  richiesto?: boolean
}) {
  const idAiuto = aiuto ? `${nome}-aiuto` : undefined
  const idErrore = errore ? `${nome}-errore` : undefined

  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-chiaro">{etichetta}</span>
      <input
        name={nome}
        type={tipo}
        required={richiesto}
        aria-describedby={[idAiuto, idErrore].filter(Boolean).join(' ') || undefined}
        aria-invalid={errore ? true : undefined}
        className="fuoco-su-scuro rounded-lg border border-parete bg-notte px-3 py-2 text-corpo"
      />
      {aiuto ? (
        <span id={idAiuto} className="text-xs text-tenue">
          {aiuto}
        </span>
      ) : null}
      {errore ? (
        <span id={idErrore} className="text-xs font-semibold text-arancione">
          {errore}
        </span>
      ) : null}
    </label>
  )
}
