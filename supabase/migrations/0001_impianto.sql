-- Fase 2 — impianto del database del CRAL ARES.
--
-- Le colonne qui sono quelle stabili: presenti in ogni ipotesi sui campi
-- dell'offerta. Titolo separato, prezzi strutturati e immagine restano fuori
-- in attesa del direttivo, in una migrazione futura non ancora numerata: la
-- 0002 è diventata 0002_accesso.sql e non li tocca.

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
