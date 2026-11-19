import type { ReactNode } from 'react';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

import type { CarreiraId } from '@/carreiras/dados';
import { cor } from '@/tema/tokens';
import { pontosDeEstrela } from './conquistas';

/**
 * Ilustrações das carreiras (docs/08-design-sensorial.md, seção 5, item 12).
 * Moldura comum: cartão escuro com um feixe de luz entrando pelo canto. Muda só o emblema.
 */

const emblemas: Record<CarreiraId, ReactNode> = {
  administrativo: (
    <>
      <Path
        d="M13 21 H25 L29 25 H49 A3 3 0 0 1 52 28 V46 A3 3 0 0 1 49 49 H15 A3 3 0 0 1 12 46 V24 A3 3 0 0 1 13 21 Z"
        fill={cor.selecionadaFundo}
      />
      <Rect x={18} y={17} width={26} height={20} rx={2} fill={cor.texto} />
      <Rect x={22} y={22} width={14} height={2.4} rx={1.2} fill={cor.linha} />
      <Rect x={22} y={27} width={10} height={2.4} rx={1.2} fill={cor.linha} />
      <Path d="M11 31 H53 V46 A3 3 0 0 1 50 49 H14 A3 3 0 0 1 11 46 Z" fill={cor.mare} />
      <Circle cx={32} cy={40} r={3.2} fill={cor.luz} />
    </>
  ),
  tribunais: (
    <>
      <Rect x={30.5} y={17} width={3} height={29} fill={cor.texto} />
      <Rect x={21} y={46} width={22} height={4} rx={2} fill={cor.texto} />
      <Rect x={13} y={20.5} width={38} height={3} rx={1.5} fill={cor.texto} />
      <Path d="M18 23 L12.5 36 M18 23 L23.5 36 M46 23 L40.5 36 M46 23 L51.5 36" stroke={cor.texto} strokeWidth={1.6} />
      <Path d="M10.5 36 H25.5 A7.5 5 0 0 1 10.5 36 Z" fill={cor.mare} />
      <Path d="M38.5 36 H53.5 A7.5 5 0 0 1 38.5 36 Z" fill={cor.mare} />
      <Circle cx={32} cy={16} r={4.2} fill={cor.luz} />
    </>
  ),
  policial: (
    <>
      <Path d="M32 11 L49 17.5 V30 C49 40.5 41.5 47.5 32 52 C22.5 47.5 15 40.5 15 30 V17.5 Z" fill={cor.mare} />
      <Path
        d="M32 15.5 L45 20.5 V30 C45 38.5 39 44 32 47.5 C25 44 19 38.5 19 30 V20.5 Z"
        fill="none"
        stroke={cor.texto}
        strokeWidth={1.5}
        opacity={0.35}
      />
      <Polygon points={pontosDeEstrela(32, 31, 5, 9, 4)} fill={cor.luz} />
    </>
  ),
  bancario: (
    <>
      <Rect x={17} y={42} width={30} height={7} rx={3.5} fill={cor.mare} />
      <Rect x={19} y={35} width={26} height={7} rx={3.5} fill={cor.selecionadaFundo} />
      <Rect x={17} y={28} width={30} height={7} rx={3.5} fill={cor.mare} />
      <Circle cx={32} cy={19} r={9.5} fill={cor.luz} />
      <Circle cx={32} cy={19} r={5.8} fill="none" stroke={cor.fundo} strokeWidth={2} />
    </>
  ),
  fiscal: (
    <>
      <Rect x={14} y={11} width={26} height={34} rx={3} fill={cor.texto} />
      <Rect x={19} y={18} width={16} height={2.6} rx={1.3} fill={cor.linha} />
      <Rect x={19} y={24} width={12} height={2.6} rx={1.3} fill={cor.linha} />
      <Rect x={19} y={30} width={14} height={2.6} rx={1.3} fill={cor.linha} />
      <Circle cx={40} cy={38} r={9} fill={cor.luz} opacity={0.25} stroke={cor.luz} strokeWidth={3.5} />
      <Path d="M46.5 44.5 L52.5 50.5" stroke={cor.luz} strokeWidth={4.5} strokeLinecap="round" />
    </>
  ),
  professor: (
    <>
      <Path d="M22 40 L17.5 52 M42 40 L46.5 52" stroke={cor.texto} strokeWidth={2.6} strokeLinecap="round" />
      <Rect x={11} y={13} width={42} height={28} rx={3} fill={cor.mare} stroke={cor.texto} strokeWidth={2.5} />
      <Path
        d="M17.5 22 H33 M17.5 28.5 H28 M17.5 35 H31"
        stroke={cor.texto}
        strokeWidth={2.2}
        strokeLinecap="round"
        opacity={0.85}
      />
      <Circle cx={43} cy={27} r={3.6} fill={cor.luz} />
    </>
  ),
  saude: (
    <>
      <Path
        d="M32 51 C14.5 39.5 11.5 29 15.5 21.5 C19.5 14 28.5 14.5 32 21 C35.5 14.5 44.5 14 48.5 21.5 C52.5 29 49.5 39.5 32 51 Z"
        fill={cor.mare}
      />
      <Rect x={29} y={23.5} width={6} height={17} rx={1.6} fill={cor.texto} />
      <Rect x={23.5} y={29} width={17} height={6} rx={1.6} fill={cor.texto} />
      <Circle cx={45.5} cy={17.5} r={3} fill={cor.luz} />
    </>
  ),
};

export function IlustracaoCarreira({ id, tamanho = 64 }: { id: CarreiraId; tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 64 64">
      <Rect x={0} y={0} width={64} height={64} rx={16} fill={cor.fundo} />
      <Polygon points="64,0 64,26 30,0" fill={cor.luz} opacity={0.13} />
      {emblemas[id]}
    </Svg>
  );
}
