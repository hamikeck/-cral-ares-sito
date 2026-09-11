import { beforeEach, describe, expect, test, vi } from 'vitest'

const risultaSocio = vi.hoisted(() => vi.fn())
const avvisaIDirettori = vi.hoisted(() => vi.fn())
const inserite = vi.hoisted(() => [] as Record<string, unknown>[])
const rpc = vi.hoisted(() => vi.fn())

vi.mock('@/dati/soci', () => ({ risultaSocio }))
vi.mock('@/dati/posta', () => ({ avvisaIDirettori }))
vi.mock('@/dati/circuiti', () => ({
  circuitiConSedi: async () => [
    {
      id: '0f9d2b1e-5c3a-4a7b-9e21-8c4d6f2a1b03',
      nome: 'UCI Cinemas',
      prezzoSocio: 6.5,
      sedi: [{ id: 's1', nome: 'UCI Casoria' }],
    },
  ],
}))
vi.mock('@/dati/supabasePubblico', () => ({
  clientPubblico: () => ({
    rpc,
    from: () => ({
      insert: (riga: Record<string, unknown>) => {
        inserite.push(riga)
        return {
          select: () => ({ single: async () => ({ data: { id: 'r1', numero: 42 }, error: null }) }),
        }
      },
    }),
  }),
}))

import { inviaRichiestaCinema } from './richieste'

function modulo(campi: Record<string, string>) {
  const dati = new FormData()
  const completo = {
    nome: 'Mario',
    cognome: 'Rossi',
    codiceDipendente: 'ae 12345',
    email: 'mario.rossi@esempio.test',
    consegna: 'email_aziendale',
    circuitoId: '0f9d2b1e-5c3a-4a7b-9e21-8c4d6f2a1b03',
    sedeId: '',
    quantita: '4',
    pagamento: 'bonifico',
    consensoPrivacy: 'on',
    ...campi,
  }
  for (const [chiave, valore] of Object.entries(completo)) dati.set(chiave, valore)
  return dati
}

describe('inviaRichiestaCinema', () => {
  beforeEach(() => {
    inserite.length = 0
    risultaSocio.mockReset().mockResolvedValue(true)
    avvisaIDirettori.mockReset().mockResolvedValue(true)
    rpc.mockReset()
  })

  test('chi non risulta socio non scrive niente, e legge cosa controllare', async () => {
    risultaSocio.mockResolvedValue(false)

    const esito = await inviaRichiestaCinema(null, modulo({}))

    expect(inserite).toHaveLength(0)
    expect(esito.errori?.modulo).toMatch(/Non risulti fra i soci/)
    expect(esito.errori?.modulo).toMatch(/email aziendale e la matricola/)
  })

  test('se il riscontro non risponde, la richiesta non parte', async () => {
    // Un errore del database non deve mai diventare un «sì»: nel dubbio non
    // si scrive, e il socio riprova.
    risultaSocio.mockRejectedValue(new Error('timeout'))

    const esito = await inviaRichiestaCinema(null, modulo({}))

    expect(inserite).toHaveLength(0)
    expect(esito.errori?.modulo).toBeDefined()
  })

  test('l’importo lo calcola il server dal prezzo del database', async () => {
    // Se venisse dal modulo, la cifra la sceglierebbe chi compila.
    await inviaRichiestaCinema(null, modulo({ quantita: '4' }))

    expect(inserite[0].importo).toBe(26)
    expect(inserite[0].circuito).toBe('UCI Cinemas')
  })

  test('salva solo il recapito della strada scelta', async () => {
    // Chi scrive un numero e poi sceglie l'email non deve lasciare il proprio
    // numero in un archivio che nessuno userà.
    await inviaRichiestaCinema(
      null,
      modulo({ consegna: 'email_aziendale', telefono: '3331234567', emailPersonale: 'x@y.it' }),
    )

    expect(inserite[0].telefono).toBeNull()
    expect(inserite[0].email_personale).toBeNull()
  })

  test('scegliendo WhatsApp salva il numero e non l’altra email', async () => {
    await inviaRichiestaCinema(
      null,
      modulo({ consegna: 'whatsapp', telefono: '333 1234567', emailPersonale: 'x@y.it' }),
    )

    expect(inserite[0].telefono).toBe('333 1234567')
    expect(inserite[0].email_personale).toBeNull()
  })

  test('la sala scelta viene copiata accanto al suo riferimento', async () => {
    await inviaRichiestaCinema(null, modulo({ sedeId: 's1' }))

    expect(inserite[0].sede_id).toBe('s1')
    expect(inserite[0].sede).toBe('UCI Casoria')
  })

  test('una sala che non appartiene al circuito non viene salvata', async () => {
    // Arriva solo da un modulo manomesso, ma non deve finire nella richiesta.
    await inviaRichiestaCinema(null, modulo({ sedeId: 'sede-di-un-altro' }))

    expect(inserite[0].sede_id).toBeNull()
    expect(inserite[0].sede).toBeNull()
  })

  test('avvisa i direttori e segna che l’avviso è partito', async () => {
    const esito = await inviaRichiestaCinema(null, modulo({}))

    expect(avvisaIDirettori).toHaveBeenCalledOnce()
    expect(rpc).toHaveBeenCalledWith('segna_avviso_inviato', { richiesta_id: 'r1' })
    expect(esito.inviata?.importo).toBe(26)
  })

  test('se l’avviso non parte, la richiesta resta e il socio non se ne accorge', async () => {
    // È la scelta di fondo: perdere una richiesta perché non parte una
    // notifica sarebbe il modo peggiore di fallire.
    avvisaIDirettori.mockResolvedValue(false)

    const esito = await inviaRichiestaCinema(null, modulo({}))

    expect(inserite).toHaveLength(1)
    expect(rpc).not.toHaveBeenCalled()
    expect(esito.inviata).toBeDefined()
    expect(esito.errori).toBeUndefined()
  })

  test('la causale dice a chi appartiene il bonifico', async () => {
    const esito = await inviaRichiestaCinema(null, modulo({}))
    expect(esito.inviata?.causale).toBe('CRAL ARES biglietti UCI Cinemas Rossi ae 12345')
  })
})
