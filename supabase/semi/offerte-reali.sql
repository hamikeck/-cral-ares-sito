-- Le prime offerte vere del CRAL ARES, dal materiale del direttivo
-- (OneDrive del 14 settembre 2026).
--
-- Le tre PUBBLICATE hanno il vantaggio scritto nero su bianco nei documenti.
-- Le altre dieci avevano «Da precisare» al posto del vantaggio, perché quello
-- lo sa il direttore e il materiale no. Il 15 settembre sono state pubblicate
-- lo stesso, su decisione del committente, con un vantaggio **qualitativo**
-- — «Sconto riservato ai soci» e simili — in attesa delle cifre vere. Lo
-- script applicato al database è `pubblica-le-dieci.sql`, che spiega anche
-- perché in quell'occasione si poteva cambiare lo slug.
--
-- Le colonne sono quelle della migrazione 0001, non quelle dello spec: non
-- esistono né `titolo` né `email_partner`, perché il direttivo ha confermato
-- gli otto campi l$t$8 settembre. Le email dei partner stanno nelle istruzioni,
-- che è dove al socio servono.

begin;

-- Via le otto offerte dimostrative: da qui in poi il sito dice cose vere.
delete from richieste where offerta_id is not null;
delete from offerte;

insert into offerte (slug, partner, categoria, vantaggio, descrizione_breve, descrizione,
  condizioni, valida_dal, valida_al, in_evidenza, modalita, istruzioni,
  indirizzo, telefono, link_partner, stato) values
  ($t$farmacia-d-atri-20-su-farmaci-e-2026$t$, $t$Farmacia D'Atri$t$, $t$Salute$t$, $t$20% su farmaci e parafarmaco$t$, $t$Sconto del 20% su farmaci, parafarmaco e dispositivi medici, e fino al 40% sulla cosmesi.$t$,
   $t$La farmacia D'Atri, in piazza Municipio, riserva ai soci del CRAL uno sconto del 20% su parafarmaco, farmaci di fascia A e C, farmaci da banco e dispositivi medici. Sulla cosmesi lo sconto va dal 20% al 40% secondo l'offerta del momento. È possibile la consegna a domicilio, e si possono ordinare i prodotti anche via WhatsApp.$t$,
   array[$t$Gli sconti non sono cumulabili con le promozioni già attive sui prodotti in offerta.$t$, $t$Comunica di appartenere al CRAL ARES al momento dell'ordine o alla cassa.$t$, $t$Per lo scontrino parlante o la fattura serve il codice fiscale.$t$], $t$2026-09-14$t$, null, false, $t$solo_sconto$t$, $t$Presentati in farmacia dicendo che sei socio del CRAL ARES. Per gli ordini a distanza scrivi su WhatsApp al 339 845 4886 indicando l'appartenenza al CRAL.$t$,
   $t$Piazza Municipio 15 (Palazzo San Giacomo), 80133 Napoli$t$, $t$081 552 4237$t$, $t$https://www.datri.it$t$, $t$pubblicata$t$),
  ($t$mattia-milone-broker-dal-10-al-15-sulle-2026$t$, $t$Mattia Milone Broker$t$, $t$Assicurazioni$t$, $t$Dal 10% al 15% sulle polizze$t$, $t$Sconti dal 10% al 15% sulle polizze assicurative, secondo il ramo.$t$,
   $t$Convenzione assicurativa riservata ai soci: gli sconti vanno dal 10% al 15% a seconda del tipo di polizza. Il referente per le convenzioni segue direttamente i soci del CRAL.$t$,
   array[$t$Lo sconto varia per ramo assicurativo: chiedi il preventivo indicando che sei socio.$t$], $t$2026-09-14$t$, null, false, $t$solo_sconto$t$, $t$Scrivi a carputoantonino@gmail.com o chiama il 350 578 2841 dicendo che sei socio del CRAL ARES: ti preparano il preventivo convenzionato.$t$,
   $t$Via Carafa 9, 80040 Cercola (NA)$t$, $t$350 578 2841$t$, null, $t$pubblicata$t$),
  ($t$teatro-bellini-ridotto-soci-da-27-2026$t$, $t$Teatro Bellini$t$, $t$Teatro$t$, $t$Ridotto soci da 27 €$t$, $t$Biglietti ridotti per i soci su prosa e danza, in Sala Grande e al Piccolo Bellini.$t$,
   $t$Il Teatro Bellini riserva ai soci condizioni agevolate sull'acquisto dei biglietti per gli spettacoli di prosa e danza della stagione 2026/2027, in Sala Grande e al Piccolo Bellini. A titolo di esempio: «Amleto2» a 34 € più prevendita invece di 38 €, «Le cinque rose di Jennifer» e «Finale di partita» a 27 € più prevendita invece di 30 €. Il ridotto vale per il venerdì e il sabato, sul miglior posto disponibile al momento dell'acquisto.$t$,
   array[$t$Sono esclusi gli spettacoli di musica e gli eventi collaterali.$t$, $t$Il ridotto vale per gli spettacoli del venerdì e del sabato.$t$, $t$Il posto è il migliore disponibile al momento dell'acquisto.$t$], $t$2026-09-14$t$, $t$2027-07-30$t$, false, $t$solo_sconto$t$, $t$Acquista al botteghino, oppure scrivi a promozione@teatrobellini.it indicando che sei socio del CRAL ARES.$t$,
   null, $t$081 549 9688$t$, $t$https://www.teatrobellini.it$t$, $t$pubblicata$t$),
  ($t$teatro-diana-sconto-riservato-ai-soci-2026$t$, $t$Teatro Diana$t$, $t$Teatro$t$, $t$Sconto riservato ai soci$t$, $t$Convenzione rinnovata per la stagione 2026/2027.$t$,
   $t$Convenzione rinnovata per la stagione teatrale 2026/2027. Per gli spettacoli di Salemme conviene concordare gli orari al botteghino al momento dell'acquisto dell'abbonamento.$t$,
   array[$t$Per gli spettacoli di Salemme concorda l'orario al botteghino.$t$], $t$2026-09-14$t$, $t$2027-07-30$t$, false, $t$solo_sconto$t$, $t$Contatto del teatro: segreteria@teatrodiana.it, 081 556 7527.$t$,
   null, $t$081 556 7527$t$, null, $t$pubblicata$t$),
  ($t$teatro-augusteo-prezzi-riservati-sugli-2026$t$, $t$Teatro Augusteo$t$, $t$Teatro$t$, $t$Prezzi riservati sugli abbonamenti$t$, $t$Prezzi riservati ai soci sugli abbonamenti a turno.$t$,
   $t$Prezzi riservati ai soci. Gli abbonamenti sono divisi in turni: A venerdì 21, C sabato 21, D domenica 18, E martedì 21, F mercoledì 18, G giovedì 21, H venerdì 21, I sabato 21, M domenica 18.$t$,
   '{}', $t$2026-09-14$t$, $t$2027-07-30$t$, false, $t$solo_sconto$t$, $t$Contatto del teatro: teatroaugusteo.gruppi@gmail.com, 081 414243.$t$,
   null, $t$081 414243$t$, null, $t$pubblicata$t$),
  ($t$teatro-cilea-sconto-riservato-ai-soci-2026$t$, $t$Teatro Cilea$t$, $t$Teatro$t$, $t$Sconto riservato ai soci$t$, $t$Convenzione attiva per la stagione teatrale.$t$,
   $t$Convenzione attiva. Locandina della stagione e prezziario disponibili presso i direttori.$t$,
   '{}', $t$2026-09-14$t$, null, false, $t$solo_sconto$t$, $t$Contatto del teatro: info@teatrocilea.it, 081 714 1801.$t$,
   null, $t$081 714 1801$t$, null, $t$pubblicata$t$),
  ($t$cineteatro-acacia-sconto-riservato-ai-2026$t$, $t$Cineteatro Acacia$t$, $t$Teatro$t$, $t$Sconto riservato ai soci$t$, $t$Convenzione attiva.$t$,
   $t$Convenzione attiva con il Cineteatro Acacia.$t$,
   '{}', $t$2026-09-14$t$, null, false, $t$solo_sconto$t$, $t$Contatto del teatro: info@cineteatroacacia.it, 081 215 5639.$t$,
   null, $t$081 215 5639$t$, null, $t$pubblicata$t$),
  ($t$teatro-mercadante-ridotto-soci-col-2026$t$, $t$Teatro Mercadante$t$, $t$Teatro$t$, $t$Ridotto soci col Teatro di Napoli$t$, $t$Convenzione in corso con il Teatro di Napoli.$t$,
   $t$Convenzione con il Teatro di Napoli, che comprende il Mercadante.$t$,
   '{}', $t$2026-09-14$t$, null, false, $t$solo_sconto$t$, $t$Contatto: ufficiopromozione@teatrodinapoli.it, 081 552 4214.$t$,
   null, $t$081 552 4214$t$, null, $t$pubblicata$t$),
  ($t$teatro-san-ferdinando-ridotto-soci-col-2026$t$, $t$Teatro San Ferdinando$t$, $t$Teatro$t$, $t$Ridotto soci col Teatro di Napoli$t$, $t$Convenzione in corso con il Teatro di Napoli.$t$,
   $t$Convenzione con il Teatro di Napoli, che comprende il San Ferdinando.$t$,
   '{}', $t$2026-09-14$t$, null, false, $t$solo_sconto$t$, $t$Contatto: ufficiopromozione@teatrodinapoli.it, 081 292030.$t$,
   null, $t$081 292030$t$, null, $t$pubblicata$t$),
  ($t$eureka-viaggi-italo-a-tariffa-flex-per-2026$t$, $t$Eureka Viaggi$t$, $t$Viaggi$t$, $t$Italo a tariffa Flex per i soci$t$, $t$Biglietti Italo a tariffa Flex per i soci.$t$,
   $t$Convenzione per l'acquisto di biglietti Italo a tariffa Flex.$t$,
   '{}', $t$2026-09-14$t$, null, false, $t$solo_sconto$t$, null,
   null, null, null, $t$pubblicata$t$),
  ($t$trial-viaggi-voucher-traghetti-e-2026$t$, $t$Trial Viaggi$t$, $t$Viaggi$t$, $t$Voucher traghetti e aliscafi$t$, $t$Voucher per traghetti e aliscafi verso le isole.$t$,
   $t$Convenzione per l'acquisto di voucher per traghetti e aliscafi, e pacchetti per le isole.$t$,
   '{}', $t$2026-09-14$t$, $t$2027-02-28$t$, false, $t$solo_sconto$t$, null,
   null, null, null, $t$pubblicata$t$),
  ($t$chalet-la-terrasse-sconto-riservato-ai-2026$t$, $t$Chalet La Terrasse$t$, $t$Ristorazione$t$, $t$Sconto riservato ai soci$t$, $t$Caffetteria convenzionata al Vomero.$t$,
   $t$Caffetteria in zona Vomero convenzionata con il CRAL.$t$,
   '{}', $t$2026-09-14$t$, null, false, $t$solo_sconto$t$, null,
   null, null, null, $t$pubblicata$t$),
  ($t$napolielettrica-sconto-su-scooter-e-2026$t$, $t$Napolielettrica$t$, $t$Auto e moto$t$, $t$Sconto su scooter e moto elettriche$t$, $t$Acquisto di scooter e moto elettriche.$t$,
   $t$Convenzione per l'acquisto di scooter e moto elettriche.$t$,
   '{}', $t$2026-09-14$t$, null, false, $t$solo_sconto$t$, null,
   null, null, null, $t$pubblicata$t$);

commit;
