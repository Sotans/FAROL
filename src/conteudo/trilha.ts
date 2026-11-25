import moduloVirgulaRascunho from './rascunhos/pt-virgula.json';
import { moduloCrase } from './portugues/crase';
import { lerRascunho } from './rascunho';
import type { Modulo } from './tipos';
import { validarModulo } from './validar';

/**
 * A trilha de Português: os módulos na ordem de estudo, pela incidência nas provas
 * (docs/15-mapa-de-temas.md). Vírgula (7,6% no Cebraspe) vem antes de Crase (2,3%).
 */

function carregarRascunho(json: unknown): Modulo {
  const { modulo, problemas } = lerRascunho(json);
  const todos = modulo ? validarModulo(modulo) : problemas;
  if (!modulo || todos.length) throw new Error(`Módulo inválido: ${todos.join('; ')}`);
  return modulo;
}

export const moduloVirgula = carregarRascunho(moduloVirgulaRascunho);

export const trilhaDePortugues: readonly Modulo[] = [moduloVirgula, moduloCrase];

/** Módulos cujo conteúdo ainda não passou pela conferência do fundador (docs/14, seção 5). */
export const modulosEmRevisao: ReadonlySet<string> = new Set(['pt-virgula']);

export function moduloPorId(id: string): Modulo {
  return trilhaDePortugues.find((m) => m.id === id) ?? trilhaDePortugues[0];
}
