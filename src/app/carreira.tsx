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
import { alvoMinimo, cor, fonte, raio, tamanho } from '@/tema/tokens';

/** T2. "O que você quer ser?" A carreira monta a trilha. Toques em "em breve" são contados. */
export default function EscolhaDeCarreira() {
  const { carreira, definirCarreira, registrarToqueEmBreve } = useProgresso();
  const [escolhida, setEscolhida] = useState<CarreiraId | null>(carreira);
  const { aviso, mostrarAviso } = useAviso();
  const ativas = carreiras.filter((c) => c.ativa);
  const emBreve = carreiras.filter((c) => !c.ativa);

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
        <View style={estilos.lista}>
          {ativas.map((c) => {
            const selecionada = c.id === escolhida;
            return (
              <Pressable
                key={c.id}
                onPress={() => tocar(c)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selecionada }}
                accessibilityLabel={`${c.nome}, ${c.descricao}`}
                style={[estilos.cartao, selecionada ? estilos.cartaoSelecionado : null]}>
                <IlustracaoCarreira id={c.id} tamanho={56} />
                <View style={estilos.textos}>
                  <Text style={estilos.nome}>{c.nome}</Text>
                  <Text style={estilos.descricao}>{c.descricao}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <Text style={estilos.emBreveTitulo}>Em breve</Text>
        <View style={estilos.emBreve}>
          {emBreve.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => tocar(c)}
              accessibilityRole="button"
              accessibilityLabel={`${c.nome}, em breve. Toque para avisar que você tem interesse.`}
              style={estilos.chipEmBreve}>
              <Text style={estilos.chipEmBreveTexto}>{c.nome}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={estilos.emBreveNota}>Toque numa delas e contamos seu interesse.</Text>
      </ScrollView>
      <View style={estilos.rodape}>
        <Botao rotulo="Continuar" desabilitado={!escolhida} onPress={continuar} />
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
  lista: { gap: 10 },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 84,
    backgroundColor: cor.superficie,
    borderColor: cor.linhaForte,
    borderWidth: 2,
    borderRadius: raio.lg,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  // Seleção em maré, como a Opção da lição: o âmbar fica para o botão.
  cartaoSelecionado: { borderColor: cor.mare, backgroundColor: cor.selecionadaFundo },
  textos: { flex: 1, gap: 2 },
  nome: { fontFamily: fonte.tituloMedio, fontSize: tamanho.lg, color: cor.texto },
  descricao: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave },
  emBreveTitulo: { fontFamily: fonte.textoSemi, fontSize: tamanho.sm, color: cor.textoSuave, marginTop: 24 },
  emBreve: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chipEmBreve: {
    minHeight: alvoMinimo,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderRadius: raio.circulo,
    borderWidth: 1,
    borderColor: cor.linhaForte,
  },
  chipEmBreveTexto: { fontFamily: fonte.textoSemi, fontSize: tamanho.sm, color: cor.textoSuave },
  emBreveNota: { fontFamily: fonte.texto, fontSize: tamanho.xs, color: cor.textoSuave, marginTop: 8 },
  rodape: { paddingVertical: 12 },
});
