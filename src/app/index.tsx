import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type ScrollViewInstance } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Polygon, Stop } from 'react-native-svg';

import { carreiraPorId } from '@/carreiras/dados';
import { Aviso, useAviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import {
  ALTURA_DA_LINHA,
  ALTURA_DO_FAROL,
  COLUNA_DOS_NOS,
  LAMPADA_DO_FAROL,
  NoTrilha,
  TAMANHO_DO_FAROL,
  type EstadoNo,
  type Ligacao,
} from '@/componentes/NoTrilha';
import { textoDeDias, useProgresso, type StatusDaNuvem } from '@/estado/progresso';
import { indiceDoFarol, moduloAtual, nomeDoModulo, partes, totalDeNos, totalDePartes } from '@/licao/dados';
import {
  LIMIAR_DA_REVISAO_RAPIDA,
  QUESTOES_DA_REVISAO_RAPIDA,
  QUESTOES_DO_FAROL,
  vencidasDoModulo,
} from '@/licao/montar';
import { rotuloModoDeErro } from '@/licao/tipos';
import { vencidas } from '@/revisao/agenda';
import { haptico } from '@/servicos/haptico';
import { diagnosticoDoSom, tocar } from '@/servicos/som';
import {
  IconeAnelDaMeta,
  IconeBussola,
  IconeEscudo,
  IconeLuzDaSequencia,
  IconeModulos,
  IconeRevisao,
  IconeSeta,
} from '@/icones';
import { alvoMinimo, cor, fonte, limites, movimento, raio, tamanho } from '@/tema/tokens';

const textoDaNuvem: Record<StatusDaNuvem, string> = {
  desligada: 'Nuvem desligada (falta o arquivo .env.local)',
  conectando: 'Nuvem: conectando...',
  conectada: 'Nuvem: progresso salvo (conta anônima)',
  offline: 'Nuvem: sem conexão agora; tenta de novo ao abrir o app',
};

/** Espaço acima do farol, dentro da rolagem. O feixe usa a mesma medida. */
const TOPO_DA_TRILHA = 8;
const MARGEM_DO_FAROL = 8;

/**
 * Onde o feixe apontou da última vez. Fica fora do componente para sobreviver à troca de tela:
 * ao voltar de uma lição concluída, o feixe sai do nó antigo e desce até o novo.
 */
let ultimoAlvoDoFeixe: number | null = null;

const PoligonoAnimado = Animated.createAnimatedComponent(Polygon);

/**
 * O feixe do farol: sai da lâmpada e ilumina o nó de hoje. É o único movimento da trilha,
 * e acontece uma vez, quando a pessoa conclui uma parte.
 */
function FeixeDoFarol({ largura, altura, alvoY }: { largura: number; altura: number; alvoY: number }) {
  const reduzir = useReducedMotion();
  const y = useSharedValue(ultimoAlvoDoFeixe ?? alvoY);
  const lx = largura - MARGEM_DO_FAROL - TAMANHO_DO_FAROL * 1.5 + LAMPADA_DO_FAROL.x;
  const ly = TOPO_DA_TRILHA + (ALTURA_DO_FAROL - TAMANHO_DO_FAROL) / 2 + LAMPADA_DO_FAROL.y;
  const cx = COLUNA_DOS_NOS / 2;

  useEffect(() => {
    if (reduzir || ultimoAlvoDoFeixe === null || ultimoAlvoDoFeixe === alvoY) {
      y.value = alvoY;
    } else {
      y.value = withTiming(alvoY, { duration: movimento.celebracaoMs, easing: Easing.inOut(Easing.cubic) });
    }
    ultimoAlvoDoFeixe = alvoY;
  }, [alvoY, reduzir, y]);

  const props = useAnimatedProps(() => {
    const dx = cx - lx;
    const dy = y.value - ly;
    const comprimento = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / comprimento;
    const uy = dy / comprimento;
    // A ponta do feixe passa um pouco do nó e abre 38 pontos para cada lado.
    const px = cx + ux * 18;
    const py = y.value + uy * 18;
    const meia = 38;
    return {
      points: `${lx},${ly} ${px - uy * meia},${py + ux * meia} ${px + uy * meia},${py - ux * meia}`,
    };
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={largura} height={altura}>
        <Defs>
          <LinearGradient id="feixe" gradientUnits="userSpaceOnUse" x1={lx} y1={ly} x2={cx} y2={alvoY}>
            <Stop offset="0" stopColor={cor.luz} stopOpacity={0.5} />
            <Stop offset="1" stopColor={cor.luz} stopOpacity={0.06} />
          </LinearGradient>
        </Defs>
        <PoligonoAnimado animatedProps={props} fill="url(#feixe)" />
      </Svg>
    </View>
  );
}

type ParaVoce = { chave: string; icone: ReactNode; titulo: string; sub: string; onPress: () => void };

export default function Trilha() {
  const {
    onboardingConcluido,
    carreira,
    metaDiaria,
    mapa,
    concluidas,
    dominadas,
    sequencia,
    licoesHoje,
    desafiosHoje,
    registrarDesafio,
    ganharDesafio,
    reiniciar,
    modoDeErro,
    alternarModoDeErro,
    revisoes,
    nuvem,
    conta,
  } = useProgresso();
  const [cartaoAberto, setCartaoAberto] = useState(false);
  const [alvoDoPulo, setAlvoDoPulo] = useState<number | null>(null);
  const [limiteDeDesafio, setLimiteDeDesafio] = useState(false);
  const [laboratorio, setLaboratorio] = useState(false);
  const [largura, setLargura] = useState(0);
  const [alturaVisivel, setAlturaVisivel] = useState(0);
  const rolagem = useRef<ScrollViewInstance>(null);
  const jaCentrou = useRef(false);
  const { aviso, mostrarAviso } = useAviso();
  // A hora de revisar depende do relógio: recalcula sempre que a trilha volta a aparecer.
  const [agora, setAgora] = useState(() => Date.now());
  useFocusEffect(useCallback(() => setAgora(Date.now()), []));

  const farolAceso = concluidas >= totalDeNos;
  const vezDoFarol = concluidas === indiceDoFarol;
  // Centro do nó atual, contado do topo da rolagem (o farol fica no alto e as partes descem da última à primeira).
  const linhaDoAtual = partes.length - 1 - Math.min(concluidas, partes.length - 1);
  const centroDoAtual = TOPO_DA_TRILHA + ALTURA_DO_FAROL + linhaDoAtual * ALTURA_DA_LINHA + ALTURA_DA_LINHA / 2;
  const alturaDaTrilha = TOPO_DA_TRILHA + ALTURA_DO_FAROL + partes.length * ALTURA_DA_LINHA;

  // A trilha abre centrada no nó atual, e não no topo cheio de cadeados.
  useEffect(() => {
    if (jaCentrou.current || alturaVisivel === 0) return;
    jaCentrou.current = true;
    const alvo = vezDoFarol || farolAceso ? 0 : centroDoAtual - alturaVisivel * 0.55;
    rolagem.current?.scrollTo({ y: Math.max(0, alvo), animated: false });
  }, [alturaVisivel, centroDoAtual, vezDoFarol, farolAceso]);

  // Primeiro acesso: valor antes de qualquer pedido (jornada, etapa 2).
  if (!onboardingConcluido) return <Redirect href="/boas-vindas" />;

  const c = carreiraPorId(carreira);
  const paraRevisar = vencidasDoModulo(moduloAtual, vencidas(revisoes, new Date(agora)));
  const questoesDaRevisao = Math.min(paraRevisar.length, QUESTOES_DA_REVISAO_RAPIDA);
  // Convite para guardar o progresso: só depois de a pessoa ter recebido valor (2 partes) e só para conta anônima.
  const convidarParaGuardar = nuvem === 'conectada' && conta?.anonima === true && concluidas >= 2;
  const feitasHoje = Math.min(licoesHoje, metaDiaria);
  const metaCumprida = licoesHoje >= metaDiaria;
  // Convite "Pular pra cá?" no nó dois à frente, quando existir.
  const noComConvite = concluidas + 2 < totalDePartes ? concluidas + 2 : null;

  // "Para você": um assunto por vez, nesta ordem: revisão vencida, mapa não feito, guardar o progresso.
  const paraVoce: ParaVoce | null =
    paraRevisar.length >= LIMIAR_DA_REVISAO_RAPIDA
      ? {
          chave: 'revisao',
          icone: <IconeRevisao tamanho={26} />,
          titulo: 'Revisão rápida',
          sub: `${questoesDaRevisao} questões no ponto de revisar · +${limites.xpDaRevisao} XP`,
          onPress: () => router.push({ pathname: '/licao', params: { modo: 'revisao' } }),
        }
      : !mapa
        ? {
            chave: 'mapa',
            icone: <IconeBussola tamanho={26} />,
            titulo: 'Descobrir meu ponto de partida',
            sub: '6 perguntas, 2 minutos, sem nota',
            onPress: () => router.push('/diagnostico'),
          }
        : convidarParaGuardar
          ? {
              chave: 'guardar',
              icone: <IconeEscudo tamanho={26} />,
              titulo: 'Guardar meu progresso',
              sub: 'Hoje ele está só neste aparelho.',
              onPress: () => router.push({ pathname: '/conta', params: { modo: 'salvar' } }),
            }
          : null;

  function estadoDaParte(indice: number): EstadoNo {
    if (indice < concluidas) return dominadas.includes(indice) ? 'dominada' : 'feita';
    return indice === concluidas ? 'atual' : 'bloqueada';
  }

  /** Trecho entre a parte `indice` e a `vizinha`: aceso se as duas já foram alcançadas. */
  function ligacao(indice: number, vizinha: number): Ligacao | undefined {
    if (vizinha < 0 || vizinha >= totalDePartes) return undefined;
    return Math.max(indice, vizinha) <= concluidas ? 'acesa' : 'apagada';
  }

  function tocarFarol() {
    if (farolAceso) {
      haptico.selecao();
      mostrarAviso(`Farol aceso. Você concluiu ${nomeDoModulo}.`);
    } else if (vezDoFarol) {
      haptico.leve();
      setCartaoAberto(true);
    } else {
      haptico.leve();
      setAlvoDoPulo(indiceDoFarol);
    }
  }

  function tocarParte(indice: number) {
    if (indice < concluidas) {
      haptico.selecao();
      mostrarAviso(dominadas.includes(indice) ? 'Parte dominada pelo desafio.' : 'Lição concluída. Que bom!');
    } else if (indice === concluidas) {
      haptico.leve();
      setCartaoAberto(true);
    } else {
      haptico.leve();
      setAlvoDoPulo(indice);
    }
  }

  function comecarDesafio() {
    if (alvoDoPulo === null) return;
    if (desafiosHoje >= limites.desafiosPorDia) {
      haptico.aviso();
      setLimiteDeDesafio(true);
      return;
    }
    registrarDesafio();
    const alvo = alvoDoPulo;
    setAlvoDoPulo(null);
    router.push({ pathname: '/desafio', params: { ate: String(alvo) } });
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.cabeca}>
        {/* A sequência aparece quando passa de zero: a conversa não começa pelo zero. */}
        {sequencia > 0 ? (
          <View style={estilos.indicador}>
            <IconeLuzDaSequencia tamanho={22} />
            <Text style={estilos.sequencia}>{textoDeDias(sequencia)}</Text>
          </View>
        ) : (
          <View />
        )}
        <View style={estilos.indicador}>
          <IconeAnelDaMeta tamanho={20} progresso={feitasHoje / metaDiaria} />
          <Text style={[estilos.meta, metaCumprida ? { color: cor.luz } : null]}>
            {metaCumprida ? 'Meta de hoje cumprida' : `Meta de hoje: ${feitasHoje} de ${metaDiaria}`}
          </Text>
        </View>
      </View>

      {/* Toque longo no banner abre o Laboratório (controles de demonstração). */}
      <Pressable
        onLongPress={() => {
          haptico.selecao();
          setLaboratorio((v) => !v);
        }}
        delayLongPress={700}
        accessible={false}
        style={estilos.banner}>
        <View>
          <Text style={estilos.bannerPequeno}>{`Português · Módulo 1${c ? ` · ${c.nome}` : ''}`}</Text>
          <Text style={estilos.bannerTitulo}>{nomeDoModulo}</Text>
        </View>
        <IconeModulos tamanho={26} />
      </Pressable>

      {paraVoce ? (
        <Animated.View key={paraVoce.chave} entering={FadeInDown.duration(250)}>
          <Pressable
            onPress={() => {
              haptico.leve();
              paraVoce.onPress();
            }}
            accessibilityRole="button"
            accessibilityLabel={`Para você: ${paraVoce.titulo}, ${paraVoce.sub}`}
            style={estilos.paraVoce}>
            {paraVoce.icone}
            <View style={estilos.paraVoceTextos}>
              <Text style={estilos.paraVoceRotulo}>Para você</Text>
              <Text style={estilos.paraVoceTitulo}>{paraVoce.titulo}</Text>
              <Text style={estilos.paraVoceSub}>{paraVoce.sub}</Text>
            </View>
            <IconeSeta tamanho={20} cor={cor.textoSuave} />
          </Pressable>
        </Animated.View>
      ) : null}

      <ScrollView
        ref={rolagem}
        onLayout={(e) => setAlturaVisivel(e.nativeEvent.layout.height)}
        contentContainerStyle={estilos.rolagem}
        showsVerticalScrollIndicator={false}>
        <View style={estilos.trilha} onLayout={(e) => setLargura(e.nativeEvent.layout.width)}>
          {largura > 0 && !farolAceso && !vezDoFarol ? (
            <FeixeDoFarol largura={largura} altura={alturaDaTrilha} alvoY={centroDoAtual} />
          ) : null}
          <NoTrilha
            farol
            estado={farolAceso ? 'feita' : vezDoFarol ? 'atual' : 'bloqueada'}
            rotulo={`Farol de ${nomeDoModulo}`}
            sub={farolAceso ? 'Aceso' : vezDoFarol ? 'Hoje' : 'Estilo de prova'}
            onPress={tocarFarol}
          />
          {[...partes]
            .map((_, i) => partes.length - 1 - i)
            .map((indice) => (
              <NoTrilha
                key={indice}
                estado={estadoDaParte(indice)}
                rotulo={indice === concluidas ? `Parte ${indice + 1}, hoje` : `Parte ${indice + 1}`}
                sub={partes[indice]}
                convite={indice === noComConvite ? 'Pular pra cá?' : undefined}
                acima={ligacao(indice, indice + 1)}
                abaixo={ligacao(indice, indice - 1)}
                onPress={() => tocarParte(indice)}
              />
            ))}
        </View>

        {laboratorio ? (
          <View style={estilos.laboratorio}>
            <Text style={estilos.laboratorioTitulo}>Laboratório (só para testes)</Text>
            <Pressable onPress={alternarModoDeErro} style={estilos.rodapeDemo} accessibilityRole="button">
              <Text style={estilos.rodapeDemoTexto}>
                {`Experimento de erro: ${rotuloModoDeErro[modoDeErro]} (toque para trocar)`}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                tocar('licao');
                setTimeout(() => mostrarAviso(diagnosticoDoSom('licao')), 400);
              }}
              style={estilos.rodapeDemo}
              accessibilityRole="button">
              <Text style={estilos.rodapeDemoTexto}>Testar som (diagnóstico)</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/icones')} style={estilos.rodapeDemo} accessibilityRole="button">
              <Text style={estilos.rodapeDemoTexto}>Ver catálogo de ícones</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/conta')} style={estilos.rodapeDemo} accessibilityRole="button">
              <Text style={estilos.rodapeDemoTexto}>
                {conta && !conta.anonima && nuvem === 'conectada'
                  ? `Nuvem: progresso salvo na conta ${conta.email ?? ''}`
                  : textoDaNuvem[nuvem]}
              </Text>
            </Pressable>
            <Pressable onPress={reiniciar} style={estilos.rodapeDemo} accessibilityRole="button">
              <Text style={estilos.rodapeDemoTexto}>Reiniciar demonstração (volta ao início)</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      {/* O botão grande da jornada (etapa 5): um toque começa a lição de hoje. */}
      {!farolAceso ? (
        <View style={estilos.rodape}>
          <Botao
            rotulo={vezDoFarol ? 'Acender o farol' : `Continuar a Parte ${concluidas + 1}`}
            sub={`+${vezDoFarol ? limites.xpDoFarol : limites.xpDaLicao} XP`}
            onPress={() => router.push('/licao')}
          />
        </View>
      ) : null}

      <Aviso texto={aviso} />

      {cartaoAberto && !farolAceso ? (
        <View style={StyleSheet.absoluteFill}>
          <Pressable style={estilos.fundoCartao} onPress={() => setCartaoAberto(false)} accessibilityLabel="Fechar" />
          <Animated.View entering={FadeInDown.duration(220)} style={estilos.cartao}>
            <Text style={estilos.cartaoTitulo}>{vezDoFarol ? `Farol de ${nomeDoModulo}` : partes[concluidas]}</Text>
            <Text style={estilos.cartaoSub}>
              {vezDoFarol
                ? `${QUESTOES_DO_FAROL} questões no estilo da prova, com tudo o que você viu no módulo. Acenda o farol.`
                : `Lição ${concluidas + 1} de ${totalDePartes} · cerca de 10 questões`}
            </Text>
            <View style={estilos.cartaoBotao}>
              <Botao
                rotulo={vezDoFarol ? 'Acender o farol' : 'Começar'}
                sub={`+${vezDoFarol ? limites.xpDoFarol : limites.xpDaLicao} XP`}
                onPress={() => {
                  setCartaoAberto(false);
                  router.push('/licao');
                }}
              />
            </View>
          </Animated.View>
        </View>
      ) : null}

      {alvoDoPulo !== null ? (
        <View style={StyleSheet.absoluteFill}>
          <Pressable
            style={estilos.fundoCartao}
            onPress={() => {
              setAlvoDoPulo(null);
              setLimiteDeDesafio(false);
            }}
            accessibilityLabel="Fechar"
          />
          <Animated.View entering={FadeInDown.duration(220)} style={[estilos.cartao, estilos.cartaoPulo]}>
            <Text style={[estilos.cartaoTitulo, { color: cor.texto }]}>Pular pra cá?</Text>
            <Text style={[estilos.cartaoSub, { color: cor.textoSuave }]}>
              {`Já sabe isso? Prove e avance. ${limites.luzesDoDesafio} luzes, ${concluidas + 1 === alvoDoPulo ? `e a Parte ${alvoDoPulo}` : `e as Partes ${concluidas + 1} a ${alvoDoPulo}`} ficam dominadas.`}
            </Text>
            {limiteDeDesafio ? (
              <View style={estilos.limite}>
                <Text style={estilos.limiteTexto}>
                  <Text style={{ fontFamily: fonte.textoSemi, color: cor.luz }}>
                    Seu desafio de hoje já foi usado.{' '}
                  </Text>
                  Quer mais um? Assista a um vídeo curto ou conheça o Pro. (Simulado no protótipo.)
                </Text>
                <Botao
                  rotulo="Assistir vídeo"
                  sub="+1 desafio"
                  variante="secundario"
                  onPress={() => {
                    ganharDesafio();
                    setLimiteDeDesafio(false);
                    haptico.sucesso();
                  }}
                />
              </View>
            ) : null}
            <View style={estilos.cartaoBotao}>
              <Botao rotulo="Começar desafio" sub={`+${limites.xpDoDesafio} XP`} onPress={comecarDesafio} />
              <Botao
                rotulo="Prefiro fazer as lições"
                variante="terciario"
                onPress={() => {
                  setAlvoDoPulo(null);
                  setLimiteDeDesafio(false);
                }}
              />
            </View>
          </Animated.View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo, paddingHorizontal: 16 },
  cabeca: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 40,
    paddingVertical: 6,
  },
  indicador: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sequencia: { fontFamily: fonte.tituloMedio, fontSize: tamanho.md, color: cor.luz },
  meta: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave },
  banner: {
    backgroundColor: cor.mare,
    borderRadius: raio.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerPequeno: { fontFamily: fonte.textoSemi, fontSize: tamanho.xs, color: cor.textoSobreMare },
  bannerTitulo: { fontFamily: fonte.titulo, fontSize: tamanho.lg, color: cor.textoSobreMare },
  paraVoce: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: cor.superficie,
    borderColor: cor.linhaForte,
    borderWidth: 1,
    borderRadius: raio.lg,
  },
  paraVoceTextos: { flex: 1 },
  paraVoceRotulo: { fontFamily: fonte.textoSemi, fontSize: tamanho.xs, color: cor.mareClaro },
  paraVoceTitulo: { fontFamily: fonte.tituloMedio, fontSize: tamanho.md, color: cor.texto },
  paraVoceSub: { fontFamily: fonte.texto, fontSize: tamanho.xs, color: cor.textoSuave },
  rolagem: { paddingBottom: 24 },
  trilha: { paddingTop: TOPO_DA_TRILHA },
  laboratorio: {
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: cor.linha,
    paddingTop: 10,
  },
  laboratorioTitulo: { fontFamily: fonte.textoSemi, fontSize: tamanho.xs, color: cor.textoSuave, textAlign: 'center' },
  rodapeDemo: { alignSelf: 'center', padding: 12, marginTop: 4, minHeight: alvoMinimo, justifyContent: 'center' },
  rodapeDemoTexto: { fontFamily: fonte.texto, fontSize: tamanho.xs, color: cor.textoSuave, textAlign: 'center' },
  rodape: { paddingTop: 10, paddingBottom: 12 },
  fundoCartao: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: cor.sobreposicao },
  cartao: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    backgroundColor: cor.mare,
    borderRadius: raio.lg + 4,
    padding: 18,
  },
  cartaoPulo: { backgroundColor: cor.superficie, borderColor: cor.linha, borderWidth: 1 },
  cartaoTitulo: { fontFamily: fonte.titulo, fontSize: tamanho.lg, color: cor.textoSobreMare },
  cartaoSub: {
    fontFamily: fonte.texto,
    fontSize: tamanho.sm,
    lineHeight: 21,
    color: cor.textoSobreMare,
    marginTop: 2,
  },
  cartaoBotao: { marginTop: 16, gap: 8 },
  limite: {
    marginTop: 12,
    backgroundColor: cor.fundo,
    borderColor: cor.luz,
    borderWidth: 1,
    borderRadius: raio.md,
    padding: 12,
    gap: 10,
  },
  limiteTexto: { fontFamily: fonte.texto, fontSize: tamanho.sm, lineHeight: 21, color: cor.texto },
});
