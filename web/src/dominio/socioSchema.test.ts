import { describe, expect, test } from 'vitest'
import { schemaSocio } from './socioSchema'

const valido = {
  nome: 'Mario',
  cognome: 'Rossi',
  email: 'mario.rossi@agenziaentrate.it',
  codiceDipendente: 'AE12345',
  telefono: '',
  note: '',
}

/** Il messaggio che il direttore leggerebbe sotto un campo. */
function erroreSu(campo: string, dati: Record<string, string>) {
  const esito = schemaSocio.safeParse(dati)
  if (esito.success) return undefined
  return esito.error.issues.find((problema) => problema.path[0] === campo)?.message
}

describe('schemaSocio', () => {
  test('accetta un socio completo', () => {
    expect(schemaSocio.safeParse(valido).success).toBe(true)
  })

  test('telefono e note restano facoltativi', () => {
    const esito = schemaSocio.safeParse(valido)
    expect(esito.success && esito.data.telefono).toBe('')
  })

  test('i quattro campi obbligatori dicono cosa fare, non cosa manca', () => {
    expect(erroreSu('nome', { ...valido, nome: '  ' })).toBe('Scrivi il nome.')
    expect(erroreSu('cognome', { ...valido, cognome: '' })).toBe('Scrivi il cognome.')
    expect(erroreSu('email', { ...valido, email: '' })).toBe('Scrivi l’email.')
    expect(erroreSu('codiceDipendente', { ...valido, codiceDipendente: '' })).toBe(
      'Scrivi la matricola.',
    )
  })

  test('un’email senza chiocciola viene respinta con un messaggio leggibile', () => {
    expect(erroreSu('email', { ...valido, email: 'mario.rossi' })).toMatch(/chiocciola/)
  })

  test('la matricola non ha un formato imposto', () => {
    // In Agenzia ne convivono di forme diverse: un controllo inventato qui
    // respingerebbe un socio vero per una regola che non esiste.
    for (const codice of ['AE12345', '12345', 'ae 12 345', 'X-9']) {
      expect(schemaSocio.safeParse({ ...valido, codiceDipendente: codice }).success).toBe(true)
    }
  })

  test('gli spazi ai lati vengono tolti prima di salvare', () => {
    const esito = schemaSocio.safeParse({ ...valido, nome: '  Mario  ' })
    expect(esito.success && esito.data.nome).toBe('Mario')
  })
})
