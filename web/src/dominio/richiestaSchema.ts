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

const MESSAGGIO_EMAIL =
  'Questo indirizzo non sembra un’email: controlla la chiocciola e il dominio.'

/**
 * I campi condivisi, come oggetto e non come schema già chiuso.
 *
 * Ogni modulo li mette accanto alle proprie domande in un unico `z.object`.
 * Incastrando invece due schemi uno dentro l'altro, gli errori arriverebbero
 * annidati e il modulo non saprebbe più sotto quale campo scriverli.
 */
export const campiDatiSocio = {
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
}

/** I controlli che dipendono da più campi insieme. */
export function controllaDatiSocio(
  dati: {
    consegna: Consegna
    emailPersonale: string
    telefono: string
    consensoPrivacy: boolean
  },
  contesto: z.RefinementCtx,
) {
  if (!dati.consensoPrivacy) {
    contesto.addIssue({
      code: 'custom',
      path: ['consensoPrivacy'],
      message: 'Serve la tua conferma per poter inviare la richiesta.',
    })
  }

  // I campi della consegna si controllano **solo** per la strada scelta. Chi
  // lascia scritto un numero e poi sceglie l'email non deve trovarsi un errore
  // da correggere per andare avanti: quel numero non serve a nessuno.
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
    // Nessun controllo sul formato, solo sulla lunghezza: i numeri si scrivono
    // con prefissi, spazi e trattini, e l'unico errore che vale la pena
    // fermare è quello di chi ne ha scritti tre.
    const cifre = dati.telefono.replace(/\D/g, '')
    if (cifre.length < 8) {
      contesto.addIssue({
        code: 'custom',
        path: ['telefono'],
        message: 'Scrivi il numero su cui vuoi ricevere il messaggio.',
      })
    }
  }
}

export const schemaDatiSocio = z.object(campiDatiSocio).superRefine(controllaDatiSocio)
export type DatiSocioRichiesta = z.infer<typeof schemaDatiSocio>

/**
 * Il tetto ai biglietti di una singola richiesta.
 *
 * Non è una regola dell'associazione ma una difesa contro la distrazione e la
 * malizia: nessuno prenota davvero quaranta posti dal modulo, e chi ne scrive
 * 999 ha sbagliato o sta provando. Chi ne vuole di più lo scrive nel
 * messaggio, e gliene parla un direttore.
 */
export const MASSIMO_BIGLIETTI = 10

export const schemaRichiestaCinema = z
  .object({
    ...campiDatiSocio,
    circuitoId: z.string().uuid('Scegli il circuito.'),

    /** Facoltativa: i biglietti valgono su tutto il circuito. */
    sedeId: z.string(),

    quantita: z.coerce
      .number({ message: 'Scrivi quanti biglietti ti servono.' })
      .int('I biglietti si contano a uno a uno.')
      .min(1, 'Serve almeno un biglietto.')
      .max(
        MASSIMO_BIGLIETTI,
        `Da qui se ne possono chiedere al massimo ${MASSIMO_BIGLIETTI}. Se te ne servono di più, scrivilo nel messaggio.`,
      ),

    pagamento: z.enum(['bonifico', 'busta_paga'], { message: 'Scegli come vuoi pagare.' }),
  })
  .superRefine(controllaDatiSocio)

export type DatiRichiestaCinema = z.infer<typeof schemaRichiestaCinema>
