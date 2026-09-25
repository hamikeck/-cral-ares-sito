import type { Metadata } from 'next'
import { Intestazione } from '@/componenti/Intestazione'
import { PiedePagina } from '@/componenti/PiedePagina'
import { contenutiPagine } from '@/contenuti/pagine'
import { SCHEDA_CONDIVISA } from '@/lib/schedaCondivisa'
import { indirizzoDelSito } from '@/dati/ambiente'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: contenutiPagine.associazione.nome,
    template: `%s · ${contenutiPagine.associazione.nome}`,
  },
  description: contenutiPagine.home.occhiello,
  // Serve a trasformare in indirizzi completi quelli dell'anteprima: WhatsApp
  // e i programmi di posta non sanno cosa farsene di un «/opengraph-image».
  // L'indirizzo lo decide `indirizzoDelSito`, con le sue regole.
  metadataBase: new URL(indirizzoDelSito() ?? 'http://localhost:3000'),
  // La scheda che compare quando un direttore incolla un link su WhatsApp o
  // in un'email. L'immagine è `opengraph-image.png` in questa cartella, e
  // Next la aggiunge da sé a ogni pagina.
  openGraph: SCHEDA_CONDIVISA,
  // Anteprima privata su *.netlify.app: da rimuovere in fase 6, quando il
  // sito sarà pubblicato sul dominio definitivo.
  robots: { index: false, follow: false },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body className="grana flex min-h-screen flex-col antialiased">
        <Intestazione />
        <main id="contenuto" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
          {children}
        </main>
        <PiedePagina />
      </body>
    </html>
  )
}
