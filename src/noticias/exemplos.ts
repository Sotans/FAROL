import type { CarreiraId } from '@/carreiras/dados';

/** Tipo da notícia: decide o rótulo do card. */
export type TipoDeNoticia = 'edital' | 'prova' | 'resultado' | 'dica';

export type Noticia = {
  id: string;
  tipo: TipoDeNoticia;
  titulo: string;
  resumo: string;
  /** Data de publicação (AAAA-MM-DD). */
  data: string;
  /** Carreiras a que a notícia interessa; vazia = todas. */
  carreiras: CarreiraId[];
};

export const rotuloDoTipo: Record<TipoDeNoticia, string> = {
  edital: 'Edital',
  prova: 'Prova',
  resultado: 'Resultado',
  dica: 'Dica de estudo',
};

/**
 * Notícias de EXEMPLO, para testar o formato da aba. Não são reais: órgãos, números e datas
 * foram inventados. O conteúdo de verdade (fonte, curadoria, atualização) ainda vai ser definido.
 */
export const noticiasDeExemplo: Noticia[] = [
  {
    id: 'ex-1',
    tipo: 'edital',
    titulo: 'Tribunal regional abre 120 vagas para técnico e analista',
    resumo: 'Inscrições até 15 de janeiro. Português e Direito pesam metade da prova objetiva.',
    data: '2026-11-26',
    carreiras: ['tribunais'],
  },
  {
    id: 'ex-2',
    tipo: 'edital',
    titulo: 'Prefeitura de capital publica edital com 300 vagas administrativas',
    resumo: 'Nível médio, salário inicial de R$ 3.800. Prova prevista para março.',
    data: '2026-11-25',
    carreiras: ['administrativo'],
  },
  {
    id: 'ex-3',
    tipo: 'prova',
    titulo: 'Polícia estadual confirma data da prova objetiva',
    resumo: 'A prova será em 22 de fevereiro, pela manhã. O teste físico vem depois do resultado.',
    data: '2026-11-24',
    carreiras: ['policial'],
  },
  {
    id: 'ex-4',
    tipo: 'resultado',
    titulo: 'Banca divulga gabarito preliminar de concurso de tribunal',
    resumo: 'Os recursos ficam abertos por 3 dias úteis a partir da publicação.',
    data: '2026-11-23',
    carreiras: ['tribunais'],
  },
  {
    id: 'ex-5',
    tipo: 'dica',
    titulo: 'Vírgula entre sujeito e verbo: o erro que mais cai',
    resumo: 'As bancas adoram separar o sujeito do verbo com vírgula. Treine na trilha de Português.',
    data: '2026-11-22',
    carreiras: [],
  },
  {
    id: 'ex-6',
    tipo: 'edital',
    titulo: 'Instituto federal autoriza concurso para assistente administrativo',
    resumo: 'A autorização sai antes do edital: é a hora de começar a estudar.',
    data: '2026-11-20',
    carreiras: ['administrativo'],
  },
  {
    id: 'ex-7',
    tipo: 'dica',
    titulo: 'Crase antes de palavra masculina? Quase nunca',
    resumo: 'Veja os poucos casos em que ela aparece e por que as bancas cobram tanto.',
    data: '2026-11-18',
    carreiras: [],
  },
];

/** As notícias da carreira (mais as que servem a todas), da mais nova para a mais antiga. */
export function noticiasDaCarreira(noticias: readonly Noticia[], carreira: CarreiraId | null): Noticia[] {
  return noticias
    .filter((n) => carreira === null || n.carreiras.length === 0 || n.carreiras.includes(carreira))
    .sort((a, b) => b.data.localeCompare(a.data));
}

/** "Hoje", "Ontem", "Há 3 dias" ou a data, a partir de hoje (AAAA-MM-DD). */
export function quandoFoiPublicada(data: string, hoje: string): string {
  const dias = Math.round((Date.parse(`${hoje}T12:00:00Z`) - Date.parse(`${data}T12:00:00Z`)) / 86_400_000);
  if (dias <= 0) return 'Hoje';
  if (dias === 1) return 'Ontem';
  if (dias < 7) return `Há ${dias} dias`;
  const [, mes, dia] = data.split('-');
  return `${dia}/${mes}`;
}
