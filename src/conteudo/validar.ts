import { QUESTOES_DO_FAROL } from '@/licao/montar';
import { ehDeEscolha, type Questao } from '@/licao/tipos';
import type { Modulo } from './tipos';

/**
 * Regras que todo módulo precisa cumprir (docs/10-modelo-pedagogico.md e docs/04, seção 2b).
 * Devolve a lista de problemas em português; lista vazia quer dizer módulo válido.
 * Vale para os módulos escritos em código e para os rascunhos gerados com IA.
 */
export const REGRAS = {
  partes: { min: 3, max: 8 },
  questoesPorParte: { min: 8, max: 12 },
  faceisPorParte: 3,
  tiposPorParte: 3,
  farol: { min: QUESTOES_DO_FAROL, max: 14, nivelMinimo: 3 },
  ordenar: { min: 3, max: 6 },
  pares: { min: 3, max: 5 },
  trechos: { min: 3, max: 7 },
  /** Carga cognitiva baixa: a explicação cabe numa leitura rápida. */
  explicacaoMaxima: 240,
} as const;

function problemasDaQuestao(q: Questao, onde: string): string[] {
  const p: string[] = [];
  const diga = (texto: string) => p.push(`${onde} (${q.id}): ${texto}`);

  if (!q.enunciado.trim()) diga('enunciado vazio');
  if (!q.explicacao.trim()) diga('falta a explicação');
  if (!q.dica.trim()) diga('falta a dica');
  if (q.explicacao.length > REGRAS.explicacaoMaxima)
    diga(`explicação longa demais (${q.explicacao.length} caracteres; máximo ${REGRAS.explicacaoMaxima})`);

  if (ehDeEscolha(q)) {
    if (q.opcoes.length < 2) diga('precisa de pelo menos 2 opções');
    if (q.correta < 0 || q.correta >= q.opcoes.length || !Number.isInteger(q.correta))
      diga(`a resposta correta (${q.correta}) não corresponde a nenhuma opção`);
    if (new Set(q.opcoes).size !== q.opcoes.length) diga('há opções repetidas');
    if (q.opcoes.some((o) => !o.trim())) diga('há opção vazia');
    if (q.tipo === 'identificarErro' && (q.opcoes.length < REGRAS.trechos.min || q.opcoes.length > REGRAS.trechos.max))
      diga(`a frase deve ter de ${REGRAS.trechos.min} a ${REGRAS.trechos.max} trechos`);
  } else if (q.tipo === 'ordenar') {
    if (q.itens.length < REGRAS.ordenar.min || q.itens.length > REGRAS.ordenar.max)
      diga(`deve ter de ${REGRAS.ordenar.min} a ${REGRAS.ordenar.max} blocos`);
    if (new Set(q.itens).size !== q.itens.length) diga('há blocos repetidos');
  } else {
    if (q.pares.length < REGRAS.pares.min || q.pares.length > REGRAS.pares.max)
      diga(`deve ter de ${REGRAS.pares.min} a ${REGRAS.pares.max} pares`);
    if (new Set(q.pares.map((x) => x[0])).size !== q.pares.length) diga('há itens repetidos na coluna da esquerda');
    if (new Set(q.pares.map((x) => x[1])).size !== q.pares.length) diga('há itens repetidos na coluna da direita');
  }
  return p;
}

export function validarModulo(m: Modulo): string[] {
  const p: string[] = [];

  if (!(m.incidencia > 0 && m.incidencia <= 1)) p.push(`incidência deve ficar entre 0 e 1 (está ${m.incidencia})`);
  if (m.partes.length < REGRAS.partes.min || m.partes.length > REGRAS.partes.max)
    p.push(`o módulo deve ter de ${REGRAS.partes.min} a ${REGRAS.partes.max} partes (tem ${m.partes.length})`);

  const ids = [...m.partes.flatMap((x) => x.questoes), ...m.farol].map((q) => q.id);
  const repetidos = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  if (repetidos.length) p.push(`ids repetidos: ${repetidos.join(', ')}`);

  m.partes.forEach((parte, i) => {
    const onde = `Parte ${i + 1} "${parte.nome}"`;
    const n = parte.questoes.length;
    if (n < REGRAS.questoesPorParte.min || n > REGRAS.questoesPorParte.max)
      p.push(
        `${onde}: deve ter de ${REGRAS.questoesPorParte.min} a ${REGRAS.questoesPorParte.max} questões (tem ${n})`,
      );
    const faceis = parte.questoes.filter((q) => q.nivel <= 2).length;
    if (faceis < REGRAS.faceisPorParte)
      p.push(
        `${onde}: precisa de ${REGRAS.faceisPorParte} questões fáceis (nível 1 ou 2) para o aquecimento (tem ${faceis})`,
      );
    const tipos = new Set(parte.questoes.map((q) => q.tipo)).size;
    if (tipos < REGRAS.tiposPorParte)
      p.push(`${onde}: precisa de pelo menos ${REGRAS.tiposPorParte} tipos de exercício diferentes (tem ${tipos})`);
    parte.questoes.forEach((q, j) => p.push(...problemasDaQuestao(q, `${onde}, questão ${j + 1}`)));
  });

  const f = m.farol.length;
  if (f < REGRAS.farol.min || f > REGRAS.farol.max)
    p.push(`o farol deve ter de ${REGRAS.farol.min} a ${REGRAS.farol.max} questões (tem ${f})`);
  m.farol.forEach((q, j) => {
    const onde = `Farol, questão ${j + 1}`;
    if (q.nivel < REGRAS.farol.nivelMinimo) p.push(`${onde} (${q.id}): o farol é estilo de prova, nível 3 ou mais`);
    p.push(...problemasDaQuestao(q, onde));
  });

  return p;
}
