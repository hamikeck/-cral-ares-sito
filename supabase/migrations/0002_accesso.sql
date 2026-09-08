-- `e_redattore()` viene chiamata anche dall'applicazione, via RPC, per sapere
-- se la sessione corrente può entrare nell'area riservata. Un anonimo non deve
-- poterla interrogare: sarebbe un modo per scoprire chi è direttore.
revoke execute on function e_redattore() from anon, public;
grant  execute on function e_redattore() to authenticated;
