import { noticiasDaCarreira, quandoFoiPublicada, type Noticia } from '../exemplos';

const n = (id: string, data: string, carreiras: Noticia['carreiras']): Noticia => ({
  id,
  tipo: 'edital',
  titulo: id,
  resumo: '',
  data,
  carreiras,
});

describe('noticiasDaCarreira', () => {
  const lista = [n('a', '2026-11-01', ['tribunais']), n('b', '2026-11-03', []), n('c', '2026-11-02', ['policial'])];

  it('mostra as da carreira e as que servem a todas, da mais nova para a mais antiga', () => {
    expect(noticiasDaCarreira(lista, 'tribunais').map((x) => x.id)).toEqual(['b', 'a']);
  });

  it('sem carreira, mostra todas', () => {
    expect(noticiasDaCarreira(lista, null).map((x) => x.id)).toEqual(['b', 'c', 'a']);
  });
});

describe('quandoFoiPublicada', () => {
  it('fala em dias perto de hoje e mostra a data depois de uma semana', () => {
    expect(quandoFoiPublicada('2026-11-26', '2026-11-26')).toBe('Hoje');
    expect(quandoFoiPublicada('2026-11-25', '2026-11-26')).toBe('Ontem');
    expect(quandoFoiPublicada('2026-11-23', '2026-11-26')).toBe('Há 3 dias');
    expect(quandoFoiPublicada('2026-11-10', '2026-11-26')).toBe('10/11');
  });
});
