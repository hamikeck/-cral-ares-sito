import { describe, expect, test } from 'vitest'
import { csvDelleRichieste, nomeFileCsv } from './csvRichieste'
import type { Richiesta } from '@/dominio/richiesta'

const base: Richiesta = {
  id: 'r1',
  numero: 42,
  tipo: 'cinema',
  creataIl: '2026-09-14T10:00:00Z',
  nome: 'Mario',
  cognome: 'Rossi',
  codiceDipendente: 'AE12345',
  email: 'mario.rossi@agenziaentrate.it',
  quantita: 4,
  importo: 26,
  pagamento: 'bonifico',
  consegna: 'whatsapp',
  recapito: '333 1234567',
  circuito: 'UCI Cinemas',
  avvisoInviato: true,
}

const righe = (csv: string) => csv.replace('﻿', '').trimEnd().split('\r\n')

describe('csvDelleRichieste', () => {
  test('separa col punto e virgola, che è quello che Excel italiano si aspetta', () => {
    // Con la virgola, Excel mette tutta la riga in una cella sola e chi apre
    // il file pensa che sia rotto.
    const [intestazione] = righe(csvDelleRichieste([]))
    expect(intestazione.split(';')[0]).toBe('Numero')
    expect(intestazione).toContain('Matricola')
  })

  test('comincia col segno che fa leggere gli accenti a Excel', () => {
    // Senza il BOM, Excel legge il file come Latin-1 e «Quantità» si rompe.
    expect(csvDelleRichieste([])[0]).toBe('﻿')
  })

  test('va a capo come vuole Excel', () => {
    expect(csvDelleRichieste([base])).toContain('\r\n')
  })

  test('scrive la riga di una richiesta con i valori giusti', () => {
    const [, riga] = righe(csvDelleRichieste([base]))
    const celle = riga.split(';')

    expect(celle[0]).toBe('42')
    expect(celle[1]).toBe('14 settembre 2026')
    expect(celle[2]).toBe('Cinema')
    expect(celle[3]).toBe('Rossi')
    expect(celle[7]).toBe('4 biglietti UCI Cinemas')
    expect(celle[9]).toBe('26,00')
    expect(celle[10]).toBe('Bonifico')
    expect(celle[11]).toBe('WhatsApp')
  })

  test('l’importo usa la virgola decimale, come l’italiano', () => {
    const [, riga] = righe(csvDelleRichieste([{ ...base, importo: 6.5 }]))
    expect(riga.split(';')[9]).toBe('6,50')
  })

  test('un messaggio con punto e virgola o a capo non spezza la riga', () => {
    const csv = csvDelleRichieste([
      { ...base, messaggio: 'Per sabato; se possibile\ndue in platea' },
    ])
    expect(righe(csv)).toHaveLength(2)
    expect(csv).toContain('"Per sabato; se possibile\ndue in platea"')
  })

  test('le virgolette dentro un messaggio vengono raddoppiate', () => {
    const csv = csvDelleRichieste([{ ...base, messaggio: 'Lo spettacolo "Amleto2"' }])
    expect(csv).toContain('"Lo spettacolo ""Amleto2"""')
  })

  test('un messaggio che comincia per uguale non diventa una formula', () => {
    // Excel eseguirebbe quella cella all'apertura del file: è il modo classico
    // per far fare qualcosa a un foglio di calcolo che qualcun altro apre.
    const csv = csvDelleRichieste([{ ...base, messaggio: '=1+1' }])
    expect(csv).toContain(";'=1+1;")
  })

  test('dice se l’avviso ai direttori è partito', () => {
    // È la colonna che conta finché il servizio di invio non è configurato:
    // una richiesta arrivata e non annunciata sarebbe altrimenti invisibile.
    expect(righe(csvDelleRichieste([base]))[1]).toMatch(/;sì$/)
    expect(righe(csvDelleRichieste([{ ...base, avvisoInviato: false }]))[1]).toMatch(/;no$/)
  })

  test('senza richieste resta la sola intestazione', () => {
    expect(righe(csvDelleRichieste([]))).toHaveLength(1)
  })
})

describe('nomeFileCsv', () => {
  test('porta la data, perché se ne scarica più d’uno nel tempo', () => {
    expect(nomeFileCsv('2026-09-14')).toBe('richieste-cral-ares-2026-09-14.csv')
  })
})
