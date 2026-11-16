import type { Questao } from '@/licao/tipos';

// CONTEÚDO DE DEMONSTRAÇÃO, não revisado por professor (ver docs/04-estrategia-de-conteudo.md).

export type Materia = 'portugues' | 'constitucional';
export type Nivel = 'iniciante' | 'intermediario' | 'avancado';

export const rotuloMateria: Record<Materia, string> = {
  portugues: 'Português',
  constitucional: 'Direito Constitucional',
};
export const rotuloNivel: Record<Nivel, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
};

export type QuestaoDiagnostico = Questao & { materia: Materia; assunto: string };

/** 6 questões, 3 por matéria, em dificuldade crescente (jornada, etapa 3). */
export const questoesDoDiagnostico: QuestaoDiagnostico[] = [
  {
    id: 'd-pt-1',
    materia: 'portugues',
    assunto: 'Sujeito e verbo',
    tipo: 'certoErrado',
    modo: 'confirmar',
    nivel: 1,
    enunciado: 'Certo ou errado? Em "Os alunos chegaram cedo", o sujeito é "os alunos".',
    opcoes: ['Certo', 'Errado'],
    correta: 0,
    explicacao: '',
    dica: '',
  },
  {
    id: 'd-ct-1',
    materia: 'constitucional',
    assunto: 'A Constituição',
    tipo: 'certoErrado',
    modo: 'confirmar',
    nivel: 1,
    enunciado: 'Certo ou errado? A Constituição Federal de 1988 é a lei máxima do Brasil.',
    opcoes: ['Certo', 'Errado'],
    correta: 0,
    explicacao: '',
    dica: '',
  },
  {
    id: 'd-pt-2',
    materia: 'portugues',
    assunto: 'Crase',
    tipo: 'completar',
    modo: 'confirmar',
    nivel: 2,
    enunciado: 'Complete: Fui ___ feira.',
    opcoes: ['a', 'à', 'as'],
    correta: 1,
    explicacao: '',
    dica: '',
  },
  {
    id: 'd-ct-2',
    materia: 'constitucional',
    assunto: 'Poderes da União',
    tipo: 'multipla',
    modo: 'confirmar',
    nivel: 2,
    enunciado: 'Qual destes é um dos três Poderes da União?',
    opcoes: ['Legislativo', 'Ministério Público', 'Tribunal de Contas'],
    correta: 0,
    explicacao: '',
    dica: '',
  },
  {
    id: 'd-pt-3',
    materia: 'portugues',
    assunto: 'Crase: palavras masculinas',
    tipo: 'multipla',
    modo: 'confirmar',
    nivel: 3,
    enunciado: 'Qual frase está correta?',
    opcoes: ['Vou à pé.', 'Vou a pé.', 'Vou as pé.'],
    correta: 1,
    explicacao: '',
    dica: '',
  },
  {
    id: 'd-ct-3',
    materia: 'constitucional',
    assunto: 'Fundamentos da República',
    tipo: 'certoErrado',
    modo: 'confirmar',
    nivel: 3,
    enunciado:
      'Certo ou errado? A soberania, a cidadania e a dignidade da pessoa humana são fundamentos da República Federativa do Brasil.',
    opcoes: ['Certo', 'Errado'],
    correta: 0,
    explicacao: '',
    dica: '',
  },
];

/** escolhida === null significa "Ainda não vi isso". */
export type RespostaDoDiagnostico = { id: string; escolhida: number | null };

export type ResultadoDaMateria = {
  nivel: Nivel;
  acertos: number;
  total: number;
  /** De 0 a 1, para a barra. Nunca zero, para não parecer "nada". */
  fracao: number;
  pontoForte: string | null;
};

export type Mapa = Record<Materia, ResultadoDaMateria>;

const fracaoPorAcertos = [0.15, 0.35, 0.6, 0.9];

export function calcularMapa(respostas: RespostaDoDiagnostico[]): Mapa {
  const materias: Materia[] = ['portugues', 'constitucional'];
  const resultado = {} as Mapa;
  for (const materia of materias) {
    const questoes = questoesDoDiagnostico.filter((q) => q.materia === materia);
    let acertos = 0;
    let pontoForte: string | null = null;
    for (const q of questoes) {
      const r = respostas.find((x) => x.id === q.id);
      if (r && r.escolhida === q.correta) {
        acertos += 1;
        pontoForte = q.assunto; // a última acertada é a de maior nível
      }
    }
    const nivel: Nivel = acertos >= 3 ? 'avancado' : acertos === 2 ? 'intermediario' : 'iniciante';
    resultado[materia] = {
      nivel,
      acertos,
      total: questoes.length,
      fracao: fracaoPorAcertos[acertos] ?? 0.15,
      pontoForte,
    };
  }
  return resultado;
}
