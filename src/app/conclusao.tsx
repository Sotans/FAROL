import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '@/componentes/Botao';
import { Chip } from '@/componentes/Chip';
import { Farol } from '@/componentes/Farol';
import { textoDeDias, useProgresso } from '@/estado/progresso';
import { partes, totalDePartes } from '@/licao/dados';
import { haptico } from '@/servicos/haptico';
import { tocar } from '@/servicos/som';
import { cor, fonte, raio, tamanho } from '@/tema/tokens';

const frases = [
  'Não deixe para amanhã o que pode fazer hoje.',
  'Aproveite o embalo: você está no ritmo.',
  'Mais uma? A sua luz já está acesa.',
];

const XP_DA_LICAO = 25;

export default function Conclusao() {
  const { acertos, total, primeira } = useLocalSearchParams<{ acertos?: string; total?: string; primeira?: string }>();
  const { concluidas, licoesHoje, sequencia, metaDiaria, mapa } = useProgresso();
  const primeiraLicao = primeira === '1';
  const [xp, setXp] = useState(0);
  const [mostrarCartao, setMostrarCartao] = useState(false);
  const [frase] = useState(() => frases[Math.floor(Math.random() * frases.length)]);

  // Pulsos de vibração e o sino do farol. Se a meta do dia fechou, o sino mais longo.
  useEffect(() => {
    haptico.pulsosDoFarol();
    tocar(licoesHoje === metaDiaria ? 'meta' : 'licao');
    // Só na entrada da tela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // O XP sobe contando.
  useEffect(() => {
    if (xp >= XP_DA_LICAO) return;
    const t = setTimeout(() => setXp((v) => Math.min(v + 1, XP_DA_LICAO)), 40);
    return () => clearTimeout(t);
  }, [xp]);

  // O pop-up da próxima lição sobe sozinho depois da celebração.
  useEffect(() => {
    const t = setTimeout(() => {
      setMostrarCartao(true);
      tocar('popup');
      haptico.leve();
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  const unidadeConcluida = concluidas >= totalDePartes;

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.centro}>
        <Farol />
        <Text style={estilos.titulo}>
          {unidadeConcluida ? 'Unidade concluída!' : primeiraLicao ? 'Primeira lição concluída!' : 'Lição concluída!'}
        </Text>
        <Text style={estilos.xp}>{`+${xp} XP`}</Text>
        <Text style={estilos.detalhe}>{`Você acertou ${acertos ?? '0'} de ${total ?? '0'} de primeira.`}</Text>
        {primeiraLicao ? (
          <Text style={estilos.detalhe}>Dia 1 concluído. Você começou, e é isso que importa.</Text>
        ) : null}
        <Text style={estilos.sequencia}>{`● ${textoDeDias(sequencia)} seguidos`}</Text>
        {licoesHoje === metaDiaria ? <Chip texto="Meta do dia cumprida ✓" tom="luz" /> : null}
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
          ) : unidadeConcluida ? (
            <>
              <Text style={estilos.cartaoTitulo}>Você terminou todas as partes de Crase.</Text>
              <Text style={estilos.cartaoSub}>O baú da unidade e os próximos módulos chegam nas próximas versões.</Text>
              <View style={estilos.botoes}>
                <Botao rotulo="VOLTAR À TRILHA" onPress={() => router.replace('/')} />
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
                <Botao rotulo="CONTINUAR" sub="+25 XP" onPress={() => router.replace('/licao')} />
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
