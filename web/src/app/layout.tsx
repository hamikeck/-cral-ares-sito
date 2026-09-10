import type { Metadata } from 'next'
import { Intestazione } from '@/componenti/Intestazione'
import { PiedePagina } from '@/componenti/PiedePagina'
import { contenutiPagine } from '@/contenuti/pagine'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: contenutiPagine.associazione.nome,
    template: `%s · ${contenutiPagine.associazione.nome}`,
  },
  description: contenutiPagine.home.occhiello,
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
        <main id="contenuto" className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
          {children}
        </main>
        <PiedePagina />
      </body>
    </html>
  )
}
