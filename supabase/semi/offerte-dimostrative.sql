-- Dati di sviluppo, NON di produzione. Prima di andare online su cralares.it:
--   delete from offerte;
-- Le otto offerte sono le stesse mostrate al direttivo il 3 settembre, oggi
-- in web/src/contenuti/offerteEsempio.ts.

insert into redattori (email, nome, ruolo) values
  ('ilmiogestoreattivita@gmail.com', 'Michele Cacciapuoti', 'Sviluppatore');

insert into circuiti (nome, ordine) values
  ('UCI Cinemas', 1),
  ('The Space Cinema', 2);

insert into offerte
  (slug, partner, categoria, vantaggio, descrizione_breve, descrizione,
   condizioni, valida_dal, valida_al, in_evidenza, modalita, istruzioni, stato)
values
  ('uci-cinemas-ingresso-ridotto', 'UCI Cinemas', 'Cinema',
   '6,50 € invece di 9,50',
   'Ingresso ridotto in tutte le sale del circuito, tutti i giorni della settimana.',
   'Il CRAL acquista biglietti a tariffa convenzionata per tutte le sale del circuito UCI. Valgono tutti i giorni della settimana, festivi compresi, e non hanno vincoli di orario. Gli spettacoli in 3D richiedono il supplemento occhiali, che si paga in sala.',
   array[
     'Ogni socio può richiedere fino a 6 biglietti al mese.',
     'I biglietti si ritirano in sede negli orari di apertura.',
     'Non sono rimborsabili, ma non hanno scadenza entro l’anno solare.'
   ],
   '2026-09-01', '2026-09-30', true, 'biglietti', null, 'pubblicata'),

  ('the-space-carnet', 'The Space Cinema', 'Cinema',
   'Carnet da 5 ingressi, 30 €',
   'Cinque ingressi da usare quando vuoi entro un anno, anche in più persone.',
   'Un carnet da cinque ingressi a 30 €, cioè 6 € a biglietto invece di 9. Gli ingressi si possono usare tutti insieme lo stesso giorno — utile per andare al cinema in famiglia — oppure distribuirli nell’arco dell’anno.',
   array[
     'Il carnet è nominativo ma gli ingressi sono cedibili.',
     'Valido dodici mesi dalla data di emissione.',
     'Non utilizzabile per anteprime ed eventi speciali.'
   ],
   '2026-09-01', '2026-12-31', false, 'biglietti', null, 'pubblicata'),

  ('teatro-diana-stagione-prosa', 'Teatro Diana', 'Teatro',
   'Poltronissima a 18 € invece di 32 €',
   'Riduzione riservata ai soci sull’intera stagione di prosa, da ottobre a maggio.',
   'La riduzione vale su tutti gli spettacoli della stagione di prosa, nei posti di poltronissima. I posti sono limitati e assegnati in ordine di richiesta: per gli spettacoli più richiesti conviene farsi vivi con qualche settimana di anticipo.',
   array[
     'Massimo quattro posti a socio per spettacolo.',
     'La richiesta va inviata almeno dieci giorni prima della data.',
     'Il pagamento avviene al ritiro dei biglietti.'
   ],
   '2026-09-01', '2026-10-15', false, 'biglietti', null, 'pubblicata'),

  ('pneumatici-esposito', 'Pneumatici Esposito', 'Auto',
   '20% sul cambio stagionale',
   'Sconto su pneumatici, montaggio ed equilibratura mostrando la tessera.',
   'Sconto del 20% su pneumatici di tutte le marche trattate, montaggio ed equilibratura compresi. La convenzione copre anche il deposito stagionale degli pneumatici smontati, che è gratuito per i soci.',
   array[
     'Sconto non cumulabile con altre promozioni in corso.',
     'Occorre esibire la tessera del CRAL prima del preventivo.'
   ],
   '2026-09-01', '2026-11-30', false, 'solo_sconto',
   'Presentati in officina con la tessera del CRAL e chiedi il preventivo convenzionato. Non serve prenotare dal sito.',
   'pubblicata'),

  ('assicurazione-auto-convenzione', 'Agenzia Partenope Assicurazioni', 'Auto',
   'Fino al 30% sulla RC auto',
   'Preventivo riservato ai soci su polizze auto, moto e infortuni.',
   'L’agenzia riserva ai soci del CRAL una scontistica dedicata sulle polizze auto e moto, e sulle coperture infortuni per la famiglia. Lo sconto effettivo dipende dalla classe di merito e dal tipo di veicolo: il preventivo è gratuito e non impegna a nulla.',
   array[
     'La convenzione vale anche per i familiari conviventi.',
     'Il preventivo viene inviato entro due giorni lavorativi.'
   ],
   '2026-09-01', '2026-12-31', false, 'convenzione', null, 'pubblicata'),

  ('farmacia-vesuvio-parafarmaco', 'Farmacia Vesuvio', 'Salute',
   '15% su parafarmaco e cosmesi',
   'Sconto immediato alla cassa su prodotti da banco, cosmesi e integratori.',
   'Lo sconto si applica a tutto il reparto parafarmaco: integratori, cosmesi, prodotti per l’infanzia e articoli sanitari. Restano esclusi i farmaci con obbligo di ricetta, il cui prezzo è fissato per legge.',
   array[
     'Sconto applicato direttamente alla cassa.',
     'Esclusi i farmaci con obbligo di ricetta.'
   ],
   '2026-09-01', '2026-12-31', false, 'solo_sconto',
   'Mostra la tessera del CRAL alla cassa prima del pagamento. Lo sconto viene applicato subito.',
   'pubblicata'),

  ('palestra-acquachiara-abbonamento', 'Centro sportivo Acquachiara', 'Sport',
   'Iscrizione gratuita e 25% sull’abbonamento',
   'Sala pesi, corsi e piscina, con quota di iscrizione azzerata per i soci.',
   'La convenzione azzera la quota di iscrizione, che per i non soci è di 60 €, e applica il 25% di sconto sugli abbonamenti trimestrali e annuali. Comprende sala pesi, corsi in sala e accesso alla piscina negli orari di nuoto libero.',
   array[
     'Sconto valido su abbonamenti trimestrali e annuali.',
     'Il certificato medico sportivo resta a carico del socio.'
   ],
   '2026-09-01', '2026-10-31', false, 'convenzione', null, 'pubblicata'),

  ('mostra-caravaggio-terminata', 'Palazzo Reale', 'Teatro',
   'Ingresso 5 € invece di 13 €',
   'Riduzione sulla mostra estiva, riservata ai soci e a un accompagnatore.',
   'La convenzione valeva per l’intera durata della mostra, con ingresso ridotto per il socio e per un accompagnatore. È terminata con la chiusura dell’esposizione.',
   array[
     'Ingresso ridotto valido anche per un accompagnatore.'
   ],
   '2026-06-01', '2026-08-31', false, 'solo_sconto',
   'La mostra è chiusa. La scheda resta consultabile per chi arriva da un vecchio collegamento.',
   'pubblicata');
