import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { IconeFechar, IconeVisto } from '@/icones';
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
  // linhaForte: borda de controle com 3,45:1 sobre o fundo (a 'linha' tinha 1,5:1).
  normal: { fundo: cor.superficie, borda: cor.linhaForte, texto: cor.texto },
  selecionada: { fundo: cor.selecionadaFundo, borda: cor.mare, texto: cor.texto },
  correta: { fundo: cor.acertoFundo, borda: cor.acerto, texto: cor.acerto },
  errada: { fundo: cor.atencaoFundo, borda: cor.atencao, texto: cor.atencao },
  removida: { fundo: cor.superficie, borda: cor.linhaForte, texto: cor.textoSuave },
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
        <View style={estilos.linha}>
          {/* Removida: além de apagada, riscada e com ✕, para a mensagem não depender só da cor. */}
          <Text style={[estilos.texto, { color: v.texto }, estado === 'removida' ? estilos.riscado : null]}>
            {texto}
          </Text>
          {estado === 'correta' ? <IconeVisto tamanho={18} cor={cor.acerto} /> : null}
          {estado === 'errada' ? <IconeFechar tamanho={18} cor={cor.atencao} /> : null}
          {estado === 'removida' ? <IconeFechar tamanho={16} cor={cor.textoSuave} /> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  riscado: { textDecorationLine: 'line-through' },
  base: {
    minHeight: alvoMinimo + 14,
    borderRadius: raio.md + 2,
    borderWidth: 2,
    borderBottomWidth: 4,
    paddingHorizontal: 14,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  compactaRaiz: { alignSelf: 'flex-start' },
  compacta: { paddingHorizontal: 22 },
  texto: {
    flexShrink: 1,
    fontFamily: fonte.textoSemi,
    fontSize: tamanho.md,
  },
});
