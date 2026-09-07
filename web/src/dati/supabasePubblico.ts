import { createClient } from '@supabase/supabase-js'
import { ambiente } from './ambiente'

/**
 * Il client delle pagine pubbliche. **Non tocca i cookie**, ed è il motivo per
 * cui esiste separato dagli altri due.
 *
 * In Next, leggere i cookie dentro una pagina la rende dinamica: verrebbe
 * generata a ogni visita invece che una volta sola. Le offerte sono uguali per
 * tutti e non hanno bisogno di sapere chi le guarda, quindi le pagine restano
 * statiche e si rigenerano ogni ora, come già fa `/offerte/[slug]`.
 */
export function clientPubblico() {
  const { url, chiaveAnonima } = ambiente()
  return createClient(url, chiaveAnonima, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
