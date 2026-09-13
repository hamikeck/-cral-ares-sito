-- Il riscontro si stringe: email **e** matricola, sulla stessa persona.
--
-- La regola precedente accettava uno dei due campi, e con la sola matricola si
-- entrava. Le due chiavi però non si equivalgono: un'email non si indovina,
-- una matricola sì — sono numeri vicini fra loro, e chi ne conosce una conosce
-- quasi tutte quelle dei colleghi.
--
-- Il danno non è il fastidio di una richiesta finta. Il modulo del cinema
-- chiede **dove** consegnare i biglietti, e fra le risposte c'è «su un'altra
-- email»: chi indovina una matricola si fa mandare i biglietti di un collega
-- sulla propria casella. È un furto, non del rumore.
--
-- La larghezza precedente era stata decisa il 3 settembre 2026 per non
-- respingere il socio che scriveva dall'indirizzo personale. Quel motivo è
-- venuto meno con la riunione dell'8 settembre: da allora l'email aziendale
-- **identifica** e la consegna è una domanda a parte, quindi si può chiedere
-- l'indirizzo giusto senza togliere niente a nessuno.
--
-- I due campi devono appartenere **alla stessa riga**: l'email di uno e la
-- matricola di un altro non fanno un socio.
--
-- Resta vero che un campo vuoto non combacia mai, e resta vero che il
-- confronto perdona la battitura — maiuscole nell'email, spazi nella matricola
-- — con le stesse regole degli indici unici della migrazione 0004.
create or replace function risulta_socio(email_richiedente text, matricola_richiedente text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with chiavi as (
    select
      nullif(btrim(lower(email_richiedente)), '')                        as email,
      nullif(upper(replace(btrim(matricola_richiedente), ' ', '')), '')  as matricola
  )
  select exists (
    select 1
    from soci, chiavi
    where chiavi.email is not null
      and chiavi.matricola is not null
      and lower(soci.email) = chiavi.email
      and upper(replace(soci.codice_dipendente, ' ', '')) = chiavi.matricola
  );
$$;
