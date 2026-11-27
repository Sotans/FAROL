import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';

import { arredondar } from '@/licao/interativas';
import type { QuestaoDeRegua } from '@/licao/tipos';
import { haptico } from '@/servicos/haptico';
import { cor, fonte, raio, tamanho } from '@/tema/tokens';
import type { PropsDaQuestao } from './comum';

const MARCADOR = 34;

/**
 * Arrastar na régua: a pessoa leva o marcador até o valor (ou toca direto no ponto da régua).
 * O valor encaixa no passo da questão. Para leitor de tela, a régua é "ajustável" (mais e menos).
 */
export function Regua({ questao: q, resposta, tom, travada, onMudar }: PropsDaQuestao<QuestaoDeRegua>) {
  const [largura, setLargura] = useState(0);
  const valor = resposta.tipo === 'regua' ? resposta.valor : q.min;
  const fracao = (valor - q.min) / (q.max - q.min);
  const texto = `${q.prefixo ?? ''}${valor.toLocaleString('pt-BR')}${q.sufixo ?? ''}`;

  /**
   * Leva o marcador ao ponto tocado. `sempre` registra a resposta mesmo sem mudar o valor:
   * o primeiro toque conta como "mexeu", ou o Confirmar nunca acenderia quando a resposta
   * certa é justamente o ponto onde o marcador começa.
   */
  function mover(x: number, sempre = false) {
    if (travada || largura === 0) return;
    const novo = arredondar(q, q.min + (Math.min(Math.max(x, 0), largura) / largura) * (q.max - q.min));
    if (novo !== valor || sempre) {
      if (novo !== valor) haptico.selecao();
      onMudar({ tipo: 'regua', valor: novo });
    }
  }

  const arraste = usePanGesture({
    runOnJS: true,
    enabled: !travada,
    minDistance: 0,
    onBegin: (e) => mover(e.x, true),
    onUpdate: (e) => mover(e.x),
  });

  const corDoMarcador = tom === 'certo' ? cor.acerto : tom === 'errado' ? cor.atencao : cor.luz;
  // Sem repetidas: numa régua curta, duas marcas podem cair no mesmo número.
  const marcas = [...new Set([0, 0.25, 0.5, 0.75, 1].map((f) => arredondar(q, q.min + f * (q.max - q.min))))];

  return (
    <View style={estilos.raiz}>
      <Text style={[estilos.valor, { color: tom === 'neutro' ? cor.texto : corDoMarcador }]}>{texto}</Text>
      <GestureDetector gesture={arraste}>
        <View
          style={estilos.areaDeToque}
          onLayout={(e) => setLargura(e.nativeEvent.layout.width)}
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel="Régua"
          accessibilityValue={{ min: q.min, max: q.max, now: valor, text: texto }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(e) => {
            if (travada) return;
            const delta = e.nativeEvent.actionName === 'increment' ? q.passo : -q.passo;
            onMudar({ tipo: 'regua', valor: arredondar(q, valor + delta) });
          }}>
          <View style={estilos.trilho}>
            <View style={[estilos.preenchido, { width: `${fracao * 100}%`, backgroundColor: corDoMarcador }]} />
          </View>
          <View
            pointerEvents="none"
            style={[estilos.marcador, { left: fracao * largura - MARCADOR / 2, borderColor: corDoMarcador }]}
          />
        </View>
      </GestureDetector>
      <View style={estilos.marcas}>
        {marcas.map((m) => (
          <Text key={m} style={estilos.marca}>
            {m.toLocaleString('pt-BR')}
          </Text>
        ))}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { gap: 6, paddingHorizontal: 6 },
  valor: { fontFamily: fonte.titulo, fontSize: tamanho.xxl + 2, textAlign: 'center', fontVariant: ['tabular-nums'] },
  areaDeToque: { height: 56, justifyContent: 'center' },
  trilho: { height: 10, borderRadius: raio.circulo, backgroundColor: cor.linha, overflow: 'hidden' },
  preenchido: { height: '100%' },
  marcador: {
    position: 'absolute',
    top: (56 - MARCADOR) / 2,
    width: MARCADOR,
    height: MARCADOR,
    borderRadius: raio.circulo,
    borderWidth: 5,
    backgroundColor: cor.texto,
  },
  marcas: { flexDirection: 'row', justifyContent: 'space-between' },
  marca: { fontFamily: fonte.texto, fontSize: tamanho.xs, color: cor.textoSuave, fontVariant: ['tabular-nums'] },
});
