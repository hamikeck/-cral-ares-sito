import { z } from 'zod'

/**
 * La validazione di un socio, una sola per il modulo e per il server.
 *
 * I messaggi sono scritti per un direttore, non per uno sviluppatore: dicono
 * cosa fare e non cosa è successo. La regola vale anche per l'email — «questo
 * indirizzo non sembra un'email» dice a chi ha sbagliato dove guardare, mentre
 * «formato non valido» lo lascia a fissare il campo.
 */
export const schemaSocio = z.object({
  nome: z.string().trim().min(1, 'Scrivi il nome.'),
  cognome: z.string().trim().min(1, 'Scrivi il cognome.'),
  email: z
    .string()
    .trim()
    .min(1, 'Scrivi l’email.')
    .email('Questo indirizzo non sembra un’email: controlla la chiocciola e il dominio.'),

  /**
   * La matricola non ha un formato imposto.
   *
   * In Agenzia ne convivono di forme diverse, e un controllo inventato qui
   * respingerebbe un socio vero per una regola che non esiste. Il database
   * impedisce comunque il doppione, confrontando la matricola senza spazi e
   * in maiuscolo.
   */
  codiceDipendente: z.string().trim().min(1, 'Scrivi la matricola.'),

  telefono: z.string().trim(),
  note: z.string().trim(),
})

export type DatiSocio = z.infer<typeof schemaSocio>
