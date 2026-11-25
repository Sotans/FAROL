import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { IconeFaisca } from '@/icones';
import { cor, fonte, raio, tamanho } from '@/tema/tokens';

/**
 * Contador de acertos seguidos na barra da lição.
 * Sobe com um pulo a cada acerto. Ao zerar, só esmaece: perder a sequência não é comunicado,
 * o ciclo simplesmente recomeça (pedido do fundador, 2026-11-16).
 */
export function SequenciaDeAcertos({ valor }: { valor: number }) {
  const reduzir = useReducedMotion();
  const escala = useSharedValue(1);
  const opacidade = useSharedValue(valor > 0 ? 1 : 0.35);

  useEffect(() => {
    if (valor > 0) {
      opacidade.value = withTiming(1, { duration: 150 });
      if (!reduzir) escala.value = withSequence(withSpring(1.35, { damping: 6, stiffness: 260 }), withSpring(1));
    } else {
      opacidade.value = withTiming(0.35, { duration: 500 });
    }
  }, [valor, reduzir, escala, opacidade]);

  const estilo = useAnimatedStyle(() => ({ opacity: opacidade.value, transform: [{ scale: escala.value }] }));

  return (
    <Animated.View style={[estilos.caixa, estilo]} accessible accessibilityLabel={`${valor} acertos seguidos`}>
      <IconeFaisca tamanho={16} />
      <Text style={estilos.texto}>{valor}</Text>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  caixa: {
    minHeight: 40,
    minWidth: 52,
    paddingHorizontal: 10,
    borderRadius: raio.circulo,
    borderWidth: 1,
    borderColor: cor.linha,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { fontFamily: fonte.tituloMedio, fontSize: tamanho.sm, color: cor.luz },
});
