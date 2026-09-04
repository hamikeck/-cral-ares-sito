import { describe, expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { violazioniAccessibilita } from './accessibilita'

describe('violazioniAccessibilita', () => {
  test('non segnala nulla su un frammento corretto', async () => {
    const { container } = render(
      <main>
        <h1>Titolo</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-cral-ares.svg" alt="CRAL ARES" />
      </main>,
    )
    expect(await violazioniAccessibilita(container)).toEqual([])
  })

  test("segnala un'immagine senza testo alternativo", async () => {
    const { container } = render(
      <main>
        <h1>Titolo</h1>
        {/* eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element */}
        <img src="/logo-cral-ares.svg" />
      </main>,
    )
    const violazioni = await violazioniAccessibilita(container)
    expect(violazioni.join(' ')).toContain('image-alt')
  })
})
