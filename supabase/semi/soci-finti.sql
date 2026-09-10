-- Soci finti per lo sviluppo, NON dati veri.
--
-- Servono a poter costruire e provare la pagina dei soci e il riscontro delle
-- richieste prima che il direttivo consegni l'elenco. **I nomi sono
-- inventati**, gli indirizzi puntano a un dominio che non esiste, e le
-- matricole hanno forme volutamente diverse fra loro — con e senza prefisso,
-- con e senza spazio — perché è così che arrivano quelle vere, ed è il caso
-- che deve reggere il confronto.
--
-- Prima dell'import dell'elenco vero:
--   delete from soci;
-- L'import parte su tabella vuota e non fonde niente: da quel momento
-- l'elenco lo aggiornano i direttori dalla pagina.

insert into soci (nome, cognome, email, codice_dipendente, telefono, note) values
  ('Mario',     'Rossi',      'mario.rossi@esempio.test',      'AE12345',   null,         null),
  ('Anna',      'Bianchi',    'anna.bianchi@esempio.test',     'AE 12 346', '3331234567', null),
  ('Giuseppe',  'Esposito',   'g.esposito@esempio.test',       'ae12347',   null,         'Ritira in sede'),
  ('Lucia',     'Russo',      'lucia.russo@esempio.test',      '12348',     null,         null),
  ('Antonio',   'Ferrara',    'a.ferrara@esempio.test',        'AE12349',   '3387654321', null),
  ('Carmela',   'Romano',     'carmela.romano@esempio.test',   'AE12350',   null,         null),
  ('Salvatore', 'Coppola',    's.coppola@esempio.test',        'AE12351',   null,         null),
  ('Rita',      'De Luca',    'rita.deluca@esempio.test',      'AE12352',   null,         null),
  ('Vincenzo',  'Barone',     'v.barone@esempio.test',         'AE12353',   null,         null),
  ('Teresa',    'Greco',      'teresa.greco@esempio.test',     'AE12354',   '3391112233', null),
  ('Pasquale',  'Sorrentino', 'p.sorrentino@esempio.test',     'AE12355',   null,         null),
  ('Angela',    'Marino',     'angela.marino@esempio.test',    'AE12356',   null,         null),
  ('Raffaele',  'Conte',      'r.conte@esempio.test',          'AE12357',   null,         null),
  ('Filomena',  'Palumbo',    'filomena.palumbo@esempio.test', 'AE12358',   null,         null),
  ('Ciro',      'Improta',    'ciro.improta@esempio.test',     'AE12359',   null,         null),
  ('Gennaro',   'Amato',      'g.amato@esempio.test',          'AE12360',   null,         null),
  ('Assunta',   'Fiore',      'assunta.fiore@esempio.test',    'AE12361',   null,         null),
  ('Domenico',  'Caruso',     'd.caruso@esempio.test',         'AE12362',   null,         null),
  ('Rosaria',   'Vitale',     'rosaria.vitale@esempio.test',   'AE12363',   null,         null),
  ('Michele',   'Gallo',      'michele.gallo@esempio.test',    'AE12364',   null,         'Contatto solo per email');
