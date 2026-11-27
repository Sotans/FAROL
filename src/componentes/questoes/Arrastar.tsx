import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { View, type StyleProp, type ViewInstance, type ViewStyle } from 'react-native';
import { GestureDetector, useExclusiveGestures, usePanGesture, useTapGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { haptico } from '@/servicos/haptico';
import { mola } from '@/tema/movimento';

/**
 * Arrastar e soltar das questões: fichas (Arrastavel) que a pessoa leva com o dedo até uma
 * zona (ZonaDeSoltura). Tocar numa ficha também funciona (o mesmo efeito, sem arrastar),
 * o que mantém a questão acessível para leitor de tela e para quem prefere tocar.
 *
 * Enquanto a pessoa arrasta, quem se move é uma cópia da ficha (o "fantasma"), desenhada por
 * cima de tudo na área da questão. A ficha original fica invisível no lugar. Assim a ficha
 * nunca passa por trás de outra parte da tela: no Android, o zIndex só vale entre irmãos.
 *
 * As zonas são medidas na janela quando o dedo encosta; ao soltar, vale a zona sob o dedo.
 */

type Retangulo = { id: string; x: number; y: number; largura: number; altura: number };
type Fantasma = { conteudo: ReactNode; x: number; y: number; largura: number; altura: number };

type Contexto = {
  registrar: (id: string, ref: ViewInstance | null) => void;
  medir: () => Promise<void>;
  zonaEm: (x: number, y: number) => string | null;
  sobre: string | null;
  setSobre: (id: string | null) => void;
  iniciarFantasma: (conteudo: ReactNode, origem: ViewInstance | null) => void;
  moverFantasma: (dx: number, dy: number) => void;
  /** Some com o fantasma; `voltar` o leva de volta ao lugar com uma mola antes. */
  encerrarFantasma: (voltar: boolean, depois: () => void) => void;
};

const ContextoDeArrastar = createContext<Contexto | null>(null);

/** Tempo para a mola levar o fantasma de volta antes de sumir. */
const VOLTA_MS = 260;

/** Mexer em valores animados fora dos hooks (a regra do React Compiler não deixa dentro de useCallback). */
function posicionar(dx: SharedValue<number>, dy: SharedValue<number>, x: number, y: number) {
  dx.value = x;
  dy.value = y;
}

function levarDeVolta(dx: SharedValue<number>, dy: SharedValue<number>) {
  dx.value = withSpring(0, mola);
  dy.value = withSpring(0, mola);
}

function medirNaJanela(ref: ViewInstance): Promise<Omit<Retangulo, 'id'>> {
  return new Promise((ok) =>
    ref.measureInWindow((x: number, y: number, largura: number, altura: number) => ok({ x, y, largura, altura })),
  );
}

export function AreaDeArrastar({ children }: { children: ReactNode }) {
  const area = useRef<ViewInstance>(null);
  const zonas = useRef(new Map<string, ViewInstance>());
  const medidas = useRef<Retangulo[]>([]);
  const [sobre, setSobre] = useState<string | null>(null);
  const [fantasma, setFantasma] = useState<Fantasma | null>(null);
  const reduzir = useReducedMotion();
  const dx = useSharedValue(0);
  const dy = useSharedValue(0);
  const volta = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (volta.current) clearTimeout(volta.current);
    },
    [],
  );

  const registrar = useCallback((id: string, ref: ViewInstance | null) => {
    if (ref) zonas.current.set(id, ref);
    else zonas.current.delete(id);
  }, []);

  const medir = useCallback(async () => {
    medidas.current = await Promise.all(
      [...zonas.current.entries()].map(async ([id, ref]) => ({ id, ...(await medirNaJanela(ref)) })),
    );
  }, []);

  const zonaEm = useCallback((x: number, y: number) => {
    const z = medidas.current.find((r) => x >= r.x && x <= r.x + r.largura && y >= r.y && y <= r.y + r.altura);
    return z?.id ?? null;
  }, []);

  const iniciarFantasma = useCallback(
    (conteudo: ReactNode, origem: ViewInstance | null) => {
      if (!origem || !area.current) return;
      if (volta.current) clearTimeout(volta.current);
      posicionar(dx, dy, 0, 0);
      const daArea = area.current;
      void Promise.all([medirNaJanela(origem), medirNaJanela(daArea)]).then(([o, a]) =>
        setFantasma({ conteudo, x: o.x - a.x, y: o.y - a.y, largura: o.largura, altura: o.altura }),
      );
    },
    [dx, dy],
  );

  const moverFantasma = useCallback((x: number, y: number) => posicionar(dx, dy, x, y), [dx, dy]);

  const encerrarFantasma = useCallback(
    (voltar: boolean, depois: () => void) => {
      if (!voltar || reduzir) {
        setFantasma(null);
        depois();
        return;
      }
      levarDeVolta(dx, dy);
      volta.current = setTimeout(() => {
        setFantasma(null);
        depois();
      }, VOLTA_MS);
    },
    [dx, dy, reduzir],
  );

  const voando = useAnimatedStyle(() => ({
    transform: [{ translateX: dx.value }, { translateY: dy.value }, { scale: 1.06 }],
  }));

  const valor = useMemo(
    () => ({ registrar, medir, zonaEm, sobre, setSobre, iniciarFantasma, moverFantasma, encerrarFantasma }),
    [registrar, medir, zonaEm, sobre, iniciarFantasma, moverFantasma, encerrarFantasma],
  );

  return (
    <ContextoDeArrastar.Provider value={valor}>
      <View ref={area} collapsable={false}>
        {children}
        {fantasma ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: fantasma.x,
                top: fantasma.y,
                width: fantasma.largura,
                height: fantasma.altura,
                zIndex: 1000,
                elevation: 8,
              },
              voando,
            ]}>
            {fantasma.conteudo}
          </Animated.View>
        ) : null}
      </View>
    </ContextoDeArrastar.Provider>
  );
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
 * Uma ficha que se arrasta. Ao soltar numa zona, chama `onSoltar` com ela (ou null, fora de
 * qualquer zona); a tela decide para onde a ficha vai de verdade. Solta fora de uma zona,
 * a ficha volta ao lugar com uma mola. Um arraste cancelado (a rolagem tomou o gesto, uma
 * ligação chegou) nunca conta como soltura.
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
  const { medir, zonaEm, setSobre, iniciarFantasma, moverFantasma, encerrarFantasma } = useArrastar();
  const ref = useRef<ViewInstance>(null);
  const escondida = useSharedValue(0);
  const ultimaZona = useRef<string | null>(null);

  const pan = usePanGesture({
    runOnJS: true,
    enabled: !desabilitado,
    minDistance: 6,
    // Mede as zonas assim que o dedo encosta, antes de o arraste começar: as medidas já
    // estão prontas no primeiro movimento, mesmo se a tela rolou desde o último arraste.
    onBegin: () => {
      void medir();
    },
    onActivate: () => {
      ultimaZona.current = null;
      haptico.selecao();
      iniciarFantasma(children, ref.current);
      escondida.value = 1;
    },
    onUpdate: (e) => {
      moverFantasma(e.translationX, e.translationY);
      const z = zonaEm(e.absoluteX, e.absoluteY);
      if (z !== ultimaZona.current) {
        ultimaZona.current = z;
        setSobre(z);
      }
    },
    onDeactivate: (e) => {
      setSobre(null);
      const z = e.canceled ? null : zonaEm(e.absoluteX, e.absoluteY);
      // Numa zona, a tela já desenha a ficha no destino; fora dela (ou cancelado), ela volta.
      encerrarFantasma(z === null, () => {
        escondida.value = 0;
      });
      if (!e.canceled) onSoltar(z);
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

  const animado = useAnimatedStyle(() => ({ opacity: escondida.value ? 0 : 1 }));

  return (
    <GestureDetector gesture={gesto}>
      <Animated.View
        ref={ref}
        collapsable={false}
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
