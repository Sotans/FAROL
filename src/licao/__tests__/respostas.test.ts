import { colunaDaDireita, ordemDeExibicao, ordemEstaCorreta, parEstaCorreto, sementeDoId } from '@/licao/respostas';
import type { QuestaoDeOrdenar, QuestaoDePares } from '@/licao/tipos';

const base = { modo: 'confirmar', nivel: 2, enunciado: '', explicacao: '', dica: '' } as const;

const ordenar = (id: string, itens: string[]): QuestaoDeOrdenar => ({ ...base, id, tipo: 'ordenar', itens });
const pares = (id: string, lista: [string, string][]): QuestaoDePares => ({
  ...base,
  id,
  tipo: 'ligarPares',
  pares: lista,
});

describe('ordenar', () => {
  const q = ordenar('t-ord', ['À medida que', 'estudo,', 'aprendo', 'mais.']);

  it('aceita só a sequência na ordem dos itens', () => {
    expect(ordemEstaCorreta(q, [0, 1, 2, 3])).toBe(true);
    expect(ordemEstaCorreta(q, [1, 0, 2, 3])).toBe(false);
  });

  it('não aceita a sequência incompleta', () => {
    expect(ordemEstaCorreta(q, [0, 1, 2])).toBe(false);
  });

  it('blocos com o mesmo texto valem por qualquer um deles', () => {
    const repetidos = ordenar('t-rep', ['a', 'b', 'a']);
    expect(ordemEstaCorreta(repetidos, [2, 1, 0])).toBe(true);
  });

  it('a ordem de exibição tem todos os blocos e nunca já vem resolvida', () => {
    for (let i = 0; i < 50; i += 1) {
      const qi = ordenar(`t-${i}`, ['um', 'dois', 'três']);
      const exibicao = ordemDeExibicao(qi);
      expect([...exibicao].sort()).toEqual([0, 1, 2]);
      expect(ordemEstaCorreta(qi, exibicao)).toBe(false);
    }
  });

  it('a questão que volta ao final da lição aparece na mesma ordem', () => {
    expect(ordemDeExibicao({ ...q, id: 't-ord-r' })).toEqual(ordemDeExibicao(q));
  });
});

describe('ligar pares', () => {
  const q = pares('t-par', [
    ['à farmácia', 'ao mercado'],
    ['à escola', 'ao colégio'],
    ['à praia', 'ao clube'],
  ]);

  it('confere cada par', () => {
    expect(parEstaCorreto(q, 0, 0)).toBe(true);
    expect(parEstaCorreto(q, 0, 1)).toBe(false);
  });

  it('a coluna da direita tem todos os itens e nunca fica toda alinhada', () => {
    for (let i = 0; i < 50; i += 1) {
      const qi = { ...q, id: `t-${i}` };
      const direita = colunaDaDireita(qi);
      expect([...direita].sort()).toEqual([0, 1, 2]);
      expect(direita.every((v, posicao) => v === posicao)).toBe(false);
    }
  });
});

describe('sementeDoId', () => {
  it('é estável e diferencia ids', () => {
    expect(sementeDoId('cr-p1-10')).toBe(sementeDoId('cr-p1-10'));
    expect(sementeDoId('cr-p1-10')).not.toBe(sementeDoId('cr-p1-11'));
  });
});
