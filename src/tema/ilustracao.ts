/**
 * Paleta da ilustração (o guia e os emblemas). A regra 12 do doc 11 permite cores próprias na
 * ilustração; elas ficam juntas aqui, e não soltas nos componentes.
 * O guia usa também os tokens do app (maré, luz, texto) para "pertencer" à interface.
 */

/** Tom de pele escolhível, em vez de um tom fixo (cuidado de representatividade, docs/08, seção 7). */
export const tonsDePele = {
  claro: '#F2D3B3',
  medio: '#D9A27A',
  moreno: '#A86F4C',
  escuro: '#6E4630',
} as const;

/** Cores de cabelo, incluindo grisalho: o público é adulto. */
export const coresDeCabelo = {
  escuro: '#2B2F3A',
  castanho: '#6B4430',
  mel: '#B07A45',
  grisalho: '#C9C4BC',
} as const;

export const ilustracao = {
  /** Traço do rosto (olhos, boca, sobrancelhas). */
  tinta: '#1B2333',
  /** Rubor próprio: o coral do erro (cor.atencao) nunca aparece num rosto feliz. */
  rubor: '#E8846F',
  /** Boca aberta da comemoração. */
  boca: '#7A2E3A',
  /** Vidro da lanterna. */
  vidro: '#FFF1C9',
  /** Brilho de cabelo, sobreposto com transparência a qualquer cor. */
  brilho: '#FFFFFF',
  /** Roupas por carreira e seus relevos (gola, bolsos). */
  roupaAdministrativo: '#2B5FD9',
  relevoAdministrativo: '#1B3F93',
  roupaTribunais: '#24324D',
  lapelaTribunais: '#16203A',
  roupaPolicial: '#2E4C80',
  relevoPolicial: '#1F3560',
  bolsoPolicial: '#26416F',
  /** Fundo do avatar de busto. */
  fundoDoAvatar: '#24395C',
} as const;
