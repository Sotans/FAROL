import { Pressable, StyleSheet, Text } from 'react-native';

import { haptico } from '@/servicos/haptico';
import { tocar } from '@/servicos/som';
import { alvoMinimo, cor, fonte, raio, tamanho } from '@/tema/tokens';

export type VarianteBotao = 'primario' | 'secundario' | 'terciario' | 'acerto' | 'atencao';

type Props = {
  rotulo: string;
  sub?: string;
  onPress?: () => void;
  variante?: VarianteBotao;
  desabilitado?: boolean;
};

const paleta = {
  primario: { fundo: cor.luz, texto: cor.textoSobreLuz, relevo: '#B88E2F', borda: 'transparent' },
  secundario: { fundo: 'transparent', texto: cor.luz, relevo: '#8A6A1F', borda: cor.luz },
  terciario: { fundo: 'transparent', texto: cor.textoSuave, relevo: 'transparent', borda: 'transparent' },
  acerto: { fundo: cor.acerto, texto: '#0B2A18', relevo: '#1F8F62', borda: 'transparent' },
  atencao: { fundo: cor.atencao, texto: '#3B2330', relevo: '#B9615A', borda: 'transparent' },
  desabilitado: { fundo: cor.linha, texto: cor.textoSuave, relevo: '#1C2B44', borda: 'transparent' },
} as const;

export function Botao({ rotulo, sub, onPress, variante = 'primario', desabilitado = false }: Props) {
  const p = paleta[desabilitado ? 'desabilitado' : variante];
  const temRelevo = variante !== 'terciario';

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
          borderBottomWidth: temRelevo ? (pressed ? 1 : 4) : 0,
          borderBottomColor: p.relevo,
          marginTop: temRelevo && pressed ? 3 : 0,
        },
      ]}>
      <Text style={[estilos.rotulo, { color: p.texto }]}>
        {rotulo}
        {sub ? <Text style={estilos.sub}>{`  ${sub}`}</Text> : null}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: alvoMinimo + 4,
    borderRadius: raio.lg,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotulo: {
    fontFamily: fonte.textoSemi,
    fontSize: tamanho.sm,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  sub: {
    fontFamily: fonte.textoSemi,
    opacity: 0.8,
  },
});
