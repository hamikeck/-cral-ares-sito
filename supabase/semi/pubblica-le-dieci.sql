-- Pubblica le dieci convenzioni rimaste in bozza — 15 settembre 2026
--
-- Le dieci schede avevano partner, contatti e scadenze veri, e «Da precisare»
-- al posto del vantaggio: il direttivo non aveva ancora comunicato quanto
-- risparmia un socio. Su decisione del committente escono lo stesso, con un
-- vantaggio **qualitativo** al posto della cifra, per dare corpo al sito
-- prima che arrivino i numeri.
--
-- Il vantaggio non deve essere una cifra: `offertaSchema.ts` chiede solo che
-- ci sia e che stia in 60 caratteri. «Sconto riservato ai soci» è valido
-- quanto «-30%», e per i teatri dove il prezzo cambia a ogni spettacolo è
-- perfino più onesto di un numero solo.
--
-- CAMBIA ANCHE LO SLUG, e non è una libertà che ci si può prendere sempre.
-- Lo slug porta dentro il vantaggio (`slugOfferta`), quindi quelle schede
-- vivrebbero su indirizzi come `/offerte/teatro-diana-da-precisare-2026`.
-- La regola del progetto dice che in modifica lo slug non cambia mai, perché
-- è l'indirizzo che i direttori incollano nelle email. Qui si può: sono
-- bozze, non sono mai state visibili a nessuno, e nessun link è mai uscito.
-- È l'ultimo momento in cui cambiarlo è gratis.
--
-- Da incollare nel SQL Editor del pannello Supabase, come l'import dei soci:
-- nel progetto non entra nessuna credenziale di scrittura.

begin;

-- Teatro Diana
update offerte set
  slug      = $t$teatro-diana-sconto-riservato-ai-soci-2026$t$,
  vantaggio = $t$Sconto riservato ai soci$t$,
  stato     = $t$pubblicata$t$
where slug = $t$teatro-diana-da-precisare-2026$t$;

-- Teatro Augusteo
update offerte set
  slug      = $t$teatro-augusteo-prezzi-riservati-sugli-2026$t$,
  vantaggio = $t$Prezzi riservati sugli abbonamenti$t$,
  stato     = $t$pubblicata$t$
where slug = $t$teatro-augusteo-da-precisare-2026$t$;

-- Teatro Cilea
update offerte set
  slug      = $t$teatro-cilea-sconto-riservato-ai-soci-2026$t$,
  vantaggio = $t$Sconto riservato ai soci$t$,
  stato     = $t$pubblicata$t$
where slug = $t$teatro-cilea-da-precisare-2026$t$;

-- Cineteatro Acacia
update offerte set
  slug      = $t$cineteatro-acacia-sconto-riservato-ai-2026$t$,
  vantaggio = $t$Sconto riservato ai soci$t$,
  stato     = $t$pubblicata$t$
where slug = $t$cineteatro-acacia-da-precisare-2026$t$;

-- Teatro Mercadante
update offerte set
  slug      = $t$teatro-mercadante-ridotto-soci-col-2026$t$,
  vantaggio = $t$Ridotto soci col Teatro di Napoli$t$,
  stato     = $t$pubblicata$t$
where slug = $t$teatro-mercadante-da-precisare-2026$t$;

-- Teatro San Ferdinando
update offerte set
  slug      = $t$teatro-san-ferdinando-ridotto-soci-col-2026$t$,
  vantaggio = $t$Ridotto soci col Teatro di Napoli$t$,
  stato     = $t$pubblicata$t$
where slug = $t$teatro-san-ferdinando-da-precisare-2026$t$;

-- Eureka Viaggi
update offerte set
  slug      = $t$eureka-viaggi-italo-a-tariffa-flex-per-2026$t$,
  vantaggio = $t$Italo a tariffa Flex per i soci$t$,
  stato     = $t$pubblicata$t$
where slug = $t$eureka-viaggi-da-precisare-2026$t$;

-- Trial Viaggi
update offerte set
  slug      = $t$trial-viaggi-voucher-traghetti-e-2026$t$,
  vantaggio = $t$Voucher traghetti e aliscafi$t$,
  stato     = $t$pubblicata$t$
where slug = $t$trial-viaggi-da-precisare-2026$t$;

-- Chalet La Terrasse
update offerte set
  slug      = $t$chalet-la-terrasse-sconto-riservato-ai-2026$t$,
  vantaggio = $t$Sconto riservato ai soci$t$,
  stato     = $t$pubblicata$t$
where slug = $t$chalet-la-terrasse-da-precisare-2026$t$;

-- Napolielettrica
-- Resta senza data di fine: nel foglio delle convenzioni è vuota, e nel
-- progetto una scadenza assente vuol dire «senza scadenza», non «scaduta».
update offerte set
  slug      = $t$napolielettrica-sconto-su-scooter-e-2026$t$,
  vantaggio = $t$Sconto su scooter e moto elettriche$t$,
  stato     = $t$pubblicata$t$
where slug = $t$napolielettrica-da-precisare-2026$t$;

-- Controllo prima di confermare. Devono risultare: 13 pubblicate, 0 bozze,
-- 0 «Da precisare» e 0 slug sporchi. Se i numeri non tornano, `rollback`
-- invece di `commit` e non è successo niente.
select
  count(*) filter (where stato = $t$pubblicata$t$)             as pubblicate,
  count(*) filter (where stato = $t$bozza$t$)                  as bozze,
  count(*) filter (where vantaggio ilike $t$%da precisare%$t$) as da_precisare,
  count(*) filter (where slug like $t$%da-precisare%$t$)       as slug_sporchi
from offerte;

commit;
