import { useIsFocused } from 'expo-router';
import { useEffect, useRef } from 'react';

/**
 * O último valor que a pessoa VIU de cada indicador (sequência, meta...). Fica fora dos
 * componentes para sobreviver à troca de tela: a lição termina com a trilha escondida, e a
 * animação só deve tocar quando a trilha volta a aparecer.
 */
const vistos = new Map<string, number>();

/**
 * Chama `aoMudar(anterior)` quando a tela está em foco e o valor é diferente do último visto.
 * Na primeira vez (nada visto ainda), só guarda o valor: abrir o app não é uma conquista.
 */
export function useMudancaVista(chave: string, valor: number, aoMudar: (anterior: number) => void) {
  const focado = useIsFocused();
  const callback = useRef(aoMudar);
  useEffect(() => {
    callback.current = aoMudar;
  });
  useEffect(() => {
    if (!focado) return;
    const anterior = registrarVisto(chave, valor);
    if (anterior !== undefined) callback.current(anterior);
  }, [chave, valor, focado]);
}

/**
 * Marca `valor` como visto e devolve o anterior, se ele mudou. Na primeira vez, ou sem
 * mudança, devolve undefined: não há nada a animar.
 */
export function registrarVisto(chave: string, valor: number): number | undefined {
  const anterior = vistos.get(chave);
  vistos.set(chave, valor);
  return anterior !== undefined && anterior !== valor ? anterior : undefined;
}

/** Último valor visto, sem marcar o atual como visto (para desenhar o ponto de partida). */
export function valorVisto(chave: string): number | undefined {
  return vistos.get(chave);
}

/** Esquece tudo: o progresso recomeçou (reiniciar, sair da conta). Também usado nos testes. */
export function esquecerVistos() {
  vistos.clear();
}
