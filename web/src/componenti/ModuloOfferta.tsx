'use client'

import { useActionState, useState } from 'react'
import { SchedaOfferta } from '@/componenti/SchedaOfferta'
import type { ModalitaOfferta } from '@/dominio/offerta'
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

  const errori = stato?.errori ?? {}
  const scrivi = (campo: string) => (evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    aggiorna((precedenti) => ({ ...precedenti, [campo]: evento.target.value }))

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
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
            value={campi.categoria}
            onChange={scrivi('categoria')}
            className="fuoco-su-chiaro border border-linea bg-superficie px-3 py-2"
          >
            {CATEGORIE.map((categoria) => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>

        <Campo nome="vantaggio" etichetta="Vantaggio" aiuto="Corto e concreto: «6,50 € invece di 9,50», «-30%», «2x1»." valore={campi.vantaggio} errore={errori.vantaggio} onChange={scrivi('vantaggio')} />
        <Campo nome="descrizione" etichetta="Presentazione breve" aiuto="Una riga, è quella che si legge negli elenchi. Massimo 160 caratteri." valore={campi.descrizione} errore={errori.descrizione} onChange={scrivi('descrizione')} />
        <Campo nome="descrizioneCompleta" etichetta="Descrizione completa" multilinea valore={campi.descrizioneCompleta} errore={errori.descrizioneCompleta} onChange={scrivi('descrizioneCompleta')} />
        <Campo nome="condizioni" etichetta="Condizioni" aiuto="Una per riga." multilinea valore={campi.condizioni} errore={errori.condizioni} onChange={scrivi('condizioni')} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo nome="validaDal" etichetta="Valida dal" tipo="date" valore={campi.validaDal} errore={errori.validaDal} onChange={scrivi('validaDal')} />
          <Campo nome="validaAl" etichetta="Valida fino al" tipo="date" valore={campi.validaAl} errore={errori.validaAl} onChange={scrivi('validaAl')} />
        </div>

        <fieldset className="flex flex-col gap-2 border border-linea p-4">
          <legend className="px-2 font-semibold">Come si ottiene</legend>
          {(['biglietti', 'convenzione', 'solo_sconto'] as const).map((modalita) => (
            <label key={modalita} className="flex items-center gap-2">
              <input
                type="radio"
                name="modalita"
                value={modalita}
                checked={campi.modalita === modalita}
                onChange={scrivi('modalita')}
              />
              {modalita === 'biglietti' && 'Il socio richiede i biglietti'}
              {modalita === 'convenzione' && 'Il socio chiede informazioni'}
              {modalita === 'solo_sconto' && 'Sconto da esibire, senza richiesta'}
            </label>
          ))}
        </fieldset>

        {campi.modalita === 'solo_sconto' ? (
          <Campo nome="istruzioni" etichetta="Cosa deve fare il socio" multilinea valore={campi.istruzioni} errore={errori.istruzioni} onChange={scrivi('istruzioni')} />
        ) : null}

        <details className="border border-linea p-4">
          <summary className="cursor-pointer font-semibold">Recapiti del partner (facoltativi)</summary>
          <div className="mt-4 flex flex-col gap-4">
            <Campo nome="indirizzo" etichetta="Indirizzo" valore={campi.indirizzo} onChange={scrivi('indirizzo')} />
            <Campo nome="telefono" etichetta="Telefono" valore={campi.telefono} onChange={scrivi('telefono')} />
            <Campo nome="sito" etichetta="Sito" valore={campi.sito} onChange={scrivi('sito')} />
            <Campo nome="codiceSconto" etichetta="Codice sconto" valore={campi.codiceSconto} onChange={scrivi('codiceSconto')} />
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

      <aside aria-label="Anteprima" className="lg:sticky lg:top-6 lg:self-start">
        <h2 className="text-sm font-semibold uppercase text-inchiostro-tenue">
          Come apparirà nell’elenco
        </h2>
        <div className="mt-3">
          <SchedaOfferta
            titolo="h3"
            inEvidenza={campi.inEvidenza}
            offerta={{
              slug: 'anteprima',
              partner: campi.partner || 'Nome del partner',
              categoria: campi.categoria,
              vantaggio: campi.vantaggio || 'Il vantaggio',
              descrizione: campi.descrizione || 'La riga di presentazione.',
              descrizioneCompleta: campi.descrizioneCompleta,
              condizioni: campi.condizioni.split('\n').filter(Boolean),
              validaDal: campi.validaDal || '2026-01-01',
              validaAl: campi.validaAl || '2026-12-31',
              modalita: campi.modalita,
              istruzioni: campi.istruzioni || undefined,
              inEvidenza: campi.inEvidenza,
              contatti: {},
            }}
          />
        </div>
      </aside>
    </div>
  )
}

function Campo({
  nome, etichetta, valore, onChange, errore, aiuto, tipo = 'text', multilinea = false,
}: {
  nome: string
  etichetta: string
  valore: string
  onChange: (evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  errore?: string
  aiuto?: string
  tipo?: string
  multilinea?: boolean
}) {
  const idAiuto = aiuto ? `${nome}-aiuto` : undefined
  const idErrore = errore ? `${nome}-errore` : undefined
  const comuni = {
    id: nome,
    name: nome,
    value: valore,
    onChange,
    'aria-describedby': [idAiuto, idErrore].filter(Boolean).join(' ') || undefined,
    'aria-invalid': errore ? true : undefined,
    className: 'fuoco-su-chiaro border border-linea bg-superficie px-3 py-2',
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={nome} className="font-semibold">{etichetta}</label>
      {aiuto ? <p id={idAiuto} className="text-sm text-inchiostro-tenue">{aiuto}</p> : null}
      {multilinea ? <textarea {...comuni} rows={4} /> : <input {...comuni} type={tipo} />}
      {errore ? <p id={idErrore} role="alert" className="text-sm text-ambra-scura">{errore}</p> : null}
    </div>
  )
}
