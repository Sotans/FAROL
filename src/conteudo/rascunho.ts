import type { Questao } from '@/licao/tipos';
import { certoErrado, completar, escolha, identificar, ordenar, pares, type Comum } from './criar';
import type { Modulo, Parte } from './tipos';

/**
 * Rascunho de módulo em JSON: o formato que a IA devolve (docs/14-rascunho-de-conteudo.md).
 * É mais simples que o formato do app: não tem ids nem modo de resposta, que são gerados aqui.
 * `lerRascunho` confere a estrutura, aponta onde está cada problema e converte para `Modulo`.
 */
export type Rascunho = {
  id: string;
  materia: Modulo['materia'];
  nome: string;
  incidencia: number;
  banca?: string;
  /** Editais e provas consultados no mapeamento. */
  fontes?: string[];
  /** Pontos que a IA não tem certeza e o fundador precisa conferir. */
  duvidas?: string[];
  partes: { nome: string; nuance?: string; questoes: unknown[] }[];
  farol: unknown[];
};

const MATERIAS: Modulo['materia'][] = ['portugues', 'constitucional'];
const TIPOS = ['multipla', 'certoErrado', 'completar', 'identificarErro', 'ordenar', 'ligarPares'] as const;

type Objeto = Record<string, unknown>;
const ehObjeto = (v: unknown): v is Objeto => typeof v === 'object' && v !== null && !Array.isArray(v);
const ehTexto = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const ehListaDeTextos = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
const doisDigitos = (n: number) => String(n).padStart(2, '0');

function lerQuestao(bruta: unknown, id: string, onde: string, problemas: string[]): Questao | null {
  const falta = (campo: string, como: string) => problemas.push(`${onde}: falta "${campo}" (${como})`);
  if (!ehObjeto(bruta)) {
    problemas.push(`${onde}: não é um objeto`);
    return null;
  }
  const tipo = bruta.tipo as (typeof TIPOS)[number];
  if (!TIPOS.includes(tipo)) {
    problemas.push(`${onde}: tipo "${String(bruta.tipo)}" desconhecido (use ${TIPOS.join(', ')})`);
    return null;
  }

  const antes = problemas.length;
  const nivel = bruta.nivel;
  if (!(typeof nivel === 'number' && Number.isInteger(nivel) && nivel >= 1 && nivel <= 5))
    problemas.push(`${onde}: "nivel" deve ser um número inteiro de 1 a 5`);
  if (!ehTexto(bruta.explicacao)) falta('explicacao', 'texto');
  if (!ehTexto(bruta.dica)) falta('dica', 'texto');
  if (bruta.armadilha !== undefined && typeof bruta.armadilha !== 'string')
    problemas.push(`${onde}: "armadilha" deve ser texto`);
  if (bruta.fonte !== undefined && typeof bruta.fonte !== 'string') problemas.push(`${onde}: "fonte" deve ser texto`);

  const enunciadoObrigatorio = tipo !== 'certoErrado' && tipo !== 'identificarErro';
  if (enunciadoObrigatorio && !ehTexto(bruta.enunciado)) falta('enunciado', 'texto');

  if (tipo === 'certoErrado') {
    if (!ehTexto(bruta.afirmacao)) falta('afirmacao', 'a frase a julgar');
    if (typeof bruta.certo !== 'boolean') falta('certo', 'true ou false');
  } else if (tipo === 'multipla' || tipo === 'completar') {
    if (!ehListaDeTextos(bruta.opcoes)) falta('opcoes', 'lista de textos');
    if (typeof bruta.correta !== 'number') falta('correta', 'posição da opção certa, começando em 0');
  } else if (tipo === 'identificarErro') {
    if (!ehListaDeTextos(bruta.trechos)) falta('trechos', 'a frase dividida em uma lista de textos');
    if (typeof bruta.erro !== 'number') falta('erro', 'posição do trecho errado, começando em 0');
  } else if (tipo === 'ordenar') {
    if (!ehListaDeTextos(bruta.itens)) falta('itens', 'lista de textos na ordem certa');
  } else if (!(
    Array.isArray(bruta.pares) &&
    bruta.pares.every((x) => Array.isArray(x) && x.length === 2 && x.every((y) => typeof y === 'string'))
  )) {
    falta('pares', 'lista de pares ["esquerda", "direita"]');
  }
  if (problemas.length > antes) return null;

  const comum: Comum = {
    nivel: nivel as Questao['nivel'],
    enunciado: typeof bruta.enunciado === 'string' ? bruta.enunciado : '',
    explicacao: bruta.explicacao as string,
    dica: bruta.dica as string,
    ...(bruta.armadilha ? { armadilha: bruta.armadilha as string } : {}),
    ...(bruta.fonte ? { fonte: bruta.fonte as string } : {}),
  };

  switch (tipo) {
    case 'certoErrado':
      return certoErrado(id, { ...comum, enunciado: bruta.afirmacao as string, certo: bruta.certo as boolean });
    case 'multipla':
      return escolha(id, { ...comum, opcoes: bruta.opcoes as string[], correta: bruta.correta as number });
    case 'completar':
      return completar(id, { ...comum, opcoes: bruta.opcoes as string[], correta: bruta.correta as number });
    case 'identificarErro':
      return identificar(id, {
        ...comum,
        enunciado: comum.enunciado || 'Toque no trecho com erro.',
        trechos: bruta.trechos as string[],
        erro: bruta.erro as number,
      });
    case 'ordenar':
      return ordenar(id, { ...comum, itens: bruta.itens as string[] });
    case 'ligarPares':
      return pares(id, { ...comum, pares: bruta.pares as [string, string][] });
  }
}

export function lerRascunho(json: unknown): { modulo: Modulo | null; problemas: string[] } {
  const problemas: string[] = [];
  if (!ehObjeto(json)) return { modulo: null, problemas: ['o rascunho não é um objeto JSON'] };

  if (!(ehTexto(json.id) && /^[a-z0-9-]+$/.test(json.id)))
    problemas.push('"id" deve ser texto em minúsculas, números e hífens, como "pt-pontuacao"');
  if (!ehTexto(json.nome)) problemas.push('falta "nome" do módulo');
  if (!MATERIAS.includes(json.materia as Modulo['materia']))
    problemas.push(`"materia" deve ser ${MATERIAS.map((m) => `"${m}"`).join(' ou ')}`);
  if (typeof json.incidencia !== 'number') problemas.push('"incidencia" deve ser um número de 0 a 1');
  if (!Array.isArray(json.partes)) problemas.push('"partes" deve ser uma lista');
  if (!Array.isArray(json.farol)) problemas.push('"farol" deve ser uma lista');
  if (problemas.length) return { modulo: null, problemas };

  const id = json.id as string;
  const partes: Parte[] = [];
  (json.partes as unknown[]).forEach((brutaParte, i) => {
    const onde = `partes[${i}]`;
    if (!ehObjeto(brutaParte) || !ehTexto(brutaParte.nome) || !Array.isArray(brutaParte.questoes)) {
      problemas.push(`${onde}: cada parte precisa de "nome" e da lista "questoes"`);
      return;
    }
    const idDaParte = `p${i + 1}`;
    const questoes = brutaParte.questoes
      .map((q, j) => lerQuestao(q, `${id}-${idDaParte}-${doisDigitos(j + 1)}`, `${onde}.questoes[${j}]`, problemas))
      .filter((q): q is Questao => q !== null);
    partes.push({ id: idDaParte, nome: brutaParte.nome as string, questoes });
  });
  const farol = (json.farol as unknown[])
    .map((q, j) => lerQuestao(q, `${id}-farol-${doisDigitos(j + 1)}`, `farol[${j}]`, problemas))
    .filter((q): q is Questao => q !== null);

  if (problemas.length) return { modulo: null, problemas };
  return {
    modulo: {
      id,
      materia: json.materia as Modulo['materia'],
      nome: json.nome as string,
      incidencia: json.incidencia as number,
      partes,
      farol,
    },
    problemas,
  };
}
