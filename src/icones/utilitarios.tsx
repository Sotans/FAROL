import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { cor } from '@/tema/tokens';
import type { PropsIcone } from './tipos';

/**
 * Ícones utilitários do FAROL (grade de 24, traço arredondado).
 * Desenhados à mão no mesmo estilo dos ícones de conquista: a maioria leva um ponto de luz.
 */

const traco = { strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

export function IconeFechar({ tamanho = 24, cor: c = cor.textoSuave }: PropsIcone) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path d="M6.5 6.5 L17.5 17.5 M17.5 6.5 L6.5 17.5" stroke={c} {...traco} />
    </Svg>
  );
}

export function IconeVisto({ tamanho = 24, cor: c = cor.acerto }: PropsIcone) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path d="M5 12.5 L10 17 L19 7.5" stroke={c} {...traco} strokeWidth={2.8} />
    </Svg>
  );
}

export function IconeSeta({ tamanho = 24, cor: c = cor.acerto }: PropsIcone) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path d="M4 12 H19 M13.5 6.5 L19 12 L13.5 17.5" stroke={c} {...traco} />
    </Svg>
  );
}

/**
 * Cadeado. A fechadura é traço, não luz: com vários nós bloqueados, pontos âmbar
 * em todos eles quebrariam a regra da luz (o âmbar fica no nó atual).
 */
export function IconeCadeado({ tamanho = 24, cor: c = cor.textoSuave }: PropsIcone) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path d="M8 11 V8.5 a4 4 0 0 1 8 0 V11 M12 15 V17.5" stroke={c} {...traco} />
      <Rect x={5} y={11} width={14} height={10} rx={3} stroke={c} {...traco} />
    </Svg>
  );
}

/** A dica é uma lanterna. Apagada quando as dicas do dia acabaram. */
export function IconeLanterna({ tamanho = 24, cor: c = cor.luz, acesa = true }: PropsIcone & { acesa?: boolean }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path d="M9.2 5 a2.8 2.8 0 0 1 5.6 0" stroke={c} {...traco} strokeWidth={2} />
      <Rect x={7} y={5} width={10} height={3} rx={1.5} fill={c} />
      <Rect x={8} y={8} width={8} height={10} rx={2} stroke={c} {...traco} strokeWidth={2} />
      <Circle cx={12} cy={13} r={2.4} fill={acesa ? cor.luz : cor.linha} />
      <Rect x={7} y={18} width={10} height={2.6} rx={1.3} fill={c} />
    </Svg>
  );
}

/** Lista de módulos: o primeiro marcador aceso indica onde você está. */
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

/** Guardar o progresso (cadastro): um escudo com visto. Em maré, porque é informação, não conquista. */
export function IconeEscudo({ tamanho = 24, cor: c = cor.mareClaro }: PropsIcone) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Path
        d="M12 3.5 L19 6.2 V11.5 C19 16 15.8 19.2 12 20.7 C8.2 19.2 5 16 5 11.5 V6.2 Z M9 12 L11.2 14.2 L15.2 9.8"
        stroke={c}
        {...traco}
      />
    </Svg>
  );
}
