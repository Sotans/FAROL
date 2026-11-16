import { StyleSheet, Text, View } from 'react-native';

import { cor, fonte, raio, tamanho } from '@/tema/tokens';

/** Balão de fala do guia: no máximo 2 linhas, nunca com culpa (docs/08-design-sensorial.md, seção 7). */
export function Balao({ texto }: { texto: string }) {
  return (
    <View style={estilos.raiz}>
      <View style={estilos.balao}>
        <Text style={estilos.texto}>{texto}</Text>
      </View>
      <View style={estilos.rabo} />
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { alignItems: 'center', marginBottom: 14 },
  balao: {
    maxWidth: 300,
    backgroundColor: cor.superficie,
    borderColor: cor.linha,
    borderWidth: 1,
    borderRadius: raio.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  texto: { fontFamily: fonte.texto, fontSize: tamanho.md, lineHeight: 23, color: cor.texto, textAlign: 'center' },
  rabo: {
    width: 14,
    height: 14,
    marginTop: -8,
    backgroundColor: cor.superficie,
    borderColor: cor.linha,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    transform: [{ rotate: '45deg' }],
  },
});
