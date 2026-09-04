# Sito CRAL ARES — Documento di progettazione

**Prima stesura:** 25 agosto 2026
**Ultima revisione:** 4 settembre 2026
**Stato:** approvato dal direttivo il 3 settembre 2026, pronto per il piano di implementazione

## Revisioni

| Data | Cosa è cambiato |
|---|---|
| 25/08/2026 | Prima stesura |
| 02/09/2026 | Scope semplificato: fuori l'invio automatico degli avvisi ai 400 soci (lo fanno i direttori da Aruba) e il flusso strutturato di approvazione delle richieste (rispondono a mano). Netlify al posto di Vercel |
| 04/09/2026 | Richiesta del direttivo in riunione: anagrafica soci gestibile dall'area riservata e riscontro obbligatorio sulle richieste |

---

## 1. Obiettivo

Realizzare il sito web del CRAL ARES, associazione dei dipendenti dell'Agenzia
delle Entrate. Il sito deve:

1. presentare l'associazione (chi siamo, direttivo, contatti, come iscriversi);
2. mettere in evidenza le offerte e convenzioni della settimana;
3. raccogliere le richieste dei soci e recapitarle ai direttori via email;
4. permettere ai direttori — 2-3 persone non tecniche — di pubblicare una nuova
   offerta ogni settimana senza assistenza tecnica;
5. tenere aggiornato l'elenco dei soci e accettare richieste solo da loro.

Il criterio di successo principale non è tecnico: **un direttore deve saper
pubblicare un'offerta da solo, al primo tentativo, senza chiamare nessuno.**

## 2. Il principio che regge tutto il progetto

**Il sito raccoglie, i direttori rispondono.** Non decide, non approva, non
invia comunicazioni di massa. Ogni volta che si è dovuto scegliere fra
automatizzare una decisione e consegnarla ai direttori nel modo più comodo
possibile, ha vinto la seconda. È il motivo per cui non esistono stati della
richiesta, email di esito automatiche o una bacheca di approvazione.

L'unica eccezione è il riscontro dei soci (sezione 8): lì il sito decide da
solo, perché è un confronto meccanico con un elenco, non un giudizio.

## 3. Decisioni prese

| Decisione | Scelta | Motivo |
|---|---|---|
| Accesso alle offerte | Tutto pubblico, nessun login per i soci | Le offerte sono ciò che invoglia a iscriversi: nasconderle è controproducente |
| Chi può inviare richieste | Solo chi risulta nell'elenco soci | Deciso in riunione: i direttori non devono ricevere email di sconosciuti |
| Architettura | Applicazione unica su misura | I redattori non sono tecnici: un modulo dedicato batte un CMS generico |
| Contenuti | Database, non file | Offerte, richieste e soci cambiano di continuo |
| Esito della richiesta | Gestito a mano dai direttori via email | Semplifica il sito e rispecchia come lavorano davvero |
| Avvisi ai soci | Inviati dai direttori da Aruba | Toglie l'invio a lotti, i rimbalzi e un servizio email a pagamento |
| Hosting | Netlify | Vercel vieta l'uso commerciale sul piano gratuito, e il criterio è che chi scrive il codice sia pagato |
| Dominio | `cralares.it` (verificato libero il 25/08/2026) | Nome esatto dell'associazione, TLD italiano |

## 4. Stack tecnologico

- **Next.js (App Router) + TypeScript** — sito e area riservata in un unico progetto
- **Netlify** — hosting, deploy automatico, dominio e certificato HTTPS
- **Supabase** — database PostgreSQL, autenticazione dei direttori, archivio immagini
- **Resend** (o Brevo) — invio email transazionali
- **Tailwind CSS** — stili, con i colori del marchio come design token
- **Cloudflare Turnstile** — protezione antispam invisibile sui moduli pubblici

Nessun server da amministrare, nessun aggiornamento di sicurezza manuale.
Tutti i servizi restano nei piani gratuiti: unico costo ricorrente il dominio,
15 €/anno. Due accorgimenti previsti: `pg_dump` schedulato per i backup e un
ping settimanale che eviti la pausa per inattività di Supabase.

## 5. Struttura del sito

### 5.1 Sito pubblico

| Percorso | Contenuto |
|---|---|
| `/` | Presentazione breve + offerte in evidenza |
| `/offerte` | Tutte le offerte valide, filtrabili per categoria |
| `/offerte/[slug]` | Scheda offerta: dettagli, condizioni, azione (modulo o istruzioni) |
| `/chi-siamo` | L'associazione, il direttivo, i contatti |
| `/iscriviti` | Requisiti, quota, procedura di adesione al CRAL |
| `/privacy` | Informativa sul trattamento dei dati |
| `/cookie` | Informativa cookie (solo tecnici) |

Le offerte scadute (`valida_al` passata) spariscono da sole dall'elenco, ma la
loro scheda resta raggiungibile: chi apre un vecchio link — dall'email del
lunedì riletta tre settimane dopo — trova "Questa offerta è terminata il
20 settembre", il pulsante di richiesta disattivato e un rimando alle offerte in
corso. Un link morto farebbe sembrare rotto il sito, e i dati ci sono comunque
perché le offerte scadute restano in tabella.

### 5.2 Area riservata (`/area-riservata`)

Accessibile solo agli indirizzi email presenti nella tabella `redattori`.

| Percorso | Funzione |
|---|---|
| `/area-riservata` | Elenco offerte con stato, scadenza, modifica ed eliminazione |
| `/area-riservata/offerte/nuova` | Creazione offerta con anteprima dal vivo |
| `/area-riservata/offerte/[id]` | Modifica offerta esistente |
| `/area-riservata/richieste` | Elenco richieste in sola lettura, con filtri ed esportazione CSV |
| `/area-riservata/soci` | Elenco soci con ricerca, aggiunta e rimozione |

## 6. Modello dati

```sql
-- Redattori autorizzati (direttori)
create table redattori (
  id           uuid primary key default gen_random_uuid(),
  email        text unique not null,
  nome         text not null,
  ruolo        text,                        -- es. "Presidente", "Segretario"
  attivo       boolean not null default true,
  creato_il    timestamptz not null default now()
);

-- Soci dell'associazione
create table soci (
  id                uuid primary key default gen_random_uuid(),
  nome              text not null,
  cognome           text not null,
  email             text not null,
  codice_dipendente text not null,
  telefono          text,
  note              text,                    -- uso interno dei direttori
  creato_il         timestamptz not null default now(),
  creato_da         uuid references redattori(id)
);
create unique index soci_email_key  on soci (lower(email));
create unique index soci_codice_key on soci (upper(replace(codice_dipendente, ' ', '')));

-- Offerte e convenzioni
create type modalita_offerta as enum ('solo_sconto', 'biglietti', 'convenzione');
create type stato_offerta    as enum ('bozza', 'pubblicata');

create table offerte (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  titolo             text not null,
  partner            text not null,
  categoria          text not null,          -- cinema, teatri, assicurazione auto, pneumatici
  descrizione_breve  text not null,          -- max 160 caratteri, usata nelle schede
  descrizione        text not null,          -- testo completo, formattazione minima
  immagine_url       text,
  vantaggio          text not null,          -- testo libero: "-30%", "2x1", "ingresso ridotto"
  prezzo_pieno       numeric(8,2),
  prezzo_socio       numeric(8,2),
  valida_dal         date not null,
  valida_al          date not null,
  in_evidenza        boolean not null default false,
  modalita           modalita_offerta not null,
  istruzioni         text,                   -- se modalita = solo_sconto
  codice_sconto      text,
  link_partner       text,
  indirizzo          text,
  telefono           text,
  email_partner      text,
  stato              stato_offerta not null default 'bozza',
  creata_da          uuid references redattori(id),
  creata_il          timestamptz not null default now(),
  aggiornata_il      timestamptz not null default now()
);

-- Richieste dei soci
create type modalita_pagamento as enum ('bonifico', 'busta_paga');

create table richieste (
  id                 uuid primary key default gen_random_uuid(),
  offerta_id         uuid not null references offerte(id),
  socio_id           uuid references soci(id) on delete set null,
  -- dati del socio, copiati al momento dell'invio
  nome               text not null,
  cognome            text not null,
  codice_dipendente  text not null,
  email              text not null,
  telefono           text not null,
  pagamento          modalita_pagamento not null,
  -- modulo biglietti
  numero_posti       integer,
  titolo_evento      text,
  data_preferita     date,
  orario_preferito   text,
  sala               text,
  -- modulo convenzione
  servizio_interesse text,
  periodo_desiderato text,
  -- comuni
  note               text,
  consenso_privacy   boolean not null,
  consenso_il        timestamptz not null,
  email_inviata      boolean not null default false,
  creata_il          timestamptz not null default now()
);
```

**Note sul modello**

- **I dati del socio sono copiati dentro la richiesta**, non solo referenziati.
  È ciò che permette di cancellare un socio senza svuotare il suo storico:
  `socio_id` diventa nullo, la richiesta resta leggibile per intero.
- Le offerte scadute restano in tabella: servono a ricostruire a cosa si
  riferiva una vecchia richiesta.
- I campi specifici dei due moduli convivono nella stessa tabella `richieste`,
  nulli quando non pertinenti. Con questi volumi due tabelle separate
  complicherebbero l'elenco senza vantaggi.
- La validazione dei campi obbligatori per modalità avviene nel codice (schema
  Zod condiviso fra modulo e server), non con vincoli SQL: i messaggi di errore
  devono essere in italiano e comprensibili.
- **Non esiste** una tabella degli iscritti agli avvisi: gli avvisi li mandano
  i direttori da Aruba.
- **Non esistono** stati della richiesta: l'esito lo gestiscono i direttori
  rispondendo all'email.

## 7. Le tre modalità di offerta

Ogni offerta ha una modalità che determina cosa vede il socio nella scheda.

| Modalità | Scheda pubblica | Campi richiesti al socio |
|---|---|---|
| `solo_sconto` | Istruzioni ("mostra la tessera CRAL alla cassa"), codice sconto, link e contatti del partner. Nessun modulo. | — |
| `biglietti` | Pulsante "Richiedi biglietti" + modulo eventi | Dati socio + numero posti, titolo evento, data e orario preferiti, sala, note |
| `convenzione` | Pulsante "Richiedi informazioni" + modulo convenzioni | Dati socio + servizio o prodotto di interesse, periodo desiderato, note |

**Dati del socio, comuni a entrambi i moduli:** nome, cognome, codice
dipendente, email, telefono, modalità di pagamento (bonifico oppure addebito in
busta paga), consenso privacy.

Il prezzo riservato ai soci è visibile a tutti — è ciò che rende l'offerta
interessante e invoglia a iscriversi. Ogni scheda con richiesta attiva riporta
in modo esplicito: *prezzo riservato ai soci del CRAL ARES; l'invio della
richiesta non costituisce acquisto*. L'email di presa in carico è una conferma
di ricezione, non di acquisto: la conferma vera arriva dal direttore.

## 8. Il riscontro dei soci

Deliberato in riunione il 03/09/2026: solo chi risulta nell'elenco soci può
inviare una richiesta, così i direttori non ricevono email di sconosciuti.

### 8.1 Come funziona il confronto

All'invio del modulo si cerca un socio la cui **email oppure** il cui **codice
dipendente** combacino. Basta uno dei due:

- il socio che scrive dall'indirizzo personale viene riconosciuto dal codice;
- il socio che sbaglia una cifra del codice viene riconosciuto dall'email.

Il confronto ignora maiuscole e spazi su entrambi i campi. Serve a non
respingere un socio in regola per un dettaglio di battitura: il falso allarme
qui costa una telefonata arrabbiata, mentre il caso opposto — un estraneo che
indovina sia l'email sia il codice di un dipendente — non è realistico.

### 8.2 Cosa succede a chi non risulta

**La richiesta non viene salvata e nessuna email parte.** Il richiedente legge
subito a schermo:

> **Non risulti tra i soci del CRAL ARES.** Questo indirizzo non è nell'elenco
> dell'associazione, quindi la richiesta non è stata inviata. Se sei socio,
> riprova dall'indirizzo che hai comunicato al CRAL, oppure scrivi a
> [indirizzo dei direttori].

Il messaggio deve dire chiaramente **che la richiesta non è partita**: senza
quella frase la persona resta ad aspettare una risposta che non arriverà, e
finisce per telefonare — cioè il fastidio che il riscontro doveva togliere.

### 8.3 Limite di tentativi

Un modulo che risponde "sei socio" oppure "non sei socio" è, tecnicamente, uno
strumento per scoprire se un indirizzo appartiene a un dipendente. Il rischio
concreto è basso: dal modulo non si ottiene nulla di valore, perché biglietti e
risposte passano dalla casella Aruba dei direttori. Si chiude comunque a costo
quasi nullo con Turnstile (già previsto) e un limite di tentativi per indirizzo
IP sull'endpoint di invio.

### 8.4 La pagina dei soci

`/area-riservata/soci` — una schermata, tre azioni.

- **Elenco** ordinato per cognome, con il conteggio in cima e un campo di
  ricerca che filtra mentre si scrive su nome, cognome, email e codice. Con
  circa 400 righe è la ricerca a essere usata davvero, non lo scorrimento.
- **Aggiungi socio**: nome, cognome, email, codice dipendente, più telefono e
  note facoltativi. Se email o codice esistono già, messaggio esplicito
  (*"Questo codice dipendente è già assegnato a Mario Rossi"*), non un errore
  tecnico.
- **Rimuovi**: cancellazione definitiva, con conferma che nomina la persona
  (*"Stai per togliere Mario Rossi dall'elenco soci. Non potrà più inviare
  richieste."*). Lo storico delle sue richieste resta intatto.

**Caricamento iniziale:** l'elenco viene importato una volta sola dallo
sviluppatore, a partire dal file Excel fornito dal direttivo. Non è prevista
una funzione di caricamento nell'interfaccia: da quel momento l'elenco si
aggiorna esclusivamente dalla pagina soci.

## 9. Flussi

### 9.1 Pubblicazione di un'offerta

1. Il direttore apre `/area-riservata` e inserisce la propria email.
2. Riceve un link di accesso monouso (magic link). Nessuna password.
3. Se l'email non è fra i `redattori` attivi, l'accesso è negato.
4. "Nuova offerta": modulo con i campi della sezione 6 e **anteprima dal vivo**
   della scheda a fianco.
5. "Salva bozza" oppure "Pubblica". Alla pubblicazione la pagina pubblica viene
   rigenerata immediatamente (`revalidatePath`).
6. Dopo la pubblicazione compare **"Copia il testo per l'email"**: un testo già
   pronto con titolo, vantaggio, scadenza e link alla scheda, da incollare
   nell'avviso che i direttori mandano ai soci da Aruba.

### 9.2 Richiesta di un socio

1. Il socio compila il modulo dalla scheda offerta (l'offerta è precompilata).
2. Validazione lato client e lato server + verifica antispam Turnstile.
3. **Riscontro nell'elenco soci** (sezione 8). Se non risulta, il flusso si
   ferma qui: niente salvataggio, niente email, messaggio a schermo.
4. **La richiesta viene salvata sul database.** Questo passaggio precede le
   email ed è quello che non deve fallire.
5. Email ai direttori, con `Reply-To` sull'email del socio.
6. Email di presa in carico al socio, con il riepilogo di quanto richiesto.
7. Se l'invio email fallisce, `email_inviata` resta `false` e l'elenco richieste
   evidenzia la riga: nessuna richiesta si perde in silenzio.

### 9.3 Elenco delle richieste

Pagina di sola lettura con filtri per offerta e periodo, ed esportazione CSV.
Serve ai direttori per contare quanti biglietti ordinare e come rete di
sicurezza se un'email si perde in un filtro antispam. Non ci sono azioni: la
risposta al socio si dà rispondendo all'email.

## 10. Il modulo e l'email: dove si gioca il progetto

### 10.1 Lato socio — il modulo deve sparire, non farsi notare

- L'offerta è **già precompilata**: arriva dalla scheda, il socio non la
  seleziona.
- Solo i campi necessari, elencati nella sezione 7.
- **Pensato per il pollice su un telefono**: è da lì che apriranno il link.
- Errori spiegati in italiano **mentre scrive**, non dopo aver premuto invia.
- Conferma visiva chiara + email di presa in carico.

### 10.2 Lato direttori — l'email leggibile in tre secondi

- **Oggetto parlante:** `[CRAL ARES] #0042 · 2 biglietti Cinema Astra — Mario Rossi`.
  Si identifica dalla lista della posta senza aprirlo.
- **Prima riga di riepilogo:** *"Mario Rossi chiede 2 posti per sabato sera,
  pagamento in busta paga."* Il resto è dettaglio sotto.
- **Dati in tabella, non in prosa**, con il telefono cliccabile dal cellulare.
- **`Reply-To` sull'email del socio** — il dettaglio che conta più di tutti gli
  altri messi insieme: il direttore preme *Rispondi* e sta già scrivendo al
  socio. Visto che la risposta è gestita a mano, è lì che si guadagna o si
  perde tempo ogni settimana.

## 11. Privacy e conformità

- **Anagrafica soci** — base giuridica: esecuzione del rapporto associativo
  (art. 6.1.b GDPR), non consenso. Finalità da dichiarare nell'informativa:
  gestione del rapporto associativo e **verifica della qualità di socio**.
  Conservazione: per la durata dell'iscrizione; la cancellazione è nelle mani
  dei direttori dalla pagina soci.
- **Richieste** — base giuridica: consenso, raccolto con checkbox non
  preselezionata prima dell'invio, con data e ora registrate. Cancellazione
  automatica dopo 24 mesi (job pianificato settimanale).
- **Nomina a responsabile del trattamento** (art. 28 GDPR) del CRAL nei
  confronti dello sviluppatore, che come amministratore tecnico accede ai dati
  dei soci. Documento di una pagina, da firmare una volta.
- Informativa privacy raggiungibile da ogni modulo e dal piè di pagina.
  Titolare: CRAL ARES.
- Nessun cookie di profilazione; analisi del traffico solo con strumenti senza
  cookie, o assenti.
- I dati restano su infrastruttura con server nell'Unione Europea.
- Il file con l'elenco dei soci va trasmesso allo sviluppatore con un canale
  protetto, non come allegato email in chiaro.

## 12. Identità visiva

Dal marchio ufficiale (Vesuvio stilizzato), estratto in SVG da
`assets/logo-cral-ares.svg`:

| Token | Valore | Uso |
|---|---|---|
| `azzurro` | `#73D1EA` | Logo, sfondi tenui, dettagli |
| `arancione` | `#EAA256` | Logo, accenti, bordi |
| `blu-profondo` | `#0E5C74` | Pulsanti principali, intestazioni (7,5:1 su bianco) |
| `blu-notte` | `#0A3D4D` | Testo corrente, piè di pagina (11,8:1 su bianco) |
| `ambra-scura` | `#96591B` | Link e stati attivi (5,6:1 su bianco) |

I due colori originali non hanno contrasto sufficiente per testo su bianco
(azzurro 1,7:1 e arancione 2,1:1, contro il 4,5:1 richiesto): si usano come
accenti, sfondi e dettagli grafici, mentre testi e pulsanti usano le varianti
profonde. L'azzurro originale su fondo `blu-notte` raggiunge 6,7:1 ed è quindi
utilizzabile per testo nelle sezioni scure.

Obiettivo di accessibilità: **WCAG 2.1 AA**, appropriato per un sito legato
alla pubblica amministrazione. Il sito deve essere pienamente utilizzabile da
telefono: i soci apriranno le offerte dal cellulare, spesso da un link ricevuto
via email.

## 13. Testing

**Validazione dei moduli** — schemi Zod testati con casi validi e non validi,
inclusi i campi obbligatori che cambiano per modalità.

**Riscontro dei soci**

- email presente in elenco → richiesta salvata ed email ai direttori inviata;
- codice dipendente presente ma email diversa → riconosciuto lo stesso;
- né email né codice in elenco → nulla salvato, nessuna email, messaggio
  corretto a schermo;
- email con maiuscole o spazi, codice con spazi → riconosciuti comunque;
- socio cancellato → le sue richieste precedenti restano leggibili per intero;
- aggiunta di un socio con email o codice già presenti → errore comprensibile
  che nomina il socio in conflitto.

**Flusso richiesta** — la richiesta di un socio riconosciuto viene salvata anche
quando il servizio email è irraggiungibile, e la riga risulta evidenziata
nell'elenco.

**Controllo accessi** — un'email non presente in `redattori` non entra nell'area
riservata; le rotte dell'area riservata, pagina soci compresa, rifiutano
richieste non autenticate.

**Visibilità offerte** — un'offerta in bozza o scaduta non compare nel sito
pubblico; una pubblicata e valida sì.

**Accessibilità** — verifica automatica del contrasto e della navigazione da
tastiera sulle pagine principali.

## 14. Fasi di realizzazione

| Fase | Contenuto | Risultato visibile |
|---|---|---|
| 1 | Impostazione progetto, identità visiva, pagine di presentazione | Sito online con chi siamo, contatti, iscriviti |
| 2 | Database, area riservata, pubblicazione offerte con anteprima | I direttori pubblicano la prima offerta |
| 3 | Anagrafica soci: tabella, import iniziale, pagina di gestione | I direttori vedono e aggiornano l'elenco dei soci |
| 4 | Moduli di richiesta, riscontro soci, email ai direttori | Solo i soci richiedono, i direttori ricevono |
| 5 | Elenco richieste in sola lettura ed esportazione | I direttori contano i biglietti da ordinare |
| 6 | Dominio, privacy, accessibilità, collaudo, formazione | Sito pubblicato su cralares.it |

Ogni fase è utilizzabile da sola. La 3 precede la 4 perché il riscontro ha
bisogno di un elenco su cui confrontare.

## 15. Questioni aperte

- Indirizzi email esatti dei direttori destinatari delle notifiche.
- File Excel dell'elenco soci, e conferma delle colonne disponibili (servono
  almeno nome, cognome, email, codice dipendente).
- Testo dell'informativa privacy con i dati reali del titolare (denominazione
  completa, sede, email del titolare del trattamento).
- Elenco definitivo delle categorie. Punto di partenza concordato: cinema,
  teatri, assicurazione auto, pneumatici; modificabile senza interventi sul
  codice.
- Contenuti di "Chi siamo", direttivo e procedura di iscrizione.
- **Coordinate bancarie** per chi sceglie il bonifico.
- **Addebito in busta paga:** con quale procedura l'amministrazione accetta le
  trattenute e quali dati servono per attivarle. È l'unico punto che dipende da
  un accordo esterno all'associazione, quindi conviene chiarirlo presto; il
  resto del sito non ne è bloccato.
- Se il socio debba poter scegliere liberamente la modalità di pagamento o se
  alcune offerte ne ammettano una sola.
- **Limiti di invio di Aruba**: 400 destinatari in copia nascosta da webmail
  possono far scattare i filtri antispam o essere rifiutati. Da verificare prima
  del primo avviso.
