-- Le prime offerte vere del CRAL ARES, dal materiale del direttivo
-- (OneDrive del 14 settembre 2026). Generato, da rileggere prima di eseguire.
--
-- Le tre PUBBLICATE hanno il vantaggio scritto nero su bianco nei documenti.
-- Le dieci BOZZE hanno partner, contatti e scadenza veri, e «Da precisare»
-- al posto del vantaggio: quello lo sa il direttore, non il materiale.
-- Una bozza non è visibile ai soci: si completa dall'area riservata.

begin;

-- Via le otto offerte dimostrative: da qui in poi il sito dice cose vere.
delete from richieste where offerta_id is not null;
delete from offerte;

insert into offerte (slug, titolo, partner, categoria, vantaggio, descrizione_breve,
  descrizione, condizioni, valida_dal, valida_al, in_evidenza, modalita, istruzioni,
  indirizzo, telefono, email_partner, link_partner, stato) values
  ('farmacia-d-atri-20-su-farmaci-e-2026', 'Farmacia D''Atri', 'Farmacia D''Atri', 'Salute', '20% su farmaci e parafarmaco', 'Sconto del 20% su farmaci, parafarmaco e dispositivi medici, e fino al 40% sulla cosmesi.',
   'La farmacia D''Atri, in piazza Municipio, riserva ai soci del CRAL uno sconto del 20% su parafarmaco, farmaci di fascia A e C, farmaci da banco e dispositivi medici. Sulla cosmesi lo sconto va dal 20% al 40% secondo l''offerta del momento. È possibile la consegna a domicilio, e si possono ordinare i prodotti anche via WhatsApp.',
   array['Gli sconti non sono cumulabili con le promozioni già attive sui prodotti in offerta.', 'Comunica di appartenere al CRAL ARES al momento dell''ordine o alla cassa.', 'Per lo scontrino parlante o la fattura serve il codice fiscale.'], '2026-09-14', null, false, 'solo_sconto', 'Presentati in farmacia dicendo che sei socio del CRAL ARES. Per gli ordini a distanza scrivi su WhatsApp al 339 845 4886 indicando l''appartenenza al CRAL.',
   'Piazza Municipio 15 (Palazzo San Giacomo), 80133 Napoli', '081 552 4237', null, 'https://www.datri.it', 'pubblicata'),
  ('mattia-milone-broker-dal-10-al-15-sulle-2026', 'Mattia Milone Broker', 'Mattia Milone Broker', 'Assicurazioni', 'Dal 10% al 15% sulle polizze', 'Sconti dal 10% al 15% sulle polizze assicurative, secondo il ramo.',
   'Convenzione assicurativa riservata ai soci: gli sconti vanno dal 10% al 15% a seconda del tipo di polizza. Il referente per le convenzioni segue direttamente i soci del CRAL.',
   array['Lo sconto varia per ramo assicurativo: chiedi il preventivo indicando che sei socio.'], '2026-09-14', null, false, 'solo_sconto', 'Contatta il referente indicando che sei socio del CRAL ARES: ti prepara il preventivo convenzionato.',
   'Via Carafa 9, 80040 Cercola (NA)', '350 578 2841', 'carputoantonino@gmail.com', null, 'pubblicata'),
  ('teatro-bellini-ridotto-soci-da-27-2026', 'Teatro Bellini', 'Teatro Bellini', 'Teatro', 'Ridotto soci da 27 €', 'Biglietti ridotti per i soci su prosa e danza, in Sala Grande e al Piccolo Bellini.',
   'Il Teatro Bellini riserva ai soci condizioni agevolate sull''acquisto dei biglietti per gli spettacoli di prosa e danza della stagione 2026/2027, in Sala Grande e al Piccolo Bellini. A titolo di esempio: «Amleto2» a 34 € più prevendita invece di 38 €, «Le cinque rose di Jennifer» e «Finale di partita» a 27 € più prevendita invece di 30 €. Il ridotto vale per il venerdì e il sabato, sul miglior posto disponibile al momento dell''acquisto.',
   array['Sono esclusi gli spettacoli di musica e gli eventi collaterali.', 'Il ridotto vale per gli spettacoli del venerdì e del sabato.', 'Il posto è il migliore disponibile al momento dell''acquisto.'], '2026-09-14', '2027-07-30', false, 'solo_sconto', 'Acquista al botteghino o scrivi all''ufficio promozione indicando che sei socio del CRAL ARES.',
   null, '081 549 9688', 'promozione@teatrobellini.it', null, 'pubblicata'),
  ('teatro-diana-da-precisare-2026', 'Teatro Diana', 'Teatro Diana', 'Teatro', 'Da precisare', 'Convenzione rinnovata per la stagione 2026/2027.',
   'Convenzione rinnovata per la stagione teatrale 2026/2027. Per gli spettacoli di Salemme conviene concordare gli orari al botteghino al momento dell''acquisto dell''abbonamento.',
   array['Per gli spettacoli di Salemme concorda l''orario al botteghino.'], '2026-09-14', '2027-07-30', false, 'solo_sconto', null,
   null, '081 556 7527', 'segreteria@teatrodiana.it', null, 'bozza'),
  ('teatro-augusteo-da-precisare-2026', 'Teatro Augusteo', 'Teatro Augusteo', 'Teatro', 'Da precisare', 'Prezzi riservati ai soci sugli abbonamenti a turno.',
   'Prezzi riservati ai soci. Gli abbonamenti sono divisi in turni: A venerdì 21, C sabato 21, D domenica 18, E martedì 21, F mercoledì 18, G giovedì 21, H venerdì 21, I sabato 21, M domenica 18.',
   '{}', '2026-09-14', '2027-07-30', false, 'solo_sconto', null,
   null, '081 414243', 'teatroaugusteo.gruppi@gmail.com', null, 'bozza'),
  ('teatro-cilea-da-precisare-2026', 'Teatro Cilea', 'Teatro Cilea', 'Teatro', 'Da precisare', 'Convenzione attiva per la stagione teatrale.',
   'Convenzione attiva. Locandina della stagione e prezziario disponibili presso i direttori.',
   '{}', '2026-09-14', null, false, 'solo_sconto', null,
   null, '081 714 1801', 'info@teatrocilea.it', null, 'bozza'),
  ('cineteatro-acacia-da-precisare-2026', 'Cineteatro Acacia', 'Cineteatro Acacia', 'Teatro', 'Da precisare', 'Convenzione attiva.',
   'Convenzione attiva con il Cineteatro Acacia.',
   '{}', '2026-09-14', null, false, 'solo_sconto', null,
   null, '081 215 5639', 'info@cineteatroacacia.it', null, 'bozza'),
  ('teatro-mercadante-da-precisare-2026', 'Teatro Mercadante', 'Teatro Mercadante', 'Teatro', 'Da precisare', 'Convenzione in corso con il Teatro di Napoli.',
   'Convenzione con il Teatro di Napoli, che comprende il Mercadante.',
   '{}', '2026-09-14', null, false, 'solo_sconto', null,
   null, '081 552 4214', 'ufficiopromozione@teatrodinapoli.it', null, 'bozza'),
  ('teatro-san-ferdinando-da-precisare-2026', 'Teatro San Ferdinando', 'Teatro San Ferdinando', 'Teatro', 'Da precisare', 'Convenzione in corso con il Teatro di Napoli.',
   'Convenzione con il Teatro di Napoli, che comprende il San Ferdinando.',
   '{}', '2026-09-14', null, false, 'solo_sconto', null,
   null, '081 292030', 'ufficiopromozione@teatrodinapoli.it', null, 'bozza'),
  ('eureka-viaggi-da-precisare-2026', 'Eureka Viaggi', 'Eureka Viaggi', 'Viaggi', 'Da precisare', 'Biglietti Italo a tariffa Flex per i soci.',
   'Convenzione per l''acquisto di biglietti Italo a tariffa Flex.',
   '{}', '2026-09-14', null, false, 'solo_sconto', null,
   null, null, null, null, 'bozza'),
  ('trial-viaggi-da-precisare-2026', 'Trial Viaggi', 'Trial Viaggi', 'Viaggi', 'Da precisare', 'Voucher per traghetti e aliscafi verso le isole.',
   'Convenzione per l''acquisto di voucher per traghetti e aliscafi, e pacchetti per le isole.',
   '{}', '2026-09-14', '2027-02-28', false, 'solo_sconto', null,
   null, null, null, null, 'bozza'),
  ('chalet-la-terrasse-da-precisare-2026', 'Chalet La Terrasse', 'Chalet La Terrasse', 'Ristorazione', 'Da precisare', 'Caffetteria convenzionata al Vomero.',
   'Caffetteria in zona Vomero convenzionata con il CRAL.',
   '{}', '2026-09-14', null, false, 'solo_sconto', null,
   null, null, null, null, 'bozza'),
  ('napolielettrica-da-precisare-2026', 'Napolielettrica', 'Napolielettrica', 'Auto e moto', 'Da precisare', 'Acquisto di scooter e moto elettriche.',
   'Convenzione per l''acquisto di scooter e moto elettriche.',
   '{}', '2026-09-14', null, false, 'solo_sconto', null,
   null, null, null, null, 'bozza');

commit;
