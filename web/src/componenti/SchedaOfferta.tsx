import Link from 'next/link'
import type { ModalitaOfferta, Offerta } from '@/dominio/offerta'
import { descriviScadenza } from '@/lib/date'

/**
 * Cosa promette il pulsante in fondo alla scheda.
 *
 * Il collegamento porta sempre alla pagina dell'offerta; è lì che si chiede.
 * L'etichetta però dice cosa si va a fare, non dove si va: per una
 * convenzione «Richiedi i biglietti» sarebbe una bugia, e per dei biglietti
 * «Vedi l'offerta» butta via l'unica riga che convince a cliccare.
 */
const AZIONE: Record<ModalitaOfferta, string> = {
  biglietti: 'Richiedi i biglietti',
  convenzione: 'Richiedi informazioni',
  solo_sconto: 'Vedi l’offerta',
}

/**
 * La scheda di un'offerta: il pannello con cui è costruito tutto il sito.
 *
 * Fondo pieno, filo azzurro sottile, nessuna ombra e nessuna trasparenza —
 * scelta del committente davanti al campione, e la ragione per cui regge otto
 * ripetizioni di fila senza diventare una macchia sola. L'ordine dentro è
 * sempre lo stesso: categoria, nome, cifra, una riga di testo, la scadenza,
 * l'azione. Chi scorre col pollice trova ogni cosa dove l'ha lasciata nella
 * scheda precedente.
 *
 * Tutta la scheda è cliccabile, ma il collegamento vero è solo sul nome del
 * partner, esteso al riquadro con uno pseudo-elemento. È la differenza fra
 * una scheda che si può usare col mouse e una che, letta da uno screen
 * reader, annuncia un collegamento chiamato «UCI Cinemas» invece di
 * rileggere l'intero contenuto della scheda. Per la stessa ragione il
 * pulsante in fondo è `aria-hidden`: è la parte visibile di quell'unico
 * collegamento, non un secondo collegamento allo stesso posto.
 *
 * `inEvidenza` è l'unica variante, e cambia tre cose sole: il filo diventa
 * oro, la cifra diventa oro, il pulsante si riempie. Vale la regola dei tre
 * usi dell'oro — in una schermata se ne accende uno.
 */
export function SchedaOfferta({
  offerta,
  inEvidenza = false,
  titolo: Titolo = 'h3',
  collegamentoDisabilitato = false,
}: {
  offerta: Offerta
  inEvidenza?: boolean
  titolo?: 'h2' | 'h3'
  /**
   * Per l'anteprima del modulo di pubblicazione: lo slug lì è un segnaposto
   * («anteprima»), quindi un collegamento vero porterebbe a un 404. Qui la
   * scheda resta leggibile ma non cliccabile.
   */
  collegamentoDisabilitato?: boolean
}) {
  const collegamento = collegamentoDisabilitato ? (
    <span>{offerta.partner}</span>
  ) : (
    <Link
      href={`/offerte/${offerta.slug}`}
      className="after:absolute after:inset-0 after:content-[''] hover:underline"
    >
      {offerta.partner}
    </Link>
  )

  const scadenza = descriviScadenza(offerta.validaAl)

  return (
    <article
      className={`fuoco-scheda pannello relative flex flex-col px-5 py-5 transition-colors ${
        inEvidenza ? 'border-oro/60' : 'hover:border-luce/60'
      }`}
    >
      <p className="text-sm font-semibold text-luce">{offerta.categoria}</p>

      <Titolo className="mt-1 text-2xl text-chiaro">{collegamento}</Titolo>

      <p className={`cifra mt-1 text-3xl ${inEvidenza ? 'text-oro' : 'text-chiaro'}`}>
        {offerta.vantaggio}
      </p>

      <p className="mt-2 max-w-prose text-corpo text-lettura">{offerta.descrizione}</p>

      <p
        className={`mt-3 mb-4 text-sm ${
          scadenza.tipo === 'vicina' ? 'font-semibold text-arancione' : 'text-tenue'
        }`}
      >
        {scadenza.testo}
      </p>

      <span
        aria-hidden="true"
        className={`mt-auto rounded-lg py-2.5 text-center text-sm font-bold ${
          inEvidenza
            ? 'bg-oro text-notte'
            : 'border border-luce/45 text-luce'
        }`}
      >
        {AZIONE[offerta.modalita]}
      </span>
    </article>
  )
}
