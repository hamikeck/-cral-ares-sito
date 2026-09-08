import { NextResponse } from 'next/server'
import { clientServer } from '@/dati/supabaseServer'

/**
 * Chiude la sessione di chi non è (più), o non vuole più essere, un
 * redattore collegato.
 *
 * Non sta nel guscio protetto, e non potrebbe: il guscio è un layout, cioè
 * un Server Component, e un Server Component legge i cookie ma non può
 * scriverli — `supabaseServer.ts` intercetta in silenzio proprio quell'
 * errore di scrittura. Un `signOut()` chiamato da lì revocherebbe la sessione
 * su Supabase ma lascerebbe il cookie intatto nel browser. Un Route Handler,
 * come questo, può scrivere i cookie della risposta: è per questo che
 * l'uscita vera sta qui, e non nel layout.
 *
 * Sta fuori dal gruppo di rotte `(interno)`, accanto ad `accedi/` e
 * `callback/`: se fosse dentro il guscio, chi non è autorizzato — cioè
 * proprio chi deve raggiungere questa pagina — non potrebbe mai arrivarci.
 *
 * Ci arrivano due tipi di richiesta, e per questo due verbi distinti.
 *
 * **GET è solo per l'espulsione.** Il guscio (`(interno)/layout.tsx`) e
 * `eliminaOfferta` (`azioni/offerte.ts`) ci arrivano con `redirect()`, e un
 * redirect è sempre un GET — non c'è modo di farlo altrimenti. Nessun
 * `<Link>` deve mai puntare qui: Next precarica un `<Link>` quando entra nel
 * viewport, **solo in produzione**
 * (`web/node_modules/next/dist/docs/01-app/03-api-reference/02-components/link.md`),
 * e quel precaricamento è di fatto una GET — chiuderebbe la sessione da solo,
 * ad ogni visita, senza che nessuno l'abbia chiesto. In `npm run dev` il
 * precaricamento non esiste, quindi nessuna prova manuale l'avrebbe mai
 * mostrato. Un indirizzo che muta lo stato via GET è anche attivabile da
 * fuori — basta un `<img src=".../uscita">` su una pagina qualunque.
 *
 * **POST è per l'uscita volontaria**, quella del pulsante «Esci»
 * (`(interno)/page.tsx`), che è un `<form method="post">` e non un `<Link>`
 * proprio per questo.
 *
 * Solo l'espulsione è un «non autorizzato» — per questo il parametro viene
 * inoltrato quando c'è, non aggiunto sempre: altrimenti chi esce
 * volontariamente leggerebbe un avviso falso alla pagina di accesso. Il
 * parametro arriva solo per GET (è chi espelle, via `redirect()`, a scriverlo
 * nell'indirizzo): POST lo ignorerebbe comunque, dato che un form non lo
 * manda.
 */
async function chiudiSessione(richiesta: Request, status: number) {
  const client = await clientServer()
  await client.auth.signOut()

  const nonAutorizzato = new URL(richiesta.url).searchParams.get('nonAutorizzato')
  const destinazione = new URL('/area-riservata/accedi', richiesta.url)
  if (nonAutorizzato) destinazione.searchParams.set('nonAutorizzato', nonAutorizzato)

  return NextResponse.redirect(destinazione, status)
}

/** L'espulsione: arriva da un `redirect()` server-side, sempre un GET. */
export async function GET(richiesta: Request) {
  // 307: mantiene il metodo, ma qui non importa — chi arriva da un
  // redirect() non ha corpo da reinviare.
  return chiudiSessione(richiesta, 307)
}

/** L'uscita volontaria: arriva dall'invio del form del pulsante «Esci». */
export async function POST(richiesta: Request) {
  // 303, non 307: dopo un POST il browser deve rifare la richiesta di
  // destinazione in GET, non ripetere il POST sulla pagina di accesso.
  return chiudiSessione(richiesta, 303)
}
