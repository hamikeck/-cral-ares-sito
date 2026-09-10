import { describe, expect, test } from 'vitest'
import { formattaEuro, importoBiglietti, type Circuito } from './circuito'

const uci: Circuito = { id: '1', nome: 'UCI Cinemas', prezzoSocio: 6.5, sedi: [] }

describe('importoBiglietti', () => {
  test('moltiplica il prezzo per la quantità', () => {
    expect(importoBiglietti(uci, 4)).toBe(26)
  })

  test('senza prezzo non inventa un importo', () => {
    // È il caso di oggi: il direttivo non ha ancora comunicato il listino, e
    // un numero inventato è peggio di nessun numero.
    expect(importoBiglietti({ ...uci, prezzoSocio: undefined }, 4)).toBeUndefined()
  })

  test('non lascia code di centesimi dove non ce ne sono', () => {
    // 6,10 × 3 in virgola mobile fa 18,299999999999997.
    expect(importoBiglietti({ ...uci, prezzoSocio: 6.1 }, 3)).toBe(18.3)
  })
})

describe('formattaEuro', () => {
  test('scrive gli importi come li scrive l’italiano', () => {
    // Lo spazio prima dell'euro è **unificatore** (U+00A0), non uno normale:
    // è quello che impedisce al simbolo di andare a capo da solo lasciando la
    // cifra sulla riga sopra. Lo mette Intl, e va lasciato dov'è.
    expect(formattaEuro(26)).toBe('26,00\u00a0€')
    expect(formattaEuro(6.5)).toBe('6,50\u00a0€')
  })
})
