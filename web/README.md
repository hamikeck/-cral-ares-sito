# CRAL ARES — sito web

Sito dell'associazione ricreativa dei dipendenti dell'Agenzia delle Entrate.
Questa è la fase 1: le pagine pubbliche (home, chi siamo, iscriviti, privacy,
cookie).

## Comandi

Tutti i comandi vanno eseguiti dalla cartella `web/`:

```bash
npm run dev     # server di sviluppo
npm test        # test automatici
npm run lint    # controllo di stile del codice
npm run build   # build di produzione
```

## Testi e contenuti

I testi delle pagine vivono in `src/contenuti/pagine.ts`, le voci di menu in
`src/contenuti/navigazione.ts`. I testi attuali sono provvisori: quelli
definitivi arriveranno dal direttivo dell'associazione. Sostituirli è
un'operazione che riguarda solo questi due file.

## Colori del marchio

I colori del marchio sono definiti in `src/lib/marchio.ts`, con un test che
ne verifica il contrasto secondo WCAG.

## Database

Il database è un progetto Supabase (Postgres). Lo schema vive in migrazioni
versionate in `supabase/migrations/` (radice del repository, non `web/`) e si
applica con:

```bash
npx supabase db push
```

eseguito dalla **radice del repository**, dopo aver collegato il progetto una
volta con `npx supabase link --project-ref <riferimento-del-progetto>`. Non
serve Docker né uno stack locale: si lavora direttamente sul progetto cloud.

Per far girare il sito servono due variabili d'ambiente: copia
`web/.env.example` in `web/.env.local` (non versionato) e incolla i valori
da *Project Settings → API* del pannello Supabase — Project URL e chiave
*publishable* (anon). Questa chiave è pubblica per progetto e finisce nel
browser di proposito: a proteggere i dati sono le politiche RLS definite
nelle migrazioni, non la segretezza della chiave. La chiave *secret*
(`service_role`) non entra nel progetto, in nessun file.

In `supabase/semi/offerte-dimostrative.sql` ci sono le otto offerte
dimostrative e il primo redattore, gli stessi dati oggi in
`src/contenuti/offerteEsempio.ts`, usati per popolare il database in fase di
sviluppo. Sono dati **di sviluppo, non di produzione**: prima di pubblicare
il sito sul dominio vero vanno cancellati dal SQL Editor del pannello
Supabase con `delete from offerte;` (a cascata restano circuiti e redattore,
da valutare caso per caso).

## Distribuzione

Il sito è distribuito su Netlify tramite il file `netlify.toml` nella radice
del repository, che imposta `base = "web"`.
