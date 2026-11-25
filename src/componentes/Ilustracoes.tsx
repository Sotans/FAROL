import { Image, type ImageStyle, type StyleProp } from 'react-native';

import type { Carreira, CarreiraId } from '@/carreiras/dados';

/**
 * Ilustrações do FAROL (geradas no Adobe Firefly e no ChatGPT a partir da identidade do app,
 * com o fundo removido em scripts/preparar-ilustracoes.py, que transforma o azul do fundo
 * em transparência e mantém o brilho das luzes como luz semitransparente).
 *
 * Elas entram nos momentos grandes. O guia em código (Personagem.tsx) continua onde há
 * personalização (pele, cabelo e cor) e em tamanhos pequenos.
 */

// ---------- Farol ----------

export type EstadoDaIlustracaoDoFarol = 'apagado' | 'atual' | 'aceso';

const farois = {
  apagado: require('../../assets/ilustracoes/farol-apagado.webp'),
  atual: require('../../assets/ilustracoes/farol-atual.webp'),
  aceso: require('../../assets/ilustracoes/farol-aceso.webp'),
} as const;

/** Largura ÷ altura das imagens dos 3 estados (mesmo enquadramento: 424 × 480). */
export const PROPORCAO_DO_FAROL = 424 / 480;
/** Onde fica a lâmpada, em fração da largura e da altura da imagem (medido nos estados acesos). */
export const LAMPADA_NA_IMAGEM = { x: 0.555, y: 0.273 };

const descricaoDoFarol: Record<EstadoDaIlustracaoDoFarol, string> = {
  apagado: 'Farol com a luz apagada',
  atual: 'Farol com a lâmpada acesa',
  aceso: 'Farol aceso, com feixes de luz',
};

export function IlustracaoDoFarol({
  estado,
  altura,
  style,
  decorativa = false,
}: {
  estado: EstadoDaIlustracaoDoFarol;
  altura: number;
  style?: StyleProp<ImageStyle>;
  /** Decorativa: o texto ao lado já diz o que ela mostra (leitores de tela pulam a imagem). */
  decorativa?: boolean;
}) {
  return (
    <Image
      source={farois[estado]}
      style={[{ width: altura * PROPORCAO_DO_FAROL, height: altura }, style]}
      resizeMode="contain"
      accessible={!decorativa}
      accessibilityRole={decorativa ? undefined : 'image'}
      accessibilityLabel={decorativa ? undefined : descricaoDoFarol[estado]}
    />
  );
}

/** O farol da tela de boas-vindas: aceso, com os feixes abertos (942 × 720). */
export function FarolDeBoasVindas({ largura }: { largura: number }) {
  return (
    <Image
      source={require('../../assets/ilustracoes/farol-heroi.webp')}
      style={{ width: largura, height: (largura * 720) / 942 }}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="Um farol aceso à noite, com feixes de luz sobre o mar"
    />
  );
}

// ---------- Guia ----------

export type PoseDoGuia = 'acenando' | 'comemorando';

type Figura = { fonte: number; largura: number; altura: number };

/** Tamanhos em pixels de cada arquivo, para manter a proporção. */
const guias: Partial<Record<CarreiraId, Record<PoseDoGuia, Figura>>> = {
  administrativo: {
    acenando: {
      fonte: require('../../assets/ilustracoes/guia-administrativo-acenando.webp'),
      largura: 486,
      altura: 840,
    },
    comemorando: {
      fonte: require('../../assets/ilustracoes/guia-administrativo-comemorando.webp'),
      largura: 620,
      altura: 919,
    },
  },
  tribunais: {
    acenando: { fonte: require('../../assets/ilustracoes/guia-tribunais-acenando.webp'), largura: 621, altura: 931 },
    comemorando: {
      fonte: require('../../assets/ilustracoes/guia-tribunais-comemorando.webp'),
      largura: 530,
      altura: 887,
    },
  },
  policial: {
    acenando: { fonte: require('../../assets/ilustracoes/guia-policial-acenando.webp'), largura: 464, altura: 810 },
    comemorando: {
      fonte: require('../../assets/ilustracoes/guia-policial-comemorando.webp'),
      largura: 648,
      altura: 954,
    },
  },
};

/** Há ilustração para esta carreira? (As carreiras "em breve" não têm.) */
export function temGuiaIlustrado(carreira: Carreira | null | undefined): carreira is Carreira {
  return !!carreira && !!guias[carreira.id];
}

/**
 * O guia ilustrado, para os momentos especiais (farol aceso, desafio vencido, mapa, conta).
 * `altura` é a da figura mais alta (o comemorando, com a lanterna erguida); as outras poses
 * ficam na mesma escala, para o guia não mudar de tamanho de uma tela para outra.
 */
export function GuiaIlustrado({ carreira, pose, altura }: { carreira: Carreira; pose: PoseDoGuia; altura: number }) {
  const figura = guias[carreira.id]?.[pose];
  if (!figura) return null;
  // Todas as figuras foram preparadas na mesma escala (corpo com 780 px); 960 px é a mais alta.
  const escala = altura / 960;
  return (
    <Image
      source={figura.fonte}
      style={{ width: figura.largura * escala, height: figura.altura * escala }}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel={`Seu guia da carreira ${carreira.nome}, ${pose === 'acenando' ? 'acenando' : 'comemorando com a lanterna erguida'}`}
    />
  );
}
