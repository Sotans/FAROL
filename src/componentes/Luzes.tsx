import { StyleSheet, View } from 'react-native';

import { cor, limites, raio } from '@/tema/tokens';

/** As 5 luzes do desafio. Cada erro apaga uma, sem vermelho e sem alarde. */
export function Luzes({ acesas }: { acesas: number }) {
  return (
    <View style={estilos.linha} accessible accessibilityLabel={`${acesas} de ${limites.luzesDoDesafio} luzes acesas`}>
      {Array.from({ length: limites.luzesDoDesafio }, (_, i) => (
        <View key={i} style={[estilos.luz, i < acesas ? estilos.acesa : estilos.apagada]} />
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  luz: { width: 20, height: 20, borderRadius: raio.circulo },
  acesa: {
    backgroundColor: cor.luz,
    shadowColor: cor.luz,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  apagada: { backgroundColor: cor.linha },
});
