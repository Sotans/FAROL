import { moduloCrase } from '@/conteudo/portugues/crase';
import { moduloVirgula, trilhaDePortugues } from '@/conteudo/trilha';
import { validarModulo } from '@/conteudo/validar';
import {
  farolAceso,
  mesclarModulos,
  migrarProgresso,
  moduloLiberado,
  proximoModulo,
  totalDeNos,
} from '@/estado/modulos';

describe('trilha de Português', () => {
  it('começa pela Vírgula (mais cobrada) e segue para Crase', () => {
    expect(trilhaDePortugues.map((m) => m.id)).toEqual(['pt-virgula', 'pt-crase']);
  });

  it('todo módulo da trilha cumpre as regras do modelo pedagógico', () => {
    trilhaDePortugues.forEach((m) => expect(validarModulo(m)).toEqual([]));
  });

  it('não há ids de questão repetidos entre módulos (a revisão espaçada usa o id)', () => {
    const ids = trilhaDePortugues.flatMap((m) => [...m.partes.flatMap((p) => p.questoes), ...m.farol].map((q) => q.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('liberação dos módulos', () => {
  it('o primeiro módulo está sempre liberado', () => {
    expect(moduloLiberado(trilhaDePortugues, {}, 0)).toBe(true);
  });

  it('o segundo abre quando o farol do primeiro acende', () => {
    expect(moduloLiberado(trilhaDePortugues, {}, 1)).toBe(false);
    const aceso = { 'pt-virgula': { concluidas: totalDeNos(moduloVirgula), dominadas: [] } };
    expect(farolAceso(aceso, moduloVirgula)).toBe(true);
    expect(moduloLiberado(trilhaDePortugues, aceso, 1)).toBe(true);
  });

  it('quem já tem progresso num módulo continua com ele liberado', () => {
    expect(moduloLiberado(trilhaDePortugues, { 'pt-crase': { concluidas: 2, dominadas: [] } }, 1)).toBe(true);
  });

  it('indica o próximo módulo, e nenhum depois do último', () => {
    expect(proximoModulo(trilhaDePortugues, 'pt-virgula')?.id).toBe('pt-crase');
    expect(proximoModulo(trilhaDePortugues, 'pt-crase')).toBeNull();
  });
});

describe('migração do formato antigo (um só módulo)', () => {
  it('leva o avanço antigo para Crase e abre o app na Vírgula', () => {
    const antigo = { xp: 200, concluidas: 4, dominadas: [1] };
    const novo = migrarProgresso(antigo, 'pt-virgula');
    expect(novo.modulos).toEqual({ 'pt-crase': { concluidas: 4, dominadas: [1] } });
    expect(novo.moduloAtual).toBe('pt-virgula');
    expect('concluidas' in novo).toBe(false);
    expect(novo.xp).toBe(200);
  });

  it('não mexe em quem já está no formato novo', () => {
    const atual = { modulos: { 'pt-virgula': { concluidas: 2, dominadas: [] } }, moduloAtual: 'pt-crase' };
    expect(migrarProgresso(atual, 'pt-virgula')).toEqual(atual);
  });

  it('sem avanço antigo, não cria progresso vazio em Crase', () => {
    expect(migrarProgresso({ concluidas: 0, dominadas: [] }, 'pt-virgula').modulos).toEqual({});
  });
});

describe('mesclarModulos', () => {
  it('fica com o maior avanço de cada módulo e soma as partes dominadas', () => {
    const r = mesclarModulos(
      { 'pt-crase': { concluidas: 3, dominadas: [1] } },
      { 'pt-crase': { concluidas: 5, dominadas: [2] }, 'pt-virgula': { concluidas: 1, dominadas: [] } },
    );
    expect(r).toEqual({
      'pt-crase': { concluidas: 5, dominadas: [1, 2] },
      'pt-virgula': { concluidas: 1, dominadas: [] },
    });
    expect(totalDeNos(moduloCrase)).toBe(moduloCrase.partes.length + 1);
  });
});
