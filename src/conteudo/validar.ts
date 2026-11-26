import { QUESTOES_DO_FAROL } from '@/licao/montar';
import { ehDeEscolha, ehInterativa, type Questao, type QuestaoInterativa } from '@/licao/tipos';
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

/** Regras próprias das questões interativas (arrastar, montar, ajustar). */
function problemasDaInterativa(q: QuestaoInterativa, diga: (texto: string) => void) {
  switch (q.tipo) {
    case 'regua':
      if (q.min >= q.max || q.passo <= 0) diga('a régua precisa de min < max e passo positivo');
      if (q.correta < q.min || q.correta > q.max) diga('a resposta está fora da régua');
      if (Math.abs((q.correta - q.min) / q.passo - Math.round((q.correta - q.min) / q.passo)) > 1e-9)
        diga('a resposta não cai num ponto da régua (confira o passo)');
      break;
    case 'proporcao':
      if (q.fichas.length !== 3) diga('a proporção usa 3 fichas (a, b e c; x é a incógnita)');
      if (!q.montagens.length) diga('falta ao menos uma montagem aceita');
      q.montagens.forEach((m) => {
        if ([...m].sort().join() !== [...q.fichas].sort().join()) diga(`a montagem ${m.join(', ')} não usa as fichas`);
      });
      break;
    case 'combinatoria':
      if (q.p < 1 || q.p > q.n || q.n > 12) diga('n e p precisam caber nos controles (1 ≤ p ≤ n ≤ 12)');
      break;
    case 'tabelaVerdade':
      if (q.linhas.length !== q.resultado.length) diga('cada linha precisa de um resultado');
      if (q.linhas.some((l) => l.length !== q.colunas.length - 1)) diga('as linhas não batem com as colunas');
      break;
    case 'venn':
      break;
    case 'montarFrase': {
      const sobra = [...q.pecas];
      q.correta.forEach((p) => {
        const i = sobra.indexOf(p);
        if (i === -1) diga(`a peça "${p}" da frase certa não está entre as peças`);
        else sobra.splice(i, 1);
      });
      break;
    }
    case 'associacao':
      if (q.correta.length !== q.linhas.length) diga('cada linha da grade precisa da sua coluna certa');
      if (new Set(q.correta).size !== q.correta.length) diga('duas linhas apontam para a mesma coluna');
      if (q.correta.some((c) => c < 0 || c >= q.colunas.length)) diga('resposta fora das colunas');
      if (!q.pistas.length) diga('faltam as pistas');
      break;
    case 'certoErradoCorrige':
      if (q.trechos.length < 2) diga('a frase precisa de pelo menos 2 trechos');
      if (q.errado !== null && (q.errado < 0 || q.errado >= q.trechos.length)) diga('o trecho errado não existe');
      if (q.errado !== null && (q.correcao < 0 || q.correcao >= q.correcoes.length))
        diga('a correção certa não existe');
      break;
    case 'classificar':
      if (q.itens.length < 2) diga('classifique pelo menos 2 itens');
      if (!q.itens.some((i) => i.coluna === 0) || !q.itens.some((i) => i.coluna === 1))
        diga('as duas colunas precisam receber algum item');
      break;
  }
}

function problemasDaQuestao(q: Questao, onde: string): string[] {
  const p: string[] = [];
  const diga = (texto: string) => p.push(`${onde} (${q.id}): ${texto}`);

  if (!q.enunciado.trim()) diga('enunciado vazio');
  if (!q.explicacao.trim()) diga('falta a explicação');
  if (!q.dica.trim()) diga('falta a dica');
  if (q.explicacao.length > REGRAS.explicacaoMaxima)
    diga(`explicação longa demais (${q.explicacao.length} caracteres; máximo ${REGRAS.explicacaoMaxima})`);

  if (ehInterativa(q)) {
    problemasDaInterativa(q, diga);
  } else if (ehDeEscolha(q)) {
    if (q.tipo === 'lacunaLei' && !q.texto?.includes('___')) diga('o texto da lei precisa de "___" na lacuna');
    if (q.tipo === 'casoConcreto' && !q.contexto?.trim()) diga('falta o caso (contexto)');
    if (q.tipo === 'passoAPasso') {
      if (q.passos?.filter((p) => p.includes('___')).length !== 1) diga('um passo (e só um) precisa de "___"');
      if (q.resultados && q.resultados.length !== q.opcoes.length) diga('um resultado para cada opção');
    }
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
  } else if (q.tipo === 'ligarPares') {
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

/** Problemas de uma lista solta de questões (como a lição de demonstração). */
export function validarQuestoes(questoes: readonly Questao[], onde = 'Questões'): string[] {
  return questoes.flatMap((q, i) => problemasDaQuestao(q, `${onde}, questão ${i + 1}`));
}
