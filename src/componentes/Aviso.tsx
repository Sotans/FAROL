import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import { cor, fonte, raio, tamanho } from '@/tema/tokens';

/** Aviso curto que some sozinho. */
export function useAviso(duracaoMs = 2400) {
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), duracaoMs);
    return () => clearTimeout(t);
  }, [aviso, duracaoMs]);

  return { aviso, mostrarAviso: setAviso };
}

export function Aviso({ texto, topo = 92 }: { texto: string | null; topo?: number }) {
  if (!texto) return null;
  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOut}
      style={[estilos.aviso, { top: topo }]}
      accessibilityLiveRegion="polite">
      <Text style={estilos.texto}>{texto}</Text>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  aviso: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: cor.superficie,
    borderColor: cor.luz,
    borderWidth: 1,
    borderRadius: raio.md,
    padding: 12,
  },
  texto: { fontFamily: fonte.texto, fontSize: tamanho.sm, lineHeight: 20, color: cor.texto },
});
