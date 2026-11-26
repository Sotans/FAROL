import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { carreiraPorId } from '@/carreiras/dados';
import { hoje, useProgresso } from '@/estado/progresso';
import { IconeEmValidacao } from '@/icones';
import { noticiasDaCarreira, noticiasDeExemplo, quandoFoiPublicada, rotuloDoTipo } from '@/noticias/exemplos';
import { haptico } from '@/servicos/haptico';
import { cor, fonte, raio, tamanho } from '@/tema/tokens';

/**
 * Aba Notícias: editais, provas e dicas de concurso, filtrados pela carreira.
 * Por enquanto com notícias de exemplo (src/noticias/exemplos.ts), para testar o formato.
 */
export default function Noticias() {
  const { carreira } = useProgresso();
  const c = carreiraPorId(carreira);
  const [filtro, setFiltro] = useState<'carreira' | 'todas'>(c ? 'carreira' : 'todas');
  const lista = noticiasDaCarreira(noticiasDeExemplo, filtro === 'carreira' && c ? c.id : null);
  const dia = hoje();

  const filtros = [
    ...(c ? [{ id: 'carreira' as const, rotulo: c.nome }] : []),
    { id: 'todas' as const, rotulo: 'Todas' },
  ];

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <FlatList
        data={lista}
        keyExtractor={(n) => n.id}
        contentContainerStyle={estilos.rolagem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={estilos.cabeca}>
            <Text style={estilos.titulo} accessibilityRole="header">
              Notícias
            </Text>
            <View style={estilos.filtros} accessibilityRole="radiogroup" accessibilityLabel="Mostrar notícias de">
              {filtros.map((f) => {
                const ativo = filtro === f.id;
                return (
                  <Pressable
                    key={f.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: ativo }}
                    onPress={() => {
                      haptico.selecao();
                      setFiltro(f.id);
                    }}
                    style={[estilos.filtro, ativo ? estilos.filtroAtivo : null]}>
                    <Text style={[estilos.filtroTexto, ativo ? estilos.filtroTextoAtivo : null]}>{f.rotulo}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={estilos.aviso}>
              <IconeEmValidacao tamanho={18} cor={cor.textoSuave} />
              <Text style={estilos.avisoTexto}>Notícias de exemplo, para testar o formato. Não são reais.</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={estilos.noticia} accessible>
            <Text style={estilos.meta}>{`${rotuloDoTipo[item.tipo]} · ${quandoFoiPublicada(item.data, dia)}`}</Text>
            <Text style={estilos.noticiaTitulo}>{item.titulo}</Text>
            <Text style={estilos.resumo}>{item.resumo}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo },
  rolagem: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32 },
  cabeca: { gap: 14, marginBottom: 16 },
  titulo: { fontFamily: fonte.titulo, fontSize: tamanho.xl, color: cor.texto },
  filtros: { flexDirection: 'row', gap: 8 },
  filtro: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: raio.circulo,
    borderWidth: 1,
    borderColor: cor.linhaForte,
    justifyContent: 'center',
  },
  filtroAtivo: { backgroundColor: cor.selecionadaFundo, borderColor: cor.mare },
  filtroTexto: { fontFamily: fonte.textoSemi, fontSize: tamanho.sm, color: cor.textoSuave },
  filtroTextoAtivo: { color: cor.texto },
  aviso: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avisoTexto: { flex: 1, fontFamily: fonte.texto, fontSize: tamanho.xs, color: cor.textoSuave },
  noticia: {
    backgroundColor: cor.superficie,
    borderColor: cor.linha,
    borderWidth: 1,
    borderRadius: raio.lg,
    padding: 16,
    gap: 6,
  },
  meta: { fontFamily: fonte.textoSemi, fontSize: tamanho.xs, color: cor.mareClaro },
  noticiaTitulo: { fontFamily: fonte.textoSemi, fontSize: tamanho.md + 1, lineHeight: 24, color: cor.texto },
  resumo: { fontFamily: fonte.texto, fontSize: tamanho.sm, lineHeight: 21, color: cor.textoSuave },
});
