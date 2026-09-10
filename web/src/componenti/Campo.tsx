/**
 * Un campo di modulo, con la sua etichetta, il suo aiuto e il suo errore.
 *
 * Esiste per tenere insieme tre cose che devono restare insieme: l'errore va
 * **sotto** il campo che lo riguarda, e va legato a quel campo con
 * `aria-describedby`, altrimenti chi usa uno screen reader sente un messaggio
 * che non sa a cosa appartiene. `aria-invalid` fa il resto: senza, il campo è
 * marcato in rosso per chi vede e normale per tutti gli altri.
 */
export function Campo({
  nome,
  etichetta,
  tipo = 'text',
  valore,
  alCambio,
  errore,
  aiuto,
  richiesto = false,
  inputMode,
  autoComplete,
}: {
  nome: string
  etichetta: string
  tipo?: string
  valore?: string
  alCambio?: (valore: string) => void
  errore?: string
  aiuto?: string
  richiesto?: boolean
  inputMode?: 'text' | 'tel' | 'email' | 'numeric'
  autoComplete?: string
}) {
  const idAiuto = aiuto ? `${nome}-aiuto` : undefined
  const idErrore = errore ? `${nome}-errore` : undefined

  return (
    <div className="flex flex-col gap-1">
      {/* L'etichetta avvolge solo se stessa, non l'aiuto: dentro un `<label>`
          anche il testo d'aiuto entra nel nome del campo, e uno screen reader
          annuncia «Email aziendale quella che hai comunicato al CRAL serve a
          riconoscerti» come se fosse tutto il nome. L'aiuto sta fuori e si
          lega con `aria-describedby`, che è il suo mestiere. */}
      <label htmlFor={nome} className="text-sm font-semibold text-chiaro">
        {etichetta}
      </label>
      <input
        id={nome}
        name={nome}
        type={tipo}
        required={richiesto}
        inputMode={inputMode}
        autoComplete={autoComplete}
        {...(alCambio
          ? { value: valore ?? '', onChange: (e) => alCambio(e.target.value) }
          : { defaultValue: valore })}
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
    </div>
  )
}
