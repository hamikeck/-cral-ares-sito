-- Fase 4 — le richieste dei soci, e ciò che serve al modulo del cinema.
--
-- Recepisce le decisioni del direttivo dell'8 settembre 2026: il socio sceglie
-- il circuito e poi la sede, vede l'importo prima di inviare, e paga per
-- cedolino o con la trattenuta in busta paga.

-- Il prezzo di un biglietto, per i soci. Sta sul circuito e non sulla sede:
-- dentro lo stesso circuito il biglietto costa uguale in tutte le sale.
-- Resta nullo finché il direttivo non lo comunica, e il modulo mostra il
-- servizio senza cifra: un numero inventato è peggio di nessun numero.
alter table circuiti add column prezzo_socio numeric(8,2);

-- Le sale di ogni circuito, ciascuna col link alla propria programmazione:
-- è lì che il socio guarda cosa danno prima di decidere quanti biglietti
-- chiedere. Per i teatri non serve nulla di nuovo — non sono circuiti ma
-- offerte, e il link alla stagione sta già in `offerte.link_partner`.
create table sedi (
  id                  uuid primary key default gen_random_uuid(),
  circuito_id         uuid not null references circuiti(id) on delete cascade,
  nome                text not null,
  citta               text,
  link_programmazione text,
  ordine              integer not null default 0,
  attiva              boolean not null default true
);
create unique index sedi_circuito_nome_key on sedi (circuito_id, lower(nome));

create type tipo_richiesta     as enum ('cinema', 'convenzione', 'offerta');
-- 'bonifico' è il «cedolino» nelle parole del direttivo, 'busta_paga' la trattenuta.
create type modalita_pagamento as enum ('bonifico', 'busta_paga');
create type recapito_consegna  as enum ('email_aziendale', 'email_personale', 'whatsapp');

create table richieste (
  id                uuid primary key default gen_random_uuid(),
  tipo              tipo_richiesta not null,
  offerta_id        uuid references offerte(id),   -- solo se tipo = 'offerta'

  -- I dati del socio sono **copiati**, non referenziati. È ciò che permette a
  -- un direttore di togliere una persona dall'anagrafica senza svuotarne lo
  -- storico. Manca di proposito un `socio_id`: per riempirlo servirebbe
  -- leggere `soci` da una pagina pubblica, e quella tabella non è leggibile
  -- da lì — è l'elenco nominativo dei dipendenti di un ufficio pubblico.
  nome              text not null,
  cognome           text not null,
  codice_dipendente text not null,                 -- la «matricola»
  email             text not null,                 -- aziendale: quella del riscontro
  telefono          text,                          -- obbligatorio solo se consegna = 'whatsapp'
  consegna          recapito_consegna,             -- dove vuole ricevere i biglietti
  email_personale   text,                          -- solo se consegna = 'email_personale'

  pagamento         modalita_pagamento,            -- non chiesto per le convenzioni
  -- Congelato al momento dell'invio, mai ricalcolato dal prezzo corrente: fra
  -- sei mesi il listino cambia, e la richiesta deve continuare a raccontare la
  -- cifra che quella persona ha letto e pagato.
  importo           numeric(8,2),

  -- tipo = 'cinema'
  circuito_id       uuid references circuiti(id),
  circuito          text,                          -- copiato, come i dati del socio
  sede_id           uuid references sedi(id),      -- facoltativa
  sede              text,                          -- copiata

  -- tipo = 'convenzione'
  convenzione       text,                          -- campo libero scritto dal socio

  -- tipo = 'cinema', oppure offerta con modalita = 'biglietti'
  quantita          integer,

  -- offerta con modalita = 'biglietti', eventi a data fissa
  titolo_evento     text,
  data_preferita    date,
  orario_preferito  text,

  messaggio         text,
  consenso_privacy  boolean not null,
  consenso_il       timestamptz not null,
  email_inviata     boolean not null default false,
  creata_il         timestamptz not null default now()
);

-- L'elenco in area riservata legge sempre dalla più recente.
create index richieste_creata_il_idx on richieste (creata_il desc);

alter table sedi      enable row level security;
alter table richieste enable row level security;

-- Le sale attive servono al modulo pubblico del cinema.
create policy "chiunque legge le sedi attive" on sedi
  for select to anon, authenticated using (attiva);
create policy "i redattori gestiscono le sedi" on sedi
  for all to authenticated using (e_redattore()) with check (e_redattore());

-- **Il riscontro è una politica, non un controllo dell'applicazione.**
--
-- Chi invia il modulo non ha una sessione, quindi l'inserimento passa dal
-- ruolo anonimo; senza questa clausola, chiunque potrebbe scrivere righe
-- chiamando l'API direttamente, saltando Turnstile e il riscontro, e
-- riempiendo di spazzatura l'elenco che i direttori esportano.
--
-- Con `risulta_socio` nella `with check`, è PostgreSQL a rifiutare la riga di
-- chi non è socio. Il controllo resta anche nel codice, perché lì può
-- diventare un messaggio in italiano invece di un errore; ma quello è per la
-- cortesia, questo è per la sicurezza.
create policy "solo i soci inviano richieste" on richieste
  for insert to anon, authenticated
  with check (risulta_socio(email, codice_dipendente));

-- Nessuna politica di select per gli anonimi, e non è una dimenticanza: una
-- richiesta contiene nome, matricola e recapiti di una persona. Le leggono i
-- direttori e nessun altro.
create policy "i redattori leggono le richieste" on richieste
  for select to authenticated using (e_redattore());
create policy "i redattori aggiornano le richieste" on richieste
  for update to authenticated using (e_redattore()) with check (e_redattore());
create policy "i redattori eliminano le richieste" on richieste
  for delete to authenticated using (e_redattore());
