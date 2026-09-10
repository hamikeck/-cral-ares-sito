import type { SupabaseClient } from '@supabase/supabase-js'
import type { Socio } from '@/dominio/socio'
import { normalizzaEmail, normalizzaMatricola } from '@/dominio/socio'
import { mappaSocio } from './mappaSocio'
import { COLONNE_SOCIO, type RigaSocio } from './righe'
import { clientPubblico } from './supabasePubblico'
import { clientServer } from './supabaseServer'

/**
 * Tutti i soci, in ordine di cognome.
 *
 * Arrivano solo a un redattore: la politica RLS non lascia leggere questa
 * tabella a nessun altro. Con quattrocento righe si portano in pagina tutte
 * insieme e si filtrano nel browser mentre si scrive — è la ricerca a essere
 * usata davvero, non lo scorrimento, e una ricerca che aspetta il server a
 * ogni lettera si sente.
 */
export async function tuttiISoci(): Promise<Socio[]> {
  const client = await clientServer()
  const { data, error } = await client
    .from('soci')
    .select(COLONNE_SOCIO)
    .order('cognome', { ascending: true })
    .order('nome', { ascending: true })

  if (error) {
    throw new Error(`Non è stato possibile leggere l’elenco dei soci (${error.message})`)
  }

  return (data as unknown as RigaSocio[]).map(mappaSocio)
}

/**
 * Chi occupa già questa email o questa matricola.
 *
 * Serve a trasformare un errore di chiave duplicata in una frase che un
 * direttore capisce: «Questa matricola è già assegnata a Mario Rossi» invece
 * di un codice di PostgreSQL. Si chiama **dopo** che l'inserimento è fallito,
 * non prima: controllare in anticipo aprirebbe una finestra fra il controllo e
 * la scrittura in cui due direttori possono inserire lo stesso socio, e
 * lascerebbe comunque il database come unico giudice vero.
 */
export async function sociInConflitto(
  client: SupabaseClient,
  email: string,
  codiceDipendente: string,
): Promise<{ perEmail?: Socio; perMatricola?: Socio }> {
  const { data } = await client.from('soci').select(COLONNE_SOCIO)
  if (!data) return {}

  const soci = (data as unknown as RigaSocio[]).map(mappaSocio)
  const emailCercata = normalizzaEmail(email)
  const matricolaCercata = normalizzaMatricola(codiceDipendente)

  return {
    perEmail: soci.find((socio) => normalizzaEmail(socio.email) === emailCercata),
    perMatricola: soci.find(
      (socio) => normalizzaMatricola(socio.codiceDipendente) === matricolaCercata,
    ),
  }
}

/**
 * Questa persona risulta fra i soci?
 *
 * La domanda la decide il database, con `risulta_socio`: la tabella `soci` non
 * è leggibile da una pagina pubblica, e non deve esserlo. La funzione risponde
 * vero o falso e non restituisce mai una riga — né il nome, né quale dei due
 * campi ha combaciato.
 *
 * Passa dal client pubblico, quello che non tocca i cookie: chi compila il
 * modulo non ha una sessione, e non deve averne bisogno.
 */
export async function risultaSocio(
  email: string,
  codiceDipendente: string,
): Promise<boolean> {
  const { data, error } = await clientPubblico().rpc('risulta_socio', {
    email_richiedente: email,
    matricola_richiedente: codiceDipendente,
  })

  if (error) {
    // Un errore qui non deve mai diventare un «sì»: se il database non
    // risponde, la richiesta non parte. Il dettaglio va nei log, non a schermo.
    console.error('Errore nel riscontro di un socio:', error)
    throw new Error('Non è stato possibile verificare l’iscrizione')
  }

  return data === true
}
