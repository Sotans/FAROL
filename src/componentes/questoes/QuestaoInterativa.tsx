import { respostaCerta, respostaInicial, type RespostaInterativa } from '@/licao/interativas';
import type { QuestaoInterativa as Questao } from '@/licao/tipos';
import type { Situacao } from '../Exercicio';
import { Corrigir } from './Corrigir';
import { Associacao, Combinatoria, TabelaVerdade, Venn } from './Logica';
import { Classificar, MontarFrase, Proporcao } from './Montagem';
import { Regua } from './Regua';
import type { Tom } from './comum';

/**
 * A área de resposta das questões interativas. A resposta fica no motor da lição (controlada),
 * para "tentar de novo" e a próxima questão recomeçarem do zero sem truques de chave.
 * Na solução revelada, mostra a resposta certa.
 */
export function QuestaoInterativa({
  questao,
  situacao,
  resposta,
  onMudar,
}: {
  questao: Questao;
  situacao: Situacao;
  resposta: RespostaInterativa | null;
  onMudar: (r: RespostaInterativa) => void;
}) {
  const revelada = situacao === 'revelada';
  const mostrada = revelada ? respostaCerta(questao) : (resposta ?? respostaInicial(questao));
  const tom: Tom = situacao === 'acerto' || revelada ? 'certo' : situacao === 'erro' ? 'errado' : 'neutro';
  const comum = { resposta: mostrada, tom, travada: situacao !== 'respondendo', onMudar };

  switch (questao.tipo) {
    case 'regua':
      return <Regua questao={questao} {...comum} />;
    case 'proporcao':
      return <Proporcao questao={questao} {...comum} />;
    case 'combinatoria':
      return <Combinatoria questao={questao} {...comum} />;
    case 'tabelaVerdade':
      return <TabelaVerdade questao={questao} {...comum} />;
    case 'venn':
      return <Venn questao={questao} {...comum} />;
    case 'montarFrase':
      return <MontarFrase questao={questao} {...comum} />;
    case 'associacao':
      return <Associacao questao={questao} {...comum} />;
    case 'certoErradoCorrige':
      return <Corrigir questao={questao} {...comum} />;
    case 'classificar':
      return <Classificar questao={questao} {...comum} />;
  }
}
