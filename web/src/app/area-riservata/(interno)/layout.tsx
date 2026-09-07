import { redirect } from 'next/navigation'
import { redattoreAttivo } from '@/dati/redattori'
import { clientServer } from '@/dati/supabaseServer'

/**
 * Il guscio dell'area riservata.
 *
 * Il controllo sta qui e non in ogni pagina: una pagina nuova aggiunta fra sei
 * mesi è protetta perché si trova dentro questa cartella, non perché qualcuno
 * si è ricordato di proteggerla.
 */
export default async function GuscioRiservato({
  children,
}: {
  children: React.ReactNode
}) {
  const client = await clientServer()
  const { data } = await client.auth.getUser()

  if (!data.user) redirect('/area-riservata/accedi')

  // La chiusura della sessione non sta qui: un Server Component non può
  // scrivere i cookie, quindi un signOut() chiamato da qui non ripulirebbe
  // quello nel browser. Se ne occupa il Route Handler /area-riservata/uscita.
  if (!(await redattoreAttivo())) redirect('/area-riservata/uscita')

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-inchiostro-tenue">
        Sei entrato come {data.user.email}
      </p>
      {children}
    </div>
  )
}
