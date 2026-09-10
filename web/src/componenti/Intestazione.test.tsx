import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { vociDiMenu } from '@/contenuti/navigazione'
import { Intestazione } from './Intestazione'

// Il componente legge il percorso per decidere se mostrare il marchio: qui lo
// si detta, così ogni prova dice da quale pagina la si sta guardando.
const percorso = vi.hoisted(() => ({ corrente: '/offerte' }))
vi.mock('next/navigation', () => ({ usePathname: () => percorso.corrente }))

describe('Intestazione', () => {
  test('mostra tutte le voci del menu come collegamenti', () => {
    render(<Intestazione />)
    for (const voce of vociDiMenu) {
      const collegamento = screen.getByRole('link', { name: voce.etichetta })
      expect(collegamento).toHaveAttribute('href', voce.percorso)
    }
  })

  test('offre il collegamento per saltare al contenuto', () => {
    render(<Intestazione />)
    const salta = screen.getByRole('link', { name: 'Salta al contenuto' })
    expect(salta).toHaveAttribute('href', '#contenuto')
  })

  test('il logo ha un testo alternativo', () => {
    render(<Intestazione />)
    expect(screen.getByAltText('CRAL ARES')).toBeInTheDocument()
  })

  test('sulla home il marchio non è nella barra: lo porta l’insegna sotto', () => {
    // Due loghi nello stesso schermo, uno piccolo nella barra e uno grande
    // sotto, si guardano male; e da casa non serve la strada per tornare a
    // casa. Le voci di menu restano tutte.
    percorso.corrente = '/'
    render(<Intestazione />)

    expect(screen.queryByAltText('CRAL ARES')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: vociDiMenu[0].etichetta })).toBeInTheDocument()
    percorso.corrente = '/offerte'
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<Intestazione />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
