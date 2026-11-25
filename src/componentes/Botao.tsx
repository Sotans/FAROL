import { Pressable, StyleSheet, Text } from 'react-native';

import { haptico } from '@/servicos/haptico';
import { tocar } from '@/servicos/som';
import { alvoMinimo, brilho, cor, fonte, raio, tamanho } from '@/tema/tokens';

export type VarianteBotao = 'primario' | 'secundario' | 'terciario';

type Props = {
  rotulo: string;
  sub?: string;
  onPress?: () => void;
  variante?: VarianteBotao;
  desabilitado?: boolean;
};

/**
 * Botão do FAROL. O primário é a luz do próximo passo: em vez de uma sola que afunda,
 * ele tem um halo âmbar que se acende ao toque. Rótulos em caixa normal ("Continuar").
 */
const paleta = {
  primario: { fundo: cor.luz, texto: cor.textoSobreLuz, borda: 'transparent' },
  secundario: { fundo: 'transparent', texto: cor.luz, borda: cor.luz },
  terciario: { fundo: 'transparent', texto: cor.textoSuave, borda: 'transparent' },
  desabilitado: { fundo: cor.linha, texto: cor.textoSuave, borda: 'transparent' },
} as const;

export function Botao({ rotulo, sub, onPress, variante = 'primario', desabilitado = false }: Props) {
  const p = paleta[desabilitado ? 'desabilitado' : variante];
  const acende = variante === 'primario' && !desabilitado;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={sub ? `${rotulo} ${sub}` : rotulo}
      accessibilityState={{ disabled: desabilitado }}
      disabled={desabilitado}
      onPress={() => {
        haptico.selecao();
        tocar('toque');
        onPress?.();
      }}
      style={({ pressed }) => [
        estilos.base,
        {
          backgroundColor: p.fundo,
          borderColor: p.borda,
          borderWidth: variante === 'secundario' && !desabilitado ? 2 : 0,
        },
        // Halo da luz: um anel fino e um brilho difuso. Ao toque, os dois crescem.
        acende ? { boxShadow: pressed ? brilho.botaoTocado : brilho.botao } : null,
        pressed && variante !== 'terciario' ? { transform: [{ scale: 0.98 }] } : null,
      ]}>
      <Text style={[estilos.rotulo, variante === 'terciario' ? estilos.rotuloTerciario : null, { color: p.texto }]}>
        {rotulo}
        {sub ? <Text style={estilos.sub}>{`  ${sub}`}</Text> : null}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: alvoMinimo + 6,
    borderRadius: raio.lg,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotulo: {
    fontFamily: fonte.botao,
    fontSize: tamanho.md,
    textAlign: 'center',
  },
  rotuloTerciario: { fontFamily: fonte.textoSemi, fontSize: tamanho.sm },
  sub: {
    fontFamily: fonte.textoSemi,
    opacity: 0.7,
  },
});
