import type { BottomTabBarProps } from 'expo-router/js-tabs';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { carreiraPorId } from '@/carreiras/dados';
import { useProgresso } from '@/estado/progresso';
import { IconeAbaNoticias, IconeAbaRevisar, IconeAbaTrilha, IconePerfil } from '@/icones';
import { haptico } from '@/servicos/haptico';
import { cor, fonte, raio, tamanho } from '@/tema/tokens';
import { AvatarDoGuia } from './Personagem';

/** Rótulo e ícone de cada aba, pelo nome da rota em src/app/(abas). */
const abas: Record<string, { rotulo: string; icone: (c: string) => ReactNode }> = {
  index: { rotulo: 'Trilha', icone: (c) => <IconeAbaTrilha cor={c} /> },
  revisar: { rotulo: 'Revisar', icone: (c) => <IconeAbaRevisar cor={c} /> },
  noticias: { rotulo: 'Notícias', icone: (c) => <IconeAbaNoticias cor={c} /> },
  voce: { rotulo: 'Você', icone: (c) => <IconePerfil cor={c} /> },
};

/**
 * A barra de abas do FAROL. A aba ativa fica em maré (seleção, doc 11); o âmbar aparece só no
 * número de revisões vencidas, porque revisar é o próximo passo. A aba Você mostra o guia da pessoa.
 * Rótulos sempre visíveis: o público ainda está conhecendo o app.
 */
export function BarraDeAbas({ state, descriptors, navigateToTab, insets }: BottomTabBarProps) {
  const { carreira, tomDoGuia, cabeloDoGuia, corDoCabeloDoGuia } = useProgresso();
  const c = carreiraPorId(carreira);

  return (
    <View style={[estilos.barra, { paddingBottom: Math.max(insets.bottom, 10) }]} accessibilityRole="tablist">
      {state.routes.map((rota, i) => {
        const aba = abas[rota.name];
        if (!aba) return null;
        const ativa = state.index === i;
        const { tabBarBadge } = descriptors[rota.key].options;
        const corDoIcone = ativa ? cor.mareClaro : cor.textoSuave;
        const marcador = tabBarBadge !== undefined ? String(tabBarBadge) : null;
        return (
          <Pressable
            key={rota.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativa }}
            accessibilityLabel={marcador ? `${aba.rotulo}, ${marcador} para revisar` : aba.rotulo}
            onPress={() => {
              if (ativa) return;
              haptico.selecao();
              navigateToTab(rota.key);
            }}
            style={estilos.aba}>
            <View style={[estilos.pilula, ativa ? estilos.pilulaAtiva : null]}>
              {rota.name === 'voce' && c ? (
                <View style={[estilos.avatar, ativa ? estilos.avatarAtivo : null]}>
                  <AvatarDoGuia
                    carreira={c}
                    tom={tomDoGuia}
                    cabelo={cabeloDoGuia}
                    corDoCabelo={corDoCabeloDoGuia}
                    tamanho={24}
                    comLuz={false}
                  />
                </View>
              ) : (
                aba.icone(corDoIcone)
              )}
              {marcador ? (
                <View style={estilos.marcador}>
                  <Text style={estilos.marcadorTexto}>{marcador}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[estilos.rotulo, ativa ? estilos.rotuloAtivo : null]}>{aba.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    backgroundColor: cor.superficie,
    borderTopWidth: 1,
    borderTopColor: cor.linha,
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  aba: { flex: 1, alignItems: 'center', gap: 4, minHeight: 52 },
  pilula: { width: 60, height: 32, borderRadius: raio.circulo, alignItems: 'center', justifyContent: 'center' },
  pilulaAtiva: { backgroundColor: cor.selecionadaFundo },
  avatar: { borderRadius: raio.circulo, borderWidth: 2, borderColor: cor.linhaForte, overflow: 'hidden' },
  avatarAtivo: { borderColor: cor.mareClaro },
  marcador: {
    position: 'absolute',
    top: -4,
    left: 36,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: raio.circulo,
    backgroundColor: cor.luz,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marcadorTexto: { fontFamily: fonte.botao, fontSize: tamanho.xs, color: cor.textoSobreLuz },
  rotulo: { fontFamily: fonte.textoSemi, fontSize: tamanho.xs, color: cor.textoSuave },
  rotuloAtivo: { color: cor.texto },
});
