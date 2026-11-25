import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraProgresso } from '@/componentes/BarraProgresso';
import { Botao } from '@/componentes/Botao';
import { Chip } from '@/componentes/Chip';
import { FolhaFeedback } from '@/componentes/FolhaFeedback';
import { Opcao, type EstadoOpcao } from '@/componentes/Opcao';
import { calcularMapa, questoesDoDiagnostico, type RespostaDoDiagnostico } from '@/diagnostico/dados';
import { useProgresso } from '@/estado/progresso';
import { haptico } from '@/servicos/haptico';
import { tocar, tocarAcerto } from '@/servicos/som';
import { IconeFechar } from '@/icones';
import { alvoMinimo, cor, fonte, tamanho } from '@/tema/tokens';

type Resultado = 'acertou' | 'naoAcertou' | 'naoVi';

/**
 * T6. O "mapa do ponto de partida". Regras (jornada, etapa 3):
 * nunca parece prova: sem nota, sem a palavra "errou", com "Ainda não vi isso" sem penalidade
 * e saída clara a qualquer momento. Cada resposta recebe uma pequena conclusão
 * (feedback do fundador em 2026-11-16: sem resposta, parecia uma avaliação).
 */
export default function Diagnostico() {
  const { definirMapa } = useProgresso();
  const [indice, setIndice] = useState(0);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [respostas, setRespostas] = useState<RespostaDoDiagnostico[]>([]);

  const q = questoesDoDiagnostico[indice];
  const total = questoesDoDiagnostico.length;
  const completar = q.tipo === 'completar';
  const respondendo = resultado === null;

  function responder(escolhida: number | null) {
    setRespostas((r) => [...r, { id: q.id, escolhida }]);
    if (escolhida === null) {
      haptico.leve();
      tocar('toque');
      setResultado('naoVi');
    } else if (escolhida === q.correta) {
      haptico.sucesso();
      tocarAcerto(1);
      setResultado('acertou');
    } else {
      // Mais suave que o erro da lição: aqui não há erro, só um ponto de partida. Sem som de erro.
      haptico.leve();
      tocar('toque');
      setResultado('naoAcertou');
    }
  }

  function continuar() {
    if (indice + 1 >= total) {
      definirMapa(calcularMapa(respostas));
      router.replace('/mapa');
      return;
    }
    setIndice(indice + 1);
    setSelecionada(null);
    setResultado(null);
  }

  function estadoDaOpcao(i: number): EstadoOpcao {
    if (respondendo) return i === selecionada ? 'selecionada' : 'normal';
    if (i === q.correta) return 'correta';
    return i === selecionada ? 'selecionada' : 'removida';
  }

  const folha = {
    acertou: { titulo: 'Boa.', texto: 'Esse você já sabe.' },
    naoAcertou: { titulo: 'Anotado.', texto: 'Esse assunto entra na sua trilha. A resposta está iluminada acima.' },
    naoVi: { titulo: 'Tudo bem.', texto: 'Vamos ver isso na trilha, com calma.' },
  };

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.topo}>
        <Pressable
          onPress={() => {
            haptico.selecao();
            router.replace('/');
          }}
          accessibilityRole="button"
          accessibilityLabel="Fazer o mapa mais tarde"
          style={estilos.sair}>
          <IconeFechar tamanho={26} />
        </Pressable>
        <BarraProgresso valor={(indice + (respondendo ? 0 : 1)) / total} />
      </View>

      <ScrollView contentContainerStyle={estilos.corpo} showsVerticalScrollIndicator={false}>
        <Chip texto={`Mapa · pergunta ${indice + 1} de ${total}`} tom="luz" />
        <Text style={estilos.enunciado}>{q.enunciado}</Text>
        <View style={completar ? estilos.fichas : estilos.opcoes}>
          {q.opcoes.map((texto, i) => (
            <Opcao
              key={`${q.id}-${i}`}
              texto={texto}
              estado={estadoDaOpcao(i)}
              desabilitado={!respondendo}
              compacta={completar}
              onPress={() => {
                haptico.selecao();
                setSelecionada(i);
              }}
            />
          ))}
        </View>
        {respondendo ? <Botao rotulo="Ainda não vi isso" variante="terciario" onPress={() => responder(null)} /> : null}
      </ScrollView>

      <View style={estilos.rodapeFixo}>
        {respondendo ? (
          <View style={estilos.rodape}>
            <Botao rotulo="Confirmar" desabilitado={selecionada === null} onPress={() => responder(selecionada)} />
          </View>
        ) : (
          <FolhaFeedback
            tipo={resultado === 'acertou' ? 'acerto' : 'neutro'}
            titulo={folha[resultado].titulo}
            texto={folha[resultado].texto}
            rotuloBotao={indice + 1 >= total ? 'Ver meu mapa' : 'Continuar'}
            onPress={continuar}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 6,
    paddingRight: 24,
  },
  sair: { width: alvoMinimo, height: alvoMinimo, alignItems: 'center', justifyContent: 'center' },
  corpo: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 14 },
  enunciado: { fontFamily: fonte.textoSemi, fontSize: tamanho.lg - 2, lineHeight: 28, color: cor.texto },
  opcoes: { gap: 10 },
  fichas: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  rodapeFixo: { justifyContent: 'flex-end' },
  rodape: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
});
