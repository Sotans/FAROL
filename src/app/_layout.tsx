import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';

import { ProgressoProvider, useProgresso } from '@/estado/progresso';
import { prepararSons } from '@/servicos/som';
import { cor } from '@/tema/tokens';

SplashScreen.preventAutoHideAsync();

export default function LayoutRaiz() {
  const [carregou, erro] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  if (!carregou && !erro) return null;

  return (
    // A raiz dos gestos (arrastar as fichas das questões) envolve o app inteiro.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProgressoProvider>
        <StatusBar style="light" />
        <Telas />
      </ProgressoProvider>
    </GestureHandlerRootView>
  );
}

/** Só mostra as telas depois que fontes e progresso salvo estiverem prontos. */
function Telas() {
  const { carregado } = useProgresso();

  useEffect(() => {
    if (carregado) {
      SplashScreen.hideAsync();
      // Depois da montagem, com os módulos nativos prontos.
      prepararSons();
    }
  }, [carregado]);

  if (!carregado) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cor.fundo }, animation: 'fade' }}>
      {/* Momentos de foco sobem de baixo, por cima das abas. */}
      <Stack.Screen name="licao" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="desafio" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="diagnostico" options={{ animation: 'slide_from_bottom' }} />
      {/* O onboarding é uma sequência de passos: cada tela entra pela direita. */}
      <Stack.Screen name="carreira" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="guia" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="meta" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
