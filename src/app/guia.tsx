import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { carreiraPorId } from '@/carreiras/dados';
import { Balao } from '@/componentes/Balao';
import { Botao } from '@/componentes/Botao';
import { Personagem, tonsDePele, type TomDePele } from '@/componentes/Personagem';
import { useProgresso } from '@/estado/progresso';
import { haptico } from '@/servicos/haptico';
import { alvoMinimo, cor, fonte, raio, tamanho } from '@/tema/tokens';

const nomesDosTons: Record<TomDePele, string> = {
  claro: 'Tom de pele claro',
  medio: 'Tom de pele médio',
  moreno: 'Tom de pele moreno',
  escuro: 'Tom de pele escuro',
};

/** T2b. O guia se apresenta: alguém da sua carreira, com a luz do farol. */
export default function Guia() {
  const { carreira, tomDoGuia, definirTomDoGuia } = useProgresso();
  const c = carreiraPorId(carreira);
  if (!c) return <Redirect href="/carreira" />;

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.centro}>
        <Animated.View entering={FadeInDown.delay(500).duration(350)}>
          <Balao texto={`Oi! Eu vou te acompanhar na sua trilha de ${c.nome}. Vamos começar pequeno?`} />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Personagem carreira={c} expressao="acenando" tom={tomDoGuia} tamanho={150} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(900).duration(300)} style={estilos.tons}>
          <Text style={estilos.nota}>Como você quer ver seu guia?</Text>
          <View style={estilos.linhaDeTons}>
            {(Object.keys(tonsDePele) as TomDePele[]).map((tom) => (
              <Pressable
                key={tom}
                onPress={() => {
                  haptico.selecao();
                  definirTomDoGuia(tom);
                }}
                accessibilityRole="radio"
                accessibilityLabel={nomesDosTons[tom]}
                accessibilityState={{ selected: tom === tomDoGuia }}
                style={estilos.alvoDoTom}>
                <View
                  style={[
                    estilos.tom,
                    { backgroundColor: tonsDePele[tom] },
                    tom === tomDoGuia ? estilos.tomEscolhido : null,
                  ]}
                />
              </Pressable>
            ))}
          </View>
        </Animated.View>
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
  nota: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave },
  tons: { alignItems: 'center', gap: 6, marginTop: 10 },
  linhaDeTons: { flexDirection: 'row', gap: 4 },
  alvoDoTom: { width: alvoMinimo, height: alvoMinimo, alignItems: 'center', justifyContent: 'center' },
  tom: { width: 32, height: 32, borderRadius: raio.circulo, borderWidth: 2, borderColor: 'transparent' },
  tomEscolhido: { borderColor: cor.luz, transform: [{ scale: 1.12 }] },
  rodape: { paddingBottom: 12 },
});
