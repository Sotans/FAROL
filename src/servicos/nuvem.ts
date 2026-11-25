import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { decidirVersao, migrarVersao, VERSAO_DO_PROGRESSO } from '@/estado/versao';

/**
 * A nuvem do FAROL (Supabase; submetas 2.5 e 3.5).
 * O aparelho continua sendo a fonte principal: o app funciona igual sem nuvem e sem internet.
 * Sem o arquivo .env.local (como no GitHub Actions), a nuvem fica desligada e nada é enviado.
 *
 * Conta anônima: ao abrir o app, a pessoa ganha uma conta sem preencher nada (valor antes de
 * pedir cadastro). O cadastro com e-mail (2.6) vai transformar essa conta em permanente.
 */

/** Só a base do endereço (https://<id>.supabase.co): o cliente acrescenta sozinho caminhos como /rest/v1. */
function baseDoEndereco(endereco: string | undefined): string | undefined {
  if (!endereco) return undefined;
  try {
    return new URL(endereco.trim()).origin;
  } catch {
    return undefined;
  }
}

const url = baseDoEndereco(process.env.EXPO_PUBLIC_SUPABASE_URL);
const chave = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const cliente: SupabaseClient | null =
  url && chave
    ? createClient(url, chave, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          // No celular não há endereço de página de onde ler a sessão.
          detectSessionInUrl: false,
        },
      })
    : null;

export const nuvemConfigurada = cliente !== null;

// Renova a sessão só com o app em primeiro plano, como recomenda o Supabase.
if (cliente && Platform.OS !== 'web') {
  AppState.addEventListener('change', (estado) => {
    if (estado === 'active') cliente.auth.startAutoRefresh();
    else cliente.auth.stopAutoRefresh();
  });
}

function exigirCliente(): SupabaseClient {
  if (!cliente) throw new Error('Nuvem não configurada: crie o arquivo .env.local (ver .env.example).');
  return cliente;
}

/** Garante uma sessão: reaproveita a salva no aparelho ou cria uma conta anônima. Devolve o id. */
async function garantirSessao(): Promise<string> {
  const c = exigirCliente();
  const { data } = await c.auth.getSession();
  if (data.session) return data.session.user.id;
  const { data: nova, error } = await c.auth.signInAnonymously();
  if (error || !nova.user) throw error ?? new Error('Não foi possível criar a conta anônima.');
  return nova.user.id;
}

/**
 * O progresso guardado na nuvem. `estado` é null se ainda não houver.
 * `bloqueado` é true quando a nuvem tem um formato mais novo que este app: nesse caso o app
 * não pode enviar nada, para não sobrescrever o progresso gravado por um app mais novo.
 */
export async function baixarProgresso<T>(): Promise<{ estado: T | null; bloqueado: boolean }> {
  const id = await garantirSessao();
  const { data, error } = await exigirCliente()
    .from('progresso')
    .select('estado, versao')
    .eq('user_id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { estado: null, bloqueado: false };
  const decisao = decidirVersao(data.versao);
  if (decisao === 'bloquear') return { estado: null, bloqueado: true };
  const estado = decisao === 'migrar' ? migrarVersao(data.estado, data.versao) : data.estado;
  return { estado: estado as T, bloqueado: false };
}

/** Grava o progresso na nuvem (substitui a versão anterior). */
export async function enviarProgresso(estado: object): Promise<void> {
  const id = await garantirSessao();
  const { error } = await exigirCliente().from('progresso').upsert({
    user_id: id,
    estado,
    versao: VERSAO_DO_PROGRESSO,
    atualizado_em: new Date().toISOString(),
  });
  if (error) throw error;
}

/** Só em desenvolvimento: mostra no terminal do Metro por que a nuvem falhou. */
export function avisarFalhaDaNuvem(contexto: string, erro: unknown) {
  if (__DEV__) console.warn(`[nuvem] ${contexto}:`, erro instanceof Error ? erro.message : erro);
}

// ---------- Conta (submeta 2.6): login por código enviado por e-mail, sem senha ----------

export type Conta = { id: string; anonima: boolean; email: string | null };

/** A conta deste aparelho, ou null sem nuvem ou sem sessão. */
export async function contaAtual(): Promise<Conta | null> {
  if (!cliente) return null;
  const { data } = await cliente.auth.getSession();
  const usuario = data.session?.user;
  if (!usuario) return null;
  return { id: usuario.id, anonima: usuario.is_anonymous ?? false, email: usuario.email ?? null };
}

/**
 * Salvar o progresso: liga um e-mail à conta anônima. O Supabase envia um código para o e-mail;
 * a conta só vira permanente depois de confirmar o código. O progresso continua o mesmo.
 */
export async function pedirCodigoParaSalvar(email: string): Promise<void> {
  await garantirSessao();
  const { error } = await exigirCliente().auth.updateUser({ email });
  if (error) throw error;
}

export async function confirmarCodigoParaSalvar(email: string, codigo: string): Promise<void> {
  const { error } = await exigirCliente().auth.verifyOtp({ email, token: codigo, type: 'email_change' });
  if (error) throw error;
}

/** Entrar numa conta que já existe (outro aparelho, reinstalação). Não cria conta nova. */
export async function pedirCodigoParaEntrar(email: string): Promise<void> {
  const { error } = await exigirCliente().auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
  if (error) throw error;
}

export async function confirmarCodigoParaEntrar(email: string, codigo: string): Promise<void> {
  const { error } = await exigirCliente().auth.verifyOtp({ email, token: codigo, type: 'email' });
  if (error) throw error;
}

/** Sai da conta neste aparelho. O progresso continua guardado na conta. */
export async function sairDaConta(): Promise<void> {
  const { error } = await exigirCliente().auth.signOut({ scope: 'local' });
  if (error) throw error;
}
