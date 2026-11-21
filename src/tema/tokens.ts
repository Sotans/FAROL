// Tokens do design system do FAROL (Direção A, "Noite no Farol").
// Fonte de referência: docs/design-system/tokens.json. Mantenha os dois em sincronia.

export const cor = {
  fundo: '#0F1B2D',
  superficie: '#1A2A42',
  linha: '#26395A',
  texto: '#EAF0F8',
  textoSuave: '#9FB1C8',
  luz: '#FFC857',
  textoSobreLuz: '#0F1B2D',
  mare: '#2B5FD9',
  textoSobreMare: '#FFFFFF',
  acerto: '#3DDC97',
  atencao: '#FF8A80',
  sobreposicao: 'rgba(5, 9, 15, 0.6)',
  // derivadas usadas nos estados dos componentes
  selecionadaFundo: '#1B3A78',
  acertoFundo: '#123A33',
  atencaoFundo: '#3B2330',
} as const;

// Nomes registrados em useFonts (ver src/app/_layout.tsx).
export const fonte = {
  titulo: 'Nunito_800ExtraBold',
  tituloMedio: 'Nunito_700Bold',
  texto: 'Inter_400Regular',
  textoSemi: 'Inter_600SemiBold',
} as const;

export const tamanho = { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32 } as const;
export const espaco = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32 } as const;
export const raio = { sm: 8, md: 12, lg: 16, circulo: 9999 } as const;
export const movimento = { microMs: 120, pequenoMs: 250, medioMs: 500, celebracaoMs: 1800 } as const;
export const alvoMinimo = 48;

export const limites = {
  luzesDoDesafio: 5,
  dicasPorDia: 3,
  desafiosPorDia: 1,
  xpDaLicao: 25,
  xpDoDesafio: 50,
  xpDoFarol: 50,
  xpDaRevisao: 15,
} as const;
