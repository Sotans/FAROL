/**
 * O alvo do desafio "Pular pra cá?" vem da rota (`/desafio?ate=N`), que também pode chegar por um link.
 * Só vale um número inteiro à frente do nó atual e no máximo o farol do módulo. Fora disso, null.
 */
export function alvoDoDesafio(ate: string | undefined, concluidas: number, indiceDoFarol: number): number | null {
  if (ate === undefined || !/^\d+$/.test(ate.trim())) return null;
  const alvo = Number(ate);
  if (!Number.isSafeInteger(alvo) || alvo <= concluidas || alvo > indiceDoFarol) return null;
  return alvo;
}
