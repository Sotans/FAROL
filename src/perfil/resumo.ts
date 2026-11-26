import type { Modulo } from '@/conteudo/tipos';
import { farolAceso, progressoDe, type ProgressoDosModulos } from '@/estado/modulos';

/** Quantos faróis a pessoa já acendeu na trilha. */
export function faroisAcesos(trilha: readonly Modulo[], modulos: ProgressoDosModulos): number {
  return trilha.filter((m) => farolAceso(modulos, m)).length;
}

export type Conquista = { id: string; titulo: string; descricao: string; alcancada: boolean };

type Dados = {
  xp: number;
  sequencia: number;
  faroisAcesos: number;
  modulos: ProgressoDosModulos;
  trilha: readonly Modulo[];
  fezOMapa: boolean;
};

/** As conquistas do perfil, na ordem em que costumam acontecer. As ainda não alcançadas mostram o caminho. */
export function conquistas(d: Dados): Conquista[] {
  const venceuDesafio = d.trilha.some((m) => progressoDe(d.modulos, m.id).dominadas.length > 0);
  return [
    { id: 'primeira-licao', titulo: 'Primeiro passo', descricao: 'Concluir a primeira lição', alcancada: d.xp > 0 },
    { id: 'mapa', titulo: 'Ponto de partida', descricao: 'Fazer o mapa inicial', alcancada: d.fezOMapa },
    {
      id: 'sequencia-7',
      titulo: 'Uma semana acesa',
      descricao: 'Estudar 7 dias seguidos',
      alcancada: d.sequencia >= 7,
    },
    { id: 'desafio', titulo: 'Pulo certo', descricao: 'Vencer um desafio "Pular pra cá?"', alcancada: venceuDesafio },
    {
      id: 'farol',
      titulo: 'Primeiro farol',
      descricao: 'Acender o farol de um módulo',
      alcancada: d.faroisAcesos >= 1,
    },
    { id: 'xp-1000', titulo: 'Mil de luz', descricao: 'Juntar 1.000 XP', alcancada: d.xp >= 1000 },
  ];
}

/** 1240 → "1.240". */
export function formatarNumero(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
