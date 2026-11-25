import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import type { CarreiraId } from '@/carreiras/dados';
import type { TomDePele } from '@/componentes/Personagem';
import type { Mapa } from '@/diagnostico/dados';
import { moduloPorId, trilhaDePortugues } from '@/conteudo/trilha';
import type { Modulo } from '@/conteudo/tipos';
import type { ModoDeErro } from '@/licao/tipos';
import { registrar, type Nota, type Revisoes } from '@/revisao/agenda';
import { carregarEstado, salvarEstado } from '@/servicos/armazenamento';
import {
  avisarFalhaDaNuvem,
  baixarProgresso,
  contaAtual,
  enviarProgresso,
  nuvemConfigurada,
  sairDaConta,
  type Conta,
} from '@/servicos/nuvem';
import { hoje, virarDia } from './dia';
import { mesclar } from './mesclar';
import { migrarProgresso, moduloLiberado, progressoDe, totalDeNos, type ProgressoDosModulos } from './modulos';
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
  /** O módulo em que a pessoa está estudando (id). */
  moduloAtual: string;
  /** Progresso de cada módulo da trilha: nós concluídos e partes dominadas. */
  modulos: ProgressoDosModulos;
  licoesHoje: number;
  desafiosHoje: number;
  /** Dicas usadas hoje (limite diário em limites.dicasPorDia; o vídeo recompensado devolve dicas). */
  dicasHoje: number;
  /** Dia (AAAA-MM-DD) a que os contadores "hoje" se referem. */
  dia: string;
  ultimoDiaDeEstudo: string | null;
  sequencia: number;
  xp: number;
  /** Acertos seguidos: uma sequência só, que atravessa questões, lições e desafios. Só zera ao errar. */
  acertosSeguidos: number;
  /** Revisão espaçada: o cartão de memória de cada questão já respondida (docs/10, seção 7). */
  revisoes: Revisoes;
  /** Toques em carreiras "em breve": mede a demanda antes de produzir conteúdo. */
  toquesEmBreve: Partial<Record<CarreiraId, number>>;
  /** Momento da última mudança feita pela pessoa (ISO). Decide qual versão é a mais recente ao combinar com a nuvem. */
  atualizadoEm: string | null;
};

/**
 * desligada: sem .env.local. conectando: ao abrir. conectada: em dia com a nuvem. offline: falhou; tenta na próxima abertura.
 * desatualizada: a conta tem progresso gravado por um app mais novo; este app não envia nada até ser atualizado.
 */
export type StatusDaNuvem = 'desligada' | 'conectando' | 'conectada' | 'offline' | 'desatualizada';

type Progresso = Estado & {
  /** O módulo em uso e o progresso nele (calculados a partir de `moduloAtual` e `modulos`). */
  modulo: Modulo;
  /** Nós concluídos no módulo em uso. O índice `concluidas` é o nó atual. */
  concluidas: number;
  dominadas: number[];
  totalDePartes: number;
  /** O farol é o nó logo depois da última parte. */
  indiceDoFarol: number;
  /** Partes mais o farol. `concluidas === totalDeNos` quer dizer farol aceso. */
  totalDeNos: number;
  /** Troca o módulo em uso, se estiver liberado. */
  escolherModulo: (id: string) => void;
  /** false até o estado salvo ser lido do aparelho. */
  carregado: boolean;
  nuvem: StatusDaNuvem;
  /** A conta deste aparelho na nuvem (anônima ou com e-mail); null sem nuvem. */
  conta: Conta | null;
  /** Depois de entrar numa conta existente: combina o progresso deste aparelho com o da conta. */
  aposEntrarNaConta: () => Promise<void>;
  /** Depois de salvar o progresso com um e-mail: atualiza a conta exibida. */
  aposSalvarAConta: () => Promise<void>;
  /** Sai da conta: o progresso fica guardado nela, e o aparelho recomeça com uma conta anônima nova. */
  sairDaConta: () => Promise<void>;
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
  /** Conclui uma revisão rápida: conta como lição do dia (meta e sequência), mas não avança a trilha. */
  concluirRevisao: (xp: number) => void;
  /** Registra as notas de uma sessão nos cartões de memória. */
  registrarRevisoes: (notas: Record<string, Nota>) => void;
  /** Resultado do desafio: as partes de `concluidas` até `ate - 1` ficam dominadas e `ate` vira o nó atual. */
  dominarAte: (ate: number) => void;
  registrarDesafio: () => void;
  /** Anúncio recompensado (SIMULADO): concede mais um desafio hoje. */
  ganharDesafio: () => void;
  /** Gasta uma dica do dia. */
  registrarDica: () => void;
  /** Anúncio recompensado (SIMULADO): devolve as dicas do dia. */
  ganharDicas: () => void;
  /** Aplica a virada do dia, se ela já aconteceu (por exemplo, com o app aberto desde ontem). */
  atualizarDia: () => void;
  reiniciar: () => void;
  alternarModoDeErro: () => void;
};

export { hoje, virarDia };

export const estadoInicial: Estado = {
  onboardingConcluido: false,
  carreira: null,
  tomDoGuia: 'medio',
  metaDiaria: 1,
  mapa: null,
  moduloAtual: trilhaDePortugues[0].id,
  modulos: {},
  licoesHoje: 0,
  desafiosHoje: 0,
  dicasHoje: 0,
  dia: hoje(),
  ultimoDiaDeEstudo: null,
  sequencia: 0,
  xp: 0,
  acertosSeguidos: 0,
  revisoes: {},
  toquesEmBreve: {},
  atualizadoEm: null,
};

type DaNuvem = { remoto: Partial<Estado> | null; bloqueado: boolean; contaDaNuvem: Conta | null };

/** Busca na nuvem o progresso e a conta deste aparelho, sem mexer no estado. */
async function baixarDaNuvem(): Promise<DaNuvem> {
  const { estado: remoto, bloqueado } = await baixarProgresso<Partial<Estado>>();
  return { remoto, bloqueado, contaDaNuvem: await contaAtual() };
}

/** Uma sessão concluída hoje: conta para a meta, a sequência de dias e o XP. */
function estudouHoje(e: Estado, xp: number): Estado {
  return {
    ...e,
    licoesHoje: e.licoesHoje + 1,
    sequencia: e.licoesHoje === 0 ? e.sequencia + 1 : e.sequencia,
    ultimoDiaDeEstudo: e.dia,
    xp: e.xp + xp,
  };
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

  const [nuvem, setNuvem] = useState<StatusDaNuvem>(nuvemConfigurada ? 'conectando' : 'desligada');
  // Só envia à nuvem depois de combinar com o que já está lá, para um aparelho novo não apagar o progresso.
  const combinouComANuvem = useRef(false);

  /** Toda mudança feita pela pessoa passa por aqui e recebe o carimbo de tempo. */
  const alterar = useCallback((mudanca: (e: Estado) => Estado) => {
    const agora = new Date().toISOString();
    setEstado((e) => {
      const nova = mudanca(e);
      return nova === e ? e : { ...nova, atualizadoEm: agora };
    });
  }, []);

  // Lê o estado salvo no aparelho uma vez, na abertura.
  useEffect(() => {
    let ativo = true;
    carregarEstado(estadoInicial).then((salvo) => {
      if (!ativo) return;
      setEstado(virarDia(migrarProgresso(salvo, estadoInicial.moduloAtual) as Estado));
      setCarregado(true);
    });
    return () => {
      ativo = false;
    };
  }, []);

  // Grava no aparelho depois de meio segundo sem mudanças (cada resposta muda o estado; o estado
  // inteiro, com os cartões de revisão, não precisa ser regravado a cada toque).
  const estadoAtual = useRef(estado);
  const gravacaoPendente = useRef(false);
  useEffect(() => {
    estadoAtual.current = estado;
    if (!carregado) return;
    gravacaoPendente.current = true;
    const espera = setTimeout(() => {
      gravacaoPendente.current = false;
      salvarEstado(estado);
    }, 500);
    return () => clearTimeout(espera);
  }, [estado, carregado]);

  // Ao sair para o segundo plano, grava o que estiver pendente (o sistema pode fechar o app).
  // Ao voltar, aplica a virada do dia: o app pode ter ficado aberto desde ontem.
  useEffect(() => {
    if (!carregado) return;
    const assinatura = AppState.addEventListener('change', (situacao) => {
      if (situacao === 'active') {
        setEstado((e) => virarDia(e));
      } else if (gravacaoPendente.current) {
        gravacaoPendente.current = false;
        salvarEstado(estadoAtual.current);
      }
    });
    return () => assinatura.remove();
  }, [carregado]);

  const [conta, setConta] = useState<Conta | null>(null);

  /** Aplica o que veio da nuvem: combina sem perder avanço e só então libera os envios. */
  const aplicarDaNuvem = useCallback(({ remoto, bloqueado, contaDaNuvem }: DaNuvem) => {
    setConta(contaDaNuvem);
    if (bloqueado) {
      // Progresso de um app mais novo: não combina nem envia, para não apagar o que está lá.
      combinouComANuvem.current = false;
      setNuvem('desatualizada');
      return;
    }
    if (remoto)
      setEstado((e) =>
        virarDia(mesclar(e, migrarProgresso({ ...estadoInicial, ...remoto }, estadoInicial.moduloAtual) as Estado)),
      );
    combinouComANuvem.current = true;
    setNuvem('conectada');
  }, []);

  const falhouANuvem = useCallback((erro: unknown) => {
    avisarFalhaDaNuvem('baixar o progresso', erro);
    setNuvem('offline');
  }, []);

  /** Baixa o progresso da conta atual e combina com o do aparelho. */
  const combinarComANuvem = useCallback(async () => {
    if (!nuvemConfigurada) return;
    combinouComANuvem.current = false;
    await baixarDaNuvem().then(aplicarDaNuvem, falhouANuvem);
  }, [aplicarDaNuvem, falhouANuvem]);

  // Na abertura, depois de ler o aparelho.
  useEffect(() => {
    if (!carregado || !nuvemConfigurada) return;
    let ativo = true;
    baixarDaNuvem().then(
      (r) => ativo && aplicarDaNuvem(r),
      (erro) => ativo && falhouANuvem(erro),
    );
    return () => {
      ativo = false;
    };
  }, [carregado, aplicarDaNuvem, falhouANuvem]);

  const aposEntrarNaConta = useCallback(async () => {
    setNuvem('conectando');
    await combinarComANuvem();
  }, [combinarComANuvem]);

  const aposSalvarAConta = useCallback(async () => setConta(await contaAtual()), []);

  const sair = useCallback(async () => {
    combinouComANuvem.current = false;
    await sairDaConta();
    setEstado({ ...estadoInicial, dia: hoje() });
    setConta(null);
    setNuvem('conectando');
    await combinarComANuvem();
  }, [combinarComANuvem]);

  // Depois de cada mudança, espera 3 segundos de calma e envia uma cópia à nuvem.
  useEffect(() => {
    if (!carregado || !combinouComANuvem.current) return;
    const espera = setTimeout(() => {
      // A conta pode ter mudado durante a espera (entrar ou sair): só envia se já combinou com a nova.
      if (!combinouComANuvem.current) return;
      enviarProgresso(estado)
        .then(() => setNuvem('conectada'))
        .catch((erro) => {
          avisarFalhaDaNuvem('enviar o progresso', erro);
          setNuvem('offline');
        });
    }, 3000);
    return () => clearTimeout(espera);
  }, [estado, carregado]);

  const definirCarreira = useCallback((id: CarreiraId) => alterar((e) => ({ ...e, carreira: id })), [alterar]);
  const definirTomDoGuia = useCallback((tom: TomDePele) => alterar((e) => ({ ...e, tomDoGuia: tom })), [alterar]);
  const definirMetaDiaria = useCallback((meta: MetaDiaria) => alterar((e) => ({ ...e, metaDiaria: meta })), [alterar]);
  const concluirOnboarding = useCallback(() => alterar((e) => ({ ...e, onboardingConcluido: true })), [alterar]);
  const definirMapa = useCallback((mapa: Mapa) => alterar((e) => ({ ...e, mapa })), [alterar]);

  const registrarToqueEmBreve = useCallback(
    (id: CarreiraId) =>
      alterar((e) => ({ ...e, toquesEmBreve: { ...e.toquesEmBreve, [id]: (e.toquesEmBreve[id] ?? 0) + 1 } })),
    [alterar],
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
    alterar((e) => ({ ...e, acertosSeguidos: seguidos }));
    if (seguidos % 5 === 0) celebrar(seguidos);
  }, [alterar, celebrar]);

  // Ao perder, nada é comunicado: o ciclo só recomeça.
  const quebrarSequenciaDeAcertos = useCallback(() => {
    seguidosAtual.current = 0;
    alterar((e) => (e.acertosSeguidos === 0 ? e : { ...e, acertosSeguidos: 0 }));
  }, [alterar]);

  const concluir = useCallback(
    (xp: number) => {
      alterar((e) => {
        const atual = estudouHoje(virarDia(e), xp);
        const id = atual.moduloAtual;
        const p = progressoDe(atual.modulos, id);
        const concluidas = Math.min(p.concluidas + 1, totalDeNos(moduloPorId(id)));
        return { ...atual, modulos: { ...atual.modulos, [id]: { ...p, concluidas } } };
      });
    },
    [alterar],
  );

  const escolherModulo = useCallback(
    (id: string) =>
      alterar((e) => {
        const indice = trilhaDePortugues.findIndex((m) => m.id === id);
        if (indice < 0 || e.moduloAtual === id || !moduloLiberado(trilhaDePortugues, e.modulos, indice)) return e;
        return { ...e, moduloAtual: id };
      }),
    [alterar],
  );

  const concluirRevisao = useCallback((xp: number) => alterar((e) => estudouHoje(virarDia(e), xp)), [alterar]);

  const registrarRevisoes = useCallback(
    (notas: Record<string, Nota>) => alterar((e) => ({ ...e, revisoes: registrar(e.revisoes, notas, new Date()) })),
    [alterar],
  );

  const dominarAte = useCallback(
    (ate: number) => {
      alterar((e) => {
        const id = e.moduloAtual;
        const p = progressoDe(e.modulos, id);
        const novas: number[] = [];
        for (let i = p.concluidas; i < ate; i += 1) novas.push(i);
        const concluidas = Math.min(Math.max(ate, p.concluidas), moduloPorId(id).partes.length);
        return {
          ...e,
          modulos: { ...e.modulos, [id]: { concluidas, dominadas: [...p.dominadas, ...novas] } },
          xp: e.xp + limites.xpDoDesafio,
        };
      });
    },
    [alterar],
  );

  const registrarDesafio = useCallback(() => {
    alterar((e) => {
      const atual = virarDia(e);
      return { ...atual, desafiosHoje: atual.desafiosHoje + 1 };
    });
  }, [alterar]);

  const ganharDesafio = useCallback(
    () => alterar((e) => ({ ...e, desafiosHoje: Math.max(0, e.desafiosHoje - 1) })),
    [alterar],
  );

  const registrarDica = useCallback(
    () =>
      alterar((e) => {
        const atual = virarDia(e);
        return { ...atual, dicasHoje: atual.dicasHoje + 1 };
      }),
    [alterar],
  );

  const ganharDicas = useCallback(
    () => alterar((e) => ({ ...e, dicasHoje: Math.max(0, e.dicasHoje - limites.dicasPorDia) })),
    [alterar],
  );

  // Não é uma mudança feita pela pessoa: não recebe carimbo de tempo.
  const atualizarDia = useCallback(() => setEstado((e) => virarDia(e)), []);

  const reiniciar = useCallback(() => alterar(() => ({ ...estadoInicial, dia: hoje() })), [alterar]);

  const alternarModoDeErro = useCallback(
    () => setModoDeErro((m) => (m === 'tentar-de-novo' ? 'pular-para-o-fim' : 'tentar-de-novo')),
    [],
  );

  const modulo = moduloPorId(estado.moduloAtual);
  const progressoAtual = progressoDe(estado.modulos, modulo.id);

  const valor = useMemo(
    () => ({
      ...estado,
      modulo,
      concluidas: progressoAtual.concluidas,
      dominadas: progressoAtual.dominadas,
      totalDePartes: modulo.partes.length,
      indiceDoFarol: modulo.partes.length,
      totalDeNos: totalDeNos(modulo),
      escolherModulo,
      carregado,
      nuvem,
      conta,
      aposEntrarNaConta,
      aposSalvarAConta,
      sairDaConta: sair,
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
      concluirRevisao,
      registrarRevisoes,
      dominarAte,
      registrarDesafio,
      ganharDesafio,
      registrarDica,
      ganharDicas,
      atualizarDia,
      reiniciar,
      alternarModoDeErro,
    }),
    [
      estado,
      modulo,
      progressoAtual,
      escolherModulo,
      carregado,
      nuvem,
      conta,
      aposEntrarNaConta,
      aposSalvarAConta,
      sair,
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
      concluirRevisao,
      registrarRevisoes,
      dominarAte,
      registrarDesafio,
      ganharDesafio,
      registrarDica,
      ganharDicas,
      atualizarDia,
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
