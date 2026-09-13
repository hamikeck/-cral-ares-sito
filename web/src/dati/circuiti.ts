import type { Circuito } from '@/dominio/circuito'
import type { RigaCircuito } from './righe'
import { clientPubblico } from './supabasePubblico'

const COLONNE =
  'id, nome, prezzo_socio, ordine, sedi(id, nome, citta, link_programmazione, ordine)'

/**
 * I circuiti convenzionati con le loro sale, per il modulo del cinema.
 *
 * Le sale arrivano annidate in una sola interrogazione, e sono già solo quelle
 * attive: a filtrarle è la politica RLS «chiunque legge le sedi attive», non
 * una condizione scritta qui. La regola sta in un posto solo.
 *
 * Passa dal client pubblico, quello che non tocca i cookie: la pagina del
 * modulo è uguale per tutti e non ha bisogno di sapere chi la guarda.
 */
export async function circuitiConSedi(): Promise<Circuito[]> {
  const { data, error } = await clientPubblico()
    .from('circuiti')
    .select(COLONNE)
    .eq('attivo', true)
    .order('ordine', { ascending: true })

  if (error) {
    throw new Error(`Non è stato possibile leggere i circuiti (${error.message})`)
  }

  return (data as unknown as RigaCircuito[]).map((riga) => {
    const circuito: Circuito = {
      id: riga.id,
      nome: riga.nome,
      sedi: [...riga.sedi]
        .sort((una, altra) => una.ordine - altra.ordine || una.nome.localeCompare(altra.nome, 'it'))
        .map((sede) => {
          const mappata: Circuito['sedi'][number] = { id: sede.id, nome: sede.nome }
          if (sede.citta) mappata.citta = sede.citta
          if (sede.link_programmazione) mappata.linkProgrammazione = sede.link_programmazione
          return mappata
        }),
    }

    // `null` è la risposta del database, `undefined` è l'assenza nel dominio:
    // qui vuol dire «il direttivo non ha ancora comunicato il listino», e il
    // modulo mostrerà il servizio senza cifra.
    if (riga.prezzo_socio !== null) circuito.prezzoSocio = Number(riga.prezzo_socio)

    return circuito
  })
}
