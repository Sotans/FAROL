import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { curva, duracao } from '@/tema/movimento';
import { cor, raio } from '@/tema/tokens';

type Props = { valor: number }; // de 0 a 1

/**
 * Barra de progresso da lição. O preenchimento tem a largura do trilho e desliza (translateX),
 * em vez de mudar de largura: anima só transform, sem recalcular o layout a cada quadro,
 * e a ponta continua redonda em qualquer valor.
 */
export function BarraProgresso({ valor }: Props) {
  const [largura, setLargura] = useState(0);
  const progresso = useSharedValue(valor);

  useEffect(() => {
    progresso.value = withTiming(valor, { duration: duracao.transicao, easing: curva.saida });
  }, [valor, progresso]);

  const estilo = useAnimatedStyle(() => ({
    opacity: largura > 0 ? 1 : 0,
    transform: [{ translateX: (progresso.value - 1) * largura }],
  }));

  return (
    <View
      style={estilos.trilho}
      onLayout={(e) => setLargura(e.nativeEvent.layout.width)}
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
    width: '100%',
    height: '100%',
    backgroundColor: cor.luz,
    borderRadius: raio.circulo,
  },
});
