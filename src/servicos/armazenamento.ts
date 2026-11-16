import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Guarda o progresso no aparelho, para a pessoa não perder sequência nem trilha ao fechar o app.
 * É o primeiro passo do "offline" do escopo (docs/06): o backend (Meta 2) sincroniza depois.
 */
const CHAVE = 'farol.progresso.v1';

export async function carregarEstado<T extends object>(padrao: T): Promise<T> {
  try {
    const texto = await AsyncStorage.getItem(CHAVE);
    if (!texto) return padrao;
    const salvo = JSON.parse(texto) as Partial<T>;
    // Campos novos recebem o valor padrão; campos salvos prevalecem.
    return { ...padrao, ...salvo };
  } catch {
    return padrao;
  }
}

export async function salvarEstado<T extends object>(estado: T): Promise<void> {
  try {
    await AsyncStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    // Sem espaço ou sem suporte: o app segue funcionando só em memória.
  }
}
