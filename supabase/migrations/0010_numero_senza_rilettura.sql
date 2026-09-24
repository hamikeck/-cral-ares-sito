-- Il numero di una richiesta appena inserita, senza poterla rileggere.
--
-- Dall'11 al 24 settembre 2026 **nessuna richiesta è stata salvata.** La
-- Server Action inseriva la riga chiedendone indietro `id` e `numero`
-- (`.insert().select().single()`), cioè un INSERT … RETURNING. Con le
-- politiche attive, PostgreSQL pretende che la riga restituita passi anche la
-- politica di **lettura**, e il ruolo anonimo non ne ha nessuna su
-- `richieste` — di proposito, vedi la migrazione 0006. Risultato: 42501 a ogni
-- invio, che il codice traduceva in «Non risulti fra i soci». Le prove non se
-- ne accorgevano perché simulavano un database che restituiva sempre la riga.
--
-- La correzione non tocca le politiche: l'anonimo continua a non leggere
-- niente. L'id lo sceglie ora il server prima di inserire, e il numero, che
-- serve all'oggetto dell'email dei direttori, lo chiede a questa funzione.
--
-- È lo stesso schema di `segna_avviso_inviato` (0008): una cosa sola, su una
-- riga sola, a chi conosce l'UUID — che non si indovina e che conosce solo
-- chi ha appena creato la riga. E restituisce solo un numero progressivo, che
-- non dice niente di nessuno.
create function numero_richiesta(richiesta_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select numero from richieste where id = richiesta_id;
$$;

revoke execute on function numero_richiesta(uuid) from public;
grant  execute on function numero_richiesta(uuid) to anon, authenticated;
