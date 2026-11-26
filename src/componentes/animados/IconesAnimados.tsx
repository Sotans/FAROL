import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { IconeLanterna, IconeLuzDaSequencia } from '@/icones';
import { TRACO_DA_INTERFACE } from '@/icones/interface';
import { curva, duracao, mola } from '@/tema/movimento';
import { cor, raio } from '@/tema/tokens';
import { useMudancaVista, valorVisto } from './vistos';

const PathAnimado = Animated.createAnimatedComponent(Path);
const CirculoAnimado = Animated.createAnimatedComponent(Circle);

// ---------- Visto que se desenha ----------

/** O mesmo visto da Lucide, desenhado do traço curto para o longo. */
const CAMINHO_DO_VISTO = 'M4 12 L9 17 L20 6';
const COMPRIMENTO_DO_VISTO = 23;

/** O visto da resposta certa: o traço se desenha em 200 ms. Com "reduzir movimento", aparece pronto. */
export function IconeVistoDesenhado({ tamanho = 24, cor: c = cor.acerto }: { tamanho?: number; cor?: string }) {
  const reduzir = useReducedMotion();
  const desenho = useSharedValue(reduzir ? 1 : 0);

  useEffect(() => {
    if (!reduzir) desenho.value = withTiming(1, { duration: duracao.desenho, easing: curva.saida });
  }, [reduzir, desenho]);

  const props = useAnimatedProps(() => ({ strokeDashoffset: COMPRIMENTO_DO_VISTO * (1 - desenho.value) }));

  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <PathAnimado
        d={CAMINHO_DO_VISTO}
        stroke={c}
        strokeWidth={TRACO_DA_INTERFACE}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={COMPRIMENTO_DO_VISTO}
        animatedProps={props}
      />
    </Svg>
  );
}

// ---------- Anel da meta que enche ----------

function animarAnel(p: SharedValue<number>, de: number, para: number, reduzir: boolean) {
  if (reduzir) {
    p.value = para;
    return;
  }
  p.value = de;
  p.value = withTiming(para, { duration: duracao.anel, easing: curva.meio });
}

/** Cresce um pouco e assenta com a mola: a luz da sequência e o selo de conquista acendendo. */
function acender(escala: SharedValue<number>, de: number) {
  escala.value = de;
  escala.value = withSequence(withTiming(1.25, { duration: duracao.toque }), withSpring(1, mola));
}

/** Círculo inteiro a partir do topo, no sentido horário (sem rotação, que o navegador trata diferente). */
const CAMINHO_DO_ANEL = 'M12 3.5 A8.5 8.5 0 1 1 12 20.5 A8.5 8.5 0 1 1 12 3.5';
const COMPRIMENTO_DO_ANEL = 2 * Math.PI * 8.5;

/**
 * O anel da meta da trilha. Quando a pessoa volta de uma lição, a luz percorre o trecho novo
 * (300 ms) e, ao fechar a meta, o ponto central acende.
 */
export function AnelDaMetaQueEnche({ tamanho = 24, progresso }: { tamanho?: number; progresso: number }) {
  const reduzir = useReducedMotion();
  const alvo = Math.min(Math.max(progresso, 0), 1);
  const p = useSharedValue(valorVisto('meta') ?? alvo);

  useMudancaVista('meta', alvo, (anterior) => animarAnel(p, anterior, alvo, reduzir));

  const arco = useAnimatedProps(() => ({
    strokeDashoffset: COMPRIMENTO_DO_ANEL * (1 - p.value),
    opacity: p.value > 0.001 ? 1 : 0,
  }));
  const centro = useAnimatedProps(() => {
    const cheio = Math.max(0, (p.value - 0.98) / 0.02);
    return { opacity: cheio, r: 3.6 * (0.9 + 0.1 * cheio) };
  });

  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={8.5} stroke={cor.linha} strokeWidth={3} fill="none" />
      <PathAnimado
        d={CAMINHO_DO_ANEL}
        stroke={cor.luz}
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={COMPRIMENTO_DO_ANEL}
        animatedProps={arco}
      />
      <CirculoAnimado cx={12} cy={12} fill={cor.luz} animatedProps={centro} />
    </Svg>
  );
}

// ---------- Luz da sequência que acende ----------

/** O brilho acende em 150 ms e apaga em 300 ms. */
function pulsarBrilho(brilho: SharedValue<number>, pico: number) {
  brilho.value = withSequence(
    withTiming(pico, { duration: duracao.toque, easing: curva.saida }),
    withTiming(0, { duration: duracao.anel, easing: curva.saida }),
  );
}

/** Brilho redondo atrás de um ícone, que pulsa uma vez. */
function useBrilho() {
  const brilho = useSharedValue(0);
  const estilo = useAnimatedStyle(() => ({ opacity: brilho.value, transform: [{ scale: 0.9 + 0.3 * brilho.value }] }));
  const pulsar = useCallback((pico: number = 0.55) => pulsarBrilho(brilho, pico), [brilho]);
  return { estilo, pulsar };
}

/**
 * A luz da sequência no topo da trilha. Quando o número de dias sobe (ao voltar da lição do dia),
 * ela "acende": cresce um pouco, assenta com uma mola leve e solta um brilho.
 */
export function LuzDaSequenciaQueAcende({ tamanho = 22, dias }: { tamanho?: number; dias: number }) {
  const reduzir = useReducedMotion();
  const escala = useSharedValue(1);
  const { estilo: estiloDoBrilho, pulsar } = useBrilho();

  useMudancaVista('sequencia', dias, (anterior) => {
    if (dias <= anterior) return;
    pulsar(0.6);
    if (!reduzir) acender(escala, 1);
  });

  const estiloDoIcone = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  return (
    <View style={{ width: tamanho, height: tamanho }}>
      <Animated.View
        pointerEvents="none"
        style={[
          estilos.brilho,
          { width: tamanho * 1.8, height: tamanho * 1.8, left: -tamanho * 0.4, top: -tamanho * 0.4 },
          estiloDoBrilho,
        ]}
      />
      <Animated.View style={estiloDoIcone}>
        <IconeLuzDaSequencia tamanho={tamanho} />
      </Animated.View>
    </View>
  );
}

// ---------- Lanterna que acende ----------

/**
 * A lanterna da dica. A cada dica usada (`gatilho` muda), ela pisca a luz uma vez: 150 ms para
 * acender e 300 ms para assentar. Quando as dicas acabam, ela fica apagada (sem animar o "não").
 */
export function LanternaQueAcende({
  tamanho = 18,
  acesa,
  gatilho,
}: {
  tamanho?: number;
  acesa: boolean;
  gatilho: number;
}) {
  const reduzir = useReducedMotion();
  const escala = useSharedValue(1);
  const { estilo: estiloDoBrilho, pulsar } = useBrilho();
  const anterior = useRef(gatilho);

  useEffect(() => {
    if (anterior.current === gatilho) return;
    anterior.current = gatilho;
    pulsar(0.5);
    if (!reduzir)
      escala.value = withSequence(
        withTiming(1.15, { duration: duracao.toque, easing: curva.saida }),
        withTiming(1, { duration: duracao.transicao, easing: curva.saida }),
      );
  }, [gatilho, reduzir, escala, pulsar]);

  const estiloDoIcone = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  return (
    <View style={{ width: tamanho, height: tamanho }}>
      <Animated.View
        pointerEvents="none"
        style={[
          estilos.brilho,
          { width: tamanho * 1.8, height: tamanho * 1.8, left: -tamanho * 0.4, top: -tamanho * 0.4 },
          estiloDoBrilho,
        ]}
      />
      <Animated.View style={estiloDoIcone}>
        <IconeLanterna tamanho={tamanho} acesa={acesa} />
      </Animated.View>
    </View>
  );
}

// ---------- Número que conta ----------

/**
 * Um número que conta de 0 até `valor` (700 ms, desacelerando), para o XP das comemorações.
 * O leitor de tela ouve só o valor final. Com "reduzir movimento", mostra o valor direto.
 */
export function NumeroQueConta({
  valor,
  formatar = String,
  style,
}: {
  valor: number;
  formatar?: (n: number) => string;
  style?: StyleProp<TextStyle>;
}) {
  const reduzir = useReducedMotion();
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (reduzir) return;
    let quadro = 0;
    const inicio = Date.now();
    const passo = () => {
      const t = Math.min((Date.now() - inicio) / duracao.comemoracao, 1);
      setAtual(Math.round(valor * (1 - Math.pow(1 - t, 3))));
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [valor, reduzir]);

  return (
    <Text style={style} accessibilityLabel={formatar(valor)}>
      {formatar(reduzir ? valor : atual)}
    </Text>
  );
}

const estilos = StyleSheet.create({
  brilho: { position: 'absolute', borderRadius: raio.circulo, backgroundColor: cor.luz, opacity: 0 },
});

// ---------- Selo de conquista ----------

/**
 * O selo de uma conquista no perfil. Quando a pessoa abre o perfil e encontra uma conquista
 * alcançada desde a última visita, o selo acende uma vez: cresce e assenta com uma mola leve,
 * soltando um brilho. Na primeira visita da sessão, só registra (abrir o app não é conquista).
 */
export function SeloQueAcende({
  id,
  alcancada,
  tamanho = 34,
  children,
}: {
  id: string;
  alcancada: boolean;
  tamanho?: number;
  children: React.ReactNode;
}) {
  const reduzir = useReducedMotion();
  const escala = useSharedValue(1);
  const { estilo: estiloDoBrilho, pulsar } = useBrilho();

  useMudancaVista(`conquista:${id}`, alcancada ? 1 : 0, () => {
    if (!alcancada) return;
    pulsar(0.6);
    if (!reduzir) acender(escala, 0.9);
  });

  const estiloDoSelo = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  return (
    <View style={{ width: tamanho, height: tamanho, marginBottom: 4 }}>
      <Animated.View
        pointerEvents="none"
        style={[
          estilos.brilho,
          { width: tamanho * 1.6, height: tamanho * 1.6, left: -tamanho * 0.3, top: -tamanho * 0.3 },
          estiloDoBrilho,
        ]}
      />
      <Animated.View style={estiloDoSelo}>{children}</Animated.View>
    </View>
  );
}
