import { Tabs } from 'expo-router/js-tabs';

import { trilhaDePortugues } from '@/conteudo/trilha';
import { BarraDeAbas } from '@/componentes/BarraDeAbas';
import { useProgresso } from '@/estado/progresso';
import { vencidasDosModulos } from '@/licao/montar';
import { vencidas } from '@/revisao/agenda';
import { cor } from '@/tema/tokens';

/**
 * As 4 abas do app: Trilha, Revisar, Notícias e Você. Lição, desafio, mapa e o onboarding ficam
 * fora deste grupo, na pilha da raiz: abrem por cima e escondem a barra (momentos de foco).
 */
export default function LayoutDasAbas() {
  const { revisoes } = useProgresso();
  const paraRevisar = vencidasDosModulos(trilhaDePortugues, vencidas(revisoes, new Date())).length;

  return (
    <Tabs
      tabBar={(props) => <BarraDeAbas {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: cor.fundo } }}>
      <Tabs.Screen name="index" options={{ title: 'Trilha' }} />
      <Tabs.Screen
        name="revisar"
        options={{
          title: 'Revisar',
          tabBarBadge: paraRevisar > 0 ? (paraRevisar > 9 ? '9+' : paraRevisar) : undefined,
        }}
      />
      <Tabs.Screen name="noticias" options={{ title: 'Notícias' }} />
      <Tabs.Screen name="voce" options={{ title: 'Você' }} />
    </Tabs>
  );
}
