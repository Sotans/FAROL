import {
  codigoCompleto,
  emailValido,
  explicarErro,
  motivoParaCadastrar,
  normalizarCodigo,
  normalizarEmail,
} from '@/conta/regras';

describe('e-mail', () => {
  it.each(['ana@gmail.com', ' joao.silva@empresa.com.br ', 'a+farol@x.io'])('%s é válido', (e) =>
    expect(emailValido(e)).toBe(true),
  );
  it.each(['', 'ana', 'ana@', 'ana@gmail', 'ana @gmail.com', '@gmail.com'])('"%s" é inválido', (e) =>
    expect(emailValido(e)).toBe(false),
  );
  it('normaliza espaços e maiúsculas', () => expect(normalizarEmail('  Ana@Gmail.COM ')).toBe('ana@gmail.com'));
});

describe('código', () => {
  it('ignora espaços e traços colados do e-mail', () => expect(normalizarCodigo('123 456')).toBe('123456'));
  it('aceita de 6 a 10 dígitos', () => {
    expect(codigoCompleto('12345')).toBe(false);
    expect(codigoCompleto('123-456')).toBe(true);
    expect(codigoCompleto('12345678')).toBe(true);
  });
});

describe('explicarErro', () => {
  it('e-mail que já tem conta sugere entrar nela', () =>
    expect(explicarErro({ code: 'email_exists' }).saida).toBe('entrarNaConta'));
  it('conta inexistente sugere salvar o progresso', () =>
    expect(explicarErro({ code: 'otp_disabled' }).saida).toBe('criarConta'));
  it('código vencido sugere pedir outro', () =>
    expect(explicarErro({ code: 'otp_expired' }).saida).toBe('pedirNovoCodigo'));
  it('limite de envios pede para aguardar', () => expect(explicarErro({ status: 429 }).saida).toBe('aguardar'));
  it('sem internet sugere tentar de novo', () =>
    expect(explicarErro(new TypeError('Network request failed')).mensagem).toMatch(/conexão/));
  it('erro desconhecido tem mensagem gentil, sem a palavra "errou"', () => {
    const { mensagem } = explicarErro({ code: 'qualquer_coisa' });
    expect(mensagem).not.toMatch(/errou/i);
    expect(mensagem.length).toBeGreaterThan(0);
  });
});

describe('motivoParaCadastrar', () => {
  it('na primeira lição, fala da primeira conquista', () =>
    expect(motivoParaCadastrar({ primeiraLicao: true, sequencia: 1, concluidas: 1 })).toMatch(/primeira conquista/));
  it('com sequência, fala dos dias', () =>
    expect(motivoParaCadastrar({ primeiraLicao: false, sequencia: 4, concluidas: 3 })).toMatch(/sequência de 4 dias/));
  it('sem sequência, fala das lições', () =>
    expect(motivoParaCadastrar({ primeiraLicao: false, sequencia: 1, concluidas: 3 })).toMatch(/3 lições/));
  it('no começo, fala do progresso', () =>
    expect(motivoParaCadastrar({ primeiraLicao: false, sequencia: 1, concluidas: 1 })).toMatch(/Seu progresso/));
  it('nunca usa tom de culpa', () => {
    const textos = [true, false].flatMap((primeiraLicao) =>
      [0, 1, 5].map((n) => motivoParaCadastrar({ primeiraLicao, sequencia: n, concluidas: n })),
    );
    textos.forEach((t) => expect(t).not.toMatch(/perdeu|culpa|falhou|errou|deveria/i));
  });
});
