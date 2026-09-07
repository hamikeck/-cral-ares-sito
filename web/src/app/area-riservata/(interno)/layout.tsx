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

  if (!(await redattoreAttivo())) {
    await client.auth.signOut()
    redirect('/area-riservata/accedi?nonAutorizzato=1')
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-inchiostro-tenue">
        Sei entrato come {data.user.email}
      </p>
      {children}
    </div>
  )
}
