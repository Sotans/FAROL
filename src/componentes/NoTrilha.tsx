import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { IconeCadeado, IconeComecar, IconeEstrelaDeLuz, IconeVisto } from '@/icones';
import { brilho, cor, fonte, raio, tamanho } from '@/tema/tokens';
import { IlustracaoDoFarol, LAMPADA_NA_IMAGEM, PROPORCAO_DO_FAROL } from './Ilustracoes';

export type EstadoNo = 'feita' | 'dominada' | 'atual' | 'bloqueada';
/** Trecho do caminho entre dois nós: aceso (já percorrido) ou apagado (à frente). */
export type Ligacao = 'acesa' | 'apagada';

/** Medidas fixas da trilha: o feixe do farol usa as mesmas para achar o centro de cada nó. */
export const ALTURA_DA_LINHA = 84;
export const ALTURA_DO_FAROL = 120;
export const COLUNA_DOS_NOS = 84;
/** A ilustração do farol no alto da trilha. */
export const ALTURA_DA_IMAGEM_DO_FAROL = 108;
export const LARGURA_DA_IMAGEM_DO_FAROL = ALTURA_DA_IMAGEM_DO_FAROL * PROPORCAO_DO_FAROL;
/** Onde fica a lâmpada dentro da ilustração, em pontos (o feixe sai daqui). */
export const LAMPADA_DO_FAROL = {
  x: LARGURA_DA_IMAGEM_DO_FAROL * LAMPADA_NA_IMAGEM.x,
  y: ALTURA_DA_IMAGEM_DO_FAROL * LAMPADA_NA_IMAGEM.y,
};

type Props = {
  estado: EstadoNo;
  rotulo: string;
  sub?: string;
  /** Convite "Pular pra cá?" como link discreto, embaixo da legenda. */
  convite?: string;
  /** O nó que fecha o módulo: desenhado como um farol, que acende ao ser concluído. */
  farol?: boolean;
  /** Trecho do caminho que liga este nó ao de cima e ao de baixo. */
  acima?: Ligacao;
  abaixo?: Ligacao;
  onPress: () => void;
};

/** O ícone de cada estado, na cor que contrasta com o fundo do nó. */
function IconeDoEstado({ estado }: { estado: EstadoNo }) {
  if (estado === 'feita') return <IconeVisto tamanho={24} cor={cor.fundo} />;
  if (estado === 'dominada') return <IconeEstrelaDeLuz tamanho={24} cor={cor.fundo} />;
  if (estado === 'atual') return <IconeComecar tamanho={26} cor={cor.textoSobreLuz} />;
  return <IconeCadeado tamanho={22} cor={cor.textoSuave} />;
}

function Trecho({ ligacao, lado }: { ligacao?: Ligacao; lado: 'acima' | 'abaixo' }) {
  if (!ligacao) return null;
  return (
    <View
      pointerEvents="none"
      style={[
        estilos.trecho,
        lado === 'acima' ? estilos.trechoAcima : estilos.trechoAbaixo,
        ligacao === 'acesa' ? estilos.trechoAceso : estilos.trechoApagado,
      ]}
    />
  );
}

/**
 * Nó da trilha "na linha da costa": os nós ficam numa linha reta à esquerda, como boias,
 * com a legenda ao lado. O farol do módulo fica no alto, à direita, e o feixe dele
 * (desenhado pela trilha) aponta o nó atual.
 */
export function NoTrilha({ estado, rotulo, sub, convite, farol = false, acima, abaixo, onPress }: Props) {
  const reduzir = useReducedMotion();
  const brilho = useSharedValue(0.3);

  useEffect(() => {
    if (estado === 'atual' && !reduzir && !farol) {
      brilho.value = withRepeat(withTiming(0.65, { duration: 1100 }), -1, true);
    }
  }, [estado, reduzir, farol, brilho]);

  const halo = useAnimatedStyle(() => ({ opacity: brilho.value }));
  const atual = estado === 'atual';
  const rotuloAcessivel = `${rotulo}${sub ? `, ${sub}` : ''}${convite ? `. ${convite}` : ''}`;

  if (farol) {
    // Na trilha, o farol guia: a lâmpada fica acesa (é dela que sai o feixe até o nó de hoje).
    // Quando o módulo termina, ele acende por inteiro, com os feixes abertos.
    const acesoPorInteiro = estado === 'feita' || estado === 'dominada';
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={rotuloAcessivel}
        style={estilos.linhaDoFarol}>
        <View style={estilos.legendaDoFarol}>
          <Text style={[estilos.rotulo, atual ? { color: cor.luz } : null]}>{rotulo}</Text>
          {sub ? <Text style={estilos.sub}>{sub}</Text> : null}
        </View>
        <IlustracaoDoFarol estado={acesoPorInteiro ? 'aceso' : 'atual'} altura={ALTURA_DA_IMAGEM_DO_FAROL} decorativa />
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={rotuloAcessivel} style={estilos.linha}>
      <View style={estilos.coluna}>
        <Trecho ligacao={acima} lado="acima" />
        <Trecho ligacao={abaixo} lado="abaixo" />
        {atual ? <Animated.View style={[estilos.halo, halo]} /> : null}
        <View style={[estilos.no, estilosEstado[estado], atual ? estilos.noAtual : null]}>
          <IconeDoEstado estado={estado} />
        </View>
      </View>
      <View style={estilos.legenda}>
        <Text style={[estilos.rotulo, atual ? estilos.rotuloAtual : null]}>{rotulo}</Text>
        {sub ? <Text style={[estilos.sub, atual ? { color: cor.texto } : null]}>{sub}</Text> : null}
        {convite ? <Text style={estilos.convite}>{convite}</Text> : null}
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  linha: { height: ALTURA_DA_LINHA, flexDirection: 'row', alignItems: 'center' },
  coluna: { width: COLUNA_DOS_NOS, height: ALTURA_DA_LINHA, alignItems: 'center', justifyContent: 'center' },
  trecho: { position: 'absolute', left: COLUNA_DOS_NOS / 2 - 2, width: 4, borderRadius: 2 },
  trechoAcima: { top: 0, height: ALTURA_DA_LINHA / 2 },
  trechoAbaixo: { bottom: 0, height: ALTURA_DA_LINHA / 2 },
  trechoAceso: { backgroundColor: cor.acerto, opacity: 0.6 },
  trechoApagado: { borderLeftWidth: 3, borderStyle: 'dashed', borderColor: cor.linhaForte, width: 0 },
  halo: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: raio.circulo,
    backgroundColor: cor.luz,
  },
  no: {
    width: 52,
    height: 52,
    borderRadius: raio.circulo,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAtual: { width: 60, height: 60, boxShadow: brilho.noAtual },
  legenda: { flex: 1, paddingLeft: 6, gap: 1 },
  rotulo: { fontFamily: fonte.tituloMedio, fontSize: tamanho.sm, color: cor.texto },
  rotuloAtual: { color: cor.luz, fontSize: tamanho.md },
  sub: { fontFamily: fonte.texto, fontSize: tamanho.xs, color: cor.textoSuave },
  convite: {
    fontFamily: fonte.textoSemi,
    fontSize: tamanho.xs,
    color: cor.texto,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  linhaDoFarol: {
    height: ALTURA_DO_FAROL,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    paddingRight: 8,
  },
  legendaDoFarol: { alignItems: 'flex-end' },
});

// Sem opacidade para "bloqueado": a borda forte já comunica (doc 11, regra 15).
const estilosEstado = StyleSheet.create({
  feita: { backgroundColor: cor.acerto, borderColor: cor.relevoAcerto },
  // Dominada é um tipo de concluída: verde com estrela, nunca o âmbar do nó atual.
  dominada: { backgroundColor: cor.acerto, borderColor: cor.relevoAcerto, boxShadow: brilho.anelDominada },
  atual: { backgroundColor: cor.luz, borderColor: cor.relevoLuz },
  bloqueada: { backgroundColor: cor.superficie, borderColor: cor.linhaForte },
});
