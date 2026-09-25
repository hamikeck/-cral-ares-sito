import { svegliaIlDatabase } from '../../src/lib/sveglia'

/**
 * Ogni giorno alle 6 (UTC) una lettura sul database, perché Supabase non
 * sospenda il progetto. Il perché sta in `src/lib/sveglia.ts`.
 *
 * Netlify esegue le funzioni programmate solo sul deploy di produzione
 * pubblicato, e dal pannello (Logs → Functions) si può lanciarla a mano con
 * «Run now».
 */
export default async function sveglia() {
  await svegliaIlDatabase(process.env)
  console.log('Database sveglio.')
  return new Response('ok')
}

export const config = { schedule: '0 6 * * *' }
