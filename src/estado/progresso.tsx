import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { CarreiraId } from '@/carreiras/dados';
import type { TomDePele } from '@/componentes/Personagem';
import type { Mapa } from '@/diagnostico/dados';
import { totalDeNos, totalDePartes } from '@/licao/dados';
import type { ModoDeErro } from '@/licao/tipos';
import { carregarEstado, salvarEstado } from '@/servicos/armazenamento';
import { haptico } from '@/servicos/haptico';
import { tocar } from '@/servicos/som';
import { limites } from '@/tema/tokens';

export type MetaDiaria = 1 | 2 | 3;

export type Estado = {
  onboardingConcluido: boolean;
  carreira: CarreiraId | null;
  /** Tom de pele do guia, escolhido pela pessoa (docs/08, seção 7). */
  tomDoGuia: TomDePele;
  metaDiaria: MetaDiaria;
  /** Mapa do ponto de partida (diagnóstico). null = ainda não feito. */
  mapa: Mapa | null;
  /**
   * Nós concluídos em sequência (lições, desafio e, por último, o farol). O índice `concluidas` é o nó atual.
   * Igual ao número de partes: o farol é o atual. Igual ao total de nós: farol aceso.
   */
  concluidas: number;
  /** Partes marcadas como dominadas pelo desafio "Pular pra cá?". */
  dominadas: number[];
  licoesHoje: number;
  desafiosHoje: number;
  /** Dia (AAAA-MM-DD) a que os contadores "hoje" se referem. */
  dia: string;
  ultimoDiaDeEstudo: string | null;
  sequencia: number;
  xp: number;
  /** Acertos seguidos: uma sequência só, que atravessa questões, lições e desafios. Só zera ao errar. */
  acertosSeguidos: number;
  /** Toques em carreiras "em breve": mede a demanda antes de produzir conteúdo. */
  toquesEmBreve: Partial<Record<CarreiraId, number>>;
};

type Progresso = Estado & {
  /** false até o estado salvo ser lido do aparelho. */
  carregado: boolean;
  /** Experimento: o que acontece quando a pessoa erra (ver docs/13-experimentos.md). */
  modoDeErro: ModoDeErro;
  /** A cada 5 acertos seguidos, o número a celebrar; null fora disso. */
  celebracaoDeSequencia: number | null;
  definirCarreira: (id: CarreiraId) => void;
  definirTomDoGuia: (tom: TomDePele) => void;
  definirMetaDiaria: (meta: MetaDiaria) => void;
  concluirOnboarding: () => void;
  definirMapa: (mapa: Mapa) => void;
  registrarToqueEmBreve: (id: CarreiraId) => void;
  registrarAcerto: () => void;
  quebrarSequenciaDeAcertos: () => void;
  /** Conclui o nó atual (lição ou farol) e soma o XP dele. */
  concluir: (xp: number) => void;
  /** Resultado do desafio: as partes de `concluidas` até `ate - 1` ficam dominadas e `ate` vira o nó atual. */
  dominarAte: (ate: number) => void;
  registrarDesafio: () => void;
  /** Anúncio recompensado (SIMULADO): concede mais um desafio hoje. */
  ganharDesafio: () => void;
  reiniciar: () => void;
  alternarModoDeErro: () => void;
};

function hoje(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function diasEntre(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00`) - Date.parse(`${a}T00:00:00`);
  return Math.round(ms / 86_400_000);
}

export const estadoInicial: Estado = {
  onboardingConcluido: false,
  carreira: null,
  tomDoGuia: 'medio',
  metaDiaria: 1,
  mapa: null,
  concluidas: 0,
  dominadas: [],
  licoesHoje: 0,
  desafiosHoje: 0,
  dia: hoje(),
  ultimoDiaDeEstudo: null,
  sequencia: 0,
  xp: 0,
  acertosSeguidos: 0,
  toquesEmBreve: {},
};

/**
 * Virada de dia: zera os contadores "hoje".
 * Regra PROVISÓRIA da sequência de dias (decisão em aberto em docs/03, seção 4): com dois ou mais
 * dias sem estudar, a sequência volta a zero, em silêncio e sem mensagem de culpa.
 */
function virarDia(e: Estado): Estado {
  const atual = hoje();
  if (e.dia === atual) return e;
  let sequencia = e.sequencia;
  if (e.ultimoDiaDeEstudo && diasEntre(e.ultimoDiaDeEstudo, atual) >= 2) sequencia = 0;
  return { ...e, dia: atual, licoesHoje: 0, desafiosHoje: 0, sequencia };
}

const Contexto = createContext<Progresso | null>(null);

export function ProgressoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(estadoInicial);
  const [carregado, setCarregado] = useState(false);
  const [modoDeErro, setModoDeErro] = useState<ModoDeErro>('tentar-de-novo');
  const [celebracaoDeSequencia, setCelebracaoDeSequencia] = useState<number | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Espelho do valor atual, para o manipulador de acerto decidir a celebração sem ler estado velho.
  const seguidosAtual = useRef(0);
  useEffect(() => {
    seguidosAtual.current = estado.acertosSeguidos;
  }, [estado.acertosSeguidos]);

  // Lê o estado salvo no aparelho uma vez, na abertura.
  useEffect(() => {
    let ativo = true;
    carregarEstado(estadoInicial).then((salvo) => {
      if (!ativo) return;
      setEstado(virarDia(salvo));
      setCarregado(true);
    });
    return () => {
      ativo = false;
    };
  }, []);

  // Grava toda mudança, depois de carregado.
  useEffect(() => {
    if (carregado) salvarEstado(estado);
  }, [estado, carregado]);

  const definirCarreira = useCallback((id: CarreiraId) => setEstado((e) => ({ ...e, carreira: id })), []);
  const definirTomDoGuia = useCallback((tom: TomDePele) => setEstado((e) => ({ ...e, tomDoGuia: tom })), []);
  const definirMetaDiaria = useCallback((meta: MetaDiaria) => setEstado((e) => ({ ...e, metaDiaria: meta })), []);
  const concluirOnboarding = useCallback(() => setEstado((e) => ({ ...e, onboardingConcluido: true })), []);
  const definirMapa = useCallback((mapa: Mapa) => setEstado((e) => ({ ...e, mapa })), []);

  const registrarToqueEmBreve = useCallback(
    (id: CarreiraId) =>
      setEstado((e) => ({ ...e, toquesEmBreve: { ...e.toquesEmBreve, [id]: (e.toquesEmBreve[id] ?? 0) + 1 } })),
    [],
  );

  const celebrar = useCallback((seguidos: number) => {
    // Celebração a cada 5: pop-up, acorde e pulso forte (docs/08, momento 3).
    setCelebracaoDeSequencia(seguidos);
    haptico.forte();
    tocar('licao');
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setCelebracaoDeSequencia(null), 1500);
  }, []);

  const registrarAcerto = useCallback(() => {
    const seguidos = seguidosAtual.current + 1;
    seguidosAtual.current = seguidos;
    setEstado((e) => ({ ...e, acertosSeguidos: seguidos }));
    if (seguidos % 5 === 0) celebrar(seguidos);
  }, [celebrar]);

  // Ao perder, nada é comunicado: o ciclo só recomeça.
  const quebrarSequenciaDeAcertos = useCallback(() => {
    seguidosAtual.current = 0;
    setEstado((e) => (e.acertosSeguidos === 0 ? e : { ...e, acertosSeguidos: 0 }));
  }, []);

  const concluir = useCallback((xp: number) => {
    setEstado((e) => {
      const atual = virarDia(e);
      return {
        ...atual,
        concluidas: Math.min(atual.concluidas + 1, totalDeNos),
        licoesHoje: atual.licoesHoje + 1,
        sequencia: atual.licoesHoje === 0 ? atual.sequencia + 1 : atual.sequencia,
        ultimoDiaDeEstudo: atual.dia,
        xp: atual.xp + xp,
      };
    });
  }, []);

  const dominarAte = useCallback((ate: number) => {
    setEstado((e) => {
      const novas: number[] = [];
      for (let i = e.concluidas; i < ate; i += 1) novas.push(i);
      return {
        ...e,
        concluidas: Math.min(Math.max(ate, e.concluidas), totalDePartes),
        dominadas: [...e.dominadas, ...novas],
        xp: e.xp + limites.xpDoDesafio,
      };
    });
  }, []);

  const registrarDesafio = useCallback(() => {
    setEstado((e) => {
      const atual = virarDia(e);
      return { ...atual, desafiosHoje: atual.desafiosHoje + 1 };
    });
  }, []);

  const ganharDesafio = useCallback(
    () => setEstado((e) => ({ ...e, desafiosHoje: Math.max(0, e.desafiosHoje - 1) })),
    [],
  );

  const reiniciar = useCallback(() => setEstado({ ...estadoInicial, dia: hoje() }), []);

  const alternarModoDeErro = useCallback(
    () => setModoDeErro((m) => (m === 'tentar-de-novo' ? 'pular-para-o-fim' : 'tentar-de-novo')),
    [],
  );

  const valor = useMemo(
    () => ({
      ...estado,
      carregado,
      modoDeErro,
      celebracaoDeSequencia,
      definirCarreira,
      definirTomDoGuia,
      definirMetaDiaria,
      concluirOnboarding,
      definirMapa,
      registrarToqueEmBreve,
      registrarAcerto,
      quebrarSequenciaDeAcertos,
      concluir,
      dominarAte,
      registrarDesafio,
      ganharDesafio,
      reiniciar,
      alternarModoDeErro,
    }),
    [
      estado,
      carregado,
      modoDeErro,
      celebracaoDeSequencia,
      definirCarreira,
      definirTomDoGuia,
      definirMetaDiaria,
      concluirOnboarding,
      definirMapa,
      registrarToqueEmBreve,
      registrarAcerto,
      quebrarSequenciaDeAcertos,
      concluir,
      dominarAte,
      registrarDesafio,
      ganharDesafio,
      reiniciar,
      alternarModoDeErro,
    ],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useProgresso(): Progresso {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useProgresso deve ser usado dentro de ProgressoProvider');
  return valor;
}

export function textoDeDias(n: number): string {
  return `${n} ${n === 1 ? 'dia' : 'dias'}`;
}
