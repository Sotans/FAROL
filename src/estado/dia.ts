/**
 * O dia do aparelho e a virada do dia. Funções puras, testáveis sem o React Native.
 */

/** Os campos do estado que a virada do dia lê e zera. */
export type ContadoresDoDia = {
  dia: string;
  ultimoDiaDeEstudo: string | null;
  sequencia: number;
  licoesHoje: number;
  desafiosHoje: number;
  dicasHoje: number;
};

/** O dia de hoje no fuso do aparelho (AAAA-MM-DD). */
export function hoje(d: Date = new Date()): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Dias entre duas datas AAAA-MM-DD (o arredondamento absorve o horário de verão). */
export function diasEntre(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00`) - Date.parse(`${a}T00:00:00`);
  return Math.round(ms / 86_400_000);
}

/**
 * Virada de dia: zera os contadores "hoje".
 * Regra PROVISÓRIA da sequência de dias (decisão em aberto em docs/03, seção 4): com dois ou mais
 * dias sem estudar, a sequência volta a zero, em silêncio e sem mensagem de culpa.
 */
export function virarDia<E extends ContadoresDoDia>(e: E, atual: string = hoje()): E {
  if (e.dia === atual) return e;
  let sequencia = e.sequencia;
  if (e.ultimoDiaDeEstudo && diasEntre(e.ultimoDiaDeEstudo, atual) >= 2) sequencia = 0;
  return { ...e, dia: atual, licoesHoje: 0, desafiosHoje: 0, dicasHoje: 0, sequencia };
}
