import type { CartaoSalvo, Revisoes } from '@/revisao/agenda';
import type { Estado } from './progresso';

/**
 * Combina o progresso do aparelho com o da nuvem, ao abrir o app (submeta 3.5).
 * Regra: nunca perder avanço. O que é conquista acumulada fica com o maior valor dos dois
 * (trilha, XP, partes dominadas, revisão mais recente de cada questão); o que descreve o
 * "agora" (o dia, a meta, a sequência, as escolhas da pessoa) vem da versão mais recente.
 */
export function mesclar(local: Estado, remoto: Estado | null): Estado {
  if (!remoto) return local;
  const localMaisNovo = (local.atualizadoEm ?? '') >= (remoto.atualizadoEm ?? '');
  const recente = localMaisNovo ? local : remoto;
  const outro = localMaisNovo ? remoto : local;

  const concluidas = Math.max(local.concluidas, remoto.concluidas);
  return {
    ...recente,
    onboardingConcluido: local.onboardingConcluido || remoto.onboardingConcluido,
    carreira: recente.carreira ?? outro.carreira,
    mapa: recente.mapa ?? outro.mapa,
    concluidas,
    dominadas: [...new Set([...local.dominadas, ...remoto.dominadas])]
      .filter((i) => i < concluidas)
      .sort((a, b) => a - b),
    xp: Math.max(local.xp, remoto.xp),
    revisoes: mesclarRevisoes(local.revisoes, remoto.revisoes),
    toquesEmBreve: maiorPorChave(local.toquesEmBreve, remoto.toquesEmBreve),
  };
}

/** Quando foi a última revisão do cartão (ou, se nunca revisado, a criação). */
function momento(c: CartaoSalvo): string {
  return c.lastReviewAt ?? c.dueAt;
}

function mesclarRevisoes(a: Revisoes, b: Revisoes): Revisoes {
  const juntas: Revisoes = { ...a };
  for (const [id, cartao] of Object.entries(b)) {
    const existente = juntas[id];
    if (!existente || momento(cartao) > momento(existente)) juntas[id] = cartao;
  }
  return juntas;
}

function maiorPorChave<K extends string>(
  a: Partial<Record<K, number>>,
  b: Partial<Record<K, number>>,
): Partial<Record<K, number>> {
  const juntas: Partial<Record<K, number>> = { ...a };
  for (const [chave, valor] of Object.entries(b) as [K, number][]) {
    juntas[chave] = Math.max(juntas[chave] ?? 0, valor);
  }
  return juntas;
}
