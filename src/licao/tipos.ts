/** Tipos de exercício do MVP (docs/10-modelo-pedagogico.md, seção 4; submeta 3.3). */
export type TipoDeEscolha =
  | 'multipla'
  | 'certoErrado'
  | 'completar'
  | 'identificarErro'
  /** Uma situação curta (`contexto`) e a pergunta "o que se aplica?". */
  | 'casoConcreto'
  /** O texto da lei (`texto`, com "___" na lacuna) e as palavras que a banca troca. */
  | 'lacunaLei'
  /** A resolução montada (`passos`, um deles com "___") e as opções para o passo que falta. */
  | 'passoAPasso';

/** Questões em que a pessoa monta a resposta mexendo na tela (arrastar, encaixar, ajustar). */
export type TipoInterativo =
  | 'regua'
  | 'proporcao'
  | 'combinatoria'
  | 'tabelaVerdade'
  | 'venn'
  | 'montarFrase'
  | 'associacao'
  | 'certoErradoCorrige'
  | 'classificar';

export type TipoQuestao = TipoDeEscolha | 'ordenar' | 'ligarPares' | TipoInterativo;

/**
 * Nível de pressão pensado para a questão (docs/11, modos de resposta). Hoje as telas
 * conferem toda escolha no Confirmar: o toque só seleciona, como pede o protótipo novo.
 */
export type ModoResposta = 'imediato' | 'confirmar';

type Base = {
  id: string;
  modo: ModoResposta;
  nivel: 1 | 2 | 3 | 4 | 5;
  enunciado: string;
  explicacao: string;
  dica: string;
  armadilha?: string;
  /** Onde conferir a regra (lei, gramática). Usado na revisão do conteúdo. */
  fonte?: string;
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
  /** Caso concreto: a situação, em 2 ou 3 linhas. */
  contexto?: string;
  /** Lacuna na lei: o texto, com "___" onde entra a opção escolhida. */
  texto?: string;
  /** Passo a passo: a resolução, com "___" no passo que falta. */
  passos?: string[];
  /** Passo a passo: a linha final para cada opção (o total muda com o passo escolhido). */
  resultados?: string[];
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

/** Arrastar o marcador numa régua até o valor. */
export type QuestaoDeRegua = Base & {
  tipo: 'regua';
  min: number;
  max: number;
  passo: number;
  correta: number;
  /** Onde o marcador começa (padrão: o meio da régua). */
  inicial?: number;
  prefixo?: string;
  sufixo?: string;
};

/** Escolher direta ou inversa e arrastar os números para as vagas de a/b = c/x. */
export type QuestaoDeProporcao = Base & {
  tipo: 'proporcao';
  fichas: number[];
  relacao: 'direta' | 'inversa';
  /** Montagens aceitas para [a, b, c] (a ordem dentro da fração pode variar). */
  montagens: [number, number, number][];
  /** Como ler a proporção, por exemplo "Servidores à esquerda, horas à direita". */
  legenda?: string;
};

/** Ajustar n e p e dizer se a ordem importa: a conta de arranjo ou combinação se monta sozinha. */
export type QuestaoDeCombinatoria = Base & {
  tipo: 'combinatoria';
  n: number;
  p: number;
  ordemImporta: boolean;
};

export type ValorLogico = 'V' | 'F';

/** Completar a última coluna da tabela-verdade. */
export type QuestaoDeTabelaVerdade = Base & {
  tipo: 'tabelaVerdade';
  /** Cabeçalhos: as proposições e, por último, a expressão a completar. */
  colunas: string[];
  /** Valores das proposições em cada linha. */
  linhas: ValorLogico[][];
  /** O valor da expressão em cada linha. */
  resultado: ValorLogico[];
};

export type RegiaoDeVenn = 'soA' | 'ambos' | 'soB';

/** Tocar na região do diagrama de dois conjuntos. */
export type QuestaoDeVenn = Base & {
  tipo: 'venn';
  conjuntos: [string, string];
  correta: RegiaoDeVenn;
};

/** Arrastar blocos (com alguns que sobram) para montar a frase. */
export type QuestaoDeMontarFrase = Base & {
  tipo: 'montarFrase';
  pecas: string[];
  /** A frase certa, como lista de peças. */
  correta: string[];
};

/** A grade de "quem é quem": marcar ✓ e ✗ a partir das pistas. */
export type QuestaoDeAssociacao = Base & {
  tipo: 'associacao';
  linhas: string[];
  colunas: string[];
  pistas: string[];
  /** Para cada linha, o índice da coluna certa. */
  correta: number[];
};

/** Certo ou errado e, se errado, achar o trecho e escolher a correção (estilo Cebraspe, um passo a mais). */
export type QuestaoDeCorrigir = Base & {
  tipo: 'certoErradoCorrige';
  trechos: string[];
  /** O trecho errado; null quando a frase está certa. */
  errado: number | null;
  correcoes: string[];
  /** A correção certa (índice de `correcoes`). */
  correcao: number;
};

/** Arrastar cada item para uma de duas colunas. */
export type QuestaoDeClassificar = Base & {
  tipo: 'classificar';
  colunas: [string, string];
  itens: { texto: string; coluna: 0 | 1 }[];
};

export type QuestaoInterativa =
  | QuestaoDeRegua
  | QuestaoDeProporcao
  | QuestaoDeCombinatoria
  | QuestaoDeTabelaVerdade
  | QuestaoDeVenn
  | QuestaoDeMontarFrase
  | QuestaoDeAssociacao
  | QuestaoDeCorrigir
  | QuestaoDeClassificar;

export type Questao = QuestaoDeEscolha | QuestaoDeOrdenar | QuestaoDePares | QuestaoInterativa;

const TIPOS_INTERATIVOS: ReadonlySet<TipoQuestao> = new Set<TipoInterativo>([
  'regua',
  'proporcao',
  'combinatoria',
  'tabelaVerdade',
  'venn',
  'montarFrase',
  'associacao',
  'certoErradoCorrige',
  'classificar',
]);

export function ehInterativa(q: Questao): q is QuestaoInterativa {
  return TIPOS_INTERATIVOS.has(q.tipo);
}

export function ehDeEscolha(q: Questao): q is QuestaoDeEscolha {
  return q.tipo !== 'ordenar' && q.tipo !== 'ligarPares' && !ehInterativa(q);
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
  casoConcreto: 'Caso concreto',
  lacunaLei: 'Lacuna na lei',
  passoAPasso: 'Passo a passo',
  regua: 'Arrastar na régua',
  proporcao: 'Montar a proporção',
  combinatoria: 'Montar os parâmetros',
  tabelaVerdade: 'Tabela-verdade',
  venn: 'Tocar no diagrama',
  montarFrase: 'Montar a frase',
  associacao: 'Grade de associação',
  certoErradoCorrige: 'Certo, errado e corrige',
  classificar: 'Classificar',
};
