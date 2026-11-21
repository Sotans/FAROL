import { mesclar } from '@/estado/mesclar';
import type { Estado } from '@/estado/progresso';
import { revisar } from '@/revisao/agenda';

const base: Estado = {
  onboardingConcluido: true,
  carreira: 'policial',
  tomDoGuia: 'medio',
  metaDiaria: 1,
  mapa: null,
  concluidas: 0,
  dominadas: [],
  licoesHoje: 0,
  desafiosHoje: 0,
  dia: '2026-11-21',
  ultimoDiaDeEstudo: null,
  sequencia: 0,
  xp: 0,
  acertosSeguidos: 0,
  revisoes: {},
  toquesEmBreve: {},
  atualizadoEm: '2026-11-21T10:00:00.000Z',
};
const com = (mudancas: Partial<Estado>): Estado => ({ ...base, ...mudancas });

describe('mesclar', () => {
  it('sem nada na nuvem, fica o do aparelho', () => {
    const local = com({ concluidas: 2 });
    expect(mesclar(local, null)).toBe(local);
  });

  it('aparelho novo (zerado) recebe o progresso da nuvem', () => {
    const novo = com({ onboardingConcluido: false, carreira: null, atualizadoEm: null });
    const nuvem = com({ concluidas: 4, xp: 120, dominadas: [1], sequencia: 3 });
    const r = mesclar(novo, nuvem);
    expect(r.concluidas).toBe(4);
    expect(r.xp).toBe(120);
    expect(r.dominadas).toEqual([1]);
    expect(r.onboardingConcluido).toBe(true);
    expect(r.carreira).toBe('policial');
    expect(r.sequencia).toBe(3);
  });

  it('nunca perde avanço: trilha e XP ficam com o maior dos dois', () => {
    const local = com({ concluidas: 5, xp: 90, atualizadoEm: '2026-11-21T09:00:00.000Z' });
    const nuvem = com({ concluidas: 3, xp: 150, atualizadoEm: '2026-11-21T11:00:00.000Z' });
    const r = mesclar(local, nuvem);
    expect(r.concluidas).toBe(5);
    expect(r.xp).toBe(150);
  });

  it('o "agora" (meta, sequência, dia) vem da versão mais recente', () => {
    const local = com({ metaDiaria: 3, sequencia: 7, atualizadoEm: '2026-11-21T12:00:00.000Z' });
    const nuvem = com({ metaDiaria: 1, sequencia: 2, atualizadoEm: '2026-11-21T08:00:00.000Z' });
    const r = mesclar(local, nuvem);
    expect(r.metaDiaria).toBe(3);
    expect(r.sequencia).toBe(7);
    expect(r.atualizadoEm).toBe('2026-11-21T12:00:00.000Z');
  });

  it('partes dominadas se somam, sem duplicar', () => {
    const r = mesclar(com({ concluidas: 5, dominadas: [1, 2] }), com({ concluidas: 5, dominadas: [2, 3] }));
    expect(r.dominadas).toEqual([1, 2, 3]);
  });

  it('em cada questão, fica a revisão mais recente', () => {
    const cedo = new Date('2026-11-20T10:00:00.000Z');
    const tarde = new Date('2026-11-21T10:00:00.000Z');
    const antiga = revisar(undefined, 'bom', cedo);
    const nova = revisar(undefined, 'errou', tarde);
    const local = com({ revisoes: { a: antiga, so_local: antiga } });
    const nuvem = com({ revisoes: { a: nova, so_nuvem: nova } });
    const r = mesclar(local, nuvem);
    expect(r.revisoes.a).toEqual(nova);
    expect(Object.keys(r.revisoes).sort()).toEqual(['a', 'so_local', 'so_nuvem']);
  });

  it('toques em carreiras "em breve" ficam com o maior número de cada uma', () => {
    const r = mesclar(
      com({ toquesEmBreve: { fiscal: 3, saude: 1 } }),
      com({ toquesEmBreve: { fiscal: 1, bancario: 2 } }),
    );
    expect(r.toquesEmBreve).toEqual({ fiscal: 3, saude: 1, bancario: 2 });
  });
});
