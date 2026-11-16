import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

/**
 * Sons do FAROL (ver docs/08-design-sensorial.md, seção 4).
 * PROVISÓRIOS: gerados por síntese (sinos curtos, escala única). O kit final é a submeta 1.11.
 * Volume baixo por padrão, desligáveis, e respeitam o modo silencioso do aparelho.
 */

const fontes = {
  toque: require('../../assets/sons/toque.wav'),
  'acerto-1': require('../../assets/sons/acerto-1.wav'),
  'acerto-2': require('../../assets/sons/acerto-2.wav'),
  'acerto-3': require('../../assets/sons/acerto-3.wav'),
  'acerto-4': require('../../assets/sons/acerto-4.wav'),
  'acerto-5': require('../../assets/sons/acerto-5.wav'),
  erro: require('../../assets/sons/erro.wav'),
  'luz-apagada': require('../../assets/sons/luz-apagada.wav'),
  licao: require('../../assets/sons/licao.wav'),
  meta: require('../../assets/sons/meta.wav'),
  popup: require('../../assets/sons/popup.wav'),
  farol: require('../../assets/sons/farol.wav'),
} as const;

export type NomeDoSom = keyof typeof fontes;

const VOLUME = 0.35;
let ativo = true;
let modoConfigurado = false;
const players = new Map<NomeDoSom, AudioPlayer>();

function avisar(contexto: string, erro: unknown) {
  // Só em desenvolvimento: aparece no terminal do Metro, para diagnosticar no aparelho.
  if (__DEV__) console.warn(`[som] ${contexto}:`, erro instanceof Error ? erro.message : erro);
}

async function configurarModo() {
  if (modoConfigurado) return;
  modoConfigurado = true;
  try {
    // playsInSilentMode: false = respeita a chave de silêncio do iPhone (decisão de design).
    await setAudioModeAsync({ playsInSilentMode: false });
  } catch (erro) {
    avisar('configurar modo de áudio', erro);
  }
}

function obter(nome: NomeDoSom): AudioPlayer | null {
  try {
    let p = players.get(nome);
    if (!p) {
      p = createAudioPlayer(fontes[nome]);
      p.volume = VOLUME;
      players.set(nome, p);
    }
    return p;
  } catch (erro) {
    avisar(`criar ${nome}`, erro);
    return null;
  }
}

export function definirSons(valor: boolean) {
  ativo = valor;
}

export function tocar(nome: NomeDoSom) {
  if (!ativo) return;
  void configurarModo();
  const p = obter(nome);
  if (!p) return;
  // Voltar ao início só se já carregou; em todo caso, tocar. Cada passo falha sozinho.
  try {
    if (p.isLoaded && p.currentTime > 0) p.seekTo(0);
  } catch (erro) {
    avisar(`rebobinar ${nome}`, erro);
  }
  try {
    p.play();
  } catch (erro) {
    avisar(`tocar ${nome}`, erro);
  }
}

/** Acertos em sequência: a nota sobe a cada acerto (1 a 5). */
export function tocarAcerto(seguidos: number) {
  const n = Math.min(5, Math.max(1, seguidos)) as 1 | 2 | 3 | 4 | 5;
  tocar(`acerto-${n}`);
}

/** Pré-carrega os sons curtos para a resposta ser imediata. Chamar depois da montagem do app. */
export function prepararSons() {
  void configurarModo();
  (Object.keys(fontes) as NomeDoSom[]).forEach((nome) => obter(nome));
}

/** Estado de um som, para o botão de diagnóstico do protótipo. */
export function diagnosticoDoSom(nome: NomeDoSom): string {
  const p = obter(nome);
  if (!p) return `${nome}: não foi possível criar o player (veja o terminal do Metro).`;
  try {
    return `${nome}: carregado=${p.isLoaded ? 'sim' : 'não'}, tocando=${p.playing ? 'sim' : 'não'}, duração=${
      Number.isFinite(p.duration) ? p.duration.toFixed(2) : '?'
    }s, volume=${p.volume}, mudo=${p.muted ? 'sim' : 'não'}`;
  } catch (erro) {
    return `${nome}: erro ao ler o estado (${erro instanceof Error ? erro.message : String(erro)})`;
  }
}
