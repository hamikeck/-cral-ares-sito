import { nonAncoraIniziata, oggi, scaduta } from '@/lib/date'

export type StatoLeggibile = 'Bozza' | 'Programmata' | 'In corso' | 'Scaduta'

/**
 * Come si dice a un direttore in che stato è un'offerta.
 *
 * Nel database gli stati sono due — bozza o pubblicata — ma al direttore
 * servono quattro parole, perché «pubblicata» non distingue quella che va
 * online domani da quella finita la settimana scorsa. La distinzione è una
 * regola del sito, non una colonna, e per questo sta qui.
 */
export function statoLeggibile(
  offerta: { stato: 'bozza' | 'pubblicata'; validaDal: string; validaAl: string },
  adesso = oggi(),
): StatoLeggibile {
  if (offerta.stato === 'bozza') return 'Bozza'
  if (nonAncoraIniziata(offerta.validaDal, adesso)) return 'Programmata'
  if (scaduta(offerta.validaAl, adesso)) return 'Scaduta'
  return 'In corso'
}
