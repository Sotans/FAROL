import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { carreiraPorId } from '@/carreiras/dados';
import { SeloQueAcende } from '@/componentes/animados/IconesAnimados';
import { Aviso, useAviso } from '@/componentes/Aviso';
import { AvatarDoGuia } from '@/componentes/Personagem';
import { trilhaDePortugues } from '@/conteudo/trilha';
import { textoDeDias, useProgresso } from '@/estado/progresso';
import { IconeCadeado, IconeEstrelaDeLuz, IconeSeta } from '@/icones';
import { conquistas, faroisAcesos, formatarNumero } from '@/perfil/resumo';
import { haptico } from '@/servicos/haptico';
import { cor, fonte, raio, tamanho } from '@/tema/tokens';

/**
 * Aba Você: o perfil. O que a pessoa já conquistou (XP, dias seguidos, faróis e conquistas) e os
 * ajustes: guia, meta, mapa, assinatura e conta.
 */
export default function Voce() {
  const p = useProgresso();
  const c = carreiraPorId(p.carreira);
  const { aviso, mostrarAviso } = useAviso();
  const farois = faroisAcesos(trilhaDePortugues, p.modulos);
  const lista = conquistas({
    xp: p.xp,
    sequencia: p.sequencia,
    faroisAcesos: farois,
    modulos: p.modulos,
    trilha: trilhaDePortugues,
    fezOMapa: p.mapa !== null,
  });
  const alcancadas = lista.filter((x) => x.alcancada).length;

  const contaTexto = !p.conta ? 'Neste aparelho' : p.conta.anonima ? 'Sem e-mail' : (p.conta.email ?? 'Com e-mail');

  const ajustes: { titulo: string; valor?: string; ir: () => void }[] = [
    { titulo: 'Seu guia', ir: () => router.push({ pathname: '/guia', params: { modo: 'editar' } }) },
    {
      titulo: 'Meta diária',
      valor: `${p.metaDiaria} ${p.metaDiaria === 1 ? 'lição' : 'lições'}`,
      ir: () => router.push({ pathname: '/meta', params: { modo: 'editar' } }),
    },
    {
      titulo: 'Mapa do ponto de partida',
      valor: p.mapa ? 'Feito' : 'Fazer',
      ir: () => router.push((p.mapa ? '/mapa' : '/diagnostico') as Href),
    },
    { titulo: 'Assinatura', valor: 'Grátis', ir: () => mostrarAviso('A assinatura chega em breve.') },
    { titulo: 'Conta e dados', valor: contaTexto, ir: () => router.push('/conta') },
  ];

  return (
    <SafeAreaView style={estilos.tela} edges={['top']}>
      <ScrollView contentContainerStyle={estilos.rolagem} showsVerticalScrollIndicator={false}>
        <View style={estilos.cabeca}>
          {c ? (
            <AvatarDoGuia
              carreira={c}
              tom={p.tomDoGuia}
              cabelo={p.cabeloDoGuia}
              corDoCabelo={p.corDoCabeloDoGuia}
              tamanho={88}
            />
          ) : null}
          <Text style={estilos.titulo} accessibilityRole="header">
            Você
          </Text>
          {c ? <Text style={estilos.sub}>{`Carreira: ${c.nome}`}</Text> : null}
        </View>

        <View style={estilos.numeros}>
          <Numero valor={formatarNumero(p.xp)} rotulo="XP" />
          <Numero valor={String(p.sequencia)} rotulo={p.sequencia === 1 ? 'dia seguido' : 'dias seguidos'} />
          <Numero valor={String(farois)} rotulo={farois === 1 ? 'farol aceso' : 'faróis acesos'} />
        </View>

        <View style={estilos.secao}>
          <View style={estilos.secaoCabeca}>
            <Text style={estilos.secaoTitulo}>Conquistas</Text>
            <Text style={estilos.secaoContagem}>{`${alcancadas} de ${lista.length}`}</Text>
          </View>
          <View style={estilos.grade}>
            {lista.map((x) => (
              <View
                key={x.id}
                style={[estilos.conquista, x.alcancada ? estilos.conquistaAlcancada : null]}
                accessible
                accessibilityLabel={`${x.titulo}. ${x.descricao}. ${x.alcancada ? 'Conquistada' : 'Ainda não'}`}>
                <SeloQueAcende id={x.id} alcancada={x.alcancada}>
                  <View style={[estilos.selo, x.alcancada ? estilos.seloAceso : null]}>
                    {x.alcancada ? <IconeEstrelaDeLuz tamanho={20} /> : <IconeCadeado tamanho={18} />}
                  </View>
                </SeloQueAcende>
                <Text style={[estilos.conquistaTitulo, x.alcancada ? null : estilos.apagado]}>{x.titulo}</Text>
                <Text style={estilos.conquistaDescricao}>{x.descricao}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={estilos.ajustes}>
          {ajustes.map((a) => (
            <Pressable
              key={a.titulo}
              accessibilityRole="button"
              accessibilityLabel={a.valor ? `${a.titulo}: ${a.valor}` : a.titulo}
              onPress={() => {
                haptico.selecao();
                a.ir();
              }}
              style={estilos.ajuste}>
              <Text style={estilos.ajusteTitulo}>{a.titulo}</Text>
              <View style={estilos.ajusteDireita}>
                {a.valor ? (
                  <Text style={estilos.ajusteValor} numberOfLines={1}>
                    {a.valor}
                  </Text>
                ) : null}
                <IconeSeta tamanho={18} cor={cor.textoSuave} />
              </View>
            </Pressable>
          ))}
        </View>
        {p.sequencia > 0 ? (
          <Text style={estilos.rodape}>{`Você estuda há ${textoDeDias(p.sequencia)} seguidos. Continue amanhã!`}</Text>
        ) : null}
      </ScrollView>
      <Aviso texto={aviso} topo={24} />
    </SafeAreaView>
  );
}

function Numero({ valor, rotulo }: { valor: string; rotulo: string }) {
  return (
    <View style={estilos.numero} accessible accessibilityLabel={`${valor} ${rotulo}`}>
      <Text style={estilos.numeroValor}>{valor}</Text>
      <Text style={estilos.numeroRotulo}>{rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo },
  rolagem: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 32, gap: 24 },
  cabeca: { alignItems: 'center', gap: 6 },
  titulo: { fontFamily: fonte.conquista, fontSize: tamanho.xxl - 4, color: cor.texto, marginTop: 6 },
  sub: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave },
  numeros: { flexDirection: 'row', gap: 10 },
  numero: {
    flex: 1,
    backgroundColor: cor.superficie,
    borderColor: cor.linha,
    borderWidth: 1,
    borderRadius: raio.lg,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 2,
  },
  numeroValor: { fontFamily: fonte.conquista, fontSize: tamanho.xl + 2, color: cor.luz },
  numeroRotulo: { fontFamily: fonte.texto, fontSize: tamanho.xs, color: cor.textoSuave, textAlign: 'center' },
  secao: { gap: 12 },
  secaoCabeca: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  secaoTitulo: { fontFamily: fonte.textoSemi, fontSize: tamanho.lg - 2, color: cor.texto },
  secaoContagem: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  conquista: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: cor.superficie,
    borderColor: cor.linhaForte,
    borderWidth: 1,
    borderRadius: raio.md,
    padding: 12,
    gap: 4,
  },
  conquistaAlcancada: { borderColor: cor.luzContorno, backgroundColor: cor.luzVeu },
  selo: {
    width: 34,
    height: 34,
    borderRadius: raio.circulo,
    borderWidth: 2,
    borderColor: cor.linhaForte,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seloAceso: { backgroundColor: cor.luz, borderColor: cor.relevoLuz },
  conquistaTitulo: { fontFamily: fonte.textoSemi, fontSize: tamanho.sm + 1, color: cor.texto },
  apagado: { color: cor.textoSuave },
  conquistaDescricao: { fontFamily: fonte.texto, fontSize: tamanho.xs, lineHeight: 17, color: cor.textoSuave },
  ajustes: { borderTopWidth: 1, borderTopColor: cor.linha },
  ajuste: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: cor.linha,
  },
  ajusteTitulo: { fontFamily: fonte.textoSemi, fontSize: tamanho.md, color: cor.texto },
  ajusteDireita: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  ajusteValor: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave, flexShrink: 1 },
  rodape: { fontFamily: fonte.texto, fontSize: tamanho.sm, color: cor.textoSuave, textAlign: 'center' },
});
