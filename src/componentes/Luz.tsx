import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { cor, raio } from '@/tema/tokens';

/** A luz do farol, pulsando devagar. Usada na tela de boas-vindas. */
export function Luz({ tamanho = 96 }: { tamanho?: number }) {
  const reduzir = useReducedMotion();
  const pulso = useSharedValue(0.6);

  useEffect(() => {
    if (reduzir) {
      pulso.value = 0.8;
      return;
    }
    pulso.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [reduzir, pulso]);

  const halo = useAnimatedStyle(() => ({
    opacity: pulso.value * 0.22,
    transform: [{ scale: 0.9 + pulso.value * 0.2 }],
  }));
  const haloExterno = useAnimatedStyle(() => ({
    opacity: pulso.value * 0.1,
    transform: [{ scale: 0.9 + pulso.value * 0.3 }],
  }));

  return (
    <View style={{ width: tamanho * 2, height: tamanho * 2, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={[estilos.circulo, { width: tamanho * 2, height: tamanho * 2 }, haloExterno]} />
      <Animated.View style={[estilos.circulo, { width: tamanho * 1.45, height: tamanho * 1.45 }, halo]} />
      <View style={[estilos.circulo, estilos.nucleo, { width: tamanho, height: tamanho }]} />
    </View>
  );
}

const estilos = StyleSheet.create({
  circulo: { position: 'absolute', borderRadius: raio.circulo, backgroundColor: cor.luz },
  nucleo: {
    shadowColor: cor.luz,
    shadowOpacity: 0.9,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 16,
  },
});
