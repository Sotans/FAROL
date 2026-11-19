import type { ModoResposta, Questao } from '@/licao/tipos';

/**
 * Criadores de questão: a forma curta de escrever conteúdo, usada nos módulos em código
 * e na conversão dos rascunhos em JSON (rascunho.ts). Eles aplicam os padrões do modelo
 * pedagógico, como o modo de resposta conforme o nível.
 */

export type Comum = {
  nivel: Questao['nivel'];
  enunciado: string;
  explicacao: string;
  dica: string;
  armadilha?: string;
  /** Onde conferir a regra (lei, gramática), para a revisão. */
  fonte?: string;
  /** Padrão: imediato até o nível 2, com confirmação do nível 3 em diante (docs/11, modos de resposta). */
  modo?: ModoResposta;
};

export const modoPadrao = (nivel: Questao['nivel']): ModoResposta => (nivel <= 2 ? 'imediato' : 'confirmar');

export function certoErrado(id: string, c: Comum & { certo: boolean }): Questao {
  const { certo, modo, enunciado, ...resto } = c;
  return {
    id,
    tipo: 'certoErrado',
    modo: modo ?? modoPadrao(c.nivel),
    enunciado: `Certo ou errado? ${enunciado}`,
    opcoes: ['Certo', 'Errado'],
    correta: certo ? 0 : 1,
    ...resto,
  };
}

export function escolha(id: string, c: Comum & { opcoes: string[]; correta: number }): Questao {
  const { modo, ...resto } = c;
  return { id, tipo: 'multipla', modo: modo ?? modoPadrao(c.nivel), ...resto };
}

export function completar(id: string, c: Comum & { opcoes: string[]; correta: number }): Questao {
  const { modo, ...resto } = c;
  return { id, tipo: 'completar', modo: modo ?? modoPadrao(c.nivel), ...resto };
}

/** A frase vem em trechos; `erro` é o índice do trecho errado. */
export function identificar(id: string, c: Comum & { trechos: string[]; erro: number }): Questao {
  const { trechos, erro, modo, ...resto } = c;
  return { id, tipo: 'identificarErro', modo: modo ?? modoPadrao(c.nivel), opcoes: trechos, correta: erro, ...resto };
}

/** `itens` na ordem correta; a tela embaralha. Sempre com confirmação. */
export function ordenar(id: string, c: Omit<Comum, 'modo'> & { itens: string[] }): Questao {
  return { id, tipo: 'ordenar', modo: 'confirmar', ...c };
}

/** Cada par confere na hora: não há botão de confirmar. */
export function pares(id: string, c: Omit<Comum, 'modo'> & { pares: [string, string][] }): Questao {
  return { id, tipo: 'ligarPares', modo: 'imediato', ...c };
}
