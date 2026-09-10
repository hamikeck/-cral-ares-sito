import type { DatiSocio } from '@/dominio/socioSchema'
import { normalizzaEmail, normalizzaMatricola } from '../dominio/socio.ts'

/**
 * Da un foglio di calcolo del direttivo alle righe della tabella `soci`.
 *
 * Il file lo compila una persona, non un programma, e arriva una volta sola:
 * per questo lo strumento è tollerante su come è scritto e severo su cosa
 * lascia passare. Tutto quello che non riesce a usare lo **dice**, riga per
 * riga, invece di scartarlo in silenzio — un socio perso nell'import si
 * scopre mesi dopo, quando quella persona non riesce a chiedere i biglietti e
 * telefona arrabbiata.
 *
 * Non scrive sul database: produce SQL da incollare nel pannello Supabase.
 * È la stessa strada dei semi di sviluppo, e ha due vantaggi che valgono la
 * scomodità — nessuna credenziale di scrittura entra nel progetto, e prima di
 * eseguire si può leggere esattamente cosa si sta per inserire.
 */

/** I nomi che una colonna può avere in un file scritto a mano. */
const NOMI_COLONNA: Record<keyof DatiSocio, string[]> = {
  nome: ['nome', 'name', 'nomi'],
  cognome: ['cognome', 'surname', 'cognomi'],
  email: ['email', 'e-mail', 'mail', 'posta', 'posta elettronica', 'indirizzo email'],
  codiceDipendente: [
    'matricola',
    'codice',
    'codice dipendente',
    'codicedipendente',
    'numero matricola',
    'n. matricola',
  ],
  telefono: ['telefono', 'cellulare', 'tel', 'numero', 'recapito'],
  note: ['note', 'nota', 'annotazioni'],
}

const OBBLIGATORIE: (keyof DatiSocio)[] = ['nome', 'cognome', 'email', 'codiceDipendente']

/** Le etichette in italiano, per i messaggi rivolti a chi legge. */
const ETICHETTA: Record<keyof DatiSocio, string> = {
  nome: 'nome',
  cognome: 'cognome',
  email: 'email',
  codiceDipendente: 'matricola',
  telefono: 'telefono',
  note: 'note',
}

/**
 * Un lettore CSV minimo ma corretto.
 *
 * Regge le virgolette, le virgole dentro un campo virgolettato e le
 * virgolette raddoppiate. Il separatore si indovina dalla prima riga: Excel in
 * italiano esporta col punto e virgola, quasi tutto il resto del mondo con la
 * virgola, e chiedere a un direttore di saperlo sarebbe scortese.
 */
function leggiCsv(testo: string): string[][] {
  const separatore = indovinaSeparatore(testo)
  const righe: string[][] = []
  let campo = ''
  let riga: string[] = []
  let dentroVirgolette = false

  for (let i = 0; i < testo.length; i += 1) {
    const carattere = testo[i]

    if (dentroVirgolette) {
      if (carattere === '"') {
        if (testo[i + 1] === '"') {
          campo += '"'
          i += 1
        } else {
          dentroVirgolette = false
        }
      } else {
        campo += carattere
      }
      continue
    }

    if (carattere === '"') {
      dentroVirgolette = true
    } else if (carattere === separatore) {
      riga.push(campo)
      campo = ''
    } else if (carattere === '\n') {
      riga.push(campo)
      righe.push(riga)
      riga = []
      campo = ''
    } else if (carattere !== '\r') {
      campo += carattere
    }
  }

  if (campo !== '' || riga.length > 0) {
    riga.push(campo)
    righe.push(riga)
  }

  return righe
}

function indovinaSeparatore(testo: string): string {
  const primaRiga = testo.split('\n', 1)[0] ?? ''
  return (primaRiga.match(/;/g) ?? []).length >= (primaRiga.match(/,/g) ?? []).length ? ';' : ','
}

/** L'intestazione dice quale colonna sta dove. */
function mappaColonne(intestazioni: string[]): Partial<Record<keyof DatiSocio, number>> {
  const mappa: Partial<Record<keyof DatiSocio, number>> = {}

  intestazioni.forEach((grezza, indice) => {
    const nome = grezza.trim().toLowerCase()
    for (const campo of Object.keys(NOMI_COLONNA) as (keyof DatiSocio)[]) {
      if (mappa[campo] === undefined && NOMI_COLONNA[campo].includes(nome)) {
        mappa[campo] = indice
      }
    }
  })

  return mappa
}

export type EsitoImportazione = { soci: DatiSocio[]; problemi: string[] }

export function sociDaCsv(testo: string): EsitoImportazione {
  // Il BOM che Excel mette in testa al file rende irriconoscibile la prima
  // colonna, ed è la ragione numero uno per cui un import «non funziona e non
  // si capisce perché».
  const righe = leggiCsv(testo.replace(/^﻿/, ''))
  if (righe.length === 0) return { soci: [], problemi: ['Il file è vuoto.'] }

  const colonne = mappaColonne(righe[0])
  const mancanti = OBBLIGATORIE.filter((campo) => colonne[campo] === undefined)
  if (mancanti.length > 0) {
    return {
      soci: [],
      problemi: [
        `Nel file non trovo la colonna ${mancanti.map((c) => `«${ETICHETTA[c]}»`).join(', ')}. ` +
          'Controlla la prima riga del foglio: deve contenere i nomi delle colonne.',
      ],
    }
  }

  const soci: DatiSocio[] = []
  const problemi: string[] = []
  const emailViste = new Map<string, number>()
  const matricoleViste = new Map<string, number>()

  righe.slice(1).forEach((riga, indice) => {
    const numeroRiga = indice + 2 // la 1 è l'intestazione, e si conta da uno
    const valore = (campo: keyof DatiSocio) => (riga[colonne[campo] as number] ?? '').trim()

    if (riga.every((cella) => cella.trim() === '')) return

    const vuoti = OBBLIGATORIE.filter((campo) => valore(campo) === '')
    if (vuoti.length > 0) {
      problemi.push(
        `Riga ${numeroRiga}: manca ${vuoti.map((c) => ETICHETTA[c]).join(' e ')}. Riga saltata.`,
      )
      return
    }

    const email = valore('email')
    const matricola = valore('codiceDipendente')
    const chiaveEmail = normalizzaEmail(email)
    const chiaveMatricola = normalizzaMatricola(matricola)

    const primaEmail = emailViste.get(chiaveEmail)
    if (primaEmail !== undefined) {
      problemi.push(`Riga ${numeroRiga}: l’email ${email} è già alla riga ${primaEmail}. Riga saltata.`)
      return
    }
    const primaMatricola = matricoleViste.get(chiaveMatricola)
    if (primaMatricola !== undefined) {
      problemi.push(
        `Riga ${numeroRiga}: la matricola ${matricola} è già alla riga ${primaMatricola}. Riga saltata.`,
      )
      return
    }

    emailViste.set(chiaveEmail, numeroRiga)
    matricoleViste.set(chiaveMatricola, numeroRiga)

    soci.push({
      nome: valore('nome'),
      cognome: valore('cognome'),
      email,
      codiceDipendente: matricola,
      telefono: valore('telefono'),
      note: valore('note'),
    })
  })

  return { soci, problemi }
}

/** Una stringa SQL, con gli apostrofi raddoppiati. */
function testo(valore: string): string {
  return `'${valore.replace(/'/g, "''")}'`
}

/** Un campo facoltativo vuoto è `null`, mai una stringa vuota. */
function facoltativo(valore: string): string {
  return valore.trim() === '' ? 'null' : testo(valore)
}

export function sqlDiImportazione(soci: DatiSocio[]): string {
  if (soci.length === 0) return ''

  const righe = soci.map(
    (socio) =>
      `  (${testo(socio.nome)}, ${testo(socio.cognome)}, ${testo(socio.email)}, ` +
      `${testo(socio.codiceDipendente)}, ${facoltativo(socio.telefono)}, ${facoltativo(socio.note)})`,
  )

  return (
    '-- Generato da strumenti/genera-import-soci.mjs. Da eseguire su tabella vuota.\n' +
    'insert into soci (nome, cognome, email, codice_dipendente, telefono, note) values\n' +
    righe.join(',\n') +
    ';\n'
  )
}
