import { useEffect, useState } from 'react';

import { useProgresso } from '@/estado/progresso';
import { notaDaQuestao, type Nota } from '@/revisao/agenda';
import { haptico } from '@/servicos/haptico';
import { tocar, tocarAcerto } from '@/servicos/som';
import { limites } from '@/tema/tokens';
import { ordemEstaCorreta } from './respostas';
import { ehDeEscolha, type ModoDeErro, type Questao } from './tipos';

export type Fase = 'respondendo' | 'acerto' | 'erro' | 'guiada' | 'seguir';

/**
 * Motor da lição (ver docs/10-modelo-pedagogico.md, seção 5).
 *
 * Dois modos de erro, para comparar nos testes (docs/13-experimentos.md):
 * - tentar-de-novo: 1º erro deixa tentar de novo, 2º erro mostra a resposta guiada;
 * - pular-para-o-fim: o erro mostra a resposta e segue para a próxima questão.
 * Nos dois, a questão errada volta ao final da lição, uma única vez.
 *
 * A sequência de acertos é global (estado do app) e atravessa lições e desafios.
 * A barra de progresso nunca recua: se a fila cresce por causa de um erro, a barra
 * fica parada até alcançar o novo total, em vez de voltar.
 */
export function useLicao(questoes: Questao[], modoDeErro: ModoDeErro = 'tentar-de-novo') {
  const { acertosSeguidos, registrarAcerto, quebrarSequenciaDeAcertos, dicasHoje, registrarDica, ganharDicas } =
    useProgresso();
  const [fila, setFila] = useState<Questao[]>(questoes);
  const [indice, setIndice] = useState(0);
  const [fase, setFase] = useState<Fase>('respondendo');
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [removidas, setRemovidas] = useState<number[]>([]);
  // Ordenar: índices de `itens` na ordem em que a pessoa tocou.
  const [ordem, setOrdem] = useState<number[]>([]);
  const [erros, setErros] = useState(0);
  // Revisão espaçada: a nota de cada questão original, decidida na primeira vez que ela é resolvida.
  const [notas, setNotas] = useState<Record<string, Nota>>({});
  // Limite diário: o contador fica no estado do app e zera na virada do dia, não a cada lição.
  const dicasRestantes = Math.max(0, limites.dicasPorDia - dicasHoje);
  const [dicaAberta, setDicaAberta] = useState(false);
  const [avisoDeLimite, setAvisoDeLimite] = useState(false);
  const [acertosDePrimeira, setAcertosDePrimeira] = useState(0);
  // A barra nunca recua: guarda o maior valor já alcançado (ver o comentário no início).
  const [progresso, setProgresso] = useState(0);
  const avancarBarra = (valor: number) => setProgresso((p) => Math.max(p, valor));

  const questao = fila[indice];

  // Vibração e som acompanham o resultado. No acerto, a nota sobe com a sequência.
  useEffect(() => {
    if (fase === 'acerto') {
      haptico.sucesso();
      tocarAcerto(acertosSeguidos);
    } else if (fase === 'erro' || fase === 'guiada' || fase === 'seguir') {
      haptico.aviso();
      tocar('erro');
    }
    // A sequência muda no mesmo lote de render que a fase; só a fase dispara o efeito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, indice]);

  /**
   * Resultado de uma tentativa, para qualquer tipo de exercício.
   * `marca` é a opção tocada (exercícios de escolha), que fica marcada e, se errada, sai das opções.
   */
  /** Anota a nota da questão original uma única vez (a cópia que volta no fim não muda a nota). */
  function anotar(errou: boolean) {
    if (questao.repetida) return;
    const nota = notaDaQuestao({ errou, usouDica: dicaAberta, tipo: questao.tipo });
    setNotas((n) => (questao.id in n ? n : { ...n, [questao.id]: nota }));
  }

  function aplicarResultado(acertou: boolean, marca: number | null) {
    anotar(!acertou || erros > 0);
    if (acertou) {
      const primeiraTentativa = erros === 0;
      // Só conta "de primeira" a questão original, não a que voltou ao final.
      if (primeiraTentativa && !questao.repetida) setAcertosDePrimeira((n) => n + 1);
      if (primeiraTentativa) registrarAcerto();
      setSelecionada(marca);
      setFase('acerto');
      avancarBarra((indice + 1) / fila.length);
      return;
    }

    quebrarSequenciaDeAcertos();
    const total = erros + 1;
    setErros(total);
    setSelecionada(marca);
    if (!questao.repetida && total === 1) {
      // A questão errada volta ao final da lição, uma única vez.
      setFila((f) => [...f, { ...questao, id: `${questao.id}-r`, repetida: true }]);
    }
    if (marca !== null) setRemovidas((r) => [...r, marca]);
    if (modoDeErro === 'pular-para-o-fim') {
      setFase('seguir');
      const tamanho = fila.length + (!questao.repetida && total === 1 ? 1 : 0);
      avancarBarra((indice + 1) / tamanho);
      return;
    }
    setFase(total >= 2 ? 'guiada' : 'erro');
  }

  function conferir(i: number) {
    if (ehDeEscolha(questao)) aplicarResultado(i === questao.correta, i);
  }

  function escolher(i: number) {
    if (!ehDeEscolha(questao)) return;
    if (fase === 'guiada') {
      if (i === questao.correta) {
        setSelecionada(i);
        setFase('acerto');
        avancarBarra((indice + 1) / fila.length);
      }
      return;
    }
    if (fase !== 'respondendo') return;
    if (removidas.includes(i)) return;
    if (questao.modo === 'imediato') conferir(i);
    else setSelecionada(i);
  }

  function confirmar() {
    if (fase !== 'respondendo') return;
    if (questao.tipo === 'ordenar') aplicarResultado(ordemEstaCorreta(questao, ordem), null);
    else if (selecionada !== null) conferir(selecionada);
  }

  /** Ordenar: o bloco `i` (índice em `itens`) vai para o fim da sequência montada. */
  function adicionarAOrdem(i: number) {
    if (fase !== 'respondendo' || ordem.includes(i)) return;
    setOrdem((o) => [...o, i]);
  }

  /** Ordenar: tira da sequência o bloco na posição `posicao`; ele volta ao banco. */
  function removerDaOrdem(posicao: number) {
    if (fase !== 'respondendo') return;
    setOrdem((o) => o.filter((_, p) => p !== posicao));
  }

  /** Ligar pares: um par errado. Não mostra folha; conta como erro e quebra a sequência de acertos. */
  function errarPar() {
    if (fase !== 'respondendo') return;
    quebrarSequenciaDeAcertos();
    setErros((e) => e + 1);
    anotar(true);
    haptico.aviso();
    tocar('erro');
  }

  /** Ligar pares: todos os pares ligados. É "de primeira" se nenhum par errado foi tentado. */
  function concluirPares() {
    if (fase === 'respondendo') aplicarResultado(true, null);
  }

  /** Resposta guiada dos exercícios compostos: a tela já mostra a solução; a pessoa só confirma que viu. */
  function aceitarGuiada() {
    if (fase !== 'guiada') return;
    setFase('acerto');
    avancarBarra((indice + 1) / fila.length);
  }

  function tentarDeNovo() {
    setSelecionada(null);
    setOrdem([]);
    setFase('respondendo');
  }

  function usarDica() {
    if (dicaAberta || fase === 'acerto' || fase === 'seguir') return;
    if (dicasRestantes > 0) {
      registrarDica();
      setDicaAberta(true);
      haptico.leve();
    } else {
      setAvisoDeLimite(true);
      haptico.aviso();
    }
  }

  /** Anúncio recompensado (SIMULADO no protótipo): devolve as dicas do dia. */
  function ganharMaisDicas() {
    ganharDicas();
    setAvisoDeLimite(false);
    haptico.sucesso();
  }

  /** Avança para a próxima questão. Retorna true se a lição terminou. */
  function proxima(): boolean {
    if (indice + 1 >= fila.length) return true;
    setIndice(indice + 1);
    setFase('respondendo');
    setSelecionada(null);
    setRemovidas([]);
    setOrdem([]);
    setErros(0);
    setDicaAberta(false);
    return false;
  }

  return {
    questao,
    indice,
    total: fila.length,
    fase,
    selecionada,
    removidas,
    ordem,
    notas,
    dicasRestantes,
    dicaAberta,
    avisoDeLimite,
    acertosSeguidos,
    acertosDePrimeira,
    totalOriginal: questoes.length,
    progresso,
    escolher,
    confirmar,
    adicionarAOrdem,
    removerDaOrdem,
    errarPar,
    concluirPares,
    aceitarGuiada,
    tentarDeNovo,
    usarDica,
    ganharDicas: ganharMaisDicas,
    proxima,
    fecharAvisoDeLimite: () => setAvisoDeLimite(false),
  };
}
