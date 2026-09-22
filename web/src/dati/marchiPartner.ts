/**
 * I loghi dei partner che abbiamo, elencati a mano.
 *
 * Non è una colonna del database, ed è una scelta: la tabella `offerte` non
 * ha `logo_url`, i direttori non hanno un posto da cui caricare un'immagine,
 * e aggiungere l'uno senza l'altro avrebbe messo in produzione una colonna
 * che nessuno può riempire. Finché i loghi arrivano per email a chi cura il
 * sito, il posto giusto per elencarli è un file che si modifica insieme
 * all'immagine che si aggiunge in `public/partner/`.
 *
 * La chiave è il nome del partner come lo scrive il direttore nel modulo,
 * normalizzato: senza accorgersene, «TEATRO BELLINI» e «Teatro Bellini»
 * trovano lo stesso file.
 *
 * Quando la colonna arriverà, `mappaOfferta` leggerà quella e userà questo
 * elenco solo come ripiego — o lo cancellerà.
 */

const MARCHI: Record<string, string> = {
  'teatro bellini': '/partner/teatro-bellini.png',
}

function normalizza(partner: string): string {
  return partner.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** Il percorso pubblico del logo di un partner, se ce l'abbiamo. */
export function logoDelPartner(partner: string): string | undefined {
  return MARCHI[normalizza(partner)]
}
