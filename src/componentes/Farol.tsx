import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { cor } from '@/tema/tokens';
import { IlustracaoDoFarol, LAMPADA_NA_IMAGEM, PROPORCAO_DO_FAROL } from './Ilustracoes';

const LARGURA = 240;
const ALTURA_DA_IMAGEM = 250;
const LARGURA_DA_IMAGEM = ALTURA_DA_IMAGEM * PROPORCAO_DO_FAROL;
/** Centro da lâmpada dentro do quadro: os feixes giram em volta dele. */
const LAMPADA = {
  x: (LARGURA - LARGURA_DA_IMAGEM) / 2 + LARGURA_DA_IMAGEM * LAMPADA_NA_IMAGEM.x,
  y: ALTURA_DA_IMAGEM * LAMPADA_NA_IMAGEM.y,
};
/** Os feixes vivem num quadrado com centro na lâmpada. */
const LADO_DOS_FEIXES = 280;
const META = LADO_DOS_FEIXES / 2;
const COMPRIMENTO = 130;
const ABERTURA = 22;

/**
 * O farol da conclusão: a ilustração com a lâmpada acesa, e os feixes girando em volta dela
 * (docs/08-design-sensorial.md). Surge com uma mola; com "reduzir movimento", aparece parado.
 */
export function Farol() {
  const reduzir = useReducedMotion();
  const giro = useSharedValue(0);
  const entrada = useSharedValue(0.6);
  const opacidade = useSharedValue(0);

  useEffect(() => {
    opacidade.value = withTiming(1, { duration: 300 });
    if (reduzir) {
      entrada.value = 1;
      return;
    }
    entrada.value = withSpring(1, { damping: 12 });
    giro.value = withRepeat(withTiming(360, { duration: 4200, easing: Easing.linear }), -1, false);
  }, [reduzir, giro, entrada, opacidade]);

  const geral = useAnimatedStyle(() => ({
    opacity: opacidade.value,
    transform: [{ scale: entrada.value }],
  }));
  const feixes = useAnimatedStyle(() => ({ transform: [{ rotate: `${giro.value}deg` }] }));

  return (
    <Animated.View style={[estilos.raiz, geral]} accessible accessibilityLabel="Um farol acende sua luz">
      {/* Os feixes ficam atrás da ilustração: saem da lâmpada e passam por trás da torre. */}
      <Animated.View style={[estilos.feixes, feixes]}>
        <View style={estilos.feixeDireita} />
        <View style={estilos.feixeEsquerda} />
      </Animated.View>
      <IlustracaoDoFarol estado="atual" altura={ALTURA_DA_IMAGEM} decorativa />
    </Animated.View>
  );
}

const luzSuave = cor.luzBrilho;

const estilos = StyleSheet.create({
  raiz: { width: LARGURA, height: ALTURA_DA_IMAGEM, alignItems: 'center' },
  feixes: {
    position: 'absolute',
    left: LAMPADA.x - META,
    top: LAMPADA.y - META,
    width: LADO_DOS_FEIXES,
    height: LADO_DOS_FEIXES,
  },
  feixeDireita: {
    position: 'absolute',
    left: META,
    top: META - ABERTURA,
    width: 0,
    height: 0,
    borderTopWidth: ABERTURA,
    borderBottomWidth: ABERTURA,
    borderRightWidth: COMPRIMENTO,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: luzSuave,
  },
  feixeEsquerda: {
    position: 'absolute',
    left: META - COMPRIMENTO,
    top: META - ABERTURA,
    width: 0,
    height: 0,
    borderTopWidth: ABERTURA,
    borderBottomWidth: ABERTURA,
    borderLeftWidth: COMPRIMENTO,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: luzSuave,
  },
});
