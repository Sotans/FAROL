import type {
  QuestaoDeAssociacao,
  QuestaoDeClassificar,
  QuestaoDeCombinatoria,
  QuestaoDeCorrigir,
  QuestaoDeMontarFrase,
  QuestaoDeProporcao,
  QuestaoDeRegua,
  QuestaoDeTabelaVerdade,
  QuestaoDeVenn,
  QuestaoInterativa,
  RegiaoDeVenn,
  ValorLogico,
} from './tipos';

/**
 * Respostas e conferência das questões interativas (arrastar, encaixar, ajustar).
 * Funções puras: a lição, o desafio e os testes usam a mesma regra.
 */

export type MarcaDeAssociacao = 'sim' | 'nao' | null;

export type RespostaInterativa =
  | { tipo: 'regua'; valor: number }
  | { tipo: 'proporcao'; relacao: 'direta' | 'inversa' | null; vagas: (number | null)[] }
  | { tipo: 'combinatoria'; n: number; p: number; ordemImporta: boolean | null }
  | { tipo: 'tabelaVerdade'; valores: (ValorLogico | null)[] }
  | { tipo: 'venn'; regiao: RegiaoDeVenn | null }
  | { tipo: 'montarFrase'; pecas: number[] }
  | { tipo: 'associacao'; marcas: MarcaDeAssociacao[][] }
  | {
      tipo: 'certoErradoCorrige';
      julgamento: 'certo' | 'errado' | null;
      trecho: number | null;
      correcao: number | null;
    }
  | { tipo: 'classificar'; colunaDe: (0 | 1 | null)[] };

/** A resposta "em branco" de cada tipo: o ponto de partida da tela. */
export function respostaInicial(q: QuestaoInterativa): RespostaInterativa {
  switch (q.tipo) {
    case 'regua':
      return { tipo: 'regua', valor: q.inicial ?? arredondar(q, (q.min + q.max) / 2) };
    case 'proporcao':
      return { tipo: 'proporcao', relacao: null, vagas: [null, null, null] };
    case 'combinatoria':
      return { tipo: 'combinatoria', n: 5, p: 2, ordemImporta: null };
    case 'tabelaVerdade':
      return { tipo: 'tabelaVerdade', valores: q.resultado.map(() => null) };
    case 'venn':
      return { tipo: 'venn', regiao: null };
    case 'montarFrase':
      return { tipo: 'montarFrase', pecas: [] };
    case 'associacao':
      return { tipo: 'associacao', marcas: q.linhas.map(() => q.colunas.map(() => null)) };
    case 'certoErradoCorrige':
      return { tipo: 'certoErradoCorrige', julgamento: null, trecho: null, correcao: null };
    case 'classificar':
      return { tipo: 'classificar', colunaDe: q.itens.map(() => null) };
  }
}

/** Arredonda para o passo da régua, dentro dos limites. */
export function arredondar(q: Pick<QuestaoDeRegua, 'min' | 'max' | 'passo'>, valor: number): number {
  const v = Math.round((valor - q.min) / q.passo) * q.passo + q.min;
  return Math.min(q.max, Math.max(q.min, Number(v.toFixed(6))));
}

/** A resposta já pode ser conferida? (O Confirmar acende.) */
export function respostaCompleta(q: QuestaoInterativa, r: RespostaInterativa | null, mexeu = true): boolean {
  if (!r || r.tipo !== q.tipo) return false;
  switch (r.tipo) {
    case 'regua':
      // A régua sempre tem um valor: o Confirmar acende depois que a pessoa mexe no marcador.
      return mexeu;
    case 'proporcao':
      return r.relacao !== null && r.vagas.every((v) => v !== null);
    case 'combinatoria':
      return r.ordemImporta !== null;
    case 'tabelaVerdade':
      return r.valores.every((v) => v !== null);
    case 'venn':
      return r.regiao !== null;
    case 'montarFrase':
      return r.pecas.length > 0;
    case 'associacao':
      return r.marcas.every((linha) => linha.filter((m) => m === 'sim').length === 1);
    case 'certoErradoCorrige':
      return r.julgamento === 'certo' || (r.julgamento === 'errado' && r.trecho !== null && r.correcao !== null);
    case 'classificar':
      return r.colunaDe.every((c) => c !== null);
  }
}

/** A resposta está certa? */
export function conferirInterativa(q: QuestaoInterativa, r: RespostaInterativa): boolean {
  if (r.tipo !== q.tipo) return false;
  switch (q.tipo) {
    case 'regua':
      return r.tipo === 'regua' && r.valor === q.correta;
    case 'proporcao':
      return r.tipo === 'proporcao' && conferirProporcao(q, r.relacao, r.vagas);
    case 'combinatoria':
      return r.tipo === 'combinatoria' && conferirCombinatoria(q, r.n, r.p, r.ordemImporta);
    case 'tabelaVerdade':
      return r.tipo === 'tabelaVerdade' && conferirTabela(q, r.valores);
    case 'venn':
      return r.tipo === 'venn' && conferirVenn(q, r.regiao);
    case 'montarFrase':
      return r.tipo === 'montarFrase' && conferirFrase(q, r.pecas);
    case 'associacao':
      return r.tipo === 'associacao' && conferirAssociacao(q, r.marcas);
    case 'certoErradoCorrige':
      return r.tipo === 'certoErradoCorrige' && conferirCorrecao(q, r.julgamento, r.trecho, r.correcao);
    case 'classificar':
      return r.tipo === 'classificar' && conferirClassificacao(q, r.colunaDe);
  }
}

export function conferirProporcao(
  q: QuestaoDeProporcao,
  relacao: 'direta' | 'inversa' | null,
  vagas: readonly (number | null)[],
): boolean {
  if (relacao !== q.relacao) return false;
  return q.montagens.some((m) => m.every((valor, i) => vagas[i] === valor));
}

export function conferirCombinatoria(q: QuestaoDeCombinatoria, n: number, p: number, ordem: boolean | null): boolean {
  return n === q.n && p === q.p && ordem === q.ordemImporta;
}

export function conferirTabela(q: QuestaoDeTabelaVerdade, valores: readonly (ValorLogico | null)[]): boolean {
  return q.resultado.every((v, i) => valores[i] === v);
}

export function conferirVenn(q: QuestaoDeVenn, regiao: RegiaoDeVenn | null): boolean {
  return regiao === q.correta;
}

/** A frase vale pelo texto das peças: duas peças iguais são intercambiáveis. */
export function conferirFrase(q: QuestaoDeMontarFrase, pecas: readonly number[]): boolean {
  const frase = pecas.map((i) => q.pecas[i]);
  return frase.length === q.correta.length && frase.every((p, i) => p === q.correta[i]);
}

export function conferirAssociacao(q: QuestaoDeAssociacao, marcas: readonly MarcaDeAssociacao[][]): boolean {
  return q.correta.every((coluna, linha) => {
    const sins = (marcas[linha] ?? []).flatMap((m, c) => (m === 'sim' ? [c] : []));
    return sins.length === 1 && sins[0] === coluna;
  });
}

export function conferirCorrecao(
  q: QuestaoDeCorrigir,
  julgamento: 'certo' | 'errado' | null,
  trecho: number | null,
  correcao: number | null,
): boolean {
  if (q.errado === null) return julgamento === 'certo';
  return julgamento === 'errado' && trecho === q.errado && correcao === q.correcao;
}

export function conferirClassificacao(q: QuestaoDeClassificar, colunaDe: readonly (0 | 1 | null)[]): boolean {
  return q.itens.every((item, i) => colunaDe[i] === item.coluna);
}

/** Fatorial pequeno (até 12, o limite dos controles). */
function fatorial(k: number): number {
  let r = 1;
  for (let i = 2; i <= k; i += 1) r *= i;
  return r;
}

/** Arranjo (a ordem importa) ou combinação de n elementos, p a p. */
export function contarFormas(n: number, p: number, ordemImporta: boolean): number {
  if (p > n || p < 0) return 0;
  const arranjo = fatorial(n) / fatorial(n - p);
  return ordemImporta ? arranjo : arranjo / fatorial(p);
}

/** Próximo estado de uma casa da grade de associação: vazia → ✓ → ✗ → vazia. */
export function proximaMarca(m: MarcaDeAssociacao): MarcaDeAssociacao {
  return m === null ? 'sim' : m === 'sim' ? 'nao' : null;
}

/** A resposta certa, para mostrar a solução (resposta guiada, "pular para o fim" e desafio). */
export function respostaCerta(q: QuestaoInterativa): RespostaInterativa {
  switch (q.tipo) {
    case 'regua':
      return { tipo: 'regua', valor: q.correta };
    case 'proporcao':
      return { tipo: 'proporcao', relacao: q.relacao, vagas: [...q.montagens[0]] };
    case 'combinatoria':
      return { tipo: 'combinatoria', n: q.n, p: q.p, ordemImporta: q.ordemImporta };
    case 'tabelaVerdade':
      return { tipo: 'tabelaVerdade', valores: [...q.resultado] };
    case 'venn':
      return { tipo: 'venn', regiao: q.correta };
    case 'montarFrase': {
      const usadas = new Set<number>();
      const pecas = q.correta.map((texto) => {
        const i = q.pecas.findIndex((p, j) => p === texto && !usadas.has(j));
        usadas.add(i);
        return i;
      });
      return { tipo: 'montarFrase', pecas };
    }
    case 'associacao':
      return {
        tipo: 'associacao',
        marcas: q.linhas.map((_, l) => q.colunas.map((_c, c) => (c === q.correta[l] ? 'sim' : null))),
      };
    case 'certoErradoCorrige':
      return q.errado === null
        ? { tipo: 'certoErradoCorrige', julgamento: 'certo', trecho: null, correcao: null }
        : { tipo: 'certoErradoCorrige', julgamento: 'errado', trecho: q.errado, correcao: q.correcao };
    case 'classificar':
      return { tipo: 'classificar', colunaDe: q.itens.map((i) => i.coluna) };
  }
}
