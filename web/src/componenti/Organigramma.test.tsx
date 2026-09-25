import { describe, expect, test } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { Organigramma, type Direttivo } from './Organigramma'
import { violazioniAccessibilita } from '@/test/accessibilita'

// Nomi dei soci finti delle prove: nessuno li deve scambiare per il direttivo.
const direttivo: Direttivo = {
  presidente: { ruolo: 'Presidente', nome: 'Mario Rossi' },
  cariche: [
    { ruolo: 'Vicepresidente', nome: 'Anna Bianchi' },
    { ruolo: 'Segretario', nome: 'Giuseppe Esposito' },
    { ruolo: 'Tesoriere', nome: 'Lucia Russo' },
  ],
  consiglieri: ['Antonio Ferrara', 'Carmela Romano'],
}

describe.each(['albero', 'tessere', 'locandina'] as const)('Organigramma, forma %s', (forma) => {
  test('ogni ruolo sta accanto al suo nome', () => {
    render(<Organigramma direttivo={direttivo} email="segreteria@esempio.test" forma={forma} />)

    for (const { ruolo, nome } of [direttivo.presidente, ...direttivo.cariche]) {
      const voce = screen.getByText(ruolo).closest('li')!
      expect(within(voce).getByText(nome)).toBeInTheDocument()
    }
  })

  test('le iniziali e le linee non si leggono ad alta voce', () => {
    // Chi usa un lettore di schermo sente «Presidente, Mario Rossi», non
    // «MR, Presidente, Mario Rossi».
    const { container } = render(
      <Organigramma direttivo={direttivo} email="segreteria@esempio.test" forma={forma} />,
    )
    // La locandina non ha iniziali: se ci sono, devono essere nascoste.
    const iniziali = within(container).queryByText('MR')
    if (iniziali) expect(iniziali).toHaveAttribute('aria-hidden', 'true')
  })

  test('mostra consiglieri e segreteria', () => {
    render(<Organigramma direttivo={direttivo} email="segreteria@esempio.test" forma={forma} />)

    expect(screen.getByText('Carmela Romano')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'segreteria@esempio.test' })).toHaveAttribute(
      'href',
      'mailto:segreteria@esempio.test',
    )
  })

  test('non presenta violazioni di accessibilità', async () => {
    const { container } = render(
      <Organigramma direttivo={direttivo} email="segreteria@esempio.test" forma={forma} />,
    )
    expect(await violazioniAccessibilita(container)).toEqual([])
  })
})
