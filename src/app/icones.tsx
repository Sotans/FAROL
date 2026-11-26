import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { carreiras } from '@/carreiras/dados';
import { GuiaIlustrado, IlustracaoDoFarol, temGuiaIlustrado } from '@/componentes/Ilustracoes';
import {
  AvatarDoGuia,
  cabelos,
  expressoes,
  Personagem,
  tonsDePele,
  type CorDoCabelo,
  type TomDePele,
} from '@/componentes/Personagem';
import {
  IconeAnelDaMeta,
  IconeBaixar,
  IconeBussola,
  IconeCadeado,
  IconeComecar,
  IconeEmail,
  IconeEmValidacao,
  IconeEscudo,
  IconeEstatisticas,
  IconeEstrelaDeLuz,
  IconeFaisca,
  IconeFarol,
  IconeFechar,
  IconeInicio,
  IconeLaboratorio,
  IconeLanterna,
  IconeLembrete,
  IconeLuzDaSequencia,
  IconeMaterias,
  IconeModulos,
  IconePerfil,
  IconeRelampago,
  IconeReportar,
  IconeRevisao,
  IconeSeloConcluida,
  IconeSeloDominada,
  IconeSemConexao,
  IconeSemSom,
  IconeSeta,
  IconeSom,
  IconeTrilha,
  IconeVisto,
  IlustracaoCarreira,
} from '@/icones';
import { cor, fonte, raio, tamanho } from '@/tema/tokens';

const itensDaInterface: [string, (p: { tamanho?: number }) => React.JSX.Element][] = [
  ['Início', IconeInicio],
  ['Trilha', IconeTrilha],
  ['Perfil', IconePerfil],
  ['Matérias', IconeMaterias],
  ['Estatísticas', IconeEstatisticas],
  ['Baixar', IconeBaixar],
  ['Sem conexão', IconeSemConexao],
  ['Lembrete', IconeLembrete],
  ['Guardar', IconeEscudo],
  ['E-mail', IconeEmail],
  ['Reportar erro', IconeReportar],
  ['Em validação', IconeEmValidacao],
  ['Som', IconeSom],
  ['Sem som', IconeSemSom],
  ['Laboratório', IconeLaboratorio],
];

// Combinações variadas de pele e cor para mostrar a diversidade no catálogo.
const tonsDoCatalogo: TomDePele[] = ['claro', 'escuro', 'moreno', 'medio'];
const coresDoCatalogo: CorDoCabelo[] = ['escuro', 'escuro', 'castanho', 'grisalho'];

/** Catálogo dos ícones e ilustrações (submeta 1.10), para avaliar no aparelho. Tela de demonstração. */
export default function Icones() {
  return (
    <SafeAreaView style={estilos.tela} edges={['top', 'bottom']}>
      <View style={estilos.topo}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={estilos.voltar}>
          <IconeFechar tamanho={26} />
        </Pressable>
        <Text style={estilos.titulo}>Ícones e guias do FAROL</Text>
      </View>
      <ScrollView contentContainerStyle={estilos.corpo}>
        <Secao titulo="Farol">
          <Item nome="Apagado">
            <IconeFarol tamanho={56} estado="apagado" />
          </Item>
          <Item nome="Na vez dele">
            <IconeFarol tamanho={56} estado="atual" />
          </Item>
          <Item nome="Aceso">
            <IconeFarol tamanho={56} estado="aceso" />
          </Item>
        </Secao>

        <Secao titulo="Ilustrações · farol">
          <Item nome="Apagado" alto>
            <IlustracaoDoFarol estado="apagado" altura={92} />
          </Item>
          <Item nome="Lâmpada acesa" alto>
            <IlustracaoDoFarol estado="atual" altura={92} />
          </Item>
          <Item nome="Aceso" alto>
            <IlustracaoDoFarol estado="aceso" altura={92} />
          </Item>
        </Secao>

        <Secao titulo="Ilustrações · guia (momentos especiais)">
          {carreiras
            .filter((c) => temGuiaIlustrado(c))
            .flatMap((c) =>
              (['acenando', 'comemorando'] as const).map((pose) => (
                <Item key={`${c.id}-${pose}`} nome={`${c.nome} · ${pose}`} alto>
                  <GuiaIlustrado carreira={c} pose={pose} altura={92} />
                </Item>
              )),
            )}
        </Secao>

        <Secao titulo="Conquistas">
          <Item nome="Sequência">
            <IconeLuzDaSequencia tamanho={36} />
          </Item>
          <Item nome="Sequência baixa">
            <IconeLuzDaSequencia tamanho={36} intensidade={0.3} />
          </Item>
          <Item nome="Faísca (XP)">
            <IconeFaisca tamanho={36} />
          </Item>
          <Item nome="Meta 0%">
            <IconeAnelDaMeta tamanho={36} progresso={0} />
          </Item>
          <Item nome="Meta 50%">
            <IconeAnelDaMeta tamanho={36} progresso={0.5} />
          </Item>
          <Item nome="Meta cumprida">
            <IconeAnelDaMeta tamanho={36} progresso={1} />
          </Item>
          <Item nome="Lição concluída">
            <IconeSeloConcluida tamanho={44} />
          </Item>
          <Item nome="Dominada">
            <IconeSeloDominada tamanho={44} />
          </Item>
          <Item nome="Desafio">
            <IconeBussola tamanho={36} />
          </Item>
          <Item nome="Revisão">
            <IconeRevisao tamanho={36} />
          </Item>
          <Item nome="Relâmpago">
            <IconeRelampago tamanho={36} />
          </Item>
        </Secao>

        <Secao titulo="Nós da trilha">
          <Item nome="Concluída">
            <View style={[estilos.no, { backgroundColor: cor.acerto }]}>
              <IconeVisto tamanho={26} cor={cor.fundo} />
            </View>
          </Item>
          <Item nome="Dominada">
            <View style={[estilos.no, { backgroundColor: cor.acerto }]}>
              <IconeEstrelaDeLuz tamanho={26} cor={cor.fundo} />
            </View>
          </Item>
          <Item nome="Atual">
            <View style={[estilos.no, { backgroundColor: cor.luz }]}>
              <IconeComecar tamanho={28} />
            </View>
          </Item>
          <Item nome="Bloqueada">
            <View style={[estilos.no, { backgroundColor: cor.superficie }]}>
              <IconeCadeado tamanho={22} />
            </View>
          </Item>
        </Secao>

        <Secao titulo="Utilitários">
          <Item nome="Dica">
            <IconeLanterna tamanho={32} />
          </Item>
          <Item nome="Sem dicas">
            <IconeLanterna tamanho={32} acesa={false} />
          </Item>
          <Item nome="Fechar">
            <IconeFechar tamanho={32} />
          </Item>
          <Item nome="Certo">
            <IconeVisto tamanho={32} />
          </Item>
          <Item nome="Par">
            <IconeSeta tamanho={32} />
          </Item>
          <Item nome="Módulos">
            <View style={[estilos.no, { backgroundColor: cor.mare }]}>
              <IconeModulos tamanho={26} />
            </View>
          </Item>
        </Secao>

        <Secao titulo="Interface (Lucide, traço 2,4, sem ponto de luz)">
          {itensDaInterface.map(([nome, Icone]) => (
            <Item key={nome} nome={nome}>
              <Icone tamanho={32} />
            </Item>
          ))}
        </Secao>

        {carreiras
          .filter((c) => c.ativa)
          .map((c) => (
            <Secao key={c.id} titulo={`Guia · ${c.nome}`}>
              {expressoes.map((e) => (
                <Item key={e} nome={e} alto>
                  <Personagem carreira={c} expressao={e} tamanho={72} />
                </Item>
              ))}
            </Secao>
          ))}

        <Secao titulo="Guia · tons de pele">
          {(Object.keys(tonsDePele) as TomDePele[]).map((tom) => (
            <Item key={tom} nome={tom} alto>
              <Personagem carreira={carreiras[0]} expressao="feliz" tom={tom} tamanho={72} />
            </Item>
          ))}
        </Secao>

        <Secao titulo="Guia · cabelos e cores">
          {cabelos.map((cabelo, i) => (
            <Item key={cabelo} nome={`${cabelo} · ${coresDoCatalogo[i]}`} alto>
              <Personagem
                carreira={carreiras[1]}
                expressao="feliz"
                tom={tonsDoCatalogo[i]}
                cabelo={cabelo}
                corDoCabelo={coresDoCatalogo[i]}
                tamanho={72}
              />
            </Item>
          ))}
        </Secao>

        <Secao titulo="Guia · avatar de busto">
          {[64, 48, 32].map((t) => (
            <Item key={t} nome={`${t} px`}>
              <AvatarDoGuia carreira={carreiras[0]} tamanho={t} />
            </Item>
          ))}
        </Secao>

        <Secao titulo="Guia · em breve (silhuetas)">
          {carreiras
            .filter((c) => !c.ativa)
            .map((c) => (
              <Item key={c.id} nome={c.nome} alto>
                <Personagem carreira={c} silhueta tamanho={72} />
              </Item>
            ))}
        </Secao>

        <Secao titulo="Carreiras">
          {carreiras.map((c) => (
            <Item key={c.id} nome={c.nome}>
              <IlustracaoCarreira id={c.id} tamanho={64} />
            </Item>
          ))}
        </Secao>
      </ScrollView>
    </SafeAreaView>
  );
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <View style={estilos.secao}>
      <Text style={estilos.secaoTitulo}>{titulo}</Text>
      <View style={estilos.grade}>{children}</View>
    </View>
  );
}

function Item({ nome, children, alto = false }: { nome: string; children: ReactNode; alto?: boolean }) {
  return (
    <View style={estilos.item}>
      <View style={[estilos.desenho, alto ? estilos.desenhoAlto : null]}>{children}</View>
      <Text style={estilos.nome}>{nome}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cor.fundo },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6 },
  voltar: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontFamily: fonte.titulo, fontSize: tamanho.lg, color: cor.texto },
  corpo: { paddingHorizontal: 16, paddingBottom: 40, gap: 22 },
  secao: { gap: 10 },
  secaoTitulo: { fontFamily: fonte.textoSemi, fontSize: tamanho.sm, color: cor.textoSuave },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  item: {
    width: '31%',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: cor.superficie,
    borderRadius: raio.md,
  },
  desenho: { height: 64, alignItems: 'center', justifyContent: 'center' },
  desenhoAlto: { height: 96 },
  nome: { fontFamily: fonte.texto, fontSize: tamanho.xs, color: cor.textoSuave, textAlign: 'center' },
  no: { width: 52, height: 52, borderRadius: raio.circulo, alignItems: 'center', justifyContent: 'center' },
});
