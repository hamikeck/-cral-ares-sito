-- Le limitazioni di un circuito, e il suo sito.
--
-- Il riepilogo del direttivo (23 settembre 2026) non porta solo i prezzi:
-- porta i vincoli, e sono la parte che il socio deve conoscere PRIMA di
-- chiedere. «Escluso offerte e promozioni» vale per tutti; per i voucher
-- cartacei di Cinema Campania ce ne sono quattro di fila — niente periodo
-- natalizio in quattro cinema, niente sala 2 all'America Hall e al Vittoria,
-- niente festivi nelle sale 2 e 3 del Filangieri. Scoprirli al botteghino,
-- con il voucher già ritirato, è il modo peggiore di scoprirli.
--
-- `note` è testo libero e non un elenco di regole: nessuno le applica, le
-- legge il socio. Il sistema non sa cosa sia il «periodo natalizio», e non
-- deve saperlo.
--
-- `sito` sta sul circuito e non sulla sala: `sedi.link_programmazione` c'è
-- già, ma vale per una sala sola, e due dei cinque circuiti valgono in tutte
-- le sale d'Italia senza che noi le si possa elencare. Il sito del circuito è
-- l'unico posto dove quella programmazione esiste davvero.

-- `if not exists` perché questa migrazione è stata rilanciata a mano nel SQL
-- Editor dopo che il seme era partito per primo: senza, il secondo tentativo
-- muore su «column already exists» e chi la lancia non sa più a che punto è.
alter table circuiti add column if not exists note text;
alter table circuiti add column if not exists sito text;

comment on column circuiti.note is
  'Limitazioni e modo di consegna, come li scrive il direttivo. Testo per il socio, non regole applicate dal sistema.';
comment on column circuiti.sito is
  'Il sito del circuito, dove il socio guarda cosa danno. Per le sale singole c’è sedi.link_programmazione.';
