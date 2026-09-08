import type { Offerta } from './offerta'
import { formattaData } from '@/lib/date'

/**
 * Il testo che il direttore incolla nell'email ai soci.
 *
 * Niente HTML e nessuna formattazione: finisce dentro la webmail di Aruba,
 * dove qualunque marcatura si romperebbe. Righe corte, il link per esteso —
 * un link accorciato in un'email di associazione sembra pubblicità.
 */
export function testoPerEmail(offerta: Offerta, indirizzoSito: string): string {
  const radice = indirizzoSito.replace(/\/+$/, '')

  return [
    `${offerta.partner} — ${offerta.vantaggio}`,
    '',
    offerta.descrizione,
    '',
    offerta.validaAl
      ? `Valida fino al ${formattaData(offerta.validaAl)}.`
      : 'Offerta senza scadenza.',
    `Tutti i dettagli: ${radice}/offerte/${offerta.slug}`,
  ].join('\n')
}
