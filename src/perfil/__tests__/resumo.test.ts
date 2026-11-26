import { trilhaDePortugues } from '@/conteudo/trilha';
import { totalDeNos } from '@/estado/modulos';
import { conquistas, faroisAcesos, formatarNumero } from '../resumo';

const [primeiro, segundo] = trilhaDePortugues;

describe('faroisAcesos', () => {
  it('conta os módulos com todos os nós concluídos', () => {
    const modulos = {
      [primeiro.id]: { concluidas: totalDeNos(primeiro), dominadas: [] },
      [segundo.id]: { concluidas: 1, dominadas: [] },
    };
    expect(faroisAcesos(trilhaDePortugues, modulos)).toBe(1);
  });
});

describe('conquistas', () => {
  it('no começo, nenhuma está alcançada', () => {
    const lista = conquistas({
      xp: 0,
      sequencia: 0,
      faroisAcesos: 0,
      modulos: {},
      trilha: trilhaDePortugues,
      fezOMapa: false,
    });
    expect(lista.every((c) => !c.alcancada)).toBe(true);
  });

  it('marca cada conquista pelo seu critério', () => {
    const lista = conquistas({
      xp: 1200,
      sequencia: 7,
      faroisAcesos: 1,
      modulos: { [primeiro.id]: { concluidas: 3, dominadas: [1] } },
      trilha: trilhaDePortugues,
      fezOMapa: true,
    });
    expect(lista.filter((c) => c.alcancada).map((c) => c.id)).toEqual([
      'primeira-licao',
      'mapa',
      'sequencia-7',
      'desafio',
      'farol',
      'xp-1000',
    ]);
  });
});

describe('formatarNumero', () => {
  it('separa os milhares com ponto', () => {
    expect(formatarNumero(0)).toBe('0');
    expect(formatarNumero(1240)).toBe('1.240');
    expect(formatarNumero(1234567)).toBe('1.234.567');
  });
});
