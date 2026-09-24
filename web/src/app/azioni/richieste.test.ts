import { beforeEach, describe, expect, test, vi } from 'vitest'

const risultaSocio = vi.hoisted(() => vi.fn())
const avvisaIDirettori = vi.hoisted(() => vi.fn())
const confermaAlSocio = vi.hoisted(() => vi.fn())
const inserite = vi.hoisted(() => [] as Record<string, unknown>[])
const rpc = vi.hoisted(() => vi.fn())

// Fuori da una richiesta HTTP `headers()` non esiste: qui la si detta, così
// il controllo antispam può leggere l'IP come farebbe in produzione.
vi.mock('next/headers', () => ({
  headers: async () => new Map([['x-forwarded-for', '1.2.3.4']]),
}))

vi.mock('@/dati/soci', () => ({ risultaSocio }))
vi.mock('@/dati/posta', () => ({ avvisaIDirettori, confermaAlSocio }))
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
// Il ruolo anonimo può inserire una richiesta ma non leggerla, e la
// simulazione deve rispettarlo: chiedere indietro la riga appena scritta
// (`.select()` dopo `.insert()`) è un INSERT … RETURNING, che PostgreSQL
// respinge con 42501 perché la riga restituita dovrebbe passare anche la
// politica di lettura. Una simulazione più gentile del database ha nascosto
// per due settimane che nessuna richiesta veniva salvata.
const RIFIUTO_RLS = {
  data: null,
  error: { code: '42501', message: 'new row violates row-level security policy for table "richieste"' },
}
vi.mock('@/dati/supabasePubblico', () => ({
  clientPubblico: () => ({
    rpc,
    from: () => ({
      insert: (riga: Record<string, unknown>) => {
        inserite.push(riga)
        const esito = Promise.resolve({ data: null, error: null })
        return Object.assign(esito, {
          select: () => ({ single: async () => RIFIUTO_RLS }),
        })
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
    confermaAlSocio.mockReset().mockResolvedValue(undefined)
    rpc.mockReset().mockImplementation(async (funzione: string) =>
      funzione === 'numero_richiesta' ? { data: 42, error: null } : { data: null, error: null },
    )
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

    // L'id lo sceglie il server prima di inserire: è l'unico modo di
    // ritrovare la riga senza poterla rileggere.
    const id = inserite[0].id
    expect(id).toMatch(/^[0-9a-f-]{36}$/)
    expect(rpc).toHaveBeenCalledWith('numero_richiesta', { richiesta_id: id })
    expect(avvisaIDirettori).toHaveBeenCalledOnce()
    expect(avvisaIDirettori.mock.calls[0][0].numero).toBe(42)
    expect(rpc).toHaveBeenCalledWith('segna_avviso_inviato', { richiesta_id: id })
    expect(esito.inviata?.importo).toBe(26)
  })

  test('la richiesta si salva senza chiedere indietro la riga', async () => {
    // Il caso che ha fermato tutte le richieste dall'11 settembre: il
    // database accetta l'inserimento, ma rifiuta di restituire la riga a chi
    // non può leggerla. La simulazione qui sopra lo riproduce.
    const esito = await inviaRichiestaCinema(null, modulo({}))

    expect(esito.errori).toBeUndefined()
    expect(esito.inviata).toBeDefined()
  })

  test('se l’avviso non parte, la richiesta resta e il socio non se ne accorge', async () => {
    // È la scelta di fondo: perdere una richiesta perché non parte una
    // notifica sarebbe il modo peggiore di fallire.
    avvisaIDirettori.mockResolvedValue(false)

    const esito = await inviaRichiestaCinema(null, modulo({}))

    expect(inserite).toHaveLength(1)
    expect(rpc).not.toHaveBeenCalledWith('segna_avviso_inviato', expect.anything())
    expect(esito.inviata).toBeDefined()
    expect(esito.errori).toBeUndefined()
  })

  test('il socio riceve la presa in carico sull’email aziendale', async () => {
    // Mai sul recapito della consegna: quello non è verificato da nessuno, e
    // spedirci un'email trasformerebbe il modulo in un modo per mandare posta
    // a un indirizzo qualsiasi con il nostro mittente.
    await inviaRichiestaCinema(
      null,
      modulo({ consegna: 'email_personale', emailPersonale: 'altro@gmail.com' }),
    )

    expect(confermaAlSocio).toHaveBeenCalledOnce()
    expect(confermaAlSocio.mock.calls[0][0].email).toBe('mario.rossi@esempio.test')
  })

  test('un invio senza gettone antispam non passa, quando il controllo è acceso', async () => {
    // Con le chiavi assenti il controllo è spento e non cambia niente: è lo
    // stato di oggi. Qui si accende per una prova sola, e deve fermare
    // l'invio prima ancora di interrogare il database.
    process.env.TURNSTILE_SECRET_KEY = 'segreto-di-prova'
    try {
      const esito = await inviaRichiestaCinema(null, modulo({}))

      expect(inserite).toHaveLength(0)
      expect(risultaSocio).not.toHaveBeenCalled()
      expect(esito.errori?.modulo).toMatch(/antispam/)
    } finally {
      delete process.env.TURNSTILE_SECRET_KEY
    }
  })

  test('la causale dice a chi appartiene il bonifico', async () => {
    const esito = await inviaRichiestaCinema(null, modulo({}))
    expect(esito.inviata?.causale).toBe('CRAL ARES biglietti UCI Cinemas Rossi ae 12345')
  })
})
