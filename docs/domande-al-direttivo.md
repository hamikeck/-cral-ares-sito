# Cosa chiedere al direttivo

Aggiornato al 24 settembre 2026. La numerazione è quella originale: le voci
risolte sono spostate in fondo, e i numeri restano per non confondere chi ha
in mano la versione precedente.

Ogni voce dice **cosa chiedere**, **perché serve** e **cosa si sblocca**. Quando
arriva una risposta, si cancella la voce e si annota la decisione in
`decisioni.md` se cambia qualcosa nel sito.

---

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

## 5. L'elenco dei soci

**Da chiedere:** il file dei soci, con nome, cognome, **email aziendale** e
**matricola**. Anche Excel va bene.

**Perché:** solo chi risulta in quell'elenco può inviare una richiesta dal
sito. Oggi ci sono venti nomi finti per le prove.

**Cosa si sblocca:** il riscontro sui soci veri. L'import è pronto e ci vogliono
dieci minuti.

**Da ricordargli:** il file va mandato con un canale protetto, non come
allegato di un'email in chiaro — sono dati personali di quattrocento persone.

## 7. Gli indirizzi dei direttori — ARRIVATI, manca il mittente

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

**Deciso il 24 settembre: a tutti e sei.** L'elenco in `web/.env.local` resta
com'è, ancora spento.

**Resta aperto il mittente.** Oggi le email partirebbero da
`onboarding@resend.dev`, l'indirizzo di prova di Resend, che consegna solo alla
casella di chi ha aperto l'account: ai direttori non arriverebbe niente. Serve
un indirizzo su `cralares.com` (proposta: `richieste@cralares.com`), e per
usarlo bisogna aggiungere su Aruba i record DNS che Resend chiede. La casella
può anche non esistere, perché nessuno risponde al mittente: ai direttori la
risposta va al socio, al socio va alla segreteria. Da chiedere: **chi ha le
credenziali Aruba.**

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
- **Agenzia delle Entrate-Riscossione** — confermato il 24 settembre (voce 2):
  i soci sono dipendenti di ADER. Il sito lo scrive nei cinque punti in cui
  diceva «Agenzia delle Entrate».
- **L'IBAN** — comunicato il 24 settembre (voce 6), sta in
  `web/src/contenuti/pagine.ts` con una prova sul carattere di controllo. Chi
  paga il cinema con bonifico riceve IBAN, importo e causale a schermo e
  nell'email; chi chiede un'offerta riceve IBAN e causale, e l'importo glielo
  scrive il direttore.
- **Il cinema** — risolto il 23 settembre (voce 1): cinque circuiti veri, con
  prezzi e limitazioni, nella migrazione 0009. Il C+C resta fuori perché la
  convenzione è scaduta.
- **Le dieci convenzioni in bozza** — pubblicate il 15 settembre (voce 4) con
  un vantaggio detto a parole al posto della cifra, per decisione del
  committente. Quando il direttivo avrà le cifre, le scrive da sé
  dall'area riservata.
