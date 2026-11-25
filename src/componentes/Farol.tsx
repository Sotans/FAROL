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

import { cor, raio } from '@/tema/tokens';

const LADO = 240;
const CENTRO = LADO / 2;

/** O farol da conclusão: surge e a luz gira (ver docs/08-design-sensorial.md). Provisório até o ícone final. */
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
      <Animated.View style={[estilos.feixes, feixes]}>
        <View style={estilos.feixeDireita} />
        <View style={estilos.feixeEsquerda} />
      </Animated.View>
      <View style={estilos.torre}>
        <View style={estilos.faixa} />
        <View style={[estilos.faixa, { marginTop: 22 }]} />
      </View>
      <View style={estilos.lampada} />
    </Animated.View>
  );
}

const luzSuave = cor.luzBrilho;

const estilos = StyleSheet.create({
  raiz: { width: LADO, height: 280, alignItems: 'center' },
  feixes: { position: 'absolute', top: 0, left: 0, width: LADO, height: LADO },
  feixeDireita: {
    position: 'absolute',
    left: CENTRO,
    top: CENTRO - 24,
    width: 0,
    height: 0,
    borderTopWidth: 24,
    borderBottomWidth: 24,
    borderRightWidth: 112,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: luzSuave,
  },
  feixeEsquerda: {
    position: 'absolute',
    left: CENTRO - 112,
    top: CENTRO - 24,
    width: 0,
    height: 0,
    borderTopWidth: 24,
    borderBottomWidth: 24,
    borderLeftWidth: 112,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: luzSuave,
  },
  torre: {
    position: 'absolute',
    top: CENTRO + 14,
    width: 52,
    height: 120,
    backgroundColor: cor.texto,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    paddingTop: 20,
    overflow: 'hidden',
  },
  faixa: { height: 18, backgroundColor: cor.mare },
  lampada: {
    position: 'absolute',
    top: CENTRO - 20,
    width: 40,
    height: 40,
    borderRadius: raio.circulo,
    backgroundColor: cor.luz,
    shadowColor: cor.luz,
    shadowOpacity: 0.9,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
});
