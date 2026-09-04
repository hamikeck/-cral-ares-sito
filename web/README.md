# CRAL ARES — sito web

Sito dell'associazione ricreativa dei dipendenti dell'Agenzia delle Entrate.
Questa è la fase 1: le pagine pubbliche (home, chi siamo, iscriviti, privacy,
cookie).

## Comandi

Tutti i comandi vanno eseguiti dalla cartella `web/`:

```bash
npm run dev     # server di sviluppo
npm test        # test automatici
npm run lint    # controllo di stile del codice
npm run build   # build di produzione
```

## Testi e contenuti

I testi delle pagine vivono in `src/contenuti/pagine.ts`, le voci di menu in
`src/contenuti/navigazione.ts`. I testi attuali sono provvisori: quelli
definitivi arriveranno dal direttivo dell'associazione. Sostituirli è
un'operazione che riguarda solo questi due file.

## Colori del marchio

I colori del marchio sono definiti in `src/lib/marchio.ts`, con un test che
ne verifica il contrasto secondo WCAG.

## Distribuzione

Il sito è distribuito su Netlify tramite il file `netlify.toml` nella radice
del repository, che imposta `base = "web"`.
