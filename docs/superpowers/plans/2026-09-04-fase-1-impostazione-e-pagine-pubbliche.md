# Fase 1 — Impostazione del progetto e pagine pubbliche

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** portare online lo scheletro del sito CRAL ARES — identità visiva, intestazione, piè di pagina e le pagine di presentazione — su un impianto Next.js collaudato e distribuito su Netlify.

**Architecture:** applicazione Next.js 16 (App Router, TypeScript, Tailwind CSS v4) nella cartella `web/` del repository, accanto a `docs/` e `assets/`. In questa fase tutte le pagine sono statiche: nessun database, nessun modulo, nessuna email. I testi vivono in un unico modulo di contenuti (`src/contenuti/`) perché il direttivo li fornirà dopo e non si deve andare a cercarli sparsi nei componenti. I colori del marchio sono definiti una volta sola e verificati da un test che calcola i rapporti di contrasto.

**Tech Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · Vitest + Testing Library + axe-core · Netlify

**Spec:** `docs/superpowers/specs/2026-08-25-sito-cral-ares-design.md` (rev. 04/09/2026)

## Global Constraints

Valgono per ogni task del piano.

- **Lingua: italiano.** Ogni testo visibile all'utente è in italiano, accenti compresi. I nomi di variabili, funzioni e file sono in italiano dove descrivono il dominio (`soci`, `richieste`, `circuiti`), in inglese dove sono convenzioni del framework (`page.tsx`, `layout.tsx`).
- **Accessibilità: WCAG 2.1 AA.** Ogni pagina naviga da tastiera, ha un solo `<h1>`, usa elementi di riferimento (`header`, `main`, `footer`, `nav`) e supera il controllo axe strutturale.
- **Mobile-first.** I soci aprono il sito dal telefono, spesso da un link ricevuto per email. Ogni schermata si progetta prima a 360 px di larghezza.
- **Palette del marchio**, valori esatti da rispettare:
  `azzurro #73D1EA` · `arancione #EAA256` · `blu-profondo #0E5C74` · `blu-notte #0A3D4D` · `ambra-scura #96591B`.
  Azzurro e arancione **non si usano mai per testo su bianco** (1,74:1 e 2,14:1, sotto il minimo di 4,5:1): sono accenti, sfondi e dettagli.
- **Hosting: Netlify, mai Vercel.** Vercel vieta l'uso commerciale sul piano gratuito e considera commerciale il caso in cui chi scrive il codice è pagato.
- **Nessun cookie di profilazione**, nessuno strumento di analisi che ne installi.
- **Comandi npm dalla cartella `web/`.** Il repository ha la sua radice un livello sopra.

---

## Struttura dei file al termine della fase

```
netlify.toml                         distribuzione: cartella base, comando, plugin Next
web/
├── vitest.config.ts                 configurazione dei test
├── vitest.setup.ts                  estensioni di Testing Library
├── public/
│   └── logo-cral-ares.svg           copia del marchio da assets/
└── src/
    ├── app/
    │   ├── layout.tsx               struttura comune, metadati, lang="it"
    │   ├── globals.css              @theme con i token del marchio
    │   ├── icon.svg                 icona della scheda del browser
    │   ├── page.tsx                 home
    │   ├── chi-siamo/page.tsx
    │   ├── iscriviti/page.tsx
    │   ├── privacy/page.tsx
    │   └── cookie/page.tsx
    ├── componenti/
    │   ├── Intestazione.tsx         logo, navigazione, salta-al-contenuto
    │   └── PiedePagina.tsx          contatti e rimandi legali
    ├── contenuti/
    │   ├── pagine.ts                tutti i testi delle pagine statiche
    │   └── navigazione.ts           voci di menu, in un posto solo
    ├── lib/
    │   └── marchio.ts               colori e calcolo del contrasto
    └── test/
        └── accessibilita.ts         helper axe condiviso
```

**Perché così.** I testi stanno in `contenuti/` e non dentro le pagine perché arriveranno dal direttivo a lavoro iniziato: sostituirli deve essere un'operazione su un file solo, che non richiede di capire React. Le voci di menu stanno in un file condiviso perché compaiono in due posti (intestazione e piè di pagina) e disallinearle è la prima cosa che succede. I colori stanno in `lib/marchio.ts` e non solo nel CSS perché così un test può verificarli.

---

## Task 1: Impianto del progetto Next.js

**Files:**
- Create: `web/` (intera applicazione generata)
- Modify: `.gitignore` (radice del repository)

**Interfaces:**
- Consumes: niente, è il primo task
- Produces: applicazione avviabile con `npm run dev` da `web/`, percorsi sorgente sotto `web/src/`, alias di importazione `@/*` → `web/src/*`

- [ ] **Step 1: Generare il progetto**

Dalla radice del repository:

```bash
npx create-next-app@latest web --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Passando dei flag, il generatore salta ogni domanda interattiva e usa le impostazioni consigliate per il resto (bundler Turbopack incluso).

- [ ] **Step 2: Verificare la struttura generata**

```bash
ls web/src/app/page.tsx web/src/app/layout.tsx web/src/app/globals.css
```

Atteso: i tre file esistono. Se `web/src/` non c'è ed esiste `web/app/`, il flag `--src-dir` non ha avuto effetto: **fermarsi e segnalarlo**, perché tutti i percorsi del piano partono da `web/src/`.

- [ ] **Step 3: Verificare che l'applicazione compili**

```bash
cd web && npm run build
```

Atteso: build completata senza errori, con l'elenco delle rotte generate.

- [ ] **Step 4: Escludere gli artefatti dal repository**

Il `.gitignore` della radice copre già `node_modules/`, `.next/` e `.env*`. Verificare che non compaiano fra i file da aggiungere:

```bash
git status --short | grep -E 'node_modules|\.next/' && echo "PROBLEMA: artefatti tracciati" || echo "pulito"
```

Atteso: `pulito`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Impianto Next.js 16 con TypeScript, Tailwind e App Router"
```

---

## Task 2: Impostazione dei test

**Files:**
- Create: `web/vitest.config.ts`
- Create: `web/vitest.setup.ts`
- Create: `web/src/test/accessibilita.ts`
- Test: `web/src/test/accessibilita.test.tsx`
- Modify: `web/package.json` (script `test`)

**Interfaces:**
- Consumes: applicazione da Task 1
- Produces: `npm test` esegue la suite; `violazioniAccessibilita(contenitore: HTMLElement): Promise<string[]>` esportata da `@/test/accessibilita`, usata da tutti i task successivi

- [ ] **Step 1: Installare le dipendenze di test**

```bash
cd web && npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom vite-tsconfig-paths axe-core
```

- [ ] **Step 2: Configurare Vitest**

`web/vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

`web/vitest.setup.ts`:

```typescript
import '@testing-library/jest-dom/vitest'
```

In `web/package.json`, dentro `"scripts"`, aggiungere:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Scrivere il test dell'helper, che deve fallire**

`web/src/test/accessibilita.test.tsx`:

```tsx
import { describe, expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { violazioniAccessibilita } from './accessibilita'

describe('violazioniAccessibilita', () => {
  test('non segnala nulla su un frammento corretto', async () => {
    const { container } = render(
      <main>
        <h1>Titolo</h1>
        <img src="/logo-cral-ares.svg" alt="CRAL ARES" />
      </main>,
    )
    expect(await violazioniAccessibilita(container)).toEqual([])
  })

  test("segnala un'immagine senza testo alternativo", async () => {
    const { container } = render(
      <main>
        <h1>Titolo</h1>
        {/* eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element */}
        <img src="/logo-cral-ares.svg" />
      </main>,
    )
    const violazioni = await violazioniAccessibilita(container)
    expect(violazioni.join(' ')).toContain('image-alt')
  })
})
```

- [ ] **Step 4: Eseguirlo e verificare che fallisca**

```bash
cd web && npm test
```

Atteso: FAIL, `Failed to resolve import "./accessibilita"`.

- [ ] **Step 5: Scrivere l'helper**

`web/src/test/accessibilita.ts`:

```typescript
import { run } from 'axe-core'

/**
 * Elenca le violazioni di accessibilità trovate da axe in un frammento.
 * Restituisce un array vuoto quando non ce ne sono.
 *
 * La regola del contrasto è disattivata di proposito: jsdom non calcola i
 * colori effettivi, quindi darebbe risultati inattendibili. Il contrasto è
 * verificato a parte, sui valori della palette, in src/lib/marchio.test.ts.
 */
export async function violazioniAccessibilita(
  contenitore: HTMLElement,
): Promise<string[]> {
  const risultati = await run(contenitore, {
    rules: { 'color-contrast': { enabled: false } },
  })
  return risultati.violations.map(
    (violazione) => `${violazione.id}: ${violazione.help}`,
  )
}
```

- [ ] **Step 6: Eseguire i test e verificare che passino**

```bash
cd web && npm test
```

Atteso: PASS, 2 test.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Impostazione dei test con Vitest, Testing Library e axe"
```

---

## Task 3: Palette del marchio e verifica del contrasto

**Files:**
- Create: `web/src/lib/marchio.ts`
- Test: `web/src/lib/marchio.test.ts`
- Modify: `web/src/app/globals.css`

**Interfaces:**
- Consumes: impianto di test da Task 2
- Produces: `colori` (oggetto con le chiavi `azzurro`, `arancione`, `bluProfondo`, `bluNotte`, `ambraScura`, `bianco`), `rapportoDiContrasto(primo: string, secondo: string): number`; classi Tailwind `bg-blu-profondo`, `text-blu-notte`, `text-ambra-scura`, `bg-azzurro`, `bg-arancione` disponibili in tutta l'applicazione

- [ ] **Step 1: Scrivere il test, che deve fallire**

`web/src/lib/marchio.test.ts`:

```typescript
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { colori, rapportoDiContrasto } from './marchio'

describe('rapportoDiContrasto', () => {
  test('vale 21:1 fra nero e bianco', () => {
    expect(rapportoDiContrasto('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
  })

  test('vale 1:1 fra un colore e se stesso', () => {
    expect(rapportoDiContrasto('#73D1EA', '#73D1EA')).toBeCloseTo(1, 2)
  })
})

describe('palette del marchio', () => {
  test('i colori per il testo su bianco superano il minimo AA di 4,5:1', () => {
    expect(rapportoDiContrasto(colori.bluProfondo, colori.bianco)).toBeGreaterThanOrEqual(4.5)
    expect(rapportoDiContrasto(colori.bluNotte, colori.bianco)).toBeGreaterThanOrEqual(4.5)
    expect(rapportoDiContrasto(colori.ambraScura, colori.bianco)).toBeGreaterThanOrEqual(4.5)
  })

  test('azzurro su fondo blu-notte è utilizzabile per il testo', () => {
    expect(rapportoDiContrasto(colori.azzurro, colori.bluNotte)).toBeGreaterThanOrEqual(4.5)
  })

  test('azzurro e arancione su bianco NON sono utilizzabili per il testo', () => {
    expect(rapportoDiContrasto(colori.azzurro, colori.bianco)).toBeLessThan(4.5)
    expect(rapportoDiContrasto(colori.arancione, colori.bianco)).toBeLessThan(4.5)
  })
})

describe('allineamento fra TypeScript e CSS', () => {
  test('globals.css definisce esattamente gli stessi valori', () => {
    const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8')
    for (const valore of Object.values(colori)) {
      if (valore === '#FFFFFF') continue
      expect(css.toUpperCase()).toContain(valore.toUpperCase())
    }
  })
})
```

- [ ] **Step 2: Eseguirlo e verificare che fallisca**

```bash
cd web && npm test
```

Atteso: FAIL, `Failed to resolve import "./marchio"`.

- [ ] **Step 3: Scrivere il modulo**

`web/src/lib/marchio.ts`:

```typescript
/**
 * Colori del marchio CRAL ARES, estratti da assets/logo-cral-ares.svg.
 *
 * Azzurro e arancione sono i due colori originali del logo: hanno contrasto
 * insufficiente per il testo su bianco (1,74:1 e 2,14:1 contro il 4,5:1
 * richiesto da WCAG AA), quindi si usano solo come accenti, sfondi e dettagli
 * grafici. Per testi e pulsanti esistono le varianti profonde.
 */
export const colori = {
  azzurro: '#73D1EA',
  arancione: '#EAA256',
  bluProfondo: '#0E5C74',
  bluNotte: '#0A3D4D',
  ambraScura: '#96591B',
  bianco: '#FFFFFF',
} as const

function luminanzaRelativa(colore: string): number {
  const esadecimale = colore.replace('#', '')
  const canali = [0, 2, 4].map((posizione) => {
    const valore = parseInt(esadecimale.slice(posizione, posizione + 2), 16) / 255
    return valore <= 0.04045 ? valore / 12.92 : ((valore + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * canali[0] + 0.7152 * canali[1] + 0.0722 * canali[2]
}

/** Rapporto di contrasto fra due colori, secondo la formula WCAG 2.1. */
export function rapportoDiContrasto(primo: string, secondo: string): number {
  const luminanze = [luminanzaRelativa(primo), luminanzaRelativa(secondo)]
  const chiaro = Math.max(...luminanze)
  const scuro = Math.min(...luminanze)
  return (chiaro + 0.05) / (scuro + 0.05)
}
```

- [ ] **Step 4: Dichiarare i token in Tailwind**

In `web/src/app/globals.css`, subito dopo `@import "tailwindcss";`, aggiungere:

```css
@theme {
  --color-azzurro: #73D1EA;
  --color-arancione: #EAA256;
  --color-blu-profondo: #0E5C74;
  --color-blu-notte: #0A3D4D;
  --color-ambra-scura: #96591B;

  --font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
}
```

Tailwind v4 genera da questi token le classi `bg-*`, `text-*` e `border-*`
corrispondenti.

**Nello stesso passo, togliere i riferimenti ai font del modello.** Il
generatore di Next imposta i font Geist in `layout.tsx` e li richiama in
`globals.css` con variabili tipo `--font-geist-sans`. Il Task 5 riscrive
`layout.tsx` senza quei font: se le variabili restassero citate nel CSS, il
sito ricadrebbe su un font indefinito. Cercarle ed eliminarle:

```bash
cd web && grep -n 'geist' src/app/globals.css src/app/layout.tsx || echo "nessun riferimento residuo"
```

Si usa il font di sistema di proposito: si carica all'istante, è quello che
l'utente già legge sul proprio telefono, e non aggiunge una richiesta di rete
verso un servizio esterno — che sarebbe anche un dato in più da dichiarare
nell'informativa.

- [ ] **Step 5: Eseguire i test e verificare che passino**

```bash
cd web && npm test
```

Atteso: PASS, tutti i test di `marchio.test.ts` compreso quello di allineamento con il CSS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Palette del marchio con verifica automatica del contrasto"
```

---

## Task 4: Navigazione e contenuti in un posto solo

**Files:**
- Create: `web/src/contenuti/navigazione.ts`
- Create: `web/src/contenuti/pagine.ts`
- Test: `web/src/contenuti/navigazione.test.ts`

**Interfaces:**
- Consumes: impianto di test da Task 2
- Produces: `vociDiMenu: VoceDiMenu[]` e `vociLegali: VoceDiMenu[]` da `@/contenuti/navigazione`, con `type VoceDiMenu = { percorso: string; etichetta: string }`; `contenutiPagine` da `@/contenuti/pagine`

- [ ] **Step 1: Scrivere il test, che deve fallire**

`web/src/contenuti/navigazione.test.ts`:

```typescript
import { describe, expect, test } from 'vitest'
import { vociDiMenu, vociLegali } from './navigazione'

describe('voci di navigazione', () => {
  test('ogni percorso comincia con una barra ed è unico', () => {
    const percorsi = [...vociDiMenu, ...vociLegali].map((voce) => voce.percorso)
    for (const percorso of percorsi) {
      expect(percorso.startsWith('/')).toBe(true)
    }
    expect(new Set(percorsi).size).toBe(percorsi.length)
  })

  test('ogni voce ha un\'etichetta non vuota', () => {
    for (const voce of [...vociDiMenu, ...vociLegali]) {
      expect(voce.etichetta.trim().length).toBeGreaterThan(0)
    }
  })

  test('il menu principale contiene le pagine della fase 1', () => {
    const percorsi = vociDiMenu.map((voce) => voce.percorso)
    expect(percorsi).toContain('/chi-siamo')
    expect(percorsi).toContain('/iscriviti')
  })

  test('le voci legali sono privacy e cookie', () => {
    expect(vociLegali.map((voce) => voce.percorso)).toEqual(['/privacy', '/cookie'])
  })
})
```

- [ ] **Step 2: Eseguirlo e verificare che fallisca**

```bash
cd web && npm test
```

Atteso: FAIL, `Failed to resolve import "./navigazione"`.

- [ ] **Step 3: Scrivere i moduli di contenuto**

`web/src/contenuti/navigazione.ts`:

```typescript
export type VoceDiMenu = {
  percorso: string
  etichetta: string
}

/** Menu principale, mostrato nell'intestazione. */
export const vociDiMenu: VoceDiMenu[] = [
  { percorso: '/', etichetta: 'Home' },
  { percorso: '/chi-siamo', etichetta: 'Chi siamo' },
  { percorso: '/iscriviti', etichetta: 'Iscriviti' },
]

/** Rimandi legali, mostrati nel piè di pagina. */
export const vociLegali: VoceDiMenu[] = [
  { percorso: '/privacy', etichetta: 'Privacy' },
  { percorso: '/cookie', etichetta: 'Cookie' },
]
```

`web/src/contenuti/pagine.ts`:

```typescript
/**
 * Testi delle pagine statiche.
 *
 * Provvisori: il direttivo deve fornire i contenuti definitivi di "Chi siamo",
 * la composizione del direttivo, la procedura di iscrizione e l'informativa
 * privacy con i dati reali del titolare (spec, sezione 16). Sostituirli
 * significa modificare questo file e nient'altro.
 */
export const contenutiPagine = {
  associazione: {
    nome: 'CRAL ARES',
    sottotitolo: 'Circolo ricreativo dei dipendenti dell\'Agenzia delle Entrate',
    email: 'info@cralares.it',
  },
  home: {
    titolo: 'Il circolo dei dipendenti dell\'Agenzia delle Entrate',
    occhiello:
      'Biglietti del cinema, convenzioni e offerte riservate ai soci del CRAL ARES.',
    invito: 'Scopri come iscriverti',
  },
  chiSiamo: {
    titolo: 'Chi siamo',
    paragrafi: [
      'Il CRAL ARES è l\'associazione ricreativa dei dipendenti dell\'Agenzia delle Entrate. Nasce per mettere a disposizione dei colleghi convenzioni, biglietti a tariffa agevolata e occasioni di incontro.',
      'L\'associazione è gestita da un direttivo composto da dipendenti che vi dedicano il proprio tempo, senza scopo di lucro.',
    ],
    titoloDirettivo: 'Il direttivo',
    notaProvvisoria:
      'La composizione del direttivo sarà pubblicata a breve.',
    titoloContatti: 'Contatti',
    testoContatti:
      'Per qualsiasi informazione scrivi all\'indirizzo dell\'associazione:',
  },
  iscriviti: {
    titolo: 'Iscriviti al CRAL',
    paragrafi: [
      'Possono iscriversi al CRAL ARES i dipendenti dell\'Agenzia delle Entrate.',
      'Per aderire scrivi all\'indirizzo dell\'associazione: riceverai il modulo di iscrizione e le indicazioni per il versamento della quota annuale.',
    ],
    notaProvvisoria:
      'Requisiti, quota annuale e procedura completa saranno pubblicati a breve.',
  },
  privacy: {
    titolo: 'Informativa sulla privacy',
    notaProvvisoria:
      'L\'informativa completa è in corso di redazione e sarà pubblicata prima dell\'apertura del sito ai soci.',
  },
  cookie: {
    titolo: 'Cookie',
    paragrafi: [
      'Questo sito utilizza esclusivamente cookie tecnici, necessari al suo funzionamento.',
      'Non sono presenti cookie di profilazione, né strumenti di analisi che ne installino. Per questo motivo non viene mostrato alcun banner di consenso.',
    ],
  },
} as const
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

```bash
cd web && npm test
```

Atteso: PASS, 4 test in `navigazione.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Contenuti e voci di navigazione in moduli dedicati"
```

---

## Task 5: Intestazione e piè di pagina

**Files:**
- Create: `web/src/componenti/Intestazione.tsx`
- Create: `web/src/componenti/PiedePagina.tsx`
- Test: `web/src/componenti/Intestazione.test.tsx`
- Test: `web/src/componenti/PiedePagina.test.tsx`
- Modify: `web/src/app/layout.tsx`
- Create: `web/public/logo-cral-ares.svg` (copia da `assets/`)

**Interfaces:**
- Consumes: `vociDiMenu`, `vociLegali` da `@/contenuti/navigazione`; `contenutiPagine` da `@/contenuti/pagine`; `violazioniAccessibilita` da `@/test/accessibilita`
- Produces: componenti `Intestazione` e `PiedePagina`, entrambi senza props, usati da `layout.tsx`; struttura `<header> <main id="contenuto"> <footer>` disponibile a ogni pagina

- [ ] **Step 1: Copiare il logo fra i file pubblici**

Dalla radice del repository:

```bash
cp assets/logo-cral-ares.svg web/public/logo-cral-ares.svg
```

- [ ] **Step 2: Scrivere i test, che devono fallire**

`web/src/componenti/Intestazione.test.tsx`:

```tsx
import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { vociDiMenu } from '@/contenuti/navigazione'
import { Intestazione } from './Intestazione'

describe('Intestazione', () => {
  test('mostra tutte le voci del menu come collegamenti', () => {
    render(<Intestazione />)
    for (const voce of vociDiMenu) {
      const collegamento = screen.getByRole('link', { name: voce.etichetta })
      expect(collegamento).toHaveAttribute('href', voce.percorso)
    }
  })

  test('offre il collegamento per saltare al contenuto', () => {
    render(<Intestazione />)
    const salta = screen.getByRole('link', { name: 'Salta al contenuto' })
    expect(salta).toHaveAttribute('href', '#contenuto')
  })

  test('il logo ha un testo alternativo', () => {
    render(<Intestazione />)
    expect(screen.getByAltText('CRAL ARES')).toBeInTheDocument()
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<Intestazione />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
```

`web/src/componenti/PiedePagina.test.tsx`:

```tsx
import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { vociLegali } from '@/contenuti/navigazione'
import { PiedePagina } from './PiedePagina'

describe('PiedePagina', () => {
  test('mostra i rimandi legali', () => {
    render(<PiedePagina />)
    for (const voce of vociLegali) {
      expect(screen.getByRole('link', { name: voce.etichetta })).toHaveAttribute(
        'href',
        voce.percorso,
      )
    }
  })

  test('mostra l\'indirizzo email dell\'associazione', () => {
    render(<PiedePagina />)
    expect(screen.getByRole('link', { name: /info@cralares\.it/ })).toHaveAttribute(
      'href',
      'mailto:info@cralares.it',
    )
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<PiedePagina />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
```

- [ ] **Step 3: Eseguirli e verificare che falliscano**

```bash
cd web && npm test
```

Atteso: FAIL, moduli `./Intestazione` e `./PiedePagina` non risolti.

- [ ] **Step 4: Scrivere i componenti**

`web/src/componenti/Intestazione.tsx`:

```tsx
import Link from 'next/link'
import { vociDiMenu } from '@/contenuti/navigazione'

export function Intestazione() {
  return (
    <header className="bg-blu-notte text-white">
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-blu-notte"
      >
        Salta al contenuto
      </a>
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-cral-ares.svg"
            alt="CRAL ARES"
            width={160}
            height={47}
            className="h-10 w-auto"
          />
        </Link>
        <nav aria-label="Menu principale">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {vociDiMenu.map((voce) => (
              <li key={voce.percorso}>
                <Link
                  href={voce.percorso}
                  className="rounded text-azzurro underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azzurro"
                >
                  {voce.etichetta}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
```

`web/src/componenti/PiedePagina.tsx`:

```tsx
import Link from 'next/link'
import { vociLegali } from '@/contenuti/navigazione'
import { contenutiPagine } from '@/contenuti/pagine'

export function PiedePagina() {
  const { nome, sottotitolo, email } = contenutiPagine.associazione

  return (
    <footer className="mt-16 bg-blu-notte text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:flex-row sm:justify-between">
        <div>
          <p className="font-semibold">{nome}</p>
          <p className="text-sm text-azzurro">{sottotitolo}</p>
          <p className="mt-2 text-sm">
            <a
              href={`mailto:${email}`}
              className="rounded underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azzurro"
            >
              {email}
            </a>
          </p>
        </div>
        <nav aria-label="Informazioni legali">
          <ul className="flex gap-6 text-sm">
            {vociLegali.map((voce) => (
              <li key={voce.percorso}>
                <Link
                  href={voce.percorso}
                  className="rounded underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azzurro"
                >
                  {voce.etichetta}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
```

- [ ] **Step 5: Inserirli nella struttura comune**

Sostituire il contenuto di `web/src/app/layout.tsx` con:

```tsx
import type { Metadata } from 'next'
import { Intestazione } from '@/componenti/Intestazione'
import { PiedePagina } from '@/componenti/PiedePagina'
import { contenutiPagine } from '@/contenuti/pagine'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: contenutiPagine.associazione.nome,
    template: `%s · ${contenutiPagine.associazione.nome}`,
  },
  description: contenutiPagine.home.occhiello,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body className="flex min-h-screen flex-col bg-white text-blu-notte antialiased">
        <Intestazione />
        <main id="contenuto" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
          {children}
        </main>
        <PiedePagina />
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Eseguire i test e verificare che passino**

```bash
cd web && npm test
```

Atteso: PASS, 7 test fra i due file dei componenti.

- [ ] **Step 7: Verificare che l'applicazione compili ancora**

```bash
cd web && npm run build
```

Atteso: build completata senza errori.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Intestazione e piè di pagina, con salta-al-contenuto e logo"
```

---

## Task 6: Home

**Files:**
- Modify: `web/src/app/page.tsx`
- Test: `web/src/app/page.test.tsx`

**Interfaces:**
- Consumes: `contenutiPagine` da `@/contenuti/pagine`
- Produces: rotta `/`. La sezione delle offerte in evidenza e i due riquadri di richiesta (spec, sezione 8) **non fanno parte di questa fase**: arrivano rispettivamente in fase 2 e in fase 4.

- [ ] **Step 1: Scrivere il test, che deve fallire**

`web/src/app/page.test.tsx`:

```tsx
import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { contenutiPagine } from '@/contenuti/pagine'
import Home from './page'

describe('Home', () => {
  test('ha un solo titolo di primo livello, quello previsto', () => {
    render(<Home />)
    const titoli = screen.getAllByRole('heading', { level: 1 })
    expect(titoli).toHaveLength(1)
    expect(titoli[0]).toHaveTextContent(contenutiPagine.home.titolo)
  })

  test('invita a iscriversi con un collegamento alla pagina dedicata', () => {
    render(<Home />)
    expect(
      screen.getByRole('link', { name: contenutiPagine.home.invito }),
    ).toHaveAttribute('href', '/iscriviti')
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<Home />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
```

- [ ] **Step 2: Eseguirlo e verificare che fallisca**

```bash
cd web && npm test
```

Atteso: FAIL, la home generata dal modello non contiene quel titolo.

- [ ] **Step 3: Scrivere la pagina**

Sostituire il contenuto di `web/src/app/page.tsx` con:

```tsx
import Link from 'next/link'
import { contenutiPagine } from '@/contenuti/pagine'

export default function Home() {
  const { titolo, occhiello, invito } = contenutiPagine.home

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold sm:text-4xl">{titolo}</h1>
        <p className="max-w-2xl text-lg">{occhiello}</p>
        <div>
          <Link
            href="/iscriviti"
            className="inline-block rounded-lg bg-blu-profondo px-5 py-3 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blu-profondo hover:bg-blu-notte"
          >
            {invito}
          </Link>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

```bash
cd web && npm test
```

Atteso: PASS, 3 test in `page.test.tsx`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Home con presentazione e invito all'iscrizione"
```

---

## Task 7: Pagine di presentazione — chi siamo e iscriviti

**Files:**
- Create: `web/src/app/chi-siamo/page.tsx`
- Create: `web/src/app/iscriviti/page.tsx`
- Test: `web/src/app/chi-siamo/page.test.tsx`
- Test: `web/src/app/iscriviti/page.test.tsx`

**Interfaces:**
- Consumes: `contenutiPagine` da `@/contenuti/pagine`
- Produces: rotte `/chi-siamo` e `/iscriviti`, entrambe con `metadata.title` proprio

- [ ] **Step 1: Scrivere i test, che devono fallire**

`web/src/app/chi-siamo/page.test.tsx`:

```tsx
import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { contenutiPagine } from '@/contenuti/pagine'
import ChiSiamo from './page'

describe('Chi siamo', () => {
  test('mostra il titolo della pagina come unico h1', () => {
    render(<ChiSiamo />)
    const titoli = screen.getAllByRole('heading', { level: 1 })
    expect(titoli).toHaveLength(1)
    expect(titoli[0]).toHaveTextContent(contenutiPagine.chiSiamo.titolo)
  })

  test('mostra tutti i paragrafi previsti', () => {
    render(<ChiSiamo />)
    for (const paragrafo of contenutiPagine.chiSiamo.paragrafi) {
      expect(screen.getByText(paragrafo)).toBeInTheDocument()
    }
  })

  test('dichiara che il direttivo sarà pubblicato', () => {
    render(<ChiSiamo />)
    expect(
      screen.getByText(contenutiPagine.chiSiamo.notaProvvisoria),
    ).toBeInTheDocument()
  })

  test('mostra i contatti dell\'associazione', () => {
    render(<ChiSiamo />)
    expect(
      screen.getByRole('heading', { level: 2, name: contenutiPagine.chiSiamo.titoloContatti }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /info@cralares\.it/ })).toHaveAttribute(
      'href',
      'mailto:info@cralares.it',
    )
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<ChiSiamo />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
```

`web/src/app/iscriviti/page.test.tsx`:

```tsx
import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { contenutiPagine } from '@/contenuti/pagine'
import Iscriviti from './page'

describe('Iscriviti', () => {
  test('mostra il titolo della pagina come unico h1', () => {
    render(<Iscriviti />)
    const titoli = screen.getAllByRole('heading', { level: 1 })
    expect(titoli).toHaveLength(1)
    expect(titoli[0]).toHaveTextContent(contenutiPagine.iscriviti.titolo)
  })

  test('mostra il contatto per aderire', () => {
    render(<Iscriviti />)
    expect(
      screen.getByRole('link', { name: /info@cralares\.it/ }),
    ).toHaveAttribute('href', 'mailto:info@cralares.it')
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<Iscriviti />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
```

- [ ] **Step 2: Eseguirli e verificare che falliscano**

```bash
cd web && npm test
```

Atteso: FAIL, le due pagine non esistono.

- [ ] **Step 3: Scrivere le pagine**

`web/src/app/chi-siamo/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { contenutiPagine } from '@/contenuti/pagine'

export const metadata: Metadata = {
  title: contenutiPagine.chiSiamo.titolo,
}

export default function ChiSiamo() {
  const {
    titolo,
    paragrafi,
    titoloDirettivo,
    notaProvvisoria,
    titoloContatti,
    testoContatti,
  } = contenutiPagine.chiSiamo
  const { email } = contenutiPagine.associazione

  return (
    <article className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold">{titolo}</h1>
      {paragrafi.map((paragrafo) => (
        <p key={paragrafo}>{paragrafo}</p>
      ))}
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">{titoloDirettivo}</h2>
        <p className="text-sm">{notaProvvisoria}</p>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold">{titoloContatti}</h2>
        <p>
          {testoContatti}{' '}
          <a
            href={`mailto:${email}`}
            className="rounded font-semibold text-ambra-scura underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ambra-scura"
          >
            {email}
          </a>
        </p>
      </section>
    </article>
  )
}
```

`web/src/app/iscriviti/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { contenutiPagine } from '@/contenuti/pagine'

export const metadata: Metadata = {
  title: contenutiPagine.iscriviti.titolo,
}

export default function Iscriviti() {
  const { titolo, paragrafi, notaProvvisoria } = contenutiPagine.iscriviti
  const { email } = contenutiPagine.associazione

  return (
    <article className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold">{titolo}</h1>
      {paragrafi.map((paragrafo) => (
        <p key={paragrafo}>{paragrafo}</p>
      ))}
      <p>
        <a
          href={`mailto:${email}`}
          className="rounded font-semibold text-ambra-scura underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ambra-scura"
        >
          {email}
        </a>
      </p>
      <p className="text-sm">{notaProvvisoria}</p>
    </article>
  )
}
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

```bash
cd web && npm test
```

Atteso: PASS, 8 test fra le due pagine.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Pagine chi siamo e iscriviti"
```

---

## Task 8: Pagine legali — privacy e cookie

**Files:**
- Create: `web/src/app/privacy/page.tsx`
- Create: `web/src/app/cookie/page.tsx`
- Test: `web/src/app/privacy/page.test.tsx`
- Test: `web/src/app/cookie/page.test.tsx`

**Interfaces:**
- Consumes: `contenutiPagine` da `@/contenuti/pagine`
- Produces: rotte `/privacy` e `/cookie`, richiamate dal piè di pagina

**Nota importante.** L'informativa privacy definitiva richiede i dati reali del titolare, che il direttivo deve ancora fornire (spec, sezione 16). La pagina esiste e dichiara apertamente che il testo è in corso di redazione: **non deve contenere un'informativa inventata**, che sarebbe peggio della sua assenza. Il sito non viene aperto ai soci prima della fase 6, quando il testo definitivo sarà disponibile.

- [ ] **Step 1: Scrivere i test, che devono fallire**

`web/src/app/privacy/page.test.tsx`:

```tsx
import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { contenutiPagine } from '@/contenuti/pagine'
import Privacy from './page'

describe('Privacy', () => {
  test('mostra il titolo della pagina come unico h1', () => {
    render(<Privacy />)
    const titoli = screen.getAllByRole('heading', { level: 1 })
    expect(titoli).toHaveLength(1)
    expect(titoli[0]).toHaveTextContent(contenutiPagine.privacy.titolo)
  })

  test('dichiara che l\'informativa è in corso di redazione', () => {
    render(<Privacy />)
    expect(
      screen.getByText(contenutiPagine.privacy.notaProvvisoria),
    ).toBeInTheDocument()
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<Privacy />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
```

`web/src/app/cookie/page.test.tsx`:

```tsx
import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { contenutiPagine } from '@/contenuti/pagine'
import Cookie from './page'

describe('Cookie', () => {
  test('mostra il titolo della pagina come unico h1', () => {
    render(<Cookie />)
    const titoli = screen.getAllByRole('heading', { level: 1 })
    expect(titoli).toHaveLength(1)
    expect(titoli[0]).toHaveTextContent(contenutiPagine.cookie.titolo)
  })

  test('spiega che sono usati solo cookie tecnici', () => {
    render(<Cookie />)
    for (const paragrafo of contenutiPagine.cookie.paragrafi) {
      expect(screen.getByText(paragrafo)).toBeInTheDocument()
    }
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<Cookie />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
```

- [ ] **Step 2: Eseguirli e verificare che falliscano**

```bash
cd web && npm test
```

Atteso: FAIL, le due pagine non esistono.

- [ ] **Step 3: Scrivere le pagine**

`web/src/app/privacy/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { contenutiPagine } from '@/contenuti/pagine'

export const metadata: Metadata = {
  title: contenutiPagine.privacy.titolo,
}

export default function Privacy() {
  const { titolo, notaProvvisoria } = contenutiPagine.privacy

  return (
    <article className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold">{titolo}</h1>
      <p>{notaProvvisoria}</p>
    </article>
  )
}
```

`web/src/app/cookie/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { contenutiPagine } from '@/contenuti/pagine'

export const metadata: Metadata = {
  title: contenutiPagine.cookie.titolo,
}

export default function Cookie() {
  const { titolo, paragrafi } = contenutiPagine.cookie

  return (
    <article className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold">{titolo}</h1>
      {paragrafi.map((paragrafo) => (
        <p key={paragrafo}>{paragrafo}</p>
      ))}
    </article>
  )
}
```

- [ ] **Step 4: Eseguire i test e verificare che passino**

```bash
cd web && npm test
```

Atteso: PASS, 6 test fra le due pagine.

- [ ] **Step 5: Verificare che tutte le rotte esistano**

```bash
cd web && npm run build
```

Atteso: nell'elenco delle rotte compaiono `/`, `/chi-siamo`, `/iscriviti`, `/privacy`, `/cookie`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Pagine privacy e cookie"
```

---

## Task 9: Distribuzione su Netlify

**Files:**
- Create: `netlify.toml` (radice del repository, **non** dentro `web/`)
- Create: `web/.env.example`
- Create: `web/src/app/icon.svg`

**Interfaces:**
- Consumes: applicazione completa dei task precedenti
- Produces: sito raggiungibile a un indirizzo `*.netlify.app`. Il dominio `cralares.it` si collega in fase 6, non ora.

**Da concordare prima di eseguire.** Questo task crea un repository remoto e un sito pubblico: sono azioni verso l'esterno, vanno confermate dal committente del lavoro prima di procedere. Il repository va creato **privato**.

- [ ] **Step 1: Aggiungere l'icona della scheda del browser**

Il marchio completo è largo e stretto (553 x 163) e illeggibile a 32 pixel,
quindi l'icona non è il logo rimpicciolito. Creare `web/src/app/icon.svg` con
esattamente questo contenuto:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="CRAL ARES">
  <rect width="64" height="64" rx="12" fill="#0A3D4D" />
  <text x="32" y="41" font-family="system-ui, sans-serif" font-size="24" font-weight="700"
        text-anchor="middle" fill="#73D1EA">CA</text>
</svg>
```

L'icona definitiva, ritagliata dal segno del Vesuvio, si sostituisce in fase 6
insieme al dominio: è un lavoro di grafica che non vale la pena fare adesso,
quando il sito è ancora visibile solo a noi.

- [ ] **Step 2: Configurare la distribuzione**

`netlify.toml`, nella **radice del repository**. Netlify legge solo il file
nella radice: se lo si mette dentro `web/` viene ignorato in silenzio e la
distribuzione fallisce senza spiegare perché.

```toml
[build]
  base = "web"
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "24"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

`web/.env.example` — elenca le variabili che serviranno dalle fasi successive, senza alcun valore reale:

```bash
# Supabase (fase 2)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Resend (fase 4)
RESEND_API_KEY=
EMAIL_DIRETTORI=

# Cloudflare Turnstile (fase 4)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

- [ ] **Step 3: Verificare che i segreti non siano tracciabili**

```bash
cd .. && git check-ignore -v web/.env 2>/dev/null && echo "OK: .env ignorato" || echo "PROBLEMA: .env non ignorato"
```

Atteso: `OK: .env ignorato`, grazie alla regola già presente nel `.gitignore` della radice.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Configurazione della distribuzione su Netlify"
```

- [ ] **Step 5: Creare il repository remoto privato**

```bash
gh repo create cral-ares-sito --private --source=. --remote=origin --push
```

- [ ] **Step 6: Collegare il sito Netlify**

Da fare nell'interfaccia di Netlify, perché richiede l'accesso all'account:

1. **Add new site → Import an existing project**, scegliere il repository appena creato.
2. Netlify legge `netlify.toml` dalla radice: verificare che *base directory* risulti `web` e il comando `npm run build`.
3. Avviare la distribuzione.

- [ ] **Step 7: Verificare il sito online**

Aprire l'indirizzo `*.netlify.app` assegnato e controllare, **da telefono oltre che da computer**:

- la home mostra titolo e invito all'iscrizione;
- il menu raggiunge chi siamo e iscriviti;
- il piè di pagina raggiunge privacy e cookie;
- premendo `Tab` come primo tasto compare "Salta al contenuto";
- niente scorrimento orizzontale a 360 px di larghezza.

- [ ] **Step 8: Registrare l'indirizzo nel repository**

Aggiungere in fondo a `docs/appunti-costi-riunione.md`, sezione "Stato dei documenti", la riga con l'indirizzo di anteprima assegnato da Netlify, e committare.

---

## Fatto quando

- [ ] `npm test` passa, senza test saltati
- [ ] `npm run build` completa senza errori né avvisi bloccanti
- [ ] Le cinque rotte pubbliche rispondono online
- [ ] Ogni pagina ha un solo `<h1>` e supera il controllo axe strutturale
- [ ] I colori del marchio sono definiti in un posto solo e verificati dal test sul contrasto
- [ ] Il sito è utilizzabile da telefono e navigabile da tastiera

## Cosa resta fuori, di proposito

| Fuori dalla fase 1 | Dove arriva |
|---|---|
| Offerte, database, area riservata | Fase 2 |
| Anagrafica soci e import iniziale | Fase 3 |
| I tre moduli di richiesta, i due riquadri in home, le email | Fase 4 |
| Elenco richieste ed esportazione | Fase 5 |
| Dominio `cralares.it`, informativa definitiva, collaudo con i direttori | Fase 6 |
