'use client'

import { useMemo, useState } from 'react'
import {
  comePaga,
  cosaChiede,
  CONSEGNE_LEGGIBILI,
  type Richiesta,
} from '@/dominio/richiesta'
import { formattaData } from '@/lib/date'

/**
 * L'elenco delle richieste, in sola lettura.
 *
 * Non ci sono stati né pulsanti: l'esito lo gestiscono i direttori
 * rispondendo all'email, ed è una scelta del direttivo. Con questi volumi un
 * flusso di approvazione sarebbe burocrazia che nessuno compila, e una
 * richiesta segnata «in lavorazione» da tre mesi direbbe meno di niente.
 *
 * Sta sul client per la ricerca, che deve filtrare mentre si scrive.
 */
export function ElencoRichieste({ richieste }: { richieste: Richiesta[] }) {
  const [cerca, setCerca] = useState('')
  const [soloNonAnnunciate, setSoloNonAnnunciate] = useState(false)

  const nonAnnunciate = richieste.filter((r) => !r.avvisoInviato).length

  const trovate = useMemo(() => {
    const chiave = cerca.trim().toLowerCase()
    return richieste.filter((r) => {
      if (soloNonAnnunciate && r.avvisoInviato) return false
      if (chiave === '') return true
      return [r.numero, r.nome, r.cognome, r.codiceDipendente, r.email, cosaChiede(r)]
        .join(' ')
        .toLowerCase()
        .includes(chiave)
    })
  }, [richieste, cerca, soloNonAnnunciate])

  if (richieste.length === 0) {
    return (
      <p className="max-w-prose text-corpo text-lettura">
        Non è ancora arrivata nessuna richiesta. Quando un socio ne invia una, compare qui e vi
        arriva un’email.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {nonAnnunciate > 0 ? (
        /* La riga più importante della pagina finché l'invio non è configurato:
           una richiesta arrivata e non annunciata è invisibile a tutti. */
        <p role="status" className="border-l-4 border-arancione bg-pannello px-4 py-3 text-corpo">
          {nonAnnunciate === 1
            ? 'Una richiesta non è stata annunciata per email.'
            : `${nonAnnunciate} richieste non sono state annunciate per email.`}{' '}
          Le trovi qui sotto, ma nessuno ha ricevuto un avviso.
        </p>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <label className="flex min-w-64 flex-1 flex-col gap-1">
          <span className="text-sm font-semibold text-chiaro">
            Cerca per nome, matricola o numero
          </span>
          <input
            type="search"
            value={cerca}
            onChange={(evento) => setCerca(evento.target.value)}
            className="fuoco-su-scuro rounded-lg border border-cornice bg-notte px-3 py-2 text-corpo"
          />
        </label>

        {nonAnnunciate > 0 ? (
          <label className="flex items-center gap-2 pb-2 text-sm text-lettura">
            <input
              type="checkbox"
              checked={soloNonAnnunciate}
              onChange={(evento) => setSoloNonAnnunciate(evento.target.checked)}
              className="fuoco-su-scuro size-4"
            />
            Solo quelle non annunciate
          </label>
        ) : null}
      </div>

      <p className="text-sm text-tenue" aria-live="polite">
        {trovate.length === richieste.length
          ? `${richieste.length} richieste in tutto`
          : `${trovate.length} su ${richieste.length}`}
      </p>

      <ul className="flex flex-col gap-3">
        {trovate.map((r) => (
          <li key={r.id} className="pannello px-4 py-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="cifra text-lg text-luce">#{r.numero}</span>
              <span className="insegna text-lg text-chiaro">
                {r.cognome} {r.nome}
              </span>
              <span className="text-sm text-tenue">{r.codiceDipendente}</span>
              <span className="ml-auto text-sm text-tenue">
                {formattaData(r.creataIl.slice(0, 10))}
              </span>
            </div>

            <p className="mt-2 text-corpo text-chiaro">{cosaChiede(r)}</p>

            <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-lettura">
              {r.importo !== undefined ? (
                <Voce etichetta="Importo" valore={`${r.importo.toFixed(2).replace('.', ',')} €`} />
              ) : null}
              {comePaga(r) ? <Voce etichetta="Paga con" valore={comePaga(r)} /> : null}
              {r.consegna ? (
                <Voce
                  etichetta="Riceve su"
                  valore={`${CONSEGNE_LEGGIBILI[r.consegna] ?? r.consegna}${
                    r.recapito ? ` — ${r.recapito}` : ''
                  }`}
                />
              ) : null}
              {r.dataPreferita ? (
                <Voce
                  etichetta="Quando"
                  valore={[formattaData(r.dataPreferita), r.orarioPreferito]
                    .filter(Boolean)
                    .join(' ')}
                />
              ) : null}
            </dl>

            {r.messaggio ? (
              <p className="mt-2 border-l-2 border-parete pl-3 text-sm text-lettura italic">
                {r.messaggio}
              </p>
            ) : null}

            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {/* Il primo lavoro del direttore è rispondere: il collegamento
                  apre già l'email al socio, con il numero nell'oggetto. */}
              <a
                href={`mailto:${r.email}?subject=${encodeURIComponent(
                  `Richiesta #${r.numero} — CRAL ARES`,
                )}`}
                className="fuoco-su-scuro rounded font-semibold text-luce underline underline-offset-4"
              >
                Rispondi a {r.nome}
              </a>
              {!r.avvisoInviato ? (
                <span className="font-semibold text-arancione">Avviso non inviato</span>
              ) : null}
            </p>
          </li>
        ))}
      </ul>

      {trovate.length === 0 ? (
        <p className="text-corpo text-lettura">Nessuna richiesta corrisponde alla ricerca.</p>
      ) : null}
    </div>
  )
}

function Voce({ etichetta, valore }: { etichetta: string; valore: string }) {
  return (
    <span className="flex gap-1.5">
      <dt className="text-tenue">{etichetta}</dt>
      <dd>{valore}</dd>
    </span>
  )
}
