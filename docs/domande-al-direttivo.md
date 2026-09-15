# Cosa chiedere al direttivo

Aggiornato al 15 settembre 2026, dopo la telefonata col direttore.

Ogni voce dice **cosa chiedere**, **perché serve** e **cosa si sblocca**. Quando
arriva una risposta, si cancella la voce e si annota la decisione in
`decisioni.md` se cambia qualcosa nel sito.

---

## 1. Il cinema esiste?

**Da chiedere:** il CRAL ha convenzioni con dei cinema? UCI, The Space, altri?
E se sì, quanto costa un biglietto per un socio?

**Perché:** nel materiale ci sono sette teatri e **zero circuiti
cinematografici**. Il sito però mette «Richiedi biglietti del cinema» nel
riquadro più grande della home, e ha un modulo apposito con la scelta del
circuito e della sala.

**Cosa si sblocca:** se i cinema ci sono, il modulo si accende scrivendo due
righe nel database. Se non ci sono, quella porta sulla home sta promettendo una
cosa che il CRAL non ha, e va sostituita con qualcos'altro — i teatri, per
esempio, che invece abbondano.

**È la domanda più urgente**, perché riguarda la prima cosa che un socio vede.

## 2. Agenzia delle Entrate, o Agenzia delle Entrate-Riscossione?

**Da chiedere:** i soci sono dipendenti dell'Agenzia delle Entrate o
dell'Agenzia delle Entrate-Riscossione?

**Perché:** due documenti del materiale dicono la seconda — la lettera della
Farmacia D'Atri è indirizzata alla vicepresidente del «CRAL ARES, Agenzia delle
Entrate Riscossione, Regione Campania», e la convenzione assicurativa si
intitola «CRAL ARES ADR». Il sito scrive **Agenzia delle Entrate** ovunque:
titolo della home, piè di pagina, pagina «Iscriviti».

**Cosa si sblocca:** se è ADER, è una correzione di sostanza in cinque punti del
sito. Sono due enti diversi, e sbagliarlo sulla home è il genere di errore che
un dipendente nota al primo sguardo.

## 3. Il dominio è `cralares.com` — resta da confermare il resto

**Quasi risolta il 15 settembre.** I sei indirizzi dei direttori, comunicati
per telefono, sono **tutti su `cralares.com`**, segreteria compresa. Il dominio
è registrato e le caselle esistono: non è più una domanda, è un fatto.

**Cosa resta da chiedere:**

- Il sito pubblico starà su `cralares.com` o su un `.it` da registrare a parte?
  Avere le email su un dominio e il sito su un altro si può fare, ma è una
  scelta, non una svista da lasciar accadere.
- Chi ha le credenziali Aruba, perché i record DNS li deve scrivere qualcuno.
- Da quale indirizzo devono partire le email automatiche del sito.

**Cosa cambia già adesso:** il sito scrive `info@cralares.it` in tre punti.
Quella casella con ogni probabilità **non esiste**, mentre
`segreteriacral@cralares.com` esiste ed è la segreteria. È un indirizzo
pubblicato che non riceve: va corretto a prescindere da come finisce la
scelta del dominio del sito.

## 4. I vantaggi delle dieci convenzioni rimaste in bozza

**Da chiedere:** per ciascuna di queste, **quanto risparmia un socio**?

| Partner | Cosa sappiamo | Cosa manca |
|---|---|---|
| Teatro Diana | Convenzione rinnovata 2026/2027 | Lo sconto o il prezzo |
| Teatro Augusteo | Prezzi riservati sugli abbonamenti a turno | Quanto |
| Teatro Cilea | Convenzione attiva | Quanto |
| Cineteatro Acacia | Convenzione attiva | Quanto |
| Teatro Mercadante | Convenzione col Teatro di Napoli | Quanto |
| Teatro San Ferdinando | Convenzione col Teatro di Napoli | Quanto |
| Eureka Viaggi | Biglietti Italo tariffa Flex | Quanto si risparmia |
| Trial Viaggi | Voucher traghetti e aliscafi | Quanto |
| Chalet La Terrasse | Caffetteria al Vomero | Quale sconto |
| Napolielettrica | Scooter e moto elettriche | Quale sconto, **e la data di fine**, che nel foglio è vuota |

**Perché:** le dieci schede esistono già nel sito con contatti e scadenze
veri, e aspettano solo quella riga.

**Cosa si sblocca:** le offerte diventano visibili ai soci. È anche
**l'occasione giusta per fargli usare il sito la prima volta**: entra in area
riservata, apre una bozza, scrive il vantaggio, pubblica. Trenta secondi a
scheda, e impara lo strumento su contenuti suoi.

## 5. L'elenco dei soci

**Da chiedere:** il file dei soci, con nome, cognome, **email aziendale** e
**matricola**. Anche Excel va bene.

**Perché:** solo chi risulta in quell'elenco può inviare una richiesta dal
sito. Oggi ci sono venti nomi finti per le prove.

**Cosa si sblocca:** il riscontro sui soci veri. L'import è pronto e ci vogliono
dieci minuti.

**Da ricordargli:** il file va mandato con un canale protetto, non come
allegato di un'email in chiaro — sono dati personali di quattrocento persone.

## 6. L'IBAN dell'associazione

**Da chiedere:** l'IBAN su cui i soci fanno il bonifico quando scelgono il
cedolino.

**Perché:** oggi la pagina di conferma dice al socio di aspettare l'IBAN dal
direttore e di non versare niente prima.

**Cosa si sblocca:** IBAN, importo e causale già scritti nella conferma e
nell'email, quindi un giro di email in meno per ogni richiesta.

## 7. Gli indirizzi dei direttori — ARRIVATI

**Risposta del 15 settembre**, al telefono: il direttore ha comunicato gli
indirizzi a cui devono arrivare le richieste.

Sono **sei**: la segreteria e cinque caselle personali. Stanno in
`web/.env.local`, su una riga **commentata**, che non è versionata e che il
codice non legge finché il cancelletto resta dov'è. Qui non si scrivono: questo
file sta su git e quelli sono recapiti nominativi di persone.

La segreteria è in testa all'elenco di proposito: il primo indirizzo diventa il
`reply_to` della conferma che riceve il socio (`posta.ts:106`), e lì deve
esserci una casella di servizio, non quella di una persona.

**Non vanno accesi finché si fanno prove**, ed è una richiesta esplicita del
direttore. Servono comunque due gesti per accendere: togliere il cancelletto e
valorizzare `RESEND_API_KEY`. Senza la chiave non parte niente comunque,
nemmeno la conferma al socio (`posta.ts:94`).

**Da decidere prima di accendere:** se le richieste debbano arrivare a tutti e
sei o alla sola segreteria. Sei destinatari per ogni richiesta sono sei caselle
che si riempiono, e con quattrocento soci diventa rumore che porta a smettere
di leggerle.

## 8. Cosa farne di cataloghi e prezziari

**Da chiedere:** il catalogo del Bellini, i manifesti del Cilea, il prezziario
dell'Augusteo — vogliono che i soci possano scaricarli dal sito?

**Perché:** il sito **non ha allegati**, ed è una decisione loro dell'8
settembre. Oggi quel materiale non ha un posto dove stare.

**Tre strade da proporgli:**

1. **Trascrivere l'essenziale nel testo dell'offerta.** Funziona benissimo dove
   il vantaggio è una riga: «20% su farmaci e parafarmaco» è tutto quello che
   serve al socio.
2. **Rimandare al sito del partner** per quello che cambia. Le stagioni
   teatrali cambiano ogni mese: un link è sempre aggiornato, un PDF di
   settembre a gennaio mente.
3. **Aggiungere gli allegati**, se ci tengono davvero. È lavoro in più e va
   deciso da loro.

## 9. Il motto in facciata

**Da chiedere:** va bene *«Quello che il lavoro non ti dà, te lo diamo noi il
sabato»*?

**Perché:** l'ho scritta io come segnaposto, ed è la frase più esposta del
sito — sta sotto il marchio, sulla home. Non è materiale loro e non è mai
passata da nessuno.

---

## Già risolte, da non richiedere

- **Campi dell'offerta e immagini** — confermati l'8 settembre: gli otto campi
  che ci sono, niente immagini.
- **Offerte senza scadenza** — decise l'8 settembre, e il foglio delle
  convenzioni le scrive già così (`31/12/2099`).
- **Cedolino e busta paga** come modalità di pagamento — chiarite l'8 settembre.
- **Indirizzi dei direttori** — arrivati il 15 settembre, trascritti spenti in
  `web/.env.local`. Resta da decidere se scrivere a tutti e sei: vedi la voce 7.
