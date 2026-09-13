/**
 * Un socio, come lo vedono le pagine.
 *
 * Esiste per una ragione sola: stabilire chi può inviare una richiesta.
 * Deliberato in riunione il 3 settembre 2026, così i direttori non ricevono
 * email di sconosciuti.
 */
export type Socio = {
  id: string
  nome: string
  cognome: string
  email: string
  /** La «matricola», nelle parole del direttivo. */
  codiceDipendente: string
  telefono?: string
  /** Uso interno dei direttori: non compare mai su una pagina pubblica. */
  note?: string
}

/**
 * Le due normalizzazioni del riscontro.
 *
 * **Devono restare identiche agli indici unici della migrazione `0004`**
 * (`lower(email)` e `upper(replace(codice_dipendente, ' ', ''))`). Se le due
 * regole divergono, il database accetta come distinte due righe che il codice
 * considera la stessa persona, e il doppione entra dalla porta che credevamo
 * chiusa.
 */
export function normalizzaEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function normalizzaMatricola(codice: string): string {
  return codice.replace(/\s/g, '').toUpperCase()
}
