import { diasEntre, hoje, virarDia, type ContadoresDoDia } from '../dia';

const ontem: ContadoresDoDia = {
  dia: '2026-11-24',
  ultimoDiaDeEstudo: '2026-11-24',
  sequencia: 5,
  licoesHoje: 2,
  desafiosHoje: 1,
  dicasHoje: 3,
};

describe('hoje', () => {
  it('formata a data local como AAAA-MM-DD', () => {
    expect(hoje(new Date(2026, 0, 7, 23, 59))).toBe('2026-01-07');
  });
});

describe('diasEntre', () => {
  it('conta dias de calendário', () => {
    expect(diasEntre('2026-11-24', '2026-11-25')).toBe(1);
    expect(diasEntre('2026-11-24', '2026-11-26')).toBe(2);
    expect(diasEntre('2026-12-31', '2027-01-01')).toBe(1);
  });
});

describe('virarDia', () => {
  it('no mesmo dia, devolve o mesmo objeto (sem re-render)', () => {
    expect(virarDia(ontem, '2026-11-24')).toBe(ontem);
  });

  it('no dia seguinte, zera lições, desafios e dicas e mantém a sequência', () => {
    const novo = virarDia(ontem, '2026-11-25');
    expect(novo).toMatchObject({ dia: '2026-11-25', licoesHoje: 0, desafiosHoje: 0, dicasHoje: 0, sequencia: 5 });
  });

  it('com um dia inteiro sem estudar, a sequência volta a zero', () => {
    expect(virarDia(ontem, '2026-11-26').sequencia).toBe(0);
  });

  it('o app aberto desde ontem (dia guardado antigo) também vira o dia', () => {
    const aberto = { ...ontem, dia: '2026-11-24', ultimoDiaDeEstudo: '2026-11-23' };
    const novo = virarDia(aberto, '2026-11-25');
    expect(novo.desafiosHoje).toBe(0);
    expect(novo.sequencia).toBe(0);
  });

  it('preserva os outros campos do estado', () => {
    const comMais = { ...ontem, xp: 120 };
    expect(virarDia(comMais, '2026-11-25').xp).toBe(120);
  });
});
