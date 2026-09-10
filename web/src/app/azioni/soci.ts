'use server'

import { revalidatePath } from 'next/cache'
import { redattoreAttivoCon } from '@/dati/redattori'
import { sociInConflitto } from '@/dati/soci'
import { clientServer } from '@/dati/supabaseServer'
import { schemaSocio } from '@/dominio/socioSchema'

export type EsitoSocio = { errori?: Record<string, string>; aggiunto?: string }

const MESSAGGIO_SESSIONE_SCADUTA =
  'La sessione non è più valida: esci e accedi di nuovo, poi riprova.'

const MESSAGGIO_ERRORE_GENERICO =
  'Non è stato possibile salvare. Riprova fra poco; se il problema continua, avvisa chi si occupa del sito.'

function leggiModulo(datiModulo: FormData) {
  return {
    nome: String(datiModulo.get('nome') ?? ''),
    cognome: String(datiModulo.get('cognome') ?? ''),
    email: String(datiModulo.get('email') ?? ''),
    codiceDipendente: String(datiModulo.get('codiceDipendente') ?? ''),
    telefono: String(datiModulo.get('telefono') ?? ''),
    note: String(datiModulo.get('note') ?? ''),
  }
}

function raccogliErrori(esito: ReturnType<typeof schemaSocio.safeParse>) {
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
 * Aggiunge un socio all'elenco.
 *
 * Il controllo di autorizzazione sta qui e non solo nella pagina: chiunque può
 * inviare un POST diretto a una Server Action, e il rendering del modulo su
 * una pagina protetta non difende niente. La RLS del database è la seconda
 * rete, non la prima.
 */
export async function aggiungiSocio(
  _statoPrecedente: EsitoSocio | null,
  datiModulo: FormData,
): Promise<EsitoSocio> {
  const client = await clientServer()
  if (!(await redattoreAttivoCon(client))) {
    return { errori: { modulo: MESSAGGIO_SESSIONE_SCADUTA } }
  }

  const esito = schemaSocio.safeParse(leggiModulo(datiModulo))
  if (!esito.success) return { errori: raccogliErrori(esito) }

  const dati = esito.data
  const { error } = await client.from('soci').insert({
    nome: dati.nome,
    cognome: dati.cognome,
    email: dati.email,
    codice_dipendente: dati.codiceDipendente,
    telefono: dati.telefono || null,
    note: dati.note || null,
  })

  if (error) {
    if (error.code !== '23505') {
      // Il dettaglio serve a chi legge i log, non al direttore.
      console.error('Errore nell’aggiunta di un socio:', error)
      return { errori: { modulo: MESSAGGIO_ERRORE_GENERICO } }
    }

    // Duplicato: si dice **chi** occupa già quel posto, perché la domanda
    // successiva del direttore è sempre quella, e senza il nome dovrebbe
    // cercarselo a mano nell'elenco.
    const { perEmail, perMatricola } = await sociInConflitto(
      client,
      dati.email,
      dati.codiceDipendente,
    )

    if (perEmail) {
      return {
        errori: {
          email: `Questa email è già di ${perEmail.nome} ${perEmail.cognome}.`,
        },
      }
    }
    if (perMatricola) {
      return {
        errori: {
          codiceDipendente: `Questa matricola è già assegnata a ${perMatricola.nome} ${perMatricola.cognome}.`,
        },
      }
    }

    return { errori: { modulo: MESSAGGIO_ERRORE_GENERICO } }
  }

  revalidatePath('/area-riservata/soci')
  return { aggiunto: `${dati.nome} ${dati.cognome}` }
}

/**
 * Toglie un socio dall'elenco.
 *
 * La cancellazione è definitiva, ma non porta via niente d'altro: lo storico
 * delle richieste (fase 4) conserva una copia dei dati di chi le ha inviate,
 * proprio perché una persona possa uscire dall'anagrafica senza svuotare il
 * passato.
 */
export async function rimuoviSocio(datiModulo: FormData): Promise<void> {
  const client = await clientServer()
  if (!(await redattoreAttivoCon(client))) return

  const id = String(datiModulo.get('id') ?? '')
  if (!id) return

  const { error } = await client.from('soci').delete().eq('id', id)
  if (error) console.error('Errore nella rimozione di un socio:', error)

  revalidatePath('/area-riservata/soci')
}
