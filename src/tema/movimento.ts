import { Easing, withSpring, withTiming, type EntryExitAnimationFunction } from 'react-native-reanimated';

/**
 * Valores de movimento do FAROL (skill icons8:motion). Toda duração, curva e mola de
 * animação nova vem daqui, para o app inteiro se mover do mesmo jeito.
 *
 * - entrar ou sair: `saida` (começa rápido, assenta devagar);
 * - mover ou transformar na tela: `meio`;
 * - nada de "ease-in" na interface: ele atrasa justo o momento em que a pessoa está olhando.
 */
export const curva = {
  saida: Easing.bezier(0.23, 1, 0.32, 1),
  meio: Easing.bezier(0.77, 0, 0.175, 1),
} as const;

export const duracao = {
  /** Resposta a um toque (lanterna, número da aba, pílula da aba). */
  toque: 150,
  /** O traço do visto se desenhando. */
  desenho: 200,
  /** Barras e entradas de cartões. */
  transicao: 250,
  /** O anel da meta completando a parte nova. */
  anel: 300,
  /** Momentos raros de comemoração (contagem do XP). */
  comemoracao: 700,
} as const;

/** Mola leve (quique de cerca de 0,2): conquistas e a luz da sequência. */
export const mola = { damping: 14, stiffness: 220 } as const;

/**
 * Entrada pequena: surge de 0,9 com opacidade, nunca de escala zero.
 * Com "reduzir movimento", só a opacidade.
 */
export function entradaSuave(ms: number = duracao.toque, reduzir = false): EntryExitAnimationFunction {
  return () => {
    'worklet';
    const config = { duration: ms, easing: curva.saida };
    return {
      initialValues: { opacity: 0, transform: [{ scale: reduzir ? 1 : 0.9 }] },
      animations: { opacity: withTiming(1, config), transform: [{ scale: withTiming(1, config) }] },
    };
  };
}

/** Entrada de comemoração: de 0,9 com uma mola leve. Com "reduzir movimento", só a opacidade. */
export function entradaComMola(reduzir = false): EntryExitAnimationFunction {
  return () => {
    'worklet';
    return {
      initialValues: { opacity: 0, transform: [{ scale: reduzir ? 1 : 0.9 }] },
      animations: {
        opacity: withTiming(1, { duration: duracao.transicao, easing: curva.saida }),
        transform: [{ scale: reduzir ? withTiming(1, { duration: 0 }) : withSpring(1, mola) }],
      },
    };
  };
}
