export type CarreiraId = 'administrativo' | 'tribunais' | 'policial' | 'bancario' | 'fiscal' | 'professor' | 'saude';

export type Carreira = {
  id: CarreiraId;
  nome: string;
  descricao: string;
  /** Carreiras sem conteúdo aparecem como "em breve" e têm os toques contados. */
  ativa: boolean;
};

export const carreiras: Carreira[] = [
  {
    id: 'administrativo',
    nome: 'Administrativo',
    descricao: 'INSS, prefeituras, órgãos públicos',
    ativa: true,
  },
  {
    id: 'tribunais',
    nome: 'Tribunais',
    descricao: 'Técnico e analista judiciário',
    ativa: true,
  },
  {
    id: 'policial',
    nome: 'Policial',
    descricao: 'PM, Civil, Penal, Federal',
    ativa: true,
  },
  { id: 'bancario', nome: 'Bancário', descricao: 'Bancos públicos', ativa: false },
  {
    id: 'fiscal',
    nome: 'Fiscal',
    descricao: 'Receita, fazendas estaduais',
    ativa: false,
  },
  {
    id: 'professor',
    nome: 'Professor',
    descricao: 'Redes municipais e estaduais',
    ativa: false,
  },
  { id: 'saude', nome: 'Saúde', descricao: 'Hospitais e secretarias', ativa: false },
];

export function carreiraPorId(id: CarreiraId | null): Carreira | null {
  return carreiras.find((c) => c.id === id) ?? null;
}
