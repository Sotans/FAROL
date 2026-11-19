import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { IconeCadeado, IconeComecar, IconeEstrelaDeLuz, IconeFarol, IconeVisto, type EstadoDoFarol } from '@/icones';
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

/** O ícone de cada estado, na cor que contrasta com o fundo do nó. */
function IconeDoEstado({ estado }: { estado: EstadoNo }) {
  if (estado === 'feita') return <IconeVisto tamanho={26} cor={cor.fundo} />;
  if (estado === 'dominada') return <IconeEstrelaDeLuz tamanho={26} cor={cor.fundo} />;
  if (estado === 'atual') return <IconeComecar tamanho={28} cor={cor.textoSobreLuz} />;
  return <IconeCadeado tamanho={22} cor={cor.textoSuave} />;
}

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
              <IconeDoEstado estado={estado} />
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

/** Farol do módulo na trilha: apagado enquanto bloqueado, lâmpada acesa na vez dele, feixes quando concluído. */
function FarolDoNo({ estado }: { estado: EstadoNo }) {
  const estadoDoFarol: EstadoDoFarol =
    estado === 'feita' || estado === 'dominada' ? 'aceso' : estado === 'atual' ? 'atual' : 'apagado';
  return <IconeFarol tamanho={80} estado={estadoDoFarol} />;
}

const estilos = StyleSheet.create({
  linha: { height: 84, alignItems: 'center', justifyContent: 'center' },
  linhaComBolha: { height: 132 },
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
  haloFarol: { width: 44, height: 44, top: 2 },
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
