# Fase 2 — Database, area riservata e pubblicazione delle offerte

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** i direttori pubblicano la prima offerta vera dall'area riservata, e il sito pubblico smette di mostrare dati dimostrativi.

**Architecture:** le offerte si spostano da un file TypeScript a una tabella PostgreSQL su Supabase. Fra il database e le pagine si interpone un unico modulo (`src/dati/offerte.ts`) che espone le stesse funzioni di dominio già usate oggi da `offerteEsempio.ts`: le pagine cambiano solo per l'`await`. L'accesso dei direttori è un link monouso via email, autorizzato dalla tabella `redattori` e difeso due volte — nel codice e nelle politiche RLS del database.

**Tech Stack:** Next.js 16 (App Router) · TypeScript · Supabase (PostgreSQL + Auth) · `@supabase/ssr` · Zod · Tailwind CSS v4 · Vitest + Testing Library + axe-core · Netlify

**Spec:** `docs/superpowers/specs/2026-08-25-sito-cral-ares-design.md` (rev. 04/09/2026), sezioni 5.2, 6, 7, 10.1

## Global Constraints

Valgono per ogni task del piano.

- **Lingua: italiano.** Ogni testo visibile all'utente è in italiano, accenti compresi. Nomi di variabili, funzioni, tabelle e colonne in italiano dove descrivono il dominio (`offerte`, `redattori`, `valida_al`), in inglese dove sono convenzioni del framework (`page.tsx`, `layout.tsx`, `proxy.ts`).
- **Accessibilità: WCAG 2.1 AA.** Ogni pagina naviga da tastiera, ha un solo `<h1>`, usa elementi di riferimento e supera il controllo axe strutturale. Vale anche per le pagine dell'area riservata.
- **Mobile-first.** Ogni schermata si progetta prima a 360 px. L'area riservata è l'unica eccezione tollerata: i direttori pubblicano dal computer, ma le pagine restano comunque utilizzabili dal telefono.
- **Palette del marchio**, valori esatti:
  `azzurro #73D1EA` · `arancione #EAA256` · `blu-profondo #0E5C74` · `blu-notte #0A3D4D` · `ambra-scura #96591B`.
  Azzurro e arancione non si usano mai per testo su bianco.
- **Hosting: Netlify, mai Vercel.**
- **Nessun cookie di profilazione.** I cookie di sessione dell'area riservata sono tecnici e vanno dichiarati nella pagina cookie.
- **Comandi npm dalla cartella `web/`.** Il repository ha la sua radice un livello sopra.
- **Next 16 non è il Next che conosci.** `web/AGENTS.md` lo dice esplicitamente:
  API, convenzioni e struttura dei file differiscono da quanto un modello ha
  imparato. Prima di scrivere codice che usa un'API di Next, leggi la guida
  corrispondente in `web/node_modules/next/dist/docs/`. Una differenza già
  accertata: **`middleware.ts` è deprecato e si chiama `proxy.ts`**, con la
  funzione esportata `proxy`.
- **Nessuna chiave `service_role` nel codice, nei test o nel repository.** Il browser e il server usano solo la chiave anonima; ciò che l'anonimo non deve poter fare lo impedisce RLS, non la reticenza del codice.
- **RLS attiva su ogni tabella creata.** Una tabella senza politiche è una tabella leggibile da chiunque conosca l'indirizzo del progetto.
- **Dati su server nell'Unione Europea:** alla creazione del progetto Supabase si sceglie una regione UE (`eu-central-1` oppure `eu-west-1`). Non è modificabile dopo.
- **Ogni modifica allo schema è una migrazione versionata** in `supabase/migrations/`. Non si modifica lo schema dall'interfaccia web di Supabase: quello che non è in una migrazione non esiste.

---

## Le due domande ancora aperte

Il meeting con il direttivo è l'**8 settembre 2026**. Due risposte cambiano le
colonne della tabella `offerte`, e finché non arrivano il piano procede su
ipotesi dichiarate:

1. **Quali campi vogliono davvero per ogni offerta.** Ipotesi: gli otto sempre
   presenti — partner, categoria, vantaggio, descrizione breve, descrizione
   estesa, condizioni, validità, modalità — più indirizzo, telefono, sito e
   codice sconto per le sole convenzioni. **Fuori** dalla migrazione iniziale:
   `titolo` separato dal partner, `prezzo_pieno` e `prezzo_socio`.
2. **Le offerte hanno un'immagine.** Ipotesi: **no**. La colonna `immagine_url`
   non viene creata e l'archivio immagini di Supabase non viene configurato.

Il **Task 9 è la migrazione che recepisce le risposte**, e va eseguito solo
dopo il meeting. I Task da 1 a 8 non dipendono da quelle risposte: usano le
colonne stabili, quelle presenti in ogni ipotesi.

## Cosa questa fase non fa, di proposito

Del modello dati della sezione 6 dello spec questa fase crea **tre tabelle su
cinque**: `redattori`, `circuiti`, `offerte`. Mancano `soci` (fase 3) e
`richieste` (fase 4), e non è una dimenticanza: creare adesso una tabella che
nessuna schermata legge significa congelarne la forma mesi prima di sapere
cosa arriverà dal file Excel del direttivo. `circuiti` fa eccezione perché
costa tre righe e chiude la migrazione iniziale.

Restano fuori anche `/area-riservata/soci` e `/area-riservata/richieste`, che
sono il risultato visibile delle fasi 3 e 5.

---

## Struttura dei file al termine della fase

```
supabase/
├── config.toml                          collegamento al progetto (generato da `supabase link`)
├── migrations/
│   ├── 0001_impianto.sql                enum, redattori, circuiti, offerte, RLS
│   └── 0002_campi_definitivi.sql        Task 9, dopo il meeting
└── semi/
    └── offerte-dimostrative.sql         le otto offerte di esempio, solo per lo sviluppo
web/src/
├── dati/
│   ├── supabaseServer.ts                client per Server Component e Server Action
│   ├── supabaseBrowser.ts               client per i Client Component
│   ├── righe.ts                         i tipi delle righe, copia fedele dello schema SQL
│   ├── mappaOfferta.ts                  riga del database → tipo di dominio Offerta
│   ├── offerte.ts                       le query: la sola porta verso la tabella offerte
│   └── redattori.ts                     chi è autorizzato all'area riservata
├── dominio/
│   ├── offerta.ts                       il tipo Offerta, spostato qui da contenuti/
│   └── offertaSchema.ts                 validazione Zod, condivisa da modulo e server
├── app/
│   ├── area-riservata/
│   │   ├── accedi/page.tsx              richiesta del link monouso (fuori dal guscio)
│   │   ├── callback/route.ts            scambio del codice con la sessione
│   │   └── (interno)/                   gruppo di rotte: non compare nell'indirizzo
│   │       ├── layout.tsx               guscio protetto: fuori chi non è redattore
│   │       ├── page.tsx                 elenco delle offerte, con stato e scadenza
│   │       └── offerte/
│   │           ├── nuova/page.tsx       creazione con anteprima dal vivo
│   │           └── [id]/page.tsx        modifica
│   └── azioni/
│       └── offerte.ts                   Server Action: salva bozza, pubblica, elimina
├── componenti/
│   ├── ModuloOfferta.tsx                il modulo, con anteprima affiancata
│   └── CopiaTestoEmail.tsx              «copia il testo per l'email»
├── proxy.ts                             rinnovo della sessione, solo su /area-riservata
└── test/
    └── offerteFinte.ts                  le otto offerte di esempio, ora fixture dei test
```

**Perché così.** `src/dati/` è l'unico posto che sa che esiste Supabase: se un
domani il database cambia, cambia quella cartella e nient'altro. `src/dominio/`
non importa niente da `src/dati/`, così il tipo `Offerta` e la sua validazione
restano verificabili senza database. Le offerte dimostrative non spariscono:
diventano la fixture dei test, dove servono ancora, e un file di semi per
popolare il progetto di sviluppo.

---

## Task 1: Schema del database, tipo di dominio e mappatura

Non tocca la rete: produce il contratto SQL e la funzione che traduce una riga
del database nel tipo che le pagine già usano. È tutto verificabile con i test,
senza credenziali e senza progetto Supabase.

**Files:**
- Create: `supabase/migrations/0001_impianto.sql`
- Create: `web/src/dominio/offerta.ts`
- Create: `web/src/dati/righe.ts`
- Create: `web/src/dati/mappaOfferta.ts`
- Test: `web/src/dati/mappaOfferta.test.ts`
- Modify: `web/src/contenuti/offerteEsempio.ts` (importa il tipo invece di dichiararlo)

**Interfaces:**
- Consumes: niente, è il primo task
- Produces:
  - `type ModalitaOfferta = 'biglietti' | 'convenzione' | 'solo_sconto'`
  - `type Offerta` con i campi `slug, partner, categoria, vantaggio, descrizione, descrizioneCompleta, condizioni, validaDal, validaAl, modalita, istruzioni?, inEvidenza, contatti`
  - `type Contatti = { indirizzo?: string; telefono?: string; sito?: string; codiceSconto?: string }`
  - `type RigaOfferta` — copia fedele delle colonne di `offerte`
  - `mappaOfferta(riga: RigaOfferta): Offerta`

- [ ] **Step 1: Scrivere la migrazione iniziale**

Crea `supabase/migrations/0001_impianto.sql`:

```sql
-- Fase 2 — impianto del database del CRAL ARES.
--
-- Le colonne qui sono quelle stabili: presenti in ogni ipotesi sui campi
-- dell'offerta. Titolo separato, prezzi strutturati e immagine restano fuori
-- in attesa del direttivo (migrazione 0002).

create type modalita_offerta as enum ('solo_sconto', 'biglietti', 'convenzione');
create type stato_offerta    as enum ('bozza', 'pubblicata');

-- Chi può entrare nell'area riservata.
create table redattori (
  id        uuid primary key default gen_random_uuid(),
  email     text not null,
  nome      text not null,
  ruolo     text,
  attivo    boolean not null default true,
  creato_il timestamptz not null default now()
);
create unique index redattori_email_key on redattori (lower(email));

-- Circuiti cinematografici convenzionati. Li aggiorna lo sviluppatore:
-- cambiano una volta l'anno, una pagina di gestione sarebbe manutenzione
-- costruita per un problema che non esiste.
create table circuiti (
  id     uuid primary key default gen_random_uuid(),
  nome   text unique not null,
  ordine integer not null default 0,
  attivo boolean not null default true
);

create table offerte (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  partner           text not null,
  categoria         text not null,
  vantaggio         text not null,
  descrizione_breve text not null,
  descrizione       text not null,
  condizioni        text[] not null default '{}',
  valida_dal        date not null,
  valida_al         date not null,
  in_evidenza       boolean not null default false,
  modalita          modalita_offerta not null,
  istruzioni        text,
  -- contatti del partner: servono al socio nelle convenzioni e negli sconti
  -- da esibire alla cassa (spec §7)
  indirizzo         text,
  telefono          text,
  link_partner      text,
  codice_sconto     text,
  stato             stato_offerta not null default 'bozza',
  creata_da         uuid references redattori(id),
  creata_il         timestamptz not null default now(),
  aggiornata_il     timestamptz not null default now(),
  constraint offerte_validita_coerente check (valida_al >= valida_dal)
);

-- L'elenco pubblico filtra sempre per stato e per data: senza questo indice
-- ogni visita legge tutta la tabella.
create index offerte_pubbliche_idx on offerte (stato, valida_al desc);

create function tocca_aggiornata_il() returns trigger
language plpgsql as $$
begin
  new.aggiornata_il = now();
  return new;
end;
$$;

create trigger offerte_aggiornata_il
  before update on offerte
  for each row execute function tocca_aggiornata_il();

-- Vero se chi sta chiamando è un redattore attivo.
-- `security definer` perché la funzione deve poter leggere `redattori` anche
-- quando le politiche su quella tabella non lo permetterebbero: è la funzione
-- stessa a essere la politica.
create function e_redattore() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from redattori
    where lower(email) = lower(auth.jwt() ->> 'email') and attivo
  );
$$;

alter table redattori enable row level security;
alter table circuiti  enable row level security;
alter table offerte   enable row level security;

-- Le offerte pubblicate le legge chiunque: sono ciò che invoglia a iscriversi.
create policy "chiunque legge le offerte pubblicate" on offerte
  for select to anon, authenticated using (stato = 'pubblicata');

-- I redattori vedono anche le bozze e sono gli unici a scrivere.
create policy "i redattori leggono tutto" on offerte
  for select to authenticated using (e_redattore());
create policy "i redattori scrivono" on offerte
  for insert to authenticated with check (e_redattore());
create policy "i redattori modificano" on offerte
  for update to authenticated using (e_redattore()) with check (e_redattore());
create policy "i redattori eliminano" on offerte
  for delete to authenticated using (e_redattore());

-- L'elenco dei circuiti attivi serve al modulo pubblico del cinema (fase 4).
create policy "chiunque legge i circuiti attivi" on circuiti
  for select to anon, authenticated using (attivo);

-- La tabella dei redattori non è leggibile da nessuno attraverso l'API:
-- l'unico modo di consultarla è `e_redattore()`, che risponde sì o no.
-- Nessuna politica di select è quindi voluta, non dimenticata.
```

- [ ] **Step 2: Estrarre il tipo di dominio**

Crea `web/src/dominio/offerta.ts` spostandoci il tipo che oggi vive dentro
`contenuti/offerteEsempio.ts`, con l'aggiunta dei contatti del partner:

```ts
/**
 * Un'offerta, come la vedono le pagine.
 *
 * Non è la riga del database: i nomi sono quelli del sito, non quelli di
 * PostgreSQL, e i campi nulli sono `undefined` invece che `null`. La
 * traduzione sta in `dati/mappaOfferta.ts`, ed è l'unico punto che conosce
 * entrambe le forme.
 */

/** Come il socio ottiene il vantaggio. Rispecchia l'enum `modalita_offerta`. */
export type ModalitaOfferta = 'biglietti' | 'convenzione' | 'solo_sconto'

/** I recapiti del partner: al socio servono per andarci di persona. */
export type Contatti = {
  indirizzo?: string
  telefono?: string
  sito?: string
  codiceSconto?: string
}

export type Offerta = {
  slug: string
  partner: string
  categoria: string
  /** Il motivo per cui il socio si ferma a leggere. Va scritto corto. */
  vantaggio: string
  /** Una riga, per le schede negli elenchi. */
  descrizione: string
  /** Il testo completo, mostrato solo nella pagina dell'offerta. */
  descrizioneCompleta: string
  /** Le regole che il socio deve conoscere prima di chiedere. */
  condizioni: string[]
  /** Date ISO `AAAA-MM-GG`: servono a calcolare la validità, non a essere lette. */
  validaDal: string
  validaAl: string
  modalita: ModalitaOfferta
  /** Per `solo_sconto`: cosa deve fare il socio, senza passare da noi. */
  istruzioni?: string
  inEvidenza: boolean
  contatti: Contatti
}
```

In `web/src/contenuti/offerteEsempio.ts` cancella le due dichiarazioni di tipo
e sostituiscile con l'importazione, lasciando il resto del file intatto:

```ts
import type { Offerta, ModalitaOfferta } from '@/dominio/offerta'

export type { Offerta, ModalitaOfferta }
```

Poi aggiungi `contatti: {},` a ognuna delle otto offerte dell'array, così il
file continua a compilare.

- [ ] **Step 3: Scrivere il test fallito della mappatura**

Crea `web/src/dati/mappaOfferta.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { mappaOfferta } from './mappaOfferta'
import type { RigaOfferta } from './righe'

const riga: RigaOfferta = {
  slug: 'uci-cinemas-ingresso-ridotto',
  partner: 'UCI Cinemas',
  categoria: 'Cinema',
  vantaggio: '6,50 € invece di 9,50',
  descrizione_breve: 'Ingresso ridotto in tutte le sale del circuito.',
  descrizione: 'Il CRAL acquista biglietti a tariffa convenzionata.',
  condizioni: ['Fino a 6 biglietti al mese.'],
  valida_dal: '2026-09-01',
  valida_al: '2026-09-30',
  in_evidenza: true,
  modalita: 'biglietti',
  istruzioni: null,
  indirizzo: null,
  telefono: null,
  link_partner: null,
  codice_sconto: null,
  stato: 'pubblicata',
}

describe('mappaOfferta', () => {
  test('traduce i nomi delle colonne in quelli del sito', () => {
    const offerta = mappaOfferta(riga)

    expect(offerta.descrizione).toBe('Ingresso ridotto in tutte le sale del circuito.')
    expect(offerta.descrizioneCompleta).toBe('Il CRAL acquista biglietti a tariffa convenzionata.')
    expect(offerta.validaDal).toBe('2026-09-01')
    expect(offerta.validaAl).toBe('2026-09-30')
    expect(offerta.inEvidenza).toBe(true)
  })

  test('trasforma i campi nulli in assenti, non in null', () => {
    const offerta = mappaOfferta(riga)

    expect(offerta.istruzioni).toBeUndefined()
    expect(offerta.contatti).toEqual({})
  })

  test('raccoglie i recapiti del partner sotto contatti', () => {
    const offerta = mappaOfferta({
      ...riga,
      indirizzo: 'Via Toledo 1, Napoli',
      telefono: '081 1234567',
      link_partner: 'https://esempio.it',
      codice_sconto: 'CRAL26',
    })

    expect(offerta.contatti).toEqual({
      indirizzo: 'Via Toledo 1, Napoli',
      telefono: '081 1234567',
      sito: 'https://esempio.it',
      codiceSconto: 'CRAL26',
    })
  })

  test('non lascia mai condizioni indefinite', () => {
    const offerta = mappaOfferta({ ...riga, condizioni: [] })

    expect(offerta.condizioni).toEqual([])
  })
})
```

- [ ] **Step 4: Eseguire il test e verificare che fallisca**

Da `web/`:

```bash
npx vitest run src/dati/mappaOfferta.test.ts
```

Atteso: FAIL — `Failed to resolve import "./mappaOfferta"`.

- [ ] **Step 5: Scrivere i tipi delle righe**

Crea `web/src/dati/righe.ts`:

```ts
/**
 * I tipi delle righe, copia fedele di `supabase/migrations/0001_impianto.sql`.
 *
 * Sono scritti a mano invece che generati: il progetto ha tre tabelle, e un
 * passaggio di generazione da eseguire a ogni migrazione costa più di quanto
 * risparmi. Se un domani le tabelle diventassero dieci, si passa a
 * `supabase gen types typescript`.
 *
 * Regola: quando cambia una colonna, la migrazione e questo file cambiano
 * nello stesso commit.
 */

export type ModalitaRiga = 'solo_sconto' | 'biglietti' | 'convenzione'
export type StatoRiga = 'bozza' | 'pubblicata'

export type RigaOfferta = {
  slug: string
  partner: string
  categoria: string
  vantaggio: string
  descrizione_breve: string
  descrizione: string
  condizioni: string[]
  valida_dal: string
  valida_al: string
  in_evidenza: boolean
  modalita: ModalitaRiga
  istruzioni: string | null
  indirizzo: string | null
  telefono: string | null
  link_partner: string | null
  codice_sconto: string | null
  stato: StatoRiga
}

/** Le colonne da chiedere a Supabase per costruire un'`Offerta`. */
export const COLONNE_OFFERTA =
  'slug, partner, categoria, vantaggio, descrizione_breve, descrizione, ' +
  'condizioni, valida_dal, valida_al, in_evidenza, modalita, istruzioni, ' +
  'indirizzo, telefono, link_partner, codice_sconto, stato'
```

- [ ] **Step 6: Scrivere la mappatura**

Crea `web/src/dati/mappaOfferta.ts`:

```ts
import type { Contatti, Offerta } from '@/dominio/offerta'
import type { RigaOfferta } from './righe'

/** `null` è una risposta del database, `undefined` è l'assenza nel dominio. */
function valore(campo: string | null): string | undefined {
  return campo ?? undefined
}

function contatti(riga: RigaOfferta): Contatti {
  const recapiti: Contatti = {}
  if (riga.indirizzo) recapiti.indirizzo = riga.indirizzo
  if (riga.telefono) recapiti.telefono = riga.telefono
  if (riga.link_partner) recapiti.sito = riga.link_partner
  if (riga.codice_sconto) recapiti.codiceSconto = riga.codice_sconto
  return recapiti
}

/**
 * Una riga della tabella `offerte` diventa un'`Offerta`.
 *
 * È l'unico punto del progetto che conosce i nomi delle colonne oltre alle
 * query: le pagine parlano solo il linguaggio del dominio.
 */
export function mappaOfferta(riga: RigaOfferta): Offerta {
  return {
    slug: riga.slug,
    partner: riga.partner,
    categoria: riga.categoria,
    vantaggio: riga.vantaggio,
    descrizione: riga.descrizione_breve,
    descrizioneCompleta: riga.descrizione,
    condizioni: riga.condizioni ?? [],
    validaDal: riga.valida_dal,
    validaAl: riga.valida_al,
    modalita: riga.modalita,
    istruzioni: valore(riga.istruzioni),
    inEvidenza: riga.in_evidenza,
    contatti: contatti(riga),
  }
}
```

- [ ] **Step 7: Eseguire i test e verificare che passino**

Da `web/`:

```bash
npx vitest run
```

Atteso: tutti i file verdi, compresi i 90 test già esistenti.

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/0001_impianto.sql web/src/dominio web/src/dati web/src/contenuti/offerteEsempio.ts
git commit -m "Schema del database, tipo di dominio e mappatura delle righe"
```

---

## Task 2: Progetto Supabase, client e migrazione applicata

Il primo task che tocca la rete. Richiede **un'azione manuale di Michele**: la
creazione del progetto Supabase, che nessuno può fare al posto suo perché
serve un account.

**Files:**
- Create: `web/src/dati/ambiente.ts`
- Create: `web/src/dati/supabasePubblico.ts`
- Create: `web/src/dati/supabaseServer.ts`
- Create: `web/src/dati/supabaseBrowser.ts`
- Create: `supabase/semi/offerte-dimostrative.sql`
- Create: `web/.env.local` (non versionato) e `web/.env.example` (versionato)
- Test: `web/src/dati/ambiente.test.ts`
- Modify: `web/package.json` (dipendenze), `.gitignore` (radice), `web/README.md`

**Interfaces:**
- Consumes: `supabase/migrations/0001_impianto.sql` dal Task 1
- Produces:
  - `ambiente(): { url: string; chiaveAnonima: string }` — legge le variabili, fallisce a voce alta se mancano
  - `clientPubblico(): SupabaseClient` — letture pubbliche, **senza cookie**, così le pagine restano statiche
  - `clientServer(): Promise<SupabaseClient>` — con i cookie di sessione, per l'area riservata
  - `clientBrowser(): SupabaseClient` — per i Client Component

- [ ] **Step 1: Creare il progetto Supabase**

Azione manuale, cinque minuti, su <https://supabase.com/dashboard>:

1. **New project**, nome `cral-ares`.
2. **Region: `eu-central-1` (Frankfurt)** — obbligatorio, i dati devono restare
   nell'Unione Europea e la regione non si cambia dopo.
3. Piano **Free**.
4. Annotare la password del database che viene generata: serve a `db push`.
5. Da *Project Settings → API* copiare **Project URL** e **anon public key**.

> **Intestazione dell'account.** Il punto 4 dell'ordine del giorno — dominio e
> account intestati al CRAL — non è stato deliberato. Il progetto si crea
> intanto sull'account personale: con lo schema in migrazioni versionate, il
> trasferimento a un'organizzazione del CRAL è un'ora di lavoro, non una
> migrazione di dati.

- [ ] **Step 2: Installare le dipendenze**

Da `web/`:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 3: Scrivere le variabili d'ambiente**

Crea `web/.env.local` con i valori copiati allo Step 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Crea `web/.env.example`, questo sì versionato, con le stesse chiavi e i valori
vuoti. Verifica che `.gitignore` alla radice contenga già `.env*.local`; se non
c'è, aggiungilo.

> Entrambe le variabili sono `NEXT_PUBLIC_`, cioè visibili nel browser: è
> corretto e voluto. La chiave anonima è pubblica per progetto, e ciò che
> protegge i dati sono le politiche RLS del Task 1, non la segretezza della
> chiave. La chiave `service_role`, quella sì segreta, **non entra nel
> progetto**: non serve a niente di quello che facciamo.

- [ ] **Step 4: Scrivere il test fallito della lettura dell'ambiente**

Crea `web/src/dati/ambiente.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ambiente } from './ambiente'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('ambiente', () => {
  test('restituisce le due variabili quando ci sono', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://esempio.supabase.co')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'chiave-finta')

    expect(ambiente()).toEqual({
      url: 'https://esempio.supabase.co',
      chiaveAnonima: 'chiave-finta',
    })
  })

  test('spiega quale variabile manca, invece di rompersi più avanti', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '')
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'chiave-finta')

    expect(() => ambiente()).toThrowError(/NEXT_PUBLIC_SUPABASE_URL/)
  })
})
```

- [ ] **Step 5: Eseguire il test e verificare che fallisca**

```bash
npx vitest run src/dati/ambiente.test.ts
```

Atteso: FAIL — `Failed to resolve import "./ambiente"`.

- [ ] **Step 6: Scrivere i tre client**

Crea `web/src/dati/ambiente.ts`:

```ts
/**
 * Le due variabili che collegano il sito al database.
 *
 * Si leggono qui e in nessun altro punto. Il motivo è il messaggio d'errore:
 * una variabile mancante deve dire il proprio nome subito, all'avvio, e non
 * presentarsi tre schermate dopo come «Invalid URL».
 */
export function ambiente(): { url: string; chiaveAnonima: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chiaveAnonima = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url) throw new Error('Manca la variabile NEXT_PUBLIC_SUPABASE_URL')
  if (!chiaveAnonima) throw new Error('Manca la variabile NEXT_PUBLIC_SUPABASE_ANON_KEY')

  return { url, chiaveAnonima }
}
```

Crea `web/src/dati/supabasePubblico.ts`:

```ts
import { createClient } from '@supabase/supabase-js'
import { ambiente } from './ambiente'

/**
 * Il client delle pagine pubbliche. **Non tocca i cookie**, ed è il motivo per
 * cui esiste separato dagli altri due.
 *
 * In Next, leggere i cookie dentro una pagina la rende dinamica: verrebbe
 * generata a ogni visita invece che una volta sola. Le offerte sono uguali per
 * tutti e non hanno bisogno di sapere chi le guarda, quindi le pagine restano
 * statiche e si rigenerano ogni ora, come già fa `/offerte/[slug]`.
 */
export function clientPubblico() {
  const { url, chiaveAnonima } = ambiente()
  return createClient(url, chiaveAnonima, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
```

Crea `web/src/dati/supabaseServer.ts`:

```ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { ambiente } from './ambiente'

/**
 * Il client dell'area riservata: legge la sessione dai cookie.
 *
 * Usarlo rende dinamica la pagina che lo chiama — cosa giusta lì, dove ogni
 * schermata dipende da chi è entrato, e sbagliata sulle pagine pubbliche.
 */
export async function clientServer() {
  const { url, chiaveAnonima } = ambiente()
  const contenitore = await cookies()

  return createServerClient(url, chiaveAnonima, {
    cookies: {
      getAll: () => contenitore.getAll(),
      setAll: (biscotti) => {
        try {
          biscotti.forEach(({ name, value, options }) =>
            contenitore.set(name, value, options),
          )
        } catch {
          // In un Server Component i cookie sono in sola lettura: il rinnovo
          // della sessione lo fa il proxy, che può scriverli.
        }
      },
    },
  })
}
```

Crea `web/src/dati/supabaseBrowser.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr'
import { ambiente } from './ambiente'

/** Il client dei Client Component. Serve alla richiesta del link di accesso. */
export function clientBrowser() {
  const { url, chiaveAnonima } = ambiente()
  return createBrowserClient(url, chiaveAnonima)
}
```

- [ ] **Step 7: Eseguire i test e verificare che passino**

```bash
npx vitest run
```

Atteso: verdi, compresi i due nuovi.

- [ ] **Step 8: Collegare il progetto e applicare la migrazione**

Dalla **radice del repository** (non da `web/`):

```bash
npx supabase link --project-ref <riferimento-del-progetto>
npx supabase db push
```

Il riferimento del progetto è la parte variabile dell'URL
(`https://<riferimento>.supabase.co`). `db push` chiede la password del
database annotata allo Step 1.

Atteso: `Applying migration 0001_impianto.sql...` seguito da `Finished
supabase db push.`

> Nessuno stack locale: su questa macchina non c'è Docker, quindi
> `supabase start` non è disponibile. Si lavora direttamente sul progetto
> cloud, che in questa fase non ha ancora dati veri.

- [ ] **Step 9: Seminare le offerte dimostrative e il primo redattore**

Crea `supabase/semi/offerte-dimostrative.sql` con le otto offerte oggi in
`web/src/contenuti/offerteEsempio.ts`. Le prime due, come modello esatto della
forma da usare per tutte:

```sql
-- Dati di sviluppo, NON di produzione. Prima di andare online su cralares.it:
--   delete from offerte;
-- Le otto offerte sono le stesse mostrate al direttivo il 3 settembre.

insert into redattori (email, nome, ruolo) values
  ('michelecacciapuotipiccolo@gmail.com', 'Michele Cacciapuoti', 'Sviluppatore');

insert into circuiti (nome, ordine) values
  ('UCI Cinemas', 1),
  ('The Space Cinema', 2);

insert into offerte
  (slug, partner, categoria, vantaggio, descrizione_breve, descrizione,
   condizioni, valida_dal, valida_al, in_evidenza, modalita, istruzioni, stato)
values
  ('uci-cinemas-ingresso-ridotto', 'UCI Cinemas', 'Cinema',
   '6,50 € invece di 9,50',
   'Ingresso ridotto in tutte le sale del circuito, tutti i giorni della settimana.',
   'Il CRAL acquista biglietti a tariffa convenzionata per tutte le sale del circuito UCI. Valgono tutti i giorni della settimana, festivi compresi, e non hanno vincoli di orario. Gli spettacoli in 3D richiedono il supplemento occhiali, che si paga in sala.',
   array[
     'Ogni socio può richiedere fino a 6 biglietti al mese.',
     'I biglietti si ritirano in sede negli orari di apertura.',
     'Non sono rimborsabili, ma non hanno scadenza entro l''anno solare.'
   ],
   '2026-09-01', '2026-09-30', true, 'biglietti', null, 'pubblicata'),

  ('pneumatici-esposito', 'Pneumatici Esposito', 'Auto',
   '20% sul cambio stagionale',
   'Sconto su pneumatici, montaggio ed equilibratura mostrando la tessera.',
   'Sconto del 20% su pneumatici di tutte le marche trattate, montaggio ed equilibratura compresi. La convenzione copre anche il deposito stagionale degli pneumatici smontati, che è gratuito per i soci.',
   array[
     'Sconto non cumulabile con altre promozioni in corso.',
     'Occorre esibire la tessera del CRAL prima del preventivo.'
   ],
   '2026-09-01', '2026-11-30', false, 'solo_sconto',
   'Presentati in officina con la tessera del CRAL e chiedi il preventivo convenzionato. Non serve prenotare dal sito.',
   'pubblicata');
```

Completa il file con le altre sei offerte, copiando i testi dal file
TypeScript. Attenzione all'apostrofo: dentro una stringa SQL si raddoppia
(`dell''anno`).

Esegui il file dal **SQL Editor** del pannello Supabase, incollandone il
contenuto. È un'operazione una tantum, non serve automatizzarla.

- [ ] **Step 10: Verificare dal pannello**

Nel SQL Editor:

```sql
select slug, stato, valida_al from offerte order by valida_al;
select count(*) from redattori;
```

Atteso: otto righe di offerte, una di redattori.

- [ ] **Step 11: Documentare l'impianto nel README**

In `web/README.md` aggiungi una sezione **Database** che dica: dove stanno le
migrazioni, che si applicano con `npx supabase db push` dalla radice, che le
variabili d'ambiente si copiano da `.env.example`, e che i dati dimostrativi
vanno cancellati prima della pubblicazione sul dominio vero.

- [ ] **Step 12: Commit**

```bash
git add web/package.json web/package-lock.json web/.env.example web/src/dati web/README.md supabase/semi .gitignore
git commit -m "Progetto Supabase collegato, client e dati dimostrativi"
```

---

## Task 3: Le pagine pubbliche leggono dal database

Fine dei dati dimostrativi nel codice. Il sito mostra quello che c'è nella
tabella `offerte`, e le otto offerte di esempio diventano la fixture dei test —
dove servono ancora, perché un test che dipende dalla rete non è un test.

**Files:**
- Create: `web/src/dominio/selezione.ts`
- Create: `web/src/dominio/selezione.test.ts`
- Create: `web/src/dati/offerte.ts`
- Create: `web/src/dati/offerte.test.ts`
- Create: `web/src/test/offerteFinte.ts` (contenuto di `contenuti/offerteEsempio.ts`)
- Delete: `web/src/contenuti/offerteEsempio.ts`, `web/src/contenuti/offerteEsempio.test.ts`
- Modify: `web/src/app/page.tsx:4`, `web/src/app/offerte/page.tsx:5`, `web/src/app/offerte/[slug]/page.tsx:5`, `web/src/componenti/SchedaOfferta.tsx:2`
- Modify: `web/src/app/offerte/page.test.tsx`, `web/src/app/offerte/[slug]/page.test.tsx`, `web/src/test/pagina-assemblata.test.tsx`

**Interfaces:**
- Consumes: `mappaOfferta`, `COLONNE_OFFERTA` (Task 1); `clientPubblico` (Task 2)
- Produces:
  - `categorieDi(offerte: Offerta[]): string[]`, `perCategoria(offerte, categoria?): Offerta[]`, `inEvidenza(offerte): Offerta | undefined`, `altre(offerte): Offerta[]` — pure, in `dominio/selezione.ts`
  - `offerteValide(adesso?): Promise<Offerta[]>`, `offertaDaSlug(slug): Promise<Offerta | undefined>`, `slugPubblicati(): Promise<string[]>` — in `dati/offerte.ts`

**Nota di progetto.** Il database viene interrogato **una volta per pagina**:
si leggono le offerte valide e si filtra in memoria. Con qualche decina di
offerte è più veloce di tre query, e soprattutto lascia pure — quindi
verificabili senza rete — tutte le regole di selezione, che sono il punto dove
si annidano gli errori.

- [ ] **Step 1: Spostare le offerte dimostrative fra le fixture**

```bash
git mv web/src/contenuti/offerteEsempio.ts web/src/test/offerteFinte.ts
git rm web/src/contenuti/offerteEsempio.test.ts
```

In `web/src/test/offerteFinte.ts` **cancella tutte le funzioni in fondo al
file** (`offerteValide`, `offertaInEvidenza`, `altreOfferte`, `categorie`,
`offertePerCategoria`, `offertaDaSlug`): da qui in poi vivono altrove.
Restano l'array `offerte` e le importazioni di tipo. Rinomina l'export in
`offerteFinte`:

```ts
import type { Offerta } from '@/dominio/offerta'

/** Le otto offerte mostrate al direttivo, ora fixture dei test e dei semi SQL. */
export const offerteFinte: Offerta[] = [ /* ...invariate... */ ]
```

In `web/src/componenti/SchedaOfferta.tsx:2` cambia l'importazione del tipo:

```ts
import type { Offerta } from '@/dominio/offerta'
```

- [ ] **Step 2: Scrivere il test fallito delle regole di selezione**

Crea `web/src/dominio/selezione.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { altre, categorieDi, inEvidenza, perCategoria } from './selezione'
import { offerteFinte } from '@/test/offerteFinte'

describe('selezione delle offerte', () => {
  test('elenca le categorie presenti, senza ripetizioni e in ordine italiano', () => {
    expect(categorieDi(offerteFinte)).toEqual([
      'Auto',
      'Cinema',
      'Salute',
      'Sport',
      'Teatro',
    ])
  })

  test('filtra per categoria', () => {
    const cinema = perCategoria(offerteFinte, 'Cinema')

    expect(cinema).toHaveLength(2)
    expect(cinema.every((offerta) => offerta.categoria === 'Cinema')).toBe(true)
  })

  test('senza categoria restituisce tutto', () => {
    expect(perCategoria(offerteFinte)).toHaveLength(offerteFinte.length)
  })

  test('trova l’offerta in evidenza', () => {
    expect(inEvidenza(offerteFinte)?.slug).toBe('uci-cinemas-ingresso-ridotto')
  })

  test('restituisce undefined quando nessuna è in evidenza', () => {
    const senza = offerteFinte.map((offerta) => ({ ...offerta, inEvidenza: false }))

    expect(inEvidenza(senza)).toBeUndefined()
  })

  test('«le altre» sono tutte tranne quella in evidenza', () => {
    expect(altre(offerteFinte)).toHaveLength(offerteFinte.length - 1)
  })
})
```

- [ ] **Step 3: Eseguire il test e verificare che fallisca**

```bash
npx vitest run src/dominio/selezione.test.ts
```

Atteso: FAIL — `Failed to resolve import "./selezione"`.

- [ ] **Step 4: Scrivere le regole di selezione**

Crea `web/src/dominio/selezione.ts`:

```ts
import type { Offerta } from './offerta'

/**
 * Cosa mostrare, dato un elenco di offerte già valide.
 *
 * Sono funzioni pure e senza database di proposito: la regola «l'offerta in
 * evidenza è una sola, e può non esserci» è una regola del CRAL, non una
 * query, e va verificata senza chiedere niente alla rete.
 */

/** Le categorie presenti, in ordine alfabetico italiano. */
export function categorieDi(offerte: Offerta[]): string[] {
  return [...new Set(offerte.map((offerta) => offerta.categoria))].sort(
    (prima, seconda) => prima.localeCompare(seconda, 'it'),
  )
}

/** Le offerte di una categoria, o tutte se non se ne indica nessuna. */
export function perCategoria(offerte: Offerta[], categoria?: string): Offerta[] {
  if (!categoria) return offerte
  return offerte.filter((offerta) => offerta.categoria === categoria)
}

/**
 * L'offerta della settimana, quella che apre la home.
 *
 * Restituisce `undefined` quando non ce n'è nessuna: è una settimana come
 * un'altra e le pagine devono saperlo gestire, non rompersi.
 */
export function inEvidenza(offerte: Offerta[]): Offerta | undefined {
  return offerte.find((offerta) => offerta.inEvidenza)
}

/** Tutte le altre, nell'ordine in cui arrivano. */
export function altre(offerte: Offerta[]): Offerta[] {
  return offerte.filter((offerta) => !offerta.inEvidenza)
}
```

- [ ] **Step 5: Scrivere il test fallito delle query**

Crea `web/src/dati/offerte.test.ts`:

```ts
import { describe, expect, test, vi } from 'vitest'
import { offertaDaSlug, offerteValide } from './offerte'
import type { RigaOfferta } from './righe'

/**
 * Un finto client Supabase: accetta qualunque catena di filtri e restituisce
 * le righe che gli sono state date. Volutamente stupido — qui non stiamo
 * verificando Supabase, ma che le nostre funzioni chiedano le colonne giuste
 * e traducano il risultato.
 */
function clientFinto(righe: RigaOfferta[], errore: { message: string } | null = null) {
  const catena = {
    select: vi.fn(() => catena),
    eq: vi.fn(() => catena),
    lte: vi.fn(() => catena),
    gte: vi.fn(() => catena),
    order: vi.fn(() => Promise.resolve({ data: righe, error: errore })),
    maybeSingle: vi.fn(() => Promise.resolve({ data: righe[0] ?? null, error: errore })),
  }
  return { from: vi.fn(() => catena), catena }
}

const riga: RigaOfferta = {
  slug: 'teatro-diana-stagione-prosa',
  partner: 'Teatro Diana',
  categoria: 'Teatro',
  vantaggio: 'Poltronissima a 18 € invece di 32 €',
  descrizione_breve: 'Riduzione riservata ai soci.',
  descrizione: 'La riduzione vale su tutti gli spettacoli della stagione.',
  condizioni: ['Massimo quattro posti a socio.'],
  valida_dal: '2026-09-01',
  valida_al: '2026-10-15',
  in_evidenza: false,
  modalita: 'biglietti',
  istruzioni: null,
  indirizzo: null,
  telefono: null,
  link_partner: null,
  codice_sconto: null,
  stato: 'pubblicata',
}

describe('offerteValide', () => {
  test('chiede solo le offerte pubblicate e in corso alla data indicata', async () => {
    const finto = clientFinto([riga])

    await offerteValide('2026-09-15', finto as never)

    expect(finto.from).toHaveBeenCalledWith('offerte')
    expect(finto.catena.eq).toHaveBeenCalledWith('stato', 'pubblicata')
    expect(finto.catena.lte).toHaveBeenCalledWith('valida_dal', '2026-09-15')
    expect(finto.catena.gte).toHaveBeenCalledWith('valida_al', '2026-09-15')
  })

  test('restituisce offerte di dominio, non righe', async () => {
    const finto = clientFinto([riga])

    const [offerta] = await offerteValide('2026-09-15', finto as never)

    expect(offerta.descrizioneCompleta).toBe(
      'La riduzione vale su tutti gli spettacoli della stagione.',
    )
    expect(offerta.validaAl).toBe('2026-10-15')
  })

  test('solleva un errore leggibile se il database risponde male', async () => {
    const finto = clientFinto([], { message: 'connection refused' })

    await expect(offerteValide('2026-09-15', finto as never)).rejects.toThrow(
      /Non è stato possibile leggere le offerte/,
    )
  })
})

describe('offertaDaSlug', () => {
  test('cerca per slug senza filtrare per data: una scheda scaduta resta raggiungibile', async () => {
    const finto = clientFinto([riga])

    const offerta = await offertaDaSlug('teatro-diana-stagione-prosa', finto as never)

    expect(finto.catena.eq).toHaveBeenCalledWith('slug', 'teatro-diana-stagione-prosa')
    expect(finto.catena.lte).not.toHaveBeenCalled()
    expect(offerta?.partner).toBe('Teatro Diana')
  })

  test('restituisce undefined se lo slug non esiste', async () => {
    const finto = clientFinto([])

    expect(await offertaDaSlug('inventato', finto as never)).toBeUndefined()
  })
})
```

- [ ] **Step 6: Eseguire il test e verificare che fallisca**

```bash
npx vitest run src/dati/offerte.test.ts
```

Atteso: FAIL — `Failed to resolve import "./offerte"`.

- [ ] **Step 7: Scrivere le query**

Crea `web/src/dati/offerte.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Offerta } from '@/dominio/offerta'
import { oggi } from '@/lib/date'
import { mappaOfferta } from './mappaOfferta'
import { COLONNE_OFFERTA, type RigaOfferta } from './righe'
import { clientPubblico } from './supabasePubblico'

/**
 * La sola porta verso la tabella `offerte` per le pagine pubbliche.
 *
 * Il client si può passare dall'esterno: serve ai test, che gliene danno uno
 * finto invece di parlare con la rete.
 */

function fallisci(messaggio: string, dettaglio: string): never {
  throw new Error(`${messaggio} (${dettaglio})`)
}

/**
 * Le offerte che il socio deve vedere: pubblicate, iniziate e non scadute.
 *
 * È la promessa dello spec — «le offerte scadute spariscono da sole» — e non
 * si mantiene con la buona volontà di chi pubblica: si mantiene qui, nella
 * sola funzione da cui gli elenchi passano.
 */
export async function offerteValide(
  adesso = oggi(),
  client: SupabaseClient = clientPubblico(),
): Promise<Offerta[]> {
  const { data, error } = await client
    .from('offerte')
    .select(COLONNE_OFFERTA)
    .eq('stato', 'pubblicata')
    .lte('valida_dal', adesso)
    .gte('valida_al', adesso)
    .order('valida_al', { ascending: true })

  if (error) fallisci('Non è stato possibile leggere le offerte', error.message)

  return (data as unknown as RigaOfferta[]).map(mappaOfferta)
}

/**
 * Cerca per slug **senza filtrare per data**.
 *
 * Deliberato: la scheda di un'offerta finita resta raggiungibile, perché chi
 * apre un vecchio collegamento ricevuto per email deve trovare «questa offerta
 * è terminata» e non una pagina di errore.
 */
export async function offertaDaSlug(
  slug: string,
  client: SupabaseClient = clientPubblico(),
): Promise<Offerta | undefined> {
  const { data, error } = await client
    .from('offerte')
    .select(COLONNE_OFFERTA)
    .eq('stato', 'pubblicata')
    .eq('slug', slug)
    .maybeSingle()

  if (error) fallisci('Non è stato possibile leggere l’offerta', error.message)
  if (!data) return undefined

  return mappaOfferta(data as unknown as RigaOfferta)
}

/** Gli slug da pre-generare alla build. Comprende le offerte già scadute. */
export async function slugPubblicati(
  client: SupabaseClient = clientPubblico(),
): Promise<string[]> {
  const { data, error } = await client
    .from('offerte')
    .select('slug')
    .eq('stato', 'pubblicata')
    .order('valida_al', { ascending: false })

  if (error) fallisci('Non è stato possibile elencare le offerte', error.message)

  return (data as { slug: string }[]).map((riga) => riga.slug)
}
```

- [ ] **Step 8: Eseguire i test e verificare che passino**

```bash
npx vitest run src/dati/offerte.test.ts src/dominio/selezione.test.ts
```

Atteso: PASS.

- [ ] **Step 9: Collegare le tre pagine**

In `web/src/app/offerte/page.tsx` sostituisci l'importazione e il corpo del
calcolo — **una sola lettura, poi filtri puri**:

```ts
import { offerteValide } from '@/dati/offerte'
import { categorieDi, perCategoria } from '@/dominio/selezione'
```

```ts
  const valide = await offerteValide()
  const elencoCategorie = categorieDi(valide)

  const parametri = await searchParams
  const richiesta = parametri.categoria
  const categoriaScelta =
    typeof richiesta === 'string' && elencoCategorie.includes(richiesta)
      ? richiesta
      : undefined

  const elenco = perCategoria(valide, categoriaScelta)
```

Nel JSX sostituisci `categorie().map(...)` con `elencoCategorie.map(...)`.

> Il controllo `elencoCategorie.includes(richiesta)` resta com'è: è il confronto
> esatto con un elenco chiuso che la revisione di sicurezza del 6 settembre ha
> chiesto di mantenere quando i dati sarebbero arrivati dal database. Non
> sostituirlo con una ricerca libera sul testo.

In `web/src/app/page.tsx`:

```ts
import { offerteValide } from '@/dati/offerte'
import { altre, inEvidenza } from '@/dominio/selezione'
```

e nel corpo del componente, prima del `return`:

```ts
  const valide = await offerteValide()
  const offertaPrincipale = inEvidenza(valide)
  const altreDaMostrare = altre(valide)
```

sostituendo le chiamate esistenti a `offertaInEvidenza()` e `altreOfferte()`.

In `web/src/app/offerte/[slug]/page.tsx`:

```ts
import { offertaDaSlug, slugPubblicati } from '@/dati/offerte'
```

```ts
export async function generateStaticParams() {
  return (await slugPubblicati()).map((slug) => ({ slug }))
}
```

e nelle due funzioni che leggono l'offerta, `const offerta = await offertaDaSlug(slug)`.

- [ ] **Step 10: Aggiornare i test delle pagine**

I test delle pagine non devono toccare la rete: si sostituisce il modulo dei
dati. In testa a `web/src/app/offerte/page.test.tsx`,
`web/src/app/offerte/[slug]/page.test.tsx` e
`web/src/test/pagina-assemblata.test.tsx`, **prima** delle altre importazioni:

```ts
import { vi } from 'vitest'
import { offerteFinte } from '@/test/offerteFinte'

vi.mock('@/dati/offerte', () => ({
  offerteValide: async () => offerteFinte.filter((o) => o.validaAl >= '2026-09-15'),
  offertaDaSlug: async (slug: string) =>
    offerteFinte.find((offerta) => offerta.slug === slug),
  slugPubblicati: async () => offerteFinte.map((offerta) => offerta.slug),
}))
```

Poi sostituisci in ogni file le importazioni da `@/contenuti/offerteEsempio`
con `offerteFinte` da `@/test/offerteFinte`, e dove i test usavano
`offerteValide()` come dato atteso, usa la stessa espressione del mock.

- [ ] **Step 11: Eseguire tutta la suite**

```bash
npx vitest run
```

Atteso: verdi. Nessun test deve fallire per una connessione mancante: se
succede, un mock non è stato applicato.

- [ ] **Step 12: Provare il sito con i dati veri**

```bash
npm run dev
```

Apri <http://localhost:3000/offerte>. Atteso: le otto offerte seminate al Task 2,
il filtro per categoria funzionante, la scheda della mostra terminata che dice
«questa offerta è terminata».

Poi:

```bash
npm run build
```

Atteso: build completata, e nell'elenco delle rotte `/offerte/[slug]` continua
a essere generata staticamente (`●`). Se compare `ƒ`, una pagina pubblica sta
leggendo i cookie: controlla di non aver usato `clientServer` al posto di
`clientPubblico`.

- [ ] **Step 13: Commit**

```bash
git add web/src supabase
git commit -m "Le pagine pubbliche leggono le offerte dal database"
```

---

## Task 4: Accesso dei direttori con link monouso

Nessuna password: il direttore scrive la propria email, riceve un link, entra.
La difesa è doppia — chi non è invitato non riceve il link, e chi arrivasse
comunque a una sessione non passa il guscio dell'area riservata.

**Files:**
- Create: `supabase/migrations/0002_accesso.sql`
- Create: `web/src/dati/redattori.ts`
- Test: `web/src/dati/redattori.test.ts`
- Create: `web/src/app/azioni/accesso.ts`
- Create: `web/src/app/area-riservata/accedi/page.tsx`
- Create: `web/src/app/area-riservata/accedi/ModuloAccesso.tsx`
- Create: `web/src/app/area-riservata/callback/route.ts`
- Create: `web/src/app/area-riservata/(interno)/layout.tsx`
- Create: `web/src/proxy.ts`
- Test: `web/src/app/area-riservata/accedi/page.test.tsx`
- Modify: `netlify.toml` (politica dei contenuti), `web/src/contenuti/pagine.ts` (testi), `web/src/app/cookie/page.tsx` (cookie di sessione)

**Interfaces:**
- Consumes: `clientServer` (Task 2)
- Produces:
  - `redattoreAttivo(): Promise<boolean>` — vero se la sessione corrente è di un redattore attivo
  - `richiediAccesso(statoPrecedente, datiModulo): Promise<{ messaggio: string }>` — Server Action

- [ ] **Step 1: Invitare i redattori e registrarli**

Azione manuale nel pannello Supabase, *Authentication → Users → Add user →
Send invitation*: un invito per ogni direttore, più il tuo indirizzo.

Poi nel SQL Editor, per ciascuno:

```sql
insert into redattori (email, nome, ruolo) values
  ('nome.cognome@esempio.it', 'Nome Cognome', 'Presidente');
```

> **Le due liste hanno ruoli diversi, e devono restare separate.**
> `auth.users` decide *chi può ricevere un link*; `redattori` decide *chi è
> autorizzato*. Disattivare un direttore si fa con `update redattori set attivo
> = false`: la sessione successiva viene respinta anche se l'utente esiste
> ancora in `auth.users`.
>
> Gli indirizzi veri dei direttori sono la prima domanda dell'elenco per il
> direttivo e **non sono ancora noti**. Finché non arrivano, il solo redattore
> è quello inserito al Task 2.

- [ ] **Step 2: Scrivere la migrazione dei permessi**

Crea `supabase/migrations/0002_accesso.sql`:

```sql
-- `e_redattore()` viene chiamata anche dall'applicazione, via RPC, per sapere
-- se la sessione corrente può entrare nell'area riservata. Un anonimo non deve
-- poterla interrogare: sarebbe un modo per scoprire chi è direttore.
revoke execute on function e_redattore() from anon, public;
grant  execute on function e_redattore() to authenticated;
```

Applica dalla radice del repository:

```bash
npx supabase db push
```

- [ ] **Step 3: Scrivere il test fallito del controllo di autorizzazione**

Crea `web/src/dati/redattori.test.ts`:

```ts
import { describe, expect, test, vi } from 'vitest'
import { redattoreAttivoCon } from './redattori'

function client(utente: object | null, autorizzato: boolean | null) {
  return {
    auth: { getUser: vi.fn(async () => ({ data: { user: utente } })) },
    rpc: vi.fn(async () => ({ data: autorizzato, error: null })),
  }
}

describe('redattoreAttivoCon', () => {
  test('è falso senza sessione, e non interroga nemmeno il database', async () => {
    const finto = client(null, true)

    expect(await redattoreAttivoCon(finto as never)).toBe(false)
    expect(finto.rpc).not.toHaveBeenCalled()
  })

  test('è falso se la sessione esiste ma l’email non è fra i redattori attivi', async () => {
    expect(await redattoreAttivoCon(client({ id: '1' }, false) as never)).toBe(false)
  })

  test('è vero solo con sessione e autorizzazione', async () => {
    const finto = client({ id: '1' }, true)

    expect(await redattoreAttivoCon(finto as never)).toBe(true)
    expect(finto.rpc).toHaveBeenCalledWith('e_redattore')
  })
})
```

- [ ] **Step 4: Eseguire il test e verificare che fallisca**

```bash
npx vitest run src/dati/redattori.test.ts
```

Atteso: FAIL — `Failed to resolve import "./redattori"`.

- [ ] **Step 5: Scrivere il controllo di autorizzazione**

Crea `web/src/dati/redattori.ts`:

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import { clientServer } from './supabaseServer'

/**
 * Chi può stare nell'area riservata.
 *
 * Due condizioni, entrambe necessarie: una sessione valida, e un'email che
 * risulti fra i redattori attivi. La seconda la decide il database con
 * `e_redattore()`, non il codice: così la stessa regola vale anche per le
 * politiche RLS, e non c'è modo di aggirarla scrivendo una query diversa.
 */
export async function redattoreAttivoCon(client: SupabaseClient): Promise<boolean> {
  const { data } = await client.auth.getUser()
  if (!data.user) return false

  const { data: autorizzato } = await client.rpc('e_redattore')
  return autorizzato === true
}

export async function redattoreAttivo(): Promise<boolean> {
  return redattoreAttivoCon(await clientServer())
}
```

- [ ] **Step 6: Scrivere la Server Action di richiesta accesso**

Crea `web/src/app/azioni/accesso.ts`:

```ts
'use server'

import { clientServer } from '@/dati/supabaseServer'

const RISPOSTA_NEUTRA =
  'Se l’indirizzo è fra quelli autorizzati, fra poco arriva un’email con il link per entrare. Il link vale una volta sola e scade dopo un’ora.'

/**
 * Chiede il link di accesso.
 *
 * Risponde **sempre la stessa cosa**, che l'indirizzo sia autorizzato o no.
 * Un modulo che distingue i due casi è, di fatto, uno strumento per scoprire
 * chi fa parte del direttivo: costa niente non offrirlo.
 */
export async function richiediAccesso(
  _statoPrecedente: { messaggio: string } | null,
  datiModulo: FormData,
): Promise<{ messaggio: string }> {
  const email = String(datiModulo.get('email') ?? '').trim()

  if (!email.includes('@')) {
    return { messaggio: 'Scrivi un indirizzo email per ricevere il link.' }
  }

  const client = await clientServer()
  await client.auth.signInWithOtp({
    email,
    options: {
      // Nessun account nuovo: i direttori si invitano dal pannello Supabase.
      // Un indirizzo sconosciuto riceve un errore, che qui viene ignorato.
      shouldCreateUser: false,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITO_URL ?? 'http://localhost:3000'}/area-riservata/callback`,
    },
  })

  return { messaggio: RISPOSTA_NEUTRA }
}
```

Aggiungi a `web/.env.local` e `web/.env.example`:

```
NEXT_PUBLIC_SITO_URL=http://localhost:3000
```

Nel pannello Supabase, *Authentication → URL Configuration*, aggiungi fra i
**Redirect URLs**: `http://localhost:3000/area-riservata/callback` e l'indirizzo
Netlify dell'anteprima. Senza questo il link nell'email non riporta al sito.

- [ ] **Step 7: Scrivere la pagina di accesso**

Crea `web/src/app/area-riservata/accedi/ModuloAccesso.tsx`:

```tsx
'use client'

import { useActionState } from 'react'
import { richiediAccesso } from '@/app/azioni/accesso'

export function ModuloAccesso() {
  const [stato, azione, inCorso] = useActionState(richiediAccesso, null)

  return (
    <form action={azione} className="mt-8 flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="font-semibold text-inchiostro">
          Il tuo indirizzo email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="fuoco-su-chiaro border border-linea bg-superficie px-3 py-2 text-corpo"
        />
      </div>

      <button
        type="submit"
        disabled={inCorso}
        className="fuoco-su-chiaro border border-blu-profondo bg-blu-profondo px-4 py-2 font-semibold text-white disabled:opacity-60"
      >
        {inCorso ? 'Invio in corso…' : 'Mandami il link'}
      </button>

      {stato ? (
        <p role="status" className="border-l-2 border-azzurro bg-fascia px-4 py-3 text-corpo">
          {stato.messaggio}
        </p>
      ) : null}
    </form>
  )
}
```

Crea `web/src/app/area-riservata/accedi/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { ModuloAccesso } from './ModuloAccesso'

export const metadata: Metadata = {
  title: 'Accesso riservato',
  robots: { index: false, follow: false },
}

export default async function Accedi({
  searchParams,
}: {
  searchParams: Promise<{ [chiave: string]: string | string[] | undefined }>
}) {
  const { nonAutorizzato } = await searchParams

  return (
    <section className="max-w-2xl">
      <h1 className="text-titolo-pagina text-inchiostro">Area riservata</h1>
      <p className="mt-3 text-corpo text-inchiostro-tenue">
        Riservata ai direttori del CRAL. Non serve una password: arriva un link
        per email, si preme, si entra.
      </p>

      {nonAutorizzato ? (
        <p
          role="alert"
          className="mt-6 border-l-4 border-arancione bg-fascia px-4 py-3 text-corpo"
        >
          Questo indirizzo non è fra quelli autorizzati a pubblicare le offerte.
          Se pensi che sia un errore, scrivi agli altri direttori.
        </p>
      ) : null}

      <ModuloAccesso />
    </section>
  )
}
```

- [ ] **Step 8: Scrivere il callback e il guscio protetto**

Crea `web/src/app/area-riservata/callback/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { clientServer } from '@/dati/supabaseServer'

/** Il link ricevuto per email finisce qui: si scambia il codice con la sessione. */
export async function GET(richiesta: Request) {
  const indirizzo = new URL(richiesta.url)
  const codice = indirizzo.searchParams.get('code')

  if (!codice) {
    return NextResponse.redirect(new URL('/area-riservata/accedi', indirizzo))
  }

  const client = await clientServer()
  const { error } = await client.auth.exchangeCodeForSession(codice)

  if (error) {
    return NextResponse.redirect(new URL('/area-riservata/accedi', indirizzo))
  }

  return NextResponse.redirect(new URL('/area-riservata', indirizzo))
}
```

Crea `web/src/app/area-riservata/(interno)/layout.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { redattoreAttivo } from '@/dati/redattori'
import { clientServer } from '@/dati/supabaseServer'

/**
 * Il guscio dell'area riservata.
 *
 * Il controllo sta qui e non in ogni pagina: una pagina nuova aggiunta fra sei
 * mesi è protetta perché si trova dentro questa cartella, non perché qualcuno
 * si è ricordato di proteggerla.
 */
export default async function GuscioRiservato({
  children,
}: {
  children: React.ReactNode
}) {
  const client = await clientServer()
  const { data } = await client.auth.getUser()

  if (!data.user) redirect('/area-riservata/accedi')

  if (!(await redattoreAttivo())) {
    await client.auth.signOut()
    redirect('/area-riservata/accedi?nonAutorizzato=1')
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-inchiostro-tenue">
        Sei entrato come {data.user.email}
      </p>
      {children}
    </div>
  )
}
```

> **Il guscio sta dentro un gruppo di rotte `(interno)`, e non direttamente in
> `area-riservata/`.** Un `layout.tsx` in `app/area-riservata/` avvolgerebbe
> *tutto* ciò che sta sotto, pagina di accesso compresa: chi non è entrato
> verrebbe rimandato ad `/area-riservata/accedi`, che essendo dentro il guscio
> lo rimanderebbe di nuovo, all'infinito.
>
> Un gruppo di rotte — le parentesi nel nome della cartella — raggruppa i file
> **senza comparire nell'indirizzo**. Quindi:
>
> ```
> app/area-riservata/
> ├── accedi/page.tsx          → /area-riservata/accedi     (fuori dal guscio)
> ├── callback/route.ts        → /area-riservata/callback   (fuori dal guscio)
> └── (interno)/
>     ├── layout.tsx           il guscio protetto
>     ├── page.tsx             → /area-riservata
>     └── offerte/…            → /area-riservata/offerte/…
> ```
>
> Gli indirizzi restano quelli dello spec. È anche il gruppo di rotte che il
> verbale del 6 settembre aveva rimandato alla fase 2 fra le cose «non
> urgenti»: qui diventa necessario.

Crea `web/src/proxy.ts`:

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Rinnova la sessione a ogni visita dell'area riservata.
 *
 * Serve perché un Server Component può leggere i cookie ma non scriverli: se
 * il token scade mentre il direttore compila un'offerta, è qui che viene
 * rinnovato. Il `matcher` limita il proxy all'area riservata, così le pagine
 * pubbliche restano statiche.
 *
 * Si chiama `proxy` e non `middleware`: in Next 16 il file `middleware.ts` è
 * deprecato e rinominato `proxy.ts`, con la funzione esportata che segue il
 * nome del file. Il comportamento è identico.
 */
export async function proxy(richiesta: NextRequest) {
  let risposta = NextResponse.next({ request: richiesta })

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => richiesta.cookies.getAll(),
        setAll: (biscotti) => {
          biscotti.forEach(({ name, value }) => richiesta.cookies.set(name, value))
          risposta = NextResponse.next({ request: richiesta })
          biscotti.forEach(({ name, value, options }) =>
            risposta.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  await client.auth.getUser()

  return risposta
}

export const config = {
  matcher: ['/area-riservata/:path*'],
}
```

- [ ] **Step 9: Aprire la politica dei contenuti verso Supabase**

In `netlify.toml`, nella direttiva `Content-Security-Policy`, aggiungi
l'origine del progetto a `connect-src`:

```
connect-src 'self' https://xxxxxxxxxxxx.supabase.co;
```

> È il punto 2 della revisione di sicurezza del 6 settembre: *«`connect-src
> 'self'` andrà rivisto con l'autenticazione Supabase: vanno aggiunte quelle
> origini in modo stretto e nominato, mai allargando la direttiva.»* Si nomina
> **l'origine esatta del progetto**, non `https://*.supabase.co`.

- [ ] **Step 10: Dichiarare i cookie di sessione nella pagina cookie**

In `web/src/app/cookie/page.tsx` (o nel testo corrispondente in
`contenuti/pagine.ts`) aggiungi che l'area riservata, riservata ai direttori,
usa **cookie tecnici di sessione** necessari a tenere l'accesso; non profilano
e non seguono la navigazione. La pagina oggi dichiara che il sito non imposta
alcun cookie: da questo task non è più vero, e l'informativa deve dire il vero.

- [ ] **Step 11: Scrivere il test della pagina di accesso**

Crea `web/src/app/area-riservata/accedi/page.test.tsx`:

```tsx
import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Accedi from './page'
import { violazioniAccessibilita } from '@/test/accessibilita'

vi.mock('@/app/azioni/accesso', () => ({
  richiediAccesso: vi.fn(async () => ({ messaggio: 'ok' })),
}))

describe('pagina di accesso', () => {
  test('chiede l’email e non parla mai di password', async () => {
    render(await Accedi({ searchParams: Promise.resolve({}) }))

    expect(screen.getByLabelText(/indirizzo email/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument()
  })

  test('spiega il rifiuto a chi non è autorizzato', async () => {
    render(await Accedi({ searchParams: Promise.resolve({ nonAutorizzato: '1' }) }))

    expect(screen.getByRole('alert')).toHaveTextContent(/non è fra quelli autorizzati/i)
  })

  test('non ha problemi di accessibilità', async () => {
    const { container } = render(await Accedi({ searchParams: Promise.resolve({}) }))

    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
```

- [ ] **Step 12: Eseguire i test e provare l'accesso vero**

```bash
npx vitest run
npm run dev
```

Prova completa, da fare davvero:

1. `/area-riservata` senza sessione → rimanda ad `/area-riservata/accedi`.
2. Indirizzo non invitato → stesso messaggio neutro, **nessuna email**.
3. Il tuo indirizzo → arriva l'email, il link porta dentro.
4. `update redattori set attivo = false where email = '...'`, ricarica
   `/area-riservata` → espulso con il messaggio di non autorizzazione.
   Poi rimetti `attivo = true`.

- [ ] **Step 13: Commit**

```bash
git add web/src supabase/migrations/0002_accesso.sql netlify.toml web/.env.example
git commit -m "Accesso dei direttori con link monouso, difeso anche dal database"
```

---

## Task 5: L'elenco delle offerte in area riservata

La prima schermata che il direttore vede dopo essere entrato: cosa c'è
pubblicato, cosa è ancora in bozza, cosa sta per scadere.

**Files:**
- Create: `web/src/dominio/statoOfferta.ts`
- Test: `web/src/dominio/statoOfferta.test.ts`
- Create: `web/src/dati/offerteRiservate.ts`
- Create: `web/src/app/area-riservata/(interno)/page.tsx`
- Test: `web/src/app/area-riservata/(interno)/page.test.tsx`
- Modify: `web/src/app/azioni/accesso.ts` (aggiunta di `esci`)

**Interfaces:**
- Consumes: `clientServer` (Task 2), `mappaOfferta`, `COLONNE_OFFERTA` (Task 1)
- Produces:
  - `type StatoLeggibile = 'Bozza' | 'Programmata' | 'In corso' | 'Scaduta'`
  - `statoLeggibile(offerta: { stato: 'bozza' | 'pubblicata'; validaDal: string; validaAl: string }, adesso?): StatoLeggibile`
  - `tutteLeOfferte(): Promise<OffertaRiservata[]>` dove `OffertaRiservata = Offerta & { id: string; stato: 'bozza' | 'pubblicata' }`
  - `esci(): Promise<void>` — Server Action

- [ ] **Step 1: Scrivere il test fallito dello stato leggibile**

Crea `web/src/dominio/statoOfferta.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { statoLeggibile } from './statoOfferta'

const base = { stato: 'pubblicata' as const, validaDal: '2026-09-01', validaAl: '2026-09-30' }

describe('statoLeggibile', () => {
  test('una bozza è una bozza, comunque siano le date', () => {
    expect(statoLeggibile({ ...base, stato: 'bozza' }, '2026-09-15')).toBe('Bozza')
    expect(statoLeggibile({ ...base, stato: 'bozza' }, '2026-12-31')).toBe('Bozza')
  })

  test('pubblicata e dentro le date è in corso', () => {
    expect(statoLeggibile(base, '2026-09-15')).toBe('In corso')
  })

  test('il primo e l’ultimo giorno sono ancora in corso', () => {
    expect(statoLeggibile(base, '2026-09-01')).toBe('In corso')
    expect(statoLeggibile(base, '2026-09-30')).toBe('In corso')
  })

  test('pubblicata ma non ancora iniziata è programmata', () => {
    expect(statoLeggibile(base, '2026-08-20')).toBe('Programmata')
  })

  test('pubblicata e con la validità passata è scaduta', () => {
    expect(statoLeggibile(base, '2026-10-01')).toBe('Scaduta')
  })
})
```

- [ ] **Step 2: Eseguire il test e verificare che fallisca**

```bash
npx vitest run src/dominio/statoOfferta.test.ts
```

Atteso: FAIL — `Failed to resolve import "./statoOfferta"`.

- [ ] **Step 3: Scrivere lo stato leggibile**

Crea `web/src/dominio/statoOfferta.ts`:

```ts
import { nonAncoraIniziata, oggi, scaduta } from '@/lib/date'

export type StatoLeggibile = 'Bozza' | 'Programmata' | 'In corso' | 'Scaduta'

/**
 * Come si dice a un direttore in che stato è un'offerta.
 *
 * Nel database gli stati sono due — bozza o pubblicata — ma al direttore
 * servono quattro parole, perché «pubblicata» non distingue quella che va
 * online domani da quella finita la settimana scorsa. La distinzione è una
 * regola del sito, non una colonna, e per questo sta qui.
 */
export function statoLeggibile(
  offerta: { stato: 'bozza' | 'pubblicata'; validaDal: string; validaAl: string },
  adesso = oggi(),
): StatoLeggibile {
  if (offerta.stato === 'bozza') return 'Bozza'
  if (nonAncoraIniziata(offerta.validaDal, adesso)) return 'Programmata'
  if (scaduta(offerta.validaAl, adesso)) return 'Scaduta'
  return 'In corso'
}
```

- [ ] **Step 4: Scrivere le query dell'area riservata**

Crea `web/src/dati/offerteRiservate.ts`:

```ts
import type { Offerta } from '@/dominio/offerta'
import { mappaOfferta } from './mappaOfferta'
import { COLONNE_OFFERTA, type RigaOfferta } from './righe'
import { clientServer } from './supabaseServer'

export type OffertaRiservata = Offerta & { id: string; stato: 'bozza' | 'pubblicata' }

const COLONNE = `id, ${COLONNE_OFFERTA}`

/**
 * Tutte le offerte, bozze comprese.
 *
 * Le bozze arrivano solo perché la sessione è di un redattore: la politica RLS
 * «i redattori leggono tutto» le lascia passare, l'anonimo vedrebbe le stesse
 * righe della pagina pubblica anche chiamando questa funzione.
 */
export async function tutteLeOfferte(): Promise<OffertaRiservata[]> {
  const client = await clientServer()
  const { data, error } = await client
    .from('offerte')
    .select(COLONNE)
    .order('aggiornata_il', { ascending: false })

  if (error) {
    throw new Error(`Non è stato possibile leggere le offerte (${error.message})`)
  }

  return (data as unknown as (RigaOfferta & { id: string })[]).map((riga) => ({
    ...mappaOfferta(riga),
    id: riga.id,
    stato: riga.stato,
  }))
}

/** Una sola offerta, per la pagina di modifica. */
export async function offertaPerId(id: string): Promise<OffertaRiservata | undefined> {
  const client = await clientServer()
  const { data, error } = await client
    .from('offerte')
    .select(COLONNE)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`Non è stato possibile leggere l’offerta (${error.message})`)
  }
  if (!data) return undefined

  const riga = data as unknown as RigaOfferta & { id: string }
  return { ...mappaOfferta(riga), id: riga.id, stato: riga.stato }
}
```

- [ ] **Step 5: Aggiungere l'uscita**

In fondo a `web/src/app/azioni/accesso.ts`:

```ts
import { redirect } from 'next/navigation'

/** Esce dall'area riservata. Un direttore che pubblica da un computer condiviso deve poterlo fare. */
export async function esci(): Promise<void> {
  const client = await clientServer()
  await client.auth.signOut()
  redirect('/area-riservata/accedi')
}
```

- [ ] **Step 6: Scrivere l'elenco**

Crea `web/src/app/area-riservata/(interno)/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { esci } from '@/app/azioni/accesso'
import { tutteLeOfferte } from '@/dati/offerteRiservate'
import { statoLeggibile } from '@/dominio/statoOfferta'
import { formattaData } from '@/lib/date'

export const metadata: Metadata = {
  title: 'Le offerte',
  robots: { index: false, follow: false },
}

export default async function AreaRiservata() {
  const offerte = await tutteLeOfferte()

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-titolo-pagina text-inchiostro">Le offerte</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/area-riservata/offerte/nuova"
            className="fuoco-su-chiaro border border-blu-profondo bg-blu-profondo px-4 py-2 font-semibold text-white"
          >
            Nuova offerta
          </Link>
          <form action={esci}>
            <button type="submit" className="fuoco-su-chiaro rounded text-sm underline underline-offset-4">
              Esci
            </button>
          </form>
        </div>
      </div>

      {offerte.length === 0 ? (
        <p className="mt-8 text-corpo">
          Non c’è ancora nessuna offerta. Comincia da «Nuova offerta».
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <caption className="sr-only">
              Elenco delle offerte, dalla più recente modifica
            </caption>
            <thead>
              <tr className="border-b border-linea text-sm text-inchiostro-tenue">
                <th scope="col" className="py-2 pr-4 font-semibold">Partner</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Categoria</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Stato</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Valida fino al</th>
                <th scope="col" className="py-2 font-semibold">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {offerte.map((offerta) => (
                <tr key={offerta.id} className="border-b border-linea align-top">
                  <td className="py-3 pr-4 font-semibold">{offerta.partner}</td>
                  <td className="py-3 pr-4">{offerta.categoria}</td>
                  <td className="py-3 pr-4">{statoLeggibile(offerta)}</td>
                  <td className="py-3 pr-4">{formattaData(offerta.validaAl)}</td>
                  <td className="py-3">
                    <Link
                      href={`/area-riservata/offerte/${offerta.id}`}
                      className="fuoco-su-chiaro rounded font-semibold text-ambra-scura underline underline-offset-4"
                    >
                      Modifica
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 7: Scrivere il test dell'elenco**

Crea `web/src/app/area-riservata/(interno)/page.test.tsx`:

```tsx
import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { offerteFinte } from '@/test/offerteFinte'
import { violazioniAccessibilita } from '@/test/accessibilita'

vi.mock('@/dati/offerteRiservate', () => ({
  tutteLeOfferte: async () =>
    offerteFinte.map((offerta, indice) => ({
      ...offerta,
      id: `id-${indice}`,
      stato: indice === 0 ? ('bozza' as const) : ('pubblicata' as const),
    })),
}))
vi.mock('@/app/azioni/accesso', () => ({ esci: vi.fn() }))

const AreaRiservata = (await import('./page')).default

describe('elenco in area riservata', () => {
  test('mostra ogni offerta con il suo stato', async () => {
    render(await AreaRiservata())

    expect(screen.getAllByRole('row')).toHaveLength(offerteFinte.length + 1)
    expect(screen.getByText('Bozza')).toBeInTheDocument()
  })

  test('offre di creare una nuova offerta', async () => {
    render(await AreaRiservata())

    expect(screen.getByRole('link', { name: /nuova offerta/i })).toHaveAttribute(
      'href',
      '/area-riservata/offerte/nuova',
    )
  })

  test('non ha problemi di accessibilità', async () => {
    const { container } = render(await AreaRiservata())

    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
```

- [ ] **Step 8: Eseguire i test e commit**

```bash
npx vitest run
git add web/src
git commit -m "Elenco delle offerte in area riservata, con stato e uscita"
```

---

## Task 6: Nuova offerta, con anteprima dal vivo

Il modulo su cui si gioca la promessa fatta in riunione. L'anteprima non è un
vezzo: è ciò che permette a un direttore non tecnico di capire cosa sta facendo
mentre lo fa, invece di scoprirlo dopo aver pubblicato.

**Files:**
- Create: `web/src/dominio/offertaSchema.ts`
- Test: `web/src/dominio/offertaSchema.test.ts`
- Create: `web/src/dominio/slug.ts`
- Test: `web/src/dominio/slug.test.ts`
- Create: `web/src/componenti/ModuloOfferta.tsx`
- Create: `web/src/app/azioni/offerte.ts`
- Create: `web/src/app/area-riservata/(interno)/offerte/nuova/page.tsx`
- Modify: `web/package.json` (dipendenza `zod`)

**Interfaces:**
- Consumes: `Offerta` (Task 1), `clientServer` (Task 2)
- Produces:
  - `schemaOfferta` (Zod) e `type DatiOfferta = z.infer<typeof schemaOfferta>`
  - `sluggifica(testo: string): string`
  - `salvaOfferta(statoPrecedente, datiModulo): Promise<{ errori?: Record<string, string>; id?: string }>`

- [ ] **Step 1: Installare Zod**

```bash
npm install zod
```

- [ ] **Step 2: Scrivere il test fallito dello slug**

Crea `web/src/dominio/slug.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { sluggifica } from './slug'

describe('sluggifica', () => {
  test('minuscole e trattini al posto degli spazi', () => {
    expect(sluggifica('UCI Cinemas')).toBe('uci-cinemas')
  })

  test('toglie gli accenti invece di lasciarli nell’indirizzo', () => {
    expect(sluggifica('Caffè Città')).toBe('caffe-citta')
  })

  test('toglie apostrofi e punteggiatura', () => {
    expect(sluggifica("L'Oasi dell'Auto s.r.l.")).toBe('l-oasi-dell-auto-s-r-l')
  })

  test('non lascia trattini in testa, in coda o doppi', () => {
    expect(sluggifica('  — Teatro   Diana — ')).toBe('teatro-diana')
  })
})
```

- [ ] **Step 3: Verificare il fallimento e scrivere lo slug**

```bash
npx vitest run src/dominio/slug.test.ts
```

Atteso: FAIL. Poi crea `web/src/dominio/slug.ts`:

```ts
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
```

- [ ] **Step 4: Scrivere il test fallito della validazione**

Crea `web/src/dominio/offertaSchema.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { schemaOfferta } from './offertaSchema'

const valida = {
  partner: 'Teatro Diana',
  categoria: 'Teatro',
  vantaggio: 'Poltronissima a 18 € invece di 32 €',
  descrizione: 'Riduzione riservata ai soci sull’intera stagione di prosa.',
  descrizioneCompleta: 'La riduzione vale su tutti gli spettacoli della stagione di prosa.',
  condizioni: 'Massimo quattro posti a socio.\nRichiesta dieci giorni prima.',
  validaDal: '2026-10-01',
  validaAl: '2027-05-31',
  modalita: 'biglietti',
  istruzioni: '',
  indirizzo: '',
  telefono: '',
  sito: '',
  codiceSconto: '',
  inEvidenza: false,
}

describe('schemaOfferta', () => {
  test('accetta un’offerta completa', () => {
    expect(schemaOfferta.safeParse(valida).success).toBe(true)
  })

  test('spiega in italiano cosa manca', () => {
    const esito = schemaOfferta.safeParse({ ...valida, partner: '' })

    expect(esito.success).toBe(false)
    expect(esito.error?.issues[0].message).toBe('Scrivi il nome del partner.')
  })

  test('rifiuta una validità che finisce prima di cominciare', () => {
    const esito = schemaOfferta.safeParse({ ...valida, validaAl: '2026-09-30' })

    expect(esito.success).toBe(false)
    expect(esito.error?.issues[0].message).toMatch(/dopo la data di inizio/)
  })

  test('per «solo sconto» le istruzioni sono obbligatorie: senza, il socio non sa cosa fare', () => {
    const esito = schemaOfferta.safeParse({ ...valida, modalita: 'solo_sconto', istruzioni: '' })

    expect(esito.success).toBe(false)
    expect(esito.error?.issues[0].message).toMatch(/cosa deve fare il socio/)
  })

  test('per «biglietti» le istruzioni non servono', () => {
    expect(schemaOfferta.safeParse({ ...valida, modalita: 'biglietti', istruzioni: '' }).success).toBe(true)
  })

  test('la descrizione breve resta breve: è quella delle schede in elenco', () => {
    const esito = schemaOfferta.safeParse({ ...valida, descrizione: 'a'.repeat(161) })

    expect(esito.success).toBe(false)
    expect(esito.error?.issues[0].message).toMatch(/160 caratteri/)
  })

  test('trasforma le condizioni scritte a righe in un elenco', () => {
    const esito = schemaOfferta.parse(valida)

    expect(esito.condizioni).toEqual([
      'Massimo quattro posti a socio.',
      'Richiesta dieci giorni prima.',
    ])
  })
})
```

- [ ] **Step 5: Verificare il fallimento e scrivere lo schema**

```bash
npx vitest run src/dominio/offertaSchema.test.ts
```

Atteso: FAIL. Poi crea `web/src/dominio/offertaSchema.ts`:

```ts
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
    validaAl: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Indica la data di fine.'),
    modalita: z.enum(['solo_sconto', 'biglietti', 'convenzione']),
    istruzioni: z.string().trim().optional().default(''),
    indirizzo: z.string().trim().optional().default(''),
    telefono: z.string().trim().optional().default(''),
    sito: z.string().trim().optional().default(''),
    codiceSconto: z.string().trim().optional().default(''),
    inEvidenza: z.boolean().default(false),
  })
  .refine((dati) => dati.validaAl >= dati.validaDal, {
    message: 'La data di fine deve venire dopo la data di inizio.',
    path: ['validaAl'],
  })
  .refine((dati) => dati.modalita !== 'solo_sconto' || dati.istruzioni.length > 0, {
    message: 'Per uno sconto da esibire, scrivi cosa deve fare il socio alla cassa.',
    path: ['istruzioni'],
  })

export type DatiOfferta = z.infer<typeof schemaOfferta>
```

- [ ] **Step 6: Scrivere la Server Action di salvataggio**

Crea `web/src/app/azioni/offerte.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { clientServer } from '@/dati/supabaseServer'
import { schemaOfferta } from '@/dominio/offertaSchema'
import { sluggifica } from '@/dominio/slug'

export type EsitoSalvataggio = { errori?: Record<string, string>; id?: string }

function leggiModulo(datiModulo: FormData) {
  return {
    partner: String(datiModulo.get('partner') ?? ''),
    categoria: String(datiModulo.get('categoria') ?? ''),
    vantaggio: String(datiModulo.get('vantaggio') ?? ''),
    descrizione: String(datiModulo.get('descrizione') ?? ''),
    descrizioneCompleta: String(datiModulo.get('descrizioneCompleta') ?? ''),
    condizioni: String(datiModulo.get('condizioni') ?? ''),
    validaDal: String(datiModulo.get('validaDal') ?? ''),
    validaAl: String(datiModulo.get('validaAl') ?? ''),
    modalita: String(datiModulo.get('modalita') ?? 'biglietti'),
    istruzioni: String(datiModulo.get('istruzioni') ?? ''),
    indirizzo: String(datiModulo.get('indirizzo') ?? ''),
    telefono: String(datiModulo.get('telefono') ?? ''),
    sito: String(datiModulo.get('sito') ?? ''),
    codiceSconto: String(datiModulo.get('codiceSconto') ?? ''),
    inEvidenza: datiModulo.get('inEvidenza') === 'on',
  }
}

/** Gli errori di Zod diventano una mappa campo → messaggio, come li vuole il modulo. */
function raccogliErrori(esito: ReturnType<typeof schemaOfferta.safeParse>) {
  const errori: Record<string, string> = {}
  if (!esito.success) {
    esito.error.issues.forEach((problema) => {
      const campo = String(problema.path[0] ?? 'modulo')
      if (!errori[campo]) errori[campo] = problema.message
    })
  }
  return errori
}

/**
 * Crea una nuova offerta.
 *
 * `stato` arriva dal pulsante premuto: «Salva bozza» oppure «Pubblica». Sono
 * due pulsanti e non una casella perché il direttore deve poter interrompere a
 * metà senza chiedersi se quello che ha scritto è già online.
 */
export async function salvaOfferta(
  _statoPrecedente: EsitoSalvataggio | null,
  datiModulo: FormData,
): Promise<EsitoSalvataggio> {
  const esito = schemaOfferta.safeParse(leggiModulo(datiModulo))
  if (!esito.success) return { errori: raccogliErrori(esito) }

  const dati = esito.data
  const stato = datiModulo.get('azione') === 'pubblica' ? 'pubblicata' : 'bozza'
  const client = await clientServer()

  const { data, error } = await client
    .from('offerte')
    .insert({
      slug: `${sluggifica(dati.partner)}-${sluggifica(dati.vantaggio).slice(0, 24)}`,
      partner: dati.partner,
      categoria: dati.categoria,
      vantaggio: dati.vantaggio,
      descrizione_breve: dati.descrizione,
      descrizione: dati.descrizioneCompleta,
      condizioni: dati.condizioni,
      valida_dal: dati.validaDal,
      valida_al: dati.validaAl,
      in_evidenza: dati.inEvidenza,
      modalita: dati.modalita,
      istruzioni: dati.istruzioni || null,
      indirizzo: dati.indirizzo || null,
      telefono: dati.telefono || null,
      link_partner: dati.sito || null,
      codice_sconto: dati.codiceSconto || null,
      stato,
    })
    .select('id')
    .single()

  if (error) {
    const duplicato = error.code === '23505'
    return {
      errori: {
        modulo: duplicato
          ? 'Esiste già un’offerta con questo partner e questo vantaggio. Cambia il vantaggio, o modifica quella esistente.'
          : `Non è stato possibile salvare l’offerta (${error.message}).`,
      },
    }
  }

  revalidatePath('/offerte')
  revalidatePath('/')
  redirect(`/area-riservata/offerte/${data.id}?salvata=1`)
}
```

- [ ] **Step 7: Scrivere il modulo con l'anteprima**

Crea `web/src/componenti/ModuloOfferta.tsx`. È un Client Component: tiene lo
stato dei campi per poter disegnare l'anteprima mentre si scrive, riusando
`SchedaOfferta` — così quello che il direttore vede **è** il componente che
finirà sul sito, non una sua imitazione.

```tsx
'use client'

import { useActionState, useState } from 'react'
import { SchedaOfferta } from '@/componenti/SchedaOfferta'
import type { ModalitaOfferta } from '@/dominio/offerta'
import { salvaOfferta, type EsitoSalvataggio } from '@/app/azioni/offerte'

const CATEGORIE = ['Cinema', 'Teatro', 'Auto', 'Salute', 'Sport'] as const

export function ModuloOfferta() {
  const [stato, azione, inCorso] = useActionState<EsitoSalvataggio | null, FormData>(
    salvaOfferta,
    null,
  )
  const [campi, aggiorna] = useState({
    partner: '',
    categoria: 'Cinema',
    vantaggio: '',
    descrizione: '',
    descrizioneCompleta: '',
    condizioni: '',
    validaDal: '',
    validaAl: '',
    modalita: 'biglietti' as ModalitaOfferta,
    istruzioni: '',
    indirizzo: '',
    telefono: '',
    sito: '',
    codiceSconto: '',
    inEvidenza: false,
  })

  const errori = stato?.errori ?? {}
  const scrivi = (campo: string) => (evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    aggiorna((precedenti) => ({ ...precedenti, [campo]: evento.target.value }))

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <form action={azione} className="flex flex-col gap-5">
        {errori.modulo ? (
          <p role="alert" className="border-l-4 border-arancione bg-fascia px-4 py-3">
            {errori.modulo}
          </p>
        ) : null}

        <Campo nome="partner" etichetta="Partner" valore={campi.partner} errore={errori.partner} onChange={scrivi('partner')} />

        <div className="flex flex-col gap-2">
          <label htmlFor="categoria" className="font-semibold">Categoria</label>
          <select
            id="categoria"
            name="categoria"
            value={campi.categoria}
            onChange={scrivi('categoria')}
            className="fuoco-su-chiaro border border-linea bg-superficie px-3 py-2"
          >
            {CATEGORIE.map((categoria) => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>

        <Campo nome="vantaggio" etichetta="Vantaggio" aiuto="Corto e concreto: «6,50 € invece di 9,50», «-30%», «2x1»." valore={campi.vantaggio} errore={errori.vantaggio} onChange={scrivi('vantaggio')} />
        <Campo nome="descrizione" etichetta="Presentazione breve" aiuto="Una riga, è quella che si legge negli elenchi. Massimo 160 caratteri." valore={campi.descrizione} errore={errori.descrizione} onChange={scrivi('descrizione')} />
        <Campo nome="descrizioneCompleta" etichetta="Descrizione completa" multilinea valore={campi.descrizioneCompleta} errore={errori.descrizioneCompleta} onChange={scrivi('descrizioneCompleta')} />
        <Campo nome="condizioni" etichetta="Condizioni" aiuto="Una per riga." multilinea valore={campi.condizioni} errore={errori.condizioni} onChange={scrivi('condizioni')} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo nome="validaDal" etichetta="Valida dal" tipo="date" valore={campi.validaDal} errore={errori.validaDal} onChange={scrivi('validaDal')} />
          <Campo nome="validaAl" etichetta="Valida fino al" tipo="date" valore={campi.validaAl} errore={errori.validaAl} onChange={scrivi('validaAl')} />
        </div>

        <fieldset className="flex flex-col gap-2 border border-linea p-4">
          <legend className="px-2 font-semibold">Come si ottiene</legend>
          {(['biglietti', 'convenzione', 'solo_sconto'] as const).map((modalita) => (
            <label key={modalita} className="flex items-center gap-2">
              <input
                type="radio"
                name="modalita"
                value={modalita}
                checked={campi.modalita === modalita}
                onChange={scrivi('modalita')}
              />
              {modalita === 'biglietti' && 'Il socio richiede i biglietti'}
              {modalita === 'convenzione' && 'Il socio chiede informazioni'}
              {modalita === 'solo_sconto' && 'Sconto da esibire, senza richiesta'}
            </label>
          ))}
        </fieldset>

        {campi.modalita === 'solo_sconto' ? (
          <Campo nome="istruzioni" etichetta="Cosa deve fare il socio" multilinea valore={campi.istruzioni} errore={errori.istruzioni} onChange={scrivi('istruzioni')} />
        ) : null}

        <details className="border border-linea p-4">
          <summary className="cursor-pointer font-semibold">Recapiti del partner (facoltativi)</summary>
          <div className="mt-4 flex flex-col gap-4">
            <Campo nome="indirizzo" etichetta="Indirizzo" valore={campi.indirizzo} onChange={scrivi('indirizzo')} />
            <Campo nome="telefono" etichetta="Telefono" valore={campi.telefono} onChange={scrivi('telefono')} />
            <Campo nome="sito" etichetta="Sito" valore={campi.sito} onChange={scrivi('sito')} />
            <Campo nome="codiceSconto" etichetta="Codice sconto" valore={campi.codiceSconto} onChange={scrivi('codiceSconto')} />
          </div>
        </details>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="inEvidenza"
            checked={campi.inEvidenza}
            onChange={(evento) =>
              aggiorna((precedenti) => ({ ...precedenti, inEvidenza: evento.target.checked }))
            }
          />
          Mettila in evidenza sulla home
        </label>

        <div className="flex flex-wrap gap-3">
          <button type="submit" name="azione" value="bozza" disabled={inCorso} className="fuoco-su-chiaro border border-linea px-4 py-2 font-semibold">
            Salva bozza
          </button>
          <button type="submit" name="azione" value="pubblica" disabled={inCorso} className="fuoco-su-chiaro border border-blu-profondo bg-blu-profondo px-4 py-2 font-semibold text-white">
            Pubblica
          </button>
        </div>
      </form>

      <aside aria-label="Anteprima" className="lg:sticky lg:top-6 lg:self-start">
        <h2 className="text-sm font-semibold uppercase text-inchiostro-tenue">
          Come apparirà nell’elenco
        </h2>
        <div className="mt-3">
          <SchedaOfferta
            titolo="h3"
            inEvidenza={campi.inEvidenza}
            offerta={{
              slug: 'anteprima',
              partner: campi.partner || 'Nome del partner',
              categoria: campi.categoria,
              vantaggio: campi.vantaggio || 'Il vantaggio',
              descrizione: campi.descrizione || 'La riga di presentazione.',
              descrizioneCompleta: campi.descrizioneCompleta,
              condizioni: campi.condizioni.split('\n').filter(Boolean),
              validaDal: campi.validaDal || '2026-01-01',
              validaAl: campi.validaAl || '2026-12-31',
              modalita: campi.modalita,
              istruzioni: campi.istruzioni || undefined,
              inEvidenza: campi.inEvidenza,
              contatti: {},
            }}
          />
        </div>
      </aside>
    </div>
  )
}

function Campo({
  nome, etichetta, valore, onChange, errore, aiuto, tipo = 'text', multilinea = false,
}: {
  nome: string
  etichetta: string
  valore: string
  onChange: (evento: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  errore?: string
  aiuto?: string
  tipo?: string
  multilinea?: boolean
}) {
  const idAiuto = aiuto ? `${nome}-aiuto` : undefined
  const idErrore = errore ? `${nome}-errore` : undefined
  const comuni = {
    id: nome,
    name: nome,
    value: valore,
    onChange,
    'aria-describedby': [idAiuto, idErrore].filter(Boolean).join(' ') || undefined,
    'aria-invalid': errore ? true : undefined,
    className: 'fuoco-su-chiaro border border-linea bg-superficie px-3 py-2',
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={nome} className="font-semibold">{etichetta}</label>
      {aiuto ? <p id={idAiuto} className="text-sm text-inchiostro-tenue">{aiuto}</p> : null}
      {multilinea ? <textarea {...comuni} rows={4} /> : <input {...comuni} type={tipo} />}
      {errore ? <p id={idErrore} role="alert" className="text-sm text-ambra-scura">{errore}</p> : null}
    </div>
  )
}
```

- [ ] **Step 8: Scrivere la pagina**

Crea `web/src/app/area-riservata/(interno)/offerte/nuova/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { ModuloOfferta } from '@/componenti/ModuloOfferta'

export const metadata: Metadata = {
  title: 'Nuova offerta',
  robots: { index: false, follow: false },
}

export default function NuovaOfferta() {
  return (
    <section>
      <h1 className="text-titolo-pagina text-inchiostro">Nuova offerta</h1>
      <p className="mt-3 max-w-2xl text-corpo text-inchiostro-tenue">
        Scrivi a sinistra, guarda a destra: l’anteprima è la stessa scheda che
        vedranno i soci. Puoi salvare in bozza e finire dopo.
      </p>
      <div className="mt-8">
        <ModuloOfferta />
      </div>
    </section>
  )
}
```

- [ ] **Step 9: Eseguire i test, provare, commit**

```bash
npx vitest run
npm run dev
```

Prova da fare davvero: apri `/area-riservata/offerte/nuova`, scrivi il partner
e guarda l'anteprima cambiare; premi «Pubblica» con il vantaggio vuoto e
verifica che l'errore sia in italiano e sotto al campo giusto; poi compila e
pubblica, e controlla che l'offerta compaia su `/offerte`.

```bash
git add web/src web/package.json web/package-lock.json
git commit -m "Modulo di pubblicazione delle offerte, con anteprima dal vivo"
```

---

## Task 7: Modifica, pubblicazione e ritiro di un'offerta

**Files:**
- Create: `web/src/app/area-riservata/(interno)/offerte/[id]/page.tsx`
- Modify: `web/src/componenti/ModuloOfferta.tsx` (accetta un'offerta esistente)
- Modify: `web/src/app/azioni/offerte.ts` (aggiornamento, ritiro, eliminazione)

**Interfaces:**
- Consumes: `offertaPerId` (Task 5), `schemaOfferta` (Task 6)
- Produces: `aggiornaOfferta(statoPrecedente, datiModulo): Promise<EsitoSalvataggio>`, `eliminaOfferta(datiModulo): Promise<void>`

- [ ] **Step 1: Rendere il modulo riutilizzabile**

In `ModuloOfferta.tsx` aggiungi la proprietà facoltativa `offerta`. Cambia la
firma, lo stato iniziale e l'azione:

```tsx
import { aggiornaOfferta, salvaOfferta, type EsitoSalvataggio } from '@/app/azioni/offerte'
import type { OffertaRiservata } from '@/dati/offerteRiservate'

export function ModuloOfferta({ offerta }: { offerta?: OffertaRiservata }) {
  const [stato, azione, inCorso] = useActionState<EsitoSalvataggio | null, FormData>(
    offerta ? aggiornaOfferta : salvaOfferta,
    null,
  )
  const [campi, aggiorna] = useState({
    partner: offerta?.partner ?? '',
    categoria: offerta?.categoria ?? 'Cinema',
    vantaggio: offerta?.vantaggio ?? '',
    descrizione: offerta?.descrizione ?? '',
    descrizioneCompleta: offerta?.descrizioneCompleta ?? '',
    // Nel database le condizioni sono un elenco, nel modulo una riga per
    // condizione: è la forma in cui è naturale scriverle.
    condizioni: offerta?.condizioni.join('\n') ?? '',
    validaDal: offerta?.validaDal ?? '',
    validaAl: offerta?.validaAl ?? '',
    modalita: offerta?.modalita ?? ('biglietti' as ModalitaOfferta),
    istruzioni: offerta?.istruzioni ?? '',
    indirizzo: offerta?.contatti.indirizzo ?? '',
    telefono: offerta?.contatti.telefono ?? '',
    sito: offerta?.contatti.sito ?? '',
    codiceSconto: offerta?.contatti.codiceSconto ?? '',
    inEvidenza: offerta?.inEvidenza ?? false,
  })
```

Dentro il `<form>`, come prima riga, il campo che dice all'azione quale offerta
sta modificando:

```tsx
        {offerta ? <input type="hidden" name="id" value={offerta.id} /> : null}
```

E il pulsante di pubblicazione cambia parola quando l'offerta è già online, per
non far credere che si stia pubblicando due volte:

```tsx
          <button type="submit" name="azione" value="pubblica" disabled={inCorso} className="fuoco-su-chiaro border border-blu-profondo bg-blu-profondo px-4 py-2 font-semibold text-white">
            {offerta?.stato === 'pubblicata' ? 'Salva e ripubblica' : 'Pubblica'}
          </button>
```

- [ ] **Step 2: Scrivere l'azione di aggiornamento**

In `web/src/app/azioni/offerte.ts`, accanto a `salvaOfferta`:

```ts
export async function aggiornaOfferta(
  _statoPrecedente: EsitoSalvataggio | null,
  datiModulo: FormData,
): Promise<EsitoSalvataggio> {
  const id = String(datiModulo.get('id') ?? '')
  if (!id) return { errori: { modulo: 'Offerta non trovata.' } }

  const esito = schemaOfferta.safeParse(leggiModulo(datiModulo))
  if (!esito.success) return { errori: raccogliErrori(esito) }

  const dati = esito.data
  const azione = String(datiModulo.get('azione') ?? 'bozza')
  const client = await clientServer()

  // Lo slug **non** si aggiorna: è l'indirizzo che i soci hanno ricevuto per
  // email. Cambiarlo perché è cambiato il vantaggio romperebbe ogni vecchio
  // collegamento, che è esattamente ciò che lo spec vuole evitare.
  const { data, error } = await client
    .from('offerte')
    .update({
      partner: dati.partner,
      categoria: dati.categoria,
      vantaggio: dati.vantaggio,
      descrizione_breve: dati.descrizione,
      descrizione: dati.descrizioneCompleta,
      condizioni: dati.condizioni,
      valida_dal: dati.validaDal,
      valida_al: dati.validaAl,
      in_evidenza: dati.inEvidenza,
      modalita: dati.modalita,
      istruzioni: dati.istruzioni || null,
      indirizzo: dati.indirizzo || null,
      telefono: dati.telefono || null,
      link_partner: dati.sito || null,
      codice_sconto: dati.codiceSconto || null,
      stato: azione === 'pubblica' ? 'pubblicata' : 'bozza',
    })
    .eq('id', id)
    .select('slug')
    .single()

  if (error) {
    return { errori: { modulo: `Non è stato possibile salvare le modifiche (${error.message}).` } }
  }

  revalidatePath('/offerte')
  revalidatePath('/')
  revalidatePath(`/offerte/${data.slug}`)
  redirect(`/area-riservata/offerte/${id}?salvata=1`)
}

/**
 * Elimina un'offerta.
 *
 * Il ritiro normale è «Salva bozza»: l'offerta sparisce dal sito ma resta
 * scritta. L'eliminazione serve solo a togliere di mezzo una bozza sbagliata,
 * e va confermata dal direttore prima di arrivare qui.
 */
export async function eliminaOfferta(datiModulo: FormData): Promise<void> {
  const id = String(datiModulo.get('id') ?? '')
  const client = await clientServer()
  await client.from('offerte').delete().eq('id', id)

  revalidatePath('/offerte')
  revalidatePath('/')
  redirect('/area-riservata')
}
```

> `revalidatePath` è ciò che rende immediata la pubblicazione: senza, la pagina
> `/offerte` resterebbe quella generata fino a un'ora prima, e il direttore
> penserebbe di aver sbagliato qualcosa.

- [ ] **Step 3: Scrivere la pagina di modifica**

Crea `web/src/app/area-riservata/(interno)/offerte/[id]/page.tsx`:

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { eliminaOfferta } from '@/app/azioni/offerte'
import { ModuloOfferta } from '@/componenti/ModuloOfferta'
import { offertaPerId } from '@/dati/offerteRiservate'

export const metadata: Metadata = {
  title: 'Modifica offerta',
  robots: { index: false, follow: false },
}

export default async function ModificaOfferta({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [chiave: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const { salvata } = await searchParams
  const offerta = await offertaPerId(id)

  if (!offerta) notFound()

  return (
    <section>
      <h1 className="text-titolo-pagina text-inchiostro">Modifica offerta</h1>

      {salvata ? (
        <p role="status" className="mt-4 border-l-4 border-azzurro bg-fascia px-4 py-3 text-corpo">
          {offerta.stato === 'pubblicata'
            ? 'Salvata. È già visibile sul sito.'
            : 'Salvata in bozza. Non è ancora visibile ai soci.'}
        </p>
      ) : null}

      <div className="mt-8">
        <ModuloOfferta offerta={offerta} />
      </div>

      <details className="mt-12 border border-linea p-4">
        <summary className="cursor-pointer font-semibold">Elimina questa offerta</summary>
        <p className="mt-3 max-w-prose text-corpo">
          Stai per eliminare definitivamente «{offerta.partner} —{' '}
          {offerta.vantaggio}». Se vuoi solo toglierla dal sito, usa «Salva
          bozza»: resta scritta e la puoi ripubblicare quando vuoi.
        </p>
        <form action={eliminaOfferta} className="mt-4">
          <input type="hidden" name="id" value={offerta.id} />
          <button
            type="submit"
            className="fuoco-su-chiaro border border-ambra-scura px-4 py-2 font-semibold text-ambra-scura"
          >
            Elimina definitivamente
          </button>
        </form>
      </details>
    </section>
  )
}
```

> La conferma è un `<details>` da aprire, **non** un `confirm()` del browser:
> una finestra modale del browser blocca la pagina e, in un'area riservata
> usata di rado, un clic distratto su «OK» è più facile di due gesti
> deliberati. Qui per eliminare bisogna aprire il pannello e poi premere.

- [ ] **Step 4: Provare il giro completo e commit**

Prova: crea una bozza, aprila, modificala, pubblicala, verifica che compaia su
`/offerte` **senza aspettare**; riportala in bozza e verifica che sparisca;
elimina una bozza e verifica che l'elenco si aggiorni.

```bash
npx vitest run
git add web/src
git commit -m "Modifica, pubblicazione e ritiro di un'offerta"
```

---

## Task 8: «Copia il testo per l'email»

L'ultimo pezzo del flusso di pubblicazione, e quello che il direttore usa ogni
lunedì: un testo già pronto da incollare nell'avviso che manda ai soci da
Aruba.

**Files:**
- Create: `web/src/dominio/testoEmail.ts`
- Test: `web/src/dominio/testoEmail.test.ts`
- Create: `web/src/componenti/CopiaTestoEmail.tsx`
- Modify: `web/src/app/area-riservata/(interno)/offerte/[id]/page.tsx`

**Interfaces:**
- Produces: `testoPerEmail(offerta: Offerta, indirizzoSito: string): string`

- [ ] **Step 1: Scrivere il test fallito**

Crea `web/src/dominio/testoEmail.test.ts`:

```ts
import { describe, expect, test } from 'vitest'
import { testoPerEmail } from './testoEmail'
import { offerteFinte } from '@/test/offerteFinte'

const offerta = offerteFinte[0]

describe('testoPerEmail', () => {
  test('apre con partner e vantaggio, che sono il motivo per leggere', () => {
    const testo = testoPerEmail(offerta, 'https://cralares.it')

    expect(testo.split('\n')[0]).toBe('UCI Cinemas — 6,50 € invece di 9,50')
  })

  test('scrive la scadenza in italiano, non in ISO', () => {
    expect(testoPerEmail(offerta, 'https://cralares.it')).toContain(
      'Valida fino al 30 settembre 2026',
    )
  })

  test('contiene il link completo alla scheda', () => {
    expect(testoPerEmail(offerta, 'https://cralares.it')).toContain(
      'https://cralares.it/offerte/uci-cinemas-ingresso-ridotto',
    )
  })

  test('non lascia doppie barre se l’indirizzo finisce con una', () => {
    expect(testoPerEmail(offerta, 'https://cralares.it/')).toContain(
      'https://cralares.it/offerte/uci-cinemas-ingresso-ridotto',
    )
  })
})
```

- [ ] **Step 2: Verificare il fallimento e scrivere il testo**

```bash
npx vitest run src/dominio/testoEmail.test.ts
```

Atteso: FAIL. Poi crea `web/src/dominio/testoEmail.ts`:

```ts
import type { Offerta } from './offerta'
import { formattaData } from '@/lib/date'

/**
 * Il testo che il direttore incolla nell'email ai soci.
 *
 * Niente HTML e nessuna formattazione: finisce dentro la webmail di Aruba,
 * dove qualunque marcatura si romperebbe. Righe corte, il link per esteso —
 * un link accorciato in un'email di associazione sembra pubblicità.
 */
export function testoPerEmail(offerta: Offerta, indirizzoSito: string): string {
  const radice = indirizzoSito.replace(/\/+$/, '')

  return [
    `${offerta.partner} — ${offerta.vantaggio}`,
    '',
    offerta.descrizione,
    '',
    `Valida fino al ${formattaData(offerta.validaAl)}.`,
    `Tutti i dettagli: ${radice}/offerte/${offerta.slug}`,
  ].join('\n')
}
```

- [ ] **Step 3: Scrivere il pulsante di copia**

Crea `web/src/componenti/CopiaTestoEmail.tsx`:

```tsx
'use client'

import { useRef, useState } from 'react'

/**
 * Il testo pronto per l'avviso ai soci, con il pulsante che lo copia.
 *
 * Il testo resta visibile in un'area di testo invece di stare nascosto dietro
 * al pulsante: il direttore lo rilegge prima di mandarlo, e se la copia non
 * funziona può sempre selezionarlo a mano.
 */
export function CopiaTestoEmail({ testo }: { testo: string }) {
  const [esito, impostaEsito] = useState<'fermo' | 'copiato' | 'selezionato'>('fermo')
  const area = useRef<HTMLTextAreaElement>(null)

  async function copia() {
    try {
      await navigator.clipboard.writeText(testo)
      impostaEsito('copiato')
      setTimeout(() => impostaEsito('fermo'), 2000)
    } catch {
      // Niente alert: bloccherebbe la pagina. Si seleziona il testo e si dice
      // come copiarlo a mano.
      area.current?.select()
      impostaEsito('selezionato')
    }
  }

  return (
    <div className="mt-8 border border-linea p-4">
      <h2 className="font-semibold text-inchiostro">Il testo per l’email ai soci</h2>
      <p className="mt-1 text-sm text-inchiostro-tenue">
        Incollalo nell’avviso che mandi da Aruba.
      </p>

      <label htmlFor="testo-email" className="sr-only">
        Testo dell’avviso da copiare
      </label>
      <textarea
        id="testo-email"
        ref={area}
        readOnly
        rows={7}
        value={testo}
        className="fuoco-su-chiaro mt-3 w-full border border-linea bg-superficie px-3 py-2 font-mono text-sm"
      />

      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          onClick={copia}
          className="fuoco-su-chiaro border border-blu-profondo bg-blu-profondo px-4 py-2 font-semibold text-white"
        >
          Copia il testo
        </button>
        <p role="status" className="text-sm text-inchiostro-tenue">
          {esito === 'copiato' ? 'Copiato.' : null}
          {esito === 'selezionato' ? 'Testo selezionato: premi Cmd+C per copiarlo.' : null}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Mostrarlo dopo la pubblicazione**

In `web/src/app/area-riservata/(interno)/offerte/[id]/page.tsx`, quando l'offerta è
`pubblicata`, mostra `<CopiaTestoEmail testo={testoPerEmail(offerta,
process.env.NEXT_PUBLIC_SITO_URL ?? 'http://localhost:3000')} />` sotto alla
conferma di salvataggio.

- [ ] **Step 5: Eseguire i test e commit**

```bash
npx vitest run
git add web/src
git commit -m "Testo pronto da incollare nell'email ai soci"
```

---

## Task 9: I campi definitivi, dopo il direttivo

> **Non eseguire questo task prima del meeting dell'8 settembre 2026.** Esiste
> per essere modificato: quando le risposte arrivano, si riscrive con quelle e
> poi si esegue.

**Files:**
- Create: `supabase/migrations/0003_campi_definitivi.sql`
- Modify: `web/src/dati/righe.ts`, `web/src/dati/mappaOfferta.ts`, `web/src/dominio/offerta.ts`, `web/src/dominio/offertaSchema.ts`, `web/src/componenti/ModuloOfferta.tsx`

- [ ] **Step 1: Riportare le risposte nello spec**

Aggiorna la sezione 16 di
`docs/superpowers/specs/2026-08-25-sito-cral-ares-design.md` togliendo dalle
questioni aperte quelle a cui il direttivo ha risposto, e aggiungi una riga
alla tabella delle revisioni. Le questioni senza risposta restano scritte.

- [ ] **Step 2: Scrivere la migrazione, secondo le risposte**

Le tre forme possibili, da scegliere in base a cosa hanno detto:

```sql
-- Se vogliono i due prezzi strutturati (oggi: no)
alter table offerte add column prezzo_pieno numeric(8,2);
alter table offerte add column prezzo_socio numeric(8,2);

-- Se vogliono un titolo distinto dal partner (oggi: no)
alter table offerte add column titolo text;

-- Se vogliono le immagini (oggi: no)
alter table offerte add column immagine_url text;

-- Se confermano un campo che avevamo previsto e non useranno
alter table offerte drop column codice_sconto;
```

Se **confermano l'ipotesi** — otto campi, niente immagini — questo task si
chiude senza migrazione: si cancella il file e si scrive nel verbale che
l'ipotesi è stata confermata. **È l'esito più probabile e va bene così.**

- [ ] **Step 3: Se hanno chiesto le immagini**

Va aperto un archivio (*Storage*) su Supabase, con un bucket pubblico
`offerte`, una politica di caricamento riservata ai redattori, il campo di
caricamento nel modulo e `img-src` da estendere in `netlify.toml`. Sono circa
quattro ore: **vanno stimate e dette**, non assorbite in silenzio.

- [ ] **Step 4: Aggiornare la catena dei tipi**

Ogni colonna aggiunta tocca, nell'ordine: `righe.ts` (il tipo della riga e
`COLONNE_OFFERTA`), `mappaOfferta.ts` (la traduzione), `offerta.ts` (il tipo di
dominio), `offertaSchema.ts` (la validazione), `ModuloOfferta.tsx` (il campo).
Cinque file, sempre gli stessi, sempre in questo ordine.

- [ ] **Step 5: Eseguire tutta la suite e commit**

```bash
npx vitest run && npm run build
git add supabase web/src docs
git commit -m "Campi dell'offerta come deliberato dal direttivo"
```

---

## Al termine della fase

- [ ] `npx vitest run` verde, `npm run build` completata.
- [ ] `/offerte/[slug]` risulta ancora **statica** (`●`) nell'elenco delle rotte.
- [ ] Un direttore diverso da te entra con il proprio indirizzo, pubblica
      un'offerta e la vede sul sito **senza chiamare nessuno**. È il criterio di
      successo dello spec: finché non è successo davvero, la fase non è chiusa.
- [ ] Aggiornare `docs/decisioni.md` con il verbale delle decisioni tecniche
      della fase 2: perché due client Supabase, perché l'autorizzazione sta nel
      database e non nel codice, cosa dice ora la pagina cookie.
- [ ] `delete from offerte;` prima di andare online sul dominio vero — le otto
      dimostrative non devono sopravvivere alla pubblicazione.
