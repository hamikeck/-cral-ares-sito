/**
 * Da «UCI Cinemas» a «uci-cinemas».
 *
 * Lo slug finisce nell'indirizzo che i direttori incollano nell'email del
 * lunedì: deve restare leggibile e non contenere niente che un client di posta
 * possa spezzare. Gli accenti si tolgono invece di essere codificati, perché
 * `caff%C3%A8` in un'email sembra un errore.
 */
export function sluggifica(testo: string): string {
  return testo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
