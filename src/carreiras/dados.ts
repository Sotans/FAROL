export type CarreiraId = 'administrativo' | 'tribunais' | 'policial' | 'bancario' | 'fiscal' | 'professor' | 'saude';

export type Carreira = {
  id: CarreiraId;
  nome: string;
  descricao: string;
  /** Ícone do cartão de escolha. PROVISÓRIO: os ícones finais vêm na submeta 1.10. */
  icone: string;
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
    icone: '🗂️',
    personagem: '🧑‍💼',
    ativa: true,
  },
  {
    id: 'tribunais',
    nome: 'Tribunais',
    descricao: 'Técnico e analista judiciário',
    icone: '⚖️',
    personagem: '🧑‍⚖️',
    ativa: true,
  },
  {
    id: 'policial',
    nome: 'Policial',
    descricao: 'PM, Civil, Penal, Federal',
    icone: '👮',
    personagem: '👮',
    ativa: true,
  },
  { id: 'bancario', nome: 'Bancário', descricao: 'Bancos públicos', icone: '🏦', personagem: '🧑‍💻', ativa: false },
  {
    id: 'fiscal',
    nome: 'Fiscal',
    descricao: 'Receita, fazendas estaduais',
    icone: '🧾',
    personagem: '🕵️',
    ativa: false,
  },
  {
    id: 'professor',
    nome: 'Professor',
    descricao: 'Redes municipais e estaduais',
    icone: '🧑‍🏫',
    personagem: '🧑‍🏫',
    ativa: false,
  },
  { id: 'saude', nome: 'Saúde', descricao: 'Hospitais e secretarias', icone: '🩺', personagem: '🧑‍⚕️', ativa: false },
];

export function carreiraPorId(id: CarreiraId | null): Carreira | null {
  return carreiras.find((c) => c.id === id) ?? null;
}
