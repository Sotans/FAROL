import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { cor, movimento, raio } from '@/tema/tokens';

type Props = { valor: number }; // de 0 a 1

export function BarraProgresso({ valor }: Props) {
  const progresso = useSharedValue(valor);

  useEffect(() => {
    progresso.value = withTiming(valor, { duration: movimento.medioMs });
  }, [valor, progresso]);

  const estilo = useAnimatedStyle(() => ({ width: `${Math.round(progresso.value * 100)}%` }));

  return (
    <View
      style={estilos.trilho}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(valor * 100) }}>
      <Animated.View style={[estilos.preenchimento, estilo]} />
    </View>
  );
}

const estilos = StyleSheet.create({
  trilho: {
    flex: 1,
    height: 12,
    backgroundColor: cor.linha,
    borderRadius: raio.circulo,
    overflow: 'hidden',
  },
  preenchimento: {
    height: '100%',
    backgroundColor: cor.luz,
    borderRadius: raio.circulo,
  },
});
