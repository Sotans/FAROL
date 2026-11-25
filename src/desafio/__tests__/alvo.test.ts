import { alvoDoDesafio } from '../alvo';

// Módulo com 6 partes: o farol é o nó 6. A pessoa está na parte 1 (concluidas = 1).
const concluidas = 1;
const indiceDoFarol = 6;

describe('alvoDoDesafio', () => {
  it('aceita um nó à frente do atual', () => {
    expect(alvoDoDesafio('3', concluidas, indiceDoFarol)).toBe(3);
  });

  it('aceita o próprio farol', () => {
    expect(alvoDoDesafio('6', concluidas, indiceDoFarol)).toBe(6);
  });

  it.each([undefined, '', 'abc', '2.5', '-3', '1e3', ' '])('recusa um valor que não é inteiro: %p', (ate) => {
    expect(alvoDoDesafio(ate, concluidas, indiceDoFarol)).toBeNull();
  });

  it('recusa o nó atual e nós já concluídos', () => {
    expect(alvoDoDesafio('1', concluidas, indiceDoFarol)).toBeNull();
    expect(alvoDoDesafio('0', concluidas, indiceDoFarol)).toBeNull();
  });

  it('recusa um nó além do farol', () => {
    expect(alvoDoDesafio('7', concluidas, indiceDoFarol)).toBeNull();
    expect(alvoDoDesafio('999999999999999999999', concluidas, indiceDoFarol)).toBeNull();
  });
});
