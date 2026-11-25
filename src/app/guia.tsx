import { Redirect, router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { carreiraPorId } from '@/carreiras/dados';
import { Balao } from '@/componentes/Balao';
import { Botao } from '@/componentes/Botao';
import {
  AvatarDoGuia,
  cabelos,
  coresDeCabelo,
  Personagem,
  tonsDePele,
  type Cabelo,
  type CorDoCabelo,
  type TomDePele,
} from '@/componentes/Personagem';
import { useProgresso } from '@/estado/progresso';
import { haptico } from '@/servicos/haptico';
import { alvoMinimo, cor, fonte, raio, tamanho } from '@/tema/tokens';

const nomesDosTons: Record<TomDePele, string> = {
  claro: 'Tom de pele claro',
  medio: 'Tom de pele médio',
  moreno: 'Tom de pele moreno',
  escuro: 'Tom de pele escuro',
};

const nomesDosCabelos: Record<Cabelo, string> = {
  curto: 'Cabelo curto',
  cacheado: 'Cabelo cacheado',
  coque: 'Cabelo preso em coque',
  longo: 'Cabelo longo',
};

const nomesDasCores: Record<CorDoCabelo, string> = {
  escuro: 'Cabelo escuro',
  castanho: 'Cabelo castanho',
  mel: 'Cabelo cor de mel',
  grisalho: 'Cabelo grisalho',
};

/** T2b. O guia se apresenta: alguém da sua carreira, com a luz do farol. A pessoa escolhe como ele é. */
export default function Guia() {
  const {
    carreira,
    tomDoGuia,
    cabeloDoGuia,
    corDoCabeloDoGuia,
    definirTomDoGuia,
    definirCabeloDoGuia,
    definirCorDoCabeloDoGuia,
  } = useProgresso();
  const c = carreiraPorId(carreira);
  if (!c) return <Redirect href="/carreira" />;

  const aparencia = { carreira: c, tom: tomDoGuia, cabelo: cabeloDoGuia, corDoCabelo: corDoCabeloDoGuia };

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={estilos.centro} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(500).duration(350)}>
          <Balao texto={`Oi! Eu vou te acompanhar na sua trilha de ${c.nome}. Vamos começar pequeno?`} />
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Personagem {...aparencia} expressao="acenando" tamanho={140} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(900).duration(300)} style={estilos.escolhas}>
          <Text style={estilos.nota}>Como você quer ver seu guia?</Text>

          <Linha titulo="Pele">
            {(Object.keys(tonsDePele) as TomDePele[]).map((tom) => (
              <Escolha
                key={tom}
                rotulo={nomesDosTons[tom]}
                escolhida={tom === tomDoGuia}
                onPress={() => definirTomDoGuia(tom)}>
                <View style={[estilos.amostra, { backgroundColor: tonsDePele[tom] }]} />
              </Escolha>
            ))}
          </Linha>

          {/* Na carreira Policial o boné cobre o cabelo: só o longo aparece. Mesmo assim a escolha fica salva. */}
          <Linha titulo="Cabelo">
            {cabelos.map((cabelo) => (
              <Escolha
                key={cabelo}
                rotulo={nomesDosCabelos[cabelo]}
                escolhida={cabelo === cabeloDoGuia}
                onPress={() => definirCabeloDoGuia(cabelo)}>
                <AvatarDoGuia {...aparencia} cabelo={cabelo} tamanho={40} comLuz={false} />
              </Escolha>
            ))}
          </Linha>

          <Linha titulo="Cor">
            {(Object.keys(coresDeCabelo) as CorDoCabelo[]).map((corDoCabelo) => (
              <Escolha
                key={corDoCabelo}
                rotulo={nomesDasCores[corDoCabelo]}
                escolhida={corDoCabelo === corDoCabeloDoGuia}
                onPress={() => definirCorDoCabeloDoGuia(corDoCabelo)}>
                <View style={[estilos.amostra, { backgroundColor: coresDeCabelo[corDoCabelo] }]} />
              </Escolha>
            ))}
          </Linha>
        </Animated.View>
      </ScrollView>
      <View style={estilos.rodape}>
        <Botao rotulo="Vamos lá" onPress={() => router.push('/meta')} />
      </View>
    </SafeAreaView>
  );
}

function Linha({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={estilos.linha} accessibilityRole="radiogroup" accessibilityLabel={titulo}>
      <Text style={estilos.rotuloDaLinha}>{titulo}</Text>
      <View style={estilos.opcoes}>{children}</View>
    </View>
  );
}

function Escolha({
  rotulo,
  escolhida,
  onPress,
  children,
}: {
  rotulo: string;
  escolhida: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={() => {
        haptico.selecao();
        onPress();
      }}
      accessibilityRole="radio"
      accessibilityLabel={rotulo}
      accessibilityState={{ checked: escolhida }}
      style={estilos.alvo}>
      {/* Seleção em maré, como no resto do app; o âmbar fica para o botão. */}
      <View style={[estilos.anel, escolhida ? estilos.anelEscolhido : null]}>{children}</View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo, paddingHorizontal: 16 },
  centro: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  nota: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave, marginBottom: 4 },
  escolhas: { alignItems: 'center', gap: 6, marginTop: 6, alignSelf: 'stretch' },
  linha: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', gap: 8 },
  rotuloDaLinha: { width: 52, fontFamily: fonte.textoSemi, fontSize: tamanho.xs, color: cor.textoSuave },
  opcoes: { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  alvo: { minWidth: alvoMinimo + 4, minHeight: alvoMinimo + 4, alignItems: 'center', justifyContent: 'center' },
  anel: {
    borderRadius: raio.circulo,
    borderWidth: 3,
    borderColor: 'transparent',
    padding: 2,
  },
  anelEscolhido: { borderColor: cor.mareClaro },
  amostra: { width: 32, height: 32, borderRadius: raio.circulo },
  rodape: { paddingBottom: 12, paddingTop: 8 },
});
