import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '@/componentes/Botao';
import { trilhaDePortugues } from '@/conteudo/trilha';
import { textoDeDias, useProgresso } from '@/estado/progresso';
import { IconeAbaRevisar, IconeAbaTrilha, IconeRevisao } from '@/icones';
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

/** O ciclo da revisão espaçada, em três passos (é uma sequência de verdade). */
const passosDoCiclo = [
  {
    titulo: 'Você responde na trilha',
    sub: 'Cada questão entra na sua memória.',
    icone: <IconeAbaTrilha tamanho={22} cor={cor.mareClaro} />,
  },
  {
    titulo: 'A questão descansa',
    sub: 'Acertou fácil? Ela demora mais a voltar.',
    icone: <IconeAbaRevisar tamanho={22} cor={cor.mareClaro} />,
  },
  {
    titulo: 'Volta na hora certa',
    sub: 'Quando você está quase esquecendo, ela aparece aqui.',
    icone: <IconeRevisao tamanho={22} />,
  },
];

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
          <View style={estilos.cartao}>
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
                <Botao rotulo="Ir para a trilha" onPress={() => router.navigate('/')} />
              </View>
            ) : null}
          </View>
        )}

        {/* Sem nada vencido, mostra o ciclo: a pessoa entende o que vai aparecer aqui. */}
        {paraRevisar === 0 ? (
          <View
            style={estilos.ciclo}
            accessible
            accessibilityLabel="Como funciona: você responde na trilha, a questão descansa e volta quando é hora de revisar.">
            <Text style={estilos.cicloTitulo}>Como funciona</Text>
            {passosDoCiclo.map((passo, i) => (
              <View key={passo.titulo} style={estilos.passo}>
                <View style={estilos.passoIcone}>{passo.icone}</View>
                <View style={estilos.passoTextos}>
                  <Text style={estilos.passoTitulo}>{passo.titulo}</Text>
                  <Text style={estilos.passoSub}>{passo.sub}</Text>
                </View>
                {i < passosDoCiclo.length - 1 ? <View style={estilos.passoLinha} /> : null}
              </View>
            ))}
          </View>
        ) : null}

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
  titulo: { fontFamily: fonte.titulo, fontSize: tamanho.xl, color: cor.texto },
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
  numero: { fontFamily: fonte.titulo, fontSize: tamanho.celebracao, color: cor.luz, lineHeight: 66 },
  cartaoTitulo: { fontFamily: fonte.textoSemi, fontSize: tamanho.md + 1, color: cor.texto, textAlign: 'center' },
  cartaoSub: {
    fontFamily: fonte.texto,
    fontSize: tamanho.sm,
    lineHeight: 21,
    color: cor.textoSuave,
    textAlign: 'center',
  },
  botao: { alignSelf: 'stretch', marginTop: 12 },
  ciclo: { gap: 4 },
  cicloTitulo: { fontFamily: fonte.textoSemi, fontSize: tamanho.md, color: cor.texto, marginBottom: 8 },
  passo: { flexDirection: 'row', gap: 12, paddingBottom: 14 },
  passoIcone: {
    width: 40,
    height: 40,
    borderRadius: raio.circulo,
    backgroundColor: cor.superficie,
    borderWidth: 1,
    borderColor: cor.linha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passoLinha: { position: 'absolute', left: 19, top: 42, bottom: 0, width: 2, backgroundColor: cor.linha },
  passoTextos: { flex: 1, gap: 2, paddingTop: 2 },
  passoTitulo: { fontFamily: fonte.textoSemi, fontSize: tamanho.md, color: cor.texto },
  passoSub: { fontFamily: fonte.texto, fontSize: tamanho.sm, lineHeight: 20, color: cor.textoSuave },
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
