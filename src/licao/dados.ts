import { moduloCrase } from '@/conteudo/portugues/crase';

/**
 * Módulo em uso no protótipo. Quando houver vários módulos e matérias, isto vira uma escolha
 * do usuário (trilha da carreira) e o conteúdo virá do backend (Meta 2).
 */
export const moduloAtual = moduloCrase;

export const nomeDoModulo = moduloAtual.nome;
export const totalDePartes = moduloAtual.partes.length;
export const partes = moduloAtual.partes.map((p) => p.nome);

/** Na trilha, o farol é o nó logo depois da última parte. */
export const indiceDoFarol = totalDePartes;
/** Partes mais o farol. `concluidas === totalDeNos` quer dizer farol aceso: módulo concluído. */
export const totalDeNos = totalDePartes + 1;
