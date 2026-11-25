/**
 * Versão do formato do progresso salvo na nuvem. Muda quando o tipo Estado mudar de forma incompatível.
 * Fica fora de src/servicos/nuvem.ts para ser testável sem carregar o cliente do Supabase.
 */
export const VERSAO_DO_PROGRESSO = 1;

/**
 * O que fazer com o progresso da nuvem, conforme a versão em que ele foi gravado:
 * - usar: mesma versão deste app.
 * - migrar: versão mais antiga; o app converte antes de combinar (hoje não há versões antigas).
 * - bloquear: versão mais nova que este app. Ele não entende o formato e NÃO pode enviar nada,
 *   senão sobrescreveria o progresso gravado por um app mais novo. A pessoa precisa atualizar o app.
 */
export type DecisaoDeVersao = 'usar' | 'migrar' | 'bloquear';

export function decidirVersao(remota: number, local: number = VERSAO_DO_PROGRESSO): DecisaoDeVersao {
  if (!Number.isInteger(remota) || remota > local) return 'bloquear';
  return remota < local ? 'migrar' : 'usar';
}

/**
 * Converte um progresso de versão antiga para a atual. Por enquanto só existe a versão 1:
 * quando a 2 chegar, cada passo de migração entra aqui, em ordem.
 */
export function migrarVersao(estado: unknown, _versao: number): unknown {
  return estado;
}
