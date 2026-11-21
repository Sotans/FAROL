import { idBase, notaDaQuestao, registrar, revisar, vencidas, type Revisoes } from '@/revisao/agenda';

const agora = new Date('2026-11-21T10:00:00.000Z');
const minutos = (n: number) => new Date(agora.getTime() + n * 60_000);
const dias = (n: number) => new Date(agora.getTime() + n * 86_400_000);

describe('notaDaQuestao', () => {
  it('acertou de primeira e sem dica: bom', () => {
    expect(notaDaQuestao({ errou: false, usouDica: false, tipo: 'multipla' })).toBe('bom');
  });
  it('acertou com dica: difícil', () => {
    expect(notaDaQuestao({ errou: false, usouDica: true, tipo: 'multipla' })).toBe('dificil');
  });
  it('errou: errou', () => {
    expect(notaDaQuestao({ errou: true, usouDica: false, tipo: 'ordenar' })).toBe('errou');
  });
  it('em ligar pares, errar um par conta como difícil', () => {
    expect(notaDaQuestao({ errou: true, usouDica: false, tipo: 'ligarPares' })).toBe('dificil');
  });
});

describe('revisar', () => {
  it('um erro faz a questão voltar em minutos', () => {
    const c = revisar(undefined, 'errou', agora);
    expect(Date.parse(c.dueAt)).toBeLessThanOrEqual(minutos(15).getTime());
  });

  it('um acerto faz a questão voltar em dias', () => {
    const c = revisar(undefined, 'bom', agora);
    expect(Date.parse(c.dueAt)).toBeGreaterThan(dias(2).getTime());
  });

  it('difícil volta antes de bom', () => {
    expect(Date.parse(revisar(undefined, 'dificil', agora).dueAt)).toBeLessThan(
      Date.parse(revisar(undefined, 'bom', agora).dueAt),
    );
  });

  it('cada novo acerto afasta mais a próxima revisão', () => {
    let c = revisar(undefined, 'bom', agora);
    let intervaloAnterior = Date.parse(c.dueAt) - agora.getTime();
    for (let i = 0; i < 3; i += 1) {
      const quando = new Date(c.dueAt);
      c = revisar(c, 'bom', quando);
      const intervalo = Date.parse(c.dueAt) - quando.getTime();
      expect(intervalo).toBeGreaterThan(intervaloAnterior);
      intervaloAnterior = intervalo;
    }
  });

  it('o cartão salvo sobrevive à ida e volta em JSON', () => {
    const c = revisar(undefined, 'bom', agora);
    const lido = JSON.parse(JSON.stringify(c));
    expect(revisar(lido, 'bom', dias(5))).toEqual(revisar(c, 'bom', dias(5)));
  });
});

describe('registrar e vencidas', () => {
  it('usa o id da questão original, mesmo para a cópia que voltou no fim', () => {
    const r = registrar({}, { 'cr-p1-01-r': 'bom' }, agora);
    expect(Object.keys(r)).toEqual(['cr-p1-01']);
    expect(idBase('cr-p1-01-r')).toBe('cr-p1-01');
  });

  it('não altera o objeto recebido', () => {
    const antes: Revisoes = {};
    registrar(antes, { a: 'bom' }, agora);
    expect(antes).toEqual({});
  });

  it('lista só as vencidas, da mais atrasada para a menos atrasada', () => {
    const r = registrar({}, { erro1: 'errou', acerto: 'bom' }, agora);
    const r2 = registrar(r, { erro2: 'errou' }, minutos(5));
    expect(vencidas(r2, agora)).toEqual([]);
    expect(vencidas(r2, minutos(30))).toEqual(['erro1', 'erro2']);
    expect(vencidas(r2, dias(60))).toEqual(['erro1', 'erro2', 'acerto']);
  });
});
