/**
 * Trasforma il file dei soci del direttivo in SQL da incollare su Supabase.
 *
 * Si lancia dalla cartella `web/`:
 *
 *   node strumenti/genera-import-soci.mjs ~/elenco.csv > import.sql
 *
 * Dal foglio Excel si esporta prima in CSV (File → Salva con nome → CSV).
 * I problemi vanno sull'errore standard, l'SQL sull'uscita standard: così
 * `> import.sql` produce un file pulito e i problemi restano a schermo, dove
 * si leggono.
 *
 * Non scrive sul database. L'SQL si legge prima di eseguirlo, e nessuna
 * credenziale di scrittura entra nel progetto.
 *
 * Node stampa un avviso su «module type not specified»: è innocuo, riguarda
 * il modo in cui carica il TypeScript senza compilarlo.
 */
import { readFileSync } from 'node:fs'
import { sociDaCsv, sqlDiImportazione } from '../src/lib/sociDaCsv.ts'

const percorso = process.argv[2]
if (!percorso) {
  console.error('Uso, dalla cartella web/: node strumenti/genera-import-soci.mjs <file.csv>')
  process.exit(1)
}

const { soci, problemi } = sociDaCsv(readFileSync(percorso, 'utf8'))

for (const problema of problemi) console.error(`⚠️  ${problema}`)
const quanti = soci.length === 1 ? '1 socio pronto' : `${soci.length} soci pronti`
const quante = problemi.length === 1 ? '1 riga da guardare' : `${problemi.length} righe da guardare`
console.error(`\n${quanti} da importare, ${quante}.`)

if (soci.length === 0) process.exit(1)
process.stdout.write(sqlDiImportazione(soci))
