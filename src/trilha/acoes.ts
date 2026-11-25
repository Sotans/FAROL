/**
 * O botão fixo na base da trilha, que responde "o que eu faço agora?" com um toque (jornada, etapa 5).
 * Rótulos em caixa normal, como em todos os botões (análise de design de 25/11).
 */

export type AcaoPrincipal =
  | { tipo: 'licao'; rotulo: string; xp: number }
  | { tipo: 'farol'; rotulo: string; xp: number }
  | { tipo: 'proximoModulo'; rotulo: string; moduloId: string }
  | null;

export function acaoPrincipal(p: {
  concluidas: number;
  totalDePartes: number;
  xpDaLicao: number;
  xpDoFarol: number;
  proximoModulo: { id: string; nome: string } | null;
}): AcaoPrincipal {
  if (p.concluidas < p.totalDePartes)
    return { tipo: 'licao', rotulo: `Continuar a Parte ${p.concluidas + 1}`, xp: p.xpDaLicao };
  if (p.concluidas === p.totalDePartes) return { tipo: 'farol', rotulo: 'Acender o farol', xp: p.xpDoFarol };
  if (p.proximoModulo)
    return { tipo: 'proximoModulo', rotulo: `Ir para ${p.proximoModulo.nome}`, moduloId: p.proximoModulo.id };
  return null;
}
