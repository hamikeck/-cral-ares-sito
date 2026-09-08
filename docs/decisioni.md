# Decisioni tecniche del progetto

Verbale delle scelte non ovvie, con il motivo. Serve fra sei mesi, quando
qualcuno — probabilmente tu stesso — si chiederà perché una cosa è fatta così.

Le decisioni di progetto (cosa fa il sito, cosa non fa) stanno nello spec
`superpowers/specs/2026-08-25-sito-cral-ares-design.md`. Qui ci sono solo quelle
tecniche, prese durante la realizzazione.

---

## Fase 1 — impostazione e pagine pubbliche (4 settembre 2026)

### L'applicazione sta in `web/`, non nella radice

`create-next-app` si rifiuta di generare in una cartella che contiene già altro,
e la radice ospitava `docs/`, `assets/` e la presentazione per il direttivo. La
separazione si è poi rivelata utile per conto suo: documenti da una parte,
codice dall'altra.

### `netlify.toml` sta nella radice, non in `web/`

Netlify legge **solo** il file nella radice del repository. Dentro `web/`
verrebbe ignorato in silenzio e la distribuzione fallirebbe senza spiegare
perché. La cartella dell'applicazione si dichiara con `base = "web"`, e da quel
momento `command` e `publish` si risolvono rispetto a essa.

### Netlify e non Vercel

Vercel vieta l'uso commerciale sul piano gratuito, e definisce commerciale anche
il caso in cui *chi scrive il codice viene pagato*. Non conta che il CRAL sia
un'associazione senza scopo di lucro: conta che lo sviluppatore sia retribuito.
Su Vercel servirebbe il piano Pro, 255 €/anno. Netlify consente esplicitamente
l'uso commerciale sul piano gratuito.

Conseguenza pratica: gli asset dimostrativi del generatore, `vercel.svg`
compreso, sono stati rimossi, e il README riscritto.

### Font di sistema al posto di Geist

I font del modello di Next arrivano da `fonts.gstatic.com`. Toglierli non è solo
una questione di velocità: una richiesta a un servizio esterno trasferisce
l'indirizzo IP del visitatore a un terzo, e sarebbe un trattamento da dichiarare
in un'informativa privacy che ancora non esiste. Il font di sistema è già
installato sul telefono del socio e non chiede nulla a nessuno.

### `vitest.config.mts` e risoluzione nativa dei path

La guida di Next prescrive `vitest.config.ts` più il plugin
`vite-tsconfig-paths`. Su Vitest 5 entrambe le cose producono un avviso a ogni
esecuzione: l'estensione `.ts` viene caricata come CommonJS, e il plugin è
superato dall'opzione nativa `resolve.tsconfigPaths`. Gli avvisi si sarebbero
ripetuti in ogni revisione coprendo il segnale vero.

### Il contrasto dei colori è verificato da un test, non dichiarato

`src/lib/marchio.ts` implementa la formula WCAG 2.1 e `marchio.test.ts` la
esercita sulle coppie effettivamente usate. Un secondo test rilegge
`globals.css` e verifica che i valori esadecimali coincidano: impedisce che il
TypeScript e il CSS divergano, che è il modo in cui queste cose si rompono in
silenzio.

Azzurro e arancione, i due colori originali del marchio, **non si usano mai per
testo su bianco**: 1,74:1 e 2,14:1 contro il 4,5:1 richiesto. Sono accenti e
sfondi. Su fondo blu-notte l'azzurro arriva a 6,73:1 ed è utilizzabile.

### L'anello di fuoco è definito una volta, in due varianti

Le classi che disegnano l'anello di fuoco codificano un requisito di conformità
(WCAG 2.4.7 e 1.4.11), non una scelta estetica: una copia a cui sfugge un pezzo
degrada l'accessibilità in un punto solo, e nessun test se ne accorge, perché
axe sotto jsdom non valuta il fuoco.

Le varianti sono due perché **l'anello deve contrastare con ciò che gli sta
dietro, non con l'elemento a cui appartiene** — con `outline-offset` positivo
l'anello cade fuori dall'elemento:

- `fuoco` usa `currentColor`, e va bene ovunque il colore del testo sia tarato
  sul fondo della pagina;
- `fuoco-scuro` usa un blu-notte fisso, e serve ai pulsanti pieni, dove il testo
  è bianco perché il pulsante è blu, ma l'anello cadrebbe sul bianco della
  pagina.

Questa seconda variante nasce da una regressione: unificando tutto su
`currentColor`, il pulsante della home ha avuto per un commit un anello bianco
su fondo bianco, 1:1.

### I testi delle pagine stanno in un modulo, non nei componenti

`src/contenuti/pagine.ts` raccoglie ogni testo visibile. I contenuti definitivi
di "chi siamo", del direttivo e della procedura di iscrizione arriveranno dal
direttivo dell'associazione: sostituirli deve essere un'operazione su un file
solo, che non richiede di capire React. Per la stessa ragione le stringhe usano
le virgolette doppie e non gli apici singoli: così gli apostrofi italiani non
hanno bisogno di barre rovesciate, e chi incolla il testo non rompe la build.

Conseguenza da tenere presente: i test confrontano ciò che la pagina rende con
la stessa costante da cui la pagina attinge. Verificano il cablaggio e la
struttura, **non le parole**. Un cambio di testo non farà scattare nulla: la
rilettura dei contenuti resta un lavoro d'occhio.

### La pagina privacy non contiene un'informativa

Dichiara che il testo è in corso di redazione, e nient'altro. Un'informativa
inventata sarebbe una dichiarazione falsa resa a un interessato: peggio della
sua assenza. Il testo definitivo richiede i dati reali del titolare, che il
direttivo deve fornire.

La pagina cookie, invece, afferma cose verificate: nessuno host esterno nel
codice compilato, nessuno strumento di analisi, nessun cookie impostato.

### `noindex` sull'anteprima, da togliere in fase 6

`layout.tsx` dichiara `robots: { index: false, follow: false }`. L'header che
Netlify aggiunge da sé copre le anteprime di ramo, non il deploy principale:
senza questa riga, un sito con un'informativa privacy assente e un contatto non
attivo diventerebbe indicizzabile, per un progetto legato alla pubblica
amministrazione. **Va rimosso quando si pubblica sul dominio vero.**

### `info@cralares.it` è un segnaposto, ed è marcato come tale

Il dominio `cralares.it` non è ancora registrato, quindi quella casella non
esiste. L'indirizzo compare comunque nel sito, ma accompagnato da una nota che
ne dichiara la provvisorietà, come ogni altro segnaposto. Da sostituire con
l'indirizzo vero appena il direttivo lo comunica.

### Cosa si è deciso di NON fare

- **Non estrarre un componente condiviso** per la forma delle pagine di testo.
  Le pagine che arrivano dopo — elenco offerte, scheda offerta, moduli — non
  sono pagine di testo: la quinta pagina di testo potrebbe non arrivare mai.
- **Niente `error.tsx` e `loading.tsx`**: con cinque pagine statiche non
  servono. Diventeranno necessari in fase 2, con il database.
- **Niente gruppi di rotte** `(pubblico)` / `(riservato)`: serviranno in fase 2
  per dare all'area riservata un guscio diverso. Farlo ora sarebbe stato più
  economico, ma non è urgente.

### Sicurezza: cosa vale oggi e cosa scade con le fasi successive

Le intestazioni di sicurezza stanno in `netlify.toml`. La politica dei
contenuti è severa perché il sito non carica nulla da fuori, e questo le dà un
ruolo in più: **è il browser che fa rispettare quello che la pagina cookie
dichiara.** Un font di Google aggiunto per distrazione non funzionerebbe,
invece di funzionare in silenzio rendendo falsa l'informativa.

Una revisione di sicurezza del 6 settembre 2026 non ha trovato vulnerabilità.
Ha però individuato tre punti che **scadono** quando arriveranno database,
autenticazione e moduli:

1. **`script-src 'unsafe-inline'` regge solo finché non esistono contenuti
   scritti dagli utenti.** Next lo impone per i suoi dati di idratazione, e
   toglierlo richiede i nonce e un middleware, che costringerebbe ogni pagina a
   essere generata su richiesta invece che staticamente. Oggi non c'è nulla da
   iniettare; **dalla fase 4 sì.** Va rivalutato prima che i moduli vadano
   online, non dopo.
2. **`form-action 'self'` e `connect-src 'self'` andranno rivisti** con
   l'autenticazione Supabase: se il flusso di accesso passa da un'origine
   diversa, vanno aggiunte quelle origini in modo stretto e nominato, mai
   allargando la direttiva.
3. **Il criterio con cui si filtra la categoria è il modello da mantenere:**
   confronto esatto con un elenco chiuso, e scarto di tutto il resto. Quando i
   dati arriveranno dal database, la tentazione sarà passare a una ricerca
   libera sul testo. Non farlo.

Le pagine di errore non mostrano il messaggio tecnico né la traccia dello
stack: è il modo classico in cui un sito rivela la struttura del proprio
database mentre si scusa. Va mantenuto così anche quando gli errori
diventeranno reali.

## Fase 2 — database e area riservata (7-8 settembre 2026)

### Il guscio protetto sta in un gruppo di rotte `(interno)`

Il controllo d'accesso sta in un `layout.tsx`, non in ogni pagina — una
pagina nuova aggiunta fra sei mesi è protetta perché si trova dentro la
cartella giusta, non perché qualcuno si è ricordato di proteggerla. Ma quel
layout non può stare direttamente in `app/area-riservata/`: avvolgerebbe
anche `accedi/`, e il rimando di chi non è autenticato — proprio verso
`accedi/` — girerebbe all'infinito. Il guscio vive quindi in
`area-riservata/(interno)/`, un gruppo di rotte che non compare
nell'indirizzo: `accedi/` e `callback/` restano fuori, allo stesso livello,
raggiungibili da chi non ha ancora una sessione.

### `proxy.ts`, non `middleware.ts`

In Next 16 la convenzione `middleware.ts` è deprecata e rinominata
`proxy.ts`, con la funzione esportata che segue il nome del file
(verificato in
`web/node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/middleware.md`,
che rimanda a `proxy.md`). Il comportamento è identico: rinnova la sessione
a ogni visita dell'area riservata, perché un Server Component può leggere i
cookie ma non scriverli, e se il token scade mentre il direttore compila
un'offerta è qui che va rinnovato.

### Due client Supabase, non uno

`clientPubblico` serve le pagine pubbliche, `clientServer` l'area riservata.
Non è ridondanza: il client delle pagine pubbliche non deve toccare i
cookie. Leggerli le renderebbe dinamiche — generate a ogni richiesta invece
che una volta in build — quando invece devono restare statiche. Il secondo
client, quello che legge e scrive i cookie della sessione, esiste solo dove
serve davvero: nell'area riservata.

### L'autorizzazione sta nel database, non nel codice

`e_redattore()` è una funzione SQL, e le stesse politiche RLS che
proteggono la tabella `offerte` la usano per decidere chi legge le bozze e
chi scrive. Il codice dell'applicazione ripete lo stesso controllo prima di
ogni azione (`redattoreAttivoCon`), ma è una seconda rete, non la prima: la
regola vera vive nel database, e non c'è modo di aggirarla scrivendo una
query diversa nell'applicazione. Chi volesse forzare un accesso dovrebbe
rompere Postgres, non trovare una pagina che si è dimenticata il controllo.

### `redattori` non ha politiche di lettura

Nessuna policy `select` sulla tabella `redattori`: l'assenza è voluta, non
dimenticata. La tabella è consultabile solo attraverso `e_redattore()`
(`security definer`, quindi può leggerla anche quando le politiche
ordinarie non lo permetterebbero), che risponde sì o no e non restituisce
mai una riga. Attraverso l'API pubblica la tabella è muta: nemmeno un
redattore autenticato può elencare gli altri redattori.

### Lo slug delle offerte porta l'anno, e in modifica non cambia mai

`slugOfferta` compone partner, vantaggio e l'anno di inizio validità.
Senza l'anno, la stessa convenzione — «UCI Cinemas» con lo stesso vantaggio
— risulterebbe un duplicato alla stagione successiva, e il direttore si
sentirebbe dire di cambiare un vantaggio che invece è corretto; con l'anno,
`uci-cinemas-ingresso-ridotto-2026` e `…-2027` convivono. In compenso, una
volta assegnato, lo slug non cambia mai in `aggiornaOfferta`: è
l'indirizzo che i soci hanno già ricevuto per email, e cambiarlo perché è
cambiato il vantaggio romperebbe ogni vecchio collegamento.

### Il modulo ha `noValidate` e un solo canale d'errore

`ModuloOfferta` disattiva la validazione nativa del browser sul `<form>`,
pur lasciando `required` sui singoli campi. È la correzione di un difetto
scoperto scrivendone i test: con `required` e basta, il browser bloccava
l'invio prima che la Server Action venisse anche solo chiamata, e i
messaggi italiani sui campi obbligatori restavano scritti ma
irraggiungibili — nessuno li avrebbe mai visti. Con `noValidate` resta un
solo canale d'errore, il nostro, sempre nello stesso punto sotto al campo;
`required` continua a dire l'obbligatorietà a un lettore di schermo e a
reggere la distinzione con le etichette «(facoltativo)».

### Le offerte senza scadenza non spariscono da sole

Chiesto da Michele l'8 settembre 2026, a fase 2 completata: una convenzione
come quella col gommista non ha una data di fine, e il modulo non deve
costringere un direttore a inventarsela. Con la migrazione `0003`, `valida_al`
può essere nullo; nel dominio diventa `validaAl` assente, mai una data
convenzionale come il 31 dicembre — quella sarebbe una bugia che il sito
ripeterebbe ai soci.

**La conseguenza operativa, da tenere a mente:** «le offerte scadute
spariscono da sole» resta vera solo per le offerte che una scadenza ce l'hanno.
Un'offerta senza scadenza **non sparisce mai da sola** — resta pubblicata
finché un direttore non la ritira a mano dall'area riservata, spuntando
«Salva bozza» o eliminandola. Si sposta un pezzo di manutenzione dal sito alle
persone: è il prezzo di non mentire sulla data, ed è giusto saperlo ora invece
che scoprirlo fra due anni davanti a un'officina che ha chiuso.

### L'uscita è un Route Handler, non una Server Action

`area-riservata/uscita/route.ts` chiude la sessione sia per l'espulsione
(chi ha una sessione ma non è più un redattore) sia per l'uscita volontaria
del pulsante «Esci». Un Route Handler serve comunque per l'espulsione: il
guscio protetto è un layout, cioè un Server Component, e un Server
Component legge i cookie ma non può scriverli — un `signOut()` chiamato da
lì revocherebbe la sessione su Supabase ma lascerebbe il cookie intatto nel
browser. Una volta che quel Route Handler esiste, dargli anche l'uscita
volontaria evita due strade che chiuderebbero la sessione allo stesso modo:
una sola porta d'uscita, con GET riservato all'espulsione (che arriva
sempre da un `redirect()` server-side, sempre un GET) e POST all'uscita
volontaria del pulsante.

La revisione finale del ramo ha trovato che quel pulsante era un `<Link>`
verso l'indirizzo GET: Next precarica i `<Link>` che entrano nel viewport,
ma solo in produzione, e il pulsante stava nella testata dell'elenco —
quindi nel viewport dal primo istante di ogni visita. La sessione veniva
chiusa da sola, in produzione soltanto, mai in `npm run dev`. Corretto
rendendo il pulsante un `<form method="post">` e aggiungendo `POST` accanto
al `GET` esistente.

### Il commento sulla politica dei contenuti va tenuto vero, non solo scritto una volta

`netlify.toml` diceva, sopra `script-src 'unsafe-inline'`, che «non c'è un
solo contenuto scritto dagli utenti». Vero in fase 1, falso da questa fase:
descrizioni, condizioni, istruzioni e recapiti delle offerte sono scritti
dai direttori e resi sulle pagine pubbliche. Il rischio resta comunque
basso — chi scrive è autenticato e nominato in `redattori`, React fa
l'escape di tutto ciò che rende, e non c'è un solo `dangerouslySetInnerHTML`
nel progetto — quindi non è stato il caso di stringere la policy adesso. Il
commento è stato riscritto per dire il vero e per spostare il riesame reale
alla fase 4, quando a scrivere contenuti sarà il pubblico e non più solo
tre persone nominate a mano in una tabella.
