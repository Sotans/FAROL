import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { View, type StyleProp, type ViewInstance, type ViewStyle } from 'react-native';
import { GestureDetector, useExclusiveGestures, usePanGesture, useTapGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptico } from '@/servicos/haptico';
import { mola } from '@/tema/movimento';

/**
 * Arrastar e soltar das questões: fichas (Arrastavel) que a pessoa leva com o dedo até uma
 * zona (ZonaDeSoltura). Tocar numa ficha também funciona (o mesmo efeito, sem arrastar),
 * o que mantém a questão acessível para leitor de tela e para quem prefere tocar.
 *
 * As zonas são medidas na janela quando o arraste começa; ao soltar, vale a zona sob o dedo.
 */

type Retangulo = { id: string; x: number; y: number; largura: number; altura: number };

type Contexto = {
  registrar: (id: string, ref: ViewInstance | null) => void;
  medir: () => Promise<void>;
  zonaEm: (x: number, y: number) => string | null;
  sobre: string | null;
  setSobre: (id: string | null) => void;
};

const ContextoDeArrastar = createContext<Contexto | null>(null);

export function AreaDeArrastar({ children }: { children: ReactNode }) {
  const zonas = useRef(new Map<string, ViewInstance>());
  const medidas = useRef<Retangulo[]>([]);
  const [sobre, setSobre] = useState<string | null>(null);

  const registrar = useCallback((id: string, ref: ViewInstance | null) => {
    if (ref) zonas.current.set(id, ref);
    else zonas.current.delete(id);
  }, []);

  const medir = useCallback(async () => {
    const lista = await Promise.all(
      [...zonas.current.entries()].map(
        ([id, ref]) =>
          new Promise<Retangulo>((ok) =>
            ref.measureInWindow((x: number, y: number, largura: number, altura: number) =>
              ok({ id, x, y, largura, altura }),
            ),
          ),
      ),
    );
    medidas.current = lista;
  }, []);

  const zonaEm = useCallback((x: number, y: number) => {
    const z = medidas.current.find((r) => x >= r.x && x <= r.x + r.largura && y >= r.y && y <= r.y + r.altura);
    return z?.id ?? null;
  }, []);

  const valor = useMemo(() => ({ registrar, medir, zonaEm, sobre, setSobre }), [registrar, medir, zonaEm, sobre]);
  return <ContextoDeArrastar.Provider value={valor}>{children}</ContextoDeArrastar.Provider>;
}

function useArrastar() {
  const c = useContext(ContextoDeArrastar);
  if (!c) throw new Error('Use Arrastavel e ZonaDeSoltura dentro de AreaDeArrastar');
  return c;
}

/** Uma zona onde as fichas podem ser soltas. `estiloSobre` aparece enquanto uma ficha passa por cima. */
export function ZonaDeSoltura({
  id,
  children,
  style,
  estiloSobre,
}: {
  id: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  estiloSobre?: StyleProp<ViewStyle>;
}) {
  const { registrar, sobre } = useArrastar();
  const ref = useRef<ViewInstance>(null);
  useEffect(() => {
    registrar(id, ref.current);
    return () => registrar(id, null);
  }, [id, registrar]);
  return (
    <View ref={ref} collapsable={false} style={[style, sobre === id ? estiloSobre : null]}>
      {children}
    </View>
  );
}

/**
 * Uma ficha que se arrasta. Ao soltar, chama `onSoltar` com a zona sob o dedo (ou null, fora de
 * qualquer zona) e volta ao lugar com uma mola; a tela decide para onde ela vai de verdade.
 */
export function Arrastavel({
  children,
  onSoltar,
  onToque,
  desabilitado = false,
  rotulo,
  style,
}: {
  children: ReactNode;
  onSoltar: (zona: string | null) => void;
  onToque: () => void;
  desabilitado?: boolean;
  /** O que o leitor de tela anuncia, e o que acontece ao tocar duas vezes. */
  rotulo: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { medir, zonaEm, setSobre } = useArrastar();
  const reduzir = useReducedMotion();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const ativo = useSharedValue(0);
  const ultimaZona = useRef<string | null>(null);

  const pan = usePanGesture({
    runOnJS: true,
    enabled: !desabilitado,
    minDistance: 6,
    onActivate: () => {
      ativo.value = 1;
      ultimaZona.current = null;
      void medir();
      haptico.selecao();
    },
    onUpdate: (e) => {
      x.value = e.translationX;
      y.value = e.translationY;
      const z = zonaEm(e.absoluteX, e.absoluteY);
      if (z !== ultimaZona.current) {
        ultimaZona.current = z;
        setSobre(z);
      }
    },
    onDeactivate: (e) => {
      const z = zonaEm(e.absoluteX, e.absoluteY);
      setSobre(null);
      ativo.value = 0;
      // A ficha volta ao lugar; se a zona aceitar, a tela a desenha já no destino.
      x.value = reduzir ? 0 : withSpring(0, mola);
      y.value = reduzir ? 0 : withSpring(0, mola);
      onSoltar(z);
    },
  });

  const toque = useTapGesture({
    runOnJS: true,
    enabled: !desabilitado,
    onActivate: () => {
      haptico.leve();
      onToque();
    },
  });

  const gesto = useExclusiveGestures(pan, toque);

  const animado = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: ativo.value ? 1.06 : 1 }],
    zIndex: ativo.value ? 100 : 0,
    opacity: ativo.value ? 0.95 : 1,
  }));

  return (
    <GestureDetector gesture={gesto}>
      <Animated.View
        style={[style, animado]}
        accessible
        accessibilityRole="button"
        accessibilityLabel={rotulo}
        accessibilityState={{ disabled: desabilitado }}
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={() => !desabilitado && onToque()}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
