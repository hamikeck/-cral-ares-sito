'use client'

import { useActionState, useMemo, useState } from 'react'
import { inviaRichiestaCinema, type EsitoRichiesta } from '@/app/azioni/richieste'
import { formattaEuro, importoBiglietti, type Circuito } from '@/dominio/circuito'
import { MASSIMO_BIGLIETTI } from '@/dominio/richiestaSchema'
import { Campo } from './Campo'
import { ConfermaRichiesta as Conferma } from './ConfermaRichiesta'
import { DatiSocio } from './DatiSocio'
import { Turnstile } from './Turnstile'

/**
 * Il modulo dei biglietti del cinema.
 *
 * Il più corto del sito, e quello su cui si gioca il progetto: è il servizio
 * che gira ogni mese. Circuito, sede facoltativa, quantità — e l'importo che
 * si aggiorna mentre scegli, perché chi paga per bonifico deve sapere quanto
 * bonificare prima di premere invia.
 *
 * L'importo si calcola qui **solo per mostrarlo**. Quello che finisce nella
 * richiesta lo ricalcola il server dal prezzo che legge dal database: se
 * venisse dal browser, la cifra la sceglierebbe chi compila.
 */
export function ModuloCinema({ circuiti }: { circuiti: Circuito[] }) {
  const [stato, azione, inCorso] = useActionState<EsitoRichiesta | null, FormData>(
    inviaRichiestaCinema,
    null,
  )
  const errori = stato?.errori ?? {}

  const [circuitoId, setCircuitoId] = useState(circuiti[0]?.id ?? '')
  const [sedeId, setSedeId] = useState('')
  const [quantita, setQuantita] = useState('2')

  const circuito = circuiti.find((uno) => uno.id === circuitoId)
  const sedeScelta = circuito?.sedi.find((una) => una.id === sedeId)

  const importo = useMemo(() => {
    const numero = Number(quantita)
    if (!circuito || !Number.isInteger(numero) || numero < 1) return undefined
    return importoBiglietti(circuito, numero)
  }, [circuito, quantita])

  if (stato?.inviata) return <Conferma esito={stato.inviata} />

  return (
    <form action={azione} noValidate className="flex flex-col gap-8">
      {errori.modulo ? (
        <p role="alert" className="border-l-4 border-arancione bg-pannello px-4 py-3 text-corpo">
          {errori.modulo}
        </p>
      ) : null}

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-2xl text-chiaro">Cosa ti serve</legend>

        <div className="flex flex-col gap-1 sm:max-w-sm">
          <label htmlFor="circuitoId" className="text-sm font-semibold text-chiaro">
            Circuito
          </label>
          <select
            id="circuitoId"
            name="circuitoId"
            value={circuitoId}
            onChange={(evento) => {
              setCircuitoId(evento.target.value)
              // Cambiando circuito la sala di prima non esiste più: lasciarla
              // selezionata manderebbe al direttore una sede di un altro
              // circuito.
              setSedeId('')
            }}
            aria-invalid={errori.circuitoId ? true : undefined}
            className="fuoco-su-scuro rounded-lg border border-parete bg-notte px-3 py-2 text-corpo"
          >
            {circuiti.map((uno) => (
              <option key={uno.id} value={uno.id}>
                {uno.nome}
              </option>
            ))}
          </select>
          {errori.circuitoId ? (
            <span className="text-xs font-semibold text-arancione">{errori.circuitoId}</span>
          ) : null}
        </div>

        {circuito && circuito.sedi.length > 0 ? (
          <div className="flex flex-col gap-1 sm:max-w-sm">
            <label htmlFor="sedeId" className="text-sm font-semibold text-chiaro">
              Sala <span className="font-normal text-tenue">(facoltativa)</span>
            </label>
            <select
              id="sedeId"
              name="sedeId"
              value={sedeId}
              onChange={(evento) => setSedeId(evento.target.value)}
              aria-describedby="sede-aiuto"
              className="fuoco-su-scuro rounded-lg border border-parete bg-notte px-3 py-2 text-corpo"
            >
              <option value="">Non l’ho ancora deciso</option>
              {circuito.sedi.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.citta ? `${sede.nome} — ${sede.citta}` : sede.nome}
                </option>
              ))}
            </select>
            <span id="sede-aiuto" className="text-xs text-tenue">
              I biglietti valgono in tutte le sale del circuito: serve solo a farci sapere dove
              andrai.
            </span>
            {sedeScelta?.linkProgrammazione ? (
              <a
                href={sedeScelta.linkProgrammazione}
                target="_blank"
                rel="noreferrer"
                className="fuoco-su-scuro mt-1 self-start rounded text-sm font-semibold text-luce underline underline-offset-4"
              >
                Guarda la programmazione di {sedeScelta.nome}
              </a>
            ) : null}
          </div>
        ) : null}

        <div className="sm:max-w-3xs">
          <Campo
            nome="quantita"
            etichetta="Quanti biglietti"
            tipo="number"
            inputMode="numeric"
            valore={quantita}
            alCambio={setQuantita}
            errore={errori.quantita}
            richiesto
          />
        </div>

        {/* Il totale è l'unica cosa dorata del modulo, e cambia mentre scegli.
            Se il direttivo non ha ancora comunicato il listino non compare
            nessuna cifra: il servizio resta richiedibile, e quanto costa lo
            dice un direttore rispondendo. */}
        {importo !== undefined && circuito ? (
          <p
            aria-live="polite"
            className="flex flex-wrap items-baseline justify-between gap-3 rounded-lg border border-oro/40 bg-pannello px-4 py-3"
          >
            <span className="text-corpo text-lettura">
              {quantita} {Number(quantita) === 1 ? 'biglietto' : 'biglietti'} {circuito.nome}
            </span>
            <span className="cifra text-3xl text-oro">{formattaEuro(importo)}</span>
          </p>
        ) : (
          <p className="text-sm text-tenue">
            Il prezzo per i soci lo comunicano i direttori rispondendo alla richiesta.
          </p>
        )}
      </fieldset>

      <DatiSocio errori={errori} />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-2xl text-chiaro">Come paghi</legend>
        <ScegliPagamento errore={errori.pagamento} />
      </fieldset>

      <div className="flex flex-col gap-1">
        <label htmlFor="messaggio" className="text-sm font-semibold text-chiaro">
          Vuoi aggiungere qualcosa? <span className="font-normal text-tenue">(facoltativo)</span>
        </label>
        <textarea
          id="messaggio"
          name="messaggio"
          rows={3}
          className="fuoco-su-scuro rounded-lg border border-parete bg-notte px-3 py-2 text-corpo"
        />
        <span className="text-xs text-tenue">
          Per esempio se te ne servono più di {MASSIMO_BIGLIETTI}, o per quando ti servono.
        </span>
      </div>

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

function ScegliPagamento({ errore }: { errore?: string }) {
  const [scelta, setScelta] = useState<'bonifico' | 'busta_paga'>('bonifico')

  return (
    <>
      <div className="flex flex-col gap-2">
        {(
          [
            ['bonifico', 'Cedolino', 'Ti arrivano IBAN, importo e causale già scritti.'],
            ['busta_paga', 'Trattenuta in busta paga', 'L’importo ti viene trattenuto dallo stipendio.'],
          ] as const
        ).map(([valore, etichetta, spiegazione]) => (
          <label
            key={valore}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 ${
              scelta === valore ? 'border-luce/70 bg-luce/10' : 'border-parete'
            }`}
          >
            <input
              type="radio"
              name="pagamento"
              value={valore}
              checked={scelta === valore}
              onChange={() => setScelta(valore)}
              className="fuoco-su-scuro mt-1 size-4"
            />
            <span>
              <span className="block text-corpo text-chiaro">{etichetta}</span>
              <span className="block text-sm text-tenue">{spiegazione}</span>
            </span>
          </label>
        ))}
      </div>
      {errore ? <span className="text-xs font-semibold text-arancione">{errore}</span> : null}
    </>
  )
}
