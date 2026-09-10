-- Fase 3 — l'anagrafica dei soci.
--
-- Serve a una cosa sola, e conviene dirla subito: **stabilire chi può inviare
-- una richiesta**. Deliberato in riunione il 3 settembre 2026, così i
-- direttori non ricevono email di sconosciuti.
--
-- L'elenco entra una volta sola, importato dallo sviluppatore dal file del
-- direttivo su tabella vuota; da quel momento lo aggiornano i direttori dalla
-- pagina `/area-riservata/soci`. Non esiste quindi nessuna logica di fusione
-- fra un import e i dati già presenti: se un giorno servisse, sarà una
-- decisione nuova e non un caso da indovinare qui.

create table soci (
  id                uuid primary key default gen_random_uuid(),
  nome              text not null,
  cognome           text not null,
  email             text not null,
  codice_dipendente text not null,       -- la «matricola», nelle parole del direttivo
  telefono          text,
  note              text,                -- uso interno dei direttori
  creato_il         timestamptz not null default now(),
  creato_da         uuid references redattori(id)
);

-- I due indici che rendono possibile il riscontro, e che insieme impediscono
-- di iscrivere due volte la stessa persona.
--
-- Sono normalizzati perché il confronto deve perdonare la battitura: chi
-- scrive `Mario.Rossi@Agenziaentrate.it` è la stessa persona che risulta come
-- `mario.rossi@agenziaentrate.it`, e una matricola copiata da un cedolino
-- arriva volentieri con uno spazio in mezzo. Normalizzare nell'indice invece
-- che nel dato conserva il valore com'è stato scritto — che è quello che un
-- direttore si aspetta di rileggere — e rende comunque impossibile il
-- doppione.
create unique index soci_email_key  on soci (lower(email));
create unique index soci_codice_key on soci (upper(replace(codice_dipendente, ' ', '')));

alter table soci enable row level security;

-- Solo i redattori. **Nessuna politica per `anon`**, e non è una dimenticanza:
-- l'anagrafica è l'elenco nominativo dei dipendenti di un ufficio pubblico, e
-- attraverso l'API pubblica deve essere muta.
--
-- Il riscontro delle richieste (fase 4) non passerà di qui: girerà su una
-- funzione `security definer` che risponde sì o no senza restituire una riga,
-- come `e_redattore()` fa per i redattori. Un modulo che dicesse «questo
-- indirizzo risulta» restituendo il nome sarebbe un modo per farsi dare
-- l'elenco del personale una richiesta alla volta.
create policy "i redattori leggono i soci" on soci
  for select to authenticated using (e_redattore());
create policy "i redattori aggiungono soci" on soci
  for insert to authenticated with check (e_redattore());
create policy "i redattori modificano i soci" on soci
  for update to authenticated using (e_redattore()) with check (e_redattore());
create policy "i redattori tolgono soci" on soci
  for delete to authenticated using (e_redattore());
