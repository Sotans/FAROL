import { esquecerVistos, registrarVisto, valorVisto } from '../vistos';

describe('registrarVisto', () => {
  beforeEach(esquecerVistos);

  it('na primeira vez só guarda o valor: abrir o app não anima', () => {
    expect(registrarVisto('sequencia', 3)).toBeUndefined();
    expect(valorVisto('sequencia')).toBe(3);
  });

  it('quando o valor muda, devolve o anterior para animar a partir dele', () => {
    registrarVisto('sequencia', 3);
    expect(registrarVisto('sequencia', 4)).toBe(3);
    expect(valorVisto('sequencia')).toBe(4);
  });

  it('sem mudança, não há o que animar', () => {
    registrarVisto('meta', 0.5);
    expect(registrarVisto('meta', 0.5)).toBeUndefined();
  });

  it('cada indicador tem a sua memória', () => {
    registrarVisto('meta', 0);
    registrarVisto('conquista:farol', 0);
    expect(registrarVisto('conquista:farol', 1)).toBe(0);
    expect(valorVisto('meta')).toBe(0);
  });
});
