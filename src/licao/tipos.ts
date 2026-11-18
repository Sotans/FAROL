export type TipoQuestao = 'multipla' | 'certoErrado' | 'completar';

/** imediato: o toque já confere. confirmar: a pessoa escolhe e toca em CONFIRMAR. */
export type ModoResposta = 'imediato' | 'confirmar';

export type Questao = {
  id: string;
  tipo: TipoQuestao;
  modo: ModoResposta;
  nivel: 1 | 2 | 3 | 4 | 5;
  enunciado: string;
  opcoes: string[];
  correta: number;
  explicacao: string;
  dica: string;
  armadilha?: string;
  repetida?: boolean;
  /** Rótulo de origem quando a questão vem de outra parte, como "Revisão · Pronomes". */
  origem?: string;
};

/**
 * Experimento de erro (ver docs/13-experimentos.md):
 * - tentar-de-novo: o 1º erro deixa tentar de novo;
 * - pular-para-o-fim: o erro mostra a resposta, segue para a próxima e a questão volta no final.
 */
export type ModoDeErro = 'tentar-de-novo' | 'pular-para-o-fim';

export const rotuloModoDeErro: Record<ModoDeErro, string> = {
  'tentar-de-novo': 'tentar de novo',
  'pular-para-o-fim': 'pular para o fim',
};

export const rotuloTipo: Record<TipoQuestao, string> = {
  multipla: 'Múltipla escolha',
  certoErrado: 'Certo ou errado',
  completar: 'Completar',
};
