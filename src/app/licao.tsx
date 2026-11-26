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
import { Exercicio, type Situacao } from '@/componentes/Exercicio';
import type { EstadoOpcao } from '@/componentes/Opcao';
import { useProgresso } from '@/estado/progresso';
import { quebrarEnunciado } from '@/licao/enunciado';
import { trilhaDePortugues } from '@/conteudo/trilha';
import { montarBoasVindas, montarFarol, montarLicao, montarRevisaoRapida } from '@/licao/montar';
import { ehDeEscolha, rotuloTipo } from '@/licao/tipos';
import { useLicao } from '@/licao/useLicao';
import { vencidas } from '@/revisao/agenda';
import { haptico } from '@/servicos/haptico';
import { IconeFechar, IconeLanterna } from '@/icones';
import { alvoMinimo, cor, fonte, limites, raio, tamanho } from '@/tema/tokens';

export default function Licao() {
  const { modo } = useLocalSearchParams<{ modo?: string }>();
  const boasVindas = modo === 'boas-vindas';
  const revisaoRapida = modo === 'revisao';
  const {
    modulo,
    indiceDoFarol,
    concluir,
    concluirRevisao,
    registrarRevisoes,
    concluidas,
    revisoes,
    modoDeErro,
    celebracaoDeSequencia,
  } = useProgresso();
  // Fixados na abertura: `concluidas` muda ao concluir, antes de a tela sair.
  const [farol] = useState(() => !boasVindas && !revisaoRapida && concluidas === indiceDoFarol);
  const [questoes] = useState(() => {
    const agora = new Date();
    if (boasVindas) return montarBoasVindas(modulo);
    if (revisaoRapida) return montarRevisaoRapida(trilhaDePortugues, vencidas(revisoes, agora));
    if (farol) return montarFarol(modulo, agora.getTime());
    return montarLicao(modulo, concluidas, agora.getTime(), vencidas(revisoes, agora));
  });
  const licao = useLicao(questoes, modoDeErro);
  const { questao: q, fase, selecionada, removidas } = licao;
  const deEscolha = ehDeEscolha(q);
  const correta = deEscolha ? q.correta : -1;
  const situacao: Situacao =
    fase === 'guiada' || fase === 'seguir' ? 'revelada' : fase === 'acerto' || fase === 'erro' ? fase : 'respondendo';
  // Ordenar sempre confirma: a sequência só faz sentido completa.
  const pedeConfirmacao = q.tipo === 'ordenar' || (deEscolha && q.modo === 'confirmar');
  const podeConfirmar = q.tipo === 'ordenar' ? licao.ordem.length === q.itens.length : selecionada !== null;

  function estadoDaOpcao(i: number): EstadoOpcao {
    if (fase === 'acerto') return i === correta ? 'correta' : removidas.includes(i) ? 'removida' : 'normal';
    if (fase === 'erro') return i === selecionada ? 'errada' : removidas.includes(i) ? 'removida' : 'normal';
    if (fase === 'seguir') return i === correta ? 'correta' : i === selecionada ? 'errada' : 'removida';
    if (fase === 'guiada') return i === correta ? 'correta' : 'removida';
    if (removidas.includes(i)) return 'removida';
    return i === selecionada ? 'selecionada' : 'normal';
  }

  function opcaoDesabilitada(i: number): boolean {
    if (fase === 'acerto' || fase === 'erro' || fase === 'seguir') return true;
    if (fase === 'guiada') return i !== correta;
    return removidas.includes(i);
  }

  function continuar() {
    if (licao.proxima()) {
      registrarRevisoes(licao.notas);
      if (revisaoRapida) concluirRevisao(limites.xpDaRevisao);
      else concluir(farol ? limites.xpDoFarol : limites.xpDaLicao);
      router.replace({
        pathname: '/conclusao',
        params: {
          acertos: String(licao.acertosDePrimeira),
          total: String(licao.totalOriginal),
          primeira: boasVindas ? '1' : '0',
          farol: farol ? '1' : '0',
          revisao: revisaoRapida ? '1' : '0',
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

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.topo}>
        <Pressable onPress={sair} accessibilityRole="button" accessibilityLabel="Sair da lição" style={estilos.sair}>
          <IconeFechar tamanho={26} />
        </Pressable>
        <BarraProgresso valor={licao.progresso} />
        <Pressable
          onPress={licao.usarDica}
          accessibilityRole="button"
          accessibilityLabel={`Dica, ${licao.dicasRestantes} restantes`}
          style={estilos.dica}>
          <IconeLanterna tamanho={20} acesa={licao.dicasRestantes > 0} />
          <Text style={estilos.dicaTexto}>{licao.dicasRestantes}</Text>
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
        <Text style={estilos.enunciado}>{quebrarEnunciado(q.enunciado)}</Text>

        {licao.dicaAberta ? (
          <Animated.View entering={FadeInDown} style={estilos.caixaDica}>
            <IconeLanterna tamanho={20} />
            <Text style={estilos.caixaDicaTexto}>{q.dica}</Text>
          </Animated.View>
        ) : null}

        {/* Em telas altas, as respostas descem para a zona do polegar; o enunciado fica no topo. */}
        <View style={estilos.empurra} />
        <Exercicio
          key={q.id}
          questao={q}
          situacao={situacao}
          estadoDaOpcao={estadoDaOpcao}
          opcaoDesabilitada={opcaoDesabilitada}
          onEscolher={(i) => {
            haptico.selecao();
            licao.escolher(i);
          }}
          ordem={licao.ordem}
          onAdicionar={licao.adicionarAOrdem}
          onRemover={licao.removerDaOrdem}
          onErrarPar={licao.errarPar}
          onConcluirPares={licao.concluirPares}
        />

        {licao.avisoDeLimite ? (
          <Animated.View entering={FadeInDown} style={estilos.aviso}>
            <Text style={estilos.avisoTexto}>
              <Text style={{ fontFamily: fonte.textoSemi, color: cor.luz }}>Suas dicas de hoje acabaram. </Text>
              Quer mais 3? Assista a um vídeo curto ou conheça o Pro. (Simulado no protótipo.)
            </Text>
            <View style={estilos.avisoBotoes}>
              <Botao rotulo="Assistir vídeo" sub="+3 dicas" variante="secundario" onPress={licao.ganharDicas} />
              <Botao rotulo="Agora não" variante="terciario" onPress={licao.fecharAvisoDeLimite} />
            </View>
          </Animated.View>
        ) : null}
      </ScrollView>

      <View style={estilos.rodape}>
        {fase === 'respondendo' && pedeConfirmacao ? (
          <View style={estilos.rodapeBotao}>
            <Botao rotulo="Confirmar" desabilitado={!podeConfirmar} onPress={licao.confirmar} />
          </View>
        ) : null}
        {/* Sem "Toque na resposta": as opções já dizem o que fazer. O gesto de ligar pares é o único que precisa de instrução. */}
        {fase === 'respondendo' && q.tipo === 'ligarPares' ? (
          <Text style={estilos.toque}>Ligue cada item ao seu par</Text>
        ) : null}
        {fase === 'acerto' ? (
          <FolhaFeedback
            tipo="acerto"
            titulo="Correto!"
            texto={q.explicacao}
            armadilha={q.armadilha}
            rotuloBotao="Continuar"
            onPress={continuar}
          />
        ) : null}
        {fase === 'erro' ? (
          <FolhaFeedback
            tipo="erro"
            titulo="Quase."
            texto="Vamos olhar com calma. Tente de novo, e a dica continua disponível."
            rotuloBotao="Tentar de novo"
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
            rotuloBotao="Continuar"
            onPress={continuar}
          />
        ) : null}
        {fase === 'guiada' && !deEscolha ? (
          <FolhaFeedback
            tipo="guiada"
            titulo="Esta é a resposta."
            texto={q.explicacao}
            armadilha={q.armadilha}
            rotuloBotao="Entendi"
            onPress={licao.aceitarGuiada}
          />
        ) : null}
        {fase === 'guiada' && deEscolha ? (
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
  dica: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: raio.circulo,
    borderWidth: 1,
    borderColor: cor.linha,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dicaTexto: { fontFamily: fonte.textoSemi, fontSize: tamanho.sm, color: cor.luz },
  corpo: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 14 },
  empurra: { flexGrow: 1, minHeight: 0 },
  enunciado: { fontFamily: fonte.textoSemi, fontSize: tamanho.lg - 2, lineHeight: 28, color: cor.texto },
  caixaDica: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: cor.luzVeu,
    borderColor: cor.luzContorno,
    borderWidth: 1,
    borderRadius: raio.md,
    padding: 12,
  },
  caixaDicaTexto: { flex: 1, fontFamily: fonte.texto, fontSize: tamanho.sm, lineHeight: 21, color: cor.luz },
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
