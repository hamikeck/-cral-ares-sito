import { z } from 'zod'

/**
 * I dati del socio, uguali in tutti e tre i moduli di richiesta.
 *
 * Sopra questo blocco cambia solo cosa si chiede — il circuito e la quantità
 * per il cinema, il testo libero per una convenzione — mentre identità,
 * consegna e consenso sono sempre gli stessi. Vivono qui perché la stessa
 * regola deve valere nel browser e sul server: due validazioni separate
 * divergono, e la seconda a divergere è sempre quella che protegge.
 *
 * I messaggi sono scritti per un socio: dicono cosa fare, e dove serve
 * spiegano **perché** un campo è chiesto. «Email non valida» lascia una
 * persona a fissare il campo; «quella che hai comunicato al CRAL» le dice
 * quale indirizzo scrivere.
 */

/** Dove il socio vuole ricevere quello che ha chiesto. Rispecchia l'enum del database. */
export const CONSEGNE = ['email_aziendale', 'email_personale', 'whatsapp'] as const
export type Consegna = (typeof CONSEGNE)[number]

const MESSAGGIO_EMAIL = 'Questo indirizzo non sembra un’email: controlla la chiocciola e il dominio.'

export const schemaDatiSocio = z
  .object({
    nome: z.string().trim().min(1, 'Scrivi il tuo nome.'),
    cognome: z.string().trim().min(1, 'Scrivi il tuo cognome.'),

    /**
     * La matricola non ha un formato imposto: in Agenzia ne convivono di forme
     * diverse, e il riscontro perdona spazi e maiuscole. Un controllo inventato
     * qui respingerebbe un socio vero per una regola che non esiste.
     */
    codiceDipendente: z.string().trim().min(1, 'Scrivi la tua matricola.'),

    email: z
      .string()
      .trim()
      .min(1, 'Scrivi la tua email aziendale, quella che hai comunicato al CRAL.')
      .email(MESSAGGIO_EMAIL),

    consegna: z.enum(CONSEGNE),
    emailPersonale: z.string().trim(),
    telefono: z.string().trim(),
    messaggio: z.string().trim(),

    consensoPrivacy: z.boolean(),
  })
  .superRefine((dati, contesto) => {
    if (!dati.consensoPrivacy) {
      contesto.addIssue({
        code: 'custom',
        path: ['consensoPrivacy'],
        message: 'Serve la tua conferma per poter inviare la richiesta.',
      })
    }

    // I campi della consegna si controllano **solo** per la strada scelta.
    // Chi lascia scritto un numero e poi sceglie l'email non deve trovarsi un
    // errore da correggere per andare avanti: quel numero non serve a nessuno.
    if (dati.consegna === 'email_personale') {
      if (dati.emailPersonale === '') {
        contesto.addIssue({
          code: 'custom',
          path: ['emailPersonale'],
          message: 'Scrivi l’indirizzo su cui vuoi ricevere.',
        })
      } else if (!z.string().email().safeParse(dati.emailPersonale).success) {
        contesto.addIssue({ code: 'custom', path: ['emailPersonale'], message: MESSAGGIO_EMAIL })
      }
    }

    if (dati.consegna === 'whatsapp') {
      // Nessun controllo sul formato, solo sulla lunghezza: i numeri si
      // scrivono con prefissi, spazi e trattini, e l'unico errore che vale la
      // pena fermare è quello di chi ne ha scritti tre.
      const cifre = dati.telefono.replace(/\D/g, '')
      if (cifre.length < 8) {
        contesto.addIssue({
          code: 'custom',
          path: ['telefono'],
          message: 'Scrivi il numero su cui vuoi ricevere il messaggio.',
        })
      }
    }
  })

export type DatiSocioRichiesta = z.infer<typeof schemaDatiSocio>
