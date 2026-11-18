import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraProgresso } from '@/componentes/BarraProgresso';
import { Botao } from '@/componentes/Botao';
import { CelebracaoDeSequencia } from '@/componentes/CelebracaoDeSequencia';
import { Chip } from '@/componentes/Chip';
import { FolhaFeedback } from '@/componentes/FolhaFeedback';
import { Opcao, type EstadoOpcao } from '@/componentes/Opcao';
import { SequenciaDeAcertos } from '@/componentes/SequenciaDeAcertos';
import { useProgresso } from '@/estado/progresso';
import { indiceDoFarol, moduloAtual } from '@/licao/dados';
import { montarBoasVindas, montarFarol, montarLicao } from '@/licao/montar';
import { rotuloTipo } from '@/licao/tipos';
import { useLicao } from '@/licao/useLicao';
import { haptico } from '@/servicos/haptico';
import { alvoMinimo, cor, fonte, limites, raio, tamanho } from '@/tema/tokens';

export default function Licao() {
  const { modo } = useLocalSearchParams<{ modo?: string }>();
  const boasVindas = modo === 'boas-vindas';
  const { concluir, concluidas, modoDeErro, celebracaoDeSequencia } = useProgresso();
  // Fixados na abertura: `concluidas` muda ao concluir, antes de a tela sair.
  const [farol] = useState(() => !boasVindas && concluidas === indiceDoFarol);
  const [questoes] = useState(() => {
    if (boasVindas) return montarBoasVindas(moduloAtual);
    if (farol) return montarFarol(moduloAtual, Date.now());
    return montarLicao(moduloAtual, concluidas, Date.now());
  });
  const licao = useLicao(questoes, modoDeErro);
  const { questao: q, fase, selecionada, removidas } = licao;

  function estadoDaOpcao(i: number): EstadoOpcao {
    if (fase === 'acerto') return i === q.correta ? 'correta' : removidas.includes(i) ? 'removida' : 'normal';
    if (fase === 'erro') return i === selecionada ? 'errada' : removidas.includes(i) ? 'removida' : 'normal';
    if (fase === 'seguir') return i === q.correta ? 'correta' : i === selecionada ? 'errada' : 'removida';
    if (fase === 'guiada') return i === q.correta ? 'correta' : 'removida';
    if (removidas.includes(i)) return 'removida';
    return i === selecionada ? 'selecionada' : 'normal';
  }

  function opcaoDesabilitada(i: number): boolean {
    if (fase === 'acerto' || fase === 'erro' || fase === 'seguir') return true;
    if (fase === 'guiada') return i !== q.correta;
    return removidas.includes(i);
  }

  function continuar() {
    if (licao.proxima()) {
      concluir(farol ? limites.xpDoFarol : limites.xpDaLicao);
      router.replace({
        pathname: '/conclusao',
        params: {
          acertos: String(licao.acertosDePrimeira),
          total: String(licao.totalOriginal),
          primeira: boasVindas ? '1' : '0',
          farol: farol ? '1' : '0',
        },
      });
    }
  }

  function sair() {
    haptico.selecao();
    if (Platform.OS === 'web') {
      // Alert.alert não funciona no navegador.
      if (window.confirm('Sair da lição? Guardamos onde você parou.')) router.replace('/');
      return;
    }
    Alert.alert('Sair da lição?', 'Guardamos onde você parou.', [
      { text: 'Continuar a lição', style: 'cancel' },
      { text: 'Sair', onPress: () => router.replace('/') },
    ]);
  }

  const completar = q.tipo === 'completar';

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.topo}>
        <Pressable onPress={sair} accessibilityRole="button" accessibilityLabel="Sair da lição" style={estilos.sair}>
          <Text style={estilos.sairTexto}>✕</Text>
        </Pressable>
        <BarraProgresso valor={licao.progresso} />
        <SequenciaDeAcertos valor={licao.acertosSeguidos} />
        <Pressable
          onPress={licao.usarDica}
          accessibilityRole="button"
          accessibilityLabel={`Dica, ${licao.dicasRestantes} restantes`}
          style={estilos.dica}>
          <Text style={estilos.dicaTexto}>{`💡 ${licao.dicasRestantes}`}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={estilos.corpo} showsVerticalScrollIndicator={false}>
        <Chip
          texto={
            boasVindas
              ? 'Lição de boas-vindas'
              : (q.origem ?? `${rotuloTipo[q.tipo]}${q.modo === 'imediato' ? ' · imediato' : ''}`)
          }
          tom={boasVindas || q.origem ? 'luz' : 'mare'}
        />
        <Text style={estilos.enunciado}>{q.enunciado}</Text>

        {licao.dicaAberta ? (
          <Animated.View entering={FadeInDown} style={estilos.caixaDica}>
            <Text style={estilos.caixaDicaTexto}>{`💡 ${q.dica}`}</Text>
          </Animated.View>
        ) : null}

        <View style={completar ? estilos.fichas : estilos.opcoes}>
          {q.opcoes.map((texto, i) => (
            <Opcao
              key={`${q.id}-${i}`}
              texto={texto}
              estado={estadoDaOpcao(i)}
              desabilitado={opcaoDesabilitada(i)}
              compacta={completar}
              onPress={() => {
                haptico.selecao();
                licao.escolher(i);
              }}
            />
          ))}
        </View>

        {licao.avisoDeLimite ? (
          <Animated.View entering={FadeInDown} style={estilos.aviso}>
            <Text style={estilos.avisoTexto}>
              <Text style={{ fontFamily: fonte.textoSemi, color: cor.luz }}>Suas dicas de hoje acabaram. </Text>
              Quer mais 3? Assista a um vídeo curto ou conheça o Pro. (Simulado no protótipo.)
            </Text>
            <View style={estilos.avisoBotoes}>
              <Botao rotulo="ASSISTIR VÍDEO" sub="+3 dicas" variante="secundario" onPress={licao.ganharDicas} />
              <Botao rotulo="Agora não" variante="terciario" onPress={licao.fecharAvisoDeLimite} />
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>

      <View style={estilos.rodape}>
        {fase === 'respondendo' && q.modo === 'confirmar' ? (
          <View style={estilos.rodapeBotao}>
            <Botao rotulo="CONFIRMAR" desabilitado={selecionada === null} onPress={licao.confirmar} />
          </View>
        ) : null}
        {fase === 'respondendo' && q.modo === 'imediato' ? <Text style={estilos.toque}>Toque na resposta</Text> : null}
        {fase === 'acerto' ? (
          <FolhaFeedback
            tipo="acerto"
            titulo="Correto!"
            texto={q.explicacao}
            armadilha={q.armadilha}
            rotuloBotao="CONTINUAR"
            onPress={continuar}
          />
        ) : null}
        {fase === 'erro' ? (
          <FolhaFeedback
            tipo="erro"
            titulo="Quase."
            texto="Vamos olhar com calma. Tente de novo, e a dica continua disponível."
            rotuloBotao="TENTAR DE NOVO"
            onPress={licao.tentarDeNovo}
          />
        ) : null}
        {fase === 'seguir' ? (
          <FolhaFeedback
            tipo="erro"
            titulo="Quase."
            texto={
              q.repetida ? `${q.explicacao} Vamos seguir.` : `${q.explicacao} Essa questão volta no final da lição.`
            }
            armadilha={q.armadilha}
            rotuloBotao="CONTINUAR"
            onPress={continuar}
          />
        ) : null}
        {fase === 'guiada' ? (
          <FolhaFeedback
            tipo="guiada"
            titulo="Esta é a resposta."
            texto={`${q.explicacao} Agora é com você: toque nela para continuar.`}
            armadilha={q.armadilha}
            rotuloBotao=""
            onPress={() => {}}
            semBotao
          />
        ) : null}
      </View>

      <CelebracaoDeSequencia valor={celebracaoDeSequencia} />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 6 },
  sair: { width: alvoMinimo, height: alvoMinimo, alignItems: 'center', justifyContent: 'center' },
  sairTexto: { fontFamily: fonte.tituloMedio, fontSize: tamanho.lg, color: cor.textoSuave },
  dica: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: raio.circulo,
    borderWidth: 1,
    borderColor: cor.linha,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dicaTexto: { fontFamily: fonte.textoSemi, fontSize: tamanho.sm, color: cor.luz },
  corpo: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 14 },
  enunciado: { fontFamily: fonte.textoSemi, fontSize: tamanho.lg - 2, lineHeight: 28, color: cor.texto },
  caixaDica: {
    backgroundColor: 'rgba(255,200,87,0.12)',
    borderColor: 'rgba(255,200,87,0.4)',
    borderWidth: 1,
    borderRadius: raio.md,
    padding: 12,
  },
  caixaDicaTexto: { fontFamily: fonte.texto, fontSize: tamanho.sm, lineHeight: 21, color: cor.luz },
  opcoes: { gap: 10 },
  fichas: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  aviso: {
    backgroundColor: cor.superficie,
    borderColor: cor.luz,
    borderWidth: 1,
    borderRadius: raio.md,
    padding: 14,
    gap: 10,
  },
  avisoTexto: { fontFamily: fonte.texto, fontSize: tamanho.sm, lineHeight: 21, color: cor.texto },
  avisoBotoes: { gap: 4 },
  rodape: { justifyContent: 'flex-end' },
  rodapeBotao: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
  toque: {
    textAlign: 'center',
    fontFamily: fonte.texto,
    fontSize: tamanho.sm,
    color: cor.textoSuave,
    paddingBottom: 24,
    paddingTop: 8,
  },
});
