import { decidirVersao, VERSAO_DO_PROGRESSO } from '../versao';

describe('decidirVersao', () => {
  it('usa o progresso da mesma versão', () => {
    expect(decidirVersao(VERSAO_DO_PROGRESSO)).toBe('usar');
  });

  it('migra o progresso de uma versão mais antiga', () => {
    expect(decidirVersao(1, 2)).toBe('migrar');
  });

  it('bloqueia o progresso de uma versão mais nova, para o app antigo não sobrescrever', () => {
    expect(decidirVersao(VERSAO_DO_PROGRESSO + 1)).toBe('bloquear');
  });

  it('bloqueia uma versão que não é número inteiro', () => {
    expect(decidirVersao(Number.NaN)).toBe('bloquear');
    expect(decidirVersao(1.5, 2)).toBe('bloquear');
  });
});
