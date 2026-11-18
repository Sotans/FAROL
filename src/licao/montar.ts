import type { Modulo } from '@/conteudo/tipos';
import type { Questao } from './tipos';

/**
 * Montagem das sessões a partir do conteúdo (docs/10-modelo-pedagogico.md, seções 3, 7 e 9).
 * Funções puras: mesma entrada e mesma semente, mesma saída. Isso as torna testáveis.
 */

/** Questões de partes anteriores misturadas em cada lição (revisão intercalada, cerca de 20%). */
export const QUESTOES_DE_REVISAO = 2;
/** Tamanho máximo do desafio "Pular pra cá?". */
export const QUESTOES_DO_DESAFIO = 15;
/** A lição de boas-vindas é curta e fácil: a primeira vitória precisa ser rápida. */
export const QUESTOES_DE_BOAS_VINDAS = 5;
/** Tamanho do Farol do módulo. */
export const QUESTOES_DO_FAROL = 10;
export const ORIGEM_DO_FAROL = 'Farol · estilo de prova';

/** Embaralhamento determinístico (gerador congruencial linear), para as sessões variarem sem perder a reprodutibilidade. */
export function embaralhar<T>(itens: readonly T[], semente: number): T[] {
  const copia = [...itens];
  let s = semente >>> 0 || 1;
  for (let i = copia.length - 1; i > 0; i -= 1) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Ordena da mais fácil para a mais difícil, mantendo a ordem de autoria entre questões do mesmo nível. */
function porNivel(questoes: readonly Questao[]): Questao[] {
  return [...questoes].sort((a, b) => a.nivel - b.nivel);
}

function limitarParte(modulo: Modulo, indice: number): number {
  return Math.min(Math.max(indice, 0), modulo.partes.length - 1);
}

/**
 * Lição de uma parte, na composição do modelo pedagógico:
 * aquecimento (2 mais fáceis) → núcleo (dificuldade subindo) → revisão de partes anteriores → fechamento fácil.
 * Terminar com uma questão de alta chance de acerto deixa a lição terminar bem.
 */
export function montarLicao(modulo: Modulo, indiceDaParte: number, semente: number): Questao[] {
  const indice = limitarParte(modulo, indiceDaParte);
  const proprias = porNivel(modulo.partes[indice].questoes);

  const anteriores = modulo.partes
    .slice(0, indice)
    .flatMap((parte) => parte.questoes.map((q) => ({ ...q, origem: `Revisão · ${parte.nome}` })));
  const revisao = porNivel(embaralhar(anteriores, semente).slice(0, QUESTOES_DE_REVISAO));

  if (proprias.length < 3) return [...proprias, ...revisao];
  const [aquecimento1, aquecimento2, fechamento, ...nucleo] = proprias;
  return [aquecimento1, aquecimento2, ...nucleo, ...revisao, fechamento];
}

/** Boas-vindas: as questões mais fáceis da primeira parte. Conta como a conclusão da Parte 1. */
export function montarBoasVindas(modulo: Modulo): Questao[] {
  return porNivel(modulo.partes[0].questoes).slice(0, QUESTOES_DE_BOAS_VINDAS);
}

/**
 * Farol do módulo: questões no estilo da banca, que misturam todas as partes, em dificuldade crescente.
 * Não ensina nada novo: é a prova de que o tema inteiro ficou.
 */
export function montarFarol(modulo: Modulo, semente: number): Questao[] {
  const escolhidas = embaralhar(modulo.farol, semente).slice(0, QUESTOES_DO_FAROL);
  return porNivel(escolhidas).map((q) => ({ ...q, origem: ORIGEM_DO_FAROL }));
}

/**
 * Desafio "Pular pra cá?": questões das partes que serão puladas (do índice `de` até `ate - 1`),
 * alternando entre as partes para cobrir todas, em dificuldade crescente.
 */
export function montarDesafio(modulo: Modulo, de: number, ate: number, semente: number): Questao[] {
  const inicio = limitarParte(modulo, de);
  const fim = Math.max(inicio + 1, Math.min(ate, modulo.partes.length));
  const listas = modulo.partes.slice(inicio, fim).map((parte, i) => embaralhar(parte.questoes, semente + i));

  const escolhidas: Questao[] = [];
  for (let rodada = 0; escolhidas.length < QUESTOES_DO_DESAFIO; rodada += 1) {
    let pegou = false;
    for (const lista of listas) {
      if (rodada < lista.length && escolhidas.length < QUESTOES_DO_DESAFIO) {
        escolhidas.push(lista[rodada]);
        pegou = true;
      }
    }
    if (!pegou) break;
  }
  return porNivel(escolhidas);
}
