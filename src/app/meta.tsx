import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '@/componentes/Botao';
import { useProgresso, type MetaDiaria } from '@/estado/progresso';
import { haptico } from '@/servicos/haptico';
import { alvoMinimo, cor, fonte, raio, tamanho } from '@/tema/tokens';

const opcoes: { meta: MetaDiaria; titulo: string; sub: string }[] = [
  { meta: 1, titulo: '1 lição por dia', sub: '5 a 7 minutos · recomendado' },
  { meta: 2, titulo: '2 lições por dia', sub: '10 a 14 minutos' },
  { meta: 3, titulo: '3 lições por dia', sub: '15 a 20 minutos' },
];

/** T3. A meta mínima já vem marcada. O app nunca empurra uma meta maior. */
export default function Meta() {
  const { metaDiaria, definirMetaDiaria, concluirOnboarding } = useProgresso();
  // Vindo da aba Você: só troca a meta e volta.
  const editar = useLocalSearchParams<{ modo?: string }>().modo === 'editar';
  const [escolhida, setEscolhida] = useState<MetaDiaria>(metaDiaria);

  function confirmar() {
    definirMetaDiaria(escolhida);
    if (editar) {
      if (router.canGoBack()) router.back();
      else router.replace('/voce');
      return;
    }
    concluirOnboarding();
    // Limpa as telas do onboarding da pilha e vai direto para a primeira lição.
    if (router.canDismiss()) router.dismissAll();
    router.replace({ pathname: '/licao', params: { modo: 'boas-vindas' } });
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.corpo}>
        <Text style={estilos.titulo} accessibilityRole="header">
          Sua meta diária
        </Text>
        <Text style={estilos.sub}>Comece pequeno. Pequeno todo dia vence grande de vez em quando.</Text>
        <View style={estilos.lista}>
          {opcoes.map((o) => {
            const sel = o.meta === escolhida;
            return (
              <Pressable
                key={o.meta}
                onPress={() => {
                  haptico.selecao();
                  setEscolhida(o.meta);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: sel }}
                style={[estilos.opcao, sel ? estilos.opcaoSelecionada : null]}>
                <Text style={estilos.opcaoTitulo}>{o.titulo}</Text>
                <Text style={estilos.opcaoSub}>{o.sub}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={estilos.nota}>Você pode mudar quando quiser.</Text>
      </View>
      <View style={estilos.rodape}>
        <Botao rotulo={editar ? 'Salvar' : 'Confirmar'} onPress={confirmar} />
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo, paddingHorizontal: 16 },
  corpo: { flex: 1, paddingTop: 20 },
  titulo: { fontFamily: fonte.titulo, fontSize: tamanho.xl, color: cor.texto },
  sub: {
    fontFamily: fonte.texto,
    fontSize: tamanho.sm,
    lineHeight: 21,
    color: cor.textoSuave,
    marginTop: 4,
    marginBottom: 18,
  },
  lista: { gap: 10 },
  opcao: {
    minHeight: alvoMinimo + 12,
    backgroundColor: cor.superficie,
    borderColor: cor.linhaForte,
    borderWidth: 2,
    borderRadius: raio.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  // Seleção em maré, como a Opção da lição.
  opcaoSelecionada: { borderColor: cor.mare, backgroundColor: cor.selecionadaFundo },
  opcaoTitulo: { fontFamily: fonte.tituloMedio, fontSize: tamanho.md, color: cor.texto },
  opcaoSub: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave, marginTop: 2 },
  nota: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave, textAlign: 'center', marginTop: 16 },
  rodape: { paddingBottom: 12 },
});
