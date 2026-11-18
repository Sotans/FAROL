import { moduloCrase } from '@/conteudo/portugues/crase';
import { questoesDoDiagnostico } from '@/diagnostico/dados';
import { QUESTOES_DO_FAROL } from '@/licao/montar';
import type { Questao } from '@/licao/tipos';

/**
 * Integridade do conteúdo: erros de digitação nos dados (resposta fora das opções, ids repetidos)
 * aparecem aqui, e não na mão de quem está estudando.
 */
const doModulo: Questao[] = [...moduloCrase.partes.flatMap((p) => p.questoes), ...moduloCrase.farol];
const todas: Questao[] = [...doModulo, ...questoesDoDiagnostico];

describe('conteúdo', () => {
  it('cada questão tem um id único', () => {
    const ids = todas.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(todas.map((q) => [q.id, q] as const))('%s tem resposta correta dentro das opções', (_id, q) => {
    expect(q.correta).toBeGreaterThanOrEqual(0);
    expect(q.correta).toBeLessThan(q.opcoes.length);
  });

  it.each(todas.map((q) => [q.id, q] as const))('%s não repete opções', (_id, q) => {
    expect(new Set(q.opcoes).size).toBe(q.opcoes.length);
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
