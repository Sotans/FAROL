import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '@/componentes/Botao';
import { Chip } from '@/componentes/Chip';
import { Farol } from '@/componentes/Farol';
import { textoDeDias, useProgresso } from '@/estado/progresso';
import { indiceDoFarol, nomeDoModulo, partes, totalDeNos, totalDePartes } from '@/licao/dados';
import { QUESTOES_DO_FAROL } from '@/licao/montar';
import { haptico } from '@/servicos/haptico';
import { tocar } from '@/servicos/som';
import { IconeAnelDaMeta, IconeFaisca, IconeLuzDaSequencia } from '@/icones';
import { cor, fonte, limites, raio, tamanho } from '@/tema/tokens';

const frases = [
  'Não deixe para amanhã o que pode fazer hoje.',
  'Aproveite o embalo: você está no ritmo.',
  'Mais uma? A sua luz já está acesa.',
];

export default function Conclusao() {
  const { acertos, total, primeira, farol } = useLocalSearchParams<{
    acertos?: string;
    total?: string;
    primeira?: string;
    farol?: string;
  }>();
  const { concluidas, licoesHoje, sequencia, metaDiaria, mapa } = useProgresso();
  const primeiraLicao = primeira === '1';
  const acendeuOFarol = farol === '1';
  const xpGanho = acendeuOFarol ? limites.xpDoFarol : limites.xpDaLicao;
  const [xp, setXp] = useState(0);
  const [mostrarCartao, setMostrarCartao] = useState(false);
  const [frase] = useState(() => frases[Math.floor(Math.random() * frases.length)]);

  // Pulsos de vibração e o sino do farol. Meta do dia fechada ou farol aceso: o sino mais longo.
  useEffect(() => {
    haptico.pulsosDoFarol();
    tocar(acendeuOFarol || licoesHoje === metaDiaria ? 'meta' : 'licao');
    // Só na entrada da tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // O XP sobe contando.
  useEffect(() => {
    if (xp >= xpGanho) return;
    const t = setTimeout(() => setXp((v) => Math.min(v + 1, xpGanho)), 40);
    return () => clearTimeout(t);
  }, [xp, xpGanho]);

  // O pop-up da próxima lição sobe sozinho depois da celebração.
  useEffect(() => {
    const t = setTimeout(() => {
      setMostrarCartao(true);
      tocar('popup');
      haptico.leve();
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  const moduloConcluido = concluidas >= totalDeNos;
  const vezDoFarol = concluidas === indiceDoFarol;

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.centro}>
        <Farol />
        <Text style={estilos.titulo}>
          {acendeuOFarol ? 'Farol aceso!' : primeiraLicao ? 'Primeira lição concluída!' : 'Lição concluída!'}
        </Text>
        {acendeuOFarol ? <Text style={estilos.detalhe}>{`Você concluiu o módulo ${nomeDoModulo}.`}</Text> : null}
        <View style={estilos.linha}>
          <IconeFaisca tamanho={30} />
          <Text style={estilos.xp}>{`+${xp} XP`}</Text>
        </View>
        <Text style={estilos.detalhe}>{`Você acertou ${acertos ?? '0'} de ${total ?? '0'} de primeira.`}</Text>
        {primeiraLicao ? (
          <Text style={estilos.detalhe}>Dia 1 concluído. Você começou, e é isso que importa.</Text>
        ) : null}
        <View style={estilos.linha}>
          <IconeLuzDaSequencia tamanho={22} />
          <Text style={estilos.sequencia}>{`${textoDeDias(sequencia)} seguidos`}</Text>
        </View>
        {licoesHoje === metaDiaria ? (
          <Chip texto="Meta do dia cumprida" tom="luz" icone={<IconeAnelDaMeta tamanho={14} progresso={1} />} />
        ) : null}
      </View>

      {mostrarCartao ? (
        <Animated.View entering={SlideInDown.duration(350)} style={estilos.cartao}>
          {primeiraLicao && !mapa ? (
            <>
              <Text style={estilos.cartaoTitulo}>Vamos descobrir seu ponto de partida?</Text>
              <Text style={estilos.cartaoSub}>
                6 perguntas rápidas, 2 minutos. Sem nota: só para ajustar sua trilha a você.
              </Text>
              <View style={estilos.botoes}>
                <Botao
                  rotulo="DESCOBRIR MEU PONTO DE PARTIDA"
                  sub="2 min"
                  onPress={() => router.replace('/diagnostico')}
                />
                <Botao rotulo="Mais tarde" variante="terciario" onPress={() => router.replace('/')} />
              </View>
            </>
          ) : moduloConcluido ? (
            <>
              <Text style={estilos.cartaoTitulo}>{`O farol de ${nomeDoModulo} está aceso.`}</Text>
              <Text style={estilos.cartaoSub}>Os próximos módulos chegam nas próximas versões.</Text>
              <View style={estilos.botoes}>
                <Botao rotulo="VOLTAR À TRILHA" onPress={() => router.replace('/')} />
              </View>
            </>
          ) : vezDoFarol ? (
            <>
              <Text style={estilos.cartaoTitulo}>{`Você terminou todas as partes de ${nomeDoModulo}.`}</Text>
              <Text style={estilos.cartaoSub}>Falta acender o farol do módulo.</Text>
              <View style={estilos.proxima}>
                <Text style={estilos.proximaTitulo}>{`Farol de ${nomeDoModulo}`}</Text>
                <Text style={estilos.proximaSub}>{`Estilo de prova · ${QUESTOES_DO_FAROL} questões`}</Text>
              </View>
              <View style={estilos.botoes}>
                <Botao
                  rotulo="ACENDER O FAROL"
                  sub={`+${limites.xpDoFarol} XP`}
                  onPress={() => router.replace('/licao')}
                />
                <Botao rotulo="Terminar por hoje" variante="terciario" onPress={() => router.replace('/')} />
              </View>
            </>
          ) : (
            <>
              <Text style={estilos.cartaoTitulo}>{frase}</Text>
              <Text style={estilos.cartaoSub}>Sua próxima lição já está pronta.</Text>
              <View style={estilos.proxima}>
                <Text style={estilos.proximaTitulo}>{partes[concluidas]}</Text>
                <Text
                  style={
                    estilos.proximaSub
                  }>{`Lição ${concluidas + 1} de ${totalDePartes} · cerca de 10 questões`}</Text>
              </View>
              <View style={estilos.botoes}>
                <Botao rotulo="CONTINUAR" sub={`+${limites.xpDaLicao} XP`} onPress={() => router.replace('/licao')} />
                <Botao rotulo="Terminar por hoje" variante="terciario" onPress={() => router.replace('/')} />
              </View>
            </>
          )}
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 40 },
  titulo: { fontFamily: fonte.titulo, fontSize: tamanho.xl, color: cor.texto },
  xp: { fontFamily: fonte.titulo, fontSize: tamanho.xxl, color: cor.acerto },
  detalhe: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sequencia: { fontFamily: fonte.tituloMedio, fontSize: tamanho.md, color: cor.luz },
  cartao: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: cor.superficie,
    borderTopLeftRadius: raio.lg + 8,
    borderTopRightRadius: raio.lg + 8,
    borderColor: cor.linha,
    borderWidth: 1,
    padding: 18,
    paddingBottom: 34,
    gap: 6,
  },
  cartaoTitulo: { fontFamily: fonte.titulo, fontSize: tamanho.lg, lineHeight: 26, color: cor.texto },
  cartaoSub: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave },
  proxima: { backgroundColor: 'rgba(43,95,217,0.22)', borderRadius: raio.md, padding: 12, marginTop: 8 },
  proximaTitulo: { fontFamily: fonte.tituloMedio, fontSize: tamanho.md, color: cor.texto },
  proximaSub: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave },
  botoes: { marginTop: 14, gap: 2 },
});
