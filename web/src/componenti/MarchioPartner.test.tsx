import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarchioPartner } from './MarchioPartner'
import { violazioniAccessibilita } from '@/test/accessibilita'

describe('MarchioPartner', () => {
  test('con il logo mostra l’immagine, muta per chi ascolta', () => {
    // Il nome del partner è già il titolo della scheda: dare un testo
    // alternativo al marchio lo farebbe leggere due volte di fila.
    const { container } = render(
      <MarchioPartner partner="Teatro Bellini" logoUrl="/partner/teatro-bellini.png" />,
    )

    const immagine = container.querySelector('img')
    expect(immagine).toHaveAttribute('src', '/partner/teatro-bellini.png')
    expect(immagine).toHaveAttribute('alt', '')
    expect(screen.queryByText('TB')).not.toBeInTheDocument()
  })

  test('senza logo mostra le iniziali ricavate dal nome', () => {
    render(<MarchioPartner partner="Farmacia D’Atri" />)

    expect(screen.getByText('FD')).toBeInTheDocument()
  })

  test('le iniziali scritte a mano vincono su quelle ricavate', () => {
    render(<MarchioPartner partner="Centro sportivo Acquachiara" iniziali="AQ" />)

    expect(screen.getByText('AQ')).toBeInTheDocument()
  })

  test('senza logo non lascia mai un quadrato vuoto', () => {
    // È il caso della verifica 3 del handoff: offerta senza logo, la scheda
    // deve restare corretta. Un quadrato vuoto sarebbe stato peggio di
    // nessun quadrato.
    const { container } = render(<MarchioPartner partner="UCI Cinemas" />)

    expect(container.textContent).toBe('UC')
  })

  test('nel nastro è più piccolo che in elenco', () => {
    const { container, rerender } = render(<MarchioPartner partner="Teatro Bellini" />)
    expect(container.firstElementChild).toHaveClass('size-13')

    rerender(<MarchioPartner partner="Teatro Bellini" dimensione="nastro" />)
    expect(container.firstElementChild).toHaveClass('size-11')
  })

  test('non presenta violazioni di accessibilità, con logo e senza', async () => {
    const { container, rerender } = render(
      <MarchioPartner partner="Teatro Bellini" logoUrl="/partner/teatro-bellini.png" />,
    )
    expect(await violazioniAccessibilita(container)).toEqual([])

    rerender(<MarchioPartner partner="Teatro Bellini" />)
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
