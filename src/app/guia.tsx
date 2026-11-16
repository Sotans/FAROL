import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { carreiraPorId } from '@/carreiras/dados';
import { Balao } from '@/componentes/Balao';
import { Botao } from '@/componentes/Botao';
import { Personagem } from '@/componentes/Personagem';
import { useProgresso } from '@/estado/progresso';
import { cor, fonte, tamanho } from '@/tema/tokens';

/** T2b. O guia se apresenta: alguém da sua carreira, com a luz do farol. */
export default function Guia() {
  const { carreira } = useProgresso();
  const c = carreiraPorId(carreira);
  if (!c) return <Redirect href="/carreira" />;

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.centro}>
        <Animated.View entering={FadeInDown.delay(500).duration(350)}>
          <Balao texto={`Oi! Eu vou te acompanhar na sua trilha de ${c.nome}. Vamos começar pequeno?`} />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Personagem carreira={c} tamanho={140} />
        </Animated.View>
        <Text style={estilos.nota}>Seu guia é provisório: o desenho final chega com o app.</Text>
      </View>
      <View style={estilos.rodape}>
        <Botao rotulo="VAMOS LÁ" onPress={() => router.push('/meta')} />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo, paddingHorizontal: 16 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  nota: { fontFamily: fonte.texto, fontSize: tamanho.xs, color: cor.textoSuave, marginTop: 18 },
  rodape: { paddingBottom: 12 },
});
