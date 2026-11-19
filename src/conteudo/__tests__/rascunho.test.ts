import { moduloCrase } from '@/conteudo/portugues/crase';
import { lerRascunho } from '@/conteudo/rascunho';
import { validarModulo } from '@/conteudo/validar';

const comum = (nivel: number) => ({ nivel, explicacao: 'Explicação curta.', dica: 'Uma dica.' });

/** Uma parte válida: 8 questões, 3 fáceis, 6 tipos. */
function parte(nome: string) {
  return {
    nome,
    nuance: 'Uma regra só.',
    questoes: [
      { tipo: 'certoErrado', ...comum(1), afirmacao: 'Frase a julgar.', certo: true },
      { tipo: 'completar', ...comum(1), enunciado: 'Complete: ___', opcoes: ['a', 'à'], correta: 1 },
      {
        tipo: 'ligarPares',
        ...comum(2),
        enunciado: 'Ligue.',
        pares: [
          ['a', '1'],
          ['b', '2'],
          ['c', '3'],
        ],
      },
      { tipo: 'multipla', ...comum(2), enunciado: 'Qual?', opcoes: ['x', 'y', 'z'], correta: 2 },
      { tipo: 'ordenar', ...comum(2), enunciado: 'Monte.', itens: ['Um', 'dois', 'três.'] },
      { tipo: 'identificarErro', ...comum(3), trechos: ['Isto', 'está', 'erado.'], erro: 2 },
      { tipo: 'certoErrado', ...comum(3), afirmacao: 'Outra frase.', certo: false },
      { tipo: 'multipla', ...comum(4), enunciado: 'E esta?', opcoes: ['x', 'y'], correta: 0 },
    ],
  };
}

const farol = Array.from({ length: 10 }, (_, i) => ({
  tipo: 'certoErrado',
  ...comum(3),
  afirmacao: `Item de prova ${i + 1}.`,
  certo: i % 2 === 0,
}));

const valido = {
  id: 'pt-teste',
  materia: 'portugues',
  nome: 'Teste',
  incidencia: 0.05,
  duvidas: [],
  partes: [parte('Um'), parte('Dois'), parte('Três')],
  farol,
};

describe('lerRascunho', () => {
  it('converte um rascunho válido, com ids e modos gerados', () => {
    const { modulo, problemas } = lerRascunho(valido);
    expect(problemas).toEqual([]);
    expect(modulo).not.toBeNull();
    expect(validarModulo(modulo!)).toEqual([]);
    const q = modulo!.partes[1].questoes[0];
    expect(q.id).toBe('pt-teste-p2-01');
    expect(q.enunciado).toBe('Certo ou errado? Frase a julgar.');
    expect(q.modo).toBe('imediato');
    expect(modulo!.farol[9].id).toBe('pt-teste-farol-10');
  });

  it('aponta o caminho exato do campo que falta', () => {
    const quebrado = structuredClone(valido);
    delete (quebrado.partes[0].questoes[3] as { correta?: number }).correta;
    const { modulo, problemas } = lerRascunho(quebrado);
    expect(modulo).toBeNull();
    expect(problemas).toEqual(['partes[0].questoes[3]: falta "correta" (posição da opção certa, começando em 0)']);
  });

  it('recusa tipo desconhecido e nível fora da escala', () => {
    const quebrado = structuredClone(valido);
    (quebrado.partes[0].questoes[0] as { tipo: string }).tipo = 'dissertativa';
    (quebrado.partes[1].questoes[0] as { nivel: number }).nivel = 9;
    const { problemas } = lerRascunho(quebrado);
    expect(problemas).toHaveLength(2);
    expect(problemas[0]).toContain('tipo "dissertativa" desconhecido');
    expect(problemas[1]).toContain('"nivel" deve ser um número inteiro de 1 a 5');
  });

  it('recusa o que não é rascunho', () => {
    expect(lerRascunho([]).problemas).toEqual(['o rascunho não é um objeto JSON']);
  });
});

describe('validarModulo', () => {
  it('Crase cumpre todas as regras', () => {
    expect(validarModulo(moduloCrase)).toEqual([]);
  });

  it('aponta resposta fora das opções, farol fácil e parte sem aquecimento', () => {
    const quebrado = structuredClone(valido);
    (quebrado.partes[0].questoes[3] as { correta: number }).correta = 7;
    quebrado.farol[0].nivel = 1;
    quebrado.partes[2].questoes.forEach((q) => (q.nivel = 4));
    const problemas = validarModulo(lerRascunho(quebrado).modulo!);
    expect(problemas.some((p) => p.includes('a resposta correta (7) não corresponde'))).toBe(true);
    expect(problemas.some((p) => p.includes('Farol, questão 1') && p.includes('nível 3'))).toBe(true);
    expect(problemas.some((p) => p.includes('Parte 3') && p.includes('aquecimento'))).toBe(true);
  });

  it('aponta módulo com partes demais', () => {
    const grande = { ...valido, partes: Array.from({ length: 9 }, (_, i) => parte(`P${i}`)) };
    expect(validarModulo(lerRascunho(grande).modulo!)).toContain('o módulo deve ter de 3 a 8 partes (tem 9)');
  });
});
