import { describe, expect, test } from 'vitest'
import { sociDaCsv, sqlDiImportazione } from './sociDaCsv'

const intestazione = 'Nome;Cognome;Email;Matricola\n'

describe('sociDaCsv', () => {
  test('legge un file col punto e virgola, che è quello che esporta Excel in italiano', () => {
    const { soci, problemi } = sociDaCsv(intestazione + 'Mario;Rossi;mario@ae.it;AE1\n')

    expect(problemi).toEqual([])
    expect(soci).toEqual([
      {
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'mario@ae.it',
        codiceDipendente: 'AE1',
        telefono: '',
        note: '',
      },
    ])
  })

  test('legge anche un file con la virgola', () => {
    const { soci } = sociDaCsv('Nome,Cognome,Email,Matricola\nMario,Rossi,mario@ae.it,AE1\n')
    expect(soci).toHaveLength(1)
  })

  test('riconosce i nomi di colonna anche scritti diversamente', () => {
    // Il file lo compila una persona, non un programma: «E-mail», «Codice
    // dipendente», le maiuscole a caso e gli spazi ai lati sono la norma.
    const testo = ' COGNOME ; nome ; E-Mail ; Codice dipendente \nRossi;Mario;mario@ae.it;AE1\n'
    const { soci, problemi } = sociDaCsv(testo)

    expect(problemi).toEqual([])
    expect(soci[0]).toMatchObject({ nome: 'Mario', cognome: 'Rossi', codiceDipendente: 'AE1' })
  })

  test('regge le virgolette e le virgole dentro un campo', () => {
    const testo =
      'Nome,Cognome,Email,Matricola,Note\nMario,"Rossi, detto Mariuccio",m@ae.it,AE1,"Ritira in sede"\n'
    const { soci } = sociDaCsv(testo)

    expect(soci[0].cognome).toBe('Rossi, detto Mariuccio')
    expect(soci[0].note).toBe('Ritira in sede')
  })

  test('toglie il segno invisibile che Excel mette in testa al file', () => {
    // Il BOM incollato davanti a «Nome» rende la prima colonna irriconoscibile,
    // ed è la ragione numero uno per cui un import «non funziona e non si
    // capisce perché».
    const { problemi, soci } = sociDaCsv('﻿' + intestazione + 'Mario;Rossi;m@ae.it;AE1\n')
    expect(problemi).toEqual([])
    expect(soci).toHaveLength(1)
  })

  test('salta le righe vuote senza lamentarsi', () => {
    const { soci, problemi } = sociDaCsv(intestazione + 'Mario;Rossi;m@ae.it;AE1\n\n   \n')
    expect(soci).toHaveLength(1)
    expect(problemi).toEqual([])
  })

  test('se manca una colonna obbligatoria lo dice, e non importa niente', () => {
    const { soci, problemi } = sociDaCsv('Nome;Cognome;Email\nMario;Rossi;m@ae.it\n')

    expect(soci).toEqual([])
    expect(problemi[0]).toMatch(/matricola/i)
  })

  test('segnala la riga incompleta indicando il numero, e tiene le altre', () => {
    const testo = intestazione + 'Mario;Rossi;m@ae.it;AE1\n;Bianchi;anna@ae.it;AE2\n'
    const { soci, problemi } = sociDaCsv(testo)

    expect(soci).toHaveLength(1)
    expect(problemi[0]).toMatch(/riga 3/i)
  })

  test('segnala i doppioni dentro il file, prima che li segnali il database', () => {
    const testo = intestazione + 'Mario;Rossi;m@ae.it;AE 1\nMario;Rossi;M@AE.IT;AE1\n'
    const { soci, problemi } = sociDaCsv(testo)

    // Il confronto è quello degli indici: email senza maiuscole, matricola
    // senza spazi. Chi compila il file non vede la differenza, il database sì.
    expect(soci).toHaveLength(1)
    expect(problemi.join(' ')).toMatch(/riga 3/i)
  })
})

describe('sqlDiImportazione', () => {
  test('raddoppia gli apostrofi, che in italiano sono ovunque', () => {
    // «D'Amico» finirebbe per chiudere la stringa SQL a metà nome.
    const sql = sqlDiImportazione([
      {
        nome: 'Ciro',
        cognome: 'D’Amico',
        email: "c.d'amico@ae.it",
        codiceDipendente: 'AE1',
        telefono: '',
        note: '',
      },
    ])

    expect(sql).toContain("'c.d''amico@ae.it'")
  })

  test('i campi facoltativi vuoti diventano null, non stringhe vuote', () => {
    const sql = sqlDiImportazione([
      {
        nome: 'Mario',
        cognome: 'Rossi',
        email: 'm@ae.it',
        codiceDipendente: 'AE1',
        telefono: '',
        note: '',
      },
    ])
    expect(sql).toContain('null, null')
  })

  test('senza soci non produce un insert vuoto, che sarebbe SQL non valido', () => {
    expect(sqlDiImportazione([])).toBe('')
  })
})
