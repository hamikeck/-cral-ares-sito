/**
 * Da «UCI Cinemas» a «uci-cinemas».
 *
 * Lo slug finisce nell'indirizzo che i direttori incollano nell'email del
 * lunedì: deve restare leggibile e non contenere niente che un client di posta
 * possa spezzare. Gli accenti si tolgono invece di essere codificati, perché
 * `caff%C3%A8` in un'email sembra un errore.
 *
 * L'intervallo `\u0300-\u036f` è quello dei segni diacritici combinanti
 * dello standard Unicode: scritto come escape invece che con i caratteri
 * letterali, resta leggibile e non rischia di corrompersi a un copia-incolla
 * o a una riformattazione del file.
 */
export function sluggifica(testo: string): string {
  return testo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Oltre questa lunghezza la parte partner+vantaggio viene troncata. */
const LUNGHEZZA_MASSIMA_BASE = 40

/**
 * Lo slug di un'offerta: partner, vantaggio e anno di inizio validità.
 *
 * Comporre prima e sluggificare dopo — invece di sluggificare partner e
 * vantaggio separatamente e incollarli — evita che il taglio a lunghezza
 * fissa cada in mezzo a una parola o subito dopo un trattino, rimettendone
 * uno in coda proprio dopo che `sluggifica` lo aveva tolto. Il taglio qui
 * cade sempre sull'ultimo trattino prima del limite, quindi su un confine di
 * parola.
 *
 * L'anno finale è quello che permette di ripubblicare la stessa convenzione
 * la stagione successiva: senza, «UCI Cinemas» con lo stesso vantaggio
 * dell'anno prima risulterebbe un duplicato, e il direttore si sentirebbe
 * dire di cambiare un vantaggio che invece è corretto. Con l'anno,
 * «uci-cinemas-ingresso-ridotto-2026» e «…-2027» convivono.
 */
export function slugOfferta(partner: string, vantaggio: string, validaDal: string): string {
  const base = troncaSuConfineDiParola(
    sluggifica(`${partner} ${vantaggio}`),
    LUNGHEZZA_MASSIMA_BASE,
  )
  const anno = validaDal.slice(0, 4)
  return anno ? `${base}-${anno}` : base
}

function troncaSuConfineDiParola(slug: string, lunghezza: number): string {
  if (slug.length <= lunghezza) return slug

  const tagliato = slug.slice(0, lunghezza)
  const ultimoTrattino = tagliato.lastIndexOf('-')
  return (ultimoTrattino > 0 ? tagliato.slice(0, ultimoTrattino) : tagliato).replace(/-+$/, '')
}
