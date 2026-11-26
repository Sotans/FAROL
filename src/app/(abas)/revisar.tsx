import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '@/componentes/Botao';
import { trilhaDePortugues } from '@/conteudo/trilha';
import { textoDeDias, useProgresso } from '@/estado/progresso';
import { IconeRevisao } from '@/icones';
import { QUESTOES_DA_REVISAO_RAPIDA, vencidasDosModulos } from '@/licao/montar';
import { proximaRevisao, vencemNosProximosDias, vencidas } from '@/revisao/agenda';
import { cor, fonte, limites, raio, tamanho } from '@/tema/tokens';

/** "amanhã", "em 3 dias" ou "hoje mais tarde", a partir de agora. */
function quandoVence(data: Date, agora: Date): string {
  const dias = Math.ceil((data.getTime() - agora.getTime()) / 86_400_000);
  if (dias <= 0 || data.toDateString() === agora.toDateString()) return 'hoje, mais tarde';
  if (dias === 1) return 'amanhã';
  return `em ${textoDeDias(dias)}`;
}

/**
 * Aba Revisar: a revisão espaçada em primeiro plano. Mostra o que venceu e começa a Revisão rápida
 * (a mesma do card "Para você" da trilha). Sem nada vencido, diz quando volta a ter.
 */
export default function Revisar() {
  const { revisoes } = useProgresso();
  const agora = new Date();
  const paraRevisar = vencidasDosModulos(trilhaDePortugues, vencidas(revisoes, agora)).length;
  const daSessao = Math.min(paraRevisar, QUESTOES_DA_REVISAO_RAPIDA);
  const proxima = proximaRevisao(revisoes, agora);
  const naSemana = vencemNosProximosDias(revisoes, agora, 7);
  const total = Object.keys(revisoes).length;

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
        <Text style={estilos.titulo} accessibilityRole="header">
          Revisar
        </Text>
        <Text style={estilos.sub}>
          Cada questão volta no momento em que você está quase esquecendo. É assim que o conteúdo fica para a prova.
        </Text>

        {paraRevisar > 0 ? (
          <View style={[estilos.cartao, estilos.cartaoDestaque]}>
            <IconeRevisao tamanho={32} />
            <Text style={estilos.numero}>{paraRevisar}</Text>
            <Text style={estilos.cartaoTitulo}>
              {paraRevisar === 1 ? 'questão no ponto de revisar' : 'questões no ponto de revisar'}
            </Text>
            <Text style={estilos.cartaoSub}>
              {`Uma revisão rápida tem até ${QUESTOES_DA_REVISAO_RAPIDA} questões e vale +${limites.xpDaRevisao} XP.`}
            </Text>
            <View style={estilos.botao}>
              <Botao
                rotulo={`Revisar ${daSessao} ${daSessao === 1 ? 'questão' : 'questões'}`}
                sub={`+${limites.xpDaRevisao} XP`}
                onPress={() => router.push({ pathname: '/licao', params: { modo: 'revisao' } })}
              />
            </View>
          </View>
        ) : (
          <View style={estilos.cartao}>
            <IconeRevisao tamanho={32} cor={cor.textoSuave} />
            <Text style={estilos.cartaoTitulo}>Nada para revisar agora</Text>
            <Text style={estilos.cartaoSub}>
              {proxima
                ? `A próxima questão volta ${quandoVence(proxima, agora)}. Enquanto isso, siga na trilha.`
                : 'As questões que você responder na trilha aparecem aqui quando for a hora de revisar.'}
            </Text>
            {total === 0 ? (
              <View style={estilos.botao}>
                <Botao rotulo="Ir para a trilha" variante="secundario" onPress={() => router.navigate('/')} />
              </View>
            ) : null}
          </View>
        )}

        {total > 0 ? (
          <View style={estilos.linhas}>
            <View style={estilos.linha}>
              <Text style={estilos.linhaRotulo}>Vencem nos próximos 7 dias</Text>
              <Text style={estilos.linhaValor}>{naSemana}</Text>
            </View>
            <View style={estilos.linha}>
              <Text style={estilos.linhaRotulo}>Questões na sua memória</Text>
              <Text style={estilos.linhaValor}>{total}</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo },
  rolagem: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 16 },
  titulo: { fontFamily: fonte.conquista, fontSize: tamanho.xxl - 4, color: cor.texto },
  sub: { fontFamily: fonte.texto, fontSize: tamanho.sm, lineHeight: 21, color: cor.textoSuave },
  cartao: {
    backgroundColor: cor.superficie,
    borderColor: cor.linha,
    borderWidth: 1,
    borderRadius: raio.lg,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  cartaoDestaque: { borderColor: cor.luzContorno, backgroundColor: cor.luzVeu },
  numero: { fontFamily: fonte.conquista, fontSize: tamanho.celebracao, color: cor.luz, lineHeight: 64 },
  cartaoTitulo: { fontFamily: fonte.textoSemi, fontSize: tamanho.md + 1, color: cor.texto, textAlign: 'center' },
  cartaoSub: {
    fontFamily: fonte.texto,
    fontSize: tamanho.sm,
    lineHeight: 21,
    color: cor.textoSuave,
    textAlign: 'center',
  },
  botao: { alignSelf: 'stretch', marginTop: 12 },
  linhas: { borderTopWidth: 1, borderTopColor: cor.linha },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: cor.linha,
  },
  linhaRotulo: { fontFamily: fonte.texto, fontSize: tamanho.md, color: cor.texto },
  linhaValor: { fontFamily: fonte.textoSemi, fontSize: tamanho.md, color: cor.texto },
});
