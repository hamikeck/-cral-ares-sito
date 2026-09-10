import type { Socio } from '@/dominio/socio'
import type { RigaSocio } from './righe'

/**
 * Una riga della tabella `soci` diventa un `Socio`.
 *
 * Stessa regola della mappatura delle offerte: `null` è una risposta del
 * database, `undefined` è l'assenza nel dominio, e le pagine non conoscono
 * mai i nomi delle colonne.
 */
export function mappaSocio(riga: RigaSocio): Socio {
  const socio: Socio = {
    id: riga.id,
    nome: riga.nome,
    cognome: riga.cognome,
    email: riga.email,
    codiceDipendente: riga.codice_dipendente,
  }

  if (riga.telefono) socio.telefono = riga.telefono
  if (riga.note) socio.note = riga.note

  return socio
}
