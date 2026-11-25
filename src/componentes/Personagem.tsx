import { useEffect, useId, useState, type ReactNode } from 'react';
import { View } from 'react-native';
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
import { coresDeCabelo, ilustracao as il, tonsDePele } from '@/tema/ilustracao';
import { cor } from '@/tema/tokens';

/**
 * O guia: o profissional da carreira escolhida, com a lanterna do farol na mão
 * (docs/08-design-sensorial.md, seção 7). Base modular: o corpo é o mesmo para todas as
 * carreiras; mudam a roupa e os adereços. A lanterna é a marca e nunca muda.
 *
 * Versão refinada (análise de design de 2026-11-25, quadros 7 e 8): braços que saem do ombro,
 * mão em luva, lanterna 25% maior, rosto com sobrancelha, nariz e orelha, rubor próprio,
 * 4 cabelos em 4 cores, as expressões "pensando" e "descansando" e o avatar de busto.
 */

export type Expressao =
  'acenando' | 'feliz' | 'comemorando' | 'incentivando' | 'acolhendo' | 'pensando' | 'descansando';
export const expressoes: Expressao[] = [
  'acenando',
  'feliz',
  'comemorando',
  'incentivando',
  'acolhendo',
  'pensando',
  'descansando',
];

export type TomDePele = keyof typeof tonsDePele;
export { tonsDePele };

export type Cabelo = 'curto' | 'cacheado' | 'coque' | 'longo';
export const cabelos: Cabelo[] = ['curto', 'cacheado', 'coque', 'longo'];

export type CorDoCabelo = keyof typeof coresDeCabelo;
export { coresDeCabelo };

const TINTA = il.tinta;
const LARGURA = 120;
const ALTURA = 160;

// ---------- Corpo por carreira ----------

const OMBROS = 'M28 160 V122 C28 102 42 90 60 90 C78 90 92 102 92 122 V160 Z';

type Visual = { roupa: string; detalhe: ReactNode; bone: boolean };

/** O que muda por carreira. As carreiras ainda sem conteúdo aparecem como silhueta. */
const visualDaCarreira: Partial<Record<CarreiraId, Visual>> = {
  // Crachá no cordão, com a luz do FAROL.
  administrativo: {
    roupa: il.roupaAdministrativo,
    bone: false,
    detalhe: (
      <G>
        <Path
          d="M47 92 Q60 105 73 92"
          stroke={il.relevoAdministrativo}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        <Path d="M49 93 L60 113 L71 93" stroke={cor.texto} strokeWidth={1.8} fill="none" opacity={0.85} />
        <Rect x={52} y={111} width={16} height={20} rx={3} fill={cor.texto} />
        <Path d="M52 114 A3 3 0 0 1 55 111 H65 A3 3 0 0 1 68 114 V116.5 H52 Z" fill={cor.selecionadaFundo} />
        <Circle cx={60} cy={123.5} r={3.2} fill={cor.luz} />
      </G>
    ),
  },
  // Blazer, camisa e gravata; um broche de luz na lapela.
  tribunais: {
    roupa: il.roupaTribunais,
    bone: false,
    detalhe: (
      <G>
        <Path d="M48 92 L60 115 L72 92 Z" fill={cor.texto} />
        <Path d="M57.5 95 H62.5 L64.2 109 L60 114 L55.8 109 Z" fill={cor.mare} />
        <Path d="M48 92 L56 117 M72 92 L64 117" stroke={il.lapelaTribunais} strokeWidth={2.2} strokeLinecap="round" />
        <Circle cx={76} cy={107} r={2.8} fill={cor.luz} />
      </G>
    ),
  },
  // Farda amigável: bolsos e um distintivo em escudo com a luz do FAROL. Sem arma e sem brasão real.
  policial: {
    roupa: il.roupaPolicial,
    bone: true,
    detalhe: (
      <G>
        <Path
          d="M48 92 L60 103 L72 92"
          stroke={il.relevoPolicial}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Rect x={42} y={110} width={12} height={10} rx={2.5} fill={il.bolsoPolicial} />
        <Rect x={66} y={110} width={12} height={10} rx={2.5} fill={il.bolsoPolicial} />
        <Path
          d="M72 98.5 L76.5 100.3 V103.5 C76.5 106.3 74.5 108 72 109.2 C69.5 108 67.5 106.3 67.5 103.5 V100.3 Z"
          fill={cor.luz}
        />
      </G>
    ),
  },
};

// ---------- Poses ----------

/** Mangas (cor da roupa), mãos (cor da pele) e onde fica a lanterna (topo, em coordenadas do desenho). */
type Pose = {
  mangas: [string, string];
  maos: [number, number][];
  lanterna: { x: number; y: number };
  /** Polegar para cima (incentivando). */
  polegar?: [number, number];
};

const poses: Record<Expressao, Pose> = {
  feliz: {
    mangas: ['M41 101 Q30 117 33 131', 'M79 101 Q91 116 89 127'],
    maos: [
      [33, 133],
      [89, 129],
    ],
    lanterna: { x: 89, y: 132 },
  },
  acenando: {
    mangas: ['M41 101 Q24 90 27 70', 'M79 101 Q91 116 89 127'],
    maos: [
      [27, 66],
      [89, 129],
    ],
    lanterna: { x: 89, y: 132 },
  },
  comemorando: {
    mangas: ['M41 101 Q24 88 28 66', 'M79 101 Q96 88 92 66'],
    maos: [
      [28, 62],
      [92, 62],
    ],
    // Erguida: a lanterna fica acima da mão.
    lanterna: { x: 92, y: 37 },
  },
  incentivando: {
    mangas: ['M41 101 Q25 109 32 93', 'M79 101 Q91 116 89 127'],
    maos: [
      [32, 90],
      [89, 129],
    ],
    lanterna: { x: 89, y: 132 },
    polegar: [30, 77],
  },
  acolhendo: {
    mangas: ['M41 101 Q45 118 56 114', 'M79 101 Q89 114 85 124'],
    maos: [
      [57, 113],
      [85, 126],
    ],
    lanterna: { x: 85, y: 129 },
  },
  // Mão no queixo: dica, "Ainda não vi isso".
  pensando: {
    mangas: ['M41 101 Q31 98 44 85', 'M79 101 Q91 116 89 127'],
    maos: [
      [46, 81],
      [89, 129],
    ],
    lanterna: { x: 89, y: 132 },
  },
  // Braços soltos e a lanterna mais baixa: "Terminar por hoje", meta cumprida.
  descansando: {
    mangas: ['M41 101 Q35 118 41 130', 'M79 101 Q86 116 83 128'],
    maos: [
      [41, 132],
      [83, 130],
    ],
    lanterna: { x: 83, y: 133 },
  },
};

// ---------- Cabelo ----------

/** Parte do cabelo que fica atrás da cabeça (só o longo tem). */
function CabeloDeTras({ cabelo, c }: { cabelo: Cabelo; c: string }) {
  if (cabelo !== 'longo') return null;
  return (
    <Path
      d="M31 54 C28 31 43 20 60 20 C77 20 92 31 89 54 L91 84 C91 89 86 91 82 88 L80 64 H40 L38 88 C34 91 29 89 29 84 Z"
      fill={c}
    />
  );
}

/** Parte do cabelo que fica sobre a cabeça, com um traço de brilho. */
function CabeloDaFrente({ cabelo, c }: { cabelo: Cabelo; c: string }) {
  const brilho = (d: string) => (
    <Path d={d} stroke={il.brilho} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.18} />
  );
  if (cabelo === 'cacheado')
    return (
      <G>
        <Circle cx={37} cy={39} r={8.5} fill={c} />
        <Circle cx={47} cy={29} r={10} fill={c} />
        <Circle cx={60} cy={25} r={11} fill={c} />
        <Circle cx={73} cy={29} r={10} fill={c} />
        <Circle cx={83} cy={39} r={8.5} fill={c} />
        <Circle cx={33.5} cy={48} r={5.5} fill={c} />
        <Circle cx={86.5} cy={48} r={5.5} fill={c} />
        <Path d="M36 46 C40 36 50 32 60 32 C70 32 80 36 84 46 C77 40 69 38 60 38 C51 38 43 40 36 46 Z" fill={c} />
        {brilho('M52 20 C56 17.5 61 17 65 18')}
      </G>
    );
  if (cabelo === 'coque')
    return (
      <G>
        <Circle cx={60} cy={16} r={9} fill={c} />
        <Path
          d="M32.5 53 C30 30 45 21 60 21 C77 21 90 31 87.5 51 C80 42 70 38.5 60 39 C49 39.5 40 45 32.5 53 Z"
          fill={c}
        />
        <Path d="M53 23.5 H67" stroke={TINTA} strokeWidth={2.2} strokeLinecap="round" opacity={0.25} />
      </G>
    );
  if (cabelo === 'longo')
    return (
      <G>
        <Path d="M33 52 C31 32 45 22 60 22 C75 22 89 32 87 52 C83 42 74 36.5 64 36 C58 40 48 43 33 52 Z" fill={c} />
        {brilho('M47 27.5 C52 24.5 58 23.8 64 24.5')}
      </G>
    );
  return (
    <G>
      <Path
        d="M32.5 53 C30 30 45 21 60 21 C77 21 90 31 87.5 51 C83 44 77 40.5 70 39.5 C66 42.5 61 44 55 44 C46 44 38 47 32.5 53 Z"
        fill={c}
      />
      {brilho('M45 28 C50 25 56 24 62 24.5')}
    </G>
  );
}

function Bone() {
  return (
    <G>
      <Path d="M33 45 C33 29 45 21 60 21 C75 21 87 29 87 45 Z" fill={il.roupaPolicial} />
      <Path d="M29 44 H91 C91 48.5 87.5 50.5 84 50.5 H36 C32.5 50.5 29 48.5 29 44 Z" fill={il.relevoPolicial} />
      <Path
        d="M60 28 L64.5 29.8 V33 C64.5 35.8 62.5 37.5 60 38.7 C57.5 37.5 55.5 35.8 55.5 33 V29.8 Z"
        fill={cor.luz}
      />
    </G>
  );
}

// ---------- Rosto ----------

const traco = { stroke: TINTA, fill: 'none', strokeLinecap: 'round' } as const;

function OlhosAbertos({ dx = 0, dy = 0 }: { dx?: number; dy?: number }) {
  return (
    <G>
      <Ellipse cx={49.5 + dx} cy={56 + dy} rx={3.4} ry={4.4} fill={TINTA} />
      <Circle cx={50.7 + dx} cy={54.4 + dy} r={1.2} fill={il.brilho} />
      <Ellipse cx={70.5 + dx} cy={56 + dy} rx={3.4} ry={4.4} fill={TINTA} />
      <Circle cx={71.7 + dx} cy={54.4 + dy} r={1.2} fill={il.brilho} />
    </G>
  );
}

function Rosto({ expressao, piscando }: { expressao: Expressao; piscando: boolean }) {
  const base = (
    <G>
      {/* Nariz e rubor (tom próprio, nunca o coral do erro). */}
      <Path d="M58.8 61.5 Q60 63 61.2 61.5" {...traco} strokeWidth={1.6} opacity={0.3} />
      <Ellipse cx={42.5} cy={64} rx={4.5} ry={3} fill={il.rubor} opacity={0.35} />
      <Ellipse cx={77.5} cy={64} rx={4.5} ry={3} fill={il.rubor} opacity={0.35} />
    </G>
  );
  const sobrancelhasSuaves = (
    <Path d="M44.5 47.5 Q49.5 45.5 54 47 M66 47 Q70.5 45.5 75.5 47.5" {...traco} strokeWidth={2} opacity={0.7} />
  );
  const piscar = <Path d="M46 56 H53 M67 56 H74" {...traco} strokeWidth={2.4} />;
  const olhosAbertos = piscando ? piscar : <OlhosAbertos />;

  switch (expressao) {
    case 'comemorando':
      return (
        <G>
          {base}
          <Path d="M45.5 57 Q49.5 52 53.5 57 M66.5 57 Q70.5 52 74.5 57" {...traco} strokeWidth={2.6} />
          <Path d="M44.5 45.5 Q49.5 43 54 45 M66 45 Q70.5 43 75.5 45.5" {...traco} strokeWidth={2} opacity={0.7} />
          <Path
            d="M50.5 65.5 Q60 80 69.5 65.5 Z"
            fill={il.boca}
            stroke={TINTA}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </G>
      );
    case 'incentivando':
      return (
        <G>
          {base}
          {olhosAbertos}
          <Path d="M45 47.5 L54 45.5 M66 45.5 L75 47.5" {...traco} strokeWidth={2.2} />
          <Path d="M52.5 66.5 Q60 72.5 68 65.5" {...traco} strokeWidth={2.6} />
        </G>
      );
    case 'acolhendo':
      return (
        <G>
          {base}
          <Path d="M45.5 56 Q49.5 59.5 53.5 56 M66.5 56 Q70.5 59.5 74.5 56" {...traco} strokeWidth={2.6} />
          <Path d="M45 46.5 Q49.5 46 54 47.5 M66 47.5 Q70.5 46 75 46.5" {...traco} strokeWidth={2} opacity={0.7} />
          <Path d="M54.5 67.5 Q60 71 65.5 67.5" {...traco} strokeWidth={2.6} />
        </G>
      );
    case 'pensando':
      return (
        <G>
          {base}
          {piscando ? piscar : <OlhosAbertos dx={1.5} dy={-1.5} />}
          <Path d="M44.5 47.5 Q49.5 46.5 54 47.5 M66 44.5 Q70.5 42 75.5 44" {...traco} strokeWidth={2} opacity={0.8} />
          <Path d="M55 68 Q60 69 65 67" {...traco} strokeWidth={2.6} />
        </G>
      );
    case 'descansando':
      return (
        <G>
          {base}
          <Path d="M45.5 56 Q49.5 59 53.5 56 M66.5 56 Q70.5 59 74.5 56" {...traco} strokeWidth={2.6} />
          <Path d="M45 48 Q49.5 47 54 48 M66 48 Q70.5 47 75 48" {...traco} strokeWidth={2} opacity={0.6} />
          <Path d="M55 67.5 Q60 70.5 65 67.5" {...traco} strokeWidth={2.6} />
          {/* Lua pequena: o dia acabou, a trilha continua amanhã. */}
          <Path d="M100 10 A9 9 0 1 0 108 24 A7 7 0 1 1 100 10 Z" fill={cor.textoSuave} />
        </G>
      );
    default:
      // feliz e acenando
      return (
        <G>
          {base}
          {olhosAbertos}
          {sobrancelhasSuaves}
          <Path d="M52 67 Q60 74 68 67" {...traco} strokeWidth={2.6} />
        </G>
      );
  }
}

// ---------- Lanterna ----------

/** A lanterna do farol, 25% maior que a primeira versão. (x, y) é o topo da alça. */
function Lanterna({ x, y, id }: { x: number; y: number; id: string }) {
  return (
    <G>
      <Circle cx={x} cy={y + 13} r={17} fill={`url(#${id})`} />
      <Path
        d={`M${x - 4.5} ${y + 1} A4.5 4.5 0 0 1 ${x + 4.5} ${y + 1}`}
        stroke={cor.texto}
        strokeWidth={2}
        fill="none"
      />
      <Rect x={x - 7.5} y={y + 1} width={15} height={4.2} rx={2} fill={cor.texto} />
      <Rect
        x={x - 6.2}
        y={y + 5.2}
        width={12.4}
        height={14.6}
        rx={3}
        fill={il.vidro}
        stroke={cor.texto}
        strokeWidth={1.8}
      />
      <Circle cx={x} cy={y + 12.5} r={3.8} fill={cor.luz} />
      <Circle cx={x} cy={y + 12.5} r={1.5} fill={il.brilho} opacity={0.8} />
      <Rect x={x - 7.5} y={y + 19.8} width={15} height={3.8} rx={1.9} fill={cor.texto} />
    </G>
  );
}

// ---------- Desenho completo ----------

type Aparencia = {
  carreira: Carreira;
  expressao?: Expressao;
  tom?: TomDePele;
  cabelo?: Cabelo;
  corDoCabelo?: CorDoCabelo;
  /** Silhueta: para carreiras "em breve". A lanterna continua acesa. */
  silhueta?: boolean;
};

/** As camadas do guia, na ordem de pintura. `piscando` só vale para olhos abertos. */
function Desenho({
  carreira,
  expressao = 'feliz',
  tom = 'medio',
  cabelo = 'curto',
  corDoCabelo = 'escuro',
  silhueta = false,
  piscando,
  id,
}: Aparencia & { piscando: boolean; id: string }) {
  const visual = visualDaCarreira[carreira.id];
  const apagado = silhueta || !visual;
  const pele = apagado ? cor.linha : tonsDePele[tom];
  const roupa = apagado ? cor.linha : visual.roupa;
  const corCabelo = coresDeCabelo[corDoCabelo];
  const pose = poses[apagado ? 'feliz' : expressao];

  return (
    <G>
      <Defs>
        {/* Brilho que some nas bordas: âmbar translúcido chapado viraria uma mancha escura sobre o fundo. */}
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={cor.luz} stopOpacity={0.8} />
          <Stop offset="0.45" stopColor={cor.luz} stopOpacity={0.32} />
          <Stop offset="1" stopColor={cor.luz} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {!apagado ? <CabeloDeTras cabelo={cabelo} c={corCabelo} /> : null}
      <Path d={OMBROS} fill={roupa} />
      {!apagado ? visual.detalhe : null}

      {/* Mangas: saem de dentro do ombro, mais grossas que antes. */}
      {pose.mangas.map((d) => (
        <Path key={d} d={d} stroke={roupa} strokeWidth={13} strokeLinecap="round" fill="none" />
      ))}

      <Lanterna x={pose.lanterna.x} y={pose.lanterna.y} id={id} />

      {/* Pescoço, orelhas e cabeça */}
      <Rect x={53} y={74} width={14} height={18} rx={5} fill={pele} />
      <Rect x={53} y={74} width={14} height={7} fill={TINTA} opacity={apagado ? 0 : 0.12} />
      <Circle cx={33} cy={56} r={5.6} fill={pele} />
      <Circle cx={87} cy={56} r={5.6} fill={pele} />
      {!apagado ? (
        <G>
          <Circle cx={33.6} cy={56} r={2.4} fill={TINTA} opacity={0.1} />
          <Circle cx={86.4} cy={56} r={2.4} fill={TINTA} opacity={0.1} />
        </G>
      ) : null}
      <Ellipse cx={60} cy={52} rx={27.5} ry={27} fill={pele} />

      {!apagado ? visual.bone ? <Bone /> : <CabeloDaFrente cabelo={cabelo} c={corCabelo} /> : null}
      {!apagado ? <Rosto expressao={expressao} piscando={piscando} /> : null}

      {/* Mãos em luva, por cima das mangas e da alça da lanterna. */}
      {pose.maos.map(([x, y]) => (
        <Ellipse key={`${x}-${y}`} cx={x} cy={y} rx={6.6} ry={7.2} fill={pele} />
      ))}
      {pose.polegar && !apagado ? (
        <Rect x={pose.polegar[0]} y={pose.polegar[1]} width={4.4} height={9} rx={2.2} fill={pele} />
      ) : null}
    </G>
  );
}

/** Id do gradiente da lanterna, único por desenho (sem ":", que não vale dentro de url(#...)). */
function useIdDoBrilho(): string {
  return `brilhoDaLanterna${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

type Props = Aparencia & { tamanho?: number };

export function Personagem({ tamanho = 120, silhueta = false, expressao = 'feliz', ...aparencia }: Props) {
  const reduzir = useReducedMotion();
  const respiro = useSharedValue(1);
  const [piscando, setPiscando] = useState(false);
  const id = useIdDoBrilho();

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
  const apagado = silhueta || !visualDaCarreira[aparencia.carreira.id];
  const altura = (tamanho * ALTURA) / LARGURA;

  return (
    <Animated.View
      style={[{ width: tamanho, height: altura }, animado]}
      accessible
      accessibilityLabel={
        apagado
          ? `${aparencia.carreira.nome}, em breve`
          : `Seu guia da carreira ${aparencia.carreira.nome}, ${expressao}, com a lanterna do farol`
      }>
      <Svg width={tamanho} height={altura} viewBox={`0 0 ${LARGURA} ${ALTURA}`}>
        <Desenho {...aparencia} expressao={expressao} silhueta={silhueta} piscando={piscando} id={id} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Avatar de busto, para tamanhos pequenos (perfil, balão de fala, notificações).
 * Sem espaço para a lanterna, ela vira o ponto de luz no canto: a mesma assinatura dos ícones.
 */
export function AvatarDoGuia({
  tamanho = 48,
  expressao = 'feliz',
  comLuz = true,
  ...aparencia
}: Props & {
  /** Sem o ponto de luz: em listas de opções, vários pontos âmbar quebrariam a regra da luz. */
  comLuz?: boolean;
}) {
  const id = useIdDoBrilho();
  const ponto = Math.max(10, Math.round(tamanho * 0.26));
  const borda = Math.max(2, Math.round(tamanho * 0.05));
  return (
    <View
      style={{ width: tamanho, height: tamanho }}
      accessible
      accessibilityLabel={`Seu guia da carreira ${aparencia.carreira.nome}`}>
      <View
        style={{
          width: tamanho,
          height: tamanho,
          borderRadius: tamanho / 2,
          overflow: 'hidden',
          backgroundColor: il.fundoDoAvatar,
        }}>
        <Svg width={tamanho} height={tamanho} viewBox="22 14 76 76">
          <Desenho {...aparencia} expressao={expressao} piscando={false} id={id} />
        </Svg>
      </View>
      {comLuz ? (
        <View
          style={{
            position: 'absolute',
            right: -borda / 2,
            top: 0,
            width: ponto,
            height: ponto,
            borderRadius: ponto / 2,
            backgroundColor: cor.luz,
            borderWidth: borda,
            borderColor: cor.fundo,
          }}
        />
      ) : null}
    </View>
  );
}
