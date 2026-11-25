import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraProgresso } from '@/componentes/BarraProgresso';
import { Botao } from '@/componentes/Botao';
import { CelebracaoDeSequencia } from '@/componentes/CelebracaoDeSequencia';
import { Chip } from '@/componentes/Chip';
import { Farol } from '@/componentes/Farol';
import { FolhaFeedback } from '@/componentes/FolhaFeedback';
import { Luzes } from '@/componentes/Luzes';
import { Exercicio, type Situacao } from '@/componentes/Exercicio';
import type { EstadoOpcao } from '@/componentes/Opcao';
import { SequenciaDeAcertos } from '@/componentes/SequenciaDeAcertos';
import { useDesafio } from '@/desafio/useDesafio';
import { useProgresso } from '@/estado/progresso';
import { moduloAtual, nomeDoModulo } from '@/licao/dados';
import { montarDesafio } from '@/licao/montar';
import { ehDeEscolha, rotuloTipo } from '@/licao/tipos';
import { haptico } from '@/servicos/haptico';
import { IconeFaisca, IconeFechar } from '@/icones';
import { alvoMinimo, cor, fonte, limites, tamanho } from '@/tema/tokens';

/** T11f. O desafio "Pular pra cá?": 5 luzes, e passar marca as partes puladas como dominadas. */
export default function Desafio() {
  const { ate } = useLocalSearchParams<{ ate?: string }>();
  const alvo = Number(ate ?? 0);
  const { concluidas, dominarAte, registrarRevisoes, celebracaoDeSequencia } = useProgresso();
  // O conteúdo das partes que serão puladas.
  const [questoes] = useState(() => montarDesafio(moduloAtual, concluidas, alvo, Date.now()));
  const desafio = useDesafio(questoes);
  const { questao: q, fase, selecionada } = desafio;

  const primeiraPulada = concluidas + 1;
  const ultimaPulada = alvo;
  const descricaoDasPartes =
    primeiraPulada === ultimaPulada ? `a Parte ${primeiraPulada}` : `as Partes ${primeiraPulada} a ${ultimaPulada}`;

  const deEscolha = ehDeEscolha(q);
  const correta = deEscolha ? q.correta : -1;
  // No desafio não há nova tentativa: depois de um erro, a solução aparece.
  const situacao: Situacao = fase === 'acerto' ? 'acerto' : fase === 'respondendo' ? 'respondendo' : 'revelada';
  const pedeConfirmacao = q.tipo === 'ordenar' || (deEscolha && q.modo === 'confirmar');
  const podeConfirmar = q.tipo === 'ordenar' ? desafio.ordem.length === q.itens.length : selecionada !== null;

  function estadoDaOpcao(i: number): EstadoOpcao {
    if (fase === 'acerto') return i === correta ? 'correta' : 'normal';
    if (fase === 'erro' || fase === 'apagou')
      return i === correta ? 'correta' : i === selecionada ? 'errada' : 'removida';
    return i === selecionada ? 'selecionada' : 'normal';
  }

  function vencer() {
    registrarRevisoes(desafio.notas);
    dominarAte(alvo);
    router.replace('/');
  }

  if (fase === 'venceu') {
    return (
      <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
        <View style={estilos.centro}>
          <Farol />
          <Text style={estilos.titulo}>Dominado!</Text>
          <Text
            style={
              estilos.detalhe
            }>{`Você acertou ${desafio.acertos} de ${desafio.total}. Em ${nomeDoModulo}, ${descricaoDasPartes} ${primeiraPulada === ultimaPulada ? 'fica marcada' : 'ficam marcadas'} como dominada${primeiraPulada === ultimaPulada ? '' : 's'}.`}</Text>
          <View style={estilos.linhaXp}>
            <IconeFaisca tamanho={30} />
            <Text style={estilos.xp}>{`+${limites.xpDoDesafio} XP`}</Text>
          </View>
          <Text style={estilos.detalhe}>
            Vamos te perguntar sobre isso de novo daqui a alguns dias, só para garantir.
          </Text>
        </View>
        <View style={estilos.rodape}>
          <Botao rotulo="Seguir na trilha" onPress={vencer} />
        </View>
      </SafeAreaView>
    );
  }

  if (fase === 'apagou') {
    return (
      <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
        <View style={estilos.centro}>
          <Luzes acesas={0} />
          <Text style={[estilos.titulo, { marginTop: 18 }]}>As luzes se apagaram.</Text>
          <Text style={estilos.detalhe}>
            Sem pressão: a lição continua te esperando, e você pode tentar de novo quando quiser.
          </Text>
        </View>
        <View style={estilos.rodape}>
          <Botao
            rotulo="Fazer as lições"
            onPress={() => {
              registrarRevisoes(desafio.notas);
              router.replace('/');
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.topo}>
        <Pressable
          onPress={() => {
            haptico.selecao();
            router.replace('/');
          }}
          accessibilityRole="button"
          accessibilityLabel="Sair do desafio"
          style={estilos.sair}>
          <IconeFechar tamanho={26} />
        </Pressable>
        <BarraProgresso valor={desafio.progresso} />
        <SequenciaDeAcertos valor={desafio.acertosSeguidos} />
      </View>

      <View style={estilos.luzes}>
        <Luzes acesas={desafio.luzes} />
      </View>

      <ScrollView contentContainerStyle={estilos.corpo} showsVerticalScrollIndicator={false}>
        <Chip texto={`Desafio · questão ${desafio.indice + 1} de ${desafio.total} · ${rotuloTipo[q.tipo]}`} tom="luz" />
        <Text style={estilos.enunciado}>{q.enunciado}</Text>
        {/* Em telas altas, as respostas descem para a zona do polegar; o enunciado fica no topo. */}
        <View style={estilos.empurra} />
        <Exercicio
          key={q.id}
          questao={q}
          situacao={situacao}
          estadoDaOpcao={estadoDaOpcao}
          opcaoDesabilitada={() => fase !== 'respondendo'}
          onEscolher={(i) => {
            haptico.selecao();
            desafio.escolher(i);
          }}
          ordem={desafio.ordem}
          onAdicionar={desafio.adicionarAOrdem}
          onRemover={desafio.removerDaOrdem}
          onErrarPar={desafio.errarPar}
          onConcluirPares={desafio.concluirPares}
        />
      </ScrollView>

      <View style={estilos.rodapeFixo}>
        {fase === 'respondendo' && pedeConfirmacao ? (
          <View style={estilos.rodape}>
            <Botao rotulo="Confirmar" desabilitado={!podeConfirmar} onPress={desafio.confirmar} />
          </View>
        ) : null}
        {fase === 'respondendo' && !pedeConfirmacao ? (
          <Text style={estilos.toque}>
            {q.tipo === 'ligarPares' ? 'Ligue cada item ao seu par' : 'Toque na resposta'}
          </Text>
        ) : null}
        {fase === 'acerto' ? (
          <FolhaFeedback
            tipo="acerto"
            titulo="Correto!"
            texto={q.explicacao}
            rotuloBotao="Continuar"
            onPress={desafio.proxima}
          />
        ) : null}
        {fase === 'erro' ? (
          <Animated.View entering={FadeInDown.duration(220)}>
            <FolhaFeedback
              tipo="erro"
              titulo="Uma luz se apagou."
              texto={`${q.explicacao} Ainda restam ${desafio.luzes}.`}
              rotuloBotao="Continuar"
              onPress={desafio.proxima}
            />
          </Animated.View>
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
  luzes: { paddingVertical: 6 },
  corpo: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, gap: 14 },
  empurra: { flexGrow: 1, minHeight: 0 },
  enunciado: { fontFamily: fonte.textoSemi, fontSize: tamanho.lg - 2, lineHeight: 28, color: cor.texto },
  rodapeFixo: { justifyContent: 'flex-end' },
  rodape: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8 },
  toque: {
    textAlign: 'center',
    fontFamily: fonte.texto,
    fontSize: tamanho.sm,
    color: cor.textoSuave,
    paddingBottom: 24,
    paddingTop: 8,
  },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 24 },
  titulo: { fontFamily: fonte.titulo, fontSize: tamanho.xl, color: cor.texto, textAlign: 'center' },
  linhaXp: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  xp: { fontFamily: fonte.titulo, fontSize: tamanho.xxl, color: cor.acerto },
  detalhe: {
    fontFamily: fonte.texto,
    fontSize: tamanho.sm,
    lineHeight: 21,
    color: cor.textoSuave,
    textAlign: 'center',
  },
});
