'use client'

import { useActionState, useState } from 'react'
import { SchedaOfferta } from '@/componenti/SchedaOfferta'
import type { ModalitaOfferta, Offerta } from '@/dominio/offerta'
import { salvaOfferta, type EsitoSalvataggio } from '@/app/azioni/offerte'

// Elenco provvisorio: il direttivo non l'ha ancora confermato. Il punto di
// partenza discusso in riunione è cinema, teatri, assicurazione auto,
// pneumatici — un elenco diverso da questo. Non va cambiato di iniziativa:
// resta qui finché il direttivo non decide, e un task successivo recepirà la
// risposta.
const CATEGORIE = ['Cinema', 'Teatro', 'Auto', 'Salute', 'Sport'] as const

export function ModuloOfferta() {
  const [stato, azione, inCorso] = useActionState<EsitoSalvataggio | null, FormData>(
    salvaOfferta,
    null,
  )
  const [campi, aggiorna] = useState({
    partner: '',
    categoria: 'Cinema',
    vantaggio: '',
    descrizione: '',
    descrizioneCompleta: '',
    condizioni: '',
    validaDal: '',
    validaAl: '',
    modalita: 'biglietti' as ModalitaOfferta,
    istruzioni: '',
    indirizzo: '',
    telefono: '',
    sito: '',
    codiceSconto: '',
    inEvidenza: false,
  })

  // Gli errori arrivano dalla Server Action, ma vivono in uno stato proprio:
  // se restassero legati a `stato.errori` la scritta rossa «Scrivi il nome
  // del partner» resterebbe sotto al campo anche dopo che il direttore lo ha
  // corretto, perché `stato` cambia solo al prossimo invio. Qui si azzerano
  // campo per campo appena il direttore scrive.
  //
  // L'allineamento con `stato` avviene durante il render invece che in un
  // useEffect — il pattern «adjusting state when a prop changes» dei React
  // docs — per non aggiungere un giro di re-render in più a ogni invio.
  const [erroriPrecedenti, impostaErroriPrecedenti] = useState(stato)
  const [errori, impostaErrori] = useState<Record<string, string>>({})
  if (stato !== erroriPrecedenti) {
    impostaErroriPrecedenti(stato)
    impostaErrori(stato?.errori ?? {})
  }

  const scrivi =
    (campo: string) =>
    (evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      aggiorna((precedenti) => ({ ...precedenti, [campo]: evento.target.value }))
      impostaErrori((precedenti) => {
        if (!(campo in precedenti)) return precedenti
        return Object.fromEntries(
          Object.entries(precedenti).filter(([chiave]) => chiave !== campo),
        )
      })
    }

  const idErroreCategoria = errori.categoria ? 'categoria-errore' : undefined
  const idErroreModalita = errori.modalita ? 'modalita-errore' : undefined

  // Niente date finte: sul database sono obbligatorie, ma qui — prima che il
  // direttore le scriva — restano vuote. `SchedaOfferta` sa mostrare un
  // segnaposto («Scadenza da indicare») invece di formattare una stringa
  // vuota o, peggio, una data inventata che sembra vera.
  const anteprimaOfferta: Offerta = {
    slug: 'anteprima',
    partner: campi.partner || 'Nome del partner',
    categoria: campi.categoria,
    vantaggio: campi.vantaggio || 'Il vantaggio',
    descrizione: campi.descrizione || 'La riga di presentazione.',
    descrizioneCompleta: campi.descrizioneCompleta,
    condizioni: campi.condizioni.split('\n').filter(Boolean),
    validaDal: campi.validaDal,
    validaAl: campi.validaAl,
    modalita: campi.modalita,
    istruzioni: campi.istruzioni || undefined,
    inEvidenza: campi.inEvidenza,
    contatti: {},
  }

  const anteprima = (
    <SchedaOfferta
      titolo="h3"
      inEvidenza={campi.inEvidenza}
      offerta={anteprimaOfferta}
      collegamentoDisabilitato
    />
  )

  return (
    <div className="flex flex-col gap-8">
      <div
        className={
          campi.inEvidenza ? 'flex flex-col gap-5' : 'grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]'
        }
      >
        <form action={azione} className="flex flex-col gap-5">
          {errori.modulo ? (
            <p role="alert" className="border-l-4 border-arancione bg-fascia px-4 py-3">
              {errori.modulo}
            </p>
          ) : null}

          <Campo nome="partner" etichetta="Partner" valore={campi.partner} errore={errori.partner} onChange={scrivi('partner')} />

          <div className="flex flex-col gap-2">
            <label htmlFor="categoria" className="font-semibold">Categoria</label>
            <select
              id="categoria"
              name="categoria"
              required
              value={campi.categoria}
              onChange={scrivi('categoria')}
              aria-describedby={idErroreCategoria}
              aria-invalid={errori.categoria ? true : undefined}
              className="fuoco-su-chiaro border border-linea bg-superficie px-3 py-2"
            >
              {CATEGORIE.map((categoria) => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
            {errori.categoria ? (
              <p id={idErroreCategoria} role="alert" className="text-sm text-ambra-scura">{errori.categoria}</p>
            ) : null}
          </div>

          <Campo nome="vantaggio" etichetta="Vantaggio" aiuto="Corto e concreto: «6,50 € invece di 9,50», «-30%», «2x1». Al massimo 60 caratteri." maxLength={60} valore={campi.vantaggio} errore={errori.vantaggio} onChange={scrivi('vantaggio')} />
          <Campo nome="descrizione" etichetta="Presentazione breve" aiuto="Una riga, è quella che si legge negli elenchi. Massimo 160 caratteri." maxLength={160} valore={campi.descrizione} errore={errori.descrizione} onChange={scrivi('descrizione')} />
          <Campo nome="descrizioneCompleta" etichetta="Descrizione completa" multilinea valore={campi.descrizioneCompleta} errore={errori.descrizioneCompleta} onChange={scrivi('descrizioneCompleta')} />
          <Campo nome="condizioni" etichetta="Condizioni" aiuto="Una per riga." multilinea obbligatorio={false} valore={campi.condizioni} errore={errori.condizioni} onChange={scrivi('condizioni')} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo nome="validaDal" etichetta="Valida dal" tipo="date" valore={campi.validaDal} errore={errori.validaDal} onChange={scrivi('validaDal')} />
            <Campo nome="validaAl" etichetta="Valida fino al" tipo="date" valore={campi.validaAl} errore={errori.validaAl} onChange={scrivi('validaAl')} />
          </div>

          <fieldset
            className="flex flex-col gap-2 border border-linea p-4"
            aria-describedby={idErroreModalita}
          >
            <legend className="px-2 font-semibold">Come si ottiene</legend>
            {(['biglietti', 'convenzione', 'solo_sconto'] as const).map((modalita) => (
              <label key={modalita} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="modalita"
                  value={modalita}
                  checked={campi.modalita === modalita}
                  onChange={scrivi('modalita')}
                  required
                />
                {modalita === 'biglietti' && 'Il socio richiede i biglietti'}
                {modalita === 'convenzione' && 'Il socio chiede informazioni'}
                {modalita === 'solo_sconto' && 'Sconto da esibire, senza richiesta'}
              </label>
            ))}
            {errori.modalita ? (
              <p id={idErroreModalita} role="alert" className="text-sm text-ambra-scura">{errori.modalita}</p>
            ) : null}
          </fieldset>

          {campi.modalita === 'solo_sconto' ? (
            <Campo nome="istruzioni" etichetta="Cosa deve fare il socio" multilinea valore={campi.istruzioni} errore={errori.istruzioni} onChange={scrivi('istruzioni')} />
          ) : null}

          <details className="border border-linea p-4">
            <summary className="cursor-pointer font-semibold">Recapiti del partner (facoltativi)</summary>
            <div className="mt-4 flex flex-col gap-4">
              <Campo nome="indirizzo" etichetta="Indirizzo" obbligatorio={false} valore={campi.indirizzo} onChange={scrivi('indirizzo')} />
              <Campo nome="telefono" etichetta="Telefono" obbligatorio={false} valore={campi.telefono} onChange={scrivi('telefono')} />
              <Campo nome="sito" etichetta="Sito" obbligatorio={false} valore={campi.sito} onChange={scrivi('sito')} />
              <Campo nome="codiceSconto" etichetta="Codice sconto" obbligatorio={false} valore={campi.codiceSconto} onChange={scrivi('codiceSconto')} />
            </div>
          </details>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="inEvidenza"
              checked={campi.inEvidenza}
              onChange={(evento) =>
                aggiorna((precedenti) => ({ ...precedenti, inEvidenza: evento.target.checked }))
              }
            />
            Mettila in evidenza sulla home
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="submit" name="azione" value="bozza" disabled={inCorso} className="fuoco-su-chiaro border border-linea px-4 py-2 font-semibold">
              Salva bozza
            </button>
            <button type="submit" name="azione" value="pubblica" disabled={inCorso} className="fuoco-su-chiaro border border-blu-profondo bg-blu-profondo px-4 py-2 font-semibold text-white">
              Pubblica
            </button>
          </div>
        </form>

        {!campi.inEvidenza ? (
          <aside aria-label="Anteprima" className="lg:sticky lg:top-6 lg:self-start">
            <h2 className="text-sm font-semibold uppercase text-inchiostro-tenue">
              Come apparirà nell’elenco
            </h2>
            <div className="mt-3">{anteprima}</div>
          </aside>
        ) : null}
      </div>

      {campi.inEvidenza ? (
        // La scheda «in evidenza» apre due colonne al breakpoint di
        // viewport `lg`, non di contenitore: dentro la colonna stretta
        // dell'anteprima laterale si schiaccerebbe in modo che il socio non
        // vedrà mai. Qui sotto ha la larghezza piena della pagina, la stessa
        // che avrà davvero in home.
        <div aria-label="Anteprima">
          <h2 className="text-sm font-semibold uppercase text-inchiostro-tenue">
            Come apparirà in evidenza sulla home
          </h2>
          <div className="mt-3">{anteprima}</div>
        </div>
      ) : null}
    </div>
  )
}

function Campo({
  nome, etichetta, valore, onChange, errore, aiuto, tipo = 'text', multilinea = false, maxLength, obbligatorio = true,
}: {
  nome: string
  etichetta: string
  valore: string
  onChange: (evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  errore?: string
  aiuto?: string
  tipo?: string
  multilinea?: boolean
  maxLength?: number
  obbligatorio?: boolean
}) {
  const idAiuto = aiuto ? `${nome}-aiuto` : undefined
  const idErrore = errore ? `${nome}-errore` : undefined
  const comuni = {
    id: nome,
    name: nome,
    value: valore,
    onChange,
    required: obbligatorio || undefined,
    maxLength,
    'aria-describedby': [idAiuto, idErrore].filter(Boolean).join(' ') || undefined,
    'aria-invalid': errore ? true : undefined,
    className: 'fuoco-su-chiaro border border-linea bg-superficie px-3 py-2',
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={nome} className="font-semibold">
        {etichetta}
        {obbligatorio ? null : (
          <span className="font-normal text-inchiostro-tenue"> (facoltativo)</span>
        )}
      </label>
      {aiuto ? <p id={idAiuto} className="text-sm text-inchiostro-tenue">{aiuto}</p> : null}
      {multilinea ? <textarea {...comuni} rows={4} /> : <input {...comuni} type={tipo} />}
      {errore ? <p id={idErrore} role="alert" className="text-sm text-ambra-scura">{errore}</p> : null}
    </div>
  )
}
