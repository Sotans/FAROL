import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '@/componentes/Botao';
import { Luz } from '@/componentes/Luz';
import { cor, fonte, tamanho } from '@/tema/tokens';

/** T1. Uma frase e um botão. Sem cadastro, sem permissões. */
export default function BoasVindas() {
  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.centro}>
        <Luz />
        <Text style={estilos.logo} accessibilityRole="header">
          FAROL
        </Text>
        <Text style={estilos.promessa}>Estude alguns minutos por dia.{'\n'}O hábito vem depois.</Text>
      </View>
      <View style={estilos.rodape}>
        <Botao rotulo="Começar" onPress={() => router.push('/carreira')} />
        <Botao
          rotulo="Já tenho conta"
          variante="terciario"
          onPress={() => router.push({ pathname: '/conta', params: { modo: 'entrar' } })}
        />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo, paddingHorizontal: 16 },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  logo: { fontFamily: fonte.titulo, fontSize: tamanho.logo, letterSpacing: 6, color: cor.texto, marginTop: -8 },
  promessa: {
    fontFamily: fonte.texto,
    fontSize: tamanho.lg,
    lineHeight: 30,
    color: cor.textoSuave,
    textAlign: 'center',
    marginTop: 12,
  },
  rodape: { paddingBottom: 12, gap: 4 },
});
