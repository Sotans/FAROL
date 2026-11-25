import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '@/componentes/Botao';
import { rotuloMateria, rotuloNivel, type Materia, type ResultadoDaMateria } from '@/diagnostico/dados';
import { useProgresso } from '@/estado/progresso';
import { haptico } from '@/servicos/haptico';
import { tocar } from '@/servicos/som';
import { cor, fonte, raio, tamanho } from '@/tema/tokens';

/** T7. O resultado como conquista: nível, ponto forte e o que vale tentar pular. */
export default function MapaDoPontoDePartida() {
  const { mapa } = useProgresso();

  useEffect(() => {
    haptico.sucesso();
    tocar('meta');
  }, []);

  if (!mapa) return <Redirect href="/" />;

  const materias: Materia[] = ['portugues', 'constitucional'];
  const podePular = mapa.portugues.nivel !== 'iniciante';

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={estilos.corpo} showsVerticalScrollIndicator={false}>
        <Text style={estilos.titulo} accessibilityRole="header">
          Seu ponto de partida
        </Text>
        <Text style={estilos.sub}>Sua trilha foi ajustada a partir daqui.</Text>

        {materias.map((m, i) => (
          <Animated.View key={m} entering={FadeInDown.delay(200 + i * 250).duration(350)}>
            <CartaoDaMateria nome={rotuloMateria[m]} resultado={mapa[m]} />
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.delay(800).duration(350)} style={estilos.sugestao}>
          <Text style={estilos.sugestaoTexto}>
            {podePular
              ? 'Sugestão: você já conhece crase. Na trilha, use "Pular pra cá?" para provar e avançar.'
              : 'Sugestão: comece pelo básico, uma lição por dia. O resto vem.'}
          </Text>
        </Animated.View>
      </ScrollView>
      <View style={estilos.rodape}>
        <Botao rotulo="Ver minha trilha" onPress={() => router.replace('/')} />
      </View>
    </SafeAreaView>
  );
}

function CartaoDaMateria({ nome, resultado }: { nome: string; resultado: ResultadoDaMateria }) {
  return (
    <View style={estilos.cartao} accessible accessibilityLabel={`${nome}: ${rotuloNivel[resultado.nivel]}`}>
      <View style={estilos.cartaoLinha}>
        <Text style={estilos.cartaoNome}>{nome}</Text>
        <Text style={estilos.cartaoNivel}>{rotuloNivel[resultado.nivel]}</Text>
      </View>
      <View style={estilos.trilho}>
        <View style={[estilos.preenchimento, { width: `${Math.round(resultado.fracao * 100)}%` }]} />
      </View>
      <Text style={estilos.cartaoSub}>
        {resultado.pontoForte ? `Ponto forte: ${resultado.pontoForte}` : 'Vamos começar pelo básico.'}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo, paddingHorizontal: 16 },
  corpo: { paddingTop: 20, paddingBottom: 16, gap: 12 },
  // O mapa é uma conquista: título com a voz das conquistas (Fraunces).
  titulo: { fontFamily: fonte.conquista, fontSize: tamanho.xxl - 2, color: cor.luzClara },
  sub: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave, marginTop: -6, marginBottom: 6 },
  cartao: {
    backgroundColor: cor.superficie,
    borderColor: cor.linha,
    borderWidth: 1,
    borderRadius: raio.lg,
    padding: 14,
    gap: 8,
  },
  cartaoLinha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartaoNome: { fontFamily: fonte.tituloMedio, fontSize: tamanho.md, color: cor.texto },
  cartaoNivel: { fontFamily: fonte.textoSemi, fontSize: tamanho.sm, color: cor.luz },
  trilho: { height: 10, backgroundColor: cor.linha, borderRadius: raio.circulo, overflow: 'hidden' },
  preenchimento: { height: '100%', backgroundColor: cor.luz, borderRadius: raio.circulo },
  cartaoSub: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave },
  sugestao: { backgroundColor: cor.mareVeu, borderRadius: raio.lg, padding: 14 },
  sugestaoTexto: { fontFamily: fonte.texto, fontSize: tamanho.sm, lineHeight: 21, color: cor.texto },
  rodape: { paddingBottom: 12 },
});
