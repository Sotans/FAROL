import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { carreiras, type Carreira, type CarreiraId } from '@/carreiras/dados';
import { Aviso, useAviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { useProgresso } from '@/estado/progresso';
import { haptico } from '@/servicos/haptico';
import { IlustracaoCarreira } from '@/icones';
import { cor, fonte, raio, tamanho } from '@/tema/tokens';

/** T2. "O que você quer ser?" A carreira monta a trilha. Toques em "em breve" são contados. */
export default function EscolhaDeCarreira() {
  const { carreira, definirCarreira, registrarToqueEmBreve } = useProgresso();
  const [escolhida, setEscolhida] = useState<CarreiraId | null>(carreira);
  const { aviso, mostrarAviso } = useAviso();

  function tocar(c: Carreira) {
    if (c.ativa) {
      haptico.selecao();
      setEscolhida(c.id);
      return;
    }
    haptico.aviso();
    registrarToqueEmBreve(c.id);
    mostrarAviso(`${c.nome} chega em breve. Anotamos seu interesse!`);
  }

  function continuar() {
    if (!escolhida) return;
    definirCarreira(escolhida);
    router.push('/guia');
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
        <Text style={estilos.titulo} accessibilityRole="header">
          O que você quer ser?
        </Text>
        <Text style={estilos.sub}>Escolha sua carreira e montamos sua trilha.</Text>
        <View style={estilos.grade}>
          {carreiras.map((c) => {
            const selecionada = c.id === escolhida;
            return (
              <Pressable
                key={c.id}
                onPress={() => tocar(c)}
                accessibilityRole="button"
                accessibilityState={{ selected: selecionada }}
                accessibilityLabel={c.ativa ? c.nome : `${c.nome}, em breve`}
                style={[
                  estilos.cartao,
                  selecionada ? estilos.cartaoSelecionado : null,
                  c.ativa ? null : estilos.cartaoEmBreve,
                ]}>
                <IlustracaoCarreira id={c.id} tamanho={52} />
                <Text style={[estilos.nome, selecionada ? { color: cor.luz } : null]}>{c.nome}</Text>
                <Text style={estilos.descricao}>{c.ativa ? c.descricao : 'EM BREVE'}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={estilos.rodape}>
        <Botao rotulo="CONTINUAR" desabilitado={!escolhida} onPress={continuar} />
      </View>
      <Aviso texto={aviso} topo={60} />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo, paddingHorizontal: 16 },
  rolagem: { paddingTop: 20, paddingBottom: 16 },
  titulo: { fontFamily: fonte.titulo, fontSize: tamanho.xl, color: cor.texto },
  sub: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave, marginTop: 4, marginBottom: 16 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cartao: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: cor.superficie,
    borderColor: cor.linha,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: raio.lg,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 2,
  },
  cartaoSelecionado: { borderColor: cor.luz, backgroundColor: 'rgba(255,200,87,0.1)' },
  cartaoEmBreve: { opacity: 0.5 },
  nome: { fontFamily: fonte.tituloMedio, fontSize: tamanho.md, color: cor.texto },
  descricao: { fontFamily: fonte.texto, fontSize: 11, color: cor.textoSuave, textAlign: 'center' },
  rodape: { paddingVertical: 12 },
});
