import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { RespostaInterativa } from '@/licao/interativas';
import type { QuestaoInterativa } from '@/licao/tipos';
import { haptico } from '@/servicos/haptico';
import { alvoMinimo, cor, fonte, raio, tamanho } from '@/tema/tokens';

/**
 * Peças comuns das questões interativas. As cores seguem o doc 11: seleção em maré,
 * acerto em verde, erro em coral; o âmbar fica no Confirmar e no valor que a pessoa ajusta.
 */

/** Como a resposta aparece: enquanto a pessoa responde, ou já conferida. */
export type Tom = 'neutro' | 'certo' | 'errado';

export type PropsDaQuestao<Q extends QuestaoInterativa> = {
  questao: Q;
  resposta: RespostaInterativa;
  tom: Tom;
  /** Depois de conferir, nada se mexe. */
  travada: boolean;
  onMudar: (r: RespostaInterativa) => void;
};

export type EstadoDaFicha = 'normal' | 'selecionada' | 'certa' | 'errada';

const visualDaFicha: Record<EstadoDaFicha, { fundo: string; borda: string; texto: string }> = {
  normal: { fundo: cor.superficie, borda: cor.linhaForte, texto: cor.texto },
  selecionada: { fundo: cor.selecionadaFundo, borda: cor.mare, texto: cor.texto },
  certa: { fundo: cor.acertoFundo, borda: cor.acerto, texto: cor.acerto },
  errada: { fundo: cor.atencaoFundo, borda: cor.atencao, texto: cor.atencao },
};

/** A peça que se arrasta ou se toca (números, blocos de frase, itens a classificar). */
export function Ficha({
  texto,
  estado = 'normal',
  pequena = false,
}: {
  texto: string;
  estado?: EstadoDaFicha;
  pequena?: boolean;
}) {
  const v = visualDaFicha[estado];
  return (
    <View
      style={[
        estilos.ficha,
        pequena ? estilos.fichaPequena : null,
        { backgroundColor: v.fundo, borderColor: v.borda },
      ]}>
      <Text style={[estilos.fichaTexto, pequena ? estilos.fichaTextoPequeno : null, { color: v.texto }]}>{texto}</Text>
    </View>
  );
}

/** O estado da ficha a partir do tom da questão: conferida, ela fica verde ou coral. */
export function estadoPeloTom(tom: Tom, selecionada = false): EstadoDaFicha {
  if (tom === 'certo') return 'certa';
  if (tom === 'errado') return 'errada';
  return selecionada ? 'selecionada' : 'normal';
}

/** Duas opções lado a lado, como "Direta / Inversa" ou "Certo / Errado". */
export function Alternador<T extends string>({
  opcoes,
  valor,
  onEscolher,
  travado,
  rotulo,
  tom = 'neutro',
}: {
  opcoes: { valor: T; texto: string }[];
  valor: T | null;
  onEscolher: (v: T) => void;
  travado: boolean;
  rotulo: string;
  tom?: Tom;
}) {
  return (
    <View style={estilos.alternador} accessibilityRole="radiogroup" accessibilityLabel={rotulo}>
      {opcoes.map((o) => {
        const ativo = o.valor === valor;
        const corAtiva = tom === 'certo' ? cor.acerto : tom === 'errado' ? cor.atencao : cor.mare;
        return (
          <Pressable
            key={o.valor}
            accessibilityRole="radio"
            accessibilityState={{ checked: ativo, disabled: travado }}
            disabled={travado}
            onPress={() => {
              haptico.selecao();
              onEscolher(o.valor);
            }}
            style={[
              estilos.alternadorBotao,
              ativo ? { backgroundColor: cor.selecionadaFundo, borderColor: corAtiva } : null,
            ]}>
            <Text style={[estilos.alternadorTexto, ativo ? { color: cor.texto } : null]}>{o.texto}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Um quadro de apoio: o caso, o texto da lei, as pistas. */
export function Quadro({
  children,
  titulo,
  style,
}: {
  children: ReactNode;
  titulo?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[estilos.quadro, style]}>
      {titulo ? <Text style={estilos.quadroTitulo}>{titulo}</Text> : null}
      {children}
    </View>
  );
}

export const estilos = StyleSheet.create({
  ficha: {
    minHeight: alvoMinimo,
    minWidth: alvoMinimo,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: raio.md,
    borderWidth: 2,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fichaPequena: { minHeight: 40, paddingHorizontal: 10, paddingVertical: 6 },
  fichaTexto: { fontFamily: fonte.textoSemi, fontSize: tamanho.md, textAlign: 'center' },
  fichaTextoPequeno: { fontSize: tamanho.sm },
  alternador: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: raio.md, backgroundColor: cor.superficie },
  alternadorBotao: {
    flex: 1,
    minHeight: 44,
    borderRadius: raio.sm + 2,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alternadorTexto: { fontFamily: fonte.textoSemi, fontSize: tamanho.md, color: cor.textoSuave },
  quadro: { backgroundColor: cor.superficie, borderRadius: raio.md, padding: 14, gap: 6 },
  quadroTitulo: { fontFamily: fonte.textoSemi, fontSize: tamanho.xs, color: cor.mareClaro },
  banco: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', minHeight: 56, padding: 6 },
  legenda: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave, textAlign: 'center' },
});
