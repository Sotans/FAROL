import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { cor, fonte, raio } from '@/tema/tokens';

export type EstadoNo = 'feita' | 'dominada' | 'atual' | 'bloqueada';

type Props = {
  estado: EstadoNo;
  rotulo: string;
  sub?: string;
  /** Texto curto acima do nó, como o convite "Pular pra cá?". */
  bolha?: string;
  /** O nó que fecha o módulo: desenhado como um farol, que acende ao ser concluído. */
  farol?: boolean;
  deslocamento?: number; // zigue-zague horizontal
  onPress: () => void;
};

const glifo: Record<EstadoNo, string> = {
  feita: '✓',
  dominada: '★',
  atual: '▶',
  bloqueada: '🔒',
};

const corDoGlifo: Record<EstadoNo, string> = {
  feita: cor.fundo,
  dominada: cor.fundo,
  atual: cor.textoSobreLuz,
  bloqueada: cor.textoSuave,
};

export function NoTrilha({ estado, rotulo, sub, bolha, farol = false, deslocamento = 0, onPress }: Props) {
  const reduzir = useReducedMotion();
  const brilho = useSharedValue(0.25);

  useEffect(() => {
    if (estado === 'atual' && !reduzir) {
      brilho.value = withRepeat(withTiming(0.7, { duration: 1100 }), -1, true);
    }
  }, [estado, reduzir, brilho]);

  const halo = useAnimatedStyle(() => ({ opacity: brilho.value }));
  const atual = estado === 'atual';

  return (
    <View style={[estilos.linha, bolha ? estilos.linhaComBolha : null, farol ? estilos.linhaFarol : null]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${rotulo}${sub ? `, ${sub}` : ''}${bolha ? `, ${bolha}` : ''}`}
        style={[estilos.grupo, { transform: [{ translateX: deslocamento }] }]}>
        {bolha ? (
          <View style={estilos.bolha}>
            <Text style={estilos.bolhaTexto}>{bolha}</Text>
          </View>
        ) : null}
        <View style={farol ? estilos.areaFarol : estilos.area}>
          {atual ? <Animated.View style={[estilos.halo, farol ? estilos.haloFarol : null, halo]} /> : null}
          {farol ? (
            <FarolDoNo estado={estado} />
          ) : (
            <View style={[estilos.no, estilosEstado[estado], atual ? estilos.noAtual : null]}>
              <Text style={[estilos.glifo, { color: corDoGlifo[estado] }]}>{glifo[estado]}</Text>
            </View>
          )}
        </View>
        <View style={estilos.legenda}>
          <Text style={[estilos.rotulo, atual ? { color: cor.luz } : null]}>{rotulo}</Text>
          {sub ? <Text style={estilos.sub}>{sub}</Text> : null}
        </View>
      </Pressable>
    </View>
  );
}

/** Farol pequeno da trilha: apagado enquanto bloqueado, lâmpada acesa na vez dele, feixes quando concluído. */
function FarolDoNo({ estado }: { estado: EstadoNo }) {
  const aceso = estado === 'feita' || estado === 'dominada';
  const bloqueado = estado === 'bloqueada';
  return (
    <View style={[estilosFarol.raiz, bloqueado ? estilosFarol.apagado : null]}>
      {aceso ? (
        <>
          <View style={[estilosFarol.feixe, estilosFarol.feixeDireita]} />
          <View style={[estilosFarol.feixe, estilosFarol.feixeEsquerda]} />
        </>
      ) : null}
      <View style={[estilosFarol.lampada, { backgroundColor: bloqueado ? cor.linha : cor.luz }]} />
      <View style={estilosFarol.torre}>
        <View style={estilosFarol.faixa} />
        <View style={[estilosFarol.faixa, { marginTop: 8 }]} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { height: 84, alignItems: 'center', justifyContent: 'center' },
  linhaComBolha: { height: 112 },
  linhaFarol: { height: 120 },
  grupo: { alignItems: 'center', gap: 2 },
  bolha: {
    borderColor: cor.luz,
    borderWidth: 1.5,
    borderRadius: raio.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 2,
    backgroundColor: cor.superficie,
  },
  bolhaTexto: { fontFamily: fonte.textoSemi, fontSize: 11, letterSpacing: 0.4, color: cor.luz },
  area: { width: 84, height: 62, alignItems: 'center', justifyContent: 'center' },
  areaFarol: { width: 120, height: 84, alignItems: 'center', justifyContent: 'flex-end' },
  halo: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: raio.circulo,
    backgroundColor: cor.luz,
  },
  haloFarol: { width: 44, height: 44, top: -8 },
  no: {
    width: 52,
    height: 52,
    borderRadius: raio.circulo,
    borderWidth: 2,
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAtual: { width: 62, height: 62 },
  glifo: { fontFamily: fonte.titulo, fontSize: 20 },
  legenda: { alignItems: 'center' },
  rotulo: { fontFamily: fonte.tituloMedio, fontSize: 12, color: cor.texto },
  sub: { fontFamily: fonte.texto, fontSize: 11, color: cor.textoSuave },
});

const estilosEstado = StyleSheet.create({
  feita: { backgroundColor: cor.acerto, borderColor: '#1F8F62' },
  dominada: { backgroundColor: cor.luz, borderColor: '#B88E2F' },
  atual: { backgroundColor: cor.luz, borderColor: '#B88E2F' },
  bloqueada: { backgroundColor: cor.superficie, borderColor: cor.linha, opacity: 0.6 },
});

const luzSuave = 'rgba(255, 200, 87, 0.35)';

const estilosFarol = StyleSheet.create({
  raiz: { width: 120, height: 84, alignItems: 'center' },
  apagado: { opacity: 0.6 },
  feixe: {
    position: 'absolute',
    top: 4,
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  feixeDireita: { left: 66, borderLeftWidth: 50, borderLeftColor: luzSuave },
  feixeEsquerda: { right: 66, borderRightWidth: 50, borderRightColor: luzSuave },
  lampada: { marginTop: 4, width: 20, height: 20, borderRadius: raio.circulo },
  torre: {
    marginTop: 2,
    width: 26,
    height: 54,
    backgroundColor: cor.texto,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    paddingTop: 10,
    overflow: 'hidden',
  },
  faixa: { height: 8, backgroundColor: cor.mare },
});
