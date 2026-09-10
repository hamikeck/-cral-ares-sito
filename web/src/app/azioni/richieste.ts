'use server'

import { importoBiglietti } from '@/dominio/circuito'
import { schemaRichiestaCinema } from '@/dominio/richiestaSchema'
import { circuitiConSedi } from '@/dati/circuiti'
import { risultaSocio } from '@/dati/soci'
import { clientPubblico } from '@/dati/supabasePubblico'

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

function leggiModulo(datiModulo: FormData) {
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
    circuitoId: String(datiModulo.get('circuitoId') ?? ''),
    sedeId: String(datiModulo.get('sedeId') ?? ''),
    quantita: String(datiModulo.get('quantita') ?? ''),
    pagamento: String(datiModulo.get('pagamento') ?? ''),
  }
}

function raccogliErrori(esito: ReturnType<typeof schemaRichiestaCinema.safeParse>) {
  const errori: Record<string, string> = {}
  if (!esito.success) {
    esito.error.issues.forEach((problema) => {
      const campo = String(problema.path[0] ?? 'modulo')
      if (!errori[campo]) errori[campo] = problema.message
    })
  }
  return errori
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
  const esito = schemaRichiestaCinema.safeParse(leggiModulo(datiModulo))
  if (!esito.success) return { errori: raccogliErrori(esito) }

  const dati = esito.data

  let socio: boolean
  try {
    socio = await risultaSocio(dati.email, dati.codiceDipendente)
  } catch {
    return { errori: { modulo: MESSAGGIO_GENERICO } }
  }
  if (!socio) return { errori: { modulo: MESSAGGIO_NON_SOCIO } }

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
    .select('id')
    .single()

  if (error) {
    console.error('Errore nell’invio di una richiesta cinema:', error)
    // Il codice 42501 è la politica del database che ha respinto la riga:
    // vuol dire che il riscontro qui sopra e quello nella politica non sono
    // d'accordo, ed è un caso che non deve succedere. Al socio però serve una
    // frase utile, non una spiegazione.
    return { errori: { modulo: error.code === '42501' ? MESSAGGIO_NON_SOCIO : MESSAGGIO_GENERICO } }
  }

  return {
    inviata: {
      pagamentoBonifico: dati.pagamento === 'bonifico',
      importo: importoBiglietti(circuito, dati.quantita),
      causale: `CRAL ARES biglietti ${circuito.nome} ${dati.cognome} ${dati.codiceDipendente}`,
    },
  }
}
