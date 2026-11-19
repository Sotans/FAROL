/** Tipos de exercício do MVP (docs/10-modelo-pedagogico.md, seção 4; submeta 3.3). */
export type TipoDeEscolha = 'multipla' | 'certoErrado' | 'completar' | 'identificarErro';
export type TipoQuestao = TipoDeEscolha | 'ordenar' | 'ligarPares';

/** imediato: o toque já confere. confirmar: a pessoa escolhe e toca em CONFIRMAR. */
export type ModoResposta = 'imediato' | 'confirmar';

type Base = {
  id: string;
  modo: ModoResposta;
  nivel: 1 | 2 | 3 | 4 | 5;
  enunciado: string;
  explicacao: string;
  dica: string;
  armadilha?: string;
  repetida?: boolean;
  /** Rótulo de origem quando a questão vem de outra parte, como "Revisão · Pronomes". */
  origem?: string;
};

/**
 * A pessoa escolhe uma opção. Em "identificarErro", as opções são os trechos de uma frase,
 * mostrados em sequência, e a correta é o trecho que tem o erro.
 */
export type QuestaoDeEscolha = Base & {
  tipo: TipoDeEscolha;
  opcoes: string[];
  correta: number;
};

/** A pessoa monta a sequência tocando nos blocos. `itens` vem na ordem correta; a tela embaralha. */
export type QuestaoDeOrdenar = Base & {
  tipo: 'ordenar';
  itens: string[];
};

/** A pessoa liga cada item da esquerda ao seu par da direita. Cada par confere na hora. */
export type QuestaoDePares = Base & {
  tipo: 'ligarPares';
  pares: [string, string][];
};

export type Questao = QuestaoDeEscolha | QuestaoDeOrdenar | QuestaoDePares;

export function ehDeEscolha(q: Questao): q is QuestaoDeEscolha {
  return q.tipo !== 'ordenar' && q.tipo !== 'ligarPares';
}

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
  identificarErro: 'Identifique o erro',
  ordenar: 'Ordenar',
  ligarPares: 'Ligar pares',
};
