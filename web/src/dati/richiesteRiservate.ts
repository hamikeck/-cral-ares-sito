import type { Richiesta } from '@/dominio/richiesta'
import { COLONNE_RICHIESTA, type RigaRichiesta } from './righe'
import { clientServer } from './supabaseServer'

function valore(campo: string | null): string | undefined {
  return campo ?? undefined
}

function mappa(riga: RigaRichiesta): Richiesta {
  const richiesta: Richiesta = {
    id: riga.id,
    numero: riga.numero,
    tipo: riga.tipo,
    creataIl: riga.creata_il,
    nome: riga.nome,
    cognome: riga.cognome,
    codiceDipendente: riga.codice_dipendente,
    email: riga.email,
    avvisoInviato: riga.email_inviata,
  }

  if (riga.consegna) richiesta.consegna = riga.consegna
  // Il recapito è quello della strada scelta: è l'unico salvato.
  const recapito = riga.consegna === 'whatsapp' ? riga.telefono : riga.email_personale
  if (recapito) richiesta.recapito = recapito
  if (riga.pagamento) richiesta.pagamento = riga.pagamento
  if (riga.importo !== null) richiesta.importo = Number(riga.importo)
  if (riga.quantita !== null) richiesta.quantita = riga.quantita

  richiesta.circuito = valore(riga.circuito)
  richiesta.sede = valore(riga.sede)
  richiesta.convenzione = valore(riga.convenzione)
  richiesta.titoloEvento = valore(riga.titolo_evento)
  richiesta.dataPreferita = valore(riga.data_preferita)
  richiesta.orarioPreferito = valore(riga.orario_preferito)
  richiesta.messaggio = valore(riga.messaggio)

  if (riga.offerte) richiesta.offerta = `${riga.offerte.partner} — ${riga.offerte.vantaggio}`

  return richiesta
}

/**
 * Tutte le richieste, dalla più recente.
 *
 * Arrivano solo a un redattore: la politica RLS non lascia leggere questa
 * tabella a nessun altro, e una richiesta contiene nome, matricola e recapiti
 * di una persona.
 *
 * Non c'è paginazione, ed è una scelta con una scadenza: con quattrocento soci
 * e un servizio che gira a mesi, le richieste di un anno stanno in una
 * schermata sola da scorrere. Se un giorno diventassero migliaia, la ricerca
 * nel browser smetterebbe di bastare e si aggiungerà — non prima.
 */
export async function tutteLeRichieste(): Promise<Richiesta[]> {
  const client = await clientServer()
  const { data, error } = await client
    .from('richieste')
    .select(COLONNE_RICHIESTA)
    .order('creata_il', { ascending: false })

  if (error) {
    throw new Error(`Non è stato possibile leggere le richieste (${error.message})`)
  }

  return (data as unknown as RigaRichiesta[]).map(mappa)
}
