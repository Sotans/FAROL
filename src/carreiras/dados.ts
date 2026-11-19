export type CarreiraId = 'administrativo' | 'tribunais' | 'policial' | 'bancario' | 'fiscal' | 'professor' | 'saude';

export type Carreira = {
  id: CarreiraId;
  nome: string;
  descricao: string;
  /** Personagem-guia. PROVISÓRIO: o personagem final vem na submeta 1.12. */
  personagem: string;
  /** Carreiras sem conteúdo aparecem como "em breve" e têm os toques contados. */
  ativa: boolean;
};

export const carreiras: Carreira[] = [
  {
    id: 'administrativo',
    nome: 'Administrativo',
    descricao: 'INSS, prefeituras, órgãos públicos',
    personagem: '🧑‍💼',
    ativa: true,
  },
  {
    id: 'tribunais',
    nome: 'Tribunais',
    descricao: 'Técnico e analista judiciário',
    personagem: '🧑‍⚖️',
    ativa: true,
  },
  {
    id: 'policial',
    nome: 'Policial',
    descricao: 'PM, Civil, Penal, Federal',
    personagem: '👮',
    ativa: true,
  },
  { id: 'bancario', nome: 'Bancário', descricao: 'Bancos públicos', personagem: '🧑‍💻', ativa: false },
  {
    id: 'fiscal',
    nome: 'Fiscal',
    descricao: 'Receita, fazendas estaduais',
    personagem: '🕵️',
    ativa: false,
  },
  {
    id: 'professor',
    nome: 'Professor',
    descricao: 'Redes municipais e estaduais',
    personagem: '🧑‍🏫',
    ativa: false,
  },
  { id: 'saude', nome: 'Saúde', descricao: 'Hospitais e secretarias', personagem: '🧑‍⚕️', ativa: false },
];

export function carreiraPorId(id: CarreiraId | null): Carreira | null {
  return carreiras.find((c) => c.id === id) ?? null;
}
