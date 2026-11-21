import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { carreiraPorId } from '@/carreiras/dados';
import { Aviso, useAviso } from '@/componentes/Aviso';
import { Botao } from '@/componentes/Botao';
import { NoTrilha, type EstadoNo } from '@/componentes/NoTrilha';
import { textoDeDias, useProgresso, type StatusDaNuvem } from '@/estado/progresso';
import { indiceDoFarol, moduloAtual, nomeDoModulo, partes, totalDeNos, totalDePartes } from '@/licao/dados';
import {
  LIMIAR_DA_REVISAO_RAPIDA,
  QUESTOES_DA_REVISAO_RAPIDA,
  QUESTOES_DO_FAROL,
  vencidasDoModulo,
} from '@/licao/montar';
import { rotuloModoDeErro } from '@/licao/tipos';
import { vencidas } from '@/revisao/agenda';
import { haptico } from '@/servicos/haptico';
import { diagnosticoDoSom, tocar } from '@/servicos/som';
import { IconeAnelDaMeta, IconeLuzDaSequencia, IconeModulos, IconeRevisao } from '@/icones';
import { alvoMinimo, cor, fonte, limites, raio, tamanho } from '@/tema/tokens';

const deslocamentos = [0, 46, 0, -46];

const textoDaNuvem: Record<StatusDaNuvem, string> = {
  desligada: 'Nuvem desligada (falta o arquivo .env.local)',
  conectando: 'Nuvem: conectando...',
  conectada: 'Nuvem: progresso salvo (conta anônima)',
  offline: 'Nuvem: sem conexão agora; tenta de novo ao abrir o app',
};

export default function Trilha() {
  const {
    onboardingConcluido,
    carreira,
    metaDiaria,
    mapa,
    concluidas,
    dominadas,
    sequencia,
    licoesHoje,
    desafiosHoje,
    registrarDesafio,
    ganharDesafio,
    reiniciar,
    modoDeErro,
    alternarModoDeErro,
    revisoes,
    nuvem,
    conta,
  } = useProgresso();
  const [cartaoAberto, setCartaoAberto] = useState(false);
  const [alvoDoPulo, setAlvoDoPulo] = useState<number | null>(null);
  const [limiteDeDesafio, setLimiteDeDesafio] = useState(false);
  const { aviso, mostrarAviso } = useAviso();
  // A hora de revisar depende do relógio: recalcula sempre que a trilha volta a aparecer.
  const [agora, setAgora] = useState(() => Date.now());
  useFocusEffect(useCallback(() => setAgora(Date.now()), []));

  // Primeiro acesso: valor antes de qualquer pedido (jornada, etapa 2).
  if (!onboardingConcluido) return <Redirect href="/boas-vindas" />;

  const c = carreiraPorId(carreira);
  const paraRevisar = vencidasDoModulo(moduloAtual, vencidas(revisoes, new Date(agora)));
  const temRevisaoRapida = paraRevisar.length >= LIMIAR_DA_REVISAO_RAPIDA;
  // Convite para guardar o progresso: só depois de a pessoa ter recebido valor (2 partes) e só para conta anônima.
  const convidarParaGuardar = nuvem === 'conectada' && conta?.anonima === true && concluidas >= 2;
  const farolAceso = concluidas >= totalDeNos;
  const vezDoFarol = concluidas === indiceDoFarol;
  const feitasHoje = Math.min(licoesHoje, metaDiaria);
  const metaCumprida = licoesHoje >= metaDiaria;
  // Convite "Pular pra cá?" no nó dois à frente, quando existir.
  const noComConvite = concluidas + 2 < totalDePartes ? concluidas + 2 : null;

  function estadoDaParte(indice: number): EstadoNo {
    if (indice < concluidas) return dominadas.includes(indice) ? 'dominada' : 'feita';
    return indice === concluidas ? 'atual' : 'bloqueada';
  }

  function tocarFarol() {
    if (farolAceso) {
      haptico.selecao();
      mostrarAviso(`Farol aceso. Você concluiu ${nomeDoModulo}.`);
    } else if (vezDoFarol) {
      haptico.leve();
      setCartaoAberto(true);
    } else {
      haptico.leve();
      setAlvoDoPulo(indiceDoFarol);
    }
  }

  function tocarParte(indice: number) {
    if (indice < concluidas) {
      haptico.selecao();
      mostrarAviso(dominadas.includes(indice) ? 'Parte dominada pelo desafio.' : 'Lição concluída. Que bom!');
    } else if (indice === concluidas) {
      haptico.leve();
      setCartaoAberto(true);
    } else {
      haptico.leve();
      setAlvoDoPulo(indice);
    }
  }

  function comecarDesafio() {
    if (alvoDoPulo === null) return;
    if (desafiosHoje >= limites.desafiosPorDia) {
      haptico.aviso();
      setLimiteDeDesafio(true);
      return;
    }
    registrarDesafio();
    const alvo = alvoDoPulo;
    setAlvoDoPulo(null);
    router.push({ pathname: '/desafio', params: { ate: String(alvo) } });
  }

  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.cabeca}>
        <View style={estilos.indicador}>
          <IconeLuzDaSequencia tamanho={22} intensidade={sequencia > 0 ? 1 : 0.3} />
          <Text style={estilos.sequencia}>{textoDeDias(sequencia)}</Text>
        </View>
        <View style={estilos.indicador}>
          <IconeAnelDaMeta tamanho={20} progresso={feitasHoje / metaDiaria} />
          <Text style={[estilos.meta, metaCumprida ? { color: cor.luz } : null]}>
            {metaCumprida ? 'Meta de hoje cumprida' : `Meta de hoje: ${feitasHoje} de ${metaDiaria}`}
          </Text>
        </View>
      </View>

      <View style={estilos.banner}>
        <View>
          <Text style={estilos.bannerPequeno}>{`PORTUGUÊS · MÓDULO 1${c ? ` · ${c.nome.toUpperCase()}` : ''}`}</Text>
          <Text style={estilos.bannerTitulo}>{nomeDoModulo}</Text>
        </View>
        <IconeModulos tamanho={26} />
      </View>

      {temRevisaoRapida ? (
        <Animated.View entering={FadeInDown.duration(250)}>
          <Pressable
            onPress={() => {
              haptico.leve();
              router.push({ pathname: '/licao', params: { modo: 'revisao' } });
            }}
            accessibilityRole="button"
            accessibilityLabel={`Revisão rápida, ${Math.min(paraRevisar.length, QUESTOES_DA_REVISAO_RAPIDA)} questões`}
            style={estilos.revisao}>
            <IconeRevisao tamanho={28} />
            <View style={estilos.revisaoTextos}>
              <Text style={estilos.revisaoTitulo}>Revisão rápida</Text>
              <Text style={estilos.revisaoSub}>
                {`${Math.min(paraRevisar.length, QUESTOES_DA_REVISAO_RAPIDA)} questões no ponto de revisar · +${limites.xpDaRevisao} XP`}
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      ) : null}

      {convidarParaGuardar ? (
        <Pressable
          onPress={() => {
            haptico.leve();
            router.push({ pathname: '/conta', params: { modo: 'salvar' } });
          }}
          accessibilityRole="button"
          style={estilos.guardar}>
          <Text style={estilos.guardarTexto}>
            Seu progresso está só neste aparelho. <Text style={estilos.guardarLink}>Guardar na sua conta ›</Text>
          </Text>
        </Pressable>
      ) : null}

      {!mapa ? (
        <Pressable
          onPress={() => {
            haptico.leve();
            router.push('/diagnostico');
          }}
          accessibilityRole="button"
          style={estilos.linkMapa}>
          <Text style={estilos.linkMapaTexto}>Descobrir meu ponto de partida · 2 min ›</Text>
        </Pressable>
      ) : null}

      <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
        <NoTrilha
          farol
          estado={farolAceso ? 'feita' : vezDoFarol ? 'atual' : 'bloqueada'}
          rotulo={`Farol de ${nomeDoModulo}`}
          sub={farolAceso ? 'Aceso' : vezDoFarol ? 'Hoje' : 'Estilo de prova'}
          onPress={tocarFarol}
        />
        {[...partes]
          .map((_, i) => partes.length - 1 - i)
          .map((indice, posicao) => (
            <NoTrilha
              key={indice}
              estado={estadoDaParte(indice)}
              rotulo={`Parte ${indice + 1}`}
              sub={indice === concluidas ? 'Hoje' : partes[indice]}
              bolha={indice === noComConvite ? 'PULAR PRA CÁ?' : undefined}
              deslocamento={deslocamentos[posicao % deslocamentos.length]}
              onPress={() => tocarParte(indice)}
            />
          ))}
        <Pressable onPress={alternarModoDeErro} style={estilos.rodapeDemo} accessibilityRole="button">
          <Text
            style={
              estilos.rodapeDemoTexto
            }>{`Experimento de erro: ${rotuloModoDeErro[modoDeErro]} (toque para trocar)`}</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            tocar('licao');
            setTimeout(() => mostrarAviso(diagnosticoDoSom('licao')), 400);
          }}
          style={estilos.rodapeDemo}
          accessibilityRole="button">
          <Text style={estilos.rodapeDemoTexto}>Testar som (diagnóstico)</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/icones')} style={estilos.rodapeDemo} accessibilityRole="button">
          <Text style={estilos.rodapeDemoTexto}>Ver catálogo de ícones</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/conta')} style={estilos.rodapeDemo} accessibilityRole="button">
          <Text style={estilos.rodapeDemoTexto}>
            {conta && !conta.anonima && nuvem === 'conectada'
              ? `Nuvem: progresso salvo na conta ${conta.email ?? ''}`
              : textoDaNuvem[nuvem]}
          </Text>
        </Pressable>
        <Pressable onPress={reiniciar} style={estilos.rodapeDemo} accessibilityRole="button">
          <Text style={estilos.rodapeDemoTexto}>Reiniciar demonstração (volta ao início)</Text>
        </Pressable>
      </ScrollView>

      <Aviso texto={aviso} />

      {cartaoAberto && !farolAceso ? (
        <View style={StyleSheet.absoluteFill}>
          <Pressable style={estilos.fundoCartao} onPress={() => setCartaoAberto(false)} accessibilityLabel="Fechar" />
          <Animated.View entering={FadeInDown.duration(220)} style={estilos.cartao}>
            <Text style={estilos.cartaoTitulo}>{vezDoFarol ? `Farol de ${nomeDoModulo}` : partes[concluidas]}</Text>
            <Text style={estilos.cartaoSub}>
              {vezDoFarol
                ? `${QUESTOES_DO_FAROL} questões no estilo da prova, com tudo o que você viu no módulo. Acenda o farol.`
                : `Lição ${concluidas + 1} de ${totalDePartes} · cerca de 10 questões`}
            </Text>
            <View style={estilos.cartaoBotao}>
              <Botao
                rotulo={vezDoFarol ? 'ACENDER O FAROL' : 'COMEÇAR'}
                sub={`+${vezDoFarol ? limites.xpDoFarol : limites.xpDaLicao} XP`}
                onPress={() => {
                  setCartaoAberto(false);
                  router.push('/licao');
                }}
              />
            </View>
          </Animated.View>
        </View>
      ) : null}

      {alvoDoPulo !== null ? (
        <View style={StyleSheet.absoluteFill}>
          <Pressable
            style={estilos.fundoCartao}
            onPress={() => {
              setAlvoDoPulo(null);
              setLimiteDeDesafio(false);
            }}
            accessibilityLabel="Fechar"
          />
          <Animated.View entering={FadeInDown.duration(220)} style={[estilos.cartao, estilos.cartaoPulo]}>
            <Text style={[estilos.cartaoTitulo, { color: cor.texto }]}>Pular pra cá?</Text>
            <Text style={[estilos.cartaoSub, { color: cor.textoSuave }]}>
              {`Já sabe isso? Prove e avance. ${limites.luzesDoDesafio} luzes, ${concluidas + 1 === alvoDoPulo ? `e a Parte ${alvoDoPulo}` : `e as Partes ${concluidas + 1} a ${alvoDoPulo}`} ficam dominadas.`}
            </Text>
            {limiteDeDesafio ? (
              <View style={estilos.limite}>
                <Text style={estilos.limiteTexto}>
                  <Text style={{ fontFamily: fonte.textoSemi, color: cor.luz }}>
                    Seu desafio de hoje já foi usado.{' '}
                  </Text>
                  Quer mais um? Assista a um vídeo curto ou conheça o Pro. (Simulado no protótipo.)
                </Text>
                <Botao
                  rotulo="ASSISTIR VÍDEO"
                  sub="+1 desafio"
                  variante="secundario"
                  onPress={() => {
                    ganharDesafio();
                    setLimiteDeDesafio(false);
                    haptico.sucesso();
                  }}
                />
              </View>
            ) : null}
            <View style={estilos.cartaoBotao}>
              <Botao rotulo="COMEÇAR DESAFIO" sub={`+${limites.xpDoDesafio} XP`} onPress={comecarDesafio} />
              <Botao
                rotulo="Prefiro fazer as lições"
                variante="terciario"
                onPress={() => {
                  setAlvoDoPulo(null);
                  setLimiteDeDesafio(false);
                }}
              />
            </View>
          </Animated.View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo, paddingHorizontal: 16 },
  cabeca: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  indicador: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sequencia: { fontFamily: fonte.tituloMedio, fontSize: tamanho.md, color: cor.luz },
  meta: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave },
  banner: {
    backgroundColor: cor.mare,
    borderRadius: raio.lg,
    borderBottomWidth: 4,
    borderBottomColor: '#1B3F93',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerPequeno: {
    fontFamily: fonte.textoSemi,
    fontSize: 10,
    letterSpacing: 0.8,
    color: cor.textoSobreMare,
    opacity: 0.85,
  },
  bannerTitulo: { fontFamily: fonte.titulo, fontSize: tamanho.lg, color: cor.textoSobreMare },
  revisao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: cor.superficie,
    borderColor: cor.luz,
    borderWidth: 1,
    borderRadius: raio.lg,
  },
  revisaoTextos: { flex: 1 },
  revisaoTitulo: { fontFamily: fonte.tituloMedio, fontSize: tamanho.md, color: cor.texto },
  revisaoSub: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave },
  guardar: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    minHeight: alvoMinimo,
    justifyContent: 'center',
  },
  guardarTexto: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave, textAlign: 'center' },
  guardarLink: { fontFamily: fonte.textoSemi, color: cor.luz },
  linkMapa: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 8 },
  linkMapaTexto: { fontFamily: fonte.textoSemi, fontSize: tamanho.sm, color: cor.luz },
  rolagem: { paddingVertical: 8, paddingBottom: 40 },
  rodapeDemo: { alignSelf: 'center', padding: 12, marginTop: 4 },
  rodapeDemoTexto: { fontFamily: fonte.texto, fontSize: 12, color: cor.textoSuave, textAlign: 'center' },
  fundoCartao: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: cor.sobreposicao },
  cartao: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    backgroundColor: cor.mare,
    borderRadius: raio.lg + 4,
    padding: 18,
  },
  cartaoPulo: { backgroundColor: cor.superficie, borderColor: cor.linha, borderWidth: 1 },
  cartaoTitulo: { fontFamily: fonte.titulo, fontSize: tamanho.lg, color: cor.textoSobreMare },
  cartaoSub: {
    fontFamily: fonte.texto,
    fontSize: tamanho.sm,
    lineHeight: 21,
    color: cor.textoSobreMare,
    opacity: 0.85,
    marginTop: 2,
  },
  cartaoBotao: { marginTop: 16, gap: 2 },
  limite: {
    marginTop: 12,
    backgroundColor: cor.fundo,
    borderColor: cor.luz,
    borderWidth: 1,
    borderRadius: raio.md,
    padding: 12,
    gap: 10,
  },
  limiteTexto: { fontFamily: fonte.texto, fontSize: tamanho.sm, lineHeight: 21, color: cor.texto },
});
