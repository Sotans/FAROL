import { useEffect, useState } from 'react';

import { useProgresso } from '@/estado/progresso';
import { haptico } from '@/servicos/haptico';
import { tocar, tocarAcerto } from '@/servicos/som';
import { limites } from '@/tema/tokens';
import { ordemEstaCorreta } from '@/licao/respostas';
import { ehDeEscolha, type Questao } from '@/licao/tipos';

export type FaseDoDesafio = 'respondendo' | 'acerto' | 'erro' | 'venceu' | 'apagou';

/**
 * Desafio "Pular pra cá?" (docs/10-modelo-pedagogico.md, seção 9):
 * 5 luzes, cada erro apaga uma. Sem dica, sem nova tentativa (em ligar pares, o primeiro par errado já conta).
 * Se as 5 se apagarem, termina sem punição: a lição continua esperando.
 * A sequência de acertos é a mesma da lição (global), e continua aqui.
 */
export function useDesafio(questoes: Questao[]) {
  const { acertosSeguidos, registrarAcerto, quebrarSequenciaDeAcertos } = useProgresso();
  const [indice, setIndice] = useState(0);
  const [fase, setFase] = useState<FaseDoDesafio>('respondendo');
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [ordem, setOrdem] = useState<number[]>([]);
  const [luzes, setLuzes] = useState<number>(limites.luzesDoDesafio);
  const [acertos, setAcertos] = useState(0);

  const questao = questoes[indice];

  useEffect(() => {
    if (fase === 'acerto') {
      haptico.sucesso();
      tocarAcerto(acertosSeguidos);
    } else if (fase === 'erro') {
      haptico.aviso();
      tocar('luz-apagada');
    } else if (fase === 'venceu') {
      haptico.pulsosDoFarol();
      tocar('farol');
    } else if (fase === 'apagou') {
      haptico.medio();
      tocar('luz-apagada');
    }
    // A sequência muda no mesmo lote de render que a fase; só a fase dispara o efeito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, indice]);

  function aplicarResultado(acertou: boolean) {
    if (acertou) {
      setAcertos((n) => n + 1);
      registrarAcerto();
      setFase('acerto');
      return;
    }
    quebrarSequenciaDeAcertos();
    const restantes = luzes - 1;
    setLuzes(restantes);
    setFase(restantes <= 0 ? 'apagou' : 'erro');
  }

  function conferir(i: number) {
    if (!ehDeEscolha(questao)) return;
    setSelecionada(i);
    aplicarResultado(i === questao.correta);
  }

  function escolher(i: number) {
    if (fase !== 'respondendo') return;
    if (questao.modo === 'imediato') conferir(i);
    else setSelecionada(i);
  }

  function confirmar() {
    if (fase !== 'respondendo') return;
    if (questao.tipo === 'ordenar') aplicarResultado(ordemEstaCorreta(questao, ordem));
    else if (selecionada !== null) conferir(selecionada);
  }

  function adicionarAOrdem(i: number) {
    if (fase !== 'respondendo' || ordem.includes(i)) return;
    setOrdem((o) => [...o, i]);
  }

  function removerDaOrdem(posicao: number) {
    if (fase !== 'respondendo') return;
    setOrdem((o) => o.filter((_, p) => p !== posicao));
  }

  function errarPar() {
    if (fase === 'respondendo') aplicarResultado(false);
  }

  function concluirPares() {
    if (fase === 'respondendo') aplicarResultado(true);
  }

  function proxima() {
    if (indice + 1 >= questoes.length) {
      setFase('venceu');
      return;
    }
    setIndice(indice + 1);
    setSelecionada(null);
    setOrdem([]);
    setFase('respondendo');
  }

  return {
    questao,
    indice,
    total: questoes.length,
    fase,
    selecionada,
    ordem,
    luzes,
    acertos,
    acertosSeguidos,
    progresso: (indice + (fase === 'acerto' || fase === 'erro' ? 1 : 0)) / questoes.length,
    escolher,
    confirmar,
    adicionarAOrdem,
    removerDaOrdem,
    errarPar,
    concluirPares,
    proxima,
  };
}
