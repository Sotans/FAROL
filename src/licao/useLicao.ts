import { useEffect, useState } from 'react';

import { useProgresso } from '@/estado/progresso';
import { haptico } from '@/servicos/haptico';
import { tocar, tocarAcerto } from '@/servicos/som';
import { limites } from '@/tema/tokens';
import type { ModoDeErro, Questao } from './tipos';

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
  const { acertosSeguidos, registrarAcerto, quebrarSequenciaDeAcertos } = useProgresso();
  const [fila, setFila] = useState<Questao[]>(questoes);
  const [indice, setIndice] = useState(0);
  const [fase, setFase] = useState<Fase>('respondendo');
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [removidas, setRemovidas] = useState<number[]>([]);
  const [erros, setErros] = useState(0);
  const [dicasRestantes, setDicasRestantes] = useState<number>(limites.dicasPorDia);
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

  function conferir(i: number) {
    if (i === questao.correta) {
      const primeiraTentativa = erros === 0;
      // Só conta "de primeira" a questão original, não a que voltou ao final.
      if (primeiraTentativa && !questao.repetida) setAcertosDePrimeira((n) => n + 1);
      if (primeiraTentativa) registrarAcerto();
      setSelecionada(i);
      setFase('acerto');
      avancarBarra((indice + 1) / fila.length);
      return;
    }

    quebrarSequenciaDeAcertos();
    const total = erros + 1;
    setErros(total);
    setSelecionada(i);
    if (!questao.repetida && total === 1) {
      // A questão errada volta ao final da lição, uma única vez.
      setFila((f) => [...f, { ...questao, id: `${questao.id}-r`, repetida: true }]);
    }
    setRemovidas((r) => [...r, i]);
    if (modoDeErro === 'pular-para-o-fim') {
      setFase('seguir');
      const tamanho = fila.length + (!questao.repetida && total === 1 ? 1 : 0);
      avancarBarra((indice + 1) / tamanho);
      return;
    }
    setFase(total >= 2 ? 'guiada' : 'erro');
  }

  function escolher(i: number) {
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
    if (fase === 'respondendo' && selecionada !== null) conferir(selecionada);
  }

  function tentarDeNovo() {
    setSelecionada(null);
    setFase('respondendo');
  }

  function usarDica() {
    if (dicaAberta || fase === 'acerto' || fase === 'seguir') return;
    if (dicasRestantes > 0) {
      setDicasRestantes((d) => d - 1);
      setDicaAberta(true);
      haptico.leve();
    } else {
      setAvisoDeLimite(true);
      haptico.aviso();
    }
  }

  /** Anúncio recompensado (SIMULADO no protótipo): concede mais dicas. */
  function ganharDicas() {
    setDicasRestantes((d) => d + limites.dicasPorDia);
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
    dicasRestantes,
    dicaAberta,
    avisoDeLimite,
    acertosSeguidos,
    acertosDePrimeira,
    totalOriginal: questoes.length,
    progresso,
    escolher,
    confirmar,
    tentarDeNovo,
    usarDica,
    ganharDicas,
    proxima,
    fecharAvisoDeLimite: () => setAvisoDeLimite(false),
  };
}
