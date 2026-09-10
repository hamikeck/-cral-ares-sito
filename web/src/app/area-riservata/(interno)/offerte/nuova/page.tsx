import type { Metadata } from 'next'
import { ModuloOfferta } from '@/componenti/ModuloOfferta'

export const metadata: Metadata = {
  title: 'Nuova offerta',
  robots: { index: false, follow: false },
}

export default function NuovaOfferta() {
  return (
    <section>
      <h1 className="text-titolo-pagina text-chiaro">Nuova offerta</h1>
      <p className="mt-3 max-w-2xl text-corpo text-tenue">
        Scrivi a sinistra, guarda a destra: l’anteprima è la stessa scheda che
        vedranno i soci. Puoi salvare in bozza e finire dopo.
      </p>
      <div className="mt-8">
        <ModuloOfferta />
      </div>
    </section>
  )
}
