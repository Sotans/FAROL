import type { Modulo } from '@/conteudo/tipos';

/**
 * Progresso por módulo (cada módulo tem a sua trilha de partes e o seu farol).
 * Funções puras, usadas pelo estado do app, pela combinação com a nuvem e pelos testes.
 */
export type ProgressoDoModulo = {
  /** Nós concluídos em sequência. Igual ao número de partes: o farol é o atual. Igual ao total de nós: farol aceso. */
  concluidas: number;
  /** Partes marcadas como dominadas pelo desafio "Pular pra cá?". */
  dominadas: number[];
};

export type ProgressoDosModulos = Record<string, ProgressoDoModulo>;

const vazio: ProgressoDoModulo = { concluidas: 0, dominadas: [] };

export function progressoDe(modulos: ProgressoDosModulos, id: string): ProgressoDoModulo {
  return modulos[id] ?? vazio;
}

/** Partes mais o farol. */
export function totalDeNos(m: Modulo): number {
  return m.partes.length + 1;
}

export function farolAceso(modulos: ProgressoDosModulos, m: Modulo): boolean {
  return progressoDe(modulos, m.id).concluidas >= totalDeNos(m);
}

/**
 * Um módulo está liberado se é o primeiro da trilha, se o farol do anterior já acendeu, ou se a pessoa
 * já tem progresso nele (por exemplo, quem estudou Crase antes de a Vírgula entrar na trilha).
 */
export function moduloLiberado(trilha: readonly Modulo[], modulos: ProgressoDosModulos, indice: number): boolean {
  if (indice <= 0) return true;
  if (progressoDe(modulos, trilha[indice].id).concluidas > 0) return true;
  return farolAceso(modulos, trilha[indice - 1]);
}

export function proximoModulo(trilha: readonly Modulo[], id: string): Modulo | null {
  const i = trilha.findIndex((m) => m.id === id);
  return i >= 0 && i + 1 < trilha.length ? trilha[i + 1] : null;
}

/** Combina dois registros de progresso sem perder avanço: maior trilha e soma das partes dominadas. */
export function mesclarModulos(a: ProgressoDosModulos, b: ProgressoDosModulos): ProgressoDosModulos {
  const juntos: ProgressoDosModulos = {};
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = progressoDe(a, id);
    const y = progressoDe(b, id);
    const concluidas = Math.max(x.concluidas, y.concluidas);
    juntos[id] = {
      concluidas,
      dominadas: [...new Set([...x.dominadas, ...y.dominadas])].filter((i) => i < concluidas).sort((p, q) => p - q),
    };
  }
  return juntos;
}

/**
 * Formato antigo (até 2026-11-23): um só módulo (Crase), com `concluidas` e `dominadas` na raiz.
 * Converte para o progresso por módulo, preservando o avanço em Crase, e abre o app no primeiro módulo.
 */
export function migrarProgresso<T extends Record<string, unknown>>(
  salvo: T,
  primeiroModulo: string,
): Omit<T, 'concluidas' | 'dominadas'> & { modulos: ProgressoDosModulos; moduloAtual: string } {
  const { concluidas, dominadas, ...resto } = salvo as T & { concluidas?: number; dominadas?: number[] };
  const modulos = { ...((resto as { modulos?: ProgressoDosModulos }).modulos ?? {}) };
  if (typeof concluidas === 'number' && concluidas > 0 && !modulos['pt-crase']) {
    modulos['pt-crase'] = { concluidas, dominadas: Array.isArray(dominadas) ? dominadas : [] };
  }
  const moduloAtual = (resto as { moduloAtual?: string }).moduloAtual ?? primeiroModulo;
  return { ...resto, modulos, moduloAtual };
}
