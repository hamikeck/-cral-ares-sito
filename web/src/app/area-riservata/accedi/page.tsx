import type { Metadata } from 'next'
import { ModuloAccesso } from './ModuloAccesso'

export const metadata: Metadata = {
  title: 'Accesso riservato',
  robots: { index: false, follow: false },
}

export default async function Accedi({
  searchParams,
}: {
  searchParams: Promise<{ [chiave: string]: string | string[] | undefined }>
}) {
  const { nonAutorizzato } = await searchParams

  return (
    <section className="max-w-2xl">
      <h1 className="text-titolo-pagina text-chiaro">Area riservata</h1>
      <p className="mt-3 text-corpo text-tenue">
        Riservata ai direttori del CRAL. Non serve una password: arriva un link
        per email, si preme, si entra.
      </p>

      {nonAutorizzato ? (
        <p
          role="alert"
          className="mt-6 border-l-4 border-luce/60 bg-pannello px-4 py-3 text-corpo"
        >
          Questo indirizzo non è fra quelli autorizzati a pubblicare le offerte.
          Se pensi che sia un errore, scrivi agli altri direttori.
        </p>
      ) : null}

      <ModuloAccesso />
    </section>
  )
}
