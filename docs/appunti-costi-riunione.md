# Appunti per la riunione — quanto chiedere per il sito CRAL ARES

Riunione: 3 settembre 2026. Uso interno, non da distribuire.

## Risposta in una riga

**3.300 € di compenso + 15 €/anno di costi vivi.** ~15-16 giornate, ~215 €/giornata.
Valore di mercato dello stesso lavoro: 5.000-8.000 €.

| Voce | 1° anno | Anni successivi |
|---|---|---|
| Realizzazione (lorda) | 3.300 € | — |
| Dominio cralares.it | 15 € | 15 € |
| **Totale a carico del CRAL** | **3.315 €** | **15 €** |

Di 3.300 € lordi: 660 € di ritenuta versata dal CRAL all'Erario, 2.640 € netti a me.
Ampio margine sotto la soglia dei 5.000 € (vedi sezione fiscale).

## Cosa fa il sito — scope definitivo (02/09/2026)

Dopo il confronto con i fondatori il progetto si è semplificato. **Poche cose, fatte bene.**

### Dentro

1. **Sito pubblico**: home, elenco offerte filtrabile, scheda offerta, chi siamo, iscriviti,
   privacy, cookie. Le offerte scadute spariscono da sole.
2. **Area riservata**: accesso con link monouso via email (nessuna password), pubblicazione
   e modifica delle offerte con anteprima dal vivo.
3. **Moduli di richiesta** per biglietti e convenzioni — **è la parte da curare di più**.
4. **Email automatica ai direttori** a ogni richiesta, progettata per essere identificata
   a colpo d'occhio e per rispondere con un clic.
5. **Email di presa in carico al socio**, così non compila due volte.
6. **Elenco richieste in sola lettura** con export, in area riservata.
7. **Pulsante "copia il testo per l'email"** dopo la pubblicazione, per l'avviso da mandare
   con Aruba.

### Fuori

- **Invio automatico degli avvisi ai 400 soci**: le email le mandano i direttori da Aruba.
  Cade quindi l'anagrafica soci, l'invio a lotti, la gestione dei rimbalzi e il servizio
  email a pagamento.
- **Bacheca con approvazione e rifiuto**: la risposta al socio la gestiscono i direttori a
  mano, rispondendo all'email. Niente stati della richiesta, niente email di esito
  automatiche, niente motivo di rifiuto strutturato.

Lo spec del 25/08 va aggiornato di conseguenza.

## Perché le richieste vanno comunque salvate nel database

Anche senza bacheca. Se una richiesta esiste **solo** dentro un'email, basta un filtro
antispam, una casella piena o un errore di consegna e sparisce senza che nessuno lo sappia:
te ne accorgi quando il socio telefona, e a quel punto non c'è modo di ricostruire cosa
avesse chiesto.

Il database serve già per le offerte, quindi salvarci anche le richieste costa quasi nulla.
Con mezza giornata in più si ottiene la **pagina di sola lettura** con l'elenco delle
richieste, filtrabile ed esportabile: serve ai direttori per contare quanti biglietti
ordinare, e come rete di sicurezza. È il 20% del lavoro della bacheca con la maggior parte
del suo valore. **Già conteggiata nelle giornate.**

## Il modulo e l'email: dove si gioca il progetto

### Lato socio — il modulo deve sparire, non farsi notare

- L'offerta è **già precompilata**: arriva dalla scheda, il socio non la seleziona.
- Solo i campi necessari: nome, cognome, codice dipendente, email, telefono, modalità di
  pagamento, consenso privacy. Più i campi specifici (posti/data/orario, oppure servizio e
  periodo di interesse).
- **Pensato per il pollice su un telefono**: è da lì che apriranno il link.
- Errori spiegati in italiano **mentre scrive**, non dopo aver premuto invia.
- Conferma visiva chiara + email di presa in carico.

### Lato direttori — l'email leggibile in tre secondi

- **Oggetto parlante:** `[CRAL ARES] #0042 · 2 biglietti Cinema Astra — Mario Rossi`.
  Si identifica dalla lista della posta senza aprirlo.
- **Prima riga di riepilogo:** *"Mario Rossi chiede 2 posti per sabato sera, pagamento in
  busta paga."* Il resto è dettaglio sotto.
- **Dati in tabella, non in prosa**, con il telefono cliccabile dal cellulare.
- **`Reply-To` sull'email del socio** ← il dettaglio che conta più di tutti gli altri messi
  insieme: il direttore preme *Rispondi* e sta già scrivendo al socio. Visto che la risposta
  è gestita a mano, è lì che si vince o si perde tempo ogni settimana.

## Stima delle giornate

| Contenuto | Giornate |
|---|---|
| Setup, identità visiva, pagine pubbliche | 3-4 |
| Database, accesso area riservata, pubblicazione offerte con anteprima | 4-5 |
| **Moduli di richiesta + email ai direttori** (la parte curata) | 4-5 |
| Elenco richieste in sola lettura ed export | 1 |
| Dominio, privacy, accessibilità WCAG AA, collaudo, formazione | 2-3 |
| **Totale** | **14-18** (stima 15-16) |

## Costi vivi ricorrenti (listini verificati 02/09/2026)

| Servizio | Piano | Anno |
|---|---|---|
| Dominio .it | rinnovo Aruba, 11,99 € + IVA | **15 €** |
| Netlify (hosting) | Free | 0 € |
| Supabase (database) | Free | 0 € |
| Resend o Brevo (email transazionali) | Free | 0 € |
| Cloudflare Turnstile (antispam) | Free | 0 € |
| | **Totale** | **15 €/anno** |

**Perché ora è tutto gratis:** le email sono poche decine al giorno (notifiche ai direttori e
prese in carico), quindi rientrano nei piani gratuiti. Era l'invio a 400 soci in un colpo a
richiedere un servizio a pagamento, e quello è uscito dallo scope.

**Netlify e non Vercel:** Vercel definisce commerciale *"any Deployment used for the purpose
of financial gain of anyone involved in any part of the production of the project, including
a paid employee or consultant writing the code"*. Non conta che il CRAL sia no-profit: conta
che io venga pagato. Su Vercel servirebbe il piano Pro a 255 €/anno. **Netlify consente
esplicitamente l'uso commerciale sul piano gratuito**, con supporto ufficiale a Next.js.

**Supabase Free** copre i volumi con larghezza (500 MB di database, qui bastano pochi MB).
Due accorgimenti già conteggiati nelle giornate: `pg_dump` schedulato per i backup, e un ping
settimanale che eviti la pausa per inattività ad agosto.

## Quadro fiscale (prestazione occasionale)

- **Ritenuta d'acconto 20% dal primo euro.** Il CRAL trattiene 660 €, li versa con F24 entro
  il 16 del mese successivo e rilascia la Certificazione Unica entro marzo dell'anno dopo.
- **Il CRAL è sostituto d'imposta.** Se non l'ha mai fatto, va attivato: **verificare con chi
  tiene la contabilità prima di firmare.**
- **Soglia dei 5.000 € lordi annui** (sommando tutti i committenti): oltre scatta la Gestione
  Separata INPS al 33,72%, di cui 2/3 a carico del committente. Con 3.315 € totali siamo
  ampiamente sotto, e resta spazio per altri lavori occasionali nel 2026.
- Nessuna IVA sul compenso. Marca da bollo 2 € sulla ricevuta (dovuta sopra 77,47 €).

## Cosa anticipo io

| Quando | Cosa | Esborso |
|---|---|---|
| Subito | Dominio cralares.it | 15 € una tantum |
| Tutto il resto | Piani gratuiti | 0 € |
| Alla ricevuta | Marca da bollo | 2 € |

**Esposizione massima: 15 €.** Meglio comunque intestare dominio e account **al CRAL con la
carta dell'associazione**, lasciandomi come amministratore tecnico: l'associazione resta
padrona di dominio e dati anche se un domani non ci sono io, e in un direttivo questo
argomento si difende da solo.

## Obiezioni prevedibili e risposte

**"Con Wix o WordPress spendiamo 200 €."**
Il criterio di successo concordato è che un fondatore pubblichi un'offerta da solo, al primo
tentativo, senza chiamare nessuno. Un CMS generico costringe a imparare un pannello
generalista. E i moduli di richiesta con i campi giusti, l'email ai direttori pronta da
rispondere con un clic e l'elenco esportabile per contare i biglietti andrebbero comunque
costruiti, sopra a un impianto più fragile.

**"E i costi di gestione ogni anno?"**
15 €: il solo dominio. Hosting, database ed email stanno nei piani gratuiti, con margini che
questo sito non raggiungerà. Nessun canone nascosto.

**"Non è troppo?"**
Sono 15-16 giornate di lavoro. A tariffa di mercato questo progetto costa 5.000-8.000 €.

**"Chi lo mantiene dopo?"**
**La manutenzione non è inclusa nei 3.300 €.** Proposta: piccole correzioni incluse per i
primi 12 mesi, poi accordo separato — a canone o a consumo. Da non lasciare implicito, o
diventa assistenza gratuita a vita.

**"E se un domani non ci sei più tu?"**
Account intestati all'associazione, codice sorgente consegnato, servizi gestiti senza server
da amministrare. Chiunque sappia usare Next.js può riprenderlo.

**"Perché salvare le richieste se tanto rispondiamo noi via email?"**
Perché un'email può perdersi in un filtro antispam e nessuno se ne accorge. Salvarle costa
quasi nulla, e in più vi dà l'elenco da esportare quando dovete contare quanti biglietti
ordinare.

## Punti da far deliberare domani

1. Approvazione del progetto e dell'importo: **3.300 € + 15 €/anno**.
2. Conferma dello scope: niente invio automatico ai soci (lo fanno loro da Aruba), niente
   approvazione strutturata (rispondono a mano).
3. **Verificare con Aruba i limiti di invio**: 400 destinatari in copia nascosta da webmail
   possono far scattare i filtri antispam o essere rifiutati. Meglio saperlo prima.
4. Intestazione degli account: CRAL con carta dell'associazione (raccomandato).
5. Modalità e tempi di pagamento (proposta: 40% all'avvio, 60% alla consegna).
6. Manutenzione dopo i primi 12 mesi: da definire separatamente.
7. Verifica che il CRAL sia operativo come sostituto d'imposta.
8. Questioni aperte dello spec: email dei direttori destinatari delle notifiche, dati per
   l'informativa privacy, coordinate bancarie, procedura per l'addebito in busta paga.

## Da fare dopo l'approvazione

- Aggiornare `docs/superpowers/specs/2026-08-25-sito-cral-ares-design.md`: togliere gli stati
  della richiesta e il flusso di approvazione, togliere `iscritti_avvisi` e il double opt-in,
  Netlify al posto di Vercel, aggiungere il pulsante "copia testo per l'email".

---

## Esito della riunione (3 settembre 2026)

**Progetto approvato.** Si parte.

### Variazione di scope chiesta dal direttivo

Torna dentro l'**anagrafica soci**, che il 02/09 era stata tolta. In particolare:

1. i direttori vedono l'elenco completo dei soci in area riservata e lo tengono
   aggiornato aggiungendo e rimuovendo membri;
2. il modulo di richiesta accetta solo chi risulta nell'elenco: se l'email (o il
   codice dipendente) non corrisponde a nessun socio, **la richiesta non parte e
   nessuna email raggiunge i direttori**, così nella casella Aruba non arrivano
   messaggi di sconosciuti.

Attenzione: torna l'*anagrafica*, non l'*invio massivo*. Gli avvisi ai 400 soci
continuano a mandarli i direttori da Aruba, quindi non rientrano né il servizio
email a pagamento né la gestione dei rimbalzi.

### Impatto economico

**Circa 2 giornate in più** (tabella soci e import iniziale, pagina di gestione,
riscontro nel flusso di richiesta, limite tentativi, informativa aggiornata e
collaudo). A 215 €/giornata valgono ~430 € su un progetto da 15-16 giornate.

**Decisione: assorbite, senza variazione di prezzo, ma dichiarate per iscritto.**
Rinegoziare 430 € il giorno dopo l'approvazione costa in credibilità più di
quanto renda. Va però scritto nella prima email al direttivo — *"la gestione
dell'elenco soci e il filtro sulle richieste non erano nella stima; li includo
senza variazione di prezzo"* — perché la prossima aggiunta parta dal presupposto
che le variazioni si valutano, non che siano gratuite per abitudine.

**I costi ricorrenti non cambiano: 15 €/anno.** 400 soci occupano ~100 KB contro
i 500 MB di Supabase Free; il riscontro è una query indicizzata per richiesta.
Nessun servizio nuovo, nessuna soglia avvicinata.

### Cose che servono dal direttivo

- **File Excel dei soci** (nome, cognome, email, codice dipendente), inviato con
  un canale protetto e non come allegato in chiaro. L'import iniziale lo faccio
  io una volta sola.
- **Nomina a responsabile del trattamento** (art. 28 GDPR): con l'anagrafica in
  casa serve, è un documento di una pagina, la preparo io insieme
  all'informativa.
- Restano da confermare i punti già elencati sopra: email dei direttori, dati
  per l'informativa, coordinate bancarie, procedura per la busta paga, modalità
  e tempi di pagamento, manutenzione dopo i 12 mesi, verifica del CRAL come
  sostituto d'imposta.

### Stato dei documenti

Lo spec `docs/superpowers/specs/2026-08-25-sito-cral-ares-design.md` è stato
aggiornato il 04/09/2026 con tutte le decisioni del 02/09 e del 03/09.
