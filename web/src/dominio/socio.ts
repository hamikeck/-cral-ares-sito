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

/**
 * Vero se chi scrive è questo socio.
 *
 * **Basta uno dei due campi**, ed è una scelta deliberata (spec 9.1): il socio
 * che scrive dall'indirizzo personale viene riconosciuto dalla matricola,
 * quello che sbaglia una cifra della matricola viene riconosciuto dall'email.
 * Il falso allarme qui costa una telefonata arrabbiata; il caso opposto — un
 * estraneo che indovina l'email *oppure* la matricola di un dipendente — vale
 * l'accesso a un modulo che non restituisce niente di valore.
 *
 * Un campo vuoto non combacia mai. Sembra ovvio e non lo è: due stringhe vuote
 * sono uguali fra loro, e senza questo controllo un socio con un campo non
 * compilato diventerebbe la chiave che apre a chiunque lasci lo stesso campo
 * in bianco.
 */
export function combacia(
  socio: Socio,
  richiedente: { email: string; codiceDipendente: string },
): boolean {
  const email = normalizzaEmail(richiedente.email)
  const matricola = normalizzaMatricola(richiedente.codiceDipendente)

  if (email !== '' && email === normalizzaEmail(socio.email)) return true
  if (
    matricola !== '' &&
    matricola === normalizzaMatricola(socio.codiceDipendente)
  )
    return true

  return false
}
