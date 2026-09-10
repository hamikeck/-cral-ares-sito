'use client'

import { useRef, useState } from 'react'

/**
 * Il testo pronto per l'avviso ai soci, con il pulsante che lo copia.
 *
 * Il testo resta visibile in un'area di testo invece di stare nascosto dietro
 * al pulsante: il direttore lo rilegge prima di mandarlo, e se la copia non
 * funziona può sempre selezionarlo a mano.
 *
 * Se `navigator.clipboard` fallisce — capita senza HTTPS, o con i permessi
 * negati — non compare un alert, che bloccherebbe la pagina: si seleziona il
 * testo al posto del direttore e l'etichetta spiega come copiarlo lui stesso.
 */
export function CopiaTestoEmail({ testo }: { testo: string }) {
  const [esito, impostaEsito] = useState<'fermo' | 'copiato' | 'selezionato'>('fermo')
  const area = useRef<HTMLTextAreaElement>(null)

  async function copia() {
    try {
      await navigator.clipboard.writeText(testo)
      impostaEsito('copiato')
      setTimeout(() => impostaEsito('fermo'), 2000)
    } catch {
      // Niente alert: bloccherebbe la pagina. Si seleziona il testo e si dice
      // come copiarlo a mano.
      area.current?.select()
      impostaEsito('selezionato')
    }
  }

  return (
    <div className="mt-8 border border-parete p-4">
      <h2 className="font-semibold text-chiaro">Il testo per l’email ai soci</h2>
      <p className="mt-1 text-sm text-tenue">
        Incollalo nell’avviso che mandi da Aruba.
      </p>

      <label htmlFor="testo-email" className="sr-only">
        Testo dell’avviso da copiare
      </label>
      <textarea
        id="testo-email"
        ref={area}
        readOnly
        rows={7}
        value={testo}
        className="fuoco-su-scuro mt-3 w-full border border-parete bg-pannello px-3 py-2 font-mono text-sm"
      />

      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          onClick={copia}
          className="fuoco-su-scuro rounded-lg border border-luce bg-luce px-4 py-2 font-bold text-notte"
        >
          Copia il testo
        </button>
        <p role="status" className="text-sm text-tenue">
          {esito === 'copiato' ? 'Copiato.' : null}
          {esito === 'selezionato' ? 'Testo selezionato: premi Cmd+C per copiarlo.' : null}
        </p>
      </div>
    </div>
  )
}
