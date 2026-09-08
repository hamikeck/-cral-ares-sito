-- Un'offerta può non avere una data di fine: le convenzioni permanenti non ne
-- hanno una, e costringere il direttore a inventarsela produce una scadenza
-- falsa che il sito poi ripete ai soci.
--
-- Il vincolo `offerte_validita_coerente` non va toccato: in SQL un confronto
-- con NULL vale NULL, e un CHECK che vale NULL passa. Una riga senza data di
-- fine lo attraversa senza bisogno di eccezioni.
alter table offerte alter column valida_al drop not null;
