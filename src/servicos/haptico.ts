import * as Haptics from 'expo-haptics';

// Vibrações do FAROL (ver docs/08-design-sensorial.md). Todas podem ser desligadas.
let ativo = true;

export function definirHapticos(valor: boolean) {
  ativo = valor;
}

function executar(acao: () => Promise<void>) {
  if (!ativo) return;
  acao().catch(() => {
    // Aparelhos sem suporte a vibração simplesmente ignoram.
  });
}

export const haptico = {
  selecao: () => executar(() => Haptics.selectionAsync()),
  leve: () => executar(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medio: () => executar(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  forte: () => executar(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  sucesso: () => executar(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  aviso: () => executar(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  // Três pulsos, como a luz de um farol varrendo o mar.
  pulsosDoFarol: () => {
    haptico.medio();
    setTimeout(() => haptico.medio(), 180);
    setTimeout(() => haptico.forte(), 380);
  },
};
