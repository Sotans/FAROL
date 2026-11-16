import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { cor, fonte, tamanho } from '@/tema/tokens';
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

const visual = {
  acerto: { fundo: cor.acertoFundo, texto: cor.acerto, botao: 'acerto' as const },
  erro: { fundo: cor.atencaoFundo, texto: cor.atencao, botao: 'atencao' as const },
  guiada: { fundo: cor.atencaoFundo, texto: cor.atencao, botao: 'atencao' as const },
  // Sem cor de acerto nem de erro: usado no diagnóstico, que nunca deve parecer prova.
  neutro: { fundo: cor.superficie, texto: cor.texto, botao: 'primario' as const },
};

export function FolhaFeedback({ tipo, titulo, texto, armadilha, rotuloBotao, onPress, semBotao = false }: Props) {
  const v = visual[tipo];
  return (
    <Animated.View entering={FadeInDown.duration(220)} style={[estilos.folha, { backgroundColor: v.fundo }]}>
      <Text style={[estilos.texto, { color: v.texto }]}>
        <Text style={estilos.titulo}>{`${titulo} `}</Text>
        {texto}
      </Text>
      {armadilha ? (
        <View style={estilos.armadilha}>
          <Text style={estilos.armadilhaTexto}>
            <Text style={estilos.titulo}>Armadilha de prova: </Text>
            {armadilha}
          </Text>
        </View>
      ) : null}
      {semBotao ? null : <Botao rotulo={rotuloBotao} variante={v.botao} onPress={onPress} />}
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  folha: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
    gap: 12,
  },
  texto: {
    fontFamily: fonte.texto,
    fontSize: tamanho.sm,
    lineHeight: 21,
  },
  titulo: { fontFamily: fonte.textoSemi },
  armadilha: {
    backgroundColor: 'rgba(255,200,87,0.12)',
    borderColor: 'rgba(255,200,87,0.4)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
  armadilhaTexto: {
    fontFamily: fonte.texto,
    fontSize: 13,
    lineHeight: 19,
    color: cor.luz,
  },
});
