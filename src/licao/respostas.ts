import { embaralhar } from './montar';
import type { QuestaoDeOrdenar, QuestaoDePares } from './tipos';

/**
 * Conferência e preparo dos exercícios compostos (ordenar e ligar pares).
 * Funções puras, para o motor da lição e o do desafio usarem a mesma regra, e para os testes.
 */

/** Semente estável a partir do id: a ordem embaralhada não muda entre renderizações nem ao voltar ao fim da lição. */
export function sementeDoId(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Índices de `itens` na ordem em que os blocos aparecem. Nunca já vem na ordem certa (com 2 ou mais itens). */
export function ordemDeExibicao(q: QuestaoDeOrdenar): number[] {
  const indices = q.itens.map((_, i) => i);
  if (indices.length < 2) return indices;
  const base = sementeDoId(q.id.replace(/-r$/, ''));
  for (let tentativa = 0; tentativa < 10; tentativa += 1) {
    const ordem = embaralhar(indices, base + tentativa);
    if (!ordemEstaCorreta(q, ordem)) return ordem;
  }
  return [...indices].reverse();
}

/** A sequência montada (índices de `itens`) está certa? Itens repetidos valem pelo texto. */
export function ordemEstaCorreta(q: QuestaoDeOrdenar, sequencia: readonly number[]): boolean {
  if (sequencia.length !== q.itens.length) return false;
  return sequencia.every((indice, posicao) => q.itens[indice] === q.itens[posicao]);
}

/** Ordem da coluna da direita. A esquerda fica na ordem de autoria; a direita é embaralhada. */
export function colunaDaDireita(q: QuestaoDePares): number[] {
  const indices = q.pares.map((_, i) => i);
  if (indices.length < 2) return indices;
  const ordem = embaralhar(indices, sementeDoId(q.id.replace(/-r$/, '')));
  // Evita que todos os pares fiquem lado a lado, o que tiraria o sentido do exercício.
  return ordem.every((v, i) => v === i) ? [...indices.slice(1), indices[0]] : ordem;
}

/** O item `esquerda` e o item `direita` (ambos índices de `pares`) formam um par? */
export function parEstaCorreto(q: QuestaoDePares, esquerda: number, direita: number): boolean {
  return q.pares[esquerda]?.[1] === q.pares[direita]?.[1];
}
