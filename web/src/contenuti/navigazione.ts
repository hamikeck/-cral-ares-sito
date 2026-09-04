export type VoceDiMenu = {
  percorso: string
  etichetta: string
}

/** Menu principale, mostrato nell'intestazione. */
export const vociDiMenu: VoceDiMenu[] = [
  { percorso: '/', etichetta: 'Home' },
  { percorso: '/chi-siamo', etichetta: 'Chi siamo' },
  { percorso: '/iscriviti', etichetta: 'Iscriviti' },
]

/** Rimandi legali, mostrati nel piè di pagina. */
export const vociLegali: VoceDiMenu[] = [
  { percorso: '/privacy', etichetta: 'Privacy' },
  { percorso: '/cookie', etichetta: 'Cookie' },
]
