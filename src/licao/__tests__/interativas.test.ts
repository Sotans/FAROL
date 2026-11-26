import { questoesDeDemonstracao } from '@/conteudo/demonstracao';
import { regiaoDoPonto } from '@/componentes/questoes/Logica';
import { validarQuestoes } from '@/conteudo/validar';
import {
  arredondar,
  conferirInterativa,
  contarFormas,
  proximaMarca,
  respostaCerta,
  respostaCompleta,
  respostaInicial,
  type RespostaInterativa,
} from '../interativas';
import { ehDeEscolha, ehInterativa, type QuestaoInterativa } from '../tipos';

function questao<T extends QuestaoInterativa['tipo']>(tipo: T) {
  const q = questoesDeDemonstracao.find((x) => x.tipo === tipo);
  if (!q || !ehInterativa(q) || q.tipo !== tipo) throw new Error(`sem questão ${tipo}`);
  return q as Extract<QuestaoInterativa, { tipo: T }>;
}

/** A resposta certa de cada questão da demonstração. */
const certas: Record<QuestaoInterativa['tipo'], RespostaInterativa> = {
  regua: { tipo: 'regua', valor: 60 },
  proporcao: { tipo: 'proporcao', relacao: 'inversa', vagas: [4, 3, 12] },
  combinatoria: { tipo: 'combinatoria', n: 8, p: 3, ordemImporta: false },
  tabelaVerdade: { tipo: 'tabelaVerdade', valores: ['V', 'F', 'V', 'V'] },
  venn: { tipo: 'venn', regiao: 'soA' },
  montarFrase: { tipo: 'montarFrase', pecas: [1, 2, 4, 5] },
  associacao: {
    tipo: 'associacao',
    marcas: [
      ['nao', 'nao', 'sim'],
      ['sim', null, null],
      [null, 'sim', null],
    ],
  },
  certoErradoCorrige: { tipo: 'certoErradoCorrige', julgamento: 'errado', trecho: 2, correcao: 0 },
  classificar: { tipo: 'classificar', colunaDe: [0, 1, 0, 1] },
};

describe('questões interativas da demonstração', () => {
  it('a lição de demonstração tem os 12 tipos novos', () => {
    const tipos = new Set(questoesDeDemonstracao.map((q) => q.tipo));
    expect(tipos.size).toBe(12);
    expect(questoesDeDemonstracao.filter(ehInterativa)).toHaveLength(9);
    expect(questoesDeDemonstracao.filter(ehDeEscolha)).toHaveLength(3);
  });

  it.each(Object.keys(certas) as QuestaoInterativa['tipo'][])(
    '%s: a resposta certa confere e está completa',
    (tipo) => {
      const q = questao(tipo);
      expect(respostaCompleta(q, certas[tipo])).toBe(true);
      expect(conferirInterativa(q, certas[tipo])).toBe(true);
    },
  );

  it.each(Object.keys(certas) as QuestaoInterativa['tipo'][])('%s: a resposta inicial não confere', (tipo) => {
    const q = questao(tipo);
    expect(conferirInterativa(q, respostaInicial(q))).toBe(false);
  });

  it('régua: o Confirmar só acende depois que a pessoa mexe', () => {
    const q = questao('regua');
    expect(respostaCompleta(q, respostaInicial(q), false)).toBe(false);
    expect(respostaCompleta(q, respostaInicial(q), true)).toBe(true);
  });

  it('régua: arredonda para o passo e respeita os limites', () => {
    const q = { min: 0, max: 100, passo: 5 };
    expect(arredondar(q, 61)).toBe(60);
    expect(arredondar(q, 63)).toBe(65);
    expect(arredondar(q, -10)).toBe(0);
    expect(arredondar(q, 140)).toBe(100);
  });

  it('proporção: a relação errada não confere, mesmo com os números certos', () => {
    const q = questao('proporcao');
    expect(conferirInterativa(q, { tipo: 'proporcao', relacao: 'direta', vagas: [3, 4, 12] })).toBe(false);
    expect(respostaCompleta(q, { tipo: 'proporcao', relacao: 'inversa', vagas: [3, null, 12] })).toBe(false);
  });

  it('combinatória: arranjo e combinação', () => {
    expect(contarFormas(8, 3, false)).toBe(56);
    expect(contarFormas(8, 3, true)).toBe(336);
    expect(contarFormas(3, 5, false)).toBe(0);
    const q = questao('combinatoria');
    expect(conferirInterativa(q, { tipo: 'combinatoria', n: 8, p: 3, ordemImporta: true })).toBe(false);
  });

  it('montar frase: "Nenhum" no lugar de "Algum" não confere', () => {
    const q = questao('montarFrase');
    expect(conferirInterativa(q, { tipo: 'montarFrase', pecas: [0, 2, 3, 5] })).toBe(false);
  });

  it('associação: duas marcas ✓ na mesma linha não completam', () => {
    const q = questao('associacao');
    const marcas = certas.associacao.tipo === 'associacao' ? certas.associacao.marcas.map((l) => [...l]) : [];
    marcas[1][1] = 'sim';
    expect(respostaCompleta(q, { tipo: 'associacao', marcas })).toBe(false);
    expect(proximaMarca(null)).toBe('sim');
    expect(proximaMarca('sim')).toBe('nao');
    expect(proximaMarca('nao')).toBeNull();
  });

  it('certo, errado e corrige: "certo" numa frase errada não confere; o trecho errado também não', () => {
    const q = questao('certoErradoCorrige');
    expect(respostaCompleta(q, { tipo: 'certoErradoCorrige', julgamento: 'certo', trecho: null, correcao: null })).toBe(
      true,
    );
    expect(
      conferirInterativa(q, { tipo: 'certoErradoCorrige', julgamento: 'certo', trecho: null, correcao: null }),
    ).toBe(false);
    expect(conferirInterativa(q, { tipo: 'certoErradoCorrige', julgamento: 'errado', trecho: 1, correcao: 0 })).toBe(
      false,
    );
  });

  it('a resposta de outro tipo nunca confere', () => {
    expect(conferirInterativa(questao('venn'), certas.regua)).toBe(false);
    expect(respostaCompleta(questao('venn'), certas.regua)).toBe(false);
  });
});

describe('respostaCerta', () => {
  it.each(Object.keys(certas) as QuestaoInterativa['tipo'][])('%s: a solução mostrada confere', (tipo) => {
    const q = questao(tipo);
    const r = respostaCerta(q);
    expect(respostaCompleta(q, r)).toBe(true);
    expect(conferirInterativa(q, r)).toBe(true);
  });
});

describe('validação das questões novas', () => {
  it('a lição de demonstração passa nas regras de conteúdo', () => {
    expect(validarQuestoes(questoesDeDemonstracao)).toEqual([]);
  });

  it('acusa uma régua cuja resposta não cai no passo', () => {
    const q = { ...questao('regua'), correta: 62 };
    expect(validarQuestoes([q]).join()).toMatch(/não cai num ponto da régua/);
  });

  it('acusa uma frase certa com peça que não existe', () => {
    const q = { ...questao('montarFrase'), correta: ['Todo', 'servidor'] };
    expect(validarQuestoes([q]).join()).toMatch(/"Todo"/);
  });
});

describe('regiaoDoPonto (diagrama de Venn)', () => {
  it('acha a região pela posição do toque', () => {
    expect(regiaoDoPonto(70, 95)).toBe('soA');
    expect(regiaoDoPonto(150, 95)).toBe('ambos');
    expect(regiaoDoPonto(230, 95)).toBe('soB');
    expect(regiaoDoPonto(150, 5)).toBeNull();
  });
});
