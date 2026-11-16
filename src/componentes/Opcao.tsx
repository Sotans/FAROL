import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { alvoMinimo, cor, fonte, raio, tamanho } from '@/tema/tokens';

export type EstadoOpcao = 'normal' | 'selecionada' | 'correta' | 'errada' | 'removida';

type Props = {
  texto: string;
  estado: EstadoOpcao;
  onPress: () => void;
  desabilitado?: boolean;
  compacta?: boolean;
};

const visual = {
  normal: { fundo: cor.superficie, borda: cor.linha, texto: cor.texto },
  selecionada: { fundo: cor.selecionadaFundo, borda: cor.mare, texto: cor.texto },
  correta: { fundo: cor.acertoFundo, borda: cor.acerto, texto: cor.acerto },
  errada: { fundo: cor.atencaoFundo, borda: cor.atencao, texto: cor.atencao },
  removida: { fundo: cor.superficie, borda: cor.linha, texto: cor.textoSuave },
} as const;

export function Opcao({ texto, estado, onPress, desabilitado = false, compacta = false }: Props) {
  const v = visual[estado];
  const reduzir = useReducedMotion();
  const deslocamento = useSharedValue(0);
  const escala = useSharedValue(1);

  useEffect(() => {
    if (reduzir) return;
    if (estado === 'errada') {
      deslocamento.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 80 }),
        withTiming(-5, { duration: 70 }),
        withTiming(0, { duration: 50 }),
      );
    } else if (estado === 'correta') {
      escala.value = withSequence(withSpring(1.04), withSpring(1));
    }
  }, [estado, reduzir, deslocamento, escala]);

  const animado = useAnimatedStyle(() => ({
    transform: [{ translateX: deslocamento.value }, { scale: escala.value }],
  }));

  const sufixo = estado === 'correta' ? '  ✓' : estado === 'errada' ? '  ✕' : '';

  return (
    <Animated.View style={[animado, compacta ? estilos.compactaRaiz : null]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: desabilitado, selected: estado === 'selecionada' }}
        disabled={desabilitado}
        onPress={onPress}
        style={[
          estilos.base,
          compacta ? estilos.compacta : null,
          {
            backgroundColor: v.fundo,
            borderColor: v.borda,
            opacity: estado === 'removida' ? 0.45 : 1,
          },
        ]}>
        <Text style={[estilos.texto, { color: v.texto }]}>{`${texto}${sufixo}`}</Text>
      </Pressable>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: alvoMinimo + 4,
    borderRadius: raio.md + 2,
    borderWidth: 2,
    borderBottomWidth: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  compactaRaiz: { alignSelf: 'flex-start' },
  compacta: { paddingHorizontal: 22 },
  texto: {
    fontFamily: fonte.textoSemi,
    fontSize: tamanho.md,
  },
});
