import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { QuestaoDeCorrigir } from '@/licao/tipos';
import { haptico } from '@/servicos/haptico';
import { cor, fonte, raio, tamanho } from '@/tema/tokens';
import { Opcao } from '../Opcao';
import { Alternador, Quadro, type PropsDaQuestao } from './comum';

/**
 * Certo, errado e corrige: no estilo Cebraspe, com um passo a mais. Quem marca "errado" toca
 * no trecho que está errado e escolhe a correção. Acertar no chute não basta.
 */
export function Corrigir({ questao: q, resposta, tom, travada, onMudar }: PropsDaQuestao<QuestaoDeCorrigir>) {
  const r =
    resposta.tipo === 'certoErradoCorrige'
      ? resposta
      : { tipo: 'certoErradoCorrige' as const, julgamento: null, trecho: null, correcao: null };
  const errado = r.julgamento === 'errado';

  const estiloDoTrecho = (i: number) => {
    if (r.trecho !== i) return null;
    if (tom === 'certo') return estilos.trechoCerto;
    if (tom === 'errado') return estilos.trechoErrado;
    return estilos.trechoSelecionado;
  };

  return (
    <View style={estilos.coluna}>
      <Quadro titulo={q.fonte}>
        <View style={estilos.frase}>
          {q.trechos.map((t, i) => (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={`Trecho: ${t}`}
              accessibilityState={{ selected: r.trecho === i, disabled: travada || !errado }}
              disabled={travada || !errado}
              onPress={() => {
                haptico.selecao();
                onMudar({ ...r, trecho: i });
              }}
              style={[estilos.trecho, errado ? estilos.trechoTocavel : null, estiloDoTrecho(i)]}>
              <Text style={estilos.trechoTexto}>{t}</Text>
            </Pressable>
          ))}
        </View>
      </Quadro>
      <Alternador
        rotulo="Certo ou errado"
        opcoes={[
          { valor: 'certo', texto: 'Certo' },
          { valor: 'errado', texto: 'Errado' },
        ]}
        valor={r.julgamento}
        travado={travada}
        tom={tom}
        onEscolher={(julgamento) =>
          onMudar(julgamento === 'certo' ? { ...r, julgamento, trecho: null, correcao: null } : { ...r, julgamento })
        }
      />
      {errado ? (
        <View style={estilos.coluna}>
          <Text style={estilos.passo}>
            {r.trecho === null ? 'Toque no trecho errado.' : 'Agora escolha a correção:'}
          </Text>
          {r.trecho !== null
            ? q.correcoes.map((c, i) => (
                <Opcao
                  key={i}
                  texto={c}
                  estado={
                    r.correcao !== i
                      ? 'normal'
                      : tom === 'certo'
                        ? 'correta'
                        : tom === 'errado'
                          ? 'errada'
                          : 'selecionada'
                  }
                  desabilitado={travada}
                  onPress={() => {
                    haptico.selecao();
                    onMudar({ ...r, correcao: i });
                  }}
                />
              ))
            : null}
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  coluna: { gap: 10 },
  frase: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  // maxWidth: um trecho longo quebra a linha dentro do quadro, em vez de passar da borda.
  trecho: {
    maxWidth: '100%',
    borderRadius: raio.sm,
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  trechoTocavel: { borderBottomColor: cor.linhaForte },
  trechoSelecionado: { backgroundColor: cor.selecionadaFundo, borderBottomColor: cor.mare },
  trechoCerto: { backgroundColor: cor.acertoFundo, borderBottomColor: cor.acerto },
  trechoErrado: { backgroundColor: cor.atencaoFundo, borderBottomColor: cor.atencao },
  trechoTexto: { fontFamily: fonte.texto, fontSize: tamanho.md, lineHeight: 24, color: cor.texto },
  passo: { fontFamily: fonte.textoSemi, fontSize: tamanho.sm, color: cor.mareClaro },
});
