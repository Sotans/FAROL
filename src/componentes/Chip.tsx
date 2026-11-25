import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { cor, fonte, raio, tamanho } from '@/tema/tokens';

type Props = { texto: string; tom?: 'luz' | 'mare'; icone?: ReactNode };

export function Chip({ texto, tom = 'mare', icone }: Props) {
  const cores = tom === 'luz' ? { texto: cor.luz, fundo: cor.luzVeu } : { texto: cor.mareClaro, fundo: cor.mareVeu };
  return (
    <View style={[estilos.chip, { backgroundColor: cores.fundo }]}>
      {icone}
      <Text style={[estilos.texto, { color: cores.texto }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: raio.circulo,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  texto: {
    fontFamily: fonte.textoSemi,
    fontSize: tamanho.xs,
  },
});
