'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { clientServer } from '@/dati/supabaseServer'
import { schemaOfferta } from '@/dominio/offertaSchema'
import { sluggifica } from '@/dominio/slug'

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
    validaAl: String(datiModulo.get('validaAl') ?? ''),
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

/**
 * Crea una nuova offerta.
 *
 * `stato` arriva dal pulsante premuto: «Salva bozza» oppure «Pubblica». Sono
 * due pulsanti e non una casella perché il direttore deve poter interrompere a
 * metà senza chiedersi se quello che ha scritto è già online.
 */
export async function salvaOfferta(
  _statoPrecedente: EsitoSalvataggio | null,
  datiModulo: FormData,
): Promise<EsitoSalvataggio> {
  const esito = schemaOfferta.safeParse(leggiModulo(datiModulo))
  if (!esito.success) return { errori: raccogliErrori(esito) }

  const dati = esito.data
  const stato = datiModulo.get('azione') === 'pubblica' ? 'pubblicata' : 'bozza'
  const client = await clientServer()

  const { data, error } = await client
    .from('offerte')
    .insert({
      slug: `${sluggifica(dati.partner)}-${sluggifica(dati.vantaggio).slice(0, 24)}`,
      partner: dati.partner,
      categoria: dati.categoria,
      vantaggio: dati.vantaggio,
      descrizione_breve: dati.descrizione,
      descrizione: dati.descrizioneCompleta,
      condizioni: dati.condizioni,
      valida_dal: dati.validaDal,
      valida_al: dati.validaAl,
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
    return {
      errori: {
        modulo: duplicato
          ? 'Esiste già un’offerta con questo partner e questo vantaggio. Cambia il vantaggio, o modifica quella esistente.'
          : `Non è stato possibile salvare l’offerta (${error.message}).`,
      },
    }
  }

  revalidatePath('/offerte')
  revalidatePath('/')
  redirect(`/area-riservata/offerte/${data.id}?salvata=1`)
}
