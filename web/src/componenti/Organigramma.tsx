import { inizialiDa } from '@/dominio/iniziali'

export type Carica = { ruolo: string; nome: string }

export type Direttivo = {
  /** Il presidente: in cima all'albero, da solo. */
  presidente: Carica
  /** Vicepresidente, segretario, tesoriere: la riga sotto. */
  cariche: Carica[]
  /** I consiglieri, senza incarico: un nome ciascuno. */
  consiglieri: string[]
}

/**
 * L'organigramma del CRAL in «Chi siamo».
 *
 * Niente oro: è il colore del vantaggio economico (docs/decisioni.md, «la
 * regola dei tre usi dell'oro»), e qui non si vende niente. Le persone hanno
 * le iniziali nello stesso riquadro dei partner senza marchio, e i ruoli in
 * azzurro.
 *
 * Le linee dell'albero sono decorative e nascoste ai lettori di schermo: per
 * loro l'organigramma è un elenco di ruoli e nomi, nell'ordine in cui si
 * legge.
 */
export function Organigramma({
  direttivo,
  email,
  forma = 'albero',
}: {
  direttivo: Direttivo
  email: string
  forma?: 'albero' | 'tessere'
}) {
  return forma === 'albero' ? (
    <Albero direttivo={direttivo} email={email} />
  ) : (
    <Tessere direttivo={direttivo} email={email} />
  )
}

function Albero({ direttivo, email }: { direttivo: Direttivo; email: string }) {
  const { presidente, cariche, consiglieri } = direttivo

  return (
    <div className="flex flex-col gap-10">
      {/* Sul telefono una colonna con una linea che unisce le persone; da
          `sm` un albero, con il presidente al centro e le cariche sotto. */}
      <ul className="relative flex flex-col gap-4 sm:items-center sm:gap-0">
        <span
          aria-hidden="true"
          className="absolute top-8 bottom-8 left-10 w-px bg-parete sm:hidden"
        />
        <li className="relative sm:w-72">
          <Persona carica={presidente} rilievo />
        </li>

        {cariche.length > 0 ? (
          <li className="relative w-full sm:pt-12">
            {/* Il tronco e il ramo orizzontale, solo sull'albero. */}
            <span
              aria-hidden="true"
              className="absolute top-0 left-1/2 hidden h-6 w-px bg-parete sm:block"
            />
            <span
              aria-hidden="true"
              className="absolute top-6 hidden h-px bg-parete sm:block"
              style={{
                left: `${50 / cariche.length}%`,
                right: `${50 / cariche.length}%`,
              }}
            />
            <ul
              className="grid gap-4 sm:gap-4"
              style={{
                gridTemplateColumns: `repeat(${cariche.length}, minmax(0, 1fr))`,
              }}
            >
              {cariche.map((carica) => (
                <li key={carica.ruolo} className="relative max-sm:col-span-full">
                  <span
                    aria-hidden="true"
                    className="absolute -top-6 left-1/2 hidden h-6 w-px bg-parete sm:block"
                  />
                  <Persona carica={carica} />
                </li>
              ))}
            </ul>
          </li>
        ) : null}
      </ul>

      <Consiglio consiglieri={consiglieri} />
      <Segreteria email={email} />
    </div>
  )
}

function Tessere({ direttivo, email }: { direttivo: Direttivo; email: string }) {
  const { presidente, cariche, consiglieri } = direttivo

  return (
    <div className="flex flex-col gap-10">
      <ul className="grid gap-4 sm:grid-cols-2">
        <li className="sm:col-span-2">
          <Persona carica={presidente} rilievo />
        </li>
        {cariche.map((carica) => (
          <li key={carica.ruolo}>
            <Persona carica={carica} />
          </li>
        ))}
      </ul>
      <Consiglio consiglieri={consiglieri} />
      <Segreteria email={email} />
    </div>
  )
}

function Persona({ carica, rilievo = false }: { carica: Carica; rilievo?: boolean }) {
  return (
    <div
      className={`pannello relative flex items-center gap-4 px-4 py-4 ${
        rilievo
          ? 'border-luce/50 sm:flex-col sm:gap-3 sm:py-6 sm:text-center'
          : 'sm:flex-col sm:gap-3 sm:text-center'
      }`}
    >
      <Iniziali nome={carica.nome} grandi={rilievo} />
      <div className="min-w-0">
        <p className="text-xs font-semibold tracking-[0.14em] text-luce uppercase">
          {carica.ruolo}
        </p>
        <p className={`mt-1 font-titolo font-bold text-chiaro ${rilievo ? 'text-2xl' : 'text-lg'}`}>
          {carica.nome}
        </p>
      </div>
    </div>
  )
}

function Consiglio({ consiglieri }: { consiglieri: string[] }) {
  if (consiglieri.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold tracking-[0.14em] text-luce uppercase">
        Consiglio direttivo
      </h3>
      <ul className="flex flex-wrap gap-3">
        {consiglieri.map((nome) => (
          <li
            key={nome}
            className="flex items-center gap-3 rounded-full border border-parete bg-pannello py-1.5 pr-4 pl-1.5"
          >
            <Iniziali nome={nome} piccole />
            <span className="text-corpo text-chiaro">{nome}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Segreteria({ email }: { email: string }) {
  return (
    <section className="pannello flex flex-col gap-2 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div>
        <h3 className="text-xs font-semibold tracking-[0.14em] text-luce uppercase">Segreteria</h3>
        <p className="mt-1 text-corpo text-lettura">
          Iscrizioni, informazioni e tutto quello che non trovi sul sito.
        </p>
      </div>
      <a
        href={`mailto:${email}`}
        className="fuoco-su-scuro shrink-0 rounded font-semibold text-luce underline underline-offset-4"
      >
        {email}
      </a>
    </section>
  )
}

function Iniziali({
  nome,
  grandi = false,
  piccole = false,
}: {
  nome: string
  grandi?: boolean
  piccole?: boolean
}) {
  const misura = grandi ? 'size-16 text-xl' : piccole ? 'size-8 text-xs' : 'size-12 text-base'
  const angoli = piccole ? 'rounded-full' : 'rounded-[0.625rem]'

  return (
    <span
      aria-hidden="true"
      className={`${misura} ${angoli} flex shrink-0 items-center justify-center border border-filo bg-[linear-gradient(var(--color-pannello-alto),var(--color-blu-notte))] font-extrabold text-luce`}
    >
      {inizialiDa(nome)}
    </span>
  )
}
