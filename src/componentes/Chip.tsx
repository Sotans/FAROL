import { StyleSheet, Text, View } from 'react-native';

import { cor, fonte, raio } from '@/tema/tokens';

type Props = { texto: string; tom?: 'luz' | 'mare' };

export function Chip({ texto, tom = 'mare' }: Props) {
  const cores =
    tom === 'luz'
      ? { texto: cor.luz, fundo: 'rgba(255,200,87,0.12)' }
      : { texto: '#8FB2FF', fundo: 'rgba(43,95,217,0.2)' };
  return (
    <View style={[estilos.chip, { backgroundColor: cores.fundo }]}>
      <Text style={[estilos.texto, { color: cores.texto }]}>{texto.toUpperCase()}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: raio.circulo,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  texto: {
    fontFamily: fonte.textoSemi,
    fontSize: 11,
    letterSpacing: 0.6,
  },
});
