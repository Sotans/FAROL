import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewInstance } from 'react-native';
import Svg, { Circle, Path, Text as TextoSvg } from 'react-native-svg';

import { contarFormas, proximaMarca, type MarcaDeAssociacao } from '@/licao/interativas';
import type {
  QuestaoDeAssociacao,
  QuestaoDeCombinatoria,
  QuestaoDeTabelaVerdade,
  QuestaoDeVenn,
  RegiaoDeVenn,
  ValorLogico,
} from '@/licao/tipos';
import { haptico } from '@/servicos/haptico';
import { alvoMinimo, cor, fonte, raio, tamanho } from '@/tema/tokens';
import { Alternador, Quadro, type PropsDaQuestao } from './comum';

/** Cor de uma casa já conferida: verde se bate com a resposta certa, coral se não. */
function corDaConferencia(certa: boolean) {
  return certa
    ? { fundo: cor.acertoFundo, borda: cor.acerto, texto: cor.acerto }
    : { fundo: cor.atencaoFundo, borda: cor.atencao, texto: cor.atencao };
}

// ---------- Montar os parâmetros (combinatória) ----------

const LIMITE = 12;

export function Combinatoria({ resposta, tom, travada, onMudar }: PropsDaQuestao<QuestaoDeCombinatoria>) {
  const r =
    resposta.tipo === 'combinatoria' ? resposta : { tipo: 'combinatoria' as const, n: 5, p: 2, ordemImporta: null };
  const ajustar = (campo: 'n' | 'p', delta: number) => {
    haptico.selecao();
    const novo = { ...r, [campo]: Math.max(1, Math.min(LIMITE, r[campo] + delta)) };
    if (novo.p > novo.n) novo.p = novo.n;
    onMudar(novo);
  };
  const formas = r.ordemImporta === null ? null : contarFormas(r.n, r.p, r.ordemImporta);
  const conta =
    r.ordemImporta === null
      ? 'Diga se a ordem importa'
      : r.ordemImporta
        ? `Arranjo A(${r.n}, ${r.p}) = ${r.n}! ÷ ${r.n - r.p}!`
        : `Combinação C(${r.n}, ${r.p}) = ${r.n}! ÷ (${r.p}! × ${r.n - r.p}!)`;

  return (
    <View style={estilos.coluna}>
      <View style={estilos.parametros}>
        {(['n', 'p'] as const).map((campo) => (
          <View key={campo} style={estilos.parametro}>
            <Text style={estilos.parametroNome}>{campo === 'n' ? 'Total (n)' : 'Escolhidos (p)'}</Text>
            <View style={estilos.controle}>
              <BotaoRedondo
                texto="−"
                rotulo={`Diminuir ${campo}`}
                desabilitado={travada}
                onPress={() => ajustar(campo, -1)}
              />
              <Text style={estilos.parametroValor} accessibilityLabel={`${campo} igual a ${r[campo]}`}>
                {r[campo]}
              </Text>
              <BotaoRedondo
                texto="+"
                rotulo={`Aumentar ${campo}`}
                desabilitado={travada}
                onPress={() => ajustar(campo, 1)}
              />
            </View>
          </View>
        ))}
      </View>
      <Alternador
        rotulo="A ordem importa?"
        opcoes={[
          { valor: 'sim', texto: 'A ordem importa' },
          { valor: 'nao', texto: 'Não importa' },
        ]}
        valor={r.ordemImporta === null ? null : r.ordemImporta ? 'sim' : 'nao'}
        travado={travada}
        tom={tom}
        onEscolher={(v) => onMudar({ ...r, ordemImporta: v === 'sim' })}
      />
      <Quadro style={estilos.formula}>
        <Text style={estilos.conta}>{conta}</Text>
        <Text
          style={[
            estilos.total,
            tom === 'certo' ? { color: cor.acerto } : tom === 'errado' ? { color: cor.atencao } : null,
          ]}>
          {formas === null ? '?' : `${formas.toLocaleString('pt-BR')} formas`}
        </Text>
      </Quadro>
    </View>
  );
}

function BotaoRedondo({
  texto,
  rotulo,
  desabilitado,
  onPress,
}: {
  texto: string;
  rotulo: string;
  desabilitado: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      disabled={desabilitado}
      onPress={onPress}
      hitSlop={6}
      style={estilos.redondo}>
      <Text style={estilos.redondoTexto}>{texto}</Text>
    </Pressable>
  );
}

// ---------- Tabela-verdade ----------

export function TabelaVerdade({ questao: q, resposta, tom, travada, onMudar }: PropsDaQuestao<QuestaoDeTabelaVerdade>) {
  const valores = resposta.tipo === 'tabelaVerdade' ? resposta.valores : q.resultado.map(() => null);
  const alternar = (i: number) => {
    haptico.selecao();
    const novos = [...valores];
    novos[i] = valores[i] === 'V' ? 'F' : 'V';
    onMudar({ tipo: 'tabelaVerdade', valores: novos });
  };
  return (
    <View style={estilos.tabela} accessibilityRole="grid">
      <View style={estilos.tabelaLinha}>
        {q.colunas.map((c) => (
          <Text key={c} style={estilos.tabelaCabeca}>
            {c}
          </Text>
        ))}
      </View>
      {q.linhas.map((linha, i) => {
        const v: ValorLogico | null = valores[i];
        const conferida = tom !== 'neutro' && v !== null ? corDaConferencia(v === q.resultado[i]) : null;
        return (
          <View key={i} style={estilos.tabelaLinha}>
            {linha.map((valor, j) => (
              <View key={j} style={estilos.casaFixa}>
                <Text style={estilos.casaFixaTexto}>{valor}</Text>
              </View>
            ))}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Linha ${i + 1}: ${v ?? 'vazia'}. Toque para alternar`}
              disabled={travada}
              onPress={() => alternar(i)}
              style={[
                estilos.casa,
                v !== null ? estilos.casaPreenchida : null,
                conferida ? { backgroundColor: conferida.fundo, borderColor: conferida.borda } : null,
              ]}>
              <Text style={[estilos.casaTexto, conferida ? { color: conferida.texto } : null]}>{v ?? '?'}</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

// ---------- Diagrama de Venn ----------

/** Dois círculos de raio 70, centros em x = 115 e 185: as três regiões recortadas pelos pontos de encontro. */
const REGIOES: { id: RegiaoDeVenn; d: string }[] = [
  { id: 'soA', d: 'M150 34.4 A70 70 0 1 0 150 155.6 A70 70 0 0 1 150 34.4 Z' },
  { id: 'ambos', d: 'M150 34.4 A70 70 0 0 1 150 155.6 A70 70 0 0 1 150 34.4 Z' },
  { id: 'soB', d: 'M150 34.4 A70 70 0 1 1 150 155.6 A70 70 0 0 0 150 34.4 Z' },
];

/** A região do ponto (em coordenadas do desenho, 300 × 190), pelos dois círculos. */
export function regiaoDoPonto(x: number, y: number): RegiaoDeVenn | null {
  const dentro = (cx: number) => (x - cx) ** 2 + (y - 95) ** 2 <= 70 ** 2;
  const a = dentro(115);
  const b = dentro(185);
  if (a && b) return 'ambos';
  if (a) return 'soA';
  if (b) return 'soB';
  return null;
}

export function Venn({ questao: q, resposta, tom, travada, onMudar }: PropsDaQuestao<QuestaoDeVenn>) {
  const desenho = useRef<ViewInstance>(null);
  const regiao = resposta.tipo === 'venn' ? resposta.regiao : null;
  const [a, b] = q.conjuntos;
  const nome: Record<RegiaoDeVenn, string> = {
    soA: `Só ${a.toLowerCase()}`,
    ambos: `${a} e ${b.toLowerCase()}`,
    soB: `Só ${b.toLowerCase()}`,
  };
  const escolher = (r: RegiaoDeVenn | null) => {
    if (travada || !r) return;
    haptico.selecao();
    onMudar({ tipo: 'venn', regiao: r });
  };
  const preenchimento = (id: RegiaoDeVenn) => {
    if (id !== regiao) return 'transparent';
    if (tom === 'certo') return cor.acertoFundo;
    if (tom === 'errado') return cor.atencaoFundo;
    return cor.selecionadaFundo;
  };
  return (
    <View style={estilos.venn}>
      {/* O toque vale pela posição: a região sai da geometria dos dois círculos. */}
      <Pressable
        ref={desenho}
        accessible={false}
        disabled={travada}
        onPress={(e) => {
          // A posição na tela, menos a do desenho: funciona igual no celular e no navegador.
          const { pageX, pageY } = e.nativeEvent;
          desenho.current?.measureInWindow((x: number, y: number, largura: number) => {
            if (!largura) return;
            const escala = 300 / largura;
            escolher(regiaoDoPonto((pageX - x) * escala, (pageY - y) * escala));
          });
        }}
        style={{ width: '100%', aspectRatio: 300 / 190 }}>
        <Svg viewBox="0 0 300 190" width="100%" height="100%" pointerEvents="none">
          {REGIOES.map((r) => (
            <Path key={r.id} d={r.d} fill={preenchimento(r.id)} />
          ))}
          <Circle cx={115} cy={95} r={70} fill="none" stroke={cor.mareClaro} strokeWidth={2.5} />
          <Circle cx={185} cy={95} r={70} fill="none" stroke={cor.luz} strokeWidth={2.5} />
          <TextoSvg x={62} y={20} fill={cor.texto} fontSize={14} fontWeight="600">
            {a}
          </TextoSvg>
          <TextoSvg x={200} y={20} fill={cor.texto} fontSize={14} fontWeight="600">
            {b}
          </TextoSvg>
        </Svg>
      </Pressable>
      {/* As mesmas três regiões em botões: para leitor de tela e para quem prefere tocar no nome. */}
      <View style={estilos.vennNomes} accessibilityRole="radiogroup" accessibilityLabel="Regiões do diagrama">
        {(['soA', 'ambos', 'soB'] as const).map((r) => (
          <Pressable
            key={r}
            accessibilityRole="radio"
            accessibilityState={{ checked: regiao === r, disabled: travada }}
            disabled={travada}
            onPress={() => escolher(r)}
            style={[estilos.vennNome, regiao === r ? estilos.vennNomeAtivo : null]}>
            <Text style={[estilos.vennNomeTexto, regiao === r ? { color: cor.texto } : null]}>{nome[r]}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ---------- Grade de associação ----------

export function Associacao({ questao: q, resposta, tom, travada, onMudar }: PropsDaQuestao<QuestaoDeAssociacao>) {
  const marcas: MarcaDeAssociacao[][] =
    resposta.tipo === 'associacao' ? resposta.marcas : q.linhas.map(() => q.colunas.map(() => null));
  const tocar = (l: number, c: number) => {
    haptico.selecao();
    const novas = marcas.map((linha) => [...linha]);
    novas[l][c] = proximaMarca(novas[l][c]);
    onMudar({ tipo: 'associacao', marcas: novas });
  };
  return (
    <View style={estilos.coluna}>
      <Quadro titulo="Pistas">
        {q.pistas.map((p, i) => (
          <Text key={i} style={estilos.pista}>{`${i + 1}. ${p}`}</Text>
        ))}
      </Quadro>
      <View style={estilos.grade}>
        <View style={estilos.gradeLinha}>
          <View style={estilos.gradeNome} />
          {q.colunas.map((c) => (
            <Text key={c} style={estilos.gradeCabeca} numberOfLines={1}>
              {c}
            </Text>
          ))}
        </View>
        {q.linhas.map((nome, l) => (
          <View key={nome} style={estilos.gradeLinha}>
            <Text style={estilos.gradeNome}>{nome}</Text>
            {q.colunas.map((coluna, c) => {
              const m = marcas[l][c];
              const conferida = tom !== 'neutro' && m === 'sim' ? corDaConferencia(q.correta[l] === c) : null;
              return (
                <Pressable
                  key={coluna}
                  accessibilityRole="button"
                  accessibilityLabel={`${nome} e ${coluna}: ${m === 'sim' ? 'sim' : m === 'nao' ? 'não' : 'vazio'}`}
                  disabled={travada}
                  onPress={() => tocar(l, c)}
                  style={[
                    estilos.gradeCasa,
                    m === 'sim' ? estilos.gradeSim : null,
                    conferida ? { backgroundColor: conferida.fundo, borderColor: conferida.borda } : null,
                  ]}>
                  <Text
                    style={[
                      estilos.gradeMarca,
                      m === 'nao' ? { color: cor.atencao } : null,
                      conferida ? { color: conferida.texto } : null,
                    ]}>
                    {m === 'sim' ? '✓' : m === 'nao' ? '✗' : ''}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  coluna: { gap: 12 },
  parametros: { flexDirection: 'row', gap: 10 },
  parametro: {
    flex: 1,
    backgroundColor: cor.superficie,
    borderRadius: raio.md,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  parametroNome: { fontFamily: fonte.texto, fontSize: tamanho.xs, color: cor.textoSuave },
  controle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
  parametroValor: {
    fontFamily: fonte.titulo,
    fontSize: tamanho.xxl - 4,
    color: cor.texto,
    fontVariant: ['tabular-nums'],
  },
  redondo: {
    width: 44,
    height: 44,
    borderRadius: raio.circulo,
    borderWidth: 2,
    borderColor: cor.linhaForte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redondoTexto: { fontFamily: fonte.titulo, fontSize: tamanho.lg, color: cor.texto },
  formula: { alignItems: 'center' },
  conta: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave, textAlign: 'center' },
  total: { fontFamily: fonte.titulo, fontSize: tamanho.xl + 2, color: cor.texto },
  tabela: { gap: 6 },
  tabelaLinha: { flexDirection: 'row', gap: 6 },
  tabelaCabeca: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonte.textoSemi,
    fontSize: tamanho.sm,
    color: cor.textoSuave,
  },
  casaFixa: {
    flex: 1,
    height: alvoMinimo - 4,
    borderRadius: raio.sm,
    backgroundColor: cor.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  casaFixaTexto: { fontFamily: fonte.textoSemi, fontSize: tamanho.md, color: cor.textoSuave },
  casa: {
    flex: 1,
    height: alvoMinimo - 4,
    borderRadius: raio.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: cor.linhaForte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  casaPreenchida: { borderStyle: 'solid', borderColor: cor.mare, backgroundColor: cor.selecionadaFundo },
  casaTexto: { fontFamily: fonte.titulo, fontSize: tamanho.md, color: cor.texto },
  venn: { gap: 10, alignItems: 'center' },
  vennNomes: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  vennNome: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: raio.circulo,
    borderWidth: 1,
    borderColor: cor.linhaForte,
    justifyContent: 'center',
  },
  vennNomeAtivo: { backgroundColor: cor.selecionadaFundo, borderColor: cor.mare },
  vennNomeTexto: { fontFamily: fonte.textoSemi, fontSize: tamanho.sm, color: cor.textoSuave },
  pista: { fontFamily: fonte.texto, fontSize: tamanho.sm, lineHeight: 20, color: cor.texto },
  grade: { gap: 6 },
  gradeLinha: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  gradeNome: { width: 52, fontFamily: fonte.textoSemi, fontSize: tamanho.sm, color: cor.texto },
  gradeCabeca: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonte.textoSemi,
    fontSize: tamanho.xs,
    color: cor.textoSuave,
  },
  gradeCasa: {
    flex: 1,
    height: alvoMinimo - 4,
    borderRadius: raio.sm,
    borderWidth: 2,
    borderColor: cor.linha,
    backgroundColor: cor.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeSim: { borderColor: cor.mare, backgroundColor: cor.selecionadaFundo },
  gradeMarca: { fontFamily: fonte.titulo, fontSize: tamanho.lg, color: cor.texto },
});
