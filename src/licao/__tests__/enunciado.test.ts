import { quebrarEnunciado } from '../enunciado';

describe('quebrarEnunciado', () => {
  it.each([
    [
      'Certo ou errado? O vocativo, termo usado para chamar alguém, é separado por vírgula.',
      'Certo ou errado?\nO vocativo, termo usado para chamar alguém, é separado por vírgula.',
    ],
    ['Complete: Fui ___ farmácia.', 'Complete:\nFui ___ farmácia.'],
    ['Complete com a pontuação: Maria ___ venha cá.', 'Complete com a pontuação:\nMaria ___ venha cá.'],
    ['E esta? Vou à pé.', 'E esta?\nVou à pé.'],
  ])('põe a instrução na primeira linha: %p', (entrada, esperado) => {
    expect(quebrarEnunciado(entrada)).toBe(esperado);
  });

  it.each([
    'Em qual frase a crase está correta?',
    'Qual está correta?',
    'Em "Os alunos chegaram cedo", qual é o sujeito?',
    'Toque no trecho com erro.',
    'Qual é o verbo da frase "Os alunos chegaram cedo"? Escolha uma opção.',
  ])('não quebra uma pergunta inteira ou uma frase sem instrução: %p', (entrada) => {
    expect(quebrarEnunciado(entrada)).toBe(entrada);
  });

  it('não quebra quando a instrução é longa demais para ser só uma instrução', () => {
    const longo = 'Leia com atenção a frase seguinte e responda com cuidado: Fui à feira.';
    expect(quebrarEnunciado(longo)).toBe(longo);
  });
});
