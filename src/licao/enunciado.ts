/**
 * Quebra de linha no enunciado: a instrução curta do começo ("Certo ou errado?", "Complete:",
 * "Complete com a pontuação:") fica na primeira linha, e o conteúdo da questão na seguinte.
 * Vale para qualquer questão nesse padrão, sem precisar mexer no conteúdo.
 *
 * Só quebra quando a instrução é curta (até 40 caracteres), termina em "?" ou ":" e vem seguida
 * de mais texto. Uma pergunta inteira, como "Em qual frase a crase está correta?", fica como está.
 */
const INSTRUCAO = /^([^"“”«»?:\n]{2,40}[?:])\s+(\S[\s\S]*)$/;

export function quebrarEnunciado(enunciado: string): string {
  const partes = INSTRUCAO.exec(enunciado.trim());
  return partes ? `${partes[1]}\n${partes[2]}` : enunciado;
}
