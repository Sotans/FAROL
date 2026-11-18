import { moduloCrase } from '@/conteudo/portugues/crase';
import {
  montarBoasVindas,
  montarDesafio,
  montarFarol,
  montarLicao,
  ORIGEM_DO_FAROL,
  QUESTOES_DE_BOAS_VINDAS,
  QUESTOES_DE_REVISAO,
  QUESTOES_DO_DESAFIO,
  QUESTOES_DO_FAROL,
} from '@/licao/montar';

const modulo = moduloCrase;
const ids = (qs: { id: string }[]) => qs.map((q) => q.id);

describe('montarLicao', () => {
  it('a primeira parte não tem revisão, porque não há partes anteriores', () => {
    const licao = montarLicao(modulo, 0, 1);
    expect(licao).toHaveLength(modulo.partes[0].questoes.length);
    expect(licao.some((q) => q.origem)).toBe(false);
  });

  it('as demais partes trazem as próprias questões mais a revisão de partes anteriores', () => {
    for (let i = 1; i < modulo.partes.length; i += 1) {
      const licao = montarLicao(modulo, i, 1);
      const revisao = licao.filter((q) => q.origem);
      expect(licao).toHaveLength(modulo.partes[i].questoes.length + QUESTOES_DE_REVISAO);
      expect(revisao).toHaveLength(QUESTOES_DE_REVISAO);
      // A revisão vem só de partes anteriores.
      const anteriores = new Set(modulo.partes.slice(0, i).flatMap((p) => ids(p.questoes)));
      revisao.forEach((q) => expect(anteriores.has(q.id)).toBe(true));
    }
  });

  it('nunca repete uma questão na mesma lição', () => {
    for (let i = 0; i < modulo.partes.length; i += 1) {
      const licao = montarLicao(modulo, i, 99);
      expect(new Set(ids(licao)).size).toBe(licao.length);
    }
  });

  it('começa com aquecimento fácil e termina com uma questão fácil', () => {
    for (let i = 0; i < modulo.partes.length; i += 1) {
      const licao = montarLicao(modulo, i, 7);
      const menorNivel = Math.min(...modulo.partes[i].questoes.map((q) => q.nivel));
      expect(licao[0].nivel).toBe(menorNivel);
      expect(licao[licao.length - 1].nivel).toBeLessThanOrEqual(2);
      expect(licao[licao.length - 1].origem).toBeUndefined();
    }
  });

  it('é determinística: mesma semente, mesma lição', () => {
    expect(ids(montarLicao(modulo, 3, 123))).toEqual(ids(montarLicao(modulo, 3, 123)));
  });

  it('limita o índice da parte ao intervalo válido', () => {
    expect(ids(montarLicao(modulo, 99, 1))).toEqual(ids(montarLicao(modulo, modulo.partes.length - 1, 1)));
  });
});

describe('montarBoasVindas', () => {
  it('é curta, fácil e sem botão de confirmar', () => {
    const licao = montarBoasVindas(modulo);
    expect(licao).toHaveLength(QUESTOES_DE_BOAS_VINDAS);
    licao.forEach((q) => {
      expect(q.nivel).toBeLessThanOrEqual(2);
      expect(q.modo).toBe('imediato');
    });
  });
});

describe('montarFarol', () => {
  it('usa só as questões do farol, sem repetir, marcadas como estilo de prova', () => {
    const farol = montarFarol(modulo, 4);
    const doFarol = new Set(ids(modulo.farol));
    expect(farol).toHaveLength(QUESTOES_DO_FAROL);
    expect(new Set(ids(farol)).size).toBe(farol.length);
    farol.forEach((q) => {
      expect(doFarol.has(q.id)).toBe(true);
      expect(q.origem).toBe(ORIGEM_DO_FAROL);
    });
  });

  it('vem em dificuldade crescente', () => {
    const niveis = montarFarol(modulo, 8).map((q) => q.nivel);
    expect(niveis).toEqual([...niveis].sort((a, b) => a - b));
  });

  it('não altera o conteúdo original', () => {
    montarFarol(modulo, 1);
    modulo.farol.forEach((q) => expect(q.origem).toBeUndefined());
  });
});

describe('montarDesafio', () => {
  it('usa só questões das partes que serão puladas', () => {
    const desafio = montarDesafio(modulo, 1, 3, 5);
    const puladas = new Set(modulo.partes.slice(1, 3).flatMap((p) => ids(p.questoes)));
    desafio.forEach((q) => expect(puladas.has(q.id)).toBe(true));
  });

  it('cobre todas as partes puladas e respeita o limite de questões', () => {
    const desafio = montarDesafio(modulo, 0, 5, 5);
    expect(desafio).toHaveLength(QUESTOES_DO_DESAFIO);
    const partesCobertas = new Set(desafio.map((q) => q.id.slice(3, 5)));
    expect(partesCobertas).toEqual(new Set(['p1', 'p2', 'p3', 'p4', 'p5']));
  });

  it('com poucas questões disponíveis, usa todas as da parte', () => {
    expect(montarDesafio(modulo, 1, 2, 5)).toHaveLength(modulo.partes[1].questoes.length);
  });

  it('vem em dificuldade crescente', () => {
    const niveis = montarDesafio(modulo, 0, 4, 3).map((q) => q.nivel);
    expect(niveis).toEqual([...niveis].sort((a, b) => a - b));
  });
});
