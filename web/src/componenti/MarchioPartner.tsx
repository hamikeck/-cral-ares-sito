import { inizialiDa } from '@/dominio/iniziali'

/**
 * Il quadrato con il marchio del partner, in testa alla scheda.
 *
 * Serve a una cosa sola: far riconoscere un'offerta prima di leggerla. In un
 * nastro di tredici schede tutte uguali, il logo del Teatro Bellini si vede
 * da mezzo metro, il nome no.
 *
 * Quando il logo non c'è — ed è il caso della maggior parte delle
 * convenzioni, oggi e probabilmente per sempre — restano le iniziali su un
 * fondo appena più chiaro del pannello. È un ripiego voluto, non un buco:
 * il quadrato vuoto sarebbe stato peggio di nessun quadrato.
 *
 * Due dettagli di accessibilità, entrambi deliberati:
 *
 * - `alt=""` e `aria-hidden`: il nome del partner è già il titolo della
 *   scheda, e il collegamento si chiama come lui. Dare un nome anche al
 *   marchio significherebbe farlo leggere due volte di fila a chi ascolta.
 * - niente collegamento qui sopra. Il collegamento della scheda è uno solo,
 *   sul nome del partner, esteso al riquadro con uno pseudo-elemento: è la
 *   ragione per cui esiste `fuoco-scheda`, e un secondo link nello stesso
 *   riquadro la manderebbe a monte.
 */

/**
 * Nel nastro il marchio è più piccolo di otto pixel: la carta è larga 18,5
 * rem e ogni pixel tolto al quadrato è un pixel dato al nome del partner,
 * che lì va a capo prima.
 */
const MISURA = {
  elenco: 'size-13',
  nastro: 'size-11',
} as const

export function MarchioPartner({
  partner,
  logoUrl,
  iniziali,
  dimensione = 'elenco',
}: {
  partner: string
  logoUrl?: string
  iniziali?: string
  dimensione?: keyof typeof MISURA
}) {
  const misura = MISURA[dimensione]

  if (logoUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={logoUrl}
        alt=""
        width={52}
        height={52}
        className={`${misura} shrink-0 rounded-[0.625rem] object-cover`}
      />
    )
  }

  /* Il fondo è lo stesso gradiente del pannello, un gradino più chiaro:
     `pannello-alto` verso `blu-notte`, due colori che il sito ha già. Il
     disegno proponeva un #0E3F4F che non sta in tavolozza; `blu-notte` dista
     quattro punti di luminosità e nessuno saprebbe distinguerli. */
  return (
    <span
      aria-hidden="true"
      className={`${misura} insegna flex shrink-0 items-center justify-center rounded-[0.625rem] border border-filo bg-[linear-gradient(var(--color-pannello-alto),var(--color-blu-notte))] text-base font-extrabold text-luce`}
    >
      {iniziali ?? inizialiDa(partner)}
    </span>
  )
}
