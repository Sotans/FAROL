import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { IconeFechar, IconeLanterna, IconeVisto } from '@/icones';
import { cor, fonte, raio, tamanho } from '@/tema/tokens';
import { Botao } from './Botao';

type Props = {
  tipo: 'acerto' | 'erro' | 'guiada' | 'neutro';
  titulo: string;
  texto: string;
  armadilha?: string;
  rotuloBotao: string;
  onPress: () => void;
  semBotao?: boolean;
};

/**
 * Folha de feedback: a cor do resultado vem numa faixa de luz no topo, com ícone e título.
 * O corpo fica na cor da superfície e o botão é sempre o âmbar de "seguir".
 */
const visual = {
  acerto: { faixa: cor.acerto, titulo: cor.acerto },
  erro: { faixa: cor.atencao, titulo: cor.atencao },
  guiada: { faixa: cor.atencao, titulo: cor.atencao },
  // Sem cor de acerto nem de erro: usado no diagnóstico, que nunca deve parecer prova.
  neutro: { faixa: cor.linhaForte, titulo: cor.texto },
};

function IconeDoTipo({ tipo }: { tipo: Props['tipo'] }) {
  if (tipo === 'acerto') return <IconeVisto tamanho={20} cor={cor.acerto} />;
  if (tipo === 'erro') return <IconeFechar tamanho={20} cor={cor.atencao} />;
  if (tipo === 'guiada') return <IconeLanterna tamanho={20} cor={cor.atencao} />;
  return null;
}

export function FolhaFeedback({ tipo, titulo, texto, armadilha, rotuloBotao, onPress, semBotao = false }: Props) {
  const v = visual[tipo];
  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      style={[estilos.folha, { borderTopColor: v.faixa }]}
      accessibilityLiveRegion="polite">
      <View style={estilos.cabeca}>
        <IconeDoTipo tipo={tipo} />
        <Text style={[estilos.titulo, { color: v.titulo }]}>{titulo}</Text>
      </View>
      <Text style={estilos.texto}>{texto}</Text>
      {armadilha ? (
        <View style={estilos.armadilha}>
          <Text style={estilos.armadilhaTexto}>
            <Text style={estilos.armadilhaTitulo}>Armadilha de prova: </Text>
            {armadilha}
          </Text>
        </View>
      ) : null}
      {semBotao ? null : (
        <View style={estilos.botao}>
          <Botao rotulo={rotuloBotao} onPress={onPress} />
        </View>
      )}
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  folha: {
    backgroundColor: cor.superficie,
    borderTopWidth: 4,
    borderTopLeftRadius: raio.lg + 4,
    borderTopRightRadius: raio.lg + 4,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
    gap: 8,
  },
  cabeca: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titulo: { fontFamily: fonte.botao, fontSize: tamanho.md },
  texto: {
    fontFamily: fonte.texto,
    fontSize: tamanho.sm,
    lineHeight: 21,
    color: cor.texto,
  },
  // Armadilha é informação, não conquista: maré, não âmbar.
  armadilha: {
    backgroundColor: cor.armadilhaFundo,
    borderColor: cor.armadilhaBorda,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
  armadilhaTitulo: { fontFamily: fonte.textoSemi },
  armadilhaTexto: {
    fontFamily: fonte.texto,
    fontSize: 13,
    lineHeight: 19,
    color: cor.mareClaro,
  },
  botao: { marginTop: 6 },
});
