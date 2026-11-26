import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';

import { IconeSeta } from '@/icones';
import { colunaDaDireita, ordemDeExibicao, parEstaCorreto } from '@/licao/respostas';
import type { Questao, QuestaoDeOrdenar, QuestaoDePares } from '@/licao/tipos';
import { haptico } from '@/servicos/haptico';
import { tocar, tocarAcerto } from '@/servicos/som';
import { alvoMinimo, cor, fonte, raio, tamanho } from '@/tema/tokens';
import { Opcao, type EstadoOpcao } from './Opcao';

/**
 * Situação da questão vista pela área de resposta:
 * - respondendo: a pessoa interage;
 * - acerto: mostra a resposta dela como certa;
 * - erro: mostra a resposta dela como errada, à espera de "tentar de novo";
 * - revelada: mostra a solução (resposta guiada, modo "pular para o fim" e desafio).
 */
export type Situacao = 'respondendo' | 'acerto' | 'erro' | 'revelada';

type Props = {
  questao: Questao;
  situacao: Situacao;
  /** Exercícios de escolha: estado visual e bloqueio de cada opção, decididos pela tela. */
  estadoDaOpcao: (i: number) => EstadoOpcao;
  opcaoDesabilitada: (i: number) => boolean;
  onEscolher: (i: number) => void;
  /** Ordenar: a sequência montada (índices de `itens`). */
  ordem: number[];
  onAdicionar: (i: number) => void;
  onRemover: (posicao: number) => void;
  /** Ligar pares. */
  onErrarPar: () => void;
  onConcluirPares: () => void;
};

/**
 * Área de resposta de qualquer tipo de exercício (submeta 3.3). Usada na lição e no desafio.
 * A tela deve passar `key={questao.id}`, para o estado interno recomeçar a cada questão.
 */
export function Exercicio(props: Props) {
  const { questao: q } = props;

  if (q.tipo === 'ordenar') return <Ordenar {...props} questao={q} />;
  if (q.tipo === 'ligarPares') return <LigarPares {...props} questao={q} />;

  if (q.tipo === 'identificarErro') {
    return (
      <View style={estilos.frase} accessibilityHint="Toque no trecho que tem o erro">
        {q.opcoes.map((texto, i) => (
          <Bloco
            key={`${q.id}-${i}`}
            texto={texto}
            estado={props.estadoDaOpcao(i)}
            desabilitado={props.opcaoDesabilitada(i)}
            variante="trecho"
            onPress={() => props.onEscolher(i)}
          />
        ))}
      </View>
    );
  }

  // Múltipla escolha e completar: botões na largura toda, um embaixo do outro.
  return (
    <View style={estilos.opcoes}>
      {q.opcoes.map((texto, i) => (
        <Opcao
          key={`${q.id}-${i}`}
          texto={texto}
          estado={props.estadoDaOpcao(i)}
          desabilitado={props.opcaoDesabilitada(i)}
          onPress={() => props.onEscolher(i)}
        />
      ))}
    </View>
  );
}

// ---------- Ordenar ----------

function Ordenar({ questao, situacao, ordem, onAdicionar, onRemover }: Props & { questao: QuestaoDeOrdenar }) {
  const reduzir = useReducedMotion();
  const exibicao = useMemo(() => ordemDeExibicao(questao), [questao]);
  const revelada = situacao === 'revelada';
  const linha = revelada ? questao.itens.map((_, i) => i) : ordem;
  const respondendo = situacao === 'respondendo';
  const estadoDaLinha: EstadoBloco =
    situacao === 'acerto' || revelada ? 'correta' : situacao === 'erro' ? 'errada' : 'normal';

  return (
    <View style={estilos.ordenar}>
      <View style={estilos.linhaDeResposta} accessibilityLabel="Sua resposta">
        {linha.length === 0 ? <Text style={estilos.instrucao}>Toque nos blocos, na ordem certa.</Text> : null}
        {linha.map((indice, posicao) => (
          <Animated.View
            key={indice}
            entering={reduzir ? undefined : ZoomIn.duration(140)}
            layout={reduzir ? undefined : LinearTransition.duration(160)}>
            <Bloco
              texto={questao.itens[indice]}
              estado={estadoDaLinha}
              desabilitado={!respondendo}
              onPress={() => {
                haptico.selecao();
                onRemover(posicao);
              }}
            />
          </Animated.View>
        ))}
      </View>
      <View style={estilos.banco}>
        {exibicao.map((indice) => {
          const usado = linha.includes(indice);
          return (
            <Bloco
              key={indice}
              texto={questao.itens[indice]}
              estado={usado ? 'vazio' : 'normal'}
              desabilitado={usado || !respondendo}
              onPress={() => {
                haptico.leve();
                tocar('toque');
                onAdicionar(indice);
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

// ---------- Ligar pares ----------

const ESPERA_DO_ERRO_MS = 450;
const ESPERA_DO_FIM_MS = 250;

function LigarPares({ questao, situacao, onErrarPar, onConcluirPares }: Props & { questao: QuestaoDePares }) {
  // A coluna da direita mostra o 2º item de cada par, numa ordem embaralhada (índices de `pares`).
  const direita = useMemo(() => colunaDaDireita(questao), [questao]);
  const [esquerdaEscolhida, setEsquerdaEscolhida] = useState<number | null>(null);
  const [direitaEscolhida, setDireitaEscolhida] = useState<number | null>(null);
  const [ligadosEsquerda, setLigadosEsquerda] = useState<number[]>([]);
  const [ligadosDireita, setLigadosDireita] = useState<number[]>([]);
  const [errado, setErrado] = useState<{ esquerda: number; direita: number } | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  if (situacao === 'revelada') {
    // Solução: cada par lado a lado.
    return (
      <View style={estilos.opcoes}>
        {questao.pares.map(([a, b], i) => (
          <View key={i} style={estilos.parRevelado}>
            <Text style={estilos.parReveladoTexto}>{a}</Text>
            <IconeSeta tamanho={20} />
            <Text style={[estilos.parReveladoTexto, { color: cor.acerto }]}>{b}</Text>
          </View>
        ))}
      </View>
    );
  }

  const bloqueado = situacao !== 'respondendo' || errado !== null;

  function tentar(esquerda: number, direitaDoPar: number) {
    if (parEstaCorreto(questao, esquerda, direitaDoPar)) {
      const ligados = ligadosEsquerda.length + 1;
      setLigadosEsquerda((l) => [...l, esquerda]);
      setLigadosDireita((l) => [...l, direitaDoPar]);
      setEsquerdaEscolhida(null);
      setDireitaEscolhida(null);
      // Cada par certo toca uma nota mais alta que a anterior.
      haptico.leve();
      tocarAcerto(ligados);
      if (ligados === questao.pares.length) temporizador.current = setTimeout(onConcluirPares, ESPERA_DO_FIM_MS);
      return;
    }
    setErrado({ esquerda, direita: direitaDoPar });
    onErrarPar();
    temporizador.current = setTimeout(() => {
      setErrado(null);
      setEsquerdaEscolhida(null);
      setDireitaEscolhida(null);
    }, ESPERA_DO_ERRO_MS);
  }

  function tocarEsquerda(i: number) {
    if (bloqueado || ligadosEsquerda.includes(i)) return;
    haptico.selecao();
    if (direitaEscolhida !== null) tentar(i, direitaEscolhida);
    else setEsquerdaEscolhida(i === esquerdaEscolhida ? null : i);
  }

  function tocarDireita(i: number) {
    if (bloqueado || ligadosDireita.includes(i)) return;
    haptico.selecao();
    if (esquerdaEscolhida !== null) tentar(esquerdaEscolhida, i);
    else setDireitaEscolhida(i === direitaEscolhida ? null : i);
  }

  function estado(lado: 'esquerda' | 'direita', i: number): EstadoBloco {
    const ligados = lado === 'esquerda' ? ligadosEsquerda : ligadosDireita;
    const escolhida = lado === 'esquerda' ? esquerdaEscolhida : direitaEscolhida;
    if (ligados.includes(i)) return 'ligado';
    if (errado && errado[lado] === i) return 'errada';
    if (escolhida === i) return 'selecionada';
    return 'normal';
  }

  return (
    <View style={estilos.pares}>
      <View style={estilos.coluna}>
        {questao.pares.map(([texto], i) => (
          <Bloco
            key={`e${i}`}
            texto={texto}
            estado={estado('esquerda', i)}
            desabilitado={situacao !== 'respondendo' || ligadosEsquerda.includes(i)}
            variante="largo"
            onPress={() => tocarEsquerda(i)}
          />
        ))}
      </View>
      <View style={estilos.coluna}>
        {direita.map((indiceDoPar) => (
          <Bloco
            key={`d${indiceDoPar}`}
            texto={questao.pares[indiceDoPar][1]}
            estado={estado('direita', indiceDoPar)}
            desabilitado={situacao !== 'respondendo' || ligadosDireita.includes(indiceDoPar)}
            variante="largo"
            onPress={() => tocarDireita(indiceDoPar)}
          />
        ))}
      </View>
    </View>
  );
}

// ---------- Bloco: a peça tocável dos exercícios novos ----------

type EstadoBloco = EstadoOpcao | 'vazio' | 'ligado';

const visual: Record<EstadoBloco, { fundo: string; borda: string; texto: string; opacidade: number }> = {
  normal: { fundo: cor.superficie, borda: cor.linhaForte, texto: cor.texto, opacidade: 1 },
  selecionada: { fundo: cor.selecionadaFundo, borda: cor.mare, texto: cor.texto, opacidade: 1 },
  correta: { fundo: cor.acertoFundo, borda: cor.acerto, texto: cor.acerto, opacidade: 1 },
  errada: { fundo: cor.atencaoFundo, borda: cor.atencao, texto: cor.atencao, opacidade: 1 },
  removida: { fundo: cor.superficie, borda: cor.linhaForte, texto: cor.textoSuave, opacidade: 0.45 },
  // O lugar do bloco fica marcado no banco, para nada pular de posição.
  vazio: { fundo: 'transparent', borda: cor.linhaForte, texto: 'transparent', opacidade: 1 },
  ligado: { fundo: cor.acertoFundo, borda: cor.acerto, texto: cor.acerto, opacidade: 0.5 },
};

function Bloco({
  texto,
  estado,
  onPress,
  desabilitado = false,
  variante = 'bloco',
}: {
  texto: string;
  estado: EstadoBloco;
  onPress: () => void;
  desabilitado?: boolean;
  variante?: 'bloco' | 'largo' | 'trecho';
}) {
  const v = visual[estado];
  const reduzir = useReducedMotion();
  const deslocamento = useSharedValue(0);
  const escala = useSharedValue(1);

  useEffect(() => {
    if (reduzir) return;
    if (estado === 'errada') {
      deslocamento.value = withSequence(
        withTiming(-7, { duration: 50 }),
        withTiming(7, { duration: 80 }),
        withTiming(-4, { duration: 70 }),
        withTiming(0, { duration: 50 }),
      );
    } else if (estado === 'correta' || estado === 'ligado') {
      escala.value = withSequence(withSpring(1.06), withSpring(1));
    }
  }, [estado, reduzir, deslocamento, escala]);

  const animado = useAnimatedStyle(() => ({
    transform: [{ translateX: deslocamento.value }, { scale: escala.value }],
  }));

  return (
    <Animated.View style={[animado, variante === 'largo' ? estilos.largoRaiz : null]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={texto}
        accessibilityState={{ disabled: desabilitado, selected: estado === 'selecionada' }}
        disabled={desabilitado}
        onPress={onPress}
        style={[
          estilos.bloco,
          variante === 'trecho' ? estilos.trecho : null,
          variante === 'largo' ? estilos.largo : null,
          {
            backgroundColor: v.fundo,
            borderColor: v.borda,
            opacity: v.opacidade,
            borderStyle: estado === 'vazio' ? 'dashed' : 'solid',
          },
        ]}>
        <Text
          style={[
            estilos.blocoTexto,
            variante === 'trecho' ? estilos.trechoTexto : null,
            { color: v.texto },
            estado === 'removida' ? estilos.riscado : null,
          ]}>
          {texto}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const estilos = StyleSheet.create({
  riscado: { textDecorationLine: 'line-through' },
  opcoes: { gap: 12 },
  frase: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  ordenar: { gap: 22 },
  linhaDeResposta: {
    minHeight: 112,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'flex-start',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: cor.linha,
  },
  instrucao: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave, paddingTop: 12 },
  banco: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  pares: { flexDirection: 'row', gap: 12 },
  coluna: { flex: 1, gap: 10 },
  parRevelado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cor.acertoFundo,
    borderRadius: raio.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  parReveladoTexto: { flex: 1, fontFamily: fonte.textoSemi, fontSize: tamanho.md, color: cor.texto },
  bloco: {
    minHeight: alvoMinimo,
    borderRadius: raio.md,
    borderWidth: 2,
    borderBottomWidth: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  largoRaiz: { alignSelf: 'stretch' },
  largo: { minHeight: alvoMinimo + 8, alignItems: 'center' },
  trecho: { minHeight: 44, paddingHorizontal: 8, paddingVertical: 6, borderRadius: raio.sm, borderBottomWidth: 3 },
  blocoTexto: { fontFamily: fonte.textoSemi, fontSize: tamanho.md, textAlign: 'center' },
  trechoTexto: { fontFamily: fonte.texto, fontSize: tamanho.md + 1 },
});
