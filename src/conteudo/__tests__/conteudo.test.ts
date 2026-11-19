import { moduloCrase } from '@/conteudo/portugues/crase';
import { questoesDoDiagnostico } from '@/diagnostico/dados';
import { QUESTOES_DO_FAROL } from '@/licao/montar';
import { ehDeEscolha, type Questao, type QuestaoDeOrdenar, type QuestaoDePares } from '@/licao/tipos';

/**
 * Integridade do conteúdo: erros de digitação nos dados (resposta fora das opções, ids repetidos)
 * aparecem aqui, e não na mão de quem está estudando.
 */
const doModulo: Questao[] = [...moduloCrase.partes.flatMap((p) => p.questoes), ...moduloCrase.farol];
const todas: Questao[] = [...doModulo, ...questoesDoDiagnostico];
const deEscolha = todas.filter(ehDeEscolha);
const deOrdenar = doModulo.filter((q): q is QuestaoDeOrdenar => q.tipo === 'ordenar');
const dePares = doModulo.filter((q): q is QuestaoDePares => q.tipo === 'ligarPares');

describe('conteúdo', () => {
  it('cada questão tem um id único', () => {
    const ids = todas.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(deEscolha.map((q) => [q.id, q] as const))('%s tem resposta correta dentro das opções', (_id, q) => {
    expect(q.correta).toBeGreaterThanOrEqual(0);
    expect(q.correta).toBeLessThan(q.opcoes.length);
  });

  it.each(deEscolha.map((q) => [q.id, q] as const))('%s não repete opções', (_id, q) => {
    expect(new Set(q.opcoes).size).toBe(q.opcoes.length);
  });

  it.each(deOrdenar.map((q) => [q.id, q] as const))('%s tem de 3 a 6 blocos, sem repetir', (_id, q) => {
    expect(q.itens.length).toBeGreaterThanOrEqual(3);
    expect(q.itens.length).toBeLessThanOrEqual(6);
    expect(new Set(q.itens).size).toBe(q.itens.length);
  });

  it.each(dePares.map((q) => [q.id, q] as const))('%s tem de 3 a 5 pares, sem itens repetidos', (_id, q) => {
    expect(q.pares.length).toBeGreaterThanOrEqual(3);
    expect(q.pares.length).toBeLessThanOrEqual(5);
    expect(new Set(q.pares.map((p) => p[0])).size).toBe(q.pares.length);
    expect(new Set(q.pares.map((p) => p[1])).size).toBe(q.pares.length);
  });

  it('o módulo usa os 6 tipos de exercício', () => {
    expect(new Set(doModulo.map((q) => q.tipo))).toEqual(
      new Set(['multipla', 'certoErrado', 'completar', 'identificarErro', 'ordenar', 'ligarPares']),
    );
  });

  it('cada parte do módulo tem questões de nível fácil para o aquecimento', () => {
    moduloCrase.partes.forEach((parte) => {
      const faceis = parte.questoes.filter((q) => q.nivel <= 2);
      expect(faceis.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('as questões de lição e do farol têm explicação e dica', () => {
    doModulo.forEach((q) => {
      expect(q.explicacao.length).toBeGreaterThan(0);
      expect(q.dica.length).toBeGreaterThan(0);
    });
  });

  it('o módulo tem de 3 a 8 partes, uma nuance cada', () => {
    expect(moduloCrase.partes.length).toBeGreaterThanOrEqual(3);
    expect(moduloCrase.partes.length).toBeLessThanOrEqual(8);
  });

  it('o farol tem questões suficientes e no nível de prova', () => {
    expect(moduloCrase.farol.length).toBeGreaterThanOrEqual(QUESTOES_DO_FAROL);
    moduloCrase.farol.forEach((q) => expect(q.nivel).toBeGreaterThanOrEqual(3));
  });

  it('a incidência é um peso entre 0 e 1', () => {
    expect(moduloCrase.incidencia).toBeGreaterThan(0);
    expect(moduloCrase.incidencia).toBeLessThanOrEqual(1);
  });
});
