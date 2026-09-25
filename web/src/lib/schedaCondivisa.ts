import { contenutiPagine } from '@/contenuti/pagine'

/**
 * Quello che hanno in comune tutte le anteprime.
 *
 * Sta in un modulo suo, e non nel layout, perché Next rifiuta le
 * esportazioni che un layout non prevede. Serve anche alla scheda
 * dell'offerta: Next non unisce i campi di `openGraph` fra layout e pagina,
 * e una pagina che dichiara il proprio titolo perderebbe nome del sito e
 * lingua, se non li ripetesse.
 */
export const SCHEDA_CONDIVISA = {
  siteName: contenutiPagine.associazione.nome,
  locale: 'it_IT',
  type: 'website',
} as const
