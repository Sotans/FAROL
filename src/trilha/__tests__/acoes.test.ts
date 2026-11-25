import { acaoPrincipal } from '@/trilha/acoes';

const base = { totalDePartes: 6, xpDaLicao: 25, xpDoFarol: 50, proximoModulo: { id: 'pt-crase', nome: 'Crase' } };

describe('acaoPrincipal (o botão da base da trilha)', () => {
  it('no meio do módulo, continua a próxima parte', () => {
    expect(acaoPrincipal({ ...base, concluidas: 2 })).toEqual({
      tipo: 'licao',
      rotulo: 'Continuar a Parte 3',
      xp: 25,
    });
  });
  it('depois da última parte, acende o farol', () => {
    expect(acaoPrincipal({ ...base, concluidas: 6 })).toEqual({ tipo: 'farol', rotulo: 'Acender o farol', xp: 50 });
  });
  it('com o farol aceso, leva ao próximo módulo', () => {
    expect(acaoPrincipal({ ...base, concluidas: 7 })).toEqual({
      tipo: 'proximoModulo',
      rotulo: 'Ir para Crase',
      moduloId: 'pt-crase',
    });
  });
  it('no último módulo concluído, não há botão', () => {
    expect(acaoPrincipal({ ...base, concluidas: 7, proximoModulo: null })).toBeNull();
  });
});
