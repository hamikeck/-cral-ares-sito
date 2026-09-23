-- I circuiti del cinema, quelli veri — 23 settembre 2026
--
-- Dal riepilogo mandato dal direttivo: cinque circuiti con i prezzi per i
-- soci, le sale e le limitazioni. Fino a oggi nel modulo c'erano due nomi
-- finti senza prezzo e senza sale, arrivati dai semi dimostrativi: «UCI
-- Cinemas» e «The Space Cinema». Con questo script il modulo dei biglietti
-- diventa vero, ed è il servizio su cui gira tutto il CRAL.
--
-- Va applicato DOPO la migrazione 0009, che aggiunge `note` e `sito`.
--
-- Due cose decise scrivendolo, e vale la pena scriverle:
--
-- 1. **Lo stesso marchio può essere due circuiti.** The Space costa 5,00 € in
--    Campania e 5,30 € nel resto d'Italia, e il prezzo nel database sta sul
--    circuito, non sulla sala. Diventano due voci, ciascuna con il suo
--    prezzo, perché la richiesta del socio deve portare l'importo giusto: il
--    server lo ricalcola da qui e finisce nella causale del bonifico.
--    UCI invece costa 6,50 € dappertutto, quindi resta una voce sola con
--    Casoria e Marcianise fra le sale.
--
-- 2. **Il C+C non entra.** Nel riepilogo c'era — Metropolitan a Napoli,
--    Eurcine, Giulio Cesare, Nuovo Olimpia e 4 Fontane a Roma, 6,50 € e solo
--    2D — ma la convenzione non è più valida (detto dal committente il 23
--    settembre). Un circuito scaduto nel menu è una richiesta che il
--    direttore dovrà rifiutare a mano.
--
-- Da incollare nel SQL Editor del pannello Supabase: nel progetto non entra
-- nessuna credenziale di scrittura.

begin;

-- Si spengono tutti e si riaccendono solo quelli veri. Così i due nomi finti
-- spariscono dal modulo senza cancellarli: le richieste già inviate puntano a
-- `circuito_id`, e cancellare la riga porterebbe via anche quelle.
update circuiti set attivo = false;

-- `on conflict (nome)` invece di `insert`: «UCI Cinemas» esiste già con quel
-- nome dai semi dimostrativi, e va aggiornata, non duplicata.
insert into circuiti (nome, prezzo_socio, ordine, attivo, sito, note) values
  ($t$Stella Film$t$, 4.50, 1, true, $t$https://www.stellafilm.it$t$,
   $t$Voucher elettronico. Vale per i film 2D e 3D tutti i giorni, sabato, domenica e festivi compresi, con prenotazione gratuita del posto. Escluse offerte e promozioni.$t$),

  ($t$Cinema Campania (voucher cartaceo)$t$, 4.50, 2, true, $t$https://www.intercral.com/convenzioni.htm$t$,
   $t$Voucher cartaceo: si ritira, non arriva per email. Vale per i film 2D e 3D tutti i giorni, festivi compresi, escluse offerte e promozioni. NON vale nel periodo natalizio al Filangieri, all'America Hall, al Partenio e al Torrevillage; non vale nella sala 2 dell'America Hall e del Vittoria; non vale nelle sale 2 e 3 del Filangieri nei giorni festivi e prefestivi. Lo stesso voucher vale anche da McDonald's, Terme di Agnano, Scaturchio, DiscoBowling, Tennis Rama Club, Ascot, Lido Noah, Lido Ideal e Tennis Club Varcaturo.$t$),

  ($t$The Space Cinema — Campania$t$, 5.00, 3, true, $t$https://www.thespacecinema.it$t$,
   $t$Voucher elettronico, valido nelle tre sale campane. Vale per i film 2D e 3D tutti i giorni, sabato, domenica e festivi compresi, con prenotazione gratuita del posto. Escluse offerte e promozioni.$t$),

  ($t$The Space Cinema — resto d'Italia$t$, 5.30, 4, true, $t$https://www.thespacecinema.it$t$,
   $t$Voucher elettronico, valido in tutte le sale The Space d'Italia — fuori dalla Campania, dove costa meno. Vale per i film 2D e 3D tutti i giorni, festivi compresi, con prenotazione gratuita del posto. Escluse offerte e promozioni.$t$),

  ($t$UCI Cinemas$t$, 6.50, 5, true, $t$https://www.ucicinemas.it$t$,
   $t$Voucher elettronico. Oltre a Casoria e Marcianise vale in tutte le sale UCI d'Italia. Vale per i film 2D e 3D tutti i giorni, sabato, domenica e festivi compresi. Escluse offerte e promozioni.$t$)
on conflict (nome) do update set
  prezzo_socio = excluded.prezzo_socio,
  ordine       = excluded.ordine,
  attivo       = true,
  sito         = excluded.sito,
  note         = excluded.note;

-- Le sale.
--
-- Solo quelle nominate nel riepilogo: per «resto d'Italia» non se ne elenca
-- nessuna, ed è giusto così — il modulo in quel caso non mostra affatto la
-- scelta della sala, e il socio guarda la programmazione sul sito.
--
-- `link_programmazione` resta vuoto: il sito è uno per circuito e sta sul
-- circuito. Ripeterlo su ogni sala vorrebbe dire aggiornarlo in nove posti.

insert into sedi (circuito_id, nome, citta, ordine)
select c.id, s.nome, s.citta, s.ordine
from circuiti c
join (values
  ($t$Stella Film$t$, $t$Modernissimo$t$,     $t$Napoli$t$,    1),
  ($t$Stella Film$t$, $t$HappyMaxicinema$t$,  $t$Afragola$t$,  2),
  ($t$Stella Film$t$, $t$Gaveli Maxi Cine$t$, $t$Benevento$t$, 3),

  ($t$The Space Cinema — Campania$t$, $t$The Space Fuorigrotta$t$,  $t$Napoli$t$,  1),
  ($t$The Space Cinema — Campania$t$, $t$The Space Salerno$t$,      $t$Salerno$t$, 2),
  ($t$The Space Cinema — Campania$t$, $t$The Space Vulcano Buono$t$, $t$Nola$t$,   3),

  ($t$UCI Cinemas$t$, $t$UCI Casoria$t$,    $t$Casoria$t$,    1),
  ($t$UCI Cinemas$t$, $t$UCI Marcianise$t$, $t$Marcianise$t$, 2),

  ($t$Cinema Campania (voucher cartaceo)$t$, $t$Acacia$t$,       $t$Napoli$t$,                    1),
  ($t$Cinema Campania (voucher cartaceo)$t$, $t$America Hall$t$, $t$Napoli$t$,                    2),
  ($t$Cinema Campania (voucher cartaceo)$t$, $t$Filangieri$t$,   $t$Napoli$t$,                    3),
  ($t$Cinema Campania (voucher cartaceo)$t$, $t$Plaza$t$,        $t$Napoli$t$,                    4),
  ($t$Cinema Campania (voucher cartaceo)$t$, $t$La Perla$t$,     $t$Napoli, Bagnoli$t$,           5),
  ($t$Cinema Campania (voucher cartaceo)$t$, $t$Stabia Hall$t$,  $t$Castellammare di Stabia$t$,   6),
  ($t$Cinema Campania (voucher cartaceo)$t$, $t$Vittoria$t$,     $t$Aversa$t$,                    7),
  ($t$Cinema Campania (voucher cartaceo)$t$, $t$Partenio$t$,     $t$Avellino$t$,                  8),
  ($t$Cinema Campania (voucher cartaceo)$t$, $t$Torrevillage$t$, $t$Benevento$t$,                 9)
) as s(circuito, nome, citta, ordine) on s.circuito = c.nome
on conflict (circuito_id, lower(nome)) do update set
  citta  = excluded.citta,
  ordine = excluded.ordine,
  attiva = true;

-- Il controllo prima del commit: cinque circuiti accesi, diciassette sale,
-- e nessun circuito acceso senza prezzo. Se una riga non torna, si annulla
-- tutto con `rollback` invece di `commit`.
select c.nome, c.prezzo_socio, count(s.id) as sale
from circuiti c
left join sedi s on s.circuito_id = c.id and s.attiva
where c.attivo
group by c.nome, c.prezzo_socio, c.ordine
order by c.ordine;

commit;
