import { redattoreAttivo } from '@/dati/redattori'
import { tutteLeRichieste } from '@/dati/richiesteRiservate'
import { csvDelleRichieste, nomeFileCsv } from '@/lib/csvRichieste'
import { oggi } from '@/lib/date'

/**
 * Lo scarico delle richieste in CSV.
 *
 * **Il controllo di autorizzazione è scritto qui**, e non è una ripetizione
 * inutile del guscio dell'area riservata: un layout non protegge un Route
 * Handler. Il guscio difende le pagine che gli stanno dentro, questo indirizzo
 * no — e senza il controllo, chiunque conoscesse l'indirizzo si scaricherebbe
 * nome, matricola e recapiti di tutti i soci che hanno chiesto qualcosa.
 *
 * Il file non si mette in cache: cambia a ogni richiesta che arriva, e una
 * copia vecchia nel browser di un direttore sarebbe peggio di nessuna copia.
 */
export async function GET() {
  if (!(await redattoreAttivo())) {
    return new Response('Non autorizzato', { status: 401 })
  }

  const csv = csvDelleRichieste(await tutteLeRichieste())

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${nomeFileCsv(oggi())}"`,
      'Cache-Control': 'no-store',
    },
  })
}
