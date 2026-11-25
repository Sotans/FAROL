import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { cor } from '@/tema/tokens';
import type { PropsIcone } from './tipos';

/**
 * Ícones de marca usados na interface: a lanterna da dica e a lista de módulos.
 * Continuam desenhados à mão porque carregam a luz do FAROL. Os utilitários comuns
 * (fechar, visto, seta, cadeado, escudo) vêm da Lucide, em interface.tsx.
 *
 * Gramática (2026-11-25): grade de 24, traço de 2,4 e 1,8 só para detalhe interno.
 */

const traco = { strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

/** A dica é uma lanterna. Apagada quando as dicas do dia acabaram. Corpo em 2,4; alça em 1,8. */
export function IconeLanterna({ tamanho = 24, cor: c = cor.luz, acesa = true }: PropsIcone & { acesa?: boolean }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path d="M9.5 5.2 a2.5 2.5 0 0 1 5 0" stroke={c} {...traco} strokeWidth={1.8} />
      <Rect x={7} y={5} width={10} height={3} rx={1.5} fill={c} />
      <Rect x={8.2} y={8.2} width={7.6} height={9.6} rx={2} stroke={c} {...traco} />
      <Circle cx={12} cy={13} r={2.1} fill={acesa ? cor.luz : cor.linha} />
      <Rect x={7} y={18} width={10} height={2.6} rx={1.3} fill={c} />
    </Svg>
  );
}

/** Lista de módulos: o primeiro marcador aceso indica onde você está (o próximo passo). */
export function IconeModulos({ tamanho = 24, cor: c = cor.textoSobreMare }: PropsIcone) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Circle cx={5} cy={7} r={1.8} fill={cor.luz} />
      <Circle cx={5} cy={12} r={1.6} fill={c} />
      <Circle cx={5} cy={17} r={1.6} fill={c} />
      <Path d="M9.5 7 H19.5 M9.5 12 H19.5 M9.5 17 H16" stroke={c} {...traco} />
    </Svg>
  );
}
