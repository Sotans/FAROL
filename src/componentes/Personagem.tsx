import { useEffect, useState, type ReactNode } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { Carreira, CarreiraId } from '@/carreiras/dados';
import { cor } from '@/tema/tokens';

/**
 * O guia: o profissional da carreira escolhida, com a lanterna do farol na mão
 * (docs/08-design-sensorial.md, seção 7). Base modular: o corpo é o mesmo para todas as
 * carreiras; mudam a roupa e os adereços. A lanterna é a marca e nunca muda.
 */

export type Expressao = 'acenando' | 'feliz' | 'comemorando' | 'incentivando' | 'acolhendo';
export const expressoes: Expressao[] = ['acenando', 'feliz', 'comemorando', 'incentivando', 'acolhendo'];

/** Tom de pele escolhível, em vez de um tom fixo (cuidado de representatividade, seção 7). */
export type TomDePele = 'claro' | 'medio' | 'moreno' | 'escuro';
export const tonsDePele: Record<TomDePele, string> = {
  claro: '#F2D3B3',
  medio: '#D9A27A',
  moreno: '#A86F4C',
  escuro: '#6E4630',
};

const TINTA = '#1B2333';
const CABELO = '#2B2F3A';

type Visual = { roupa: string; detalhe: ReactNode; cabeca: 'cabelo' | 'bone' };

/** O que muda por carreira. As carreiras ainda sem conteúdo aparecem como silhueta. */
const visualDaCarreira: Partial<Record<CarreiraId, Visual>> = {
  // Crachá no cordão.
  administrativo: {
    roupa: cor.mare,
    cabeca: 'cabelo',
    detalhe: (
      <G>
        <Path d="M50 90 L60 109 L70 90" stroke={cor.texto} strokeWidth={1.6} fill="none" opacity={0.8} />
        <Rect x={52.5} y={107} width={15} height={19} rx={2.5} fill={cor.texto} />
        <Rect x={52.5} y={107} width={15} height={5} rx={2.5} fill={cor.selecionadaFundo} />
        <Circle cx={60} cy={119} r={3} fill={cor.luz} />
      </G>
    ),
  },
  // Blazer, camisa e gravata; um broche de luz na lapela.
  tribunais: {
    roupa: '#24324D',
    cabeca: 'cabelo',
    detalhe: (
      <G>
        <Path d="M49 89 L60 110 L71 89 Z" fill={cor.texto} />
        <Path d="M57.6 92 H62.4 L64 106 L60 111 L56 106 Z" fill={cor.mare} />
        <Path d="M49 89 L56 112 M71 89 L64 112" stroke="#16203A" strokeWidth={2} />
        <Circle cx={75} cy={104} r={2.6} fill={cor.luz} />
      </G>
    ),
  },
  // Farda amigável: bolsos e um distintivo com a luz do FAROL. Sem arma e sem brasão real.
  policial: {
    roupa: '#2E4C80',
    cabeca: 'bone',
    detalhe: (
      <G>
        <Path d="M50 89 L60 99 L70 89" stroke="#1F3560" strokeWidth={3} fill="none" strokeLinejoin="round" />
        <Rect x={43} y={106} width={11} height={9} rx={2} fill="#26416F" />
        <Rect x={66} y={106} width={11} height={9} rx={2} fill="#26416F" />
        <Circle cx={71.5} cy={104} r={3.2} fill={cor.luz} />
      </G>
    ),
  },
};

/** Posição dos braços: onde fica cada mão e se a lanterna está erguida. */
type Pose = {
  livre: string;
  maoLivre: [number, number];
  lanterna: string;
  maoLanterna: [number, number];
  erguida: boolean;
};

const poses: Record<Expressao, Pose> = {
  feliz: {
    livre: 'M38 98 Q29 115 32 129',
    maoLivre: [32, 130],
    lanterna: 'M82 98 Q92 114 90 126',
    maoLanterna: [90, 127],
    erguida: false,
  },
  acenando: {
    livre: 'M38 98 Q22 86 24 67',
    maoLivre: [24, 65],
    lanterna: 'M82 98 Q92 114 90 126',
    maoLanterna: [90, 127],
    erguida: false,
  },
  comemorando: {
    livre: 'M38 98 Q21 84 25 63',
    maoLivre: [25, 61],
    lanterna: 'M82 98 Q99 84 95 63',
    maoLanterna: [95, 61],
    erguida: true,
  },
  incentivando: {
    livre: 'M38 98 Q22 106 30 90',
    maoLivre: [30, 88],
    lanterna: 'M82 98 Q92 114 90 126',
    maoLanterna: [90, 127],
    erguida: false,
  },
  acolhendo: {
    livre: 'M38 98 Q42 116 53 112',
    maoLivre: [54, 111],
    lanterna: 'M82 98 Q90 112 86 124',
    maoLanterna: [86, 125],
    erguida: false,
  },
};

function Rosto({ expressao, piscando }: { expressao: Expressao; piscando: boolean }) {
  const olhosFechados = expressao === 'comemorando';
  const olhosSuaves = expressao === 'acolhendo';
  const olho = (x: number) => {
    if (olhosFechados)
      return (
        <Path
          d={`M${x - 4} 56 Q${x} 51 ${x + 4} 56`}
          stroke={TINTA}
          strokeWidth={2.6}
          fill="none"
          strokeLinecap="round"
        />
      );
    if (olhosSuaves)
      return (
        <Path
          d={`M${x - 4} 55 Q${x} 58.5 ${x + 4} 55`}
          stroke={TINTA}
          strokeWidth={2.6}
          fill="none"
          strokeLinecap="round"
        />
      );
    if (piscando)
      return <Path d={`M${x - 3.5} 55.5 H${x + 3.5}`} stroke={TINTA} strokeWidth={2.4} strokeLinecap="round" />;
    return (
      <G>
        <Ellipse cx={x} cy={55} rx={3.2} ry={4.2} fill={TINTA} />
        <Circle cx={x + 1.1} cy={53.5} r={1.1} fill="#FFFFFF" />
      </G>
    );
  };
  const boca: Record<Expressao, ReactNode> = {
    feliz: <Path d="M52 65.5 Q60 72.5 68 65.5" stroke={TINTA} strokeWidth={2.6} fill="none" strokeLinecap="round" />,
    acenando: <Path d="M52 65.5 Q60 72.5 68 65.5" stroke={TINTA} strokeWidth={2.6} fill="none" strokeLinecap="round" />,
    comemorando: (
      <Path d="M50.5 64 Q60 79 69.5 64 Z" fill="#7A2E3A" stroke={TINTA} strokeWidth={2} strokeLinejoin="round" />
    ),
    incentivando: <Path d="M52.5 65 Q60 71 68 64" stroke={TINTA} strokeWidth={2.6} fill="none" strokeLinecap="round" />,
    acolhendo: (
      <Path d="M54.5 66.5 Q60 70 65.5 66.5" stroke={TINTA} strokeWidth={2.6} fill="none" strokeLinecap="round" />
    ),
  };
  return (
    <G>
      {olho(50)}
      {olho(70)}
      {expressao === 'incentivando' ? (
        <Path d="M45 47 L54 45 M66 45 L75 47" stroke={TINTA} strokeWidth={2.2} strokeLinecap="round" />
      ) : null}
      <Circle cx={43.5} cy={63} r={4} fill="#FF8A80" opacity={0.3} />
      <Circle cx={76.5} cy={63} r={4} fill="#FF8A80" opacity={0.3} />
      {boca[expressao]}
    </G>
  );
}

/** A lanterna do farol, presa na mão. Erguida, brilha mais. */
function Lanterna({ x, y, erguida }: { x: number; y: number; erguida: boolean }) {
  // Pendurada: o alto da lanterna fica logo abaixo da mão. Erguida: logo acima.
  const topo = erguida ? y - 24 : y + 3;
  return (
    <G>
      <Circle cx={x} cy={topo + 10.5} r={erguida ? 18 : 13} fill="url(#brilhoDaLanterna)" />
      <Path
        d={`M${x - 3.5} ${topo + 1} A3.5 3.5 0 0 1 ${x + 3.5} ${topo + 1}`}
        stroke={cor.texto}
        strokeWidth={1.8}
        fill="none"
      />
      <Rect x={x - 6} y={topo + 1} width={12} height={3.5} rx={1.6} fill={cor.texto} />
      <Rect
        x={x - 5}
        y={topo + 4.5}
        width={10}
        height={12}
        rx={2.4}
        fill="#FFF1C9"
        stroke={cor.texto}
        strokeWidth={1.6}
      />
      <Circle cx={x} cy={topo + 10.5} r={3} fill={cor.luz} />
      <Rect x={x - 6} y={topo + 16.5} width={12} height={3} rx={1.5} fill={cor.texto} />
    </G>
  );
}

type Props = {
  carreira: Carreira;
  expressao?: Expressao;
  tom?: TomDePele;
  tamanho?: number;
  /** Silhueta: para carreiras "em breve". */
  silhueta?: boolean;
};

export function Personagem({ carreira, expressao = 'feliz', tom = 'medio', tamanho = 120, silhueta = false }: Props) {
  const reduzir = useReducedMotion();
  const respiro = useSharedValue(1);
  const [piscando, setPiscando] = useState(false);

  // Respirar: escala bem leve, em laço.
  useEffect(() => {
    if (reduzir) return;
    respiro.value = withRepeat(withTiming(1.03, { duration: 1700, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [reduzir, respiro]);

  // Piscar a cada 4 segundos, por 130 ms.
  useEffect(() => {
    if (reduzir || silhueta) return;
    let fechar: ReturnType<typeof setTimeout> | undefined;
    const ciclo = setInterval(() => {
      setPiscando(true);
      fechar = setTimeout(() => setPiscando(false), 130);
    }, 4000);
    return () => {
      clearInterval(ciclo);
      if (fechar) clearTimeout(fechar);
    };
  }, [reduzir, silhueta]);

  const animado = useAnimatedStyle(() => ({ transform: [{ scale: respiro.value }] }));

  const visual = visualDaCarreira[carreira.id];
  const apagado = silhueta || !visual;
  const pele = apagado ? cor.linha : tonsDePele[tom];
  const roupa = apagado ? cor.linha : visual.roupa;
  const pose = poses[expressao];
  const bone = !apagado && visual.cabeca === 'bone';

  return (
    <Animated.View
      style={[{ width: tamanho, height: tamanho * 1.25 }, animado]}
      accessible
      accessibilityLabel={
        apagado
          ? `${carreira.nome}, em breve`
          : `Seu guia da carreira ${carreira.nome}, ${expressao}, com a lanterna do farol`
      }>
      <Svg width={tamanho} height={tamanho * 1.25} viewBox="0 0 120 150">
        <Defs>
          {/* Brilho que some nas bordas: âmbar translúcido chapado viraria uma mancha escura sobre o fundo. */}
          <RadialGradient id="brilhoDaLanterna" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={cor.luz} stopOpacity={0.75} />
            <Stop offset="0.45" stopColor={cor.luz} stopOpacity={0.3} />
            <Stop offset="1" stopColor={cor.luz} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {/* Corpo */}
        <Path d="M32 148 V117 C32 99 44 88 60 88 C76 88 88 99 88 117 V148 Z" fill={roupa} />
        {!apagado ? visual.detalhe : null}

        {/* Braços: manga na cor da roupa, mão na cor da pele */}
        <Path d={pose.livre} stroke={roupa} strokeWidth={11} strokeLinecap="round" fill="none" />
        <Path d={pose.lanterna} stroke={roupa} strokeWidth={11} strokeLinecap="round" fill="none" />
        <Circle cx={pose.maoLivre[0]} cy={pose.maoLivre[1]} r={6.2} fill={pele} />
        {expressao === 'incentivando' && !apagado ? (
          <Rect x={pose.maoLivre[0] - 1.8} y={pose.maoLivre[1] - 11} width={3.8} height={8} rx={1.9} fill={pele} />
        ) : null}
        <Circle cx={pose.maoLanterna[0]} cy={pose.maoLanterna[1]} r={6.2} fill={pele} />

        {/* Pescoço, orelhas e cabeça */}
        <Rect x={53.5} y={74} width={13} height={16} rx={4} fill={pele} />
        <Rect x={53.5} y={74} width={13} height={7} fill={TINTA} opacity={apagado ? 0 : 0.12} />
        <Circle cx={33.5} cy={55} r={5.2} fill={pele} />
        <Circle cx={86.5} cy={55} r={5.2} fill={pele} />
        <Circle cx={60} cy={52} r={27} fill={pele} />

        {bone ? (
          <G>
            <Path d="M33 45 C33 29 45 21 60 21 C75 21 87 29 87 45 Z" fill={roupa} />
            <Path d="M29 44 H91 C91 48.5 87.5 50.5 84 50.5 H36 C32.5 50.5 29 48.5 29 44 Z" fill="#1F3560" />
            <Circle cx={60} cy={33} r={4.6} fill={cor.luz} />
          </G>
        ) : (
          <Path
            d="M33 52 C31 31 45 22 60 22 C77 22 89 32 87 50 C80 41 70 37.5 60 38.5 C49 39 40 44 33 52 Z"
            fill={apagado ? cor.linha : CABELO}
          />
        )}

        {!apagado ? <Rosto expressao={expressao} piscando={piscando} /> : null}
        {!apagado ? <Lanterna x={pose.maoLanterna[0]} y={pose.maoLanterna[1]} erguida={pose.erguida} /> : null}
      </Svg>
    </Animated.View>
  );
}
