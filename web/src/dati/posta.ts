import {
  corpoConferma,
  corpoEmail,
  corpoHtml,
  oggettoConferma,
  oggettoEmail,
  type RichiestaPerEmail,
} from '@/lib/emailRichiesta'

/**
 * L'invio dell'email ai direttori.
 *
 * Passa da Resend chiamando la sua API con `fetch`, senza aggiungere una
 * dipendenza per tre righe di HTTP: il pacchetto ufficiale non fa niente di
 * più di questo, e ogni dipendenza è una cosa da aggiornare per sempre.
 *
 * **L'invio è un tentativo, non una condizione.** La richiesta è già salvata
 * quando questa funzione parte: se l'email non parte — chiave mancante,
 * Resend giù, casella sbagliata — il socio ha comunque inviato e il suo
 * record esiste. Perdere la richiesta perché non è partita una notifica
 * sarebbe il modo peggiore di fallire.
 *
 * Quello che non deve succedere è che l'insuccesso resti invisibile: la riga
 * conserva `email_inviata`, e l'elenco in area riservata (fase 5) mostrerà
 * quali richieste non sono state annunciate a nessuno.
 */
export async function avvisaIDirettori(richiesta: RichiestaPerEmail): Promise<boolean> {
  const chiave = process.env.RESEND_API_KEY
  const destinatari = (process.env.EMAIL_DIRETTORI ?? '')
    .split(',')
    .map((indirizzo) => indirizzo.trim())
    .filter(Boolean)

  if (!chiave || destinatari.length === 0) {
    // Succede finché il direttivo non comunica gli indirizzi e non si apre il
    // servizio di invio. Non è un errore da nascondere né uno da urlare: la
    // richiesta c'è, l'avviso no, e chi legge i log deve saperlo.
    console.warn(
      `Richiesta #${richiesta.numero} salvata ma non annunciata: mancano RESEND_API_KEY o EMAIL_DIRETTORI.`,
    )
    return false
  }

  try {
    const risposta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${chiave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_MITTENTE ?? 'CRAL ARES <onboarding@resend.dev>',
        to: destinatari,
        subject: oggettoEmail(richiesta),
        text: corpoEmail(richiesta),
        html: corpoHtml(richiesta),
        // Il dettaglio che vale più di tutti gli altri messi insieme: il
        // direttore preme Rispondi e sta già scrivendo al socio. La risposta
        // è a mano, ed è lì che si guadagna o si perde tempo ogni settimana.
        reply_to: richiesta.email,
      }),
    })

    if (!risposta.ok) {
      console.error(
        `Resend ha rifiutato l’avviso della richiesta #${richiesta.numero}:`,
        risposta.status,
        await risposta.text(),
      )
      return false
    }

    return true
  } catch (errore) {
    console.error(`Errore nell’invio dell’avviso per la richiesta #${richiesta.numero}:`, errore)
    return false
  }
}

/**
 * La presa in carico che riceve il socio.
 *
 * Va **sempre all'email aziendale**, quella confrontata con l'anagrafica, e
 * mai al recapito che il socio ha scritto per la consegna. Non è una
 * distrazione: l'indirizzo della consegna non è verificato da nessuno, e
 * spedirci un'email trasformerebbe il modulo in un modo per mandare posta a
 * un indirizzo qualsiasi con il nostro mittente.
 *
 * Come l'avviso ai direttori, è un tentativo: la richiesta è già salvata, e
 * se la conferma non parte il socio ha comunque visto la conferma a schermo.
 */
export async function confermaAlSocio(
  richiesta: RichiestaPerEmail,
  riepilogo: string,
): Promise<void> {
  const chiave = process.env.RESEND_API_KEY
  if (!chiave) return

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${chiave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_MITTENTE ?? 'CRAL ARES <onboarding@resend.dev>',
        to: [richiesta.email],
        subject: oggettoConferma(richiesta),
        text: corpoConferma(richiesta, riepilogo),
        // Se il socio risponde a questa, deve arrivare ai direttori.
        reply_to: (process.env.EMAIL_DIRETTORI ?? '').split(',')[0]?.trim() || undefined,
      }),
    })
  } catch (errore) {
    console.error(`Conferma non inviata per la richiesta #${richiesta.numero}:`, errore)
  }
}
