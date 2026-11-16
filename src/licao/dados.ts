import type { Questao } from './tipos';

// CONTEÚDO DE DEMONSTRAÇÃO, não revisado por professor.
// Serve só para testar a mecânica do protótipo (ver docs/04-estrategia-de-conteudo.md).

export const nomeDoModulo = 'Crase';
export const totalDePartes = 6;

export const partes = [
  'O teste do "ao"',
  'Palavras masculinas',
  'Locuções com crase',
  'Horas e datas',
  'Pronomes',
  'Casos facultativos',
];

/** Lição de boas-vindas: curta e fácil, com acertos garantidos no início (jornada, etapa 3). */
const idsDeBoasVindas = ['q1', 'q2', 'q4', 'q5', 'q8'];

export function questoesDeBoasVindas(): Questao[] {
  return idsDeBoasVindas.flatMap((id) => {
    const q = questoesDeDemonstracao.find((x) => x.id === id);
    return q ? [q] : [];
  });
}

export const questoesDeDemonstracao: Questao[] = [
  {
    id: 'q1',
    tipo: 'certoErrado',
    modo: 'imediato',
    nivel: 1,
    enunciado: 'Certo ou errado? Na frase "Os alunos chegaram cedo", o verbo é "chegaram".',
    opcoes: ['Certo', 'Errado'],
    correta: 0,
    explicacao: 'O verbo indica a ação da frase: chegaram.',
    dica: 'Procure a palavra que indica ação.',
  },
  {
    id: 'q2',
    tipo: 'multipla',
    modo: 'imediato',
    nivel: 1,
    enunciado: 'Em "Maria comprou um livro", qual palavra é o verbo?',
    opcoes: ['Maria', 'comprou', 'livro'],
    correta: 1,
    explicacao: 'Comprou indica a ação praticada por Maria.',
    dica: 'Pergunte: o que Maria fez?',
  },
  {
    id: 'q3',
    tipo: 'multipla',
    modo: 'confirmar',
    nivel: 2,
    enunciado: 'Em qual frase a crase está correta?',
    opcoes: ['Fui à escola ontem.', 'Fui à pé até lá.', 'Vou à comprar pão.'],
    correta: 0,
    explicacao: 'Fui a + a escola: há crase. Antes de "pé" (masculino) e de verbo não há crase.',
    dica: 'Troque a palavra feminina por uma masculina: "fui ao colégio".',
  },
  {
    id: 'q4',
    tipo: 'certoErrado',
    modo: 'imediato',
    nivel: 2,
    enunciado: 'Certo ou errado? "Entreguei o documento à diretora."',
    opcoes: ['Certo', 'Errado'],
    correta: 0,
    explicacao: 'Entreguei ao diretor: apareceu "ao", então há crase com a palavra feminina.',
    dica: 'Aplique o teste do "ao" trocando por uma palavra masculina.',
  },
  {
    id: 'q5',
    tipo: 'completar',
    modo: 'imediato',
    nivel: 2,
    enunciado: 'Complete: Fui ___ biblioteca.',
    opcoes: ['a', 'à', 'as'],
    correta: 1,
    explicacao: 'Fui a + a biblioteca. Biblioteca é feminina, e "fui ao museu" confirma o teste.',
    dica: 'Quem vai, vai "a" algum lugar. Há artigo "a" antes de "biblioteca"?',
  },
  {
    id: 'q6',
    tipo: 'certoErrado',
    modo: 'confirmar',
    nivel: 3,
    enunciado: 'Certo ou errado? "Ela chegou à tempo para a reunião."',
    opcoes: ['Certo', 'Errado'],
    correta: 1,
    explicacao: '"Tempo" é masculino, então não há crase: "chegou a tempo".',
    dica: 'Tempo é uma palavra masculina ou feminina?',
    armadilha: 'expressões com palavra masculina (a pé, a cavalo, a tempo) não têm crase.',
  },
  {
    id: 'q7',
    tipo: 'multipla',
    modo: 'confirmar',
    nivel: 3,
    enunciado: 'Em qual frase o uso da crase está INCORRETO?',
    opcoes: ['Voltei à escola.', 'Vou à pé para o trabalho.', 'Fui à praia ontem.'],
    correta: 1,
    explicacao: '"Pé" é masculino: o correto é "vou a pé".',
    dica: 'Procure a frase com palavra masculina depois do "a".',
    armadilha: 'expressões com palavra masculina (a pé, a cavalo, a tempo) não têm crase.',
  },
  {
    id: 'q8',
    tipo: 'certoErrado',
    modo: 'imediato',
    nivel: 2,
    enunciado: 'Certo ou errado? Em "Começou a chover", não há crase.',
    opcoes: ['Certo', 'Errado'],
    correta: 0,
    explicacao: 'Antes de verbo no infinitivo não há crase.',
    dica: 'Chover é um verbo ou uma palavra feminina?',
  },
  {
    id: 'q9',
    tipo: 'completar',
    modo: 'confirmar',
    nivel: 4,
    enunciado: 'Complete: Assisti ___ aula de ontem.',
    opcoes: ['a', 'à', 'as'],
    correta: 1,
    explicacao: 'Quem assiste, assiste a algo, e "aula" tem artigo: assisti a + a aula = à aula.',
    dica: 'Troque por uma palavra masculina: "assisti ao filme".',
  },
  {
    id: 'q10',
    tipo: 'multipla',
    modo: 'confirmar',
    nivel: 3,
    enunciado: 'Escolha a frase correta.',
    opcoes: ['Falei à todos.', 'Falei a todos.', 'Falei às todos.'],
    correta: 1,
    explicacao: '"Todos" é masculino plural: não há crase.',
    dica: 'Há artigo feminino antes de "todos"?',
  },
];
