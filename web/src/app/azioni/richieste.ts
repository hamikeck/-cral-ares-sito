'use server'

import { importoBiglietti } from '@/dominio/circuito'
import type { DatiSocioRichiesta } from '@/dominio/richiestaSchema'
import {
  schemaRichiestaCinema,
  schemaRichiestaConvenzione,
  schemaRichiestaOffertaBiglietti,
  schemaRichiestaOffertaInformazioni,
} from '@/dominio/richiestaSchema'
import { offertaConId } from '@/dati/offerte'
import { circuitiConSedi } from '@/dati/circuiti'
import { avvisaIDirettori, confermaAlSocio } from '@/dati/posta'
import { risultaSocio } from '@/dati/soci'
import { clientPubblico } from '@/dati/supabasePubblico'
import { formattaEuro } from '@/dominio/circuito'

export type EsitoRichiesta = {
  errori?: Record<string, string>
  /**
   * Cosa mostrare dopo l'invio.
   *
   * Non è l'id della riga: al socio serve sapere **quanto** e **con quale
   * causale**, e la causale deve essere leggibile da chi la ritrova nel
   * proprio estratto conto — un identificatore tecnico non lo è.
   */
  inviata?: {
    pagamentoBonifico: boolean
    importo?: number
    causale: string
  }
}

const MESSAGGIO_NON_SOCIO =
  'Non risulti fra i soci del CRAL ARES, quindi la richiesta non è stata inviata. ' +
  'Controlla di aver scritto l’email aziendale e la matricola che hai comunicato all’associazione. ' +
  'Se pensi ci sia un errore, scrivi ai direttori.'

const MESSAGGIO_GENERICO =
  'Non è stato possibile inviare la richiesta. Riprova fra poco; se il problema continua, scrivi ai direttori.'

/** I campi che tutti i moduli hanno in comune. */
function leggiDatiSocio(datiModulo: FormData) {
  return {
    nome: String(datiModulo.get('nome') ?? ''),
    cognome: String(datiModulo.get('cognome') ?? ''),
    codiceDipendente: String(datiModulo.get('codiceDipendente') ?? ''),
    email: String(datiModulo.get('email') ?? ''),
    consegna: String(datiModulo.get('consegna') ?? 'email_aziendale'),
    emailPersonale: String(datiModulo.get('emailPersonale') ?? ''),
    telefono: String(datiModulo.get('telefono') ?? ''),
    messaggio: String(datiModulo.get('messaggio') ?? ''),
    consensoPrivacy: datiModulo.get('consensoPrivacy') === 'on',
  }
}

/** Gli errori di Zod diventano una mappa campo → messaggio, come li vuole il modulo. */
function raccogliErrori(problemi: { path: PropertyKey[]; message: string }[]) {
  const errori: Record<string, string> = {}
  problemi.forEach((problema) => {
    const campo = String(problema.path[0] ?? 'modulo')
    if (!errori[campo]) errori[campo] = problema.message
  })
  return errori
}

/** Come si racconta all'email dei direttori dove il socio vuole ricevere. */
const CONSEGNE_LEGGIBILI: Record<string, string> = {
  email_aziendale: 'Sull’email aziendale',
  email_personale: 'Su un’altra email',
  whatsapp: 'Su WhatsApp',
}

function recapitoScelto(dati: {
  consegna: string
  emailPersonale: string
  telefono: string
}): string | undefined {
  if (dati.consegna === 'email_personale') return dati.emailPersonale
  if (dati.consegna === 'whatsapp') return dati.telefono
  return undefined
}

/**
 * Il riscontro, con il suo esito già tradotto in un messaggio.
 *
 * Lo fanno tutti i moduli allo stesso modo, e sbagliarlo in uno solo
 * significherebbe aprire una porta che le altre tengono chiusa.
 */
async function fermaChiNonERisultaSocio(dati: {
  email: string
  codiceDipendente: string
}): Promise<EsitoRichiesta | undefined> {
  try {
    if (await risultaSocio(dati.email, dati.codiceDipendente)) return undefined
  } catch {
    return { errori: { modulo: MESSAGGIO_GENERICO } }
  }
  return { errori: { modulo: MESSAGGIO_NON_SOCIO } }
}

/**
 * Invia una richiesta di biglietti del cinema.
 *
 * Il riscontro si fa **due volte**, e non è una dimenticanza. Qui, perché chi
 * non risulta socio meriti una frase in italiano che gli dica cosa
 * controllare; e nella politica del database, che rifiuta comunque la riga di
 * un estraneo anche se qualcuno chiamasse l'API saltando questa funzione. La
 * cortesia sta nel codice, la sicurezza nella politica.
 *
 * Il circuito e la sede si rileggono dal database invece di fidarsi di quanto
 * arriva dal modulo: il nome copiato nella richiesta e soprattutto **il prezzo
 * da cui nasce l'importo** non possono venire dal browser, altrimenti la cifra
 * la sceglie chi compila.
 */
export async function inviaRichiestaCinema(
  _statoPrecedente: EsitoRichiesta | null,
  datiModulo: FormData,
): Promise<EsitoRichiesta> {
  const esito = schemaRichiestaCinema.safeParse({
    ...leggiDatiSocio(datiModulo),
    circuitoId: String(datiModulo.get('circuitoId') ?? ''),
    sedeId: String(datiModulo.get('sedeId') ?? ''),
    quantita: String(datiModulo.get('quantita') ?? ''),
    pagamento: String(datiModulo.get('pagamento') ?? ''),
  })
  if (!esito.success) return { errori: raccogliErrori(esito.error.issues) }

  const dati = esito.data

  const respinto = await fermaChiNonERisultaSocio(dati)
  if (respinto) return respinto

  const circuiti = await circuitiConSedi()
  const circuito = circuiti.find((uno) => uno.id === dati.circuitoId)
  if (!circuito) return { errori: { circuitoId: 'Scegli il circuito.' } }

  const sede = circuito.sedi.find((una) => una.id === dati.sedeId)

  const { data, error } = await clientPubblico()
    .from('richieste')
    .insert({
      tipo: 'cinema',
      nome: dati.nome,
      cognome: dati.cognome,
      codice_dipendente: dati.codiceDipendente,
      email: dati.email,
      consegna: dati.consegna,
      // Solo il recapito della strada scelta viene salvato: l'altro, se il
      // socio l'aveva scritto prima di cambiare idea, non riguarda nessuno.
      email_personale: dati.consegna === 'email_personale' ? dati.emailPersonale : null,
      telefono: dati.consegna === 'whatsapp' ? dati.telefono : null,
      pagamento: dati.pagamento,
      // Congelato adesso: fra sei mesi il listino cambia, e questa richiesta
      // deve continuare a raccontare la cifra che il socio ha letto.
      importo: importoBiglietti(circuito, dati.quantita) ?? null,
      circuito_id: circuito.id,
      circuito: circuito.nome,
      sede_id: sede?.id ?? null,
      sede: sede?.nome ?? null,
      quantita: dati.quantita,
      messaggio: dati.messaggio || null,
      consenso_privacy: true,
      consenso_il: new Date().toISOString(),
    })
    .select('id, numero')
    .single()

  if (error) {
    console.error('Errore nell’invio di una richiesta cinema:', error)
    // Il codice 42501 è la politica del database che ha respinto la riga:
    // vuol dire che il riscontro qui sopra e quello nella politica non sono
    // d'accordo, ed è un caso che non deve succedere. Al socio però serve una
    // frase utile, non una spiegazione.
    return { errori: { modulo: error.code === '42501' ? MESSAGGIO_NON_SOCIO : MESSAGGIO_GENERICO } }
  }

  // L'avviso parte **dopo** il salvataggio, e il suo esito non cambia quello
  // che il socio vede: la sua richiesta esiste comunque. Se non parte, la
  // colonna `email_inviata` resta falsa e l'elenco in area riservata lo dirà.
  const importo = importoBiglietti(circuito, dati.quantita)

  const avviso = {
    numero: data.numero,
    nome: dati.nome,
    cognome: dati.cognome,
    codiceDipendente: dati.codiceDipendente,
    email: dati.email,
    consegna: CONSEGNE_LEGGIBILI[dati.consegna] ?? dati.consegna,
    recapito: recapitoScelto(dati),
    oggettoBreve: `${dati.quantita} biglietti ${circuito.nome}`,
    righe: [
      { etichetta: 'Circuito', valore: circuito.nome },
      ...(sede ? [{ etichetta: 'Sala', valore: sede.nome }] : []),
      { etichetta: 'Quantità', valore: String(dati.quantita) },
      ...(importo !== undefined
        ? [{ etichetta: 'Importo', valore: formattaEuro(importo) }]
        : []),
      {
        etichetta: 'Pagamento',
        valore: dati.pagamento === 'bonifico' ? 'Cedolino (bonifico)' : 'Trattenuta in busta paga',
      },
    ],
    messaggio: dati.messaggio || undefined,
  }
  const annunciata = await avvisaIDirettori(avviso)

  if (annunciata) {
    // Passa da una funzione e non da un `update`: il ruolo anonimo non ha il
    // permesso di riscrivere una richiesta, e non deve averlo — con un update
    // aperto chiunque potrebbe modificare quella di un altro.
    await clientPubblico().rpc('segna_avviso_inviato', { richiesta_id: data.id })
  }

  // La presa in carico va all'email aziendale e non al recapito della
  // consegna: quello non è verificato da nessuno, e spedirci un'email
  // trasformerebbe il modulo in un modo per mandare posta a un indirizzo
  // qualsiasi con il nostro mittente.
  await confermaAlSocio(avviso, avviso.oggettoBreve.toLowerCase())

  return {
    inviata: {
      pagamentoBonifico: dati.pagamento === 'bonifico',
      importo: importoBiglietti(circuito, dati.quantita),
      causale: `CRAL ARES biglietti ${circuito.nome} ${dati.cognome} ${dati.codiceDipendente}`,
    },
  }
}

/**
 * Invia una richiesta di convenzione.
 *
 * Gemella di quella del cinema, e più corta: non c'è niente da pagare, quindi
 * non si chiede come — chiederlo sarebbe un campo senza senso da compilare,
 * visto che a questo punto non si sa nemmeno se la convenzione esiste.
 */
export async function inviaRichiestaConvenzione(
  _statoPrecedente: EsitoRichiesta | null,
  datiModulo: FormData,
): Promise<EsitoRichiesta> {
  const esito = schemaRichiestaConvenzione.safeParse({
    ...leggiDatiSocio(datiModulo),
    convenzione: String(datiModulo.get('convenzione') ?? ''),
  })
  if (!esito.success) return { errori: raccogliErrori(esito.error.issues) }

  const dati = esito.data

  const respinto = await fermaChiNonERisultaSocio(dati)
  if (respinto) return respinto

  const { data, error } = await clientPubblico()
    .from('richieste')
    .insert({
      tipo: 'convenzione',
      nome: dati.nome,
      cognome: dati.cognome,
      codice_dipendente: dati.codiceDipendente,
      email: dati.email,
      consegna: dati.consegna,
      email_personale: dati.consegna === 'email_personale' ? dati.emailPersonale : null,
      telefono: dati.consegna === 'whatsapp' ? dati.telefono : null,
      convenzione: dati.convenzione,
      messaggio: dati.messaggio,
      consenso_privacy: true,
      consenso_il: new Date().toISOString(),
    })
    .select('id, numero')
    .single()

  if (error) {
    console.error('Errore nell’invio di una richiesta convenzione:', error)
    return { errori: { modulo: error.code === '42501' ? MESSAGGIO_NON_SOCIO : MESSAGGIO_GENERICO } }
  }

  const avviso = {
    numero: data.numero,
    nome: dati.nome,
    cognome: dati.cognome,
    codiceDipendente: dati.codiceDipendente,
    email: dati.email,
    consegna: CONSEGNE_LEGGIBILI[dati.consegna] ?? dati.consegna,
    recapito: recapitoScelto(dati),
    oggettoBreve: `Convenzione ${dati.convenzione}`,
    righe: [{ etichetta: 'Convenzione', valore: dati.convenzione }],
    messaggio: dati.messaggio,
  }
  const annunciata = await avvisaIDirettori(avviso)

  if (annunciata) {
    await clientPubblico().rpc('segna_avviso_inviato', { richiesta_id: data.id })
  }

  // La presa in carico va all'email aziendale e non al recapito della
  // consegna: quello non è verificato da nessuno, e spedirci un'email
  // trasformerebbe il modulo in un modo per mandare posta a un indirizzo
  // qualsiasi con il nostro mittente.
  await confermaAlSocio(avviso, avviso.oggettoBreve.toLowerCase())

  // Niente IBAN né importo: qui non c'è ancora niente da pagare.
  return { inviata: { pagamentoBonifico: false, causale: '' } }
}

/**
 * Invia una richiesta partita dalla scheda di un'offerta.
 *
 * **La modalità si rilegge dal database**, mai dal modulo: è lei a decidere
 * quali campi sono obbligatori, e se arrivasse dal browser basterebbe
 * cambiarla per saltare i controlli — chiedere dei biglietti senza dire
 * quanti, o senza scegliere come pagarli.
 */
export async function inviaRichiestaOfferta(
  _statoPrecedente: EsitoRichiesta | null,
  datiModulo: FormData,
): Promise<EsitoRichiesta> {
  const slug = String(datiModulo.get('slug') ?? '')
  const trovata = await offertaConId(slug)

  if (!trovata) {
    // L'offerta è stata ritirata mentre il socio compilava, oppure è scaduta.
    return {
      errori: {
        modulo:
          'Questa offerta non è più disponibile. Torna all’elenco: potresti trovarne una simile.',
      },
    }
  }

  const { id, offerta } = trovata
  const perBiglietti = offerta.modalita === 'biglietti'

  const comuni = leggiDatiSocio(datiModulo)

  // Due schemi e due rami separati, invece di uno schema con tutto dentro:
  // un modulo che chiede dei posti e uno che chiede informazioni non hanno le
  // stesse regole, e mescolarle vorrebbe dire renderle tutte facoltative.
  let dati: DatiSocioRichiesta & { messaggio: string }
  let biglietti:
    | {
        quantita: number
        titoloEvento: string
        dataPreferita: string
        orarioPreferito: string
        pagamento: 'bonifico' | 'busta_paga'
      }
    | undefined

  if (perBiglietti) {
    const esito = schemaRichiestaOffertaBiglietti.safeParse({
      ...comuni,
      slug,
      quantita: String(datiModulo.get('quantita') ?? ''),
      titoloEvento: String(datiModulo.get('titoloEvento') ?? ''),
      dataPreferita: String(datiModulo.get('dataPreferita') ?? ''),
      orarioPreferito: String(datiModulo.get('orarioPreferito') ?? ''),
      pagamento: String(datiModulo.get('pagamento') ?? ''),
    })
    if (!esito.success) return { errori: raccogliErrori(esito.error.issues) }

    dati = esito.data
    biglietti = {
      quantita: esito.data.quantita,
      titoloEvento: esito.data.titoloEvento,
      dataPreferita: esito.data.dataPreferita,
      orarioPreferito: esito.data.orarioPreferito,
      pagamento: esito.data.pagamento,
    }
  } else {
    const esito = schemaRichiestaOffertaInformazioni.safeParse({ ...comuni, slug })
    if (!esito.success) return { errori: raccogliErrori(esito.error.issues) }
    dati = esito.data
  }

  const respinto = await fermaChiNonERisultaSocio(dati)
  if (respinto) return respinto

  const { data, error } = await clientPubblico()
    .from('richieste')
    .insert({
      tipo: 'offerta',
      offerta_id: id,
      nome: dati.nome,
      cognome: dati.cognome,
      codice_dipendente: dati.codiceDipendente,
      email: dati.email,
      consegna: dati.consegna,
      email_personale: dati.consegna === 'email_personale' ? dati.emailPersonale : null,
      telefono: dati.consegna === 'whatsapp' ? dati.telefono : null,
      pagamento: biglietti?.pagamento ?? null,
      quantita: biglietti?.quantita ?? null,
      titolo_evento: biglietti?.titoloEvento || null,
      data_preferita: biglietti?.dataPreferita || null,
      orario_preferito: biglietti?.orarioPreferito || null,
      messaggio: dati.messaggio || null,
      consenso_privacy: true,
      consenso_il: new Date().toISOString(),
    })
    .select('id, numero')
    .single()

  if (error) {
    console.error('Errore nell’invio di una richiesta da offerta:', error)
    return { errori: { modulo: error.code === '42501' ? MESSAGGIO_NON_SOCIO : MESSAGGIO_GENERICO } }
  }

  const avviso = {
    numero: data.numero,
    nome: dati.nome,
    cognome: dati.cognome,
    codiceDipendente: dati.codiceDipendente,
    email: dati.email,
    consegna: CONSEGNE_LEGGIBILI[dati.consegna] ?? dati.consegna,
    recapito: recapitoScelto(dati),
    oggettoBreve: biglietti
      ? `${biglietti.quantita} posti ${offerta.partner}`
      : `Informazioni ${offerta.partner}`,
    righe: [
      { etichetta: 'Offerta', valore: `${offerta.partner} — ${offerta.vantaggio}` },
      ...(biglietti ? [{ etichetta: 'Posti', valore: String(biglietti.quantita) }] : []),
      ...(biglietti?.titoloEvento
        ? [{ etichetta: 'Evento', valore: biglietti.titoloEvento }]
        : []),
      ...(biglietti?.dataPreferita
        ? [
            {
              etichetta: 'Quando',
              valore: [biglietti.dataPreferita, biglietti.orarioPreferito]
                .filter(Boolean)
                .join(' '),
            },
          ]
        : []),
      ...(biglietti
        ? [
            {
              etichetta: 'Pagamento',
              valore:
                biglietti.pagamento === 'bonifico'
                  ? 'Cedolino (bonifico)'
                  : 'Trattenuta in busta paga',
            },
          ]
        : []),
    ],
    messaggio: dati.messaggio || undefined,
  }
  const annunciata = await avvisaIDirettori(avviso)

  if (annunciata) {
    await clientPubblico().rpc('segna_avviso_inviato', { richiesta_id: data.id })
  }

  // La presa in carico va all'email aziendale e non al recapito della
  // consegna: quello non è verificato da nessuno, e spedirci un'email
  // trasformerebbe il modulo in un modo per mandare posta a un indirizzo
  // qualsiasi con il nostro mittente.
  await confermaAlSocio(avviso, avviso.oggettoBreve.toLowerCase())

  return {
    inviata: {
      pagamentoBonifico: biglietti?.pagamento === 'bonifico',
      causale: `CRAL ARES ${offerta.partner} ${dati.cognome} ${dati.codiceDipendente}`,
    },
  }
}
