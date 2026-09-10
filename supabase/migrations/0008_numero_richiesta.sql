-- Ogni richiesta prende un numero progressivo.
--
-- Serve all'oggetto dell'email che arriva ai direttori:
--
--   [CRAL ARES] #42 · 4 biglietti UCI Cinemas — Mario Rossi
--
-- L'id della riga è un UUID, e un UUID nell'oggetto di un'email è illeggibile:
-- non si dice al telefono, non si cerca nella casella, non si scrive su un
-- foglio. Il numero progressivo fa tutte e tre le cose, ed è il modo in cui
-- direttore e socio possono riferirsi alla stessa richiesta parlandone.
--
-- `generated always as identity` e non un contatore nostro: il numero lo
-- assegna il database al momento dell'inserimento, quindi due richieste
-- inviate nello stesso istante non possono prenderne uno uguale.
alter table richieste add column numero bigint generated always as identity;

-- Segnare che l'avviso ai direttori è partito.
--
-- Serve una funzione perché il ruolo anonimo — quello con cui gira la Server
-- Action che invia il modulo — non ha, e non deve avere, il permesso di
-- aggiornare `richieste`: con un `update` aperto, chiunque potrebbe riscrivere
-- la richiesta di un altro.
--
-- Questa funzione fa una cosa sola e su una riga sola: mette a vero
-- `email_inviata`. Anche volendo abusarne, il massimo che si otterrebbe è
-- nascondere un avviso mancato — e serve comunque l'UUID della richiesta, che
-- non si indovina e che conosce solo chi l'ha appena creata.
create function segna_avviso_inviato(richiesta_id uuid)
returns void
language sql
volatile
security definer
set search_path = public
as $$
  update richieste set email_inviata = true where id = richiesta_id;
$$;

revoke execute on function segna_avviso_inviato(uuid) from public;
grant  execute on function segna_avviso_inviato(uuid) to anon, authenticated;
