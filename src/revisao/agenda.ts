import { dateChrono, defineScheduler, Rating, schedulerStatsMiddleware } from 'ts-fsrs';
import {
  DEFAULT_MAXIMUM_INTERVAL,
  defaultLearningSteps,
  defaultRelearningSteps,
  schedulerDesiredRetentionMiddleware,
  schedulerLearningStepsMiddleware,
  schedulerMaximumIntervalMiddleware,
  schedulerMonotonicIntervalMiddleware,
  schedulerScheduledDaysMiddleware,
} from 'ts-fsrs/middlewares';
import { FSRS7Model, migrateFSRS7Parameters } from 'ts-fsrs/models/fsrs-7';

import type { TipoQuestao } from '@/licao/tipos';

/**
 * Revisão espaçada (docs/10-modelo-pedagogico.md, seção 7; submeta 4.6), com o algoritmo FSRS-7.
 * Cada questão respondida vira um cartão de memória, e o algoritmo calcula quando ela deve voltar:
 * logo depois de um erro, em dias depois de um acerto, cada vez mais longe a cada novo acerto.
 *
 * O agendador é montado de forma síncrona com as mesmas regras do DefaultScheduler da biblioteca,
 * exceto a aleatoriedade dos intervalos (desligada, para os testes serem previsíveis).
 */

/** Lembrar cerca de 90% do que está sendo revisado (meta padrão do modelo pedagógico). */
export const RETENCAO_DESEJADA = 0.9;

const passosDeReaprendizado = Array.from(defaultRelearningSteps);

const agendador = defineScheduler({ model: FSRS7Model, chrono: dateChrono })
  .use(schedulerDesiredRetentionMiddleware)
  .use(schedulerStatsMiddleware)
  .use(schedulerScheduledDaysMiddleware)
  .use(schedulerLearningStepsMiddleware)
  .use(schedulerMaximumIntervalMiddleware)
  .use(schedulerMonotonicIntervalMiddleware)
  .create({
    config: {
      fractionalDays: true,
      weights: migrateFSRS7Parameters(undefined),
      enableShortTerm: true,
      desiredRetention: RETENCAO_DESEJADA,
      learningSteps: Array.from(defaultLearningSteps),
      relearningSteps: passosDeReaprendizado,
      allowModelOverride: true,
      maximumInterval: DEFAULT_MAXIMUM_INTERVAL,
    },
  });

type Cartao = ReturnType<typeof agendador.newCard>;

/** O cartão como fica salvo no aparelho: as datas viram texto (JSON). */
export type CartaoSalvo = Omit<Cartao, 'dueAt' | 'lastReviewAt'> & { dueAt: string; lastReviewAt: string | null };

/** Cartões por id de questão. */
export type Revisoes = Record<string, CartaoSalvo>;

/**
 * Como a pessoa foi na questão, na linguagem do FAROL. Vira a nota do FSRS:
 * errou → Again, difícil → Hard, bom → Good.
 */
export type Nota = 'errou' | 'dificil' | 'bom';

const notaParaRating = { errou: Rating.Again, dificil: Rating.Hard, bom: Rating.Good } as const;

/**
 * A nota de uma questão a partir do que aconteceu nela.
 * Em ligar pares, errar um par faz parte de tentar: conta como "difícil", e não como erro.
 */
export function notaDaQuestao(r: { errou: boolean; usouDica: boolean; tipo: TipoQuestao }): Nota {
  if (r.errou) return r.tipo === 'ligarPares' ? 'dificil' : 'errou';
  return r.usouDica ? 'dificil' : 'bom';
}

/** A questão que volta no fim da lição tem o id com "-r"; o cartão é o da questão original. */
export function idBase(id: string): string {
  return id.replace(/-r$/, '');
}

function paraCartao(salvo: CartaoSalvo): Cartao {
  return {
    ...salvo,
    dueAt: new Date(salvo.dueAt),
    lastReviewAt: salvo.lastReviewAt ? new Date(salvo.lastReviewAt) : null,
  } as Cartao;
}

function paraSalvo(cartao: Cartao): CartaoSalvo {
  return {
    ...cartao,
    dueAt: cartao.dueAt.toISOString(),
    lastReviewAt: cartao.lastReviewAt ? cartao.lastReviewAt.toISOString() : null,
  };
}

/** Aplica uma nota a um cartão (ou cria o cartão, na primeira vez que a questão é vista). */
export function revisar(salvo: CartaoSalvo | undefined, nota: Nota, agora: Date): CartaoSalvo {
  const cartao = salvo ? paraCartao(salvo) : agendador.newCard({ now: agora });
  const resultado = agendador.review({ card: cartao, grade: notaParaRating[nota], now: agora });
  return paraSalvo(resultado.card as Cartao);
}

/** Registra as notas de uma sessão (lição, revisão ou desafio). Não altera o objeto recebido. */
export function registrar(revisoes: Revisoes, notas: Record<string, Nota>, agora: Date): Revisoes {
  const novas = { ...revisoes };
  for (const [id, nota] of Object.entries(notas)) novas[idBase(id)] = revisar(novas[idBase(id)], nota, agora);
  return novas;
}

/** Ids das questões vencidas (a hora de revisar já chegou), da mais atrasada para a menos atrasada. */
export function vencidas(revisoes: Revisoes, agora: Date): string[] {
  const limite = agora.getTime();
  return Object.entries(revisoes)
    .map(([id, c]) => [id, Date.parse(c.dueAt)] as const)
    .filter(([, vence]) => vence <= limite)
    .sort((a, b) => a[1] - b[1])
    .map(([id]) => id);
}

/** Quando vence a próxima revisão que ainda não venceu; null se não houver nenhuma agendada. */
export function proximaRevisao(revisoes: Revisoes, agora: Date): Date | null {
  const limite = agora.getTime();
  let proxima: number | null = null;
  for (const c of Object.values(revisoes)) {
    const vence = Date.parse(c.dueAt);
    if (vence > limite && (proxima === null || vence < proxima)) proxima = vence;
  }
  return proxima === null ? null : new Date(proxima);
}

/** Quantas questões ainda não venceram, mas vencem nos próximos `dias` dias. */
export function vencemNosProximosDias(revisoes: Revisoes, agora: Date, dias: number): number {
  const inicio = agora.getTime();
  const fim = inicio + dias * 86_400_000;
  return Object.values(revisoes).filter((c) => {
    const vence = Date.parse(c.dueAt);
    return vence > inicio && vence <= fim;
  }).length;
}
