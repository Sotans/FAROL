import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { Carreira } from '@/carreiras/dados';
import { cor, raio } from '@/tema/tokens';

type Props = { carreira: Carreira; tamanho?: number };

/**
 * O guia: o profissional da carreira escolhida, com a luz do farol na mão.
 * PROVISÓRIO (emoji): o personagem-base e as variações vêm na submeta 1.12.
 * Animação leve de "respirar", como previsto em docs/08-design-sensorial.md.
 */
export function Personagem({ carreira, tamanho = 120 }: Props) {
  const reduzir = useReducedMotion();
  const respiro = useSharedValue(1);

  useEffect(() => {
    if (reduzir) return;
    respiro.value = withRepeat(withTiming(1.04, { duration: 1700, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [reduzir, respiro]);

  const animado = useAnimatedStyle(() => ({ transform: [{ scale: respiro.value }] }));
  const lampada = tamanho * 0.17;

  return (
    <Animated.View
      style={[{ width: tamanho, height: tamanho }, estilos.raiz, animado]}
      accessible
      accessibilityLabel={`Seu guia da carreira ${carreira.nome}, segurando uma luz`}>
      <View style={[estilos.halo, { width: tamanho, height: tamanho, opacity: 0.14 }]} />
      <View style={[estilos.halo, { width: tamanho * 0.78, height: tamanho * 0.78, opacity: 0.24 }]} />
      <Text style={{ fontSize: tamanho * 0.48, lineHeight: tamanho * 0.62 }}>{carreira.personagem}</Text>
      <View
        style={[estilos.lampada, { width: lampada, height: lampada, right: tamanho * 0.07, bottom: tamanho * 0.09 }]}
      />
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  raiz: { alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', borderRadius: raio.circulo, backgroundColor: cor.luz },
  lampada: {
    position: 'absolute',
    borderRadius: raio.circulo,
    backgroundColor: cor.luz,
    shadowColor: cor.luz,
    shadowOpacity: 0.9,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
});
