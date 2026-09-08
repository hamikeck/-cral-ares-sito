import { z } from 'zod'

/**
 * La validazione di un'offerta, una sola per il modulo e per il server.
 *
 * I messaggi sono scritti per un direttore, non per uno sviluppatore: dicono
 * cosa fare («Scrivi il nome del partner») e non cosa è successo («campo
 * obbligatorio non valorizzato»). Sono la stessa cosa che il modulo mostra
 * mentre si scrive, quindi vivono qui e non dentro il componente.
 */
export const schemaOfferta = z
  .object({
    partner: z.string().trim().min(1, 'Scrivi il nome del partner.'),
    categoria: z.string().trim().min(1, 'Scegli una categoria.'),
    vantaggio: z
      .string()
      .trim()
      .min(1, 'Scrivi il vantaggio, per esempio «6,50 € invece di 9,50».')
      .max(60, 'Il vantaggio va scritto corto: al massimo 60 caratteri.'),
    descrizione: z
      .string()
      .trim()
      .min(1, 'Scrivi una riga di presentazione.')
      .max(160, 'La presentazione breve non può superare i 160 caratteri.'),
    descrizioneCompleta: z.string().trim().min(1, 'Scrivi la descrizione completa.'),
    condizioni: z
      .string()
      .transform((testo) =>
        testo
          .split('\n')
          .map((riga) => riga.trim())
          .filter((riga) => riga.length > 0),
      ),
    validaDal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Indica la data di inizio.'),
    // Niente regex qui: una convenzione permanente non ha una data di fine, e
    // il campo arriva vuoto dal modulo quando il direttore spunta «senza
    // scadenza». Se la stringa è vuota e la casella non è spuntata, il
    // controllo sta nel refine sotto — così il messaggio resta lo stesso sia
    // che manchi la data sia che il formato sia sbagliato.
    validaAl: z.string(),
    senzaScadenza: z.boolean().default(false),
    modalita: z.enum(['solo_sconto', 'biglietti', 'convenzione'], {
      error: 'Scegli come il socio ottiene il vantaggio.',
    }),
    istruzioni: z.string().trim().optional().default(''),
    indirizzo: z.string().trim().optional().default(''),
    telefono: z.string().trim().optional().default(''),
    sito: z.string().trim().optional().default(''),
    codiceSconto: z.string().trim().optional().default(''),
    inEvidenza: z.boolean().default(false),
  })
  .refine((dati) => dati.senzaScadenza || /^\d{4}-\d{2}-\d{2}$/.test(dati.validaAl), {
    message: 'Indica la data di fine.',
    path: ['validaAl'],
  })
  .refine((dati) => dati.senzaScadenza || dati.validaAl >= dati.validaDal, {
    message: 'La data di fine deve venire dopo la data di inizio.',
    path: ['validaAl'],
  })
  .refine((dati) => dati.modalita !== 'solo_sconto' || dati.istruzioni.length > 0, {
    message: 'Per uno sconto da esibire, scrivi cosa deve fare il socio alla cassa.',
    path: ['istruzioni'],
  })

export type DatiOfferta = z.infer<typeof schemaOfferta>
