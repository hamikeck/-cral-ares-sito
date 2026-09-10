-- Fase 4 — il riscontro: chi può inviare una richiesta.
--
-- La regola vive **qui e non nel codice**, per la stessa ragione per cui ci
-- vive `e_redattore()`: sta dove stanno i dati, e non c'è modo di aggirarla
-- scrivendo una query diversa. Il modulo pubblico chiede al database «questa
-- persona risulta?» e riceve un sì o un no.
--
-- `security definer` perché la funzione deve poter leggere `soci`, che le
-- politiche RLS rendono invisibile a chiunque non sia un redattore, e quella
-- invisibilità è il punto: l'anagrafica è l'elenco nominativo dei dipendenti
-- di un ufficio pubblico. La funzione **non restituisce mai una riga** — né il
-- nome, né l'id, né quale dei due campi ha combaciato. Solo vero o falso.
--
-- Il confronto è quello degli indici unici della `0004`: email senza
-- maiuscole, matricola senza spazi e in maiuscolo. Le tre normalizzazioni —
-- indici, questa funzione, `normalizzaEmail`/`normalizzaMatricola` nel codice
-- — devono restare identiche: se divergono, una persona risulta socia in un
-- punto e sconosciuta nell'altro.
--
-- **Basta uno dei due campi**, ed è deliberato (spec 9.1): chi scrive
-- dall'indirizzo personale viene riconosciuto dalla matricola, chi sbaglia una
-- cifra della matricola viene riconosciuto dall'email. Un campo vuoto non
-- combacia mai: senza il controllo, due stringhe vuote sono uguali fra loro e
-- un socio con un campo non compilato diventerebbe la chiave che apre a
-- chiunque lasci lo stesso campo in bianco.
create function risulta_socio(email_richiedente text, matricola_richiedente text)
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
    where (chiavi.email is not null and lower(soci.email) = chiavi.email)
       or (
         chiavi.matricola is not null
         and upper(replace(soci.codice_dipendente, ' ', '')) = chiavi.matricola
       )
  );
$$;

-- La chiama il modulo pubblico, quindi anche un anonimo. È un rischio
-- riconosciuto e messo in conto (spec 9.3): una funzione che risponde «sì» o
-- «no» su un indirizzo è, tecnicamente, un modo per scoprire se quell'email
-- appartiene a un dipendente. Si chiude con Turnstile e con un limite di
-- tentativi per indirizzo IP sull'endpoint d'invio, non togliendo il permesso
-- — senza, il modulo non potrebbe funzionare.
revoke execute on function risulta_socio(text, text) from public;
grant  execute on function risulta_socio(text, text) to anon, authenticated;
