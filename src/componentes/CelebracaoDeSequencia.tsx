import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  ZoomIn,
  ZoomOut,
  type SharedValue,
} from 'react-native-reanimated';

import { cor, fonte, raio, tamanho } from '@/tema/tokens';

const RAIOS = 8;
const FAISCAS = 12;

/**
 * Pop-up rápido e animado a cada 5 acertos seguidos: luz que explode em raios e faíscas,
 * o número em destaque, e some sozinho. Nunca bloqueia a tela.
 */
export function CelebracaoDeSequencia({ valor }: { valor: number | null }) {
  if (valor === null) return null;
  return (
    <View style={estilos.cobertura} pointerEvents="none">
      <Conteudo valor={valor} />
    </View>
  );
}

function Conteudo({ valor }: { valor: number }) {
  const reduzir = useReducedMotion();
  const giro = useSharedValue(0);
  const progresso = useSharedValue(0);

  useEffect(() => {
    if (reduzir) return;
    giro.value = withTiming(70, { duration: 1300, easing: Easing.out(Easing.cubic) });
    progresso.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [reduzir, giro, progresso]);

  const raios = useAnimatedStyle(() => ({
    opacity: 1 - progresso.value * 0.9,
    transform: [{ rotate: `${giro.value}deg` }, { scale: 0.5 + progresso.value * 1.1 }],
  }));

  if (reduzir) {
    return (
      <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(200)} style={estilos.cartao}>
        <Text style={estilos.numero}>{valor}</Text>
        <Text style={estilos.rotulo}>acertos seguidos</Text>
      </Animated.View>
    );
  }

  return (
    <View style={estilos.centro}>
      <Animated.View style={[estilos.raios, raios]}>
        {Array.from({ length: RAIOS }, (_, i) => (
          <View key={i} style={[estilos.raio, { transform: [{ rotate: `${(360 / RAIOS) * i}deg` }] }]} />
        ))}
      </Animated.View>
      {Array.from({ length: FAISCAS }, (_, i) => (
        <Faisca key={i} angulo={(Math.PI * 2 * i) / FAISCAS + 0.2} progresso={progresso} />
      ))}
      <Animated.View
        entering={ZoomIn.springify().damping(9).stiffness(220)}
        exiting={ZoomOut.duration(180)}
        style={estilos.cartao}>
        <Text style={estilos.numero}>{valor}</Text>
        <Text style={estilos.rotulo}>acertos seguidos</Text>
      </Animated.View>
    </View>
  );
}

function Faisca({ angulo, progresso }: { angulo: number; progresso: SharedValue<number> }) {
  const distancia = 110 + ((angulo * 37) % 40);
  const estilo = useAnimatedStyle(() => {
    const p = progresso.value;
    return {
      opacity: 1 - p,
      transform: [
        { translateX: Math.cos(angulo) * distancia * p },
        { translateY: Math.sin(angulo) * distancia * p },
        { scale: 1.2 - p * 0.9 },
      ],
    };
  });
  return <Animated.View style={[estilos.faisca, estilo]} />;
}

const estilos = StyleSheet.create({
  cobertura: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centro: { alignItems: 'center', justifyContent: 'center' },
  raios: { position: 'absolute', width: 220, height: 220, alignItems: 'center', justifyContent: 'center' },
  raio: {
    position: 'absolute',
    width: 6,
    height: 220,
    borderRadius: raio.circulo,
    backgroundColor: cor.luz,
    opacity: 0.35,
  },
  faisca: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: raio.circulo,
    backgroundColor: cor.luz,
    shadowColor: cor.luz,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  cartao: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: raio.lg + 6,
    backgroundColor: cor.luz,
    alignItems: 'center',
    shadowColor: cor.luz,
    shadowOpacity: 0.8,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  numero: { fontFamily: fonte.titulo, fontSize: tamanho.celebracao, lineHeight: 60, color: cor.textoSobreLuz },
  rotulo: {
    fontFamily: fonte.tituloMedio,
    fontSize: tamanho.sm,
    letterSpacing: 0.5,
    color: cor.textoSobreLuz,
    marginTop: -2,
  },
});
