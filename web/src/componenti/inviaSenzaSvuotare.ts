import { startTransition, type FormEvent } from 'react'

/**
 * Invia un modulo alla sua azione senza che React lo svuoti.
 *
 * Con `<form action={azione}>` React 19 azzera tutti i campi non controllati
 * alla fine di ogni azione, **anche quando l'azione risponde con un errore**.
 * Per i moduli delle richieste voleva dire che un socio a cui mancava un
 * campo, o che aveva sbagliato una cifra della matricola, si ritrovava il
 * modulo vuoto sotto il messaggio che gli chiedeva di correggerlo. Trovato
 * nel collaudo del 24 settembre 2026.
 *
 * `action` resta sul `<form>` e questo gestore va in `onSubmit`. Prima che
 * la pagina sia idratata il modulo funziona ancora da solo, con il POST che
 * Next genera per l'azione: senza `action`, un invio arrivato troppo presto
 * diventerebbe un GET con nome, matricola ed email nell'indirizzo. Dopo
 * l'idratazione `preventDefault` ferma l'invio di React, e l'azione parte da
 * qui, dentro una transizione perché `useActionState` aggiorni `inCorso`.
 */
export function inviaSenzaSvuotare(azione: (dati: FormData) => void) {
  return (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault()
    const dati = new FormData(evento.currentTarget)
    startTransition(() => azione(dati))
  }
}
