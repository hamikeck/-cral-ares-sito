/**
 * Le due lettere che stanno al posto del logo di un partner.
 *
 * I loghi arrivano uno alla volta, e la maggior parte delle convenzioni non
 * ne avrà mai uno: il ripiego non è un quadrato vuoto ma le iniziali del
 * nome, che è quello che fanno le rubriche dei telefoni da quindici anni.
 *
 * L'apostrofo non divide una parola — «Farmacia D'Atri» dà FD e non FA — e i
 * nomi di una parola sola prendono le prime due lettere, perché una lettera
 * in un quadrato da 52 px sembra un errore invece di un'iniziale.
 */

/** La prima lettera di una parola, saltando numeri e punteggiatura iniziale. */
function primaLettera(parola: string): string {
  return parola.match(/\p{L}/u)?.[0] ?? ''
}

export function inizialiDa(nome: string): string {
  const parole = nome.split(/[\s\-–—]+/).filter((parola) => primaLettera(parola) !== '')

  if (parole.length === 0) return ''
  if (parole.length === 1) return parole[0].slice(0, 2).toUpperCase()

  return (primaLettera(parole[0]) + primaLettera(parole[1])).toUpperCase()
}
