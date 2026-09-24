import { comePaga, cosaChiede, CONSEGNE_LEGGIBILI, type Richiesta } from '@/dominio/richiesta'
import { formattaData } from './date'

/**
 * L'esportazione delle richieste, per contare i biglietti da ordinare.
 *
 * Tre scelte che sembrano dettagli e non lo sono, perché questo file lo apre
 * un direttore con Excel in italiano su un Mac o su un PC dell'ufficio:
 *
 * - **separatore punto e virgola.** Con la virgola, Excel in italiano mette
 *   tutta la riga in una cella sola, e chi apre il file pensa che sia rotto.
 * - **BOM in testa.** Senza, Excel legge il file come Latin-1 e «convenzione»
 *   diventa «convenzioneÃ¨»: gli accenti italiani si rompono tutti.
 * - **fine riga CRLF**, che è quella che Excel si aspetta.
 *
 * Nessuna libreria: sono venti righe, e una dipendenza in più è una cosa da
 * aggiornare per sempre.
 */

const COLONNE = [
  'Numero',
  'Data',
  'Tipo',
  'Cognome',
  'Nome',
  'Matricola',
  'Email aziendale',
  'Cosa chiede',
  'Quantità',
  'Importo',
  'Pagamento',
  'Dove ricevere',
  'Recapito',
  'Messaggio',
  'Avviso inviato',
] as const

const TIPI: Record<string, string> = {
  cinema: 'Cinema',
  convenzione: 'Convenzione',
  offerta: 'Offerta',
}

/**
 * Una cella di CSV.
 *
 * Le virgolette si raddoppiano e il valore si racchiude quando contiene un
 * separatore, una virgoletta o un a capo — il messaggio di un socio può
 * contenerli tutti e tre.
 *
 * L'apostrofo davanti a un valore che comincia per `=`, `+`, `-` o `@` non è
 * una decorazione: Excel interpreta quelle celle come formule, e un messaggio
 * che comincia con «=» diventerebbe un calcolo eseguito all'apertura del file.
 */
function cella(valore: string | number | undefined): string {
  if (valore === undefined || valore === '') return ''

  let testo = String(valore)
  if (/^[=+\-@\t\r]/.test(testo)) testo = "'" + testo

  return /[;"\n\r]/.test(testo) ? '"' + testo.replace(/"/g, '""') + '"' : testo
}

export function csvDelleRichieste(richieste: Richiesta[]): string {
  const righe = [COLONNE.map(cella).join(';')]

  for (const r of richieste) {
    righe.push(
      [
        cella(r.numero),
        cella(formattaData(r.creataIl.slice(0, 10))),
        cella(TIPI[r.tipo] ?? r.tipo),
        cella(r.cognome),
        cella(r.nome),
        cella(r.codiceDipendente),
        cella(r.email),
        cella(cosaChiede(r)),
        cella(r.quantita),
        cella(r.importo === undefined ? '' : r.importo.toFixed(2).replace('.', ',')),
        cella(comePaga(r)),
        cella(r.consegna ? (CONSEGNE_LEGGIBILI[r.consegna] ?? r.consegna) : ''),
        cella(r.recapito),
        cella(r.messaggio),
        cella(r.avvisoInviato ? 'sì' : 'no'),
      ].join(';'),
    )
  }

  return '﻿' + righe.join('\r\n') + '\r\n'
}

/** Il nome del file, con la data: se ne scaricano più d'uno nel tempo. */
export function nomeFileCsv(oggi: string): string {
  return `richieste-cral-ares-${oggi}.csv`
}
