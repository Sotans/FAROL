import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Botao } from '@/componentes/Botao';
import { Farol } from '@/componentes/Farol';
import { motivoParaCadastrar } from '@/conta/regras';
import { trilhaDePortugues } from '@/conteudo/trilha';
import { proximoModulo } from '@/estado/modulos';
import { textoDeDias, useProgresso } from '@/estado/progresso';
import { QUESTOES_DO_FAROL } from '@/licao/montar';
import { haptico } from '@/servicos/haptico';
import { tocar } from '@/servicos/som';
import { IconeAnelDaMeta, IconeEscudo, IconeFaisca, IconeLuzDaSequencia } from '@/icones';
import { alvoMinimo, cor, fonte, limites, raio, tamanho } from '@/tema/tokens';

const frases = [
  'Não deixe para amanhã o que pode fazer hoje.',
  'Aproveite o embalo: você está no ritmo.',
  'Mais uma? A sua luz já está acesa.',
];

export default function Conclusao() {
  const { acertos, total, primeira, farol, revisao } = useLocalSearchParams<{
    acertos?: string;
    total?: string;
    primeira?: string;
    farol?: string;
    revisao?: string;
  }>();
  const {
    modulo,
    escolherModulo,
    concluidas,
    totalDePartes,
    totalDeNos,
    indiceDoFarol,
    licoesHoje,
    sequencia,
    metaDiaria,
    mapa,
    nuvem,
    conta,
  } = useProgresso();
  const nomeDoModulo = modulo.nome;
  const partes = modulo.partes.map((p) => p.nome);
  const proximo = proximoModulo(trilhaDePortugues, modulo.id);
  const primeiraLicao = primeira === '1';
  const acendeuOFarol = farol === '1';
  const fezRevisao = revisao === '1';
  const xpGanho = acendeuOFarol ? limites.xpDoFarol : fezRevisao ? limites.xpDaRevisao : limites.xpDaLicao;
  const [xp, setXp] = useState(0);
  const [mostrarCartao, setMostrarCartao] = useState(false);
  const [frase] = useState(() => frases[Math.floor(Math.random() * frases.length)]);
  // Convite de cadastro depois de cada lição, até a pessoa se cadastrar. Nunca obrigatório e nunca no lugar do Continuar.
  const convidarParaCadastro = nuvem === 'conectada' && conta?.anonima === true;
  const motivo = motivoParaCadastrar({ primeiraLicao, sequencia, concluidas });

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
  const metaCumprida = licoesHoje >= metaDiaria;
  // Na 1ª lição, o mapa vem antes do cadastro (jornada: etapa 3, depois a 4).
  const ofereceMapa = primeiraLicao && !mapa;

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={estilos.centro} showsVerticalScrollIndicator={false}>
        <Farol />
        <Text style={acendeuOFarol ? estilos.tituloConquista : estilos.titulo} accessibilityRole="header">
          {acendeuOFarol
            ? 'Farol aceso.'
            : fezRevisao
              ? 'Revisão concluída!'
              : primeiraLicao
                ? 'Primeira lição concluída!'
                : 'Lição concluída!'}
        </Text>
        {acendeuOFarol ? <Text style={estilos.detalhe}>{`Você concluiu o módulo ${nomeDoModulo}.`}</Text> : null}
        {fezRevisao ? (
          <Text style={estilos.detalhe}>O que você acertou volta daqui a mais tempo. O resto, logo.</Text>
        ) : null}
        {primeiraLicao ? (
          <Text style={estilos.detalhe}>Dia 1 concluído. Você começou, e é isso que importa.</Text>
        ) : null}
        <View style={estilos.linha}>
          <IconeFaisca tamanho={30} />
          <Text style={estilos.xp}>{`+${xp} XP`}</Text>
        </View>
        {/* Celebração densa: três números numa fila, sem linhas soltas. */}
        <View style={estilos.numeros}>
          <View
            style={estilos.numero}
            accessible
            accessibilityLabel={`${acertos ?? '0'} de ${total ?? '0'} de primeira`}>
            <Text style={estilos.numeroValor}>{`${acertos ?? '0'}/${total ?? '0'}`}</Text>
            <Text style={estilos.numeroRotulo}>de primeira</Text>
          </View>
          <View style={estilos.numero} accessible accessibilityLabel={`${textoDeDias(sequencia)} seguidos`}>
            <View style={estilos.linha}>
              <IconeLuzDaSequencia tamanho={16} />
              <Text style={[estilos.numeroValor, { color: cor.luz }]}>{textoDeDias(sequencia)}</Text>
            </View>
            <Text style={estilos.numeroRotulo}>seguidos</Text>
          </View>
          <View
            style={estilos.numero}
            accessible
            accessibilityLabel={metaCumprida ? 'Meta do dia cumprida' : `Meta do dia: ${licoesHoje} de ${metaDiaria}`}>
            <View style={estilos.linha}>
              <IconeAnelDaMeta tamanho={16} progresso={Math.min(licoesHoje / metaDiaria, 1)} />
              <Text style={[estilos.numeroValor, metaCumprida ? { color: cor.luz } : null]}>
                {metaCumprida ? 'Meta' : `${licoesHoje} de ${metaDiaria}`}
              </Text>
            </View>
            <Text style={estilos.numeroRotulo}>{metaCumprida ? 'cumprida' : 'meta do dia'}</Text>
          </View>
        </View>
      </ScrollView>

      {mostrarCartao ? (
        <Animated.View entering={SlideInDown.duration(350)} style={estilos.cartao}>
          {ofereceMapa ? (
            <>
              <Text style={estilos.cartaoTitulo}>Vamos descobrir seu ponto de partida?</Text>
              <Text style={estilos.cartaoSub}>
                6 perguntas rápidas, 2 minutos. Sem nota: só para ajustar sua trilha a você.
              </Text>
              <View style={estilos.botoes}>
                <Botao rotulo="Descobrir meu ponto de partida" onPress={() => router.replace('/diagnostico')} />
                <Botao rotulo="Mais tarde" variante="terciario" onPress={() => router.replace('/')} />
              </View>
            </>
          ) : moduloConcluido ? (
            <>
              <Text style={estilos.cartaoTitulo}>{`O farol de ${nomeDoModulo} está aceso.`}</Text>
              {proximo ? (
                <View style={estilos.proxima}>
                  <Text style={estilos.proximaTitulo}>{proximo.nome}</Text>
                  <Text
                    style={estilos.proximaSub}>{`Próximo módulo · ${proximo.partes.length} partes e um farol`}</Text>
                </View>
              ) : (
                <Text style={estilos.cartaoSub}>Os próximos módulos chegam nas próximas versões.</Text>
              )}
              <View style={estilos.botoes}>
                {proximo ? (
                  <Botao
                    rotulo="Ir para o próximo módulo"
                    onPress={() => {
                      escolherModulo(proximo.id);
                      router.replace('/');
                    }}
                  />
                ) : (
                  <Botao rotulo="Voltar à trilha" onPress={() => router.replace('/')} />
                )}
                {convidarParaCadastro ? <LinhaDeCadastro motivo={motivo} /> : null}
                {proximo ? (
                  <Botao rotulo="Terminar por hoje" variante="terciario" onPress={() => router.replace('/')} />
                ) : null}
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
                  rotulo="Acender o farol"
                  sub={`+${limites.xpDoFarol} XP`}
                  onPress={() => router.replace('/licao')}
                />
                {convidarParaCadastro ? <LinhaDeCadastro motivo={motivo} /> : null}
                <Botao rotulo="Terminar por hoje" variante="terciario" onPress={() => router.replace('/')} />
              </View>
            </>
          ) : (
            <>
              <Text style={estilos.cartaoTitulo}>{frase}</Text>
              <View style={estilos.proxima}>
                <Text style={estilos.proximaTitulo}>{`${nomeDoModulo}: ${partes[concluidas]}`}</Text>
                <Text
                  style={
                    estilos.proximaSub
                  }>{`Lição ${concluidas + 1} de ${totalDePartes} · cerca de 10 questões`}</Text>
              </View>
              <View style={estilos.botoes}>
                <Botao rotulo="Continuar" sub={`+${limites.xpDaLicao} XP`} onPress={() => router.replace('/licao')} />
                {convidarParaCadastro ? <LinhaDeCadastro motivo={motivo} /> : null}
                <Botao rotulo="Terminar por hoje" variante="terciario" onPress={() => router.replace('/')} />
              </View>
            </>
          )}
        </Animated.View>
      ) : null}
    </SafeAreaView>
  );
}

/** O convite de cadastro é uma linha dentro do cartão: aparece depois de cada lição, sem tirar o Continuar. */
function LinhaDeCadastro({ motivo }: { motivo: string }) {
  return (
    <Pressable
      onPress={() => {
        haptico.leve();
        router.push({ pathname: '/conta', params: { modo: 'salvar' } });
      }}
      accessibilityRole="button"
      accessibilityLabel={`${motivo} Guardar em 1 minuto.`}
      style={estilos.cadastro}>
      <IconeEscudo tamanho={22} />
      <Text style={estilos.cadastroTexto}>
        {`${motivo} `}
        <Text style={estilos.cadastroLink}>Guardar em 1 min</Text>
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo },
  centro: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titulo: { fontFamily: fonte.titulo, fontSize: tamanho.xl, color: cor.texto, textAlign: 'center' },
  // Conquista com voz própria: a Fraunces só aparece em momentos como este.
  tituloConquista: { fontFamily: fonte.conquista, fontSize: tamanho.xxl, color: cor.luzClara, textAlign: 'center' },
  xp: { fontFamily: fonte.titulo, fontSize: tamanho.xxl, color: cor.acerto },
  detalhe: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave, textAlign: 'center' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  numeros: { flexDirection: 'row', gap: 8, alignSelf: 'stretch', marginTop: 4 },
  numero: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    backgroundColor: cor.superficie,
    borderRadius: raio.md,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  numeroValor: { fontFamily: fonte.titulo, fontSize: tamanho.md + 1, color: cor.texto },
  numeroRotulo: { fontFamily: fonte.texto, fontSize: tamanho.xs, color: cor.textoSuave },
  cartao: {
    backgroundColor: cor.superficie,
    borderTopLeftRadius: raio.lg + 8,
    borderTopRightRadius: raio.lg + 8,
    borderColor: cor.linha,
    borderWidth: 1,
    padding: 18,
    paddingBottom: 20,
    gap: 6,
  },
  cartaoTitulo: { fontFamily: fonte.titulo, fontSize: tamanho.lg, lineHeight: 26, color: cor.texto },
  cartaoSub: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave },
  proxima: { backgroundColor: cor.mareVeu, borderRadius: raio.md, padding: 12, marginTop: 8 },
  proximaTitulo: { fontFamily: fonte.tituloMedio, fontSize: tamanho.md, color: cor.texto },
  proximaSub: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave },
  botoes: { marginTop: 14, gap: 8 },
  cadastro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: alvoMinimo,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: cor.linhaForte,
    borderRadius: raio.md,
  },
  cadastroTexto: { flex: 1, fontFamily: fonte.texto, fontSize: 13, lineHeight: 18, color: cor.texto },
  cadastroLink: { fontFamily: fonte.textoSemi, color: cor.mareClaro },
});
