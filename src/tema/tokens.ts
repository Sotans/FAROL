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
  // borda de controles (3,45:1 sobre o fundo) e maré clara para texto e ícones sobre superfícies escuras
  linhaForte: '#53709F',
  mareClaro: '#8FB2FF',
  // luz clara: títulos de conquista sobre o fundo
  luzClara: '#FFE2A3',
  // bordas de profundidade dos nós da trilha
  relevoLuz: '#B88E2F',
  relevoAcerto: '#1F8F62',
  // caixa "Armadilha de prova": informação, em maré
  armadilhaFundo: 'rgba(43, 95, 217, 0.18)',
  armadilhaBorda: 'rgba(143, 178, 255, 0.4)',
  // derivadas usadas nos estados dos componentes
  selecionadaFundo: '#1B3A78',
  acertoFundo: '#123A33',
  atencaoFundo: '#3B2330',
  /** Véus e contornos translúcidos: fundos de destaque suave. */
  luzVeu: 'rgba(255,200,87,0.12)',
  luzContorno: 'rgba(255,200,87,0.4)',
  luzBrilho: 'rgba(255,200,87,0.32)',
  mareVeu: 'rgba(43,95,217,0.22)',
} as const;

// Nomes registrados em useFonts (ver src/app/_layout.tsx).
export const fonte = {
  titulo: 'Nunito_800ExtraBold',
  tituloMedio: 'Nunito_700Bold',
  texto: 'Inter_400Regular',
  textoSemi: 'Inter_600SemiBold',
  /** Rótulo de botão: Inter 700, em caixa normal. */
  botao: 'Inter_700Bold',
} as const;

/** Nada abaixo de 12 (xs): quem estuda cansado, à noite, precisa ler sem esforço. */
export const tamanho = { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32, logo: 40, celebracao: 56 } as const;
export const espaco = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32 } as const;
export const raio = { sm: 8, md: 12, lg: 16, circulo: 9999 } as const;
export const movimento = { microMs: 120, pequenoMs: 250, medioMs: 500, celebracaoMs: 1800 } as const;
export const alvoMinimo = 48;

/** Brilhos da luz (boxShadow). O primário brilha em vez de afundar; o nó atual brilha no feixe. */
export const brilho = {
  botao: '0 0 0 4px rgba(255, 200, 87, 0.16), 0 8px 28px rgba(255, 200, 87, 0.32)',
  botaoTocado: '0 0 0 6px rgba(255, 200, 87, 0.24), 0 8px 36px rgba(255, 200, 87, 0.5)',
  noAtual: '0 0 24px rgba(255, 200, 87, 0.55)',
  // "anel fino" do nó dominado
  anelDominada: '0 0 0 3px rgba(61, 220, 151, 0.35)',
} as const;

export const limites = {
  luzesDoDesafio: 5,
  dicasPorDia: 3,
  desafiosPorDia: 1,
  xpDaLicao: 25,
  xpDoDesafio: 50,
  xpDoFarol: 50,
  xpDaRevisao: 15,
} as const;
