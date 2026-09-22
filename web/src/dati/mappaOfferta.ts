import type { Contatti, Offerta } from '@/dominio/offerta'
import { logoDelPartner } from './marchiPartner'
import type { RigaOfferta } from './righe'

/** `null` è una risposta del database, `undefined` è l'assenza nel dominio. */
function valore(campo: string | null): string | undefined {
  return campo ?? undefined
}

function contatti(riga: RigaOfferta): Contatti {
  const recapiti: Contatti = {}
  if (riga.indirizzo) recapiti.indirizzo = riga.indirizzo
  if (riga.telefono) recapiti.telefono = riga.telefono
  if (riga.link_partner) recapiti.sito = riga.link_partner
  if (riga.codice_sconto) recapiti.codiceSconto = riga.codice_sconto
  return recapiti
}

/**
 * Una riga della tabella `offerte` diventa un'`Offerta`.
 *
 * È l'unico punto del progetto che conosce i nomi delle colonne oltre alle
 * query: le pagine parlano solo il linguaggio del dominio.
 */
export function mappaOfferta(riga: RigaOfferta): Offerta {
  return {
    slug: riga.slug,
    partner: riga.partner,
    categoria: riga.categoria,
    /* Il logo non arriva dal database: la tabella non ha una colonna e i
       direttori non hanno un posto da cui caricare un'immagine. Finché è
       così, lo cerchiamo per nome nell'elenco dei marchi che abbiamo. */
    logoUrl: logoDelPartner(riga.partner),
    vantaggio: riga.vantaggio,
    descrizione: riga.descrizione_breve,
    descrizioneCompleta: riga.descrizione,
    condizioni: riga.condizioni ?? [],
    validaDal: riga.valida_dal,
    validaAl: valore(riga.valida_al),
    modalita: riga.modalita,
    istruzioni: valore(riga.istruzioni),
    inEvidenza: riga.in_evidenza,
    contatti: contatti(riga),
  }
}
