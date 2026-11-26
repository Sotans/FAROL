import { router } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProgresso, type StatusDaNuvem } from '@/estado/progresso';
import { IconeFechar } from '@/icones';
import { rotuloModoDeErro } from '@/licao/tipos';
import { haptico } from '@/servicos/haptico';
import { diagnosticoDoSom, tocar } from '@/servicos/som';
import { alvoMinimo, cor, fonte, raio, tamanho } from '@/tema/tokens';

const textoDaNuvem: Record<StatusDaNuvem, string> = {
  desligada: 'Desligada (falta o arquivo .env.local)',
  conectando: 'Conectando...',
  conectada: 'Progresso salvo',
  offline: 'Sem conexão agora; tenta de novo ao abrir o app',
  desatualizada: 'A conta tem progresso de um app mais novo: atualize o app (nada é enviado até lá)',
};

/**
 * Laboratório: os controles de teste do protótipo, fora da trilha (análise de design de 2026-11-24).
 * Assim, a trilha de quem testa é igual à do produto. Abre com um toque longo no banner do módulo.
 */
export default function Laboratorio() {
  const { modoDeErro, alternarModoDeErro, reiniciar, nuvem, conta } = useProgresso();

  function confirmarReinicio() {
    const fazer = () => {
      reiniciar();
      router.dismissTo('/');
    };
    const texto = 'O progresso deste aparelho volta ao início.';
    if (Platform.OS === 'web') {
      if (window.confirm(`Reiniciar a demonstração? ${texto}`)) fazer();
      return;
    }
    Alert.alert('Reiniciar a demonstração?', texto, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reiniciar', style: 'destructive', onPress: fazer },
    ]);
  }

  const contaTexto = !conta
    ? textoDaNuvem[nuvem]
    : conta.anonima
      ? `${textoDaNuvem[nuvem]} · conta anônima`
      : `${textoDaNuvem[nuvem]} · ${conta.email ?? ''}`;

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.topo}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          style={estilos.fechar}>
          <IconeFechar tamanho={26} />
        </Pressable>
        <Text style={estilos.titulo}>Laboratório</Text>
      </View>
      <Text style={estilos.aviso}>Ferramentas de teste do protótipo. Não fazem parte do app final.</Text>

      <ScrollView contentContainerStyle={estilos.lista}>
        <Item
          titulo="Experimento de erro"
          valor={`${rotuloModoDeErro[modoDeErro]} (toque para trocar)`}
          onPress={() => {
            haptico.selecao();
            alternarModoDeErro();
          }}
        />
        <Item
          titulo="Testar som"
          valor="Toca o sino da lição e mostra o diagnóstico"
          onPress={() => tocar('licao')}
          onPressDepois={() => Alert.alert('Som', diagnosticoDoSom('licao'))}
        />
        <Item
          titulo="Catálogo de ícones e guias"
          valor="Todos os desenhos do app"
          onPress={() => router.push('/icones')}
        />
        <Item titulo="Conta e nuvem" valor={contaTexto} onPress={() => router.push('/conta')} />
        <Item
          titulo="Reiniciar demonstração"
          valor="Volta ao início, neste aparelho"
          perigo
          onPress={confirmarReinicio}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Item({
  titulo,
  valor,
  onPress,
  onPressDepois,
  perigo = false,
}: {
  titulo: string;
  valor: string;
  onPress: () => void;
  onPressDepois?: () => void;
  perigo?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        onPress();
        if (onPressDepois) setTimeout(onPressDepois, 400);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}, ${valor}`}
      style={estilos.item}>
      <Text style={[estilos.itemTitulo, perigo ? { color: cor.atencao } : null]}>{titulo}</Text>
      <Text style={estilos.itemValor}>{valor}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 6 },
  fechar: { width: alvoMinimo, height: alvoMinimo, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontFamily: fonte.titulo, fontSize: tamanho.lg, color: cor.texto },
  aviso: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave, paddingHorizontal: 20, marginTop: 4 },
  lista: { padding: 16, gap: 10 },
  item: {
    minHeight: 64,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cor.linhaForte,
    backgroundColor: cor.superficie,
  },
  itemTitulo: { fontFamily: fonte.tituloMedio, fontSize: tamanho.md, color: cor.texto },
  itemValor: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave, marginTop: 2 },
});
