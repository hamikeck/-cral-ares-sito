import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { violazioniAccessibilita } from '@/test/accessibilita'
import { vociDiMenu } from '@/contenuti/navigazione'
import { Intestazione } from './Intestazione'

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

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(<Intestazione />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
