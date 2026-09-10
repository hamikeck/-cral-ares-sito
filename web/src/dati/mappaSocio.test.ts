import { describe, expect, test } from 'vitest'
import { mappaSocio } from './mappaSocio'
import type { RigaSocio } from './righe'

const riga: RigaSocio = {
  id: 'ab6e0d5e-4f2f-4a1e-9b5f-2f1c6d8a3b71',
  nome: 'Mario',
  cognome: 'Rossi',
  email: 'mario.rossi@agenziaentrate.it',
  codice_dipendente: 'AE12345',
  telefono: null,
  note: null,
}

describe('mappaSocio', () => {
  test('traduce i nomi delle colonne in quelli del dominio', () => {
    expect(mappaSocio(riga)).toEqual({
      id: riga.id,
      nome: 'Mario',
      cognome: 'Rossi',
      email: 'mario.rossi@agenziaentrate.it',
      codiceDipendente: 'AE12345',
    })
  })

  test('i campi nulli spariscono invece di diventare null', () => {
    // Un `telefono: null` che arrivasse fino a una pagina finirebbe renderizzato
    // come la parola «null» il giorno in cui qualcuno dimentica un controllo.
    const socio = mappaSocio(riga)
    expect('telefono' in socio).toBe(false)
    expect('note' in socio).toBe(false)
  })

  test('i campi valorizzati arrivano interi', () => {
    const socio = mappaSocio({
      ...riga,
      telefono: '3331234567',
      note: 'Ritira in sede',
    })
    expect(socio.telefono).toBe('3331234567')
    expect(socio.note).toBe('Ritira in sede')
  })
})
