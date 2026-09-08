'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { redattoreAttivoCon } from '@/dati/redattori'
import { clientServer } from '@/dati/supabaseServer'
import { schemaOfferta } from '@/dominio/offertaSchema'
import { slugOfferta } from '@/dominio/slug'

export type EsitoSalvataggio = { errori?: Record<string, string>; id?: string }

function leggiModulo(datiModulo: FormData) {
  return {
    partner: String(datiModulo.get('partner') ?? ''),
    categoria: String(datiModulo.get('categoria') ?? ''),
    vantaggio: String(datiModulo.get('vantaggio') ?? ''),
    descrizione: String(datiModulo.get('descrizione') ?? ''),
    descrizioneCompleta: String(datiModulo.get('descrizioneCompleta') ?? ''),
    condizioni: String(datiModulo.get('condizioni') ?? ''),
    validaDal: String(datiModulo.get('validaDal') ?? ''),
    // Un campo disabilitato non viaggia nel FormData: quando «Senza
    // scadenza» è spuntata, `validaAl` arriva già vuota da sola.
    validaAl: String(datiModulo.get('validaAl') ?? ''),
    senzaScadenza: datiModulo.get('senzaScadenza') === 'on',
    modalita: String(datiModulo.get('modalita') ?? 'biglietti'),
    istruzioni: String(datiModulo.get('istruzioni') ?? ''),
    indirizzo: String(datiModulo.get('indirizzo') ?? ''),
    telefono: String(datiModulo.get('telefono') ?? ''),
    sito: String(datiModulo.get('sito') ?? ''),
    codiceSconto: String(datiModulo.get('codiceSconto') ?? ''),
    inEvidenza: datiModulo.get('inEvidenza') === 'on',
  }
}

/** Gli errori di Zod diventano una mappa campo → messaggio, come li vuole il modulo. */
function raccogliErrori(esito: ReturnType<typeof schemaOfferta.safeParse>) {
  const errori: Record<string, string> = {}
  if (!esito.success) {
    esito.error.issues.forEach((problema) => {
      const campo = String(problema.path[0] ?? 'modulo')
      if (!errori[campo]) errori[campo] = problema.message
    })
  }
  return errori
}

const MESSAGGIO_SESSIONE_SCADUTA =
  'La sessione non è più valida: esci e accedi di nuovo, poi riprova a salvare.'

const MESSAGGIO_ERRORE_GENERICO =
  'Non è stato possibile salvare l’offerta. Riprova fra poco; se il problema continua, avvisa chi si occupa del sito.'

/**
 * Crea una nuova offerta.
 *
 * `stato` arriva dal pulsante premuto: «Salva bozza» oppure «Pubblica». Sono
 * due pulsanti e non una casella perché il direttore deve poter interrompere a
 * metà senza chiedersi se quello che ha scritto è già online.
 *
 * Il rendering del modulo solo su una pagina protetta non basta come difesa:
 * chiunque può inviare un POST diretto a questa azione. Il controllo qui
 * sotto, con lo stesso client che farà l'inserimento, è la verifica che conta
 * — la RLS del database è una seconda rete, non la prima.
 */
export async function salvaOfferta(
  _statoPrecedente: EsitoSalvataggio | null,
  datiModulo: FormData,
): Promise<EsitoSalvataggio> {
  const client = await clientServer()
  if (!(await redattoreAttivoCon(client))) {
    return { errori: { modulo: MESSAGGIO_SESSIONE_SCADUTA } }
  }

  const esito = schemaOfferta.safeParse(leggiModulo(datiModulo))
  if (!esito.success) return { errori: raccogliErrori(esito) }

  const dati = esito.data
  const stato = datiModulo.get('azione') === 'pubblica' ? 'pubblicata' : 'bozza'

  const { data, error } = await client
    .from('offerte')
    .insert({
      slug: slugOfferta(dati.partner, dati.vantaggio, dati.validaDal),
      partner: dati.partner,
      categoria: dati.categoria,
      vantaggio: dati.vantaggio,
      descrizione_breve: dati.descrizione,
      descrizione: dati.descrizioneCompleta,
      condizioni: dati.condizioni,
      valida_dal: dati.validaDal,
      // Stringa vuota diventa nullo: sul database `valida_al` assente è
      // l'unico modo corretto di dire «nessuna scadenza», mai un valore
      // convenzionale che diventerebbe una data vera per chi la legge.
      valida_al: dati.validaAl || null,
      in_evidenza: dati.inEvidenza,
      modalita: dati.modalita,
      istruzioni: dati.istruzioni || null,
      indirizzo: dati.indirizzo || null,
      telefono: dati.telefono || null,
      link_partner: dati.sito || null,
      codice_sconto: dati.codiceSconto || null,
      stato,
    })
    .select('id')
    .single()

  if (error) {
    const duplicato = error.code === '23505'
    if (!duplicato) {
      // Il dettaglio (per esempio una policy RLS respinta) serve a chi legge
      // i log, non al direttore: sulla pagina resta solo il messaggio fisso.
      console.error('Errore nel salvataggio di un’offerta:', error)
    }
    return {
      errori: {
        modulo: duplicato
          ? 'Esiste già un’offerta con questo partner e questo vantaggio nello stesso anno. Cambia il vantaggio, o modifica quella esistente.'
          : MESSAGGIO_ERRORE_GENERICO,
      },
    }
  }

  revalidatePath('/offerte')
  revalidatePath('/')
  redirect(`/area-riservata/offerte/${data.id}?salvata=1`)
}

/**
 * Aggiorna un'offerta esistente.
 *
 * Stesso schema, stesso controllo d'autorizzazione di `salvaOfferta` — senza,
 * questa sarebbe una seconda porta aperta sul fianco di quella appena chiusa.
 *
 * Lo slug **non** si tocca: è l'indirizzo che i soci hanno già ricevuto per
 * email. Cambiarlo perché è cambiato il vantaggio romperebbe ogni vecchio
 * collegamento, che è esattamente ciò che lo spec vuole evitare.
 */
export async function aggiornaOfferta(
  _statoPrecedente: EsitoSalvataggio | null,
  datiModulo: FormData,
): Promise<EsitoSalvataggio> {
  const id = String(datiModulo.get('id') ?? '')
  if (!id) return { errori: { modulo: MESSAGGIO_ERRORE_GENERICO } }

  const client = await clientServer()
  if (!(await redattoreAttivoCon(client))) {
    return { errori: { modulo: MESSAGGIO_SESSIONE_SCADUTA } }
  }

  const esito = schemaOfferta.safeParse(leggiModulo(datiModulo))
  if (!esito.success) return { errori: raccogliErrori(esito) }

  const dati = esito.data
  const stato = datiModulo.get('azione') === 'pubblica' ? 'pubblicata' : 'bozza'

  const { data, error } = await client
    .from('offerte')
    .update({
      partner: dati.partner,
      categoria: dati.categoria,
      vantaggio: dati.vantaggio,
      descrizione_breve: dati.descrizione,
      descrizione: dati.descrizioneCompleta,
      condizioni: dati.condizioni,
      valida_dal: dati.validaDal,
      // Stringa vuota diventa nullo: sul database `valida_al` assente è
      // l'unico modo corretto di dire «nessuna scadenza», mai un valore
      // convenzionale che diventerebbe una data vera per chi la legge.
      valida_al: dati.validaAl || null,
      in_evidenza: dati.inEvidenza,
      modalita: dati.modalita,
      istruzioni: dati.istruzioni || null,
      indirizzo: dati.indirizzo || null,
      telefono: dati.telefono || null,
      link_partner: dati.sito || null,
      codice_sconto: dati.codiceSconto || null,
      stato,
    })
    .eq('id', id)
    .select('slug')
    .single()

  if (error) {
    // Il dettaglio serve a chi legge i log, non al direttore: sulla pagina
    // resta solo il messaggio fisso.
    console.error('Errore nell’aggiornamento di un’offerta:', error)
    return { errori: { modulo: MESSAGGIO_ERRORE_GENERICO } }
  }

  // Senza queste tre righe la pubblicazione non sarebbe immediata: la home,
  // l'elenco e la scheda resterebbero quelli generati fino a un'ora prima, e
  // il direttore penserebbe di aver sbagliato qualcosa. La scheda si
  // rigenera con lo slug vero appena letto dal database, non ricostruito qui
  // — è la garanzia che non si stia invalidando l'indirizzo sbagliato.
  revalidatePath('/offerte')
  revalidatePath('/')
  revalidatePath(`/offerte/${data.slug}`)
  redirect(`/area-riservata/offerte/${id}?salvata=1`)
}

/**
 * Elimina un'offerta.
 *
 * Il ritiro normale è «Salva bozza»: l'offerta sparisce dal sito ma resta
 * scritta e ripubblicabile. L'eliminazione serve solo a togliere di mezzo una
 * bozza sbagliata, e in pagina è dietro una conferma a due gesti — non un
 * `confirm()` del browser — che nomina l'offerta prima di lasciar premere.
 *
 * Niente qui limita l'eliminazione alle bozze: il pannello compare anche per
 * un'offerta pubblicata, la cui scheda **è** stata generata. Per questo lo
 * slug si legge dalla riga appena eliminata — `.select('slug').single()`
 * sulla stessa `delete`, come `aggiornaOfferta` fa sulla `update` — e non si
 * ricostruisce dai dati del modulo: è la garanzia di rigenerare l'indirizzo
 * vero, non quello che si crede sia vero.
 */
export async function eliminaOfferta(datiModulo: FormData): Promise<void> {
  const client = await clientServer()
  if (!(await redattoreAttivoCon(client))) {
    redirect('/area-riservata/uscita?nonAutorizzato=1')
  }

  const id = String(datiModulo.get('id') ?? '')
  const { data, error } = await client
    .from('offerte')
    .delete()
    .eq('id', id)
    .select('slug')
    .single()

  if (error) {
    // Il dettaglio serve a chi legge i log, non al direttore. Sulla pagina
    // l'offerta resta al suo posto — la delete non è andata a buon fine — e
    // l'avviso lo dice: senza, il direttore non saprebbe se ha sbagliato lui,
    // se deve riprovare, o se il sito è rotto.
    console.error('Errore nell’eliminazione di un’offerta:', error)
    redirect('/area-riservata?erroreEliminazione=1')
  }

  // Senza queste tre righe la scheda eliminata resterebbe servita fino a
  // un'ora: un socio potrebbe aprire quella di un'offerta appena ritirata.
  revalidatePath('/offerte')
  revalidatePath('/')
  revalidatePath(`/offerte/${data.slug}`)
  redirect('/area-riservata')
}
