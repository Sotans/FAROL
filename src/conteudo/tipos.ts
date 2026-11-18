import type { Questao } from '@/licao/tipos';

/**
 * Modelo do conteúdo (docs/10-modelo-pedagogico.md, seção 2):
 * Matéria → Módulo (um tema do edital) → Partes (uma nuance cada) → Farol do módulo.
 * É o mesmo formato que o backend vai guardar na Meta 2.
 */
export type Parte = {
  /** Estável: usado nos ids das questões e, no futuro, no progresso salvo. */
  id: string;
  nome: string;
  questoes: Questao[];
};

export type Modulo = {
  id: string;
  materia: 'portugues' | 'constitucional';
  nome: string;
  /**
   * Peso do tema nas provas da matéria (0 a 1). Define a ordem dos módulos na trilha e a
   * "cobertura do edital". Hipótese até o mapeamento das provas (docs/04, seção 3).
   */
  incidencia: number;
  /** De 3 a 8 partes: o número de nuances do tema, e não um número fixo. */
  partes: Parte[];
  /** Questões no estilo da banca, misturando todas as partes. Fecham o módulo e acendem o farol. */
  farol: Questao[];
};
