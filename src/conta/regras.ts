/**
 * Regras da conta (submeta 2.6): login por código enviado por e-mail, sem senha.
 * Sem senha, não há senha para esquecer: a "recuperação de senha" é o próprio login por código.
 */

/** Validação simples, só para evitar enviar código a um endereço claramente digitado errado. */
export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** O código vem por e-mail com 6 dígitos (o Supabase permite configurar até 10). Ignora espaços e traços colados. */
export function normalizarCodigo(codigo: string): string {
  return codigo.replace(/\D/g, '');
}

export function codigoCompleto(codigo: string): boolean {
  const n = normalizarCodigo(codigo).length;
  return n >= 6 && n <= 10;
}

/** O que a tela deve sugerir depois de um erro. */
export type Saida = 'tentarDeNovo' | 'entrarNaConta' | 'criarConta' | 'aguardar' | 'pedirNovoCodigo';

/** Traduz o erro da autenticação para uma frase acolhedora, sem culpa, e indica a saída. */
export function explicarErro(erro: unknown): { mensagem: string; saida: Saida } {
  const codigo = (erro as { code?: string } | null)?.code ?? '';
  const status = (erro as { status?: number } | null)?.status;
  switch (codigo) {
    case 'email_exists':
    case 'user_already_exists':
    case 'identity_already_exists':
      return {
        mensagem: 'Esse e-mail já tem uma conta no FAROL. Quer entrar nela? Seu progresso daqui vai junto.',
        saida: 'entrarNaConta',
      };
    case 'user_not_found':
    case 'otp_disabled':
    case 'signup_disabled':
      return {
        mensagem: 'Não encontramos uma conta com esse e-mail. Você pode salvar seu progresso com ele.',
        saida: 'criarConta',
      };
    case 'otp_expired':
      return {
        mensagem: 'Esse código já expirou ou não confere. Peça um novo, é rapidinho.',
        saida: 'pedirNovoCodigo',
      };
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return { mensagem: 'Muitos pedidos seguidos. Espere um pouco e tente de novo.', saida: 'aguardar' };
    case 'email_address_not_authorized':
      return {
        mensagem: 'O envio de e-mails ainda está em modo de teste e só chega à equipe do projeto.',
        saida: 'aguardar',
      };
    case 'anonymous_provider_disabled':
    case 'email_provider_disabled':
      return { mensagem: 'O login está desativado no momento. Tente mais tarde.', saida: 'aguardar' };
  }
  if (status === 429)
    return { mensagem: 'Muitos pedidos seguidos. Espere um pouco e tente de novo.', saida: 'aguardar' };
  if (erro instanceof TypeError || /network|fetch/i.test(String((erro as Error)?.message ?? '')))
    return { mensagem: 'Sem conexão agora. Confira a internet e tente de novo.', saida: 'tentarDeNovo' };
  return { mensagem: 'Algo não deu certo. Tente de novo em instantes.', saida: 'tentarDeNovo' };
}

/**
 * O convite de cadastro depois de cada lição (decisão de 2026-11-21): nunca obrigatório,
 * mas repetido até a pessoa se cadastrar. O texto fala do que ela tem a perder, e muda
 * com o tempo para não cansar: primeiro a conquista, depois a sequência, depois as lições.
 */
export function motivoParaCadastrar(p: { primeiraLicao: boolean; sequencia: number; concluidas: number }): string {
  if (p.primeiraLicao) return 'Sua primeira conquista está só neste aparelho. Com o cadastro, ela fica guardada.';
  if (p.sequencia >= 2)
    return `Sua sequência de ${p.sequencia} dias está só neste aparelho. Com o cadastro, ela fica guardada na sua conta.`;
  if (p.concluidas >= 2)
    return `Suas ${p.concluidas} lições estão só neste aparelho. Com o cadastro, você não perde nada se trocar de celular.`;
  return 'Seu progresso está só neste aparelho. Com o cadastro, você não perde nada se trocar de celular.';
}
